import { cleanUpDeadCharacters, getValidTargetIndices } from "./../battle/utils";
import { parseAction } from "./../battle/parseAbilityActions";
import { cloneDeep } from "lodash";
import { ACTION_TYPES, Effect } from "./../ability/types";
import { getRandomItem, shuffle } from "./../utils";
import { applyActionToTarget, Event } from "../battle/parseAbilityActions";
import { Ability, EFFECT_TYPES, TARGET_TYPES } from "../ability/types";
import { Combatant } from "../character/types";
import triggerDebuffDamage from "../battle/debuffDamage";

const getPossibleMoveIndices = ({ currentLocationIndex, enemies, movement = 0 }): number[] => {
    const min = Math.max(0, currentLocationIndex - movement);
    const max = Math.min(enemies.length - 1, currentLocationIndex + movement);
    const moveIndices = [];
    for (let i = min; i <= max; ++i) {
        if (!enemies[i]) {
            moveIndices.push(i);
        }
    }

    return moveIndices;
};

const isBusy = (enemy: Combatant): boolean => {
    return enemy?.effects?.some((effect) => effect.type === EFFECT_TYPES.STUN);
};

const getPopulatedEnemyIndices = (enemies) => {
    const indices = [];
    enemies.forEach((enemy, i) => {
        if (enemy && !isBusy(enemy)) {
            indices.push(i);
        }
    });
    return indices;
};

/**
 * 1) If a movement ability was picked, check that there are no obstructions blocking that movement.
 * Otherwise, pick a different ability.
 * 2) Check the resource cost of the ability.
 */
const canUseAbility = ({ enemy, ability, enemies }): boolean => {
    const movementAction = ability.actions.find((action) => action.movement);
    if (!movementAction) {
        return true;
    }
    const index = enemies.findIndex((e: Combatant) => e && e.id === enemy.id);
    if (
        getPossibleMoveIndices({
            currentLocationIndex: index,
            enemies,
            movement: movementAction.movement,
        }).length === 0
    ) {
        return false;
    }

    const resourceCost = ability.resourceCost || 0;
    return (enemy.resources || 0) >= resourceCost;
};

const useAbilityActions = ({ ability, enemies, allies, actorId }) => {
    const results = [];

    ability.actions.forEach((action) => {
        const { target, movement } = action;
        let selectedIndex;
        // Each subsequent action should be based on the most recently updated enemies/player states.
        const recentEnemies = cleanUpDeadCharacters(results[results.length - 1]?.updatedEnemies || enemies);
        const recentAllies = cleanUpDeadCharacters(results[results.length - 1]?.updatedAllies || allies);
        let selectedSide = "enemies" as "enemies" | "allies";

        if (movement) {
            selectedIndex = getRandomItem(
                getPossibleMoveIndices({
                    currentLocationIndex: recentEnemies.findIndex((enemy) => enemy?.id === actorId),
                    enemies: recentEnemies,
                    movement,
                })
            );
        } else if (target === TARGET_TYPES.FRIENDLY) {
            const validEnemyIndices = getValidTargetIndices(recentEnemies);
            selectedIndex = getRandomItem(validEnemyIndices);
        } else if (target === TARGET_TYPES.HOSTILE) {
            const validAllyIndices = getValidTargetIndices(recentAllies, { excludeStealth: true });
            selectedIndex = getRandomItem(validAllyIndices);
            selectedSide = "allies";
        }

        results.push(
            parseAction({
                actorId,
                enemies: recentEnemies,
                allies: recentAllies,
                selectedIndex,
                action,
                selectedSide,
            })
        );
    });

    return results;
};

const handleCastTick = ({ allies, enemies, actorId, casting }): Event[] => {
    const { castTime = 0, channelDuration = 0 } = casting;
    let updatedCasting = { ...casting };
    enemies = enemies.map((enemy) => {
        if (enemy?.id !== actorId) {
            return cloneDeep(enemy);
        }
        if (castTime > 0) {
            updatedCasting.castTime = castTime - 1;
        }

        if (!updatedCasting.castTime && channelDuration > 0) {
            updatedCasting.channelDuration = channelDuration - 1;
        }

        return {
            ...cloneDeep(enemy),
            casting: updatedCasting.channelDuration || updatedCasting.castTime ? updatedCasting : null,
        };
    });

    if (!updatedCasting || !updatedCasting.castTime) {
        return useAbilityActions({ allies, enemies, actorId, ability: updatedCasting });
    }

    // Return the enemy with the newly updated casting state as-is, don't use the ability
    return [
        {
            updatedAllies: allies,
            updatedEnemies: enemies,
        },
    ];
};

const useAbility = ({ caster, allies, enemies }): Event[] => {
    const { abilities, id } = caster;

    const ability: Ability = getRandomItem(abilities.filter((a) => canUseAbility({ enemy: caster, ability: a, enemies })));

    if (ability.castTime > 0 || ability.channelDuration > 0) {
        enemies = enemies.map((enemy) => {
            if (enemy?.id === id) {
                return {
                    ...cloneDeep(enemy),
                    casting: cloneDeep(ability),
                };
            }

            return enemy;
        });
    }

    if (!ability.castTime) {
        return useAbilityActions({ allies, enemies, actorId: id, ability });
    } else {
        // Return the enemy with the newly updated casting state as-is, don't use the ability
        return [
            {
                updatedAllies: allies,
                updatedEnemies: enemies,
            },
        ];
    }
};

const enemyMove = ({ actorId, allies, enemies }): Event[] => {
    const caster = enemies.find((e) => e && e.id === actorId);
    const { casting } = caster;
    if (casting) {
        return handleCastTick({ allies, enemies, actorId, casting });
    }

    return useAbility({ caster, allies, enemies });
};

const enemyTurn = ({ enemies, allies }): Event[] => {
    enemies = enemies.map((enemy) => {
        if (!enemy) {
            return enemy;
        }

        return {
            ...cloneDeep(enemy),
            resources: enemy.resources + 1,
        };
    });

    const randomizedIndices = shuffle(getPopulatedEnemyIndices(enemies)); // Randomize enemy move order

    const results = [];
    // Each subsequent move should be based on the most recently updated enemies/player states.
    const getRecentEnemies = () => results[results.length - 1]?.updatedEnemies || enemies;
    const getRecentAllies = () => results[results.length - 1]?.updatedAllies || allies;
    randomizedIndices.forEach((i) => {
        const enemy = getRecentEnemies()[i];
        if (!enemy || enemy.HP === 0) {
            return;
        }

        results.push(
            ...enemyMove({
                actorId: enemy.id,
                allies: getRecentAllies(),
                enemies: getRecentEnemies(),
            })
        );
    });

    const debuffsTriggered = triggerDebuffDamage(getRecentEnemies());

    if (debuffsTriggered.length) {
        results.push(
            ...debuffsTriggered.map(
                (characters) =>
                    ({
                        updatedEnemies: characters,
                        updatedAllies: getRecentAllies(),
                    } as Event)
            )
        );
    }

    return results;
};

export default enemyTurn;

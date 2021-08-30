import { cleanUpDeadCharacters } from "./../battle/utils";
import { parseAction } from "./../battle/parseAbilityActions";
import { cloneDeep } from "lodash";
import { ACTION_TYPES, Effect } from "./../ability/types";
import { getRandomItem, shuffle } from "./../utils";
import { applyActionToTarget, Event } from "../battle/parseAbilityActions";
import { Ability, EFFECT_TYPES, TARGET_TYPES } from "../ability/types";
import { Combatant } from "../character/types";

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

const useAbilityActions = ({ ability, enemies, allies, casterId }) => {
    const getValidTargetIndices = (characters: (Combatant | null)[]) => {
        const indices = [];
        characters.forEach((character: Combatant | null, i: number) => {
            if (character && character.HP > 0) {
                indices.push(i);
            }
        });
        return indices;
    };
    const results = [];

    ability.actions.forEach((action) => {
        const { target, movement } = action;
        let targetIndex;
        // Each subsequent action should be based on the most recently updated enemies/player states.
        const recentEnemies = cleanUpDeadCharacters(results[results.length - 1]?.updatedEnemies || enemies);
        const recentAllies = cleanUpDeadCharacters(results[results.length - 1]?.updatedAllies || allies);
        let side = "enemies";

        if (movement) {
            targetIndex = getRandomItem(
                getPossibleMoveIndices({
                    currentLocationIndex: recentEnemies.findIndex((enemy) => enemy?.id === casterId),
                    enemies: recentEnemies,
                    movement,
                })
            );
        } else if (target === TARGET_TYPES.FRIENDLY) {
            const validEnemyIndices = getValidTargetIndices(recentEnemies);
            targetIndex = getRandomItem(validEnemyIndices);
        } else if (target === TARGET_TYPES.HOSTILE) {
            const validAllyIndices = getValidTargetIndices(recentAllies);
            targetIndex = getRandomItem(validAllyIndices);
            side = "allies";
        }

        results.push(
            parseAction({
                casterId,
                enemies: recentEnemies,
                allies: recentAllies,
                targetIndex,
                action,
                side,
            })
        );
    });

    return results;
};

const handleCastTick = ({ allies, enemies, casterId, casting }): Event[] => {
    const { castTime = 0, channelDuration = 0 } = casting;
    let updatedCasting = { ...casting };
    enemies = enemies.map((enemy) => {
        if (enemy?.id !== casterId) {
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
        return useAbilityActions({ allies, enemies, casterId, ability: updatedCasting });
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
        return useAbilityActions({ allies, enemies, casterId: id, ability });
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

const enemyMove = ({ casterId, allies, enemies }): Event[] => {
    const caster = enemies.find((e) => e && e.id === casterId);
    const { casting } = caster;
    if (casting) {
        return handleCastTick({ allies, enemies, casterId, casting });
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
                casterId: enemy.id,
                allies: getRecentAllies(),
                enemies: getRecentEnemies(),
            })
        );
    });

    let totalBleedDamage = 0;
    const enemiesWithBleedsTriggered: Combatant[] = getRecentEnemies().map((enemy: Combatant, i: number) => {
        if (!enemy) {
            return enemy;
        }
        const bleedDamage: number = enemy.effects.reduce((acc: number, effect: Effect) => {
            if (effect.type === EFFECT_TYPES.BLEED) {
                acc += effect.damage || 1;
            }
            return acc;
        }, 0);

        totalBleedDamage += bleedDamage;
        return applyActionToTarget({
            target: enemy,
            action: {
                damage: bleedDamage,
                description: "Enemies took bleed damage.",
                type: ACTION_TYPES.NONE,
            },
        });
    });

    if (totalBleedDamage) {
        results.push({
            updatedEnemies: enemiesWithBleedsTriggered,
            updatedAllies: getRecentAllies(),
        } as Event);
    }

    return results;
};

export default enemyTurn;

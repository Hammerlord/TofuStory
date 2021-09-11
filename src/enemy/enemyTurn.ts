import { createCombatant } from "./createEnemy";
import { cloneDeep } from "lodash";
import { compose, partition } from "ramda";
import { Ability, EFFECT_TYPES, TARGET_TYPES } from "../ability/types";
import triggerDebuffDamage from "../battle/debuffDamage";
import { Event } from "../battle/parseAbilityActions";
import { Combatant } from "../character/types";
import { ACTION_TYPES } from "./../ability/types";
import { parseAction } from "./../battle/parseAbilityActions";
import {
    addEnemyResources,
    cleanUpDeadCharacters,
    clearTurnHistory,
    getEmptyIndices,
    getValidTargetIndices,
    halveArmor,
    tickDownBuffs,
    tickDownDebuffs,
    updateCharacters,
} from "./../battle/utils";
import { getRandomItem, shuffle } from "./../utils";
import { loaf } from "./abilities";

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
 * 3) Check if there is space for a minion.
 * 4) If the ability applies a buff that the actor already has, don't use it.
 * 5) If the ability only heals, do not use it at full health.
 */
const canUseAbility = ({ actor, ability, enemies }): boolean => {
    const resourceCost = ability.resourceCost || 0;
    if ((actor.resources || 0) < resourceCost) {
        return false;
    }

    if (ability.minion) {
        return enemies.some((combatant) => !combatant);
    }

    const abilityEffects = ability.actions.reduce((acc, { effects = [] }) => {
        return [...acc, ...effects];
    }, []);
    if (actor.effects.some(({ name }) => abilityEffects.some((effect) => effect.name === name))) {
        return false;
    }
    if (ability.actions.length === 1 && ability.actions[0].healing > 0) {
        return actor.HP < actor.maxHP;
    }

    const movementAction = ability.actions.find((action) => action.movement);
    if (movementAction) {
        const index = enemies.findIndex((e: Combatant) => e && e.id === actor.id);
        return (
            getPossibleMoveIndices({
                currentLocationIndex: index,
                enemies,
                movement: movementAction.movement,
            }).length > 0
        );
    }

    return true;
};

const useAbilityActions = ({ ability, enemies, allies, actorId }): Event[] => {
    const results = [];
    if (ability.minion) {
        const indices = getEmptyIndices(enemies);
        if (indices.length > 0) {
            const index = getRandomItem(indices);
            results.push({
                updatedAllies: allies,
                updatedEnemies: enemies.map((enemy, i) => {
                    if (i === index) {
                        return {
                            ...createCombatant(ability.minion),
                        };
                    }
                    return enemy;
                }),
            });
        }
    }

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
        } else if (target === TARGET_TYPES.SELF) {
            selectedIndex = recentEnemies.findIndex((enemy) => enemy?.id === actorId);
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
            resources: enemy.resources - casting.resourceCost,
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

const getSyntheticAttack = (actor) => {
    return {
        name: "Attack",
        actions: [
            {
                damage: actor.damage,
                target: TARGET_TYPES.HOSTILE,
                type: ACTION_TYPES.ATTACK,
            },
        ],
    };
};

const pickAbility = ({ actor, enemies }): Ability => {
    const [specialAbilities, regularAbilities] = partition(
        (a) => a.resourceCost > 0,
        actor.abilities.filter((a) => canUseAbility({ actor, ability: a, enemies }))
    );

    let ability: Ability;
    if (specialAbilities.length > 0) {
        if (actor.resources === actor.maxResources) {
            ability = getRandomItem(specialAbilities);
        } else {
            // Otherwise it is just a chance
            let mostExpensive = 0;
            specialAbilities.forEach(({ resourceCost }) => {
                if (resourceCost > mostExpensive) {
                    mostExpensive = resourceCost;
                }
            });

            if (Math.random() < actor.resources / (mostExpensive + 1)) {
                ability = getRandomItem(specialAbilities);
            }
        }
    }
    if (!ability) {
        if (actor.damage > 0) {
            regularAbilities.push(...Array.from({ length: 3 }).map(() => getSyntheticAttack(actor)));
        }

        ability = getRandomItem(regularAbilities);
    }

    return ability || loaf;
};

const useAbility = ({ caster, allies, enemies }): Event[] => {
    const { id } = caster;

    const ability = pickAbility({ actor: caster, enemies }); // Needs to be upfront resource cost?
    enemies = enemies.map((enemy) => {
        if (enemy?.id === id) {
            return {
                ...enemy,
                casting: ability.castTime > 0 || ability.channelDuration > 0 ? cloneDeep(ability) : null,
                resources: enemy.resources - (ability.resourceCost || 0),
            };
        }

        return enemy;
    });

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
    const results = [
        {
            updatedEnemies: updateCharacters(enemies, compose(tickDownBuffs, clearTurnHistory, addEnemyResources, halveArmor)),
            updatedAllies: allies,
        },
    ];

    // Each subsequent move should be based on the most recently updated enemies/player states.
    const getRecentEnemies = () => results[results.length - 1]?.updatedEnemies || enemies;
    const getRecentAllies = () => results[results.length - 1]?.updatedAllies || allies;

    const randomizedIndices = shuffle(getPopulatedEnemyIndices(getRecentEnemies())); // Randomize enemy move order
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

    results.push({
        updatedEnemies: updateCharacters(getRecentEnemies(), tickDownDebuffs),
        updatedAllies: getRecentAllies(),
    });

    return results;
};

export default enemyTurn;

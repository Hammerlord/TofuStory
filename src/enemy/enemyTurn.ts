import { cloneDeep } from "lodash";
import { compose, partition } from "ramda";
import uuid from "uuid";
import { Ability, EFFECT_TYPES, TARGET_TYPES } from "../ability/types";
import triggerDoTDamage from "../battle/dotDamage";
import { Combatant } from "../character/types";
import { ACTION_TYPES } from "./../ability/types";
import { applyEffectOnTurnProcs, parseAction, procKOEvents } from "./../battle/parseAbilityActions";
import { BATTLEFIELD_SIDES, Event, EventGroup } from "./../battle/types";
import {
    addEnemyResources,
    checkHalveArmor,
    clearTurnHistory,
    getEmptyIndices,
    getMaxHP,
    getValidTargetIndices,
    tickDownBuffs,
    tickDownDebuffs,
    updateCharacters,
} from "./../battle/utils";
import { getRandomItem } from "./../utils";
import { loaf } from "./abilities";
import { createCombatant } from "./createEnemy";
import { Enemy } from "./enemy";

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
        return actor.HP < getMaxHP(actor);
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
        const recentEnemies = results[results.length - 1]?.updatedEnemies || enemies;
        const recentAllies = results[results.length - 1]?.updatedAllies || allies;
        let selectedSide = BATTLEFIELD_SIDES.ENEMIES;

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
            selectedSide = BATTLEFIELD_SIDES.ALLIES;
        }

        const event = parseAction({
            actorId,
            enemies: recentEnemies,
            allies: recentAllies,
            selectedIndex,
            action,
            selectedSide,
            ability,
        });

        const checkKO = procKOEvents({
            oldAllies: recentAllies,
            newAllies: event.updatedAllies,
            oldEnemies: recentEnemies,
            newEnemies: event.updatedEnemies,
        });
        results.push(event);
        if (checkKO) {
            results.push(checkKO);
        }
    });

    return results;
};

const handleCastTick = ({ allies, enemies, actorId, casting }): EventGroup => {
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
        return {
            events: useAbilityActions({ allies, enemies, actorId, ability: updatedCasting }),
        };
    }

    // Return the enemy with the newly updated casting state as-is, don't use the ability
    return {
        events: [
            {
                updatedAllies: allies,
                updatedEnemies: enemies,
                id: uuid.v4(),
            },
        ],
    };
};

const getBasicAttack = (actor: Enemy): Ability => {
    if (actor.attack) {
        return actor.attack;
    }
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
            regularAbilities.push(...Array.from({ length: 3 }).map(() => getBasicAttack(actor)));
        }

        ability = getRandomItem(regularAbilities);
    }

    return ability || loaf;
};

const useAbility = ({ actor, allies, enemies }): EventGroup => {
    const { id } = actor;

    const ability = pickAbility({ actor, enemies }); // Needs to be upfront resource cost?
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
        return {
            ability,
            events: useAbilityActions({ allies, enemies, actorId: id, ability }),
        };
    } else {
        // Return the enemy with the newly updated casting state as-is, don't use the ability
        return {
            ability,
            events: [
                {
                    updatedAllies: allies,
                    updatedEnemies: enemies,
                    id: uuid.v4(),
                },
            ],
        };
    }
};

const enemyMove = ({ actor, allies, enemies }): EventGroup => {
    const { casting, id } = actor;
    if (casting) {
        return handleCastTick({ allies, enemies, actorId: id, casting });
    }

    return useAbility({ actor, allies, enemies });
};

const enemyTurn = ({ enemies, allies }): EventGroup[] => {
    const results = [
        {
            events: [
                {
                    updatedEnemies: updateCharacters(
                        enemies,
                        compose(tickDownBuffs, clearTurnHistory, addEnemyResources, checkHalveArmor, applyEffectOnTurnProcs)
                    ),
                    updatedAllies: allies,
                    id: uuid.v4(),
                },
            ],
        },
    ];

    // Each subsequent move should be based on the most recently updated enemies/player states.
    const getLastEvent = (): Event => {
        const lastResult = results[results.length - 1];
        return lastResult.events[lastResult.events.length - 1];
    };

    const acted = {};
    const filterEligibleToAct = (characters) => {
        return characters.filter((char: Combatant | null) => char?.HP > 0 && !isBusy(char) && !acted[char.id]);
    };

    const makeEnemyMove = () => {
        const { updatedEnemies, updatedAllies } = getLastEvent();
        const enemy = getRandomItem(filterEligibleToAct(updatedEnemies));
        if (enemy) {
            acted[enemy.id] = true;
            results.push(enemyMove({ actor: enemy, allies: updatedAllies, enemies: updatedEnemies }));
            makeEnemyMove();
        }
    };
    makeEnemyMove();

    const postTurn: (Combatant | null)[][] = triggerDoTDamage(getLastEvent().updatedEnemies);
    postTurn.push((postTurn[postTurn.length - 1] || getLastEvent().updatedEnemies).map(tickDownDebuffs));
    const checkKO = procKOEvents({
        oldAllies: getLastEvent().updatedAllies,
        newAllies: getLastEvent().updatedAllies,
        oldEnemies: postTurn[postTurn.length - 1] || getLastEvent().updatedEnemies,
        newEnemies: getLastEvent().updatedEnemies,
    });
    const postTurnEvents = postTurn.map((updatedEnemies) => ({
        updatedEnemies,
        updatedAllies: getLastEvent().updatedAllies,
        id: uuid.v4(),
    }));
    if (checkKO) {
        postTurnEvents.push(checkKO);
    }
    results.push({
        events: postTurn.map((updatedEnemies) => ({
            updatedEnemies,
            updatedAllies: getLastEvent().updatedAllies,
            id: uuid.v4(),
        })),
    });

    return results;
};

export default enemyTurn;

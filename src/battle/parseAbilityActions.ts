import { cloneDeep } from "lodash";
import { Action, ACTION_TYPES, AbilityCondition, Condition, EFFECT_TYPES, TARGET_TYPES } from "../ability/types";
import { Aura, Effect } from "./../ability/types";
import { Combatant } from "./../character/types";
import { createCombatant } from "./../enemy/createEnemy";
import { getRandomItem } from "./../utils";
import { passesConditions } from "./passesConditions";
import {
    calculateArmor,
    calculateDamage,
    cleanUpDeadCharacters,
    getCharacterStatChanges,
    getEnabledEffects,
    getHealableIndices,
    getValidTargetIndices,
    isSilenced,
    updateCharacters,
} from "./utils";

/**
 * The results of an action being applied.
 */
export interface Event {
    action?: Action;
    updatedAllies: Combatant[];
    updatedEnemies: Combatant[];
    actorId?: string;
    selectedIndex?: number;
    targetSide?: "allies" | "enemies";
}

const triggerReceiveEffects = (target, incomingEffect: Effect) => {
    const updatedTarget = {
        ...cloneDeep(target),
    };
    target.effects.forEach((targetEffect: Effect) => {
        if (!targetEffect.onReceiveEffect) {
            return false;
        }

        const { conditions, effectOwner: applyToTarget } = targetEffect.onReceiveEffect;
        if (
            conditions.some((condition: Condition) => {
                const { hasEffectType, comparator } = condition;
                return hasEffectType.some((type) => {
                    switch (comparator) {
                        case "eq":
                            return incomingEffect.type === type;
                        default:
                            return false;
                    }
                });
            })
        ) {
            updatedTarget.effects.push(...(applyToTarget.effects || []).map(cloneDeep));
        }
    });

    return updatedTarget;
};

const applyEffects = ({ target, effects }): Combatant => {
    if (target.HP <= 0) {
        return target;
    }

    target = cloneDeep(target) as Combatant;
    const isImmuneTo = (effect: Effect) => {
        return target.effects.some((targetEffect: Effect) => targetEffect.immunities?.some((type: EFFECT_TYPES) => type === effect.type));
    };

    effects.forEach((effect: Effect) => {
        if (!isImmuneTo(effect)) {
            target.effects.push(effect);
            target = triggerReceiveEffects(target, effect);
        }
    });

    return target;
};

const calculateBonus = ({ action, target, actor }: { action: Action; target: Combatant; actor: Combatant }): Action => {
    if (!action.bonus) {
        return action;
    }

    const { bonus, damage = 0, secondaryDamage, healing = 0, armor = 0, effects = [] } = action;
    const { conditions = [] } = bonus;

    const getCalculationTarget = (conditionTarget: "target" | "actor") => (conditionTarget === "target" ? target : actor);
    if (passesConditions({ getCalculationTarget, conditions })) {
        return {
            ...action,
            damage: damage + (bonus.damage || 0),
            secondaryDamage: secondaryDamage && secondaryDamage + (bonus.damage || 0),
            healing: healing + (bonus.healing || 0),
            armor: armor + (bonus.armor || 0),
            effects: [...effects, ...(bonus.effects || [])],
        } as Action;
    }
    return action;
};

export const applyActionToTarget = ({
    target,
    targetIndex,
    selectedIndex,
    actor,
    action,
}: {
    target: Combatant | null;
    targetIndex: number;
    selectedIndex?: number;
    actor?: Combatant;
    action: Action;
}): Combatant => {
    action = calculateBonus({ target, actor, action });
    const { healing = 0, effects = [], resources = 0 } = action;
    const damage = calculateDamage({ actor, target, targetIndex, selectedIndex, action });
    const armor = calculateArmor({ target, action });
    const updatedArmor = Math.max(0, target.armor - damage + armor);
    const healthDamage = Math.max(0, damage - target.armor);
    let HP = Math.max(0, target.HP - healthDamage);
    HP = HP > 0 ? Math.min(target.maxHP, HP + healing) : 0;
    // Check if stealth broken
    const targetEffects = damage === 0 ? target.effects : target.effects.filter(({ type }) => type !== EFFECT_TYPES.STEALTH);
    return applyEffects({
        target: {
            ...target,
            effects: targetEffects,
            HP,
            armor: updatedArmor,
            resources: (target.resources || 0) + resources,
        },
        effects,
    });
};

const calculateThornsDamage = (action: Action, hitTarget: Combatant): number => {
    if (action.type !== ACTION_TYPES.ATTACK) {
        return 0;
    }

    return getEnabledEffects(hitTarget).reduce((acc, { thorns = 0 }) => acc + thorns, 0);
};

const removeStealth = (character: Combatant): Combatant => {
    return {
        ...character,
        effects: character.effects.filter(({ type }) => type !== EFFECT_TYPES.STEALTH),
    };
};

export const calculateActionArea = ({ action, actor }: { action?: Action; actor: Combatant }): number => {
    if (!action) {
        return 0;
    }
    const { type, area = 0 } = action;
    const isAttack = type === ACTION_TYPES.ATTACK || type === ACTION_TYPES.RANGE_ATTACK;
    let totalArea = area;
    actor.effects.forEach(({ attackAreaIncrease = 0 }) => {
        if (isAttack) {
            totalArea += attackAreaIncrease;
        }
    });
    return totalArea;
};

const applyVacuum = ({
    characters,
    index,
    area,
    distance,
}: {
    characters: (Combatant | null)[];
    index: number;
    area: number;
    distance: number;
}) => {
    const newCharacters = characters.slice();
    for (let i = 1; i <= area; ++i) {
        if (newCharacters[index + i]) {
            for (let j = 0; j < i && j < distance; ++j) {
                if (!newCharacters[index + j]) {
                    newCharacters[index + j] = newCharacters[index + i];
                    newCharacters[index + i] = null;
                }
            }
        }
        if (newCharacters[index - i]) {
            for (let j = 0; j < i && j < distance; ++j) {
                if (!newCharacters[index - j]) {
                    newCharacters[index - j] = newCharacters[index - i];
                    newCharacters[index - i] = null;
                }
            }
        }
    }
    return newCharacters;
};

/**
 * Get percentage of damage that should be returned as health
 */
const calculateLeechPercentage = (actor: Combatant) => {
    const leechFromEffects = actor.effects.reduce((acc, { leech = 0 }) => acc + leech, 0);
    return leechFromEffects;
};

export const parseAction = ({
    enemies,
    allies,
    action,
    selectedIndex,
    actorId,
    selectedSide,
}: {
    enemies: (Combatant | null)[];
    allies: (Combatant | null)[];
    action: Action;
    selectedIndex: number;
    actorId: string;
    selectedSide: "allies" | "enemies";
}): Event => {
    const { movement, vacuum } = action;
    let { friendly, hostile, actorSide } = orientate({
        enemies,
        allies,
        actorId,
    });

    const actor = friendly.find((character) => character?.id === actorId);
    const area = calculateActionArea({ action, actor });
    const isInArea = (character, i) => {
        return character && i >= selectedIndex - area && i <= selectedIndex + area;
    };

    let thornsDamage = 0;
    let totalDamageDealt = 0;

    const tallyDamageDealt = (oldChar: Combatant, newChar: Combatant) => {
        const damageDealt = oldChar.HP + oldChar.armor - (newChar.HP + newChar.armor);
        if (damageDealt > 0) {
            totalDamageDealt += damageDealt;
        }
    };

    const updateTargets = (targets: (Combatant | null)[]) => {
        if (vacuum) {
            targets = applyVacuum({ characters: targets, index: selectedIndex, area, distance: vacuum });
        }
        return targets.map((character, i: number) => {
            if (isInArea(character, i)) {
                thornsDamage += calculateThornsDamage(action, character);
                const newCharacter = applyActionToTarget({ target: character, selectedIndex, targetIndex: i, action, actor }); // Actor possibly stale...
                tallyDamageDealt(character, newCharacter);
                return newCharacter;
            }

            return character;
        });
    };

    if (selectedSide !== actorSide) {
        hostile = updateTargets(hostile);
    } else {
        friendly = updateTargets(friendly);
    }

    const updateActor = (fn) => {
        friendly = friendly.map((character, i) => {
            if (character?.id !== actorId) {
                return character;
            }

            return fn(character, i);
        });
    };

    if (thornsDamage > 0) {
        updateActor((actor, i) =>
            applyActionToTarget({
                target: actor,
                targetIndex: i,
                action: {
                    damage: thornsDamage,
                    type: ACTION_TYPES.NONE,
                },
            })
        );
    }

    const leech = Math.ceil(calculateLeechPercentage(actor) * totalDamageDealt);
    if (leech > 0) {
        updateActor((actor, i) =>
            applyActionToTarget({
                target: actor,
                targetIndex: i,
                action: {
                    type: ACTION_TYPES.NONE,
                    healing: leech,
                },
            })
        );
    }

    if (action.type === ACTION_TYPES.ATTACK) {
        updateActor(removeStealth);
    }

    if (movement) {
        const index = friendly.findIndex((combatant) => combatant?.id === actorId);
        [friendly[index], friendly[selectedIndex]] = [friendly[selectedIndex], friendly[index]];
    }

    const [updatedAllies, updatedEnemies] = actorSide === "allies" ? [friendly, hostile] : [hostile, friendly];

    return {
        action,
        updatedAllies: renewPersistentAuras(updatedAllies),
        updatedEnemies: renewPersistentAuras(updatedEnemies),
        actorId,
        selectedIndex,
        targetSide: selectedSide,
    };
};

const orientate = ({ actorId, enemies, allies }) => {
    const actorSide = allies.find((ally) => ally?.id === actorId) ? "allies" : "enemies";
    const [friendly, hostile] = actorSide === "allies" ? [allies, enemies] : [enemies, allies];
    return {
        friendly: friendly.slice(),
        hostile: hostile.slice(),
        actorSide,
    };
};

const applyAuraPerTurnEffect = (characters: (Combatant | null)[], actorIndex: number) => {
    const i = actorIndex;
    const { aura, id, HP = 0 } = characters[i] || {};
    if (!aura || HP <= 0 || isSilenced(characters[i])) {
        return;
    }

    const { armorPerTurn = 0, healingPerTurn = 0, area = 0 } = aura as Aura;
    if (armorPerTurn === 0 && healingPerTurn === 0) {
        return;
    }

    const action = {
        armor: armorPerTurn,
        healing: healingPerTurn,
        type: ACTION_TYPES.EFFECT,
    };
    return {
        characters: characters.map((character, j) => {
            // Aura effects do not apply to the owner of the aura
            const isAffectedByAura = character?.HP > 0 && j >= i - area && j <= i + area && j !== i;
            if (isAffectedByAura) {
                return applyActionToTarget({ target: character, targetIndex: j, action });
            }
            return cloneDeep(character);
        }),
        action,
        actorId: id,
    };
};

export const applyPerTurnEffects = (
    actors: (Combatant | null)[],
    targets: (Combatant | null)[]
): { actors: (Combatant | null)[]; targets: (Combatant | null)[]; action: Action; actorId: string }[] => {
    const results = [];

    actors.forEach((character: Combatant | null, i) => {
        if (!character) {
            return character;
        }

        const friendly = results[results.length - 1]?.actors || actors;
        const appliedAuraEffects = applyAuraPerTurnEffect(friendly, i);
        if (appliedAuraEffects) {
            const { characters, action, actorId } = appliedAuraEffects;
            results.push({
                actors: characters,
                targets,
                action,
                actorId,
            });
        }

        // TODO damageTargetPerTurn
        const { healTargetPerTurn, damageTargetPerTurn } = character.effects.reduce(
            (acc, effect: Effect) => {
                const { healTargetPerTurn = 0, damageTargetPerTurn = 0 } = effect;
                return {
                    healTargetPerTurn: acc.healTargetPerTurn + healTargetPerTurn,
                    damageTargetPerTurn: acc.damageTargetPerTurn + damageTargetPerTurn,
                };
            },
            { healTargetPerTurn: 0, damageTargetPerTurn: 0 }
        );

        if (healTargetPerTurn > 0) {
            const indices = getHealableIndices(friendly);
            if (indices.length > 0) {
                const selectedIndex = getRandomItem(indices);
                const action = {
                    type: ACTION_TYPES.EFFECT,
                    healing: healTargetPerTurn,
                };
                results.push({
                    actors: friendly.map((actor, i) => {
                        if (!actor || i !== selectedIndex) {
                            return actor;
                        }

                        return applyActionToTarget({
                            target: actor,
                            targetIndex: i,
                            selectedIndex: selectedIndex,
                            actor: character,
                            action: {
                                type: ACTION_TYPES.EFFECT,
                                healing: healTargetPerTurn,
                            },
                        });
                    }),
                    targets,
                    actorId: character.id,
                    action,
                });
            }
        }
    });

    return results;
};

const renewPersistentAuras = (characters: (Combatant | null)[]) => {
    const updated = characters.map((character) => {
        if (!character) {
            return character;
        }

        return {
            ...cloneDeep(character),
            effects: character.effects.filter((effect) => !effect.isAuraEffect),
        };
    });

    updated.forEach((character: Combatant | null, i) => {
        const { aura, HP = 0 } = character || {};
        if (aura && HP > 0) {
            // Only a subset of aura properties are "persistent" effects -- apply or fade based on proximity to the
            // owner of the aura at any given moment
            const { area = 0, damage = 0, thorns = 0 } = aura;
            for (let j = i - area; j <= i + area; ++j) {
                // Aura effects do not apply to the owner of the aura
                if (i !== j && updated[j] && updated[j].HP > 0) {
                    updated[j].effects.push({
                        thorns,
                        damage,
                        isAuraEffect: true,
                    });
                }
            }
        }
    });
    return updated;
};

const getKOedCharacters = (prevChars, newChars) => {
    if (!prevChars) {
        return newChars.filter((char: Combatant | null) => char?.HP === 0);
    }

    const wasPreviouslyAlive = (char: Combatant | null) => {
        const prev = prevChars.find((prevChar: Combatant | null) => prevChar?.id === char.id);
        return !prev || prev.HP > 0;
    };
    return newChars.filter((char: Combatant | null) => char?.HP === 0 && wasPreviouslyAlive(char));
};

/**
 * KO event only
 */
const procActionEvents = (prevChars, newChars): (Combatant | null)[] => {
    const KOed = getKOedCharacters(prevChars, newChars);
    if (KOed.length === 0 || newChars.every((char) => !char || char.HP === 0)) {
        return;
    }

    return updateCharacters(newChars, (character, i) => {
        const aggregatedEffects = getEnabledEffects(character).reduce((acc, effect: Effect) => {
            const { healing = 0, armor = 0, effects = [] } = effect.onFriendlyKilled?.effectOwner || {};
            const newEffects = [];
            for (let i = 0; i < KOed.length; ++i) {
                newEffects.push(...effects);
            }
            return {
                healing: (acc.healing || 0) + healing * KOed.length,
                armor: (acc.armor || 0) + armor * KOed.length,
                effects: [...(acc.effects || []), ...newEffects],
            };
        }, {} as any);

        if (aggregatedEffects.healing || aggregatedEffects.armor || aggregatedEffects.effects?.length) {
            return applyActionToTarget({
                target: character,
                action: {
                    type: ACTION_TYPES.EFFECT,
                    ...aggregatedEffects,
                },
                targetIndex: i,
            });
        }
        return character;
    });
};

export const useAllyAbility = ({ enemies, selectedIndex: initialSelectedIndex, side, ability, allies, actorId }): Event[] => {
    const { minion, actions, resourceCost } = ability;
    const results = [];

    if (minion) {
        results.push({
            updatedEnemies: enemies.map(cloneDeep),
            updatedAllies: renewPersistentAuras(
                allies.map((ally: Combatant | null, i: number) => {
                    return i === initialSelectedIndex ? createCombatant(minion) : cloneDeep(ally);
                })
            ),
            actorId,
        });
    }

    // All actions should be based on the most recent version of enemies/allies
    const mostRecentEnemies = () => results[results.length - 1]?.updatedEnemies || enemies;
    const mostRecentAllies = () => results[results.length - 1]?.updatedAllies || allies;
    const mostRecentCaster = () => mostRecentAllies().find((ally) => ally?.id === actorId);

    const getCalculationTarget = (targetType: "actor" | "target") => {
        if (targetType === "actor") {
            return mostRecentCaster();
        }

        return side === "allies" ? mostRecentAllies()[initialSelectedIndex] : mostRecentEnemies()[initialSelectedIndex];
    };
    const eligibleActions = actions.filter((action: Action) => passesConditions({ getCalculationTarget, conditions: action.conditions }));
    eligibleActions.forEach((action: Action) => {
        let index = initialSelectedIndex;
        if (action.target === TARGET_TYPES.RANDOM_HOSTILE) {
            const targetIndices = getValidTargetIndices(mostRecentEnemies(), { excludeStealth: true }).filter((i) => {
                if (ability.area) {
                    return i >= initialSelectedIndex - ability.area && i <= initialSelectedIndex + ability.area;
                }
                return true;
            });
            index = getRandomItem(targetIndices);
        } else if (action.target === TARGET_TYPES.SELF) {
            index = mostRecentAllies().findIndex((ally) => ally?.id === actorId);
            side = "allies";
        }

        if (typeof index !== "number") {
            return;
        }
        results.push(
            parseAction({
                enemies: mostRecentEnemies(),
                allies: mostRecentAllies(),
                selectedIndex: index,
                action,
                actorId,
                selectedSide: side,
            })
        );
        const enemyActionEventProcs = procActionEvents(results[results.length - 2] || enemies, mostRecentEnemies());
        if (enemyActionEventProcs) {
            results.push({
                updatedEnemies: enemyActionEventProcs,
                updatedAllies: mostRecentAllies(),
            });
        }
    });

    if (!mostRecentCaster()) {
        // If it's dead, return here
        return results;
    }

    const hpPerResourceUpdatedCharacters = handleHealthPerResourcesSpent({
        actor: mostRecentCaster(),
        resourceCost,
        characters: mostRecentAllies(),
    });
    if (hpPerResourceUpdatedCharacters) {
        results.push({
            updatedAllies: hpPerResourceUpdatedCharacters,
            updatedEnemies: mostRecentEnemies(),
            actorId: null,
        } as Event);
    }

    const abilityActionEventUpdatedCharacters = handleOnAbilityActionEvents({
        actor: mostRecentCaster(),
        characters: mostRecentAllies(),
        ability,
    });
    if (abilityActionEventUpdatedCharacters) {
        results.push({
            updatedAllies: abilityActionEventUpdatedCharacters,
            updatedEnemies: mostRecentEnemies(),
            actorId: null,
        } as Event);
    }

    return results;
};

const handleOnAbilityActionEvents = ({ actor, characters, ability }): Combatant[] => {
    const isAttackUsed = ability.actions.some(({ type }) => type === ACTION_TYPES.ATTACK || type === ACTION_TYPES.RANGE_ATTACK);
    let procced = false;
    const updated = characters.map((character) => {
        if (character?.id !== actor.id) {
            return character;
        }

        return {
            ...cloneDeep(character),
            effects: character.effects.filter((effect: Effect) => {
                const { onAttack } = effect;
                if (onAttack && isAttackUsed) {
                    // Only handling this very specific thing atm...
                    const { removeEffect } = onAttack;
                    procced = true;
                    return !removeEffect;
                }
                return true;
            }),
        };
    });
    if (procced) {
        return updated;
    }
};

const handleHealthPerResourcesSpent = ({ actor, characters, resourceCost = 0 }): Combatant[] => {
    const healthPerResourcesSpent = actor.effects.reduce((acc, { healthPerResourcesSpent = 0 }) => {
        return acc + healthPerResourcesSpent;
    }, 0);

    if (healthPerResourcesSpent > 0) {
        const healing = healthPerResourcesSpent * resourceCost;
        if (healing > 0) {
            const newHP = Math.min(actor.maxHP || Infinity, actor.HP + healing);
            return characters.map((character) => {
                if (character?.id === actor.id) {
                    return {
                        ...cloneDeep(actor),
                        HP: newHP,
                    };
                }
                return character;
            });
        }
    }
};

export const useAttack = ({ enemies, allies, index, actorId }): Event[] => {
    const caster = allies.find((ally) => ally?.id === actorId) || {};
    const { id } = caster;
    return useAllyAbility({
        enemies,
        selectedIndex: index,
        side: "enemies",
        ability: {
            actions: [
                {
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
            ],
        },
        allies,
        actorId: id,
    });
};

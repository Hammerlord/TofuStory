import { getRandomInt, getRandomItem } from "./../utils";
import { cloneDeep } from "lodash";
import { Action, ACTION_TYPES, Conditions, EffectCondition, EFFECT_TYPES, TARGET_TYPES } from "../ability/types";
import { Aura, Effect } from "./../ability/types";
import { Combatant } from "./../character/types";
import { createCombatant } from "./../enemy/createEnemy";
import { calculateArmor, calculateDamage, cleanUpDeadCharacters, getHealableIndices, getValidTargetIndices } from "./utils";
import { access } from "fs";

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

        const { conditions, target: applyToTarget } = targetEffect.onReceiveEffect;
        if (
            conditions.some((condition: EffectCondition) => {
                const { types, comparator } = condition;
                return types.some((type) => {
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

const passesValueComparison = ({ val, otherVal, comparator }: { val: any; otherVal: any; comparator: "eq" | "lt" | "gt" }): boolean => {
    switch (comparator) {
        case "eq":
            return val === otherVal;
        case "lt":
            return val < otherVal;
        case "gt":
            return val > otherVal;
        default:
            return false;
    }
};

const calculateBonus = ({ action, target, actor }: { action: Action; target: Combatant; actor: Combatant }): Action => {
    if (!action.bonus) {
        return action;
    }

    const { bonus, damage = 0, healing = 0, armor = 0, effects = [] } = action;
    const { conditions = [] } = bonus;
    const passesCondition = ({ calculationTarget, hasEffectType = [], healthPercentage, comparator }: Conditions): boolean => {
        const combatant: Combatant = calculationTarget === "target" ? target : actor;
        if (combatant) {
            const meetsHealthPercentage =
                healthPercentage === undefined
                    ? true
                    : passesValueComparison({ val: Math.floor(combatant.HP / combatant.maxHP), otherVal: healthPercentage, comparator });
            const meetsEffectType = hasEffectType.length === 0 ? true : combatant.effects.some(({ type }) => hasEffectType.includes(type));
            return meetsEffectType && meetsHealthPercentage;
        }
    };
    if (!conditions.length || conditions.some(passesCondition)) {
        return {
            ...action,
            damage: damage + (bonus.damage || 0),
            healing: healing + (bonus.healing || 0),
            armor: armor + (bonus.armor || 0),
            effects: [...effects, ...(bonus.effects || [])],
        } as Action;
    }
    return action;
};

export const applyActionToTarget = ({ target, actor, action }: { target: Combatant; actor?: Combatant; action: Action }): Combatant => {
    action = calculateBonus({ target, actor, action });
    const { healing = 0, effects = [], resources = 0 } = action;
    const damage = calculateDamage({ actor, target, action });
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

const calculateThornsDamage = (action: Action, hitTargets: Combatant[]): number => {
    if (action.type !== ACTION_TYPES.ATTACK) {
        return 0;
    }

    return hitTargets.reduce((acc, { effects }) => {
        return acc + effects.reduce((acc, { thorns = 0 }) => acc + thorns, 0);
    }, 0);
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

export const parseAction = ({ enemies, allies, action, selectedIndex, actorId, side }): Event => {
    const { movement } = action;
    const { friendly, hostile, caster, casterSide } = getFriendlyOrHostile({
        enemies,
        allies,
        actorId,
    });
    const area = calculateActionArea({ action, actor: caster });
    const isInArea = (character, i) => {
        return character && i >= selectedIndex - area && i <= selectedIndex + area;
    };
    let targets = side === "allies" ? allies : enemies;
    targets = targets.filter(isInArea);

    const updatedTargetsMap = targets
        .map((target) => applyActionToTarget({ target, action, actor: caster }))
        .reduce((acc, current) => {
            acc[current.id] = current;
            return acc;
        }, {});

    if (action.type === ACTION_TYPES.ATTACK) {
        updatedTargetsMap[actorId] = removeStealth(updatedTargetsMap[actorId] || caster);
    }

    const thornsDamage = calculateThornsDamage(action, targets);
    if (thornsDamage > 0) {
        updatedTargetsMap[actorId] = applyActionToTarget({
            target: updatedTargetsMap[actorId] || caster,
            action: {
                damage: thornsDamage,
                type: ACTION_TYPES.NONE,
            },
        });
    }

    const getUpdatedCharacter = (character) => {
        return updatedTargetsMap[character?.id] || cloneDeep(character);
    };

    if (movement) {
        const index = friendly.findIndex((combatant) => combatant?.id === actorId);
        [friendly[index], friendly[selectedIndex]] = [friendly[selectedIndex], friendly[index]];
    }

    const [updatedAllies, updatedEnemies] = casterSide === "allies" ? [friendly, hostile] : [hostile, friendly];

    return {
        action,
        updatedAllies: renewPersistentAuras(updatedAllies.map(getUpdatedCharacter)),
        updatedEnemies: renewPersistentAuras(updatedEnemies.map(getUpdatedCharacter)),
        actorId,
        selectedIndex,
        targetSide: side,
    };
};

const getFriendlyOrHostile = ({ actorId, enemies, allies }) => {
    const casterSide = allies.find((ally) => ally?.id === actorId) ? "allies" : "enemies";
    const [friendly, hostile] = casterSide === "allies" ? [allies, enemies] : [enemies, allies];
    return {
        friendly: friendly.slice(),
        hostile: hostile.slice(),
        caster: friendly.find((character) => character?.id === actorId),
        casterSide,
    };
};

const applyAuraPerTurnEffect = (characters: (Combatant | null)[], actorIndex: number) => {
    const i = actorIndex;
    const { aura, id, HP = 0 } = characters[i] || {};
    if (!aura || HP <= 0) {
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
                return applyActionToTarget({ target: character, action });
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

        const appliedAuraEffects = applyAuraPerTurnEffect(results[results.length - 1]?.actors || actors, i);
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
            const indices = getHealableIndices(actors);
            if (indices.length > 0) {
                const index = getRandomItem(indices);
                const action = {
                    type: ACTION_TYPES.EFFECT,
                    healing: healTargetPerTurn,
                };
                results.push({
                    actors: actors.map((actor, i) => {
                        if (!actor || i !== index) {
                            return actor;
                        }

                        return applyActionToTarget({
                            target: actors[index],
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

export const useAllyAbility = ({ enemies, selectedIndex, side, ability, allies, actorId }): Event[] => {
    const { minion, actions, resourceCost } = ability;
    const results = [];

    if (minion) {
        results.push({
            updatedEnemies: enemies.map(cloneDeep),
            updatedAllies: renewPersistentAuras(
                allies.map((ally: Combatant | null, i: number) => {
                    return i === selectedIndex ? createCombatant(minion) : cloneDeep(ally);
                })
            ),
            actorId,
        });
    }

    // All actions should be based on the most recent version of enemies/allies
    const mostRecentEnemies = () => cleanUpDeadCharacters(results[results.length - 1]?.updatedEnemies || enemies);
    const mostRecentAllies = () => cleanUpDeadCharacters(results[results.length - 1]?.updatedAllies || allies);
    const mostRecentCaster = () => mostRecentAllies().find((ally) => ally?.id === actorId);

    actions.forEach((action: Action) => {
        let index = selectedIndex;
        if (action.target === TARGET_TYPES.RANDOM_HOSTILE) {
            const targetIndices = getValidTargetIndices(mostRecentEnemies(), { excludeStealth: true }).filter((i) => {
                if (ability.area) {
                    return i >= selectedIndex - ability.area && i <= selectedIndex + ability.area;
                }
                return true;
            });
            index = getRandomItem(targetIndices);
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
                side,
            })
        );
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
    return characters.map((character) => {
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
                    return !removeEffect;
                }
                return true;
            }),
        };
    });
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

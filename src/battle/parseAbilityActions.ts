import { getRandomInt, getRandomItem } from "./../utils";
import { cloneDeep } from "lodash";
import { Action, ACTION_TYPES, EffectCondition, EFFECT_TYPES, TARGET_TYPES } from "../ability/types";
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
    casterId?: string;
    targetIndex?: number;
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

const calculateBonus = ({ action, target, actor }: { action: Action; target: Combatant; actor: Combatant }): Action => {
    if (!action.bonus) {
        return action;
    }

    const { bonus, damage = 0, healing = 0, armor = 0, effects = [] } = action;
    const { conditions = [] } = bonus;
    const passesCondition = ({ calculationTarget, hasEffectType }) => {
        const combatant: Combatant = calculationTarget === "target" ? target : actor;
        if (combatant) {
            return combatant.effects.some(({ type }) => hasEffectType.includes(type));
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

export const parseAction = ({ enemies, allies, action, targetIndex, casterId, side }): Event => {
    const { area = 0, movement } = action;

    const { friendly, hostile, caster, casterSide } = getFriendlyOrHostile({
        enemies,
        allies,
        casterId,
    });
    const isInArea = (character, i) => {
        return character && i >= targetIndex - area && i <= targetIndex + area;
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
        updatedTargetsMap[casterId] = removeStealth(updatedTargetsMap[casterId] || caster);
    }

    const thornsDamage = calculateThornsDamage(action, targets);
    if (thornsDamage > 0) {
        updatedTargetsMap[casterId] = applyActionToTarget({
            target: updatedTargetsMap[casterId] || caster,
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
        const index = friendly.findIndex((combatant) => combatant?.id === casterId);
        [friendly[index], friendly[targetIndex]] = [friendly[targetIndex], friendly[index]];
    }

    const [updatedAllies, updatedEnemies] = casterSide === "allies" ? [friendly, hostile] : [hostile, friendly];

    return {
        action,
        updatedAllies: renewPersistentAuras(updatedAllies.map(getUpdatedCharacter)),
        updatedEnemies: renewPersistentAuras(updatedEnemies.map(getUpdatedCharacter)),
        casterId,
        targetIndex,
        targetSide: side,
    };
};

const getFriendlyOrHostile = ({ casterId, enemies, allies }) => {
    const casterSide = allies.find((ally) => ally?.id === casterId) ? "allies" : "enemies";
    const [friendly, hostile] = casterSide === "allies" ? [allies, enemies] : [enemies, allies];
    return {
        friendly: friendly.slice(),
        hostile: hostile.slice(),
        caster: friendly.find((character) => character?.id === casterId),
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
        casterId: id,
    };
};

export const applyPerTurnEffects = (
    actors: (Combatant | null)[],
    targets: (Combatant | null)[]
): { actors: (Combatant | null)[]; targets: (Combatant | null)[]; action: Action; casterId: string }[] => {
    const results = [];

    actors.forEach((character: Combatant | null, i) => {
        if (!character) {
            return character;
        }

        const appliedAuraEffects = applyAuraPerTurnEffect(results[results.length - 1]?.actors || actors, i);
        if (appliedAuraEffects) {
            const { characters, action, casterId } = appliedAuraEffects;
            results.push({
                actors: characters,
                targets,
                action,
                casterId,
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
                    casterId: character.id,
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

export const useAllyAbility = ({ enemies, targetIndex, side, ability, allies, casterId }): Event[] => {
    const { minion, actions, resourceCost } = ability;
    const results = [];

    if (minion) {
        results.push({
            updatedEnemies: enemies.map(cloneDeep),
            updatedAllies: renewPersistentAuras(
                allies.map((ally: Combatant | null, i: number) => {
                    return i === targetIndex ? createCombatant(minion) : cloneDeep(ally);
                })
            ),
            casterId,
        });
    }

    // All actions should be based on the most recent version of enemies/allies
    const mostRecentEnemies = () => cleanUpDeadCharacters(results[results.length - 1]?.updatedEnemies || enemies);
    const mostRecentAllies = () => cleanUpDeadCharacters(results[results.length - 1]?.updatedAllies || allies);

    actions.forEach((action: Action) => {
        let index = targetIndex;
        if (action.target === TARGET_TYPES.RANDOM_HOSTILE) {
            const targetIndices = getValidTargetIndices(mostRecentEnemies(), { excludeStealth: true }).filter((i) => {
                if (ability.area) {
                    return i >= targetIndex - ability.area && i <= targetIndex + ability.area;
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
                targetIndex: index,
                action,
                casterId,
                side,
            })
        );
    });

    const caster = mostRecentAllies().find((ally) => ally?.id === casterId);
    if (!caster) {
        // If it's dead, return here
        return results;
    }

    const healthPerResourcesSpent = caster.effects.reduce((acc, { healthPerResourcesSpent = 0 }) => {
        return acc + healthPerResourcesSpent;
    }, 0);

    if (healthPerResourcesSpent > 0) {
        const healing = healthPerResourcesSpent * resourceCost;
        if (healing > 0) {
            const newHP = Math.min(caster.maxHP || Infinity, caster.HP + healing);
            const updatedAllies = mostRecentAllies().map((character) => {
                if (character?.id === caster.id) {
                    return {
                        ...cloneDeep(caster),
                        HP: newHP,
                    };
                }

                return character;
            });
            results.push({
                updatedAllies,
                updatedEnemies: mostRecentEnemies().map(cloneDeep),
                casterId: null,
            });
        }
    }
    return results;
};

export const useAttack = ({ enemies, allies, index, casterId }): Event[] => {
    const caster = allies.find((ally) => ally?.id === casterId) || {};
    const { id } = caster;
    return useAllyAbility({
        enemies,
        targetIndex: index,
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
        casterId: id,
    });
};

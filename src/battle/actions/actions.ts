import { arcaneChanneling } from "./../../ability/magician/magicianAbilities";
import { uniq } from "lodash";
import { partition } from "ramda";
import uuid from "uuid";
import {
    Ability,
    Action,
    ACTION_TYPES,
    CombatEffect,
    EffectEventTrigger,
    EFFECT_CLASSES,
    EFFECT_EVENT_KEYS,
    EFFECT_TYPES,
    HandAbility,
    MORPH_TYPES,
    TARGET_TYPES,
    AbilityEffects,
    AUTO_CAST_ABILITY_TYPES,
    CONDITION_TARGETS,
    SELECT_CARD_TYPES,
    AutoCastAbility,
} from "../../ability/types";
import { playerStateSlice } from "../../character/playerReducer";
import { Combatant } from "../../character/types";
import { abilityNameMap, enemyNameMap } from "../../enemy";
import { Item } from "../../item/types";
import { getRandomItem, getRandomItems, shuffle } from "../../utils";
import { IndexedCombatant, passesConditions } from "../passesConditions";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES, CombatantInfo, Event, TRIGGER_SOURCE_TYPES } from "../types";
import {
    applyMovement,
    applyVacuum,
    calculateActionArea,
    canTargetIfStealthed,
    getEnabledEffects,
    getInducedAttack,
    getPossibleSummonIndices,
    getValidTargetIndices,
    isSilenced,
    isUnableToAct,
} from "../utils";
import { TRIGGER_TARGET_TYPES } from "./../../ability/types";
import { createCombatant } from "./../../enemy/createEnemy";
import { getRandomInt } from "./../../utils";
import { BATTLE_STATES } from "./../reducer";
import { TriggerSource } from "./../types";
import { getUpdatedStats, UpdatedCombatantStats } from "./getUpdatedStats";
import { getMorphMap, getMorphMerge } from "./morphUtils";
import { JOB_CARD_MAP } from "../../ability";
import { aggregateAbilityEffects } from "../../Menu/utils";
import getCardSelection from "../selectCardUtils";
import { PLAYER_CLASSES } from "../../Menu/types";

const { updateBattle, updateBattleState, pushEventQueue, promptPlayerSelectCards } = battleStateSlice.actions;
const { updatePlayer } = playerStateSlice.actions;

/**
 * Helper to get the combatant data and additional details such as what slot index it sits on the board, who its allies and enemies are.
 * @param getState - Redux getState function
 * @param combatantId - Combatant UUID
 * @returns {CombatantInfo|undefined} - Undefined if combatant associated to the UUID not found on the board
 */
export const findCombatantData = (getState, combatantId: string): CombatantInfo | undefined => {
    const { playerSide, enemySide } = getState().battle;
    const enemyIndex = enemySide.findIndex((c: Combatant | null) => c?.id === combatantId);
    if (enemyIndex > -1) {
        return {
            combatant: enemySide[enemyIndex],
            index: enemyIndex,
            friendly: enemySide.slice(),
            hostile: playerSide.slice(),
            friendlySide: BATTLEFIELD_SIDES.ENEMY_SIDE,
            hostileSide: BATTLEFIELD_SIDES.PLAYER_SIDE,
        };
    }

    const index = playerSide.findIndex((c: Combatant | null) => c?.id === combatantId);
    if (index > -1) {
        return {
            combatant: playerSide[index],
            index,
            friendly: playerSide.slice(),
            hostile: enemySide.slice(),
            friendlySide: BATTLEFIELD_SIDES.PLAYER_SIDE,
            hostileSide: BATTLEFIELD_SIDES.ENEMY_SIDE,
        };
    }
};

const handleLifeOnKill = (triggerSource?: TriggerSource) => {
    return (dispatch, getState) => {
        if (!triggerSource) {
            return;
        }

        const { type, source, actorId } = triggerSource;
        let killedByInfo: CombatantInfo;
        if (type === TRIGGER_SOURCE_TYPES.EFFECT) {
            killedByInfo = findCombatantData(getState, (source as CombatEffect)?.applierId);
        } else if (type === TRIGGER_SOURCE_TYPES.ABILITY) {
            killedByInfo = findCombatantData(getState, actorId);
        }

        const { combatant: killedBy, index } = killedByInfo || {};
        if (!killedBy || killedBy.HP <= 0) {
            return;
        }

        const lifeOnKill = getEnabledEffects({ combatant: killedBy, index }).reduce(
            (acc, { lifeOnHit: lifeOnKill = 0 }) => acc + lifeOnKill,
            0
        );
        if (lifeOnKill === 0) {
            return;
        }

        const updated = getUpdatedStats({
            ...getState().battle,
            actorId: killedBy.id,
            targetIds: [killedBy.id],
            selectedIndex: index,
            action: {
                type: ACTION_TYPES.EFFECT,
                healing: lifeOnKill,
            },
            source: {
                ...triggerSource,
            },
            getCombatantById: (id) => findCombatantData(getState, id),
        });

        dispatch(applyStatChanges(updated.map(([statUpdate]) => statUpdate)));
        dispatch(
            triggerStatChangeEvents(
                updated.map(([statUpdate, action]) => ({
                    statUpdate,
                    source: {
                        source: action,
                        type: TRIGGER_SOURCE_TYPES.EFFECT,
                        actorId: killedBy.id,
                        targetId: killedBy.id,
                        statUpdate,
                        triggerHistory: [],
                    },
                }))
            )
        );
    };
};

const checkHitEffects = ({
    affectedTargets,
    actorId,
    action,
    source,
}: {
    affectedTargets: string[];
    actorId: string;
    action: Action;
    source: TriggerSource;
}) => {
    return (dispatch, getState) => {
        if (![ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK].includes(action.type)) {
            return;
        }

        const { combatant: actor, index } = findCombatantData(getState, actorId) || {};
        if (!actor || actor?.HP <= 0) {
            return;
        }

        const lifeOnHit = getEnabledEffects({ combatant: actor, index }).reduce((acc, { lifeOnHit = 0 }) => acc + lifeOnHit, 0);

        if (lifeOnHit) {
            const updated = getUpdatedStats({
                ...getState().battle,
                actorId: actor.id,
                targetIds: [actor.id],
                selectedIndex: index,
                action: {
                    type: ACTION_TYPES.EFFECT,
                    healing: lifeOnHit * affectedTargets.length,
                },
                source,
                getCombatantById: (id) => findCombatantData(getState, id),
            });

            dispatch(applyStatChanges(updated.map(([statUpdate]) => statUpdate)));
            dispatch(
                triggerStatChangeEvents(
                    updated.map(([statUpdate, action]) => ({
                        statUpdate,
                        source: {
                            source: action,
                            type: TRIGGER_SOURCE_TYPES.EFFECT,
                            actorId,
                            targetId: actorId,
                            statUpdate,
                            triggerHistory: [],
                        },
                    }))
                )
            );
        }

        const totalThorns = affectedTargets.reduce((acc, id: string) => {
            const combatantData = findCombatantData(getState, id);
            getEnabledEffects(combatantData).forEach(({ thorns = 0 }) => (acc += thorns));
            return acc;
        }, 0);

        if (totalThorns) {
            const updated = getUpdatedStats({
                ...getState().battle,
                targetIds: [actor.id],
                action: {
                    type: ACTION_TYPES.EFFECT,
                    damage: totalThorns,
                },
                source,
                getCombatantById: (id) => findCombatantData(getState, id),
            });

            dispatch(applyStatChanges(updated.map(([statUpdate]) => statUpdate)));
            dispatch(
                triggerStatChangeEvents(
                    updated.map(([statUpdate, action]) => ({
                        statUpdate,
                        source: {
                            source: action,
                            type: TRIGGER_SOURCE_TYPES.EFFECT,
                            actorId,
                            targetId: actorId,
                            statUpdate,
                            triggerHistory: [],
                        },
                    }))
                )
            );
        }
    };
};

const onCombatantDeath = ({ combatantId, triggerSource }: { combatantId: string; triggerSource?: TriggerSource }) => {
    return (dispatch, getState) => {
        dispatch(checkEventTrigger({ combatantId, effectEventKey: EFFECT_EVENT_KEYS.onDeath, source: triggerSource }));

        const { friendly, hostile, combatant } = findCombatantData(getState, combatantId) || {};
        if (!combatant) {
            return;
        }

        const dispatchEvent = (combatant: Combatant | null, effectEventKey: EFFECT_EVENT_KEYS) => {
            const { HP, id } = combatant || {};
            if (HP > 0 && id !== combatantId) {
                dispatch(checkEventTrigger({ combatantId: id, effectEventKey, source: triggerSource }));
            }
        };

        dispatch(handleLifeOnKill(triggerSource));
        dispatch(
            updateBattle({
                mesosAccumulated: getState().battle.mesosAccumulated + (combatant.mesos || 0),
            })
        );

        friendly.forEach((combatant: Combatant | null) => {
            dispatchEvent(combatant, EFFECT_EVENT_KEYS.onFriendlyDeath);
        });

        hostile.forEach((combatant: Combatant | null) => {
            dispatchEvent(combatant, EFFECT_EVENT_KEYS.onHostileDeath);
        });

        const { playerSide, playerSummonsInPlay, discard } = getState().battle;

        const player = playerSide.find((c: Combatant | null) => c?.isPlayer);
        if (player.HP <= 0) {
            dispatch(updateBattleState(BATTLE_STATES.DEFEAT));
            dispatch(updatePlayer(player));
            return;
        }

        if (playerSummonsInPlay[combatantId]) {
            dispatch(
                updateBattle({
                    playerSummonsInPlay: { ...playerSummonsInPlay, [combatantId]: undefined },
                    discard: [...discard, playerSummonsInPlay[combatantId]],
                })
            );
        }
    };
};

const handleOnReceiveAction = ({
    updatedStats,
    source,
    combatants,
}: {
    updatedStats: [UpdatedCombatantStats, Action][];
    source?: TriggerSource;
    combatants: (Combatant | null)[];
}) => {
    return (dispatch) => {
        const isAttack = (action: Action) => [ACTION_TYPES.RANGE_ATTACK, ACTION_TYPES.ATTACK].includes(action.type);
        updatedStats.forEach(([stats, action]) => {
            if (!isAttack(action)) {
                return;
            }

            dispatch(
                checkEventTrigger({
                    combatantId: stats.combatantId,
                    effectEventKey: EFFECT_EVENT_KEYS.onReceiveAttack,
                    source: { ...source, targetId: stats.combatantId },
                })
            );
        });

        combatants.forEach((combatant: Combatant | null) => {
            if (!combatant) {
                return;
            }

            updatedStats.forEach(([stats, action]) => {
                if (stats.combatantId === combatant.id || !isAttack(action)) {
                    return;
                }
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onFriendlyReceiveAttack,
                        source: { ...source, targetId: stats.combatantId },
                    })
                );
            });
        });
    };
};

const onAction = ({ action, source }: { action: Action; source?: TriggerSource }) => {
    return (dispatch, getState) => {
        const actorId = source?.actorId;
        if (action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK) {
            dispatch(
                checkEventTrigger({
                    combatantId: actorId,
                    effectEventKey: EFFECT_EVENT_KEYS.onAttack,
                    source,
                })
            );
        }

        const { combatant } = findCombatantData(getState, actorId) || {};
        const turnHistory = combatant?.turnHistory || [];

        dispatch(
            updateCombatant({
                combatantId: actorId,
                newProperties: {
                    turnHistory: [...turnHistory, action],
                },
            })
        );
    };
};

/**
 * Trigger damage over time (DoT) effects. DoT effects of a class, such as burn, should be rolled into a single instance of damage
 * (so that 5x bleed doesn't trigger damage received events 5x).
 * @param combatantId - Combatant UUID
 */
const handleDoTs =
    ({ combatantId, dotType, source }: { combatantId: string; dotType: EFFECT_TYPES; source?: TriggerSource }) =>
    (dispatch, getState) => {
        const { combatant, index } = findCombatantData(getState, combatantId) || {};
        if (!combatant?.HP) {
            return;
        }

        const dotDamageMap = {
            [EFFECT_TYPES.BLEED]: 1,
            [EFFECT_TYPES.POISON]: 2,
            [EFFECT_TYPES.BURN]: 3,
        };

        const activeEffects = getEnabledEffects({ combatant });
        const damage = activeEffects.reduce((acc, effect) => {
            if (effect.type === dotType) {
                return acc + (dotDamageMap[effect.type] || 0);
            }
            return acc;
        }, 0);

        if (damage) {
            const updated = getUpdatedStats({
                ...getState().battle,
                targetIds: [combatantId],
                selectedIndex: index,
                action: {
                    type: ACTION_TYPES.EFFECT,
                    damage,
                },
                getCombatantById: (id) => findCombatantData(getState, id),
            });

            dispatch(applyStatChanges(updated.map(([statUpdate]) => statUpdate)));
            dispatch(
                triggerStatChangeEvents(
                    updated.map(([statUpdate, action]) => ({
                        statUpdate,
                        source: {
                            source: action,
                            type: TRIGGER_SOURCE_TYPES.EFFECT,
                            targetId: combatantId,
                            statUpdate,
                            triggerHistory: [],
                        },
                    }))
                )
            );
        }
    };

const onEffectEventTrigger = ({
    effectEvent,
    effect,
    ownerId,
    source,
}: {
    effectEvent: EffectEventTrigger;
    effect: CombatEffect;
    ownerId: string;
    source?: TriggerSource;
}) => {
    return (dispatch, getState) => {
        if (!effectEvent) {
            return;
        }

        const { canBeSilenced, excludeEffectOwner } = effect;
        const {
            removeEffect,
            targetType,
            ability: effectEventAbility,
            conditions,
            randomOptions = {},
            usableWhileStunned,
            autoCastAbilities,
            ...other
        } = effectEvent;

        const getCalculationTargetIds = (targetType: TRIGGER_TARGET_TYPES): string[] => {
            const targetIds =
                {
                    [TRIGGER_TARGET_TYPES.EFFECT_OWNER]: [ownerId],
                    [TRIGGER_TARGET_TYPES.EFFECT_APPLIER]: [effect?.applierId],
                    [TRIGGER_TARGET_TYPES.ACTOR]: [source?.actorId],
                    [TRIGGER_TARGET_TYPES.TARGET]: [source?.targetId],
                    [TRIGGER_TARGET_TYPES.ALL_TARGETS]: source?.allTargetIds || [],
                }[targetType] || [];
            return targetIds.filter((v) => v);
        };

        const getCalculationTarget = (targetType: TRIGGER_TARGET_TYPES): CombatantInfo[] => {
            return getCalculationTargetIds(targetType).map((id) => findCombatantData(getState, id));
        };

        // Must pass parent effect conditions as well as child effectEvent conditions (if any)
        const conditionsPassed =
            passesConditions({ getCalculationTarget, proc: effect, source }) &&
            passesConditions({ getCalculationTarget, proc: effectEvent, source });

        const checkRemoveEffect = () => {
            if (removeEffect) {
                const { combatant } = findCombatantData(getState, ownerId) || {};
                const newEffects = combatant.effects.filter(({ id }) => id !== effect.id);
                dispatch(updateCombatant({ combatantId: ownerId, newProperties: { effects: newEffects } }));
            }
        };

        if (conditionsPassed) {
            checkRemoveEffect();
        } else {
            return;
        }

        const { combatant } = findCombatantData(getState, ownerId) || {};
        const cannotTrigger = (canBeSilenced && isSilenced(combatant)) || (!usableWhileStunned && isUnableToAct(combatant));
        if (cannotTrigger) {
            return;
        }

        const procSource = { ...source, source: effect, type: TRIGGER_SOURCE_TYPES.EFFECT };
        const targetIds = getCalculationTargetIds(targetType);
        const { index: i, friendlySide, friendly: targets } = findCombatantData(getState, targetIds[0]) || {};

        dispatch(checkCardActions(other as Action, source));
        const owner = findCombatantData(getState, ownerId);
        if (owner?.combatant?.isPlayer) {
            dispatch(checkHandleAutoCast({ autoCastAbilities, actor: owner.combatant, parentAbility: parent as any }));
        }

        $applyStatChanges: {
            if (!targetIds.length) {
                break $applyStatChanges;
            }

            const isAffected = (combatant: Combatant, j: number): boolean => {
                const isExcludingPrimaryTarget = excludeEffectOwner && targetType === TRIGGER_TARGET_TYPES.EFFECT_OWNER && j === i;
                return combatant?.HP > 0 && targetIds.includes(combatant?.id) && !isExcludingPrimaryTarget;
            };

            const affectedTargetIds = targets.reduce((acc, character: Combatant | null, i: number) => {
                if (isAffected(character, i)) {
                    acc.push(character.id);
                }

                return acc;
            }, []);

            const updated = getUpdatedStats({
                ...getState().battle,
                targetIds: affectedTargetIds,
                actorId: ownerId,
                action: {
                    ...other,
                    type: ACTION_TYPES.EFFECT,
                },
                source: procSource,
                getCombatantById: (id: string) => findCombatantData(getState, id),
            });

            dispatch(applyStatChanges(updated.map(([statUpdate]) => statUpdate)));
            dispatch(
                triggerStatChangeEvents(
                    updated.map(([statUpdate]) => ({
                        statUpdate,
                        source: procSource,
                    }))
                )
            );
        }

        if (!effectEventAbility) {
            return;
        }

        const ability = typeof effectEventAbility === "string" ? abilityNameMap[effectEventAbility] : effectEventAbility;
        let abilityUsed = false; // One or more actions must have been performed to trigger onUseAbility

        ability?.actions.forEach((action) => {
            const { index, side } = autoSelectActionTarget({
                initialSelectedIndex: i,
                initialSelectedSide: friendlySide,
                action,
                actorId: ownerId,
                getState,
            });

            const getCalculationTarget = (): IndexedCombatant => {
                return { combatant: getState().battle[side]?.[index], index };
            };

            const target = getState().battle[side]?.[index];
            const actor = findCombatantData(getState, ownerId)?.combatant;
            if ([TARGET_TYPES.HOSTILE, TARGET_TYPES.RANDOM_HOSTILE].includes(action.target) && !canTargetIfStealthed(actor, target)) {
                return;
            }

            // Should this be part of autoSelectActionTarget to make it a bit smarter?
            if (passesConditions({ getCalculationTarget, proc: action, source })) {
                abilityUsed = true;

                dispatch(
                    performAction({
                        action,
                        selectedIndex: index,
                        side,
                        actorId: ownerId,
                        parent: ability,
                        parentSource: {
                            ...procSource,
                            actorId: ownerId,
                        },
                    })
                );
            }
        });

        if (abilityUsed) {
            // Procs may not proc procs
            // dispatch(onUseAbility({ actor: combatant, source, ability }));
        }
    };
};

export const checkEventTrigger = ({
    combatantId,
    effectEventKey,
    source,
}: {
    combatantId: string;
    effectEventKey: EFFECT_EVENT_KEYS;
    source?: TriggerSource;
}) => {
    return (dispatch, getState) => {
        if (!combatantId) {
            return;
        }

        const { combatant } = findCombatantData(getState, combatantId) || {};
        // Dead characters generally cannot trigger effects except in case of killing blows
        if (!combatant || (effectEventKey !== EFFECT_EVENT_KEYS.onDeath && combatant.HP <= 0)) {
            return;
        }

        combatant.effects.forEach((effect: CombatEffect) => {
            const { uptime, turnsTriggerFrequency, [effectEventKey]: effectEvent, id } = effect;
            const notTriggeringSameEffect = effect.name !== (source?.source as any)?.name;
            const historyKey = [effectEventKey, id].join("-");
            const history = source?.triggerHistory || [];
            const alreadyTriggered = history.includes(historyKey);
            const isTurnToTrigger = !turnsTriggerFrequency || uptime % turnsTriggerFrequency === 0;
            if (effectEvent && !alreadyTriggered && isTurnToTrigger && notTriggeringSameEffect) {
                dispatch(
                    onEffectEventTrigger({
                        effectEvent,
                        effect,
                        ownerId: combatant.id,
                        source: {
                            ...source,
                            triggerHistory: [...history, historyKey],
                        },
                    })
                );
            }
        });
    };
};

export const applyStatChanges = (statUpdates: UpdatedCombatantStats[]) => (dispatch, getState) => {
    // Apply the stat updates first before triggering any related events
    statUpdates.forEach(
        ({ combatantId, healthDamage = 0, armor = 0, resources = 0, healing = 0, effects = [], mesos = 0, removedEffects = [] }) => {
            const { combatant: oldCombatant, friendlySide, friendly } = findCombatantData(getState, combatantId) || {};
            // Due to morph, the combatant may no longer exist
            if (!oldCombatant) {
                return;
            }

            dispatch(
                updateBattle({
                    [friendlySide]: friendly.map((combatant: Combatant | null) => {
                        if (combatant?.id !== combatantId) {
                            return combatant;
                        }

                        const combatantEffects = oldCombatant.effects.filter((effect: CombatEffect) =>
                            removedEffects.every(({ id }) => id !== effect.id)
                        );

                        return {
                            ...oldCombatant,
                            HP: Math.max(0, oldCombatant.HP - healthDamage + healing),
                            armor: oldCombatant.armor + armor,
                            resources: oldCombatant.resources + resources,
                            effects: [...combatantEffects, ...effects],
                            mesos: oldCombatant.mesos + mesos,
                        };
                    }),
                })
            );
        }
    );
};

export const triggerStatChangeEvents =
    (statChanges: { statUpdate: UpdatedCombatantStats; source?: TriggerSource }[]) => (dispatch, getState) => {
        statChanges.forEach(({ statUpdate, source }) => {
            const {
                combatantId,
                rawDamage = 0,
                healthDamage = 0,
                armor = 0,
                resources = 0,
                healing = 0,
                overhealing = 0,
                effects = [],
                isDeathBlow = false,
                rawResources = 0,
                removedEffects = [],
            } = statUpdate;
            const dispatchEvent = (effectEventKey: EFFECT_EVENT_KEYS) => {
                dispatch(checkEventTrigger({ combatantId, effectEventKey, source: { ...source, statUpdate } }));
            };

            if (resources < 0) {
                dispatchEvent(EFFECT_EVENT_KEYS.onResourcesSpent);
            }

            if (rawResources > 0) {
                // This event currently includes overcapping resources; use overcappedResources when nuance required
                dispatchEvent(EFFECT_EVENT_KEYS.onResourcesGained);
            }

            if (healing > 0) {
                dispatchEvent(EFFECT_EVENT_KEYS.onReceiveHealing);
            }

            if (overhealing > 0) {
                dispatchEvent(EFFECT_EVENT_KEYS.onReceiveOverhealing);
            }

            if (armor > 0) {
                dispatchEvent(EFFECT_EVENT_KEYS.onReceiveArmor);
            } else if (armor < 0) {
                dispatchEvent(EFFECT_EVENT_KEYS.onArmorLoss);
            }

            if (rawDamage > 0) {
                dispatchEvent(EFFECT_EVENT_KEYS.onReceiveDamage);
            }

            effects.forEach((e) => {
                // TODO probably include effects in the event trigger payload?
                dispatchEvent(EFFECT_EVENT_KEYS.onReceiveEffect);
            });

            removedEffects.forEach((e: CombatEffect) => {
                // TODO probably include effects in the event trigger payload?
                dispatchEvent(EFFECT_EVENT_KEYS.onEffectRemoved);
            });

            if (isDeathBlow) {
                dispatch(onCombatantDeath({ combatantId, triggerSource: source }));
            }
        });
    };

/**
 * Updates a combatant given its ID. This overwrites the combatant.
 */
export const updateCombatant = ({ combatantId, newProperties }: { combatantId: string; newProperties: any }) => {
    return (dispatch, getState) => {
        const { combatant: oldCombatant, friendlySide, friendly } = findCombatantData(getState, combatantId) || {};
        // Due to morph, the combatant may no longer exist
        if (!oldCombatant) {
            return;
        }

        const newCombatant = { ...oldCombatant, ...newProperties };

        dispatch(
            updateBattle({
                [friendlySide]: friendly.map((combatant: Combatant | null) => (combatant?.id !== combatantId ? combatant : newCombatant)),
            })
        );
    };
};

/**
 * Reduces the duration of effects by 1 and removes them if they have run out of time
 */
export const tickDownStatusEffects = (combatantId: string, effectClass?: EFFECT_CLASSES) => {
    return (dispatch, getState) => {
        const { combatant } = findCombatantData(getState, combatantId) || {};
        if (!combatant) {
            return;
        }
        const tickedDown = combatant.effects.map((effect) => {
            if (!effectClass || effect.class === effectClass) {
                return {
                    ...effect,
                    uptime: effect.uptime + 1,
                    duration: (isNaN(effect.duration) ? Infinity : effect.duration) - 1,
                };
            }

            return effect;
        });

        const [activeEffects, effectsEnded] = partition(({ duration = Infinity }) => duration > 0, tickedDown);
        dispatch(
            updateCombatant({
                combatantId: combatant.id,
                newProperties: {
                    effects: activeEffects,
                },
            })
        );

        effectsEnded.forEach((effect: CombatEffect) => {
            dispatch(onEffectEventTrigger({ ownerId: combatantId, effectEvent: effect.onEnd, effect }));
        });
    };
};

export const onEndTurnTriggers = (side: (Combatant | null)[]) => {
    return (dispatch) => {
        [EFFECT_TYPES.BLEED, EFFECT_TYPES.POISON, EFFECT_TYPES.BURN].forEach((dotType: EFFECT_TYPES) => {
            side.forEach((combatant: Combatant | null) => {
                if (!combatant) {
                    return;
                }

                dispatch(handleDoTs({ combatantId: combatant.id, dotType }));
            });
        });

        side.forEach((combatant: Combatant | null) => {
            if (!combatant) {
                return;
            }

            dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnEnd }));
            dispatch(tickDownStatusEffects(combatant.id, EFFECT_CLASSES.DEBUFF));
        });
    };
};

/**
 * Called when a combatant is summoned on the board, typically handling status effect events
 */
const onSummonTriggers =
    ({ summonedId, summonerId, parentSource }: { summonedId: string; summonerId: string; parentSource: TriggerSource }) =>
    (dispatch, getState) => {
        const source = { ...parentSource, targetId: summonedId, allTargetIds: [summonedId] };
        dispatch(checkEventTrigger({ combatantId: summonedId, effectEventKey: EFFECT_EVENT_KEYS.onSummoned, source }));
        const { hostile, friendly } = findCombatantData(getState, summonerId) || {};
        hostile?.forEach((combatant) => {
            if (combatant?.id !== summonedId) {
                dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onHostileSummon, source }));
            }
        });

        friendly?.forEach((combatant) => {
            if (combatant?.id !== summonedId) {
                dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onFriendlySummon, source }));
            }
        });
    };

/**
 * Handle action that summons a combatant in an empty slot on the board
 */
const checkHandleSummon = ({ action, actorId, parentSource }: { action: Action; actorId: string; parentSource: TriggerSource }) => {
    return (dispatch, getState) => {
        if (!action.summon) {
            return;
        }

        for (const summon of action.summon) {
            const { friendly, friendlySide } = findCombatantData(getState, actorId);
            const { minion, positionIndex } = summon;
            const pos = typeof positionIndex === "number" ? positionIndex : getRandomItem(getPossibleSummonIndices(friendly));
            if (typeof pos !== "number") {
                break;
            }
            const minionToSummon = getRandomItem(minion);
            const summonedMinion = createCombatant(typeof minionToSummon === "string" ? enemyNameMap[minionToSummon] : minionToSummon);

            dispatch(
                updateBattle({
                    [friendlySide]: friendly.map((combatant: Combatant | null, i) => {
                        if (combatant?.HP > 0 || i !== pos) {
                            return combatant;
                        }

                        return summonedMinion;
                    }),
                })
            );

            dispatch(
                onSummonTriggers({
                    summonedId: summonedMinion.id,
                    summonerId: actorId,
                    parentSource,
                })
            );
        }
    };
};

/**
 * Handle action that transforms combatants to another combatant, eg. Mutant Snail casts Mutate and transforms Blue Snails to Red Snails
 */
const checkHandleMorph = ({
    action,
    morphTargetIds,
    actorId,
    parentSource,
}: {
    action: Action;
    morphTargetIds: string[];
    actorId: string;
    parentSource: TriggerSource;
}) => {
    return (dispatch, getState) => {
        if (!action.morph) {
            return;
        }

        const targets = morphTargetIds
            .map((id: string) => findCombatantData(getState, id))
            .filter((combatantInfo) => combatantInfo.combatant?.HP >= 0);

        if (!targets.length) {
            return;
        }

        const type = action.morph.type;
        let transformed = {} as any;
        const morphProps = {
            targets,
            morph: action.morph,
            source: parentSource,
            summoner: findCombatantData(getState, actorId),
        };

        if (type === MORPH_TYPES.MAP) {
            transformed = getMorphMap(morphProps);
        } else {
            transformed = getMorphMerge(morphProps);
        }

        const { side, combatants, summons } = transformed;
        if (!side) {
            return;
        }

        dispatch(
            updateBattle({
                [side]: combatants,
            })
        );

        summons.forEach((summon) => {
            dispatch(
                onSummonTriggers({
                    summonedId: summon.id,
                    summonerId: actorId,
                    parentSource,
                })
            );
        });
    };
};

/**
 * Handle the induceCombatantAttack property of an action (tells minions to attack randomly)
 */
const checkInduceAttack = ({
    action,
    affectedTargetIds,
    selectedIndex,
    parentSource,
}: {
    action: Action;
    affectedTargetIds: string[];
    selectedIndex: number;
    parentSource: TriggerSource;
}) => {
    return (dispatch, getState) => {
        if (!action.induceCombatantAttack) {
            return;
        }
        shuffle(affectedTargetIds).forEach((id) => {
            const { hostileSide, combatant } = findCombatantData(getState, id) || {};
            if (!combatant.HP || isUnableToAct(combatant)) {
                return;
            }

            if (combatant.attack) {
                combatant.attack.actions.forEach((action) => {
                    dispatch(
                        performAction({
                            action: { ...action, playbackTime: 400 },
                            selectedIndex,
                            side: hostileSide,
                            actorId: id,
                            parentSource,
                        })
                    );
                });
            } else {
                dispatch(
                    performAction({
                        action: getInducedAttack(combatant),
                        selectedIndex,
                        side: hostileSide,
                        actorId: id,
                        parentSource,
                    })
                );
            }
        });
    };
};

const checkHandleVacuum = ({
    vacuum,
    side,
    selectedIndex,
    area,
}: {
    vacuum: number;
    side: BATTLEFIELD_SIDES;
    selectedIndex: number;
    area: number;
}) => {
    return (dispatch, getState) => {
        if (!vacuum) {
            return;
        }
        dispatch(
            updateBattle({
                [side]: applyVacuum({
                    characters: getState().battle[side],
                    index: selectedIndex,
                    area,
                    distance: vacuum,
                }),
            })
        );
    };
};

const checkHandleMovement = ({ movement, side, selectedIndex }) => {
    return (dispatch, getState) => {
        if (!movement) {
            return;
        }
        dispatch(
            updateBattle({
                [side]: applyMovement({
                    characters: getState().battle[side],
                    index: selectedIndex,
                    movement,
                }),
            })
        );
    };
};

const pushPlaybackQueue = ({
    action,
    actorId,
    selectedIndex,
    allTargetIndices,
    actionParent,
    side,
}: {
    action: Action;
    actorId: string;
    selectedIndex: number;
    allTargetIndices: number[];
    actionParent?: Ability | Item;
    side: BATTLEFIELD_SIDES;
}) => {
    return (dispatch, getState) => {
        const MULTI_ACTION_PLAYBACK_SPEED = 600;
        const NORMAL_ACTION_PLAYBACK_SPEED = 800;

        dispatch(
            pushEventQueue({
                ...getState().battle,
                action,
                actorId,
                id: uuid.v4(),
                selectedIndex,
                // HACK: ensure that the selected index and "extra target indices" are hit first in playback
                allTargetIndices,
                targetSide: side,
                actionParent,
                playbackTime:
                    // @ts-ignore
                    action.playbackTime || (actionParent?.actions?.length > 1 ? MULTI_ACTION_PLAYBACK_SPEED : NORMAL_ACTION_PLAYBACK_SPEED),
            } as Event)
        );
    };
};

const checkHandleAutoCast = ({
    autoCastAbilities,
    actor,
    parentAbility,
}: {
    autoCastAbilities: AutoCastAbility;
    actor: any; // This is expected to be the player
    parentAbility?: HandAbility;
}) => {
    return (dispatch, getState) => {
        if (!autoCastAbilities || !actor.class) {
            return;
        }

        const { type, amount, presetCards = [] } = autoCastAbilities;
        let cards = [];
        if (type === AUTO_CAST_ABILITY_TYPES.FROM_CLASS) {
            cards = JOB_CARD_MAP[actor.class]?.all || [];
        } else if (type === AUTO_CAST_ABILITY_TYPES.PRESET_CARDS) {
            cards = presetCards;
        }

        if (!cards.length) {
            return;
        }

        Array.from({ length: amount }).forEach(() => {
            const abilityToCast: Ability = getRandomItem(cards);
            const { resourceCost: abilityCost, selectCards } = abilityToCast;

            // selectCards on ability is currently always deplete as a prerequisite to using the ability. So deplete an ability here.
            if (selectCards) {
                const { type } = selectCards;

                const { hand, playerSide } = getState().battle;
                const player = playerSide.find((c: Combatant | null) => c?.isPlayer);

                const card = getRandomItem(
                    getCardSelection({
                        hand,
                        selectCards: selectCards,
                        selectedAbilityId: parentAbility?.instanceId,
                        player,
                    })
                );

                if (card) {
                    if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
                        dispatch(updateBattle({ hand: hand.filter((ability: HandAbility) => ability.instanceId !== card?.instanceId) }));
                        if (abilityToCast.depletedOnUse) {
                            dispatch(
                                checkEventTrigger({
                                    combatantId: actor.id,
                                    effectEventKey: EFFECT_EVENT_KEYS.onDepleteAbility,
                                    source: { source: abilityToCast, type: TRIGGER_SOURCE_TYPES.ABILITY, triggerHistory: [] },
                                })
                            );
                        }
                    } else {
                        dispatch(updateBattle({ hand: [...hand, card] }));
                    }
                }
            }

            // Auto-casted ability costs 0 unless it is a variable cost ability
            const resourceCost = abilityCost !== "x" ? 0 : abilityCost;
            dispatch(useAbility({ ability: { ...abilityToCast, resourceCost }, actorId: actor.id, isAutoCast: true }));
        });
    };
};

const performAction = ({
    action,
    selectedIndex,
    side,
    actorId,
    parent,
    parentSource,
    isAutoCast,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    actorId: string;
    parent?: Ability | Item | HandAbility;
    parentSource: TriggerSource;
    isAutoCast?: boolean;
}) => {
    return (dispatch, getState) => {
        const { combatant: actor } = findCombatantData(getState, actorId) || {};
        if (!actor) {
            return;
        }
        const targetCombatant = getState().battle[side][selectedIndex];
        const area = calculateActionArea({ action, actor, target: targetCombatant });

        const { vacuum, movement, numTargets: extraTargets = 0, excludePrimaryTarget, secondaryAction, autoCastAbilities } = action;
        dispatch(checkHandleVacuum({ vacuum, side, selectedIndex, area }));
        dispatch(checkHandleMovement({ movement, side, selectedIndex }));

        const extraTargetIndices = shuffle(
            getValidTargetIndices(getState().battle[side], {
                excludeStealth: action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK,
                excludeIndex: selectedIndex,
            })
        ).slice(0, extraTargets);

        const isAffected = (combatant: Combatant | null, i: number): boolean => {
            const inArea = combatant?.HP > 0 && [selectedIndex, ...extraTargetIndices].some((j) => Math.abs(j - i) <= area);
            if (excludePrimaryTarget) {
                return inArea && i !== selectedIndex;
            }

            return inArea;
        };

        const combatants = getState().battle[side];
        const targetIndices = combatants.reduce((acc, character: Combatant | null, i: number) => {
            if (isAffected(character, i)) {
                acc.push(i);
            }

            return acc;
        }, []);
        const targetIds = targetIndices.map((i: number) => combatants[i].id);

        const updatedStatsProps = {
            ...getState().battle,
            selectedIndex,
            action,
            targetIds,
            actorId,
            actionParent: parent,
            source: parentSource,
            getCombatantById: (id: string) => findCombatantData(getState, id),
        };

        const updated = getUpdatedStats(updatedStatsProps);

        dispatch(applyStatChanges(updated.map((update) => update[0])));
        if (secondaryAction) {
            const updatedSecondary = getUpdatedStats({
                ...updatedStatsProps,
                // Based on secondaryAction.target, but only actor recipient is supported for now
                recipientIds: [actorId],
                selectedIndex: undefined,
                action: secondaryAction,
            });
            dispatch(applyStatChanges(updatedSecondary.map((update) => update[0])));
        }

        const source = { ...parentSource, actorId, targetId: combatants[selectedIndex]?.id, allTargetIds: targetIds };
        dispatch(checkHitEffects({ actorId, action, affectedTargets: targetIds, source: { ...source, source: action } }));
        // HACK: ensure that the selected index and "extra target indices" are hit first in playback
        const allTargetIndices = uniq([selectedIndex, ...extraTargetIndices, ...targetIndices]);

        dispatch(
            pushPlaybackQueue({
                action,
                actorId,
                selectedIndex,
                allTargetIndices,
                actionParent: parent,
                side,
            })
        );

        dispatch(
            triggerStatChangeEvents(
                updated.map(([statUpdate, action]) => ({
                    statUpdate,
                    source: { ...source, source: action },
                }))
            )
        );

        dispatch(checkInduceAttack({ action, affectedTargetIds: targetIds, selectedIndex, parentSource }));
        dispatch(checkCastRadiate({ source: parentSource, action, selectedIndex, side, parent }));
        dispatch(checkCardActions(action, parentSource, isAutoCast));
        dispatch(checkHandleAutoCast({ autoCastAbilities, actor, parentAbility: parent as any }));
        dispatch(
            onAction({
                action,
                source: { ...source, targetId: combatants[selectedIndex]?.id },
            })
        );

        dispatch(
            handleOnReceiveAction({
                updatedStats: updated,
                source,
                combatants,
            })
        );
        dispatch(checkHandleSummon({ action, actorId, parentSource }));
        dispatch(checkHandleMorph({ action, morphTargetIds: targetIds, actorId, parentSource: { ...parentSource, actorId } }));
    };
};

/**
 * Sometimes, multi-action abilities have you select an enemy, but then have an additional action that eg. targets yourself.
 * This orients the target to the right place (if applicable) as actions are parsed.
 */
const autoSelectActionTarget = ({
    initialSelectedIndex,
    initialSelectedSide,
    action,
    actorId,
    getState,
}: {
    initialSelectedIndex?: number;
    initialSelectedSide?: BATTLEFIELD_SIDES;
    action: Action;
    actorId: string;
    getState: Function;
    numTargets?: number;
}) => {
    const { friendly, hostile, friendlySide, hostileSide } = findCombatantData(getState, actorId);
    const { targetArea: area = 0, target } = action;
    const noValidSelection = typeof initialSelectedIndex !== "number" || !initialSelectedSide;

    if (target === TARGET_TYPES.RANDOM_HOSTILE || (target === TARGET_TYPES.HOSTILE && noValidSelection)) {
        const targetIndices = getValidTargetIndices(hostile, { excludeStealth: true }).filter((i) => {
            return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
        });

        return {
            index: getRandomItem(targetIndices),
            side: hostileSide,
        };
    } else if (target === TARGET_TYPES.RANDOM_FRIENDLY || (target === TARGET_TYPES.FRIENDLY && noValidSelection)) {
        const targetIndices = getValidTargetIndices(friendly).filter((i) => {
            return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
        });

        return {
            index: getRandomItem(targetIndices),
            side: friendlySide,
        };
    } else if (target === TARGET_TYPES.SELF) {
        return {
            index: friendly.findIndex((ally) => ally?.id === actorId),
            side: friendlySide,
        };
    }

    return { index: initialSelectedIndex, side: initialSelectedSide };
};

/**
 * Handle the action's "radiate" effect, which is when the actor "radiates" damage or debuffs to opposing targets on the board
 * (typically the directly opposing enemy and adjacent combatants).
 */
const checkCastRadiate = ({
    action,
    selectedIndex,
    side,
    source,
    parent,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    source: TriggerSource;
    parent?: Ability | Item;
}) => {
    return (dispatch, getState) => {
        if (!action.radiate) {
            return;
        }
        dispatch(
            performAction({
                action: {
                    type: ACTION_TYPES.EFFECT,
                    ...action.radiate,
                },
                selectedIndex,
                side: side === BATTLEFIELD_SIDES.PLAYER_SIDE ? BATTLEFIELD_SIDES.ENEMY_SIDE : BATTLEFIELD_SIDES.PLAYER_SIDE, // Radiate is always to the side opposite of the combatant casting it
                actorId: getState().battle[side][selectedIndex]?.id,
                parentSource: source,
                parent,
            })
        );
    };
};

export const drawCards = ({
    effects = {},
    filters = [],
    amount,
    source,
}: {
    effects?: AbilityEffects;
    filters?: ACTION_TYPES[];
    amount: number;
    source?: TriggerSource;
}) => {
    return (dispatch, getState) => {
        const { deck, hand, discard, playerSide, enemySide } = getState().battle;
        let newDeck: Ability[] = deck.slice();
        let newHand = hand.slice();
        let newDiscard = discard.slice();
        const cardsToDraw = [];
        let deckCycled = false;

        if (filters.length) {
            // If we are looking for eg. offense cards only, the deck cannot be cycled; search the discard for remaining offense cards instead.
            // If there are not enough to fulfill the quota, it just whiffs.
            while (cardsToDraw.length !== amount) {
                const i = newDeck.findIndex((ability) => ability.actions.some((action: Action) => filters.includes(action.type)));
                if (i === -1) {
                    break;
                }

                const [card] = newDeck.splice(i, 1);
                cardsToDraw.push(card);
            }

            while (cardsToDraw.length !== amount) {
                const i = newDiscard.findIndex((ability) => ability.actions.some((action: Action) => filters.includes(action.type)));
                if (i === -1) {
                    break;
                }

                const [card] = newDiscard.splice(i, 1);
                cardsToDraw.push(card);
            }
        } else {
            // Handle normal card draw
            if (newDeck.length < amount) {
                cardsToDraw.push(...newDeck.slice());
                newDeck = shuffle(discard);
                newDiscard = [];
                cardsToDraw.push(...newDeck.splice(0, amount - cardsToDraw.length));
                deckCycled = true;
            } else {
                cardsToDraw.push(...newDeck.splice(0, amount));
            }
        }

        const newState = {
            deck: newDeck,
            hand: [
                ...newHand,
                ...cardsToDraw.map((card) => {
                    const existingEffects = card.effects || {};

                    const incomingEffects = effects || {};
                    return {
                        ...card,
                        effects: {
                            ...existingEffects,
                            ...effects,
                            damage: (existingEffects.damage || 0) + (incomingEffects.damage || 0),
                            resourceCost: (existingEffects.resourceCost || 0) + (incomingEffects.resourceCost || 0),
                        },
                    };
                }),
            ],
            discard: newDiscard,
        };

        dispatch(updateBattle(newState));
        cardsToDraw.forEach((card: Ability) => {
            if (card.onDraw?.ability) {
                const player = playerSide.find((combatant: Combatant | null) => combatant?.isPlayer);
                dispatch(useAbility({ ability: card.onDraw?.ability, actorId: player?.id }));
            }
        });
        playerSide.concat(enemySide).forEach((combatant) => {
            if (combatant) {
                dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onDrawCard, source }));
            }
        });
        if (deckCycled) {
            playerSide.concat(enemySide).forEach((combatant) => {
                if (combatant) {
                    dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onDeckCycle, source }));
                }
            });
        }
        dispatch(recalculateEffectsFromAbilities());
    };
};

/**
 * Handle effects that add card(s) to the player's hand, deck, discard.
 */
const checkCardActions = (action: Action, source: TriggerSource, isAutoCast?: boolean) => {
    return (dispatch, getState) => {
        const { drawCards: cardsToDraw, addCards, addCardsToDeck, addCardsToDiscard, currentHandEffects, selectCards } = action;
        if (cardsToDraw) {
            dispatch(drawCards({ ...cardsToDraw, source }));
        }

        if (addCards) {
            dispatch(
                updateBattle({
                    hand: [
                        ...getState().battle.hand,
                        ...addCards.map((card: Ability) => ({
                            ...card,
                            instanceId: uuid.v4(),
                        })),
                    ],
                })
            );
        }

        if (addCardsToDeck) {
            const updatedDeck = [...getState().battle.deck];
            addCardsToDeck.forEach((card: Ability) => {
                const index = getRandomInt(1, updatedDeck.length - 1);
                updatedDeck.splice(index, 0, {
                    ...card,
                    instanceId: uuid.v4(),
                });
            });
            dispatch(
                updateBattle({
                    deck: updatedDeck,
                })
            );
        }

        if (addCardsToDiscard) {
            dispatch(
                updateBattle({
                    discard: [
                        ...getState().battle.discard,
                        ...addCardsToDiscard.map((card: Ability) => ({
                            ...card,
                            instanceId: uuid.v4(),
                        })),
                    ],
                })
            );
        }

        // If we apply card effects, assume we always want to do it AFTER drawCards/addCards. Otherwise, configure the actions to be separate and in the desired order!
        if (currentHandEffects) {
            dispatch(
                updateBattle({
                    hand: getState().battle.hand.map((card: Ability) => ({ ...card, effects: { ...currentHandEffects } })),
                })
            );
        }

        if (selectCards) {
            if (isAutoCast) {
                const { type, maxAmount = 1 } = selectCards;

                const { hand, deck, playerSide } = getState().battle;
                const player = playerSide.find((c: Combatant | null) => c?.isPlayer);

                const cards = getRandomItems(
                    getCardSelection({
                        hand,
                        selectCards: selectCards,
                        selectedAbilityId: null,
                        player,
                    }),
                    maxAmount
                );

                if (cards.length) {
                    if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
                        // TODO no op for now. There are no actions which deplete from hand.
                    } else if (type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK) {
                        const chosenCardIds = cards.map(({ instanceId } = {}) => instanceId);
                        const updatedHand = hand.filter((ability) => !chosenCardIds.includes(ability.instanceId));
                        const updatedDeck = [...cards, ...deck];
                        dispatch(updateBattle({ hand: updatedHand, deck: updatedDeck }));
                    } else {
                        dispatch(updateBattle({ hand: [...hand, ...cards] }));
                    }
                }
                return;
            }

            dispatch(
                promptPlayerSelectCards({
                    selectCards,
                })
            );
        }
    };
};

const checkSummonMinion = ({
    ability,
    selectedIndex,
    side,
    actorId,
    parentSource,
}: {
    side: BATTLEFIELD_SIDES;
    selectedIndex: number;
    ability: HandAbility;
    actorId: string;
    parentSource: TriggerSource;
}) => {
    return (dispatch, getState) => {
        const { minion, removeAfterTurn, depletedOnUse } = ability;
        if (minion) {
            const summonedMinion: Combatant = createCombatant(minion);
            const newBattleProps: {
                playerSide?: (Combatant | null)[];
                enemySide?: (Combatant | null)[];
                playerSummonsInPlay?: { [id: string]: Ability };
            } = {
                [side]: getState().battle[side].map((combatant: Combatant | null, i: number) => {
                    return i === selectedIndex ? summonedMinion : combatant;
                }),
            };

            // If the actor is the player, then move the ability to the "active summons" bucket, so that it is later sent to discard if the minion is removed from play
            if (findCombatantData(getState, actorId)?.combatant?.isPlayer && !removeAfterTurn && !depletedOnUse) {
                newBattleProps.playerSummonsInPlay = { [summonedMinion.id]: ability };
            }

            dispatch(updateBattle(newBattleProps));
            dispatch(onSummonTriggers({ summonedId: summonedMinion.id, summonerId: actorId, parentSource }));
        }
    };
};

export const useAbility = ({
    ability,
    selectedIndex,
    side: initialSide,
    actorId,
    isAutoCast,
}: {
    side?: BATTLEFIELD_SIDES;
    selectedIndex?: number;
    ability: Ability | HandAbility;
    actorId: string;
    isAutoCast?: boolean;
}) => {
    return (dispatch, getState) => {
        // @ts-ignore -- We're providing a fallback so it doesn't matter whether effects exists or not
        const { resourceCost = 0, actions = [], effects = {} } = ability;
        const { combatant } = findCombatantData(getState, actorId) || {};
        const totalResourceCost = resourceCost === "x" ? combatant.resources || 0 : Math.max(0, resourceCost + (effects.resourceCost || 0));

        // Append the final resource cost. This value may be used in calculations
        ability = {
            ...ability,
            resourceCost: totalResourceCost,
        };

        const source = { type: TRIGGER_SOURCE_TYPES.ABILITY, source: ability, actorId, triggerHistory: [] };

        dispatch(
            updateCombatant({ combatantId: actorId, newProperties: { resources: Math.max(0, combatant.resources - totalResourceCost) } })
        );
        dispatch(checkSummonMinion({ ability: ability as HandAbility, selectedIndex, side: initialSide, actorId, parentSource: source }));

        const handleAction = (action: Action) => {
            const { index, side } = autoSelectActionTarget({
                initialSelectedIndex: selectedIndex,
                initialSelectedSide: initialSide,
                action,
                actorId,
                getState,
            });

            const getCalculationTarget = (calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES): IndexedCombatant => {
                if (calculationTarget === CONDITION_TARGETS.ACTOR) {
                    return findCombatantData(getState, actorId);
                }
                return { combatant: getState().battle[side]?.[index], index };
            };

            if (passesConditions({ getCalculationTarget, proc: action, source })) {
                dispatch(performAction({ action, selectedIndex: index, side, actorId, parent: ability, parentSource: source, isAutoCast }));
            }
        };

        actions.forEach(handleAction);

        const { combatant: actor } = findCombatantData(getState, actorId) || {};
        // Due to morph, the combatant may no longer exist
        if (actor) {
            dispatch(onUseAbility({ actor, source, ability }));
        }
    };
};

export const useItem = ({ itemIndex, actorId }: { itemIndex: number; actorId: string }) => {
    return (dispatch, getState) => {
        const { index, friendlySide, combatant } = findCombatantData(getState, actorId) || {};
        if (!friendlySide) {
            return;
        }

        const item = combatant.items[itemIndex];
        dispatch(
            performAction({
                action: {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    healing: item.healing,
                    resources: item.resources,
                    effects: item.effects,
                },
                actorId,
                selectedIndex: index,
                side: friendlySide,
                parent: item,
                parentSource: {
                    actorId,
                    targetId: actorId,
                    allTargetIds: [actorId],
                    source: item,
                    type: TRIGGER_SOURCE_TYPES.ITEM,
                    triggerHistory: [],
                },
            })
        );

        dispatch(
            updateCombatant({
                combatantId: actorId,
                newProperties: {
                    items: findCombatantData(getState, actorId)?.combatant?.items.filter((item, i) => i !== itemIndex),
                },
            })
        );
    };
};

const onUseAbility =
    ({ actor, source, ability }: { actor: Combatant; source: TriggerSource; ability: Ability }) =>
    (dispatch) => {
        dispatch(
            updateCombatant({
                combatantId: actor.id,
                newProperties: {
                    abilityHistory: [...actor.abilityHistory, ability],
                },
            })
        );

        dispatch(
            checkEventTrigger({
                combatantId: actor.id,
                effectEventKey: EFFECT_EVENT_KEYS.onAbility,
                source: source,
            })
        );

        if (ability.depletedOnUse) {
            dispatch(
                checkEventTrigger({
                    combatantId: actor.id,
                    effectEventKey: EFFECT_EVENT_KEYS.onDepleteAbility,
                    source: source,
                })
            );
        }
    };

/**
 * Some status effects are stored on the ability object and are gained only when holding/owning the ability.
 * These effects need to be recalculated as your hand/deck/discard change.
 * @see greaterBolt for an example
 */
export const recalculateEffectsFromAbilities = () => {
    return (dispatch, getState) => {
        const { playerSide, deck, hand, discard } = getState().battle;
        const player = playerSide.find((combatant) => combatant?.isPlayer);
        if (!player) {
            return;
        }

        const effects = player.effects.filter((e) => !e.isEffectFromHoldingAbility);
        dispatch(
            updateCombatant({
                combatantId: player.id,
                newProperties: {
                    effects: [...effects, ...aggregateAbilityEffects([...deck, ...hand, ...discard])],
                },
            })
        );
    };
};

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
    HandAbility,
    MORPH_MINION_MODIFIERS,
    MORPH_TYPES,
    TARGET_TYPES,
} from "../../ability/types";
import { playerStateSlice } from "../../character/playerReducer";
import { Combatant } from "../../character/types";
import { enemyNameMap } from "../../enemy";
import { Item } from "../../item/types";
import { getRandomItem, shuffle } from "../../utils";
import { passesConditions } from "../passesConditions";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES, Event, TRIGGER_SOURCE_TYPES } from "../types";
import {
    applyVacuum,
    calculateActionArea,
    getEnabledEffects,
    getInducedAttack,
    getPossibleSummonIndices,
    getValidTargetIndices,
    isSilenced,
    isUnableToAct,
    orientate,
} from "../utils";
import { TRIGGER_TARGET_TYPES } from "./../../ability/types";
import { createCombatant } from "./../../enemy/createEnemy";
import { BATTLE_STATES } from "./../reducer";
import { TriggerSource } from "./../types";
import { getUpdatedStats, UpdatedCombatantStats } from "./getUpdatedStats";
import { getMorphMap, getMorphMerge } from "./morphUtils";

const { drawCards, updateBattle, updateBattleState, pushEventQueue, promptPlayerSelectCards } = battleStateSlice.actions;
const { updatePlayer } = playerStateSlice.actions;

export const findCombatant = (getState, combatantId: string): Combatant | undefined => {
    const battle = getState().battle;
    return [...battle.enemySide, ...battle.playerSide].find((c) => c?.id === combatantId);
};

const handleLifeOnKill = (triggerSource?: TriggerSource) => {
    return (dispatch, getState) => {
        if (!triggerSource) {
            return;
        }

        const { type, source, actorId } = triggerSource;
        let killedBy: Combatant | undefined;
        if (type === TRIGGER_SOURCE_TYPES.EFFECT) {
            killedBy = findCombatant(getState, (source as CombatEffect)?.applierId);
        } else if (type === TRIGGER_SOURCE_TYPES.ABILITY) {
            killedBy = findCombatant(getState, actorId);
        }

        if (!killedBy || killedBy.HP <= 0) {
            return;
        }

        const lifeOnKill = getEnabledEffects(killedBy).reduce((acc, { lifeOnHit: lifeOnKill = 0 }) => acc + lifeOnKill, 0);
        if (lifeOnKill === 0) {
            return;
        }

        const { combatantIndex } = orientate({ combatantId: killedBy.id, ...getState().battle });

        const updated = getUpdatedStats({
            actorId: killedBy.id,
            targetIds: [killedBy.id],
            targetIndices: [combatantIndex],
            selectedIndex: combatantIndex,
            action: {
                type: ACTION_TYPES.EFFECT,
                healing: lifeOnKill,
            },
            source: {
                ...triggerSource,
                isProc: true,
            },
            getCombatantById: (id) => findCombatant(getState, id),
        });

        dispatch(applyStatChanges(updated.map(([statUpdate]) => statUpdate)));
        dispatch(
            triggerStatChangeEvents(
                updated.map(([statUpdate, action]) => ({
                    statUpdate,
                    // This is technically a proc in concept, but it is allowed to proc procs
                    source: { source: action, type: TRIGGER_SOURCE_TYPES.EFFECT, actorId: killedBy.id, targetId: killedBy.id },
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
        if (source.isProc || ![ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK].includes(action.type)) {
            return;
        }

        const actor = findCombatant(getState, actorId);
        if (!actor || actor?.HP <= 0) {
            return;
        }

        const { combatantIndex } = orientate({ combatantId: actorId, ...getState().battle });
        const lifeOnHit = getEnabledEffects(actor).reduce((acc, { lifeOnHit = 0 }) => acc + lifeOnHit, 0);
        if (lifeOnHit) {
            const updated = getUpdatedStats({
                actorId: actor.id,
                targetIds: [actor.id],
                targetIndices: [combatantIndex],
                selectedIndex: combatantIndex,
                action: {
                    type: ACTION_TYPES.EFFECT,
                    healing: lifeOnHit * affectedTargets.length,
                },
                source: {
                    ...source,
                    isProc: true,
                },
                getCombatantById: (id) => findCombatant(getState, id),
            });

            dispatch(applyStatChanges(updated.map(([statUpdate]) => statUpdate)));
            dispatch(
                triggerStatChangeEvents(
                    updated.map(([statUpdate, action]) => ({
                        statUpdate,
                        source: { isProc: true, source: action, type: TRIGGER_SOURCE_TYPES.EFFECT, actorId, targetId: actorId },
                    }))
                )
            );
        }

        const totalThorns = affectedTargets.reduce((acc, id: string) => {
            const combatant = findCombatant(getState, id);
            getEnabledEffects(combatant).forEach(({ thorns = 0 }) => (acc += thorns));
            return acc;
        }, 0);

        if (totalThorns) {
            const updated = getUpdatedStats({
                targetIds: [actor.id],
                targetIndices: [combatantIndex],
                action: {
                    type: ACTION_TYPES.EFFECT,
                    damage: totalThorns,
                },
                source: {
                    ...source,
                    isProc: true,
                },
                getCombatantById: (id) => findCombatant(getState, id),
            });

            dispatch(applyStatChanges(updated.map(([statUpdate]) => statUpdate)));
            dispatch(
                triggerStatChangeEvents(
                    updated.map(([statUpdate, action]) => ({
                        statUpdate,
                        source: { isProc: true, source: action, type: TRIGGER_SOURCE_TYPES.EFFECT, actorId, targetId: actorId },
                    }))
                )
            );
        }
    };
};

const onCombatantDeath = ({ combatantId, triggerSource }: { combatantId: string; triggerSource: TriggerSource }) => {
    return (dispatch, getState) => {
        dispatch(checkEventTrigger({ combatantId, effectEventKey: EFFECT_EVENT_KEYS.onDeath, source: triggerSource }));

        const { friendly, hostile, combatant } = orientate({ combatantId, ...getState().battle }) || {};
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

const onReceiveAction = ({ action, source }: { action: Action; source?: TriggerSource }) => {
    return (dispatch) => {
        if (action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK) {
            dispatch(
                checkEventTrigger({
                    combatantId: source?.targetId,
                    effectEventKey: EFFECT_EVENT_KEYS.onReceiveAttack,
                    source,
                })
            );
        }
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

        const { turnHistory } = findCombatant(getState, actorId);

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
        const { canBeSilenced, excludeEffectOwner } = effect;
        const { removeEffect, targetType, ability, conditions, randomOptions = {}, usableWhileStunned, ...other } = effectEvent;

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

        const getCalculationTarget = (targetType: TRIGGER_TARGET_TYPES) => {
            return getCalculationTargetIds(targetType).map((id) => findCombatant(getState, id));
        };

        // Must pass parent effect conditions as well as child effectEvent conditions (if any)
        const conditionsPassed =
            passesConditions({ getCalculationTarget, proc: effect }) && passesConditions({ getCalculationTarget, proc: effectEvent });

        const checkRemoveEffect = () => {
            if (removeEffect) {
                const newEffects = findCombatant(getState, ownerId).effects.filter(({ id }) => id !== effect.id);
                dispatch(updateCombatant({ combatantId: ownerId, newProperties: { effects: newEffects } }));
            }
        };
        const combatant = findCombatant(getState, ownerId);

        if (conditionsPassed) {
            checkRemoveEffect();
        } else {
            return;
        }

        const cannotTrigger = (canBeSilenced && isSilenced(combatant)) || (!usableWhileStunned && isUnableToAct(combatant));
        if (cannotTrigger) {
            return;
        }

        const procSource = { ...source, source: effect, type: TRIGGER_SOURCE_TYPES.EFFECT, isProc: true };
        const targetIds = getCalculationTargetIds(targetType);
        const {
            friendly: combatants,
            combatantIndex: i,
            friendlySide,
        } = orientate({ combatantId: targetIds[0], ...getState().battle }) || {};

        $applyStatChanges: {
            if (!targetIds.length) {
                break $applyStatChanges;
            }

            const isAffected = (combatant: Combatant, j: number): boolean => {
                const isExcludingPrimaryTarget = excludeEffectOwner && targetType === TRIGGER_TARGET_TYPES.EFFECT_OWNER && j === i;
                return combatant?.HP > 0 && targetIds.includes(combatant?.id) && !isExcludingPrimaryTarget;
            };

            const targetIndices = combatants.reduce((acc, character: Combatant | null, i: number) => {
                if (isAffected(character, i)) {
                    acc.push(i);
                }

                return acc;
            }, []);

            const updated = getUpdatedStats({
                targetIds,
                targetIndices,
                actorId: ownerId,
                action: {
                    ...other,
                    type: ACTION_TYPES.EFFECT,
                },
                source: procSource,
                getCombatantById: (id: string) => findCombatant(getState, id),
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

        ability?.actions.forEach((action) => {
            const { index, side } = autoSelectActionTarget({
                initialSelectedIndex: i,
                initialSelectedSide: friendlySide,
                action,
                actorId: ownerId,
                getState,
            });

            const getCalculationTarget = () => {
                return getState().battle[side]?.[index] || null;
            };

            // Should this be part of autoSelectActionTarget to make it a bit smarter?
            if (passesConditions({ getCalculationTarget, proc: action })) {
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
        // At the moment, procs may not proc procs unless it is a kill event.
        const killEvents = [EFFECT_EVENT_KEYS.onDeath, EFFECT_EVENT_KEYS.onFriendlyDeath, EFFECT_EVENT_KEYS.onHostileDeath];
        if (!combatantId || (source?.isProc && !killEvents.includes(effectEventKey))) {
            return;
        }

        const combatant = findCombatant(getState, combatantId);
        // Dead characters generally cannot trigger effects except in case of killing blows
        if (!combatant || (effectEventKey !== EFFECT_EVENT_KEYS.onDeath && combatant.HP <= 0)) {
            return;
        }

        combatant.effects.forEach((effect: CombatEffect) => {
            const { uptime, turnsTriggerFrequency, [effectEventKey]: effectEvent } = effect;
            if (effectEvent && (!turnsTriggerFrequency || uptime % turnsTriggerFrequency === 0)) {
                dispatch(
                    onEffectEventTrigger({
                        effectEvent,
                        effect,
                        ownerId: combatant.id,
                        source,
                    })
                );
            }
        });
    };
};

const applyStatChanges = (statUpdates: UpdatedCombatantStats[]) => (dispatch, getState) => {
    // Apply the stat updates first before triggering any related events
    statUpdates.forEach(({ combatantId, healthDamage, armor, resources, healing, effects }) => {
        const oldCombatant = findCombatant(getState, combatantId);
        // Due to morph, the combatant may no longer exist
        if (!oldCombatant) {
            return;
        }
        const { enemySide, playerSide } = getState().battle;
        const { friendly, friendlySide } = orientate({ combatantId, enemySide, playerSide });

        dispatch(
            updateBattle({
                [friendlySide]: friendly.map((combatant: Combatant | null) => {
                    if (combatant?.id !== combatantId) {
                        return combatant;
                    }

                    return {
                        ...oldCombatant,
                        HP: Math.max(0, oldCombatant.HP - healthDamage + healing),
                        armor: oldCombatant.armor + armor,
                        resources: oldCombatant.resources + resources,
                        effects: [...oldCombatant.effects, ...effects],
                    };
                }),
            })
        );
    });
};

const triggerStatChangeEvents = (statChanges: { statUpdate: UpdatedCombatantStats; source: TriggerSource }[]) => (dispatch, getState) => {
    statChanges.forEach(({ statUpdate, source }) => {
        const { combatantId, rawDamage, healthDamage, armor, resources, healing, effects, isDeathBlow } = statUpdate;
        const dispatchEvent = (effectEventKey: EFFECT_EVENT_KEYS) => {
            dispatch(checkEventTrigger({ combatantId, effectEventKey, source }));
        };

        if (resources < 0) {
            dispatchEvent(EFFECT_EVENT_KEYS.onResourcesSpent);
        }

        if (healing > 0) {
            dispatchEvent(EFFECT_EVENT_KEYS.onReceiveHealing);
        }

        if (armor > 0) {
            dispatchEvent(EFFECT_EVENT_KEYS.onReceiveArmor);
        }

        if (rawDamage > 0) {
            dispatchEvent(EFFECT_EVENT_KEYS.onReceiveDamage);
        }

        effects.forEach((e) => {
            // TODO probably include effects in the event trigger payload?
            dispatchEvent(EFFECT_EVENT_KEYS.onReceiveEffect);
        });

        /**
            effectsRemoved.forEach((e: CombatEffect) => {
                // TODO probably include effects in the event trigger payload?
                // Removal should only apply to dispels?
                dispatchEvent(EFFECT_EVENT_KEYS.onEffectRemoved);
                if (e.onEnd) {
                    dispatch(
                        onEffectEventTrigger({
                            effectEvent: e.onEnd,
                            effect: e,
                            ownerId: combatantId,
                        })
                    );
                }
            });
            */

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
        const oldCombatant = findCombatant(getState, combatantId);
        // Due to morph, the combatant may no longer exist
        if (!oldCombatant) {
            return;
        }
        const { enemySide, playerSide } = getState().battle;
        const { friendly, friendlySide } = orientate({ combatantId, enemySide, playerSide });

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
        const combatant = findCombatant(getState, combatantId);
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
            onEffectEventTrigger({ ownerId: combatantId, effectEvent: effect.onEnd, effect });
        });
    };
};

export const onEndTurnTriggers = (side: (Combatant | null)[]) => {
    return (dispatch) => {
        side.forEach((combatant: Combatant | null) => {
            if (!combatant) {
                return;
            }

            dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnEnd }));
            dispatch(tickDownStatusEffects(combatant.id, EFFECT_CLASSES.DEBUFF));
        });
    };
};

const onSummonTriggers =
    ({ summonedId, summonerId, parentSource }: { summonedId: string; summonerId: string; parentSource: TriggerSource }) =>
    (dispatch, getState) => {
        const source = { ...parentSource, targetId: summonedId, allTargetIds: [summonedId], isProc: false };
        dispatch(checkEventTrigger({ combatantId: summonedId, effectEventKey: EFFECT_EVENT_KEYS.onSummoned, source }));
        const { hostile, friendly } = orientate({ combatantId: summonerId, ...getState().battle }) || {};
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

const checkHandleSummon = ({ action, actorId, parentSource }: { action: Action; actorId: string; parentSource: TriggerSource }) => {
    return (dispatch, getState) => {
        if (!action.summon) {
            return;
        }

        for (const summon of action.summon) {
            const { friendly, friendlySide } = orientate({ combatantId: actorId, ...getState().battle });
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

        const targets = morphTargetIds.map((id) => findCombatant(getState, id));
        const type = action.morph.type;
        let transformed = {} as any;
        const morphProps = { targets, battlefield: getState().battle, morph: action.morph };
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
            const { hostileSide, combatant } = orientate({ combatantId: id, ...getState().battle }); // Make sure combatant's not stale
            if (!combatant.HP) {
                return;
            }
            dispatch(
                performAction({
                    action: getInducedAttack(combatant),
                    selectedIndex,
                    side: hostileSide,
                    actorId: id,
                    parentSource,
                })
            );
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

const performAction = ({
    action,
    selectedIndex,
    side,
    actorId,
    parent,
    parentSource,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    actorId: string;
    parent?: Ability | Item;
    parentSource: TriggerSource;
}) => {
    return (dispatch, getState) => {
        const actor = findCombatant(getState, actorId);
        if (!actor) {
            return;
        }
        const area = calculateActionArea({ action, actor });

        const { vacuum, numTargets: extraTargets = 0, excludePrimaryTarget } = action;
        dispatch(checkHandleVacuum({ vacuum, side, selectedIndex, area }));
        dispatch(checkHandleSummon({ action, actorId, parentSource }));

        const extraTargetIndices = shuffle(
            getValidTargetIndices(getState().battle[side], {
                excludeStealth: action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK,
                excludeIndex: selectedIndex,
            })
        ).slice(0, extraTargets);

        const isAffected = (combatant: Combatant | null, i: number): boolean => {
            const inArea = combatant && [selectedIndex, ...extraTargetIndices].some((j) => Math.abs(j - i) <= area);
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

        const updated = getUpdatedStats({
            targetIds,
            targetIndices,
            selectedIndex,
            action,
            actorId,
            actionParent: parent,
            source: parentSource,
            getCombatantById: (id: string) => findCombatant(getState, id),
        });

        const source = { ...parentSource, actorId, targetId: combatants[selectedIndex]?.id, allTargetIds: targetIds };
        dispatch(applyStatChanges(updated.map((update) => update[0])));
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
        dispatch(checkCastRadiate({ source: parentSource, action, selectedIndex, side }));
        dispatch(checkCardActions(action, actorId));
        dispatch(
            onAction({
                action,
                source: { ...source, targetId: combatants[selectedIndex]?.id },
            })
        );

        updated.forEach(([updated, action]) => {
            dispatch(
                onReceiveAction({
                    action,
                    source: { ...source, targetId: updated.combatantId },
                })
            );
        });
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
    const { enemySide, playerSide } = getState().battle;
    const { friendly, hostile, friendlySide, hostileSide } = orientate({ combatantId: actorId, enemySide, playerSide });
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

const checkCastRadiate = ({
    action,
    selectedIndex,
    side,
    source,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    source: TriggerSource;
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
            })
        );
    };
};

const checkCardActions = (action: Action, actorId: string) => {
    return (dispatch, getState) => {
        // "Card" mechanics are only applicable to the player
        if (!findCombatant(getState, actorId)?.isPlayer) {
            return;
        }
        const { drawCards: cardsToDraw, addCards, currentHandEffects, selectCards } = action;
        if (cardsToDraw) {
            dispatch(drawCards(cardsToDraw));
        }

        if (addCards) {
            dispatch(
                updateBattle({
                    hand: [
                        ...getState().battle.hand,
                        ...addCards.map((card) => ({
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
            if (findCombatant(getState, actorId).isPlayer && !removeAfterTurn && !depletedOnUse) {
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
}: {
    side: BATTLEFIELD_SIDES;
    selectedIndex: number;
    ability: Ability | HandAbility;
    actorId: string;
}) => {
    return (dispatch, getState) => {
        // @ts-ignore -- We're providing a fallback so it doesn't matter whether effects exists or not
        const { resourceCost = 0, actions = [], effects = {} } = ability;
        const combatant = findCombatant(getState, actorId);
        const totalResourceCost = resourceCost === "x" ? combatant.resources || 0 : Math.max(0, resourceCost + (effects.resourceCost || 0));

        // Append the final resource cost. This value may be used in calculations
        ability = {
            ...ability,
            resourceCost: totalResourceCost,
        };

        const source = { type: TRIGGER_SOURCE_TYPES.ABILITY, source: ability, isProc: false, actorId };

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

            const getCalculationTarget = () => {
                return getState().battle[side]?.[index] || null;
            };

            if (passesConditions({ getCalculationTarget, proc: action })) {
                dispatch(performAction({ action, selectedIndex: index, side, actorId, parent: ability, parentSource: source }));
            }
        };

        actions.forEach(handleAction);

        const actor = findCombatant(getState, actorId);
        // Due to morph, the combatant may no longer exist
        if (!actor) {
            return;
        }

        dispatch(
            updateCombatant({
                combatantId: actorId,
                newProperties: {
                    abilityHistory: [...actor.abilityHistory, ability],
                },
            })
        );

        dispatch(
            checkEventTrigger({
                combatantId: actorId,
                effectEventKey: EFFECT_EVENT_KEYS.onAbility,
                source: source,
            })
        );
    };
};

export const useItem = ({ itemIndex, actorId }: { itemIndex: number; actorId: string }) => {
    return (dispatch, getState) => {
        const { combatantIndex, friendlySide, combatant } = orientate({ combatantId: actorId, ...getState().battle }) || {};
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
                selectedIndex: combatantIndex,
                side: friendlySide,
                parent: item,
                parentSource: {
                    actorId,
                    targetId: actorId,
                    allTargetIds: [actorId],
                    source: item,
                    type: TRIGGER_SOURCE_TYPES.ITEM,
                },
            })
        );

        dispatch(
            updateCombatant({
                combatantId: actorId,
                newProperties: {
                    items: findCombatant(getState, actorId).items.filter((item, i) => i !== itemIndex),
                },
            })
        );
    };
};

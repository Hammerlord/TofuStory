import { cloneDeep, uniq } from "lodash";
import { partition } from "ramda";
import * as uuid from "uuid";
import { getUpgradeCard } from "../../Menu/utils";
import { JOB_CARD_MAP } from "../../ability";
import { getAbilityUpgradedFromEffects, isOffensiveAbility, isOffensiveAction, isSupportAbility } from "../../ability/AbilityView/utils";
import { tributeSummonBuff } from "../../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    AUTO_CAST_ABILITY_TYPES,
    Ability,
    AbilityEffect,
    Action,
    ActionOptionalProperties,
    AutoCastAbility,
    CONDITION_TARGETS,
    CardPileType,
    CombatAbility,
    CombatEffect,
    EFFECT_CLASSES,
    EFFECT_EVENT_KEYS,
    EFFECT_TYPES,
    Effect,
    EffectEventTrigger,
    MORPH_TYPES,
    Minion,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
} from "../../ability/types";
import { getNextTelegraphedAbility } from "../../character/Telegraph";
import { previewAction } from "../../character/getAbilityPreviews";
import { playerStateSlice } from "../../character/playerReducer";
import { Combatant, Player } from "../../character/types";
import { abilityNameMap, enemyNameMap } from "../../enemy";
import { Item } from "../../item/types";
import { getRandomInt, getRandomItem, passesChance, shuffle } from "../../utils";
import {
    MULTI_ACTION_PLAYBACK_SPEED,
    NORMAL_ACTION_PLAYBACK_SPEED,
    RANGED_ACTION_PLAYBACK_SPEED,
    RICOCHET_ACTION_PLAYBACK_SPEED,
    SUMMON_DELAY,
    dotAbilityMap,
    dotDamageMap,
} from "../constants";
import { passesConditions, passesValueComparison } from "../passesConditions";
import { BattleState, battleStateSlice, BattleStatistics } from "../reducer";
import getCardSelection from "../selectCardUtils";
import { BATTLEFIELD_SIDES, CombatantInfo, Displacement, Event, TRIGGER_SOURCE_TYPES, TriggerSource } from "../types";
import {
    applyVacuum,
    calculateActionArea,
    canTargetIfStealthed,
    getAbilityResourceCost,
    getEnabledEffects,
    getInducedAttack,
    getMultiplier,
    getPossibleMoveIndices,
    getPossibleSummonIndices,
    getValidTargetIndices,
    hasTruesight,
    isSilenced,
    isStunnedOrFrozen,
    isTurnActionPrevented,
    isTurnToTrigger,
} from "../utils";
import { TRIGGER_TARGET_TYPES } from "./../../ability/types";
import { createCombatant } from "./../../enemy/createEnemy";
import { BATTLE_STATES } from "./../reducer";
import { ActionContext } from "./../types";
import {
    applyAbilityEffectsOnDraw,
    applyAbilityEventEffects,
    checkCardActions,
    deleteCard,
    depleteAbilities,
    drawCards,
    handleDrawOriginalAbility,
} from "./cardActions";
import { getEnemyMoveOrder, getUpdatedBattleActionTargets, requeueRecentlyUsedAbility } from "./enemyTurn";
import { UpdatedCombatantStats, getUpdatedStats } from "./getUpdatedStats";
import { getMorphMap, getMorphMerge } from "./morphUtils";
import { PlaybackCollector, aggregateStatUpdates, playbackCollector } from "./playbackCollector";
import { handleDiscard } from "./playerTurn";

const { updateBattle, updateBattleState, pushEventQueue } = battleStateSlice?.actions || {};
const { updatePlayer } = playerStateSlice?.actions || {};

/**
 * Helper to get the combatant data and additional details such as what slot index it sits on the board, who its allies and enemies are.
 * @returns {CombatantInfo|undefined} - Undefined if combatant associated to the UUID not found on the board
 */
export const findCombatantData = (battle: BattleState, combatantId?: string): CombatantInfo | undefined => {
    if (!battle || !combatantId) {
        return;
    }

    const { playerSide, enemySide } = battle;
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

const handleOnKill = (context: ActionContext) => {
    return (dispatch, getState) => {
        const source = context?.sourceChain?.at(-1);
        if (!source) {
            return;
        }
        const { actorId, targetId } = source;
        const killedByInfo = findCombatantData(getState().battle, actorId);
        const { combatant: killedBy, index, friendly } = killedByInfo || {};
        if (!killedBy || killedBy.HP <= 0) {
            return;
        }

        const killedInfo = findCombatantData(getState().battle, targetId);
        const isKilledTargetThreatening = Boolean(killedInfo?.combatant?.abilities?.[0]);

        if (isKilledTargetThreatening) {
            const lifeOnKill = getEnabledEffects({ combatantInfo: killedByInfo }).reduce((acc, { lifeOnKill = 0 }) => acc + lifeOnKill, 0);

            if (lifeOnKill > 0) {
                const updated = getUpdatedStats({
                    ...getState().battle,
                    actorId: killedBy.id,
                    targetIds: [killedBy.id],
                    selectedIndex: index,
                    action: {
                        type: ACTION_TYPES.EFFECT,
                        healing: lifeOnKill,
                    },
                    context: {
                        ...context,
                    },
                    getCombatantById: (id) => findCombatantData(getState().battle, id),
                });

                dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));
                const lifeOnKillSource = {
                    type: TRIGGER_SOURCE_TYPES.EFFECT,
                    actorId: killedBy.id,
                    targetId: killedBy.id,
                    triggerHistory: [],
                };

                dispatch(
                    triggerStatChangeEvents(
                        updated.map(({ statUpdate, action }) => ({
                            statUpdate,
                            context: {
                                ...context,
                                sourceChain: [...(context?.sourceChain || []), { ...lifeOnKillSource, action, statUpdate }],
                            },
                        }))
                    )
                );
            }
        }

        dispatch(
            checkEventTrigger({
                combatantId: killedBy.id,
                effectEventKey: EFFECT_EVENT_KEYS.onKill,
                context: { ...context },
            })
        );

        friendly.forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onFriendlyKill,
                        context: { ...context },
                    })
                );
            }
        });
    };
};

const getHitEffects = ({
    affectedTargets,
    actorId,
    action,
    context,
    getState,
}: {
    affectedTargets: string[];
    actorId: string;
    action: Action;
    context: ActionContext;
    getState;
}): { statUpdate: UpdatedCombatantStats; action: Action }[][] => {
    if (![ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK].includes(action.type)) {
        return [];
    }

    const actorInfo = findCombatantData(getState().battle, actorId);
    const { combatant: actor, index } = actorInfo || {};
    if (!actor || actor?.HP <= 0) {
        return [];
    }

    const results = [];
    const lifeOnHit = getEnabledEffects({ combatantInfo: actorInfo }).reduce(
        (acc, { lifeOnHit = 0, stacks = 1 }) => acc + lifeOnHit * stacks,
        0
    );

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
            context: context,
            getCombatantById: (id) => findCombatantData(getState().battle, id),
        });

        results.push(updated);
    }

    const totalThorns = affectedTargets.reduce((acc, id: string) => {
        const combatantData = findCombatantData(getState().battle, id);
        getEnabledEffects({ combatantInfo: combatantData }).forEach(({ thorns = 0, stacks = 1 }) => (acc += thorns * stacks));
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
            context: context,
            getCombatantById: (id) => findCombatantData(getState().battle, id),
        });

        results.push(updated);
    }

    const totalMesoSteal = getEnabledEffects({ combatantInfo: actorInfo }).reduce(
        (acc, { mesoSteal = 0, stacks }) => acc + mesoSteal * stacks,
        0
    );

    if (totalMesoSteal) {
        const updatedTargets = getUpdatedStats({
            ...getState().battle,
            actorId: actor.id,
            targetIds: affectedTargets,
            selectedIndex: index,
            action: {
                type: ACTION_TYPES.EFFECT,
                stealMesos: totalMesoSteal * affectedTargets.length,
            },
            context: context,
            getCombatantById: (id) => findCombatantData(getState().battle, id),
        });

        const totalMesosGained = updatedTargets.reduce((acc, { statUpdate }) => {
            return acc + Math.abs(statUpdate.mesos);
        }, 0);

        const updatedActor = getUpdatedStats({
            ...getState().battle,
            actorId: actor.id,
            targetIds: [actor.id],
            selectedIndex: index,
            action: {
                type: ACTION_TYPES.EFFECT,
                mesos: totalMesosGained,
            },
            context: context,
            getCombatantById: (id) => findCombatantData(getState().battle, id),
        });

        results.push(updatedTargets, updatedActor);
    }

    return results;
};

const onCombatantDeath = ({ combatantId, context }: { combatantId: string; context?: ActionContext }) => {
    return (dispatch, getState) => {
        const deadCombatant = findCombatantData(getState().battle, combatantId);
        const { friendly, hostile, combatant, friendlySide } = deadCombatant || {};
        const source = context?.sourceChain?.at(-1);
        if (isActorPlayerSide({ side: getState().battle.playerSide, source })) {
            dispatch(
                updateBattle({
                    totalKills: getState().battle.totalKills + 1,
                })
            );
        }

        if (friendly) {
            // Remove all effects that have durations on them, reset resources and casting
            // Order matters: do not remove status effects gained from onDeath event
            dispatch(
                updateBattle({
                    [friendlySide]: friendly.map((combatant) => {
                        if (combatant?.id === combatantId) {
                            return {
                                ...combatant,
                                effects: combatant.effects.filter((e) => {
                                    const hasDuration = typeof e.duration === "number" && e.duration !== Infinity;
                                    return (
                                        (e.class !== EFFECT_CLASSES.DEBUFF && !hasDuration) ||
                                        e.persistsWhenDead ||
                                        e[EFFECT_EVENT_KEYS.onDeath]
                                    ); // Still allow onDeath effects to play out
                                }),
                                casting: null,
                                resources: 0,
                                armor: 0,
                            };
                        }

                        return combatant;
                    }),
                })
            );
        }

        dispatch(checkEventTrigger({ combatantId, effectEventKey: EFFECT_EVENT_KEYS.onDeath, context: context }));

        if (!combatant || !friendly) {
            return;
        }

        const dispatchEvent = (combatant: Combatant | null, effectEventKey: EFFECT_EVENT_KEYS) => {
            const { id } = combatant || {};
            if (id !== combatantId) {
                dispatch(checkEventTrigger({ combatantId: id, effectEventKey, context: context }));
            }
        };

        dispatch(handleOnKill(context));
        dispatch(checkUpdatePlayerMoneyOnKill({ deadCombatantInfo: deadCombatant, context: context }));

        friendly.forEach((combatant: Combatant | null) => {
            dispatchEvent(combatant, EFFECT_EVENT_KEYS.onFriendlyDeath);
        });

        hostile.forEach((combatant: Combatant | null) => {
            dispatchEvent(combatant, EFFECT_EVENT_KEYS.onHostileDeath);
        });

        const { playerSide } = getState().battle;

        const player = playerSide.find((c: Combatant | null) => c?.isPlayer);
        if (player.HP <= 0) {
            dispatch(updateBattleState(BATTLE_STATES.DEFEAT));
            dispatch(updatePlayer(player));
            return;
        }
    };
};

const checkUpdatePlayerMoneyOnKill = ({
    deadCombatantInfo: deadCombatantInfo,
    context,
}: {
    deadCombatantInfo: CombatantInfo;
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        if (!deadCombatantInfo) {
            return;
        }

        if (deadCombatantInfo.friendlySide === BATTLEFIELD_SIDES.PLAYER_SIDE) {
            return;
        }

        const combatant = deadCombatantInfo.combatant;

        if (!combatant?.mesos) {
            return;
        }

        const isLifeLink = combatant.effects.some((e) => e.type === EFFECT_TYPES.LIFE_LINK);
        if (isLifeLink) {
            // This should be handled at the end of the combat since we don't want to potentially retrigger multiple money drops from lifelink
            return;
        }

        const moneyAction = {
            mesos: combatant.mesos || 0,
            type: ACTION_TYPES.NONE,
        };

        const battle: BattleState = getState().battle;
        const player = battle.playerSide.find((c) => c?.isPlayer);
        if (!player) {
            return;
        }

        const updated = getUpdatedStats({
            ...getState().battle,
            targetIds: [player.id],
            actorId: deadCombatantInfo,
            action: moneyAction,
            context: context,
            getCombatantById: (id: string) => findCombatantData(getState().battle, id),
        });
        dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));
    };
};

const handleOnReceiveAction = ({
    updatedStats,
    context: context,
    combatants,
}: {
    updatedStats: { statUpdate; action }[];
    context?: ActionContext;
    combatants: (Combatant | null)[];
}) => {
    return (dispatch) => {
        const isAttack = (action: Action) => [ACTION_TYPES.RANGE_ATTACK, ACTION_TYPES.ATTACK].includes(action.type);
        const prevSource = context?.sourceChain?.at(-1);
        updatedStats.forEach(({ statUpdate, action }) => {
            if (!isAttack(action)) {
                return;
            }

            const source: TriggerSource = { ...prevSource, source: action, targetId: statUpdate.combatantId, statUpdate };
            dispatch(
                checkEventTrigger({
                    combatantId: statUpdate.combatantId,
                    effectEventKey: EFFECT_EVENT_KEYS.onReceiveAttack,
                    context: { ...context, sourceChain: [...(context?.sourceChain || []), source] },
                })
            );
        });

        combatants.forEach((combatant: Combatant | null) => {
            if (!combatant) {
                return;
            }

            updatedStats.forEach(({ statUpdate, action }) => {
                if (!isAttack(action)) {
                    return;
                }

                const source: TriggerSource = { ...prevSource, source: action, targetId: statUpdate.combatantId, statUpdate };
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onFriendlyReceiveAttack,
                        context: { ...context, sourceChain: [...(context?.sourceChain || []), source] },
                    })
                );
            });
        });
    };
};

const onAction = ({ action, context: context }: { action: Action; context?: ActionContext }) => {
    return (dispatch, getState) => {
        const actorId = context?.sourceChain?.at(-1)?.actorId;
        const { combatant, hostile } = findCombatantData(getState().battle, actorId) || {};

        if (action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK) {
            dispatch(
                checkEventTrigger({
                    combatantId: actorId,
                    effectEventKey: EFFECT_EVENT_KEYS.onAttack,
                    context: context,
                })
            );

            if (Array.isArray(hostile)) {
                hostile.forEach((combatant) => {
                    if (combatant?.id) {
                        dispatch(
                            checkEventTrigger({
                                combatantId: combatant.id,
                                effectEventKey: EFFECT_EVENT_KEYS.onHostileAttack,
                                context: context,
                            })
                        );
                    }
                });
            }
        }

        const turnHistory = combatant?.turnHistory || [];

        dispatch(
            updateCombatant({
                combatantId: actorId,
                newProperties: {
                    turnHistory: [...turnHistory, { ...action, parent: context?.sourceChain?.at(-1)?.source }],
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
export const handleDoTs =
    ({ combatantIds, side, context }: { combatantIds: string[]; side: BATTLEFIELD_SIDES; context: ActionContext }) =>
    (dispatch, getState) => {
        [EFFECT_TYPES.BLEED, EFFECT_TYPES.POISON, EFFECT_TYPES.BURN].map((dotType) => {
            const updatedStats: { statUpdate: UpdatedCombatantStats; action: Action; actorId?: string }[] = [];

            combatantIds.forEach((combatantId) => {
                // Perform another lookup on combatant info as it may have changed between effect triggers
                const combatantInfo = findCombatantData(getState().battle, combatantId);
                const { combatant, index } = combatantInfo || {};
                if (!combatant?.HP) {
                    return;
                }
                const activeEffects = getEnabledEffects({ combatantInfo });
                const matchingDoT = activeEffects.find((effect) => effect.type === dotType);
                if (!matchingDoT) {
                    return;
                }

                const dotStacks = matchingDoT.stacks || 1;
                const damage = dotStacks * dotDamageMap[dotType];

                if (!damage) {
                    return;
                }

                const updated = getUpdatedStats({
                    ...getState().battle,
                    targetIds: [combatantId],
                    actorId: matchingDoT.applierId,
                    selectedIndex: index,
                    action: {
                        type: ACTION_TYPES.EFFECT,
                        flatDamage: damage,
                        bypassArmor: true,
                    },
                    getCombatantById: (id) => findCombatantData(getState().battle, id),
                });

                dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));
                updatedStats.push(...updated);
            });

            if (!updatedStats.length) {
                return;
            }
            const aggregatedStatUpdates = updatedStats.reduce((acc, stats: { statUpdate: UpdatedCombatantStats; action: Action }) => {
                const { statUpdate } = stats;
                acc[statUpdate.combatantId] = statUpdate;
                return acc;
            }, {});

            dispatch(
                enqueueEvent({
                    targetSide: side,
                    statUpdates: aggregatedStatUpdates,
                    // Hack: this is for displaying the dot type in the ability notification banner
                    actionParent: dotAbilityMap[dotType],
                    context: context,
                })
            );

            dispatch(
                triggerStatChangeEvents(
                    updatedStats.map(({ statUpdate, action, actorId }) => ({
                        statUpdate,
                        context: {
                            ...context,
                            sourceChain: [
                                ...(context?.sourceChain || []),
                                {
                                    source: action,
                                    actorId,
                                    targetId: statUpdate.combatantId,
                                    statUpdate,
                                    type: TRIGGER_SOURCE_TYPES.ACTION,
                                },
                            ],
                        },
                    }))
                )
            );
        });
    };

/**
 * Handles updating effect lifecycle properties
 * Restores its duration based on the effect event configuration
 * And/or removes the effect if it has run out of stacks/was flagged for removal by the effect event
 */
const checkUpdateEffectLifecycle =
    ({
        effect,
        effectEvent,
        context,
        ownerId,
    }: {
        effect: CombatEffect;
        effectEvent: EffectEventTrigger;
        context: ActionContext;
        ownerId: string;
    }) =>
    (dispatch, getState) => {
        const { removeEffect, decrementStacks = 0, incrementStacks = 0, resetDuration } = effectEvent;

        const { combatant } = findCombatantData(getState().battle, ownerId) || {};
        if (!combatant) {
            return;
        }

        const maxStacks = effect.maxStacks || Infinity;
        const updatedStacks = (effect.stacks || 1) - (decrementStacks || 0) + (incrementStacks || 0);
        const updatedEffect = {
            ...effect,
            stacks: Math.min(maxStacks, updatedStacks),
            duration: resetDuration ? effect.originalDuration : effect.duration,
        };

        if (removeEffect || updatedEffect.stacks === 0) {
            const removedEffects = [];
            const newEffects = [];
            combatant.effects.forEach((e) => (e.id === effect.id ? removedEffects.push(e) : newEffects.push(e)));

            dispatch(triggerStatChangeEvents([{ statUpdate: { combatantId: ownerId, removedEffects }, context: context }]));
            dispatch(updateCombatant({ combatantId: ownerId, newProperties: { effects: newEffects } }));
            return;
        }

        if ((decrementStacks && updatedEffect.stacks > 0) || resetDuration || incrementStacks) {
            const newEffects = combatant.effects.map((e: CombatEffect) => {
                return e.id === effect.id ? updatedEffect : e;
            });
            dispatch(updateCombatant({ combatantId: ownerId, newProperties: { effects: newEffects } }));
        }
    };

const onEffectEventTrigger = ({
    effectEvent,
    effectEventKey,
    effect,
    ownerId,
    context,
}: {
    effectEvent: EffectEventTrigger;
    effectEventKey: string;
    effect: CombatEffect;
    ownerId: string;
    context?: ActionContext;
}) => {
    return (dispatch, getState) => {
        if (!effectEvent) {
            return;
        }

        const { canBeSilenced, stacks } = effect;
        const {
            removeEffect,
            targetType,
            ability: effectEventAbility,
            conditions,
            randomOptions = {},
            usableWhileStunned,
            usableWhileDead,
            autoCastAbilities,
            chance = 1,
            decrementStacks = 0,
            drawOriginalAbility = false,
            multiplier: multiplierConfig,
            pushEventQueue,
            ...other
        } = effectEvent;

        const source: TriggerSource = context?.sourceChain?.at(-1);
        const getCalculationTargetIds = (targetType: TRIGGER_TARGET_TYPES | CONDITION_TARGETS | undefined): string[] => {
            if (!targetType) {
                return [ownerId];
            }

            const targetIds =
                {
                    [TRIGGER_TARGET_TYPES.EFFECT_OWNER]: [ownerId],
                    [TRIGGER_TARGET_TYPES.EFFECT_APPLIER]: [effect?.applierId],
                    [TRIGGER_TARGET_TYPES.ACTOR]: [source?.actorId],
                    // This is the PRIMARY target only:
                    [TRIGGER_TARGET_TYPES.TARGET]: [source?.targetId],
                    [TRIGGER_TARGET_TYPES.ALL_TARGETS]: source?.allTargetIds || [],
                    [TRIGGER_TARGET_TYPES.PLAYER]: [getState().battle.playerSide.find((combatant) => combatant?.isPlayer).id],
                }[targetType] || [];
            return targetIds.filter((v) => v);
        };

        const getCalculationTarget = (targetType: TRIGGER_TARGET_TYPES | CONDITION_TARGETS): CombatantInfo[] | BattleState => {
            if (targetType === CONDITION_TARGETS.BATTLE) {
                return getState().battle;
            }
            return getCalculationTargetIds(targetType).map((id) => findCombatantData(getState().battle, id));
        };

        // Must pass parent effect conditions as well as child effectEvent conditions (if any)
        const conditionsPassed =
            passesConditions({ getCalculationTarget, proc: effect, source: source }) &&
            passesConditions({ getCalculationTarget, proc: effectEvent, source: source });

        const caster = findCombatantData(getState().battle, ownerId);
        const chanceMultiplier = getMultiplier({
            actor: caster,
            target: caster,
            allTargets: [caster],
            source: source,
            multiplier: effectEvent.multiplier,
            actionParent: source?.source,
            ...getState().battle,
        });
        const chanceCheckPass = Math.random() < chance * chanceMultiplier;

        if (conditionsPassed && chanceCheckPass) {
            dispatch(checkUpdateEffectLifecycle({ effect, effectEvent, context, ownerId }));
        } else {
            return;
        }

        const { combatant } = findCombatantData(getState().battle, ownerId) || {};
        const cannotTrigger = (canBeSilenced && isSilenced(combatant)) || (!usableWhileStunned && isStunnedOrFrozen(combatant));
        if (cannotTrigger) {
            return;
        }

        const procTriggerSource: TriggerSource = {
            source: effect,
            type: TRIGGER_SOURCE_TYPES.EFFECT,
            isProc: true,
            actorId: ownerId,
            targetId: source?.targetId,
            statUpdate: source?.statUpdate,
        };
        const procContext: ActionContext = { ...context, sourceChain: [...(context?.sourceChain || []), procTriggerSource] };

        dispatch(handleDrawOriginalAbility({ drawOriginalAbility, effect, context: procContext }));
        dispatch(checkCardActions({ action: other, context: procContext }));

        const owner = findCombatantData(getState().battle, ownerId);
        if (owner?.combatant?.isPlayer) {
            const multiplier = getMultiplier({
                multiplier: multiplierConfig,
                actor: owner,
                ...getState().battle,
            });
            dispatch(
                checkHandleAutoCast({
                    autoCastAbilities,
                    actor: owner.combatant,
                    parentAbility: parent as any,
                    multiplier,
                    context: procContext,
                })
            );
        }

        const initialTargetIds = getCalculationTargetIds(targetType).filter((id) => {
            const secondaryGetCalculationTarget = (secondaryTargetType) => {
                // Check that the individual target passes conditions for the effect event if applicable. Prior to this, only the primary
                // target was checked and then it would pass/fail for all targets.
                if (
                    secondaryTargetType === targetType &&
                    [TRIGGER_TARGET_TYPES.TARGET, TRIGGER_TARGET_TYPES.ALL_TARGETS].includes(secondaryTargetType)
                ) {
                    return findCombatantData(getState().battle, id);
                }

                return getCalculationTarget(secondaryTargetType);
            };
            return passesConditions({ getCalculationTarget: secondaryGetCalculationTarget, proc: effectEvent, source: source });
        });

        const initialTargetData = findCombatantData(getState().battle, initialTargetIds[0]);
        const { index: i, friendlySide, friendly: targets } = initialTargetData || {};

        $applyStatChanges: {
            if (!targets) {
                break $applyStatChanges;
            }

            let effects = [];
            if (Array.isArray(other.effects)) {
                effects = other.effects.map((e) => {
                    if (typeof e === "string") {
                        return e;
                    }

                    const totalStacks = (e.stacks || 1) * (stacks || 1);
                    const maxStacks = e.maxStacks || Infinity;
                    return { ...e, stacks: Math.min(maxStacks, totalStacks) };
                });
            }

            const action = {
                type: ACTION_TYPES.NONE, // No animation
                ...other,
                effects,
            };

            const targetIds = [];

            // This calculates `action.area` for the effect event trigger
            initialTargetIds
                .map((id) => findCombatantData(getState().battle, id))
                .map((data) => {
                    // Bug with Curse Eye mirror images where a combatant could not be looked up; don't know why though
                    if (!data) {
                        return [];
                    }

                    return calculateTargetIndices({
                        action,
                        selectedIndex: data.index,
                        side: data.friendlySide,
                        actorData: owner,
                        targetData: data,
                        battle: getState().battle,
                        source,
                        isPreviewMode: context?.isPreviewMode,
                    }).targetedIndices;
                })
                .map((indices: number[]) => {
                    indices.forEach((i) => {
                        const id = targets[i]?.id;
                        if (id && !targetIds.includes(id)) {
                            targetIds.push(id);
                        }
                    });
                });

            const updated = getUpdatedStats({
                ...getState().battle,
                targetIds,
                actorId: ownerId,
                action: {
                    ...action,
                    multiplier: multiplierConfig,
                },
                context: procContext,
                getCombatantById: (id: string) => findCombatantData(getState().battle, id),
            });

            dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));
            let aggregated = {};

            updated.forEach(({ statUpdate }) => {
                const { combatantId } = statUpdate;
                aggregated = aggregateStatUpdates(aggregated, { [combatantId]: statUpdate });
            });

            dispatch(
                enqueueEvent({
                    action: {
                        ...action,
                        multiplier: multiplierConfig,
                    },
                    actorId: ownerId,
                    context: procContext,
                    selectedIndex: owner.index,
                    targetSide: owner.friendlySide,
                    statUpdates: aggregated,
                    // We need to push to event queue for stat changes to show up visually.
                    // Append them to the previous group/have minimal playback
                    playbackTime: action.playbackTime || 1,
                    options: {
                        alwaysGroup: true,
                    },
                })
            );

            dispatch(
                triggerStatChangeEvents(
                    updated.map(({ statUpdate }) => ({
                        statUpdate,
                        context: procContext,
                    }))
                )
            );

            dispatch(checkInduce({ action: effectEvent, affectedTargetIds: targetIds, parentContext: procContext }));
        }

        // Disable procs for ability previews; especially procs that will randomly trigger or target are very problematic for preview
        if (!effectEventAbility || context?.isPreviewMode) {
            return;
        }

        const ability: Ability | undefined =
            typeof effectEventAbility === "string" ? abilityNameMap[effectEventAbility] : effectEventAbility;
        let abilityUsed = false; // One or more actions must have been performed to trigger onUseAbility

        ability?.actions.forEach((action: Action) => {
            const { index, side } = autoSelectActionTarget({
                initialSelectedIndex: i,
                initialSelectedSide: friendlySide,
                action,
                actorId: ownerId,
                battle: getState().battle,
            });

            const target = getState().battle[side]?.[index];

            const getCalculationTarget = (): CombatantInfo => {
                return findCombatantData(getState().battle, target?.id);
            };

            const actorInfo = findCombatantData(getState().battle, ownerId);
            const actor = actorInfo?.combatant;
            const isPassAliveConditions = actor?.HP > 0 || usableWhileDead || effectEventKey === EFFECT_EVENT_KEYS.onDeath;
            const canAct =
                isPassAliveConditions &&
                !isTurnActionPrevented(actorInfo, {
                    bypassStun: usableWhileStunned,
                    bypassPreventTurnAction: action.bypassPreventTurnAction,
                });

            // Something could've happened between actions that killed the actor
            if (!canAct) {
                return;
            }

            if (
                [TARGET_TYPES.HOSTILE, TARGET_TYPES.RANDOM_HOSTILE].includes(action.target) &&
                !canTargetIfStealthed(actor, target, action)
            ) {
                return;
            }

            if (passesConditions({ getCalculationTarget, proc: action, source: source })) {
                abilityUsed = true;

                dispatch(
                    performAction({
                        action,
                        selectedIndex: index,
                        side,
                        actorId: ownerId,
                        parentContext: procContext,
                    })
                );
            }
        });

        if (abilityUsed) {
            dispatch(
                onUseAbility({
                    actorInfo: findCombatantData(getState().battle, ownerId),
                    context: procContext,
                    ability,
                })
            );
        }
    };
};

export const checkEventTrigger = ({
    combatantId,
    effectEventKey,
    context,
}: {
    combatantId: string | undefined | null;
    effectEventKey: EFFECT_EVENT_KEYS;
    context?: ActionContext;
}) => {
    return (dispatch, getState) => {
        if (!combatantId) {
            return;
        }

        const { combatant } = findCombatantData(getState().battle, combatantId) || {};
        if (!combatant) {
            return;
        }
        const source = context?.sourceChain?.at(-1);
        const fromProc = source?.isProc || context?.isProc;

        const triggerEffectEvent = ({ effect, effectEvent }: { effect: CombatEffect; effectEvent: EffectEventTrigger }) => {
            const { uptime, turnsTriggerFrequency, id } = effect;
            // Dead characters generally cannot trigger effects except in case of killing blows
            const usable = effectEventKey === EFFECT_EVENT_KEYS.onDeath || combatant.HP > 0 || effectEvent?.usableWhileDead;

            const excludeEffectOwner =
                effectEvent.excludeEffectOwner && (source?.actorId === combatantId || source?.targetId === combatantId);
            if (!usable || excludeEffectOwner) {
                return;
            }

            const eventTriggeredTimes = (effectEvent.eventTriggeredTimes || 0) + 1;

            // Effects could have been removed from one effectEvent trigger to the next, so make sure we're getting the updated one here
            const currentEffects = findCombatantData(getState().battle, combatantId)?.combatant?.effects || [];
            const triggerSum = (effectEvent.triggerSum || 0) + (context?.trackSumAmount || 1);
            /**
             * Update the number of times this effect event triggered (regardless of whether the actual effects went through or not).
             * @see topaz for an example of what uses this metric
             */
            dispatch(
                updateCombatant({
                    combatantId,
                    newProperties: {
                        effects: currentEffects.map((e) => {
                            if (e.id !== id) {
                                return e;
                            }

                            const effectEvent = e[effectEventKey];
                            if (Array.isArray(effectEvent)) {
                                return {
                                    ...e,
                                    [effectEventKey]: effectEvent.map((effectEvent) => ({
                                        ...effectEvent,
                                        eventTriggeredTimes,
                                        triggerSum,
                                    })),
                                };
                            }

                            return {
                                ...e,
                                [effectEventKey]: {
                                    ...effectEvent,
                                    eventTriggeredTimes,
                                    triggerSum,
                                },
                            };
                        }),
                    },
                })
            );

            const meetsTriggerTimes = !effectEvent.eventTriggerFrequency || eventTriggeredTimes % effectEvent.eventTriggerFrequency === 0;
            const parentContext: Action | CombatEffect | Ability | Item = source?.source;
            const notTriggeringSameEffect = effect.id !== (parentContext as CombatEffect)?.id;
            const historyKey = [effectEventKey, id].join("-");
            const history = context?.triggerHistory || [];
            const alreadyTriggered = history.includes(historyKey);

            const canTriggerFromProcs = !fromProc || !effectEvent?.disableTriggerFromProcs;
            const isBattleStartEffect = [EFFECT_EVENT_KEYS.onBattleStart, EFFECT_EVENT_KEYS.onWaveStart].includes(effectEventKey);

            if (
                !alreadyTriggered &&
                (isTurnToTrigger({ turnsTriggerFrequency, uptime }) || isBattleStartEffect) &&
                meetsTriggerTimes &&
                notTriggeringSameEffect &&
                canTriggerFromProcs
            ) {
                const triggerTimesFromSum = (() => {
                    const freq = effectEvent.triggerFrequencyFromSum;
                    if (!freq) {
                        return 1;
                    }

                    return Math.floor(triggerSum / freq) - Math.floor(effectEvent.triggerSum / freq);
                })();

                Array.from({ length: triggerTimesFromSum }).forEach(() => {
                    dispatch(
                        onEffectEventTrigger({
                            effectEvent,
                            effect,
                            effectEventKey,
                            ownerId: combatant.id,
                            context: {
                                ...context,
                                triggerHistory: [...history, historyKey],
                            },
                        })
                    );
                });
            }
        };

        combatant.effects.forEach((effect: CombatEffect) => {
            const effectEvents = effect[effectEventKey];
            if (!effectEvents) {
                return;
            }

            if (Array.isArray(effectEvents)) {
                effectEvents.forEach((effectEvent) => triggerEffectEvent({ effect, effectEvent }));
            } else {
                triggerEffectEvent({ effect, effectEvent: effectEvents });
            }
        });

        // Trigger hand effects if it is not a proc.
        if (combatant.isPlayer && !fromProc) {
            const { playerSide, hand } = getState().battle;
            const actorIsPlayer = playerSide.some((combatant: Combatant | null) => combatant?.isPlayer && combatant.id === source?.actorId);
            if (actorIsPlayer) {
                hand.forEach((card: CombatAbility) => {
                    const cardEvent = card[effectEventKey];
                    if (!cardEvent) {
                        return;
                    }

                    const ability = cardEvent.ability;
                    if (ability && passesChance(cardEvent.chance)) {
                        dispatch(useAbility({ ability: card[effectEventKey].ability, actorId: source?.actorId, isProc: true }));
                    }
                });

                dispatch(
                    updateBattle({
                        hand: getState().battle.hand.map((card: CombatAbility) => {
                            return applyAbilityEventEffects({
                                event: card[effectEventKey],
                                ability: card,
                                source,
                            });
                        }),
                    })
                );
            }
        }
    };
};

/**
 * When an effect reaches max stacks, the existing effect with the shortest duration gets its duration extended by the duration of the incoming effect.
 */
const calculateEffectChanges = (incomingEffects: CombatEffect[], existingEffects: CombatEffect[]): CombatEffect[] => {
    const updatedEffects = existingEffects.slice();

    incomingEffects.forEach((incomingEffect: CombatEffect) => {
        if (!incomingEffect.maxApplications) {
            updatedEffects.push(incomingEffect);
            return;
        }

        const idCountMap = {};
        updatedEffects.forEach((effect: CombatEffect) => {
            if (!effect.maxApplications || effect.name !== incomingEffect.name) {
                return;
            }

            if (!idCountMap[effect.name]) {
                idCountMap[effect.name] = {
                    count: 1,
                    lowestDuration: effect,
                };

                return;
            }
            ++idCountMap[effect.name].count;
            if (effect.duration < idCountMap[effect.name].lowestDuration?.duration) {
                idCountMap[effect.name].lowestDuration = effect;
            }
        });

        if (!idCountMap[incomingEffect.name] || idCountMap[incomingEffect.name].count < incomingEffect.maxApplications) {
            updatedEffects.push(incomingEffect);
            return;
        }

        updatedEffects.forEach((effect: CombatEffect, i) => {
            const { lowestDuration } = idCountMap[effect.name] || {};
            if (lowestDuration?.id === effect.id) {
                // This is the effect to extend the duration and/or stacks
                const updatedEffectDuration = isNaN(updatedEffects[i].duration) ? Infinity : updatedEffects[i].duration;
                const incomingEffectDuration = isNaN(incomingEffect.duration) ? Infinity : incomingEffect.duration;
                const newDuration = updatedEffectDuration + incomingEffectDuration;
                const maxDuration = effect.maxDuration || Infinity;
                const maxStacks = updatedEffects[i].maxStacks || incomingEffect.maxStacks || Infinity;
                updatedEffects[i] = {
                    ...updatedEffects[i],
                    duration: Math.min(maxDuration, newDuration),
                    stacks: Math.min((updatedEffects[i].stacks || 0) + (incomingEffect.stacks || 0), maxStacks),
                    // The last character who applies the DoT gets the applier attribution, eg. for effects like Tauromacis Horn.
                    applierId: incomingEffect.applierId || effect.applierId,
                };
            }
        });
    });

    return updatedEffects;
};

export const stageStatChanges = (statUpdate: UpdatedCombatantStats, combatant: Combatant | Player) => {
    const { healthDamage = 0, armor = 0, resources = 0, healing = 0, effects = [], mesos = 0, removedEffects = [] } = statUpdate;

    const combatantEffects = combatant.effects.filter((effect: CombatEffect) => removedEffects.every(({ id }) => id !== effect.id));

    return {
        ...combatant,
        HP: Math.max(0, combatant.HP - healthDamage + healing),
        armor: combatant.armor + armor,
        resources: Math.max(0, combatant.resources + resources),
        effects: calculateEffectChanges(effects, combatantEffects),
        mesos: Math.max(0, combatant.mesos + mesos),
    };
};

export const applyStatChanges = (statUpdates: UpdatedCombatantStats[]) => (dispatch, getState) => {
    // Apply the stat updates first before triggering any related events
    statUpdates.forEach((statUpdate: UpdatedCombatantStats) => {
        const combatantId = statUpdate.combatantId;
        const battle: BattleState = getState().battle;
        const { combatant: oldCombatant, friendlySide, friendly } = findCombatantData(battle, combatantId) || {};
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

                    return stageStatChanges(statUpdate, oldCombatant);
                }),
            })
        );

        // Updates player money and HP for the state outside of combat.
        // TRICKY: all money operations on the player side affect the PLAYER, even if the minion got the kill, etc.
        if (friendlySide === BATTLEFIELD_SIDES.PLAYER_SIDE && !battle.isTutorial) {
            const player = friendly.find((p) => p?.isPlayer);
            const stats = stageStatChanges(statUpdate, player);
            const updatePlayerStats = { mesos: stats.mesos || 0 };

            if (oldCombatant.isPlayer) {
                // @ts-ignore
                updatePlayerStats.HP = stats.HP;
            }

            dispatch(updatePlayer(updatePlayerStats));
        }
    });
};

const isActorPlayerSide = ({ side, source }: { side: (Combatant | Player | null)[]; source: TriggerSource }) => {
    return side.some((combatant) => {
        if (!combatant) {
            return false;
        }

        if (combatant.id === source.actorId) {
            return true;
        }

        if (source?.type === TRIGGER_SOURCE_TYPES.EFFECT) {
            return (source?.source as CombatEffect).applierId === combatant.id;
        }

        return false;
    });
};

const updateDamageStatistics = (damage: number, source?: TriggerSource) => (dispatch, getState) => {
    const battle: BattleState = getState().battle;
    if (isActorPlayerSide({ side: battle.playerSide, source: source })) {
        const statistics: BattleStatistics = {
            ...battle.statistics,
            totalDamage: (battle.statistics.totalDamage || 0) + (damage || 0),
            damageByEnemyName: {
                ...battle.statistics.damageByEnemyName,
            },
        };

        const target = findCombatantData(battle, source.targetId);
        const targetName = target?.combatant?.name;
        if (targetName) {
            statistics.damageByEnemyName[targetName] = (statistics.damageByEnemyName[targetName] || 0) + (damage || 0);
        }

        dispatch(
            updateBattle({
                statistics,
            })
        );
    }
};

/**
 * If a player or an ally taunts, the enemy targeting should reorient to it.
 */
const updateEnemyTargetingAfterEffectsApplied = ({
    combatantId,
    effectsApplied = [],
}: {
    combatantId: string;
    effectsApplied: CombatEffect[];
}) => {
    return (dispatch, getState) => {
        if (effectsApplied.every((effect) => effect.type !== EFFECT_TYPES.TAUNT)) {
            return;
        }

        const combatant = findCombatantData(getState().battle, combatantId);
        if (combatant.friendlySide === BATTLEFIELD_SIDES.PLAYER_SIDE) {
            dispatch(checkValidEnemyTargeting({ validTargetSwitchId: combatantId }));
        }
    };
};

/**
 * Enemy targeting is rolled once after their turn. But if during the player's turn, the board changes such that their targeting
 * becomes invalid (eg. applying armor to a Taunt unit that would have died), update the targeting here.
 */
export const checkValidEnemyTargeting = (options?: { validTargetSwitchId?: string }) => {
    return (dispatch, getState) => {
        let battle: BattleState = getState().battle;
        const validTargetSwitchId: string = options?.validTargetSwitchId;
        let targetSwitch: CombatantInfo | undefined;

        if (validTargetSwitchId) {
            targetSwitch = findCombatantData(battle, validTargetSwitchId);
        }

        const enemyOrderIds = getEnemyMoveOrder({ enemies: battle.enemySide, round: battle.round });
        enemyOrderIds.forEach((enemyId: string) => {
            const enemyInfo = findCombatantData(battle, enemyId);
            const combatant = enemyInfo?.combatant;
            if (!combatant?.HP) {
                return;
            }

            const currentTargeting = combatant.targeting;
            const ability = currentTargeting?.ability;
            if (!ability?.actions) {
                return;
            }

            let mutableUpdatedActionTargets = [];
            ability.actions.forEach((action, i) => {
                let target;
                const { side, index: currentTarIndex } = currentTargeting?.actionTargets?.[i] || {};
                const validIndices = getValidTargetIndicesForAction({ action, actorData: enemyInfo });
                if (validIndices.some((item) => item.side === side && item.index === currentTarIndex)) {
                    target = currentTargeting?.actionTargets?.[i];

                    if (targetSwitch) {
                        const randomTarget = autoSelectActionTarget({ action, actorId: enemyId, battle: battle });
                        if (randomTarget.index === targetSwitch.index && randomTarget.side === targetSwitch.friendlySide) {
                            target = randomTarget;
                        }
                    }
                }

                if (!target) {
                    target = autoSelectActionTarget({ action, actorId: enemyId, battle: battle });
                }

                mutableUpdatedActionTargets[i] = target;

                // If it's casting, it's not going to actually use the ability yet.
                const castAboutToTrigger = (combatant.casting?.castTime || 0) === 1;
                const notQueuingCast = !ability.castTime && !combatant.casting?.castTime;
                if (castAboutToTrigger || notQueuingCast) {
                    const preview = previewAction({
                        actionFn: performAction({
                            action,
                            selectedIndex: target.index,
                            side: target.side,
                            actorId: enemyId,
                            parentContext: { sourceChain: [{ source: ability, type: TRIGGER_SOURCE_TYPES.ABILITY }] },
                        }),
                        battle: battle,
                    });

                    battle = {
                        ...battle,
                        playerSide: preview.battle.playerSide,
                        enemySide: preview.battle.enemySide,
                    };
                }
            });

            dispatch(
                updateCombatant({
                    combatantId: enemyId,
                    newProperties: {
                        targeting: {
                            actionTargets: mutableUpdatedActionTargets,
                            ability,
                        },
                    },
                })
            );
        });
    };
};

export const triggerStatChangeEvents =
    (statChanges: { statUpdate: UpdatedCombatantStats; context?: ActionContext }[]) => (dispatch, getState) => {
        statChanges.forEach(({ statUpdate, context }) => {
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
                isArmorDecay = false,
                isArmorBroken = false,
                failedToApplyEffects = [],
            } = statUpdate;

            const dispatchEvent = ({
                effectEventKey,
                sourcePayload,
                trackSumAmount,
            }: {
                effectEventKey: EFFECT_EVENT_KEYS;
                sourcePayload?: { [key in keyof TriggerSource]? };
                trackSumAmount?: number;
            }) => {
                const updatedSourceChain = [...(context?.sourceChain || []), { ...sourcePayload, targetId: combatantId, statUpdate }];
                dispatch(
                    checkEventTrigger({
                        combatantId,
                        effectEventKey,
                        context: { ...context, trackSumAmount, sourceChain: updatedSourceChain },
                    })
                );
            };

            if (resources < 0) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onResourcesSpent, trackSumAmount: Math.abs(resources) });
            }

            if (rawResources > 0) {
                // This event currently includes overcapping resources; use overcappedResources when nuance required
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onResourcesGained, trackSumAmount: Math.abs(rawResources) });
            }

            if (healing > 0) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onReceiveHealing, trackSumAmount: Math.abs(healing) });
            }

            if (overhealing > 0) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onReceiveOverhealing, trackSumAmount: Math.abs(overhealing) });
            }

            if (armor > 0) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onReceiveArmor, trackSumAmount: Math.abs(armor) });
            } else if (armor < 0) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onArmorLoss, trackSumAmount: Math.abs(armor) });
            }

            if (isArmorDecay) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onArmorDecay });
            }

            if (isArmorBroken) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onArmorBreak });
            }

            if (rawDamage > 0) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onReceiveDamage, trackSumAmount: Math.abs(rawDamage) });
            }

            if (healthDamage > 0) {
                const source = context?.sourceChain?.at(-1);
                dispatch(updateDamageStatistics(healthDamage, source));
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onReceiveHealthDamage, trackSumAmount: Math.abs(healthDamage) });
            }

            effects.forEach((e: CombatEffect) => {
                dispatchEvent({
                    effectEventKey: EFFECT_EVENT_KEYS.onReceiveEffect,
                    sourcePayload: { source: e, type: TRIGGER_SOURCE_TYPES.EFFECT },
                });

                const source: TriggerSource = { statUpdate, source: e, type: TRIGGER_SOURCE_TYPES.EFFECT, targetId: combatantId };

                dispatch(
                    checkEventTrigger({
                        combatantId: e.applierId,
                        effectEventKey: EFFECT_EVENT_KEYS.onApplyEffect,
                        context: { ...context, sourceChain: [...(context?.sourceChain || []), source] },
                    })
                );
            });

            dispatch(updateEnemyTargetingAfterEffectsApplied({ combatantId, effectsApplied: effects }));

            removedEffects.forEach((e: CombatEffect) => {
                if (!e.onRemoved) {
                    return;
                }

                const removedEvents = Array.isArray(e.onRemoved) ? e.onRemoved : [e.onRemoved];
                removedEvents.forEach((effectEvent) => {
                    dispatch(
                        onEffectEventTrigger({
                            ownerId: combatantId,
                            effectEvent,
                            effect: e,
                            effectEventKey: EFFECT_EVENT_KEYS.onRemoved,
                        })
                    );
                });
            });

            failedToApplyEffects.forEach((e: Effect) => {
                dispatchEvent({
                    effectEventKey: EFFECT_EVENT_KEYS.onFailedToReceiveEffect,
                    sourcePayload: { source: e, type: TRIGGER_SOURCE_TYPES.EFFECT },
                });
            });

            if (isDeathBlow) {
                dispatch(onCombatantDeath({ combatantId, context: context }));
            }
        });
    };

/**
 * Updates a combatant given its ID. This overwrites the combatant.
 */
export const updateCombatant = ({ combatantId, newProperties }: { combatantId: string; newProperties: any }) => {
    return (dispatch, getState) => {
        const { combatant: oldCombatant, friendlySide, friendly } = findCombatantData(getState().battle, combatantId) || {};
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
        const { combatant } = findCombatantData(getState().battle, combatantId) || {};
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
            if (!effect.onEnd) {
                return;
            }

            const events = Array.isArray(effect.onEnd) ? effect.onEnd : [effect.onEnd];
            events.forEach((effectEvent) => {
                dispatch(
                    onEffectEventTrigger({
                        ownerId: combatantId,
                        effectEvent,
                        effect,
                        effectEventKey: EFFECT_EVENT_KEYS.onEnd,
                    })
                );
            });
        });
    };
};

export const onEndTurnTriggers = ({ combatants, side }: { combatants: (Combatant | null)[]; side: BATTLEFIELD_SIDES }) => {
    return (dispatch) => {
        const playbackCollectorInstance = playbackCollector();
        combatants.forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onTurnEnd,
                        context: { sourceChain: [], playbackCollector: playbackCollectorInstance },
                    })
                );
            }
        });

        combatants.forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(tickDownStatusEffects(combatant.id));
            }
        });

        dispatch(pushEventQueue(playbackCollectorInstance.get()));
    };
};

/**
 * Called when a combatant is summoned on the board, typically handling status effect events
 */
const onSummonTriggers =
    ({ summonedId, summonerId, parentContext }: { summonedId: string; summonerId: string; parentContext: ActionContext }) =>
    (dispatch, getState) => {
        const context: ActionContext = {
            ...parentContext,
            sourceChain: [...(parentContext?.sourceChain || []), { actorId: summonerId, targetId: summonedId, allTargetIds: [summonedId] }],
        };

        dispatch(checkEventTrigger({ combatantId: summonedId, effectEventKey: EFFECT_EVENT_KEYS.onSummoned, context: context }));
        const { hostile, friendly } = findCombatantData(getState().battle, summonerId) || {};
        hostile?.forEach((combatant) => {
            if (combatant?.id !== summonedId) {
                dispatch(
                    checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onHostileSummon, context: context })
                );
            }
        });

        friendly?.forEach((combatant) => {
            if (combatant?.id !== summonedId) {
                dispatch(
                    checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onFriendlySummon, context: context })
                );
            }
        });
    };

/**
 * Handle action that summons a combatant in an empty slot on the board
 * TODO: Reuse checkSummonMinion code
 * @see checkSummonMinion
 */
const checkHandleActionSummon = ({ action, actorId, parentContext }: { action: Action; actorId: string; parentContext: ActionContext }) => {
    return (dispatch, getState) => {
        const bonuses = Array.isArray(action.bonus) ? action.bonus : [action.bonus];
        const actorData = findCombatantData(getState().battle, actorId);
        if (!actorData) {
            return;
        }

        const getCalculationTarget = (targetType: TRIGGER_TARGET_TYPES): CombatantInfo | undefined => {
            if (targetType === TRIGGER_TARGET_TYPES.ACTOR) {
                return actorData;
            }
        };

        const actionSummon = action.summon || [];
        const potentialBonusSummons = bonuses.flatMap((b) => b?.summon || []);
        const source: TriggerSource = parentContext?.sourceChain.at(-1);
        const summons = actionSummon
            .concat(potentialBonusSummons)
            .filter((b) => passesConditions({ getCalculationTarget, proc: b, source }));
        if (!summons.length) {
            return;
        }

        const minionsSummoned: Combatant[] = [];
        const tributeSummonedMinions: string[] = []; // IDs of killers
        const { friendly, hostile, friendlySide, hostileSide, index: actorIndex, combatant: actor } = actorData;
        const mutableFriendly = friendly.slice(); // This gets used to update the battlefield side at the end
        const mutableHostile = hostile.slice();

        for (const summon of summons) {
            const {
                minion,
                positionIndex,
                placement,
                noDuplicateMinions = false,
                tributePossible = false,
                tributeMinionByName: replaceMinionByName,
                side,
            } = summon;
            const mutableSide = side === hostileSide ? mutableHostile : mutableFriendly;

            let isTributeKill = false;
            let pos: number;
            if (typeof positionIndex === "number" && !mutableSide[positionIndex]?.HP) {
                pos = positionIndex;
            } else if (placement === "adjacent") {
                const validSummonIndices = getPossibleSummonIndices(mutableSide);
                const isValidIndex = (index: number) => validSummonIndices.includes(index);
                for (let i = 1; i < mutableSide.length; ++i) {
                    if (isValidIndex(actorIndex - i)) {
                        pos = actorIndex - i;
                        break;
                    }

                    if (isValidIndex(actorIndex + i)) {
                        pos = actorIndex + i;
                        break;
                    }
                }
            } else if (placement === "on-top") {
                pos = actorIndex;
            } else if (Array.isArray(replaceMinionByName)) {
                const indices = [];
                friendly.forEach((f, i) => {
                    if (replaceMinionByName.includes(f?.name)) {
                        indices.push(i);
                    }
                });

                if (indices.length > 0) {
                    pos = getRandomItem(indices);
                    if ((friendly[pos]?.HP || 0) > 0) {
                        dispatch(
                            tributeKill({
                                tributeSummon: true,
                                resourceCost: 0,
                                actor,
                                side: friendlySide,
                                index: pos,
                                parentContext,
                            })
                        );
                        isTributeKill = true;
                    }
                }
            } else {
                pos = getRandomItem(getPossibleSummonIndices(mutableSide));
            }

            if (typeof pos !== "number") {
                if (!tributePossible) {
                    break;
                }

                const existingMinionIndices = mutableSide.reduce((acc, combatant, i) => {
                    if (!combatant) {
                        return acc;
                    }

                    const { id, isPlayer } = combatant;
                    // Do not replace any of the minions summoned in the current action
                    const isNotNewlySummonedMinion = minionsSummoned.every((minion) => minion.id !== id);
                    const isTributable = !combatant.disableTribute; // TODO minionToSummon bypassDisableTribute
                    if (!isPlayer && id !== actorId && isNotNewlySummonedMinion && isTributable) {
                        acc.push(i);
                    }

                    return acc;
                }, []);

                pos = getRandomItem(existingMinionIndices);
                if (typeof pos === "number") {
                    dispatch(tributeKill({ tributeSummon: true, resourceCost: 0, actor, side: friendlySide, index: pos, parentContext }));
                    isTributeKill = true;
                }
            }

            const availableMinions = minion.filter((minion: Minion | string) => {
                if (noDuplicateMinions) {
                    const minionName = typeof minion === "string" ? minion : minion?.name;
                    return mutableSide.every((m: Combatant | null) => !m?.HP || m?.name !== minionName);
                }

                return true;
            });

            const minionToSummon = getRandomItem(availableMinions);
            const baseMinion = typeof minionToSummon === "string" ? enemyNameMap[minionToSummon] : minionToSummon;
            const minionEffects = baseMinion?.effects?.slice() || [];
            if (isTributeKill) {
                minionEffects.push(tributeSummonBuff);
            }

            if (actor?.isPlayer) {
                const itemEffects = actor.items.reduce((acc, item: Item) => {
                    if (item.applyEffectsToSummons) {
                        acc.push(...(item.effects || []));
                    }
                    return acc;
                }, []);
                minionEffects.push(...itemEffects);
            }

            const summonedMinion = createCombatant(cloneDeep({ ...baseMinion, effects: minionEffects }));
            if (summonedMinion) {
                minionsSummoned.push(summonedMinion);
                mutableSide[pos] = summonedMinion;

                if (isTributeKill) {
                    tributeSummonedMinions.push(summonedMinion.id);
                }
            }
        }

        if (minionsSummoned.length) {
            dispatch(
                updateBattle({
                    [friendlySide]: mutableFriendly,
                    [hostileSide]: mutableHostile,
                })
            );

            // Give minions time to appear before triggering any minion-related effect events (or the next action).
            // Issue where characters who automatically attacked summoned minions would fly off to 0, 0 since minions had not rendered
            dispatch(
                enqueueEvent({
                    playbackTime: SUMMON_DELAY,
                    newCombatants: minionsSummoned,
                    context: parentContext,
                })
            );
        }

        // Tribute summons count as a kill for the new minion
        tributeSummonedMinions.forEach((id) => dispatch(checkEventTrigger({ combatantId: id, effectEventKey: EFFECT_EVENT_KEYS.onKill })));

        minionsSummoned.forEach((minion) => {
            dispatch(
                onSummonTriggers({
                    summonedId: minion.id,
                    summonerId: actorId,
                    parentContext,
                })
            );
        });

        minionsSummoned.forEach((minion) => {
            dispatch(requeueRecentlyUsedAbility({ combatantId: minion.id })) || {};
            dispatch(updateEnemyTargetingAfterEffectsApplied({ combatantId: minion.id, effectsApplied: minion.effects }));
        });
    };
};

/**
 * Handle action that transforms combatants to another combatant, eg. Mutant Snail casts Mutate and transforms Blue Snails to Red Snails
 */
const checkHandleMorph = ({
    action,
    morphTargetIds,
    actorId,
    parentContext,
}: {
    action: Action;
    morphTargetIds: string[];
    actorId: string;
    parentContext: ActionContext;
}) => {
    return (dispatch, getState) => {
        if (!action.morph) {
            return;
        }

        const targets = morphTargetIds
            .map((id: string) => findCombatantData(getState().battle, id))
            .filter((combatantInfo) => action.morph.resurrect || combatantInfo.combatant?.HP > 0);

        if (!targets.length) {
            return;
        }

        const type = action.morph.type;
        const source: TriggerSource = { ...parentContext?.sourceChain?.at(-1), actorId };
        const context: ActionContext = { ...parentContext, sourceChain: [...(parentContext?.sourceChain || []), source] };

        const morphProps = {
            targets,
            morph: action.morph,
            source,
            getState,
            summoner: findCombatantData(getState().battle, actorId),
        };

        let transformed: { side: BATTLEFIELD_SIDES; combatants: (Combatant | null)[]; summons: Combatant[] } | null = null;

        if (type === MORPH_TYPES.MAP) {
            transformed = getMorphMap(morphProps);
        } else {
            transformed = getMorphMerge(morphProps);
        }

        if (!transformed) {
            return;
        }

        const { side, combatants, summons } = transformed;

        // Give minions time to appear before triggering any minion-related effect events (or the next action).
        // Issue where characters who automatically attacked summoned minions would fly off to 0, 0 since minions had not rendered
        dispatch(
            enqueueEvent({
                playbackTime: SUMMON_DELAY,
                newCombatants: summons,
                context,
            })
        );

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
                    parentContext,
                })
            );

            dispatch(requeueRecentlyUsedAbility({ combatantId: summon.id })) || {};
        });
    };
};

/**
 * Handle the induceCombatantAttack property of an action (tells minions to attack randomly)
 */
const checkInduce = ({
    action,
    affectedTargetIds,
    parentContext,
}: {
    action: Action;
    affectedTargetIds: string[];
    parentContext: ActionContext;
}) => {
    return (dispatch, getState) => {
        const { induceCombatant, induceCombatantAttack } = action;
        if (induceCombatant) {
            const { mode, action: actions } = induceCombatant;

            const handleInduceAction = (action) => {
                if (mode === "random") {
                    affectedTargetIds = shuffle(affectedTargetIds);
                } else if (mode === "right-to-left") {
                    affectedTargetIds = affectedTargetIds.slice().reverse();
                }

                affectedTargetIds.forEach((id) => {
                    const combatantData = findCombatantData(getState().battle, id);
                    if (!combatantData) {
                        return;
                    }

                    const combatant = combatantData.combatant;

                    const getCalculationTarget = (type) => {
                        if (type === TRIGGER_TARGET_TYPES.ACTOR) {
                            return combatantData;
                        }
                    };
                    if (!combatant.HP || isStunnedOrFrozen(combatant) || !passesConditions({ getCalculationTarget, proc: action })) {
                        return;
                    }

                    const { index: initialIndex, side: initialSide } = combatant?.targeting?.actionTargets?.[0] || {};

                    const { index, side } = autoSelectActionTarget({
                        action,
                        actorId: id,
                        initialSelectedIndex: initialIndex,
                        initialSelectedSide: initialSide,
                        battle: getState().battle,
                    });

                    if (typeof index === "number") {
                        dispatch(
                            performAction({
                                action,
                                actorId: id,
                                parentContext,
                                selectedIndex: index,
                                side,
                            })
                        );

                        const context: ActionContext = {
                            ...parentContext,
                            sourceChain: [
                                ...(parentContext?.sourceChain || []),
                                { actorId: id, source: action, type: TRIGGER_SOURCE_TYPES.ACTION },
                            ],
                        };
                        dispatch(
                            onUseAbility({
                                actorInfo: findCombatantData(getState().battle, id),
                                context,
                                ability: {
                                    name: "Induced Ability",
                                    actions: [action],
                                },
                            })
                        );
                    }
                });
            };

            if (Array.isArray(actions)) {
                actions.forEach(handleInduceAction);
            } else if (actions) {
                handleInduceAction(actions);
            }
        }

        if (induceCombatantAttack) {
            shuffle(affectedTargetIds).forEach((id) => {
                const { combatant } = findCombatantData(getState().battle, id) || {};
                if (!combatant.HP || isStunnedOrFrozen(combatant)) {
                    return;
                }

                const attackAbility: Ability = getInducedAttack(combatant);

                dispatch(
                    useAbility({
                        ability: attackAbility,
                        actorId: id,
                        isProc: true,
                        playbackCollector: parentContext?.playbackCollector,
                    })
                );
            });
        }
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

        const { updatedCharacters, displacements } = applyVacuum({
            characters: getState().battle[side],
            index: selectedIndex,
            area,
            distance: vacuum,
            side,
        });

        dispatch(
            updateBattle({
                [side]: updatedCharacters,
            })
        );

        return displacements;
    };
};

const checkHandleMovement = ({
    action,
    side,
    selectedIndex: to,
    actorIndex: from,
    context,
}: {
    action: Action;
    side: BATTLEFIELD_SIDES;
    selectedIndex: number;
    actorIndex: number;
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        const { movement } = action;
        if (!movement) {
            return;
        }

        const characters = getState().battle[side];
        // to === from: this is legacy from when enemies use a movement ability.
        // It's classified as a "self" ability, so they target themselves when they cast it, hence `to` and `from` indices will be the same for them.
        // Make them move randomly still, if that's the case.
        if (isNaN(to) || to === from) {
            const moveIndices = getPossibleMoveIndices({ currentLocationIndex: from, friendly: characters, action });
            to = getRandomItem(moveIndices);
        }

        if (isNaN(to)) {
            return;
        }

        const newCharacters = characters.slice();
        const temp = newCharacters[to];
        newCharacters[to] = newCharacters[from];
        newCharacters[from] = temp;

        dispatch(
            updateBattle({
                [side]: newCharacters,
            })
        );
        // Triggering effect events before event queue push of the main ability may play events out of the intended order, especially
        // if anything reacts to the movement.
        newCharacters.forEach((combatant) => {
            if (combatant) {
                dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onFriendlyMove, context }));
            }
        });

        const displacements = {};
        if (newCharacters[from]?.id) {
            displacements[newCharacters[from].id] = { from: to, to: from, side };
        }

        if (newCharacters[to]?.id) {
            displacements[newCharacters[to].id] = { from, to, side };
        }
        return displacements;
    };
};

export const enqueueEvent = ({
    action,
    actorId,
    selectedIndex,
    allTargetIndices,
    actionParent,
    targetSide,
    playbackTime,
    newCombatants,
    context,
    newCards,
    cardsAddedTo,
    displacements,
    statUpdates,
    options,
}: {
    action?: Action;
    actorId?: string;
    selectedIndex?: number;
    allTargetIndices?: number[];
    actionParent?: Ability | Action | Item | CombatEffect;
    targetSide?: BATTLEFIELD_SIDES;
    playbackTime?: number; // MS
    context?: ActionContext;
    newCombatants?: Combatant[];
    displacements?: Displacement;
    newCards?: CombatAbility[];
    cardsAddedTo?: CardPileType;
    statUpdates?: { [combatantId: string]: UpdatedCombatantStats };
    options?: { alwaysGroup: boolean };
}) => {
    return (dispatch, getState) => {
        playbackTime = action?.playbackTime || playbackTime;
        if (!playbackTime) {
            if (!action) {
                playbackTime = NORMAL_ACTION_PLAYBACK_SPEED;
            } else if (action.animationOptions?.ricochet) {
                const playbackMultiple = allTargetIndices.length > 1 ? (RICOCHET_ACTION_PLAYBACK_SPEED / 3) * allTargetIndices.length : 0;
                playbackTime = RICOCHET_ACTION_PLAYBACK_SPEED + playbackMultiple;
            } else if ((actionParent as Ability)?.actions?.length > 1) {
                playbackTime = MULTI_ACTION_PLAYBACK_SPEED;
            } else if (action.type === ACTION_TYPES.RANGE_ATTACK) {
                playbackTime = RANGED_ACTION_PLAYBACK_SPEED;
            } else {
                playbackTime = NORMAL_ACTION_PLAYBACK_SPEED;
            }
        }

        const collector: PlaybackCollector | undefined = context?.playbackCollector;
        const addCards =
            newCards?.length > 0
                ? [
                      {
                          cards: newCards,
                          cardsAddedTo,
                      },
                  ]
                : [];

        const battle: BattleState = getState().battle;
        const event: Event = {
            playerSide: battle.playerSide,
            enemySide: battle.enemySide,
            action,
            actorId,
            id: uuid.v4(),
            selectedIndex,
            // HACK: ensure that the selected index and "extra target indices" are hit first in playback
            allTargetIndices,
            targetSide: targetSide,
            actionParent,
            source: context?.sourceChain?.at(-1),
            playbackTime,
            newCombatants: newCombatants || [],
            displacements,
            statUpdates,
            addCards,
        };

        if (collector) {
            collector.collect(event, options?.alwaysGroup);
            return;
        }

        dispatch(
            pushEventQueue({
                ...event,
                name: (event.actionParent as Ability)?.name,
                image: (event.actionParent as Ability)?.image,
                playbackTime: event.playbackTime || event.action?.playbackTime,
                events: [event],
                addCards,
            })
        );
    };
};

const checkHandleAutoCast = ({
    autoCastAbilities,
    actor,
    parentAbility,
    multiplier = 1,
    context,
}: {
    autoCastAbilities: AutoCastAbility;
    actor: any; // This is expected to be the player
    parentAbility?: CombatAbility;
    multiplier?: number;
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        if (!autoCastAbilities || !actor.class) {
            return;
        }

        const { type, amount, presetCards = [], filters, upgradeLevels = 0 } = autoCastAbilities;
        let cards = [];
        if (type === AUTO_CAST_ABILITY_TYPES.FROM_CLASS) {
            cards = JOB_CARD_MAP[actor.class]?.all || [];
        } else if (type === AUTO_CAST_ABILITY_TYPES.PRESET_CARDS) {
            cards = presetCards;
        } else if (type === AUTO_CAST_ABILITY_TYPES.OFFENSE_FROM_CLASS) {
            cards = (JOB_CARD_MAP[actor.class]?.all || []).filter(isOffensiveAbility);
        } else if (type === AUTO_CAST_ABILITY_TYPES.FROM_DECK) {
            cards = getState().battle.deck.slice();
        }

        if (filters) {
            cards = cards.filter((card) => {
                return filters.every(({ property, comparator, value }) =>
                    passesValueComparison({ val: card[property], otherVal: value, comparator })
                );
            });
        }

        if (!cards.length) {
            return;
        }

        Array.from({ length: amount * multiplier }).forEach(() => {
            let unmodifiedAbility: CombatAbility;

            if (type === AUTO_CAST_ABILITY_TYPES.FROM_DECK) {
                unmodifiedAbility = cards.shift();
            } else {
                unmodifiedAbility = getRandomItem(cards);
            }

            if (!unmodifiedAbility) {
                return;
            }

            let abilityToCast: CombatAbility = unmodifiedAbility;

            Array.from({ length: upgradeLevels }).forEach(() => {
                const upgrade = getUpgradeCard(abilityToCast, { ignoreMaxLevel: true });
                if (upgrade) {
                    abilityToCast = upgrade;
                }
            });
            const { resourceCost: abilityCost, selectCards } = abilityToCast;

            const drawAbilityEffects = abilityToCast.onDraw?.abilityEffects;
            if (type === AUTO_CAST_ABILITY_TYPES.FROM_DECK && drawAbilityEffects) {
                const playerSide = getState().battle.playerSide;
                abilityToCast = applyAbilityEffectsOnDraw({
                    drawnCard: abilityToCast,
                    source: context?.sourceChain?.at(-1),
                    playerSide,
                    effects: drawAbilityEffects,
                });
            }

            // selectCards on ability is currently always deplete as a prerequisite to using the ability. So deplete an ability here.
            if (selectCards) {
                const { type } = selectCards;

                const { hand, deck, discard, playerSide } = getState().battle;
                const player = playerSide.find((c: Combatant | null) => c?.isPlayer);

                const card = getRandomItem(
                    getCardSelection({
                        hand,
                        deck,
                        discard,
                        selectCards: selectCards,
                        selectedAbilityId: parentAbility?.instanceId,
                        player,
                    })
                );

                if (card) {
                    if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
                        dispatch(depleteAbilities({ actorId: actor.id, abilities: [card] }));
                    } else {
                        dispatch(updateBattle({ hand: [...hand, card] }));
                    }
                }
            }

            // Order matters: if Vault draws another Vault, the upgrades could cause an infinite loop if the card is not
            // removed from the deck before using the ability
            if (type === AUTO_CAST_ABILITY_TYPES.FROM_DECK) {
                const newDeck = getState().battle.deck.filter((card: CombatAbility) => card.instanceId !== unmodifiedAbility.instanceId);
                dispatch(
                    updateBattle({
                        deck: newDeck,
                    })
                );
                dispatch(handleDiscard(unmodifiedAbility));
            }
            // Auto-casted ability costs 0 unless it is a variable cost ability
            const resourceCost = abilityCost !== "x" ? 0 : abilityCost;

            // instanceId: undefined -- only "cards" should have ids, not auto casted abilities.
            // Issue where Astral Rewind was grabbing abilities casted from Metronome.
            dispatch(
                useAbility({
                    ability: {
                        ...abilityToCast,
                        resourceCost,
                        instanceId: type === AUTO_CAST_ABILITY_TYPES.FROM_DECK ? abilityToCast.instanceId : undefined,
                    },
                    actorId: actor.id,
                    isAutoCast: true,
                    playbackCollector: context?.playbackCollector,
                })
            );
        });
    };
};

export const calculateTargetIndices = ({
    action,
    selectedIndex,
    side,
    actorData,
    targetData,
    battle,
    source,
    isPreviewMode = false,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    actorData: CombatantInfo;
    targetData: CombatantInfo;
    battle: BattleState;
    source?: TriggerSource;
    isPreviewMode: boolean;
}): {
    allIndices: number[];
    targetedIndices: number[];
} => {
    const { numTargets: extraTargets = 0, excludePrimaryTarget, resurrect, affectsDeadCharacters, targetArea = 0, targetName } = action;

    const area = calculateActionArea({ action, actor: actorData, target: targetData, source });

    let extraTargetIndices = getValidTargetIndices(battle[side], action.area, {
        excludeStealth: action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK,
        excludeIndex: selectedIndex,
    }).filter((i) => Math.abs(i - selectedIndex) <= targetArea);

    if (!isPreviewMode) {
        extraTargetIndices = shuffle(extraTargetIndices).slice(0, extraTargets);
    }

    const isAffected = (combatant: Combatant | null, i: number): boolean => {
        // When summoning a minion, it can auto attack an enemy target. Display that proc as an indeterminate ability.
        const isProcPreview = isPreviewMode && source?.isProc && isOffensiveAction(action) && side === BATTLEFIELD_SIDES.ENEMY_SIDE;
        if (isProcPreview) {
            return true;
        }

        const inArea = [selectedIndex, ...extraTargetIndices].some((j) => Math.abs(j - i) <= area);

        if (excludePrimaryTarget) {
            return inArea && i !== selectedIndex;
        }

        if (targetName && targetName === combatant?.name) {
            return true;
        }

        return inArea;
    };

    const isTargetableCombatant = (combatant: Combatant): boolean => {
        return combatant && (combatant?.HP > 0 || resurrect || affectsDeadCharacters);
    };

    const combatants = battle[side];
    const allIndices = [];
    const targetedIndices = [];

    combatants.forEach((combatant: Combatant | null, i: number) => {
        if (isAffected(combatant, i)) {
            if (isTargetableCombatant(combatant)) {
                targetedIndices.push(i);
            }
            allIndices.push(i);
        }
    });

    return {
        allIndices,
        targetedIndices,
    };
};

const handleSecondaryAction = ({
    secondaryAction,
    actorId,
    getCalculationTarget,
    context,
    parentContext,
    updatedStatsProps,
    isAutoCast,
}: {
    secondaryAction: ActionOptionalProperties & { isPriority?: boolean; returnParentCardToHand?: boolean };
    actorId: string;
    getCalculationTarget: (
        calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES
    ) => CombatantInfo | CombatantInfo[] | CombatAbility | BattleState | CombatEffect | undefined;
    context: ActionContext;
    parentContext: ActionContext;
    updatedStatsProps: any;
    isAutoCast: boolean;
}) => {
    return (dispatch, getState): { statUpdate: UpdatedCombatantStats; action: Action; actorId?: string }[] => {
        const source = context?.sourceChain.at(-1);
        if (!secondaryAction || !passesConditions({ getCalculationTarget, proc: secondaryAction, source })) {
            return;
        }

        const actorData = findCombatantData(getState().battle, actorId);
        secondaryAction = {
            ...secondaryAction,
            type: secondaryAction.type || ACTION_TYPES.NONE,
            target: secondaryAction.target || TARGET_TYPES.SELF,
        };

        const combatant = actorData?.combatant;
        if (!combatant?.HP) {
            return;
        }

        const battle = getState().battle;

        const target = autoSelectActionTarget({
            action: secondaryAction,
            actorId: actorData?.combatant.id,
            battle,
        });

        const targetId = battle[target?.side]?.[target.index]?.id;
        const targetData = findCombatantData(battle, targetId);
        if (!targetData) {
            return [];
        }

        const recipientIndices = calculateTargetIndices({
            action: secondaryAction,
            selectedIndex: target.index,
            side: target.side,
            actorData,
            targetData,
            battle,
            isPreviewMode: context?.isPreviewMode,
            source,
        });

        const recipientIds = recipientIndices.targetedIndices.map((i: number) => targetData.friendly[i]?.id).filter(Boolean);
        const updatedSecondary = getUpdatedStats({
            ...updatedStatsProps,
            actorId,
            targetIds: source.allTargetIds,
            recipientIds,
            selectedIndex: target.index,
            action: secondaryAction,
        });
        dispatch(applyStatChanges(updatedSecondary.map(({ statUpdate }) => statUpdate)));

        if (secondaryAction.returnParentCardToHand) {
            // Tada, it copies and deletes the old card, and adds the copy with a new id to the hand
            const ability: CombatAbility | undefined = source?.source as CombatAbility;
            dispatch(deleteCard(ability.instanceId));
            const cardCopy: CombatAbility = {
                ...ability,
                effects: ability?.effects.filter((e: AbilityEffect) => {
                    // TODO retain upgrades, but look for a less hard-baked way to do this
                    return e.upgradedByLevels;
                }),
            };

            dispatch(
                checkCardActions({
                    action: {
                        type: ACTION_TYPES.EFFECT,
                        addCards: [cardCopy],
                    },
                    context: parentContext,
                })
            );
        }
        dispatch(
            triggerStatChangeEvents(
                updatedSecondary.map(({ statUpdate }) => ({
                    statUpdate,
                    source: context,
                }))
            )
        );

        dispatch(checkInduce({ action: secondaryAction, affectedTargetIds: recipientIds, parentContext: context }));
        dispatch(checkCardActions({ action: secondaryAction, context: parentContext, isAutoCast }));
        return updatedSecondary;
    };
};

export const performAction = ({
    action,
    selectedIndex,
    side,
    actorId,
    parentContext,
    isAutoCast,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    actorId: string;
    parentContext?: ActionContext;
    isAutoCast?: boolean;
}) => {
    return (dispatch, getState) => {
        const actorData: CombatantInfo | undefined = findCombatantData(getState().battle, actorId);
        if (!actorData || !side) {
            return;
        }

        const battleSide = getState().battle[side];
        const target = findCombatantData(getState().battle, battleSide[selectedIndex]?.id);

        const { vacuum, secondaryAction, autoCastAbilities, retreat } = action;
        const combatants = getState().battle[side];
        const parentSource = parentContext?.sourceChain.at(-1);

        const targetIndices = calculateTargetIndices({
            action,
            selectedIndex,
            side,
            actorData,
            targetData: target,
            battle: getState().battle,
            source: parentSource,
            isPreviewMode: parentContext?.isPreviewMode,
        });

        const targetIds = targetIndices.targetedIndices.map((i: number) => combatants[i]?.id).filter(Boolean);

        // Don't try to target things that are all gone/dead.
        // Amendment: unless it is a friendly-side ability such as a summon. There was an issue where the Dark Lord clone reveal was broken by this.
        if (isOffensiveAction(action) && targetIds.length === 0) {
            return;
        }

        const source: TriggerSource = {
            ...parentSource,
            actorId,
            targetId: combatants[selectedIndex]?.id || targetIds[0],
            allTargetIds: targetIds,
        };
        const context: ActionContext = { ...parentContext, sourceChain: [...(parentContext?.sourceChain || []), source] };

        const getCalculationTarget = (targetType: CONDITION_TARGETS): CombatantInfo => {
            if (targetType === CONDITION_TARGETS.TARGET) {
                // This is the primary target only
                return findCombatantData(getState().battle, combatants[selectedIndex]?.id);
            } else if (targetType === CONDITION_TARGETS.ACTOR) {
                return findCombatantData(getState().battle, actorId);
            }
        };

        const updatedStatsProps = {
            ...getState().battle,
            selectedIndex,
            action,
            targetIds,
            actorId,
            actionParent: parentSource?.source,
            context,
            getCombatantById: (id: string) => findCombatantData(getState().battle, id),
        };

        let updatedSecondary: { statUpdate: UpdatedCombatantStats; action: Action; actorId?: string }[] | undefined;
        const triggerSecondaryAction = () => {
            return dispatch(
                handleSecondaryAction({
                    secondaryAction,
                    actorId,
                    getCalculationTarget,
                    context,
                    parentContext,
                    updatedStatsProps,
                    isAutoCast,
                })
            );
        };

        if (secondaryAction?.isPriority) {
            updatedSecondary = triggerSecondaryAction();
        }

        const area = calculateActionArea({ action, actor: actorData, target, source });

        const vacuumDisplacements: Displacement = dispatch(checkHandleVacuum({ vacuum, side, selectedIndex, area }));
        const movementDisplacements: Displacement = dispatch(
            checkHandleMovement({ action, side, actorIndex: actorData.index, selectedIndex, context: context })
        );
        // At the moment there is never both a vacuum AND a movement in one action. It's either one or the other. So we can 'safely' merge the displacement results of both.
        const displacements: Displacement = {
            ...vacuumDisplacements,
            ...movementDisplacements,
        };

        const updated: { statUpdate: UpdatedCombatantStats; action: Action }[] = getUpdatedStats(updatedStatsProps);
        dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));

        const hitTriggerSource: TriggerSource = {
            ...source,
            type: TRIGGER_SOURCE_TYPES.ACTION,
            source: action,
        };
        // Include life on hit and thorns in the same action playback as the actual attack (con't below*)
        const hitEffects: { statUpdate: UpdatedCombatantStats; action: Action }[][] = getHitEffects({
            actorId,
            action,
            affectedTargets: targetIds,
            context: { ...context, sourceChain: [...(context?.sourceChain || []), source, hitTriggerSource] },
            getState,
        });
        hitEffects.forEach((statChanges) => {
            dispatch(applyStatChanges(statChanges.map(({ statUpdate }) => statUpdate)));
        });

        let aggregated = {};
        const allStatUpdates = [...hitEffects.flat(), ...updated, ...(updatedSecondary ?? [])];

        allStatUpdates.forEach(({ statUpdate }) => {
            const { combatantId } = statUpdate;

            aggregated = aggregateStatUpdates(aggregated, { [combatantId]: statUpdate });
        });

        // HACK: ensure that the selected index is hit first in playback
        const allTargetIndices = uniq([selectedIndex, ...targetIndices.allIndices]);

        dispatch(
            enqueueEvent({
                action,
                actionParent: parentSource?.source,
                actorId,
                selectedIndex,
                allTargetIndices,
                targetSide: side,
                context: context,
                displacements,
                statUpdates: aggregated,
            })
        );

        dispatch(
            triggerStatChangeEvents(
                updated.map(({ statUpdate, action }) => ({
                    statUpdate,
                    context: { ...context, context: action },
                }))
            )
        );

        if (!secondaryAction?.isPriority) {
            updatedSecondary = triggerSecondaryAction();
        }

        // *But don't trigger the related effect events until after the action has resolved
        hitEffects.forEach((statChanges) => {
            dispatch(
                triggerStatChangeEvents(
                    statChanges.map(({ statUpdate, action }) => ({
                        statUpdate,
                        context: {
                            ...context,
                            sourceChain: [...(context?.sourceChain || []), source, { ...hitTriggerSource, source: action }],
                            statUpdate,
                        } as ActionContext,
                    }))
                )
            );
        });

        // Same reasoning as hitEffects
        if (updatedSecondary) {
            dispatch(
                triggerStatChangeEvents(
                    updatedSecondary.map(({ statUpdate, action }) => ({
                        statUpdate,
                        context: { ...context, context: action, statUpdate },
                    }))
                )
            );
        }

        dispatch(checkCastRadiate({ parentContext: parentContext, action, selectedIndex, side }));

        // If eg. a bonus card draw was applied during the stat update action, checkCardActions should consume it.
        // Does secondaryAction need the same thing?
        const postUpdateAction = updated?.[0]?.action || action;
        dispatch(checkCardActions({ action: postUpdateAction, context: parentContext, isAutoCast }));

        const multiplier = getMultiplier({
            multiplier: action.multiplier,
            actor: actorData,
            ...getState().battle,
        });
        dispatch(
            checkHandleAutoCast({
                autoCastAbilities,
                actor: actorData.combatant,
                parentAbility: parent as any,
                multiplier,
                context,
            })
        );
        dispatch(
            onAction({
                action,
                context,
            })
        );

        dispatch(
            handleOnReceiveAction({
                updatedStats: updated,
                context: context,
                combatants,
            })
        );
        dispatch(checkHandleActionSummon({ action, actorId, parentContext }));
        dispatch(checkHandleMorph({ action, morphTargetIds: targetIds, actorId, parentContext }));
        dispatch(checkInduce({ action, affectedTargetIds: targetIds, parentContext }));
        if (retreat) {
            const { friendly, friendlySide } = findCombatantData(getState().battle, actorId);
            dispatch(
                updateBattle({
                    [friendlySide]: friendly.map((combatant) => {
                        if (combatant?.id === actorId) {
                            return null;
                        }

                        return combatant;
                    }),
                })
            );
        }
    };
};

export const pickHostileIndex = ({
    targetIndices,
    actorData,
}: {
    targetIndices: number[];
    actorData: CombatantInfo;
}): number | undefined => {
    const actorIndex = actorData.index;

    let baseProbability = 1 / targetIndices.length;
    // Enemies are more likely to attack targets closer to them. 0 proximity: +25%, 1 proximity: +15%; 2: +5%
    if (targetIndices.includes(actorIndex) && Math.random() < baseProbability + 0.25) {
        return actorIndex;
    }

    const adjacent = targetIndices.filter((index) => Math.abs(index - actorIndex) === 1);
    if (adjacent.length && Math.random() < baseProbability + 0.15) {
        return getRandomItem(adjacent);
    }

    const outer = targetIndices.filter((index) => Math.abs(index - actorIndex) === 2);
    if (outer.length && Math.random() < baseProbability + 0.05) {
        return getRandomItem(outer);
    }

    const rest = targetIndices.filter((index) => Math.abs(index - actorIndex) > 2);
    if (rest.length) {
        return getRandomItem(rest);
    }

    return getRandomItem(targetIndices);
};

export const getValidTargetIndicesForAction = ({
    initialSelectedIndex,
    initialSelectedSide,
    action,
    actorData,
}: {
    initialSelectedIndex?: number;
    initialSelectedSide?: BATTLEFIELD_SIDES;
    action: Action;
    actorData: CombatantInfo;
}): { index: number | undefined; side: BATTLEFIELD_SIDES | undefined }[] => {
    let isPlayerHostile: boolean | undefined;
    const { friendly, hostile, friendlySide, hostileSide, combatant, index } = actorData;
    const actorId = combatant?.id;
    const { targetArea: area = 0, target, targetName, excludeActor, radiate } = action || {};

    if (radiate) {
        return [
            {
                index,
                side: friendlySide,
            },
        ];
    }

    if (target === TARGET_TYPES.PLAYER) {
        const friendlyPlayerIndex = friendly.findIndex((combatant) => combatant?.isPlayer);
        if (friendlyPlayerIndex > -1) {
            return [
                {
                    index: friendlyPlayerIndex,
                    side: friendlySide,
                },
            ];
        }

        const hostilePlayerIndex = hostile.findIndex((combatant) => combatant?.isPlayer);
        const targetIndices = getValidTargetIndices(hostile, action.area, {
            excludeStealth: true,
            onlyTaunt: true,
            onlyPriorityTarget: true,
        }).filter((i) => {
            return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
        });

        if (hostilePlayerIndex > -1 && targetIndices.includes(hostilePlayerIndex)) {
            return [
                {
                    index: hostilePlayerIndex,
                    side: hostileSide,
                },
            ];
        }

        isPlayerHostile = hostilePlayerIndex > -1;
    }

    const noValidSelection = typeof initialSelectedIndex !== "number" || !initialSelectedSide;

    if ((target === TARGET_TYPES.HOSTILE || isPlayerHostile) && (noValidSelection || initialSelectedSide === friendlySide)) {
        return getValidTargetIndices(hostile, action.area, {
            excludeStealth: !hasTruesight(actorData.combatant),
            onlyTaunt: true,
            onlyPriorityTarget: true,
        })
            .filter((i) => {
                return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
            })
            .map((index) => ({ index, side: hostileSide }));
    }

    if (target === TARGET_TYPES.RANDOM_HOSTILE || isPlayerHostile) {
        const targetIndices = getValidTargetIndices(hostile, action.area, { onlyTaunt: true, onlyPriorityTarget: true })
            .filter((i) => {
                return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
            })
            .map((index) => ({ index, side: hostileSide }));

        if (targetIndices.length) {
            return targetIndices;
        }

        const hostilePlayerIndex = hostile.findIndex((combatant) => combatant?.isPlayer);
        return [
            {
                index: hostilePlayerIndex,
                side: hostileSide,
            },
        ];
    }

    if (
        target === TARGET_TYPES.RANDOM_FRIENDLY ||
        (target === TARGET_TYPES.FRIENDLY && (noValidSelection || initialSelectedSide === hostileSide))
    ) {
        const targetIndices = getValidTargetIndices(friendly, action.area, { excludeUntargetable: false }).filter((i) => {
            if (excludeActor && actorId && friendly[i]?.id === actorId) {
                return false;
            }

            return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
        });

        return [
            {
                index: getRandomItem(targetIndices),
                side: friendlySide,
            },
        ];
    }

    if (target === TARGET_TYPES.SELF) {
        return [
            {
                index: friendly.findIndex((ally) => ally?.id === actorId),
                side: friendlySide,
            },
        ];
    }

    if (target === TARGET_TYPES.FRIENDLY_CHARACTER) {
        const index = friendly.findIndex((ally) => ally?.name === targetName);
        if (index > -1) {
            return [
                {
                    index,
                    side: friendlySide,
                },
            ];
        }
    }

    if (target === TARGET_TYPES.HOSTILE_CHARACTER) {
        const index = hostile.findIndex((ally) => ally?.name === targetName);
        if (index > -1) {
            return [
                {
                    index,
                    side: hostileSide,
                },
            ];
        }
    }

    return [{ index: initialSelectedIndex, side: initialSelectedSide }];
};

/**
 * Sometimes, multi-action abilities have you select an enemy, but then have an additional action that eg. targets yourself.
 * This orients the target to the right place (if applicable) as actions are parsed.
 */
export const autoSelectActionTarget = ({
    initialSelectedIndex,
    initialSelectedSide,
    action,
    actorId,
    battle: battle,
}: {
    initialSelectedIndex?: number;
    initialSelectedSide?: BATTLEFIELD_SIDES;
    action: Action;
    actorId: string;
    battle: BattleState;
}): { index: number | undefined; side: BATTLEFIELD_SIDES | undefined } => {
    const actorData = findCombatantData(battle, actorId);
    if (!actorData) {
        return { index: undefined, side: undefined };
    }

    const indices = getValidTargetIndicesForAction({
        initialSelectedIndex,
        initialSelectedSide,
        action,
        actorData,
    });

    if (indices.length === 1) {
        return indices[0];
    }

    if (indices.length > 1) {
        const noValidSelection = typeof initialSelectedIndex !== "number" || !initialSelectedSide;
        if (action?.target === TARGET_TYPES.HOSTILE && noValidSelection) {
            const index = pickHostileIndex({ targetIndices: indices.map((item) => item.index), actorData });
            return { index, side: indices[0].side };
        }
        return getRandomItem(indices);
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
    parentContext: parentContext,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    parentContext: ActionContext;
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
                parentContext: parentContext,
            })
        );
    };
};

const tributeKill = ({
    tributeSummon,
    resourceCost,
    actor,
    side,
    index,
    parentContext,
}: {
    tributeSummon?: boolean;
    resourceCost: number | "x";
    actor?: Combatant;
    side: BATTLEFIELD_SIDES;
    index: number;
    parentContext?: ActionContext;
}) => {
    return (dispatch) => {
        if (typeof index !== "number") {
            return;
        }

        const actorResources = actor?.resources || 0;

        const action = {
            flatDamage: Infinity,
            type: ACTION_TYPES.NONE,
            playbackTime: 750,
            secondaryAction: tributeSummon
                ? {
                      resources: resourceCost === "x" ? actorResources : resourceCost,
                  }
                : undefined,
        };

        const source: TriggerSource = {
            isTribute: true,
            type: TRIGGER_SOURCE_TYPES.ACTION,
            source: action,
        };
        // The replaced minion dies
        dispatch(
            performAction({
                action,
                side,
                parentContext: { ...parentContext, sourceChain: [...(parentContext?.sourceChain || []), source] },
                selectedIndex: index,
                actorId: actor?.id, // The actor is considered to have killed it
            })
        );
    };
};

/**
 * This is for player ability.minion handling only. Randomized summons from actions are handled at checkHandleActionSummon.
 */
export const checkSummonMinion = ({
    ability,
    selectedIndex,
    side,
    actorId,
    parentContext,
    isAutoCast,
}: {
    side: BATTLEFIELD_SIDES;
    selectedIndex: number;
    ability: CombatAbility;
    actorId: string;
    parentContext: ActionContext;
    isAutoCast?: boolean;
}) => {
    return (dispatch, getState) => {
        const { minion, minionOptions, resourceCost = 0 } = ability;
        if (!minion) {
            return;
        }

        const battlefieldSide = getState().battle[side];
        const pickRandomSummonIndex = () => {
            if (isAutoCast) {
                const indices = battlefieldSide.map((_, i) => i).filter((_, i) => !battlefieldSide[i]?.isPlayer);
                return getRandomItem(indices);
            }
            return getRandomItem(getPossibleSummonIndices(battlefieldSide));
        };
        const index = typeof selectedIndex === "number" ? selectedIndex : pickRandomSummonIndex();
        const previousMinionInSlot = battlefieldSide[index];
        const isKillPreviousMinion = previousMinionInSlot?.HP > 0;
        const minionEffects = minion.effects?.slice() || [];
        if (isKillPreviousMinion) {
            minionEffects.push(tributeSummonBuff);
        }

        const actor = findCombatantData(getState().battle, actorId)?.combatant;
        if (actor?.isPlayer) {
            const itemEffects = actor.items.reduce((acc, item: Item) => {
                if (item.applyEffectsToSummons) {
                    acc.push(...(item.effects || []));
                }
                return acc;
            }, []);
            minionEffects.push(...itemEffects);
        }

        const baseMinion = cloneDeep({ ...minion, effects: minionEffects });
        const summonedMinion: Combatant = createCombatant(baseMinion);

        if (isKillPreviousMinion) {
            const { tributeSummon } = minionOptions || {};
            dispatch(tributeKill({ tributeSummon, resourceCost, actor, side, index }));
        }

        const newBattleProps: {
            playerSide?: (Combatant | null)[];
            enemySide?: (Combatant | null)[];
        } = {
            [side]: getState().battle[side].map((combatant: Combatant | null, i: number) => {
                return i === index ? summonedMinion : combatant;
            }),
        };

        dispatch(updateBattle(newBattleProps));

        // Give minions time to appear before triggering any minion-related effect events.
        // Issue where enemies who automatically attacked summoned minions would fly off to 0, 0 since minions had not rendered
        dispatch(
            enqueueEvent({
                playbackTime: SUMMON_DELAY,
                newCombatants: [summonedMinion],
                context: parentContext,
            })
        );

        // Tribute summons count as a kill for the new minion
        if (isKillPreviousMinion) {
            dispatch(checkEventTrigger({ combatantId: summonedMinion.id, effectEventKey: EFFECT_EVENT_KEYS.onKill }));
        }
        dispatch(onSummonTriggers({ summonedId: summonedMinion.id, summonerId: actorId, parentContext }));

        dispatch(updateEnemyTargetingAfterEffectsApplied({ combatantId: summonedMinion.id, effectsApplied: summonedMinion.effects }));
    };
};

export const useAbility = ({
    ability,
    selectedIndex,
    side: initialSide,
    actorId,
    isAutoCast,
    isProc,
    playbackCollector,
}: {
    side?: BATTLEFIELD_SIDES;
    selectedIndex?: number;
    ability: CombatAbility | Ability;
    actorId: string;
    isAutoCast?: boolean;
    isProc?: boolean;
    playbackCollector?: PlaybackCollector;
}) => {
    return (dispatch, getState) => {
        // @ts-ignore -- We're providing a fallback so it doesn't matter whether effects exists or not
        const { resourceCost = 0, actions = [], effects = [] } = getAbilityUpgradedFromEffects({ ability }) as CombatAbility;
        const { combatant, friendlySide } = findCombatantData(getState().battle, actorId) || {};

        const totalResourceCost = getAbilityResourceCost({ combatant, resourceCost, effects });
        ability = {
            ...ability,
            resourceCost: totalResourceCost, // Primarily used for calculating resourceCost === 'x' multiplier
        };

        const resourceSpend = { resources: -totalResourceCost, combatantId: combatant.id };

        if (!isAutoCast) {
            dispatch(applyStatChanges([resourceSpend]));
        }

        const source: TriggerSource = { type: TRIGGER_SOURCE_TYPES.ABILITY, source: ability, actorId, isProc };
        const parentContext: ActionContext = { sourceChain: [source], playbackCollector, triggerHistory: [], isProc };

        dispatch(checkSummonMinion({ ability, selectedIndex, side: friendlySide, actorId, parentContext, isAutoCast }));

        const { target: initialTarget } = actions[0] || {};

        // This could become stale between actions but not an issue at the time of implementation. Only Curse Eye applies this effect.
        const isEffectRandomTargeting = combatant.effects?.some((e) => e.hitRandomTarget);

        let prevSelection;

        const handleAction = (action: Action, i: number) => {
            const actorInfo = findCombatantData(getState().battle, actorId);
            const actor = actorInfo?.combatant;
            // Something could've happened between actions that killed the actor
            const canAct = actor?.HP > 0 && !isTurnActionPrevented(actorInfo, { bypassPreventTurnAction: action.bypassPreventTurnAction });
            if (!canAct) {
                return;
            }

            let selection;

            const targetingAbility = actor.targeting?.ability;
            const selectedActionTargets = actor.targeting?.actionTargets?.[i];
            if (targetingAbility?.name === ability.name && typeof selectedActionTargets?.index === "number") {
                selection = selectedActionTargets;
            } else if (isEffectRandomTargeting && action.target === TARGET_TYPES.HOSTILE) {
                selection = autoSelectActionTarget({
                    initialSelectedIndex: selectedIndex,
                    initialSelectedSide: initialSide,
                    action: {
                        ...action,
                        target: TARGET_TYPES.RANDOM_HOSTILE,
                    },
                    actorId,
                    battle: getState().battle,
                });
            }
            // If it is a multi-hit ability, the attacks should go to the same target
            else if (action.target === TARGET_TYPES.HOSTILE && action.target === initialTarget && prevSelection) {
                selection = prevSelection;
            } else {
                selection = autoSelectActionTarget({
                    initialSelectedIndex: selectedIndex,
                    initialSelectedSide: initialSide,
                    action,
                    actorId,
                    battle: getState().battle,
                });

                prevSelection = selection;
            }

            const { side, index } = selection;

            const getCalculationTarget = (calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES): CombatantInfo | BattleState => {
                if (calculationTarget === CONDITION_TARGETS.BATTLE) {
                    return getState().battle;
                }
                if (calculationTarget === CONDITION_TARGETS.ACTOR) {
                    return findCombatantData(getState().battle, actorId);
                }

                return findCombatantData(getState().battle, getState().battle[side]?.[index]?.id);
            };

            if (passesConditions({ getCalculationTarget, proc: action, source })) {
                dispatch(performAction({ action, selectedIndex: index, side, actorId, parentContext, isAutoCast }));
            }
        };

        if (resourceCost === "x") {
            const numTimesToCast = isAutoCast ? getRandomInt(1, 3) : totalResourceCost;
            Array.from({ length: numTimesToCast }).forEach(() => {
                actions.forEach(handleAction);
            });
        } else {
            actions.forEach(handleAction);
        }

        // Resource spend events triggered down here due to Bounce otherwise causing Furious Strike to be discarded
        if (!isAutoCast) {
            dispatch(triggerStatChangeEvents([{ statUpdate: resourceSpend, context: parentContext }]));
        }

        const actorInfo = findCombatantData(getState().battle, actorId);
        // Due to morph, the combatant may no longer exist
        if (actorInfo) {
            dispatch(onUseAbility({ actorInfo, context: parentContext, ability, isAutoCast }));
        }
    };
};

export const useItem = ({
    itemIndex,
    actorId,
    playbackCollector,
}: {
    itemIndex: number;
    actorId: string;
    playbackCollector: PlaybackCollector;
}) => {
    return (dispatch, getState) => {
        const { index, friendlySide, combatant } = findCombatantData(getState().battle, actorId) || {};
        if (!friendlySide) {
            return;
        }

        const item = combatant.items[itemIndex];

        const source = { type: TRIGGER_SOURCE_TYPES.ITEM, source: item, actorId, targetId: actorId, allTargetIds: [actorId] };

        const context: ActionContext = {
            sourceChain: [source],
            triggerHistory: [],
            playbackCollector,
        };

        dispatch(
            performAction({
                action: {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    healing: item.healing,
                    resources: item.resources,
                    effects: item.effects,
                    icon: item.image,
                    animation: ANIMATION_TYPES.CONSUMABLE,
                },
                actorId,
                selectedIndex: index,
                side: friendlySide,
                parentContext: context,
            })
        );

        dispatch(
            updateCombatant({
                combatantId: actorId,
                newProperties: {
                    items: findCombatantData(getState().battle, actorId)?.combatant?.items.filter((item, i) => i !== itemIndex),
                },
            })
        );
    };
};

const onUseAbility =
    ({
        actorInfo,
        context,
        ability,
        isAutoCast,
    }: {
        actorInfo: CombatantInfo;
        context: ActionContext;
        ability: CombatAbility;
        isAutoCast?: boolean;
    }) =>
    (dispatch) => {
        if (!actorInfo) {
            return;
        }

        const { combatant: actor } = actorInfo;
        if (!actor) {
            return;
        }

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
                context: context,
            })
        );

        ability?.effects?.forEach((effect) => {
            if (effect.onUse?.ability) {
                dispatch(
                    useAbility({
                        ability: effect.onUse?.ability,
                        actorId: actor.id,
                        isProc: true,
                        playbackCollector: context.playbackCollector,
                    })
                );
            }
        });

        if (isOffensiveAbility(ability)) {
            dispatch(
                checkEventTrigger({
                    combatantId: actor.id,
                    effectEventKey: EFFECT_EVENT_KEYS.onOffensiveAbility,
                    context: context,
                })
            );
        } else if (isSupportAbility(ability)) {
            dispatch(
                checkEventTrigger({
                    combatantId: actor.id,
                    effectEventKey: EFFECT_EVENT_KEYS.onSupportAbility,
                    context: context,
                })
            );
        }

        actorInfo.hostile.forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onHostileAbility,
                        context: context,
                    })
                );

                if (actor.isPlayer) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onPlayerAbility,
                            context: context,
                        })
                    );
                }

                if (isSupportAbility(ability)) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onHostileSupportAbility,
                            context: context,
                        })
                    );
                }
            }
        });

        actorInfo.friendly.forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onFriendlyAbility,
                        context: context,
                    })
                );

                if (actor.isPlayer) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onPlayerAbility,
                            context: context,
                        })
                    );
                }

                if (isSupportAbility(ability)) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onFriendlySupportAbility,
                            context: context,
                        })
                    );
                }

                // Only the player character depletes abilities.
                // Friendly: used to activate Red Hearted Earrings for minions
                if (ability.depletedOnUse && !isAutoCast) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onDepleteAbility,
                            context: context,
                        })
                    );
                }
            }
        });
    };

/**
 * Switches the enemy's current telegraphed ability if it suddenly doesn't have the resources or requirements to use it,
 * eg. Grendel should stop casting the Storm Barrier attack if he has no armor.
 */
export const checkValidEnemyNextAbility = () => {
    return (dispatch, getState) => {
        let battle = getState().battle;
        battle.enemySide.forEach((enemy: Combatant | null) => {
            if (!enemy) {
                return;
            }

            const actorInfo = findCombatantData(getState().battle, enemy.id);
            if (!actorInfo) {
                return;
            }

            // ignoreDisabled: abilities disabled due to eg. stun do not count here since the target
            // would continue to use that ability after the stun fades.
            const ability = getNextTelegraphedAbility(actorInfo, { ignoreDisabled: true });
            const currentlyChosenAbility = enemy.targeting?.ability;
            if (!ability || !currentlyChosenAbility) {
                return;
            }

            if (!ability.actions) {
                console.error("Something bad happened to the actions of the ability:", ability.name, ability);
                return;
            }

            if (currentlyChosenAbility.name !== ability.name) {
                const { battle: updatedBattle, targets } = getUpdatedBattleActionTargets({ ability, battle, actorInfo });
                battle = updatedBattle;

                dispatch(
                    updateCombatant({
                        combatantId: enemy.id,
                        newProperties: {
                            targeting: {
                                ...targets,
                                ability,
                            },
                        },
                    })
                );
            }
        });
    };
};

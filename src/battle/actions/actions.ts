import { cloneDeep, uniq } from "lodash";
import { partition } from "ramda";
import uuid from "uuid";
import { JOB_CARD_MAP } from "../../ability";
import { getAbilityUpgradedFromEffects, isOffensiveAbility, isOffensiveAction, isSupportAbility } from "../../ability/AbilityView/utils";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    AUTO_CAST_ABILITY_TYPES,
    Ability,
    AbilityEffect,
    Action,
    AutoCastAbility,
    CONDITION_TARGETS,
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
import { playerStateSlice } from "../../character/playerReducer";
import { Combatant, Player } from "../../character/types";
import { abilityNameMap, enemyNameMap } from "../../enemy";
import { Item } from "../../item/types";
import { getRandomInt, getRandomItem, shuffle } from "../../utils";
import {
    MULTI_ACTION_PLAYBACK_SPEED,
    NORMAL_ACTION_PLAYBACK_SPEED,
    RANGED_ACTION_PLAYBACK_SPEED,
    RICOCHET_ACTION_PLAYBACK_SPEED,
    SUMMON_DELAY,
} from "../constants";
import { passesConditions, passesValueComparison } from "../passesConditions";
import { BattleState, battleStateSlice } from "../reducer";
import getCardSelection from "../selectCardUtils";
import { BATTLEFIELD_SIDES, CombatantInfo, Displacement, Event, TRIGGER_SOURCE_TYPES } from "../types";
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
import { TriggerSource } from "./../types";
import { applyAbilityEventEffects, checkCardActions, deleteCard, depleteAbilities, handleDrawOriginalAbility } from "./cardActions";
import { UpdatedCombatantStats, getUpdatedStats } from "./getUpdatedStats";
import { getMorphMap, getMorphMerge } from "./morphUtils";
import { getUpgradeCard } from "../../Menu/utils";
import { tributeSummonBuff } from "../../ability/Effects";
import { BloodIcon, FireIcon } from "../../images/icons";
import { PoisonImage } from "../../images";
import { autoPickTarget } from "./enemyTurn";
import { getNextTelegraphedAbility } from "../../character/Telegraph";

const { updateBattle, updateBattleState, pushEventQueue } = battleStateSlice?.actions || {};
const { updatePlayer } = playerStateSlice?.actions || {};

/**
 * Helper to get the combatant data and additional details such as what slot index it sits on the board, who its allies and enemies are.
 * @param getState - Redux getState function
 * @param combatantId - Combatant UUID
 * @returns {CombatantInfo|undefined} - Undefined if combatant associated to the UUID not found on the board
 */
export const findCombatantData = (getState: Function, combatantId: string): CombatantInfo | undefined => {
    const battle = getState()?.battle;
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

const handleOnKill = (triggerSource?: TriggerSource) => {
    return (dispatch, getState) => {
        if (!triggerSource) {
            return;
        }

        const { actorId } = triggerSource;
        const killedByInfo = findCombatantData(getState, actorId);
        const { combatant: killedBy, index, friendly } = killedByInfo || {};
        if (!killedBy || killedBy.HP <= 0) {
            return;
        }

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
                source: {
                    ...triggerSource,
                },
                getCombatantById: (id) => findCombatantData(getState, id),
            });

            dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));
            dispatch(
                triggerStatChangeEvents(
                    updated.map(({ statUpdate, action }) => ({
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
        }

        dispatch(
            checkEventTrigger({
                combatantId: killedBy.id,
                effectEventKey: EFFECT_EVENT_KEYS.onKill,
                source: { ...triggerSource },
            })
        );

        friendly.forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onFriendlyKill,
                        source: { ...triggerSource },
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
    source,
    getState,
}: {
    affectedTargets: string[];
    actorId: string;
    action: Action;
    source: TriggerSource;
    getState;
}): { statUpdate: UpdatedCombatantStats; action: Action }[][] => {
    if (![ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK].includes(action.type)) {
        return [];
    }

    const actorInfo = findCombatantData(getState, actorId);
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
            source,
            getCombatantById: (id) => findCombatantData(getState, id),
        });

        results.push(updated);
    }

    const totalThorns = affectedTargets.reduce((acc, id: string) => {
        const combatantData = findCombatantData(getState, id);
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
            source,
            getCombatantById: (id) => findCombatantData(getState, id),
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
            source,
            getCombatantById: (id) => findCombatantData(getState, id),
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
            source,
            getCombatantById: (id) => findCombatantData(getState, id),
        });

        results.push(updatedTargets, updatedActor);
    }

    return results;
};

const onCombatantDeath = ({ combatantId, triggerSource }: { combatantId: string; triggerSource?: TriggerSource }) => {
    return (dispatch, getState) => {
        const { friendly, hostile, combatant, friendlySide, index } = findCombatantData(getState, combatantId) || {};
        if (isActorPlayerSide({ side: getState().battle.playerSide, source: triggerSource })) {
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
                                    return !hasDuration || e.persistsWhenDead || e[EFFECT_EVENT_KEYS.onDeath]; // Still allow onDeath effects to play out
                                }),
                                casting: null,
                                resources: 0,
                            };
                        }

                        return combatant;
                    }),
                })
            );
        }

        dispatch(checkEventTrigger({ combatantId, effectEventKey: EFFECT_EVENT_KEYS.onDeath, source: triggerSource }));

        if (!combatant || !friendly) {
            return;
        }

        const dispatchEvent = (combatant: Combatant | null, effectEventKey: EFFECT_EVENT_KEYS) => {
            const { id } = combatant || {};
            if (id !== combatantId) {
                dispatch(checkEventTrigger({ combatantId: id, effectEventKey, source: triggerSource }));
            }
        };

        dispatch(handleOnKill(triggerSource));
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

        // Something on the player side died. Any enemy that was targeting it should be redirected elsewhere.
        if (friendlySide === BATTLEFIELD_SIDES.PLAYER_SIDE) {
            getState().battle.enemySide.forEach((enemy) => {
                if (!enemy?.HP) {
                    return;
                }

                const { index: targetingIndex, side } = enemy.targeting;
                if (index !== targetingIndex || side !== friendlySide) {
                    return;
                }

                const enemyInfo = findCombatantData(getState, enemy.id);
                const targeting = autoPickTarget({ ability: getNextTelegraphedAbility(enemyInfo), actor: enemyInfo });
                dispatch(
                    updateCombatant({
                        combatantId: enemy.id,
                        newProperties: {
                            targeting,
                        },
                    })
                );
            });
        }
    };
};

const handleOnReceiveAction = ({
    updatedStats,
    source,
    combatants,
}: {
    updatedStats: { statUpdate; action }[];
    source?: TriggerSource;
    combatants: (Combatant | null)[];
}) => {
    return (dispatch) => {
        const isAttack = (action: Action) => [ACTION_TYPES.RANGE_ATTACK, ACTION_TYPES.ATTACK].includes(action.type);
        updatedStats.forEach(({ statUpdate, action }) => {
            if (!isAttack(action)) {
                return;
            }

            dispatch(
                checkEventTrigger({
                    combatantId: statUpdate.combatantId,
                    effectEventKey: EFFECT_EVENT_KEYS.onReceiveAttack,
                    source: { ...source, targetId: statUpdate.combatantId },
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

                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onFriendlyReceiveAttack,
                        source: { ...source, targetId: statUpdate.combatantId },
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
                    turnHistory: [...turnHistory, { ...action, parent: source?.source }],
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
    ({ combatantIds, side }: { combatantIds: string[]; side: BATTLEFIELD_SIDES }) =>
    (dispatch, getState) => {
        const dotDamageMap = {
            [EFFECT_TYPES.BLEED]: 1,
            [EFFECT_TYPES.POISON]: 2,
            [EFFECT_TYPES.BURN]: 3,
        };

        const dotAbilityMap = {
            [EFFECT_TYPES.BLEED]: {
                name: "Bleed",
                image: BloodIcon,
                actions: [],
            },
            [EFFECT_TYPES.POISON]: {
                name: "Poison",
                image: PoisonImage,
                actions: [],
            },
            [EFFECT_TYPES.BURN]: {
                name: "Burn",
                image: FireIcon,
                actions: [],
            },
        };

        [EFFECT_TYPES.BLEED, EFFECT_TYPES.POISON, EFFECT_TYPES.BURN].map((dotType) => {
            const updatedStats: { statUpdate: UpdatedCombatantStats; action: Action; actorId?: string }[] = [];

            combatantIds.forEach((combatantId) => {
                // Perform another lookup on combatant info as it may have changed between effect triggers
                const combatantInfo = findCombatantData(getState, combatantId);
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
                        damage,
                    },
                    getCombatantById: (id) => findCombatantData(getState, id),
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
                pushPlaybackQueue({
                    side,
                    statUpdates: aggregatedStatUpdates,
                    // Hack: this is for displaying the dot type in the ability notification banner
                    actionParent: dotAbilityMap[dotType],
                })
            );

            dispatch(
                triggerStatChangeEvents(
                    updatedStats.map(({ statUpdate, action, actorId }) => ({
                        statUpdate,
                        source: {
                            source: action,
                            type: TRIGGER_SOURCE_TYPES.EFFECT,
                            targetId: statUpdate.combatantId,
                            statUpdate,
                            triggerHistory: [],
                            actorId,
                        } as TriggerSource,
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
        source,
        ownerId,
    }: {
        effect: CombatEffect;
        effectEvent: EffectEventTrigger;
        source: TriggerSource;
        ownerId: string;
    }) =>
    (dispatch, getState) => {
        const { removeEffect, decrementStacks = 0, resetDuration } = effectEvent;

        const updatedEffect = {
            ...effect,
            stacks: (effect.stacks || 1) - (decrementStacks || 0),
            duration: resetDuration ? effect.originalDuration : effect.duration,
        };
        const { combatant } = findCombatantData(getState, ownerId) || {};

        if (removeEffect || updatedEffect.stacks === 0) {
            const removedEffects = [];
            const newEffects = [];
            combatant.effects.forEach((e) => (e.id === effect.id ? removedEffects.push(e) : newEffects.push(e)));

            dispatch(triggerStatChangeEvents([{ statUpdate: { combatantId: ownerId, removedEffects }, source }]));
            dispatch(updateCombatant({ combatantId: ownerId, newProperties: { effects: newEffects } }));
            return;
        }

        if ((decrementStacks && updatedEffect.stacks > 0) || resetDuration) {
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
    source,
}: {
    effectEvent: EffectEventTrigger;
    effectEventKey: string;
    effect: CombatEffect;
    ownerId: string;
    source?: TriggerSource;
}) => {
    return (dispatch, getState) => {
        if (!effectEvent) {
            return;
        }

        const { canBeSilenced } = effect;
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
            ...other
        } = effectEvent;

        const getCalculationTargetIds = (targetType: TRIGGER_TARGET_TYPES | CONDITION_TARGETS): string[] => {
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
            return getCalculationTargetIds(targetType).map((id) => findCombatantData(getState, id));
        };

        // Must pass parent effect conditions as well as child effectEvent conditions (if any)
        const conditionsPassed =
            passesConditions({ getCalculationTarget, proc: effect, source }) &&
            passesConditions({ getCalculationTarget, proc: effectEvent, source });

        const caster = findCombatantData(getState, ownerId);
        const chanceMultiplier = getMultiplier({
            actor: caster,
            target: caster,
            allTargets: [caster],
            source,
            multiplier: effectEvent.multiplier,
            actionParent: source?.source,
            ...getState().battle,
        });
        const chanceCheckPass = Math.random() < chance * chanceMultiplier;

        if (conditionsPassed && chanceCheckPass) {
            dispatch(checkUpdateEffectLifecycle({ effect, effectEvent, source, ownerId }));
        } else {
            return;
        }

        const { combatant } = findCombatantData(getState, ownerId) || {};
        const cannotTrigger = (canBeSilenced && isSilenced(combatant)) || (!usableWhileStunned && isStunnedOrFrozen(combatant));
        if (cannotTrigger) {
            return;
        }

        const procSource = { ...source, source: effect, type: TRIGGER_SOURCE_TYPES.EFFECT, isProc: true };

        dispatch(handleDrawOriginalAbility({ drawOriginalAbility, effect, source }));
        dispatch(checkCardActions({ action: other, source })); // Why does this use original source when there is procSource?

        const owner = findCombatantData(getState, ownerId);
        if (owner?.combatant?.isPlayer) {
            const multiplier = getMultiplier({
                multiplier: multiplierConfig,
                actor: owner,
                ...getState().battle,
            });
            dispatch(checkHandleAutoCast({ autoCastAbilities, actor: owner.combatant, parentAbility: parent as any, multiplier }));
        }

        const initialTargetIds = getCalculationTargetIds(targetType).filter((id) => {
            const secondaryGetCalculationTarget = (targetType) => {
                if ([TRIGGER_TARGET_TYPES.TARGET, TRIGGER_TARGET_TYPES.ALL_TARGETS].includes(targetType)) {
                    return findCombatantData(getState, id);
                }

                return getCalculationTarget(targetType);
            };
            return passesConditions({ getCalculationTarget: secondaryGetCalculationTarget, proc: effectEvent, source });
        });

        const initialTargetData = findCombatantData(getState, initialTargetIds[0]);
        const { index: i, friendlySide, friendly: targets } = initialTargetData || {};

        $applyStatChanges: {
            if (!targets) {
                break $applyStatChanges;
            }

            const action = {
                ...other,
                type: ACTION_TYPES.EFFECT,
            };

            const targetIds = [];

            // This calculates `action.area` for the effect event trigger
            initialTargetIds
                .map((id) => findCombatantData(getState, id))
                .map((data) =>
                    calculateTargetIndices({
                        action,
                        selectedIndex: data.index,
                        side: data.friendlySide,
                        actorData: owner,
                        targetData: data,
                        battle: getState().battle,
                        source: procSource,
                    })
                )
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
                    ...other,
                    type: ACTION_TYPES.EFFECT,
                },
                source: procSource,
                getCombatantById: (id: string) => findCombatantData(getState, id),
            });

            dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));
            dispatch(
                triggerStatChangeEvents(
                    updated.map(({ statUpdate }) => ({
                        statUpdate,
                        source: procSource,
                    }))
                )
            );

            dispatch(checkInduce({ action: effectEvent, affectedTargetIds: targetIds, parentSource: procSource }));
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

            const target = getState().battle[side]?.[index];

            const getCalculationTarget = (): CombatantInfo => {
                return findCombatantData(getState, target?.id);
            };

            const actorInfo = findCombatantData(getState, ownerId);
            const actor = actorInfo?.combatant;
            const isPassAliveConditions = actor?.HP > 0 || usableWhileDead || effectEventKey === EFFECT_EVENT_KEYS.onDeath;
            const canAct = isPassAliveConditions && !isTurnActionPrevented(actorInfo, { bypassStun: usableWhileStunned });

            // Something could've happened between actions that killed the actor
            if (!canAct) {
                return;
            }

            if ([TARGET_TYPES.HOSTILE, TARGET_TYPES.RANDOM_HOSTILE].includes(action.target) && !canTargetIfStealthed(actor, target)) {
                return;
            }

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
            dispatch(
                onUseAbility({
                    actorInfo: findCombatantData(getState, ownerId),
                    source: {
                        ...procSource,
                        actorId: ownerId,
                    },
                    ability,
                })
            );
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
        if (!combatant) {
            return;
        }

        const triggerEffectEvent = ({ effect, effectEvent }) => {
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
            const currentEffects = findCombatantData(getState, combatantId)?.combatant?.effects || [];
            const triggerSum = (effectEvent.triggerSum || 0) + (source?.trackSumAmount || 1);
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
            // TODO this is causing an insidious bug where if the effect name is the same as its parent/source name, it doesn't proc
            const notTriggeringSameEffect = effect.name !== (source?.source as any)?.name;
            const historyKey = [effectEventKey, id].join("-");
            const history = source?.triggerHistory || [];
            const alreadyTriggered = history.includes(historyKey);
            const canTriggerFromProcs = !source?.isProc || !effectEvent?.disableTriggerFromProcs;
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
                            source: {
                                ...source,
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
        if (combatant.isPlayer && !source?.isProc) {
            const { playerSide, hand } = getState().battle;
            const actorIsPlayer = playerSide.some((combatant: Combatant | null) => combatant?.isPlayer && combatant.id === source?.actorId);
            if (actorIsPlayer) {
                hand.forEach((card: CombatAbility) => {
                    if (card[effectEventKey]?.ability) {
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
                updatedEffects[i] = {
                    ...updatedEffects[i],
                    duration: Math.min(maxDuration, newDuration),
                    stacks: (updatedEffects[i].stacks || 0) + (incomingEffect.stacks || 0),
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

                    return stageStatChanges(statUpdate, oldCombatant);
                }),
            })
        );
    });
};

const isActorPlayerSide = ({ side, source }: { side: (Combatant | Player | null)[]; source?: TriggerSource }) => {
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
    if (isActorPlayerSide({ side: battle.playerSide, source })) {
        dispatch(
            updateBattle({
                totalDamageDealt: (battle.totalDamageDealt || 0) + (damage || 0),
            })
        );
    }
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
                isArmorDecay = false,
                failedToApplyEffects = [],
            } = statUpdate;
            const dispatchEvent = (effectEventKey: EFFECT_EVENT_KEYS, sourcePayload?: { [key in keyof TriggerSource]? }) => {
                dispatch(
                    checkEventTrigger({
                        combatantId,
                        effectEventKey,
                        source: { ...source, ...sourcePayload, targetId: combatantId, statUpdate },
                    })
                );
            };

            if (resources < 0) {
                dispatchEvent(EFFECT_EVENT_KEYS.onResourcesSpent, { trackSumAmount: Math.abs(resources) });
            }

            if (rawResources > 0) {
                // This event currently includes overcapping resources; use overcappedResources when nuance required
                dispatchEvent(EFFECT_EVENT_KEYS.onResourcesGained, { trackSumAmount: Math.abs(rawResources) });
            }

            if (healing > 0) {
                dispatchEvent(EFFECT_EVENT_KEYS.onReceiveHealing, { trackSumAmount: Math.abs(healing) });
            }

            if (overhealing > 0) {
                dispatchEvent(EFFECT_EVENT_KEYS.onReceiveOverhealing, { trackSumAmount: Math.abs(overhealing) });
            }

            if (armor > 0) {
                dispatchEvent(EFFECT_EVENT_KEYS.onReceiveArmor, { trackSumAmount: Math.abs(armor) });
            } else if (armor < 0) {
                dispatchEvent(EFFECT_EVENT_KEYS.onArmorLoss, { trackSumAmount: Math.abs(armor) });
            }

            if (isArmorDecay) {
                dispatchEvent(EFFECT_EVENT_KEYS.onArmorDecay);
            }

            if (rawDamage > 0) {
                dispatchEvent(EFFECT_EVENT_KEYS.onReceiveDamage, { trackSumAmount: Math.abs(rawDamage) });
                dispatch(updateDamageStatistics(rawDamage, source));
            }

            effects.forEach((e: CombatEffect) => {
                dispatchEvent(EFFECT_EVENT_KEYS.onReceiveEffect, { source: e, type: TRIGGER_SOURCE_TYPES.EFFECT });
                dispatch(
                    checkEventTrigger({
                        combatantId: e.applierId,
                        effectEventKey: EFFECT_EVENT_KEYS.onApplyEffect,
                        source: { ...source, statUpdate, source: e, type: TRIGGER_SOURCE_TYPES.EFFECT, targetId: combatantId },
                    })
                );
            });

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
                dispatchEvent(EFFECT_EVENT_KEYS.onFailedToReceiveEffect, { source: e, type: TRIGGER_SOURCE_TYPES.EFFECT });
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
        combatants.forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnEnd }));
            }
        });

        combatants.forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(tickDownStatusEffects(combatant.id));
            }
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
 * TODO: Reuse checkSummonMinion code
 * @see checkSummonMinion
 */
const checkHandleActionSummon = ({ action, actorId, parentSource }: { action: Action; actorId: string; parentSource: TriggerSource }) => {
    return (dispatch, getState) => {
        if (!action.summon) {
            return;
        }

        const minionsSummoned: Combatant[] = [];
        const tributeSummonedMinions: string[] = []; // IDs of killers
        const { friendly, hostile, friendlySide, hostileSide, index: actorIndex, combatant: actor } = findCombatantData(getState, actorId);
        const mutableFriendly = friendly.slice(); // This gets used to update the battlefield side at the end
        const mutableHostile = hostile.slice();

        for (const summon of action.summon) {
            const { minion, positionIndex, placement, noDuplicateMinions = false, tributePossible = false, side } = summon;
            const mutableSide = side === hostileSide ? mutableHostile : mutableFriendly;

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
            } else {
                pos = getRandomItem(getPossibleSummonIndices(mutableSide));
            }

            let isTributeKill = false;
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
                    dispatch(tributeKill({ tributeSummon: true, resourceCost: 0, actor, side: friendlySide, index: pos }));
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
                pushEventQueue({
                    ...getState().battle,
                    id: uuid.v4(),
                    playbackTime: SUMMON_DELAY,
                    newCombatants: minionsSummoned,
                } as Event)
            );
        }

        // Tribute summons count as a kill for the new minion
        tributeSummonedMinions.forEach((id) => dispatch(checkEventTrigger({ combatantId: id, effectEventKey: EFFECT_EVENT_KEYS.onKill })));

        minionsSummoned.forEach((minion) => {
            dispatch(
                onSummonTriggers({
                    summonedId: minion.id,
                    summonerId: actorId,
                    parentSource,
                })
            );
        });

        // The player summoned this unit. Rearrange the enemy targeting.
        if (friendlySide === BATTLEFIELD_SIDES.PLAYER_SIDE) {
            getState().battle.enemySide.forEach((enemy) => {
                if (!enemy?.HP) {
                    return;
                }

                const enemyInfo = findCombatantData(getState, enemy.id);
                const targeting = autoPickTarget({ ability: getNextTelegraphedAbility(enemyInfo), actor: enemyInfo });
                dispatch(
                    updateCombatant({
                        combatantId: enemy.id,
                        newProperties: {
                            targeting,
                        },
                    })
                );
            });
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
            .filter((combatantInfo) => action.morph.resurrect || combatantInfo.combatant?.HP > 0);

        if (!targets.length) {
            return;
        }

        const type = action.morph.type;
        let transformed = {} as any;
        const morphProps = {
            targets,
            morph: action.morph,
            source: parentSource,
            getState,
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

        // Give minions time to appear before triggering any minion-related effect events (or the next action).
        // Issue where characters who automatically attacked summoned minions would fly off to 0, 0 since minions had not rendered
        dispatch(
            pushEventQueue({
                ...getState().battle,
                id: uuid.v4(),
                playbackTime: SUMMON_DELAY,
                newCombatants: summons,
            } as Event)
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
const checkInduce = ({
    action,
    affectedTargetIds,
    parentSource,
}: {
    action: Action;
    affectedTargetIds: string[];
    parentSource: TriggerSource;
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
                    const combatantData = findCombatantData(getState, id);
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

                    const { index, side } = autoSelectActionTarget({
                        action,
                        actorId: id,
                        getState,
                    });

                    if (typeof index === "number") {
                        dispatch(
                            performAction({
                                action,
                                actorId: id,
                                parentSource,
                                selectedIndex: index,
                                side,
                            })
                        );

                        dispatch(
                            onUseAbility({
                                actorInfo: findCombatantData(getState, id),
                                source: {
                                    ...parentSource,
                                    actorId: id,
                                },
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
                const { hostileSide, combatant } = findCombatantData(getState, id) || {};
                if (!combatant.HP || isStunnedOrFrozen(combatant)) {
                    return;
                }

                const attackAction = getInducedAttack(combatant);
                const { index } = autoSelectActionTarget({
                    action: attackAction,
                    actorId: id,
                    getState,
                });

                if (typeof index === "number") {
                    dispatch(
                        performAction({
                            action: attackAction,
                            selectedIndex: index,
                            side: hostileSide,
                            actorId: id,
                            parentSource,
                        })
                    );

                    dispatch(
                        onUseAbility({
                            actorInfo: findCombatantData(getState, id),
                            source: {
                                ...parentSource,
                                actorId: id,
                            },
                            ability: {
                                name: "Induced Attack",
                                actions: [action],
                            },
                        })
                    );
                }
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

        // Give the board a bit of time to update. Issue where Close Combat was causing the player character to fly off to (0, 0).
        // FIX ME: Causes the sprite to flicker
        /*
        dispatch(
            pushEventQueue({
                ...getState().battle,
                id: uuid.v4(),
                playbackTime: 10,
                displacements,
            } as Event)
        );
        */

        return displacements;
    };
};

const checkHandleMovement = ({
    action,
    side,
    selectedIndex: to,
    actorIndex: from,
    source,
}: {
    action: Action;
    side: BATTLEFIELD_SIDES;
    selectedIndex: number;
    actorIndex: number;
    source: TriggerSource;
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
                dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onFriendlyMove, source }));
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

const pushPlaybackQueue = ({
    action,
    actorId,
    selectedIndex,
    allTargetIndices,
    actionParent,
    side,
    source,
    displacements,
    statUpdates,
}: {
    action?: Action;
    actorId?: string;
    selectedIndex?: number;
    allTargetIndices?: number[];
    actionParent?: Ability | Item;
    side: BATTLEFIELD_SIDES;
    source?: TriggerSource;
    displacements?: Displacement;
    statUpdates?: { [combatantId: string]: UpdatedCombatantStats };
}) => {
    return (dispatch, getState) => {
        let playbackTime = action?.playbackTime;
        if (!playbackTime) {
            if (!action) {
                playbackTime = NORMAL_ACTION_PLAYBACK_SPEED;
            } else if (action.animationOptions?.ricochet) {
                playbackTime = RICOCHET_ACTION_PLAYBACK_SPEED + (RICOCHET_ACTION_PLAYBACK_SPEED / 3) * allTargetIndices.length;
            } else if ((actionParent as Ability)?.actions?.length > 1) {
                playbackTime = MULTI_ACTION_PLAYBACK_SPEED;
            } else if (action.type === ACTION_TYPES.RANGE_ATTACK) {
                playbackTime = RANGED_ACTION_PLAYBACK_SPEED;
            } else {
                playbackTime = NORMAL_ACTION_PLAYBACK_SPEED;
            }
        }

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
                playbackTime,
                source,
                displacements,
                statUpdates,
            } as Event)
        );
    };
};

const checkHandleAutoCast = ({
    autoCastAbilities,
    actor,
    parentAbility,
    multiplier = 1,
}: {
    autoCastAbilities: AutoCastAbility;
    actor: any; // This is expected to be the player
    parentAbility?: CombatAbility;
    multiplier?: number;
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
            let abilityToCast: CombatAbility = getRandomItem(cards);
            Array.from({ length: upgradeLevels }).forEach(() => {
                const upgrade = getUpgradeCard(abilityToCast, { ignoreMaxLevel: true });
                if (upgrade) {
                    abilityToCast = upgrade;
                }
            });
            const { resourceCost: abilityCost, selectCards } = abilityToCast;

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

            // Auto-casted ability costs 0 unless it is a variable cost ability
            const resourceCost = abilityCost !== "x" ? 0 : abilityCost;

            // instanceId: undefined -- only "cards" should have ids, not auto casted abilities.
            // Issue where Astral Rewind was grabbing abilities casted from Metronome.
            dispatch(
                useAbility({ ability: { ...abilityToCast, resourceCost, instanceId: undefined }, actorId: actor.id, isAutoCast: true })
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
    disableRollExtraTargets,
    source,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    actorData: CombatantInfo;
    targetData: CombatantInfo;
    battle: BattleState;
    disableRollExtraTargets?: boolean; // Determinism for consumers that require it, eg. damage preview
    source: TriggerSource;
}): number[] => {
    const { numTargets: extraTargets = 0, excludePrimaryTarget, resurrect, affectsDeadCharacters, targetArea = 0, targetName } = action;

    const area = calculateActionArea({ action, actor: actorData, target: targetData, source });
    let extraTargetIndices = getValidTargetIndices(battle[side], {
        excludeStealth: action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK,
        excludeIndex: selectedIndex,
    }).filter((i) => Math.abs(i - selectedIndex) <= targetArea);

    if (!disableRollExtraTargets) {
        extraTargetIndices = shuffle(extraTargetIndices).slice(0, extraTargets);
    }

    const isAffected = (combatant: Combatant | null, i: number): boolean => {
        const livingOrResurrecting = combatant && (combatant.HP > 0 || resurrect || affectsDeadCharacters);

        const inArea = livingOrResurrecting && [selectedIndex, ...extraTargetIndices].some((j) => Math.abs(j - i) <= area);
        if (excludePrimaryTarget) {
            return inArea && i !== selectedIndex;
        }

        if (targetName && targetName === combatant?.name) {
            return true;
        }

        return inArea;
    };

    const combatants = battle[side];
    return combatants.reduce((acc, character: Combatant | null, i: number) => {
        if (isAffected(character, i)) {
            acc.push(i);
        }

        return acc;
    }, []);
};

export const stageSecondaryAction = ({ secondaryAction, getCalculationTarget, source, battle, actorData, statsProps }) => {
    if (!secondaryAction || !passesConditions({ getCalculationTarget, proc: secondaryAction, source })) {
        return;
    }

    const { index: actorIndex, friendly, friendlySide } = actorData;
    const recipientIndices = calculateTargetIndices({
        action: { ...secondaryAction, type: ACTION_TYPES.EFFECT, target: TARGET_TYPES.SELF },
        selectedIndex: actorIndex,
        side: friendlySide,
        actorData,
        targetData: actorData,
        battle,
        source,
    });
    const recipientIds = recipientIndices.map((i: number) => friendly[i].id);

    return getUpdatedStats({
        ...statsProps,
        // Only actor recipient is supported for now
        recipientIds,
        selectedIndex: undefined,
        action: secondaryAction,
    });
};

const handleSecondaryAction = ({ secondaryAction, actorId, getCalculationTarget, source, parentSource, updatedStatsProps }) => {
    return (dispatch, getState) => {
        const actorData = findCombatantData(getState, actorId);
        const updatedSecondary = stageSecondaryAction({
            secondaryAction,
            getCalculationTarget,
            source,
            battle: getState().battle,
            actorData,
            statsProps: updatedStatsProps,
        });
        if (!updatedSecondary) {
            return;
        }

        dispatch(applyStatChanges(updatedSecondary.map(({ statUpdate }) => statUpdate)));
        if (secondaryAction.returnParentCardToHand) {
            // Tada, it copies and deletes the old card, and adds the copy with a new id to the hand
            const ability: CombatAbility | undefined = parentSource?.source as CombatAbility;
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
                    source: parentSource,
                })
            );
        }

        return updatedSecondary;
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
    parent?: Ability | Item | CombatAbility;
    parentSource?: TriggerSource;
    isAutoCast?: boolean;
}) => {
    return (dispatch, getState) => {
        const actorData: CombatantInfo | undefined = findCombatantData(getState, actorId);
        if (!actorData || !side) {
            return;
        }

        const battleSide = getState().battle[side];
        const target = findCombatantData(getState, battleSide[selectedIndex]?.id);

        const { vacuum, secondaryAction, autoCastAbilities, retreat } = action;
        const combatants = getState().battle[side];
        const targetIndices = calculateTargetIndices({
            action,
            selectedIndex,
            side,
            actorData,
            targetData: target,
            battle: getState().battle,
            source: parentSource,
        });

        const targetIds = targetIndices.map((i: number) => combatants[i]?.id).filter((v) => v !== undefined);

        // Don't try to target things that are all gone/dead.
        // Amendment: unless it is a friendly-side ability such as a summon. There was an issue where the Dark Lord clone reveal was broken by this.
        if (isOffensiveAction(action) && targetIds.length === 0) {
            return;
        }

        const source = { ...parentSource, actorId, targetId: combatants[selectedIndex]?.id || targetIds[0], allTargetIds: targetIds };

        const getCalculationTarget = (targetType: CONDITION_TARGETS): CombatantInfo => {
            if (targetType === CONDITION_TARGETS.TARGET) {
                // This is the primary target only
                return findCombatantData(getState, combatants[selectedIndex]?.id);
            } else if (targetType === CONDITION_TARGETS.ACTOR) {
                return findCombatantData(getState, actorId);
            }
        };

        const updatedStatsProps = {
            ...getState().battle,
            selectedIndex,
            action,
            targetIds,
            actorId,
            actionParent: parent,
            source,
            getCombatantById: (id: string) => findCombatantData(getState, id),
        };

        let updatedSecondary;
        const triggerSecondaryAction = () => {
            return dispatch(
                handleSecondaryAction({ secondaryAction, actorId, getCalculationTarget, source, parentSource, updatedStatsProps })
            );
        };

        if (secondaryAction?.isPriority) {
            updatedSecondary = triggerSecondaryAction();
        }

        const area = calculateActionArea({ action, actor: actorData, target, source });

        const vacuumDisplacements: Displacement = dispatch(checkHandleVacuum({ vacuum, side, selectedIndex, area }));
        const movementDisplacements: Displacement = dispatch(
            checkHandleMovement({ action, side, actorIndex: actorData.index, selectedIndex, source })
        );
        // At the moment there is never both a vacuum AND a movement in one action. It's either one or the other. So we can 'safely' merge the displacement results of both.
        const displacements: Displacement = {
            ...vacuumDisplacements,
            ...movementDisplacements,
        };

        const updated: { statUpdate: UpdatedCombatantStats; action: Action }[] = getUpdatedStats(updatedStatsProps);
        dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));

        // Include life on hit and thorns in the same action playback as the actual attack (con't below*)
        const hitEffects: { statUpdate: UpdatedCombatantStats; action: Action }[][] = getHitEffects({
            actorId,
            action,
            affectedTargets: targetIds,
            source: { ...source, source: action },
            getState,
        });
        hitEffects.forEach((statChanges) => {
            dispatch(applyStatChanges(statChanges.map(({ statUpdate }) => statUpdate)));
        });

        if (!secondaryAction?.isPriority) {
            updatedSecondary = triggerSecondaryAction();
        }

        // HACK: ensure that the selected index is hit first in playback
        const allTargetIndices = uniq([selectedIndex, ...targetIndices]);

        // TODO: does not include hitEffects or secondaryAction, hence is incomplete info
        const aggregatedStatUpdates = updated.reduce((acc, { statUpdate }) => {
            acc[statUpdate.combatantId] = statUpdate;
            return acc;
        }, {});

        dispatch(
            pushPlaybackQueue({
                action,
                actorId,
                selectedIndex,
                allTargetIndices,
                actionParent: parent,
                side,
                source,
                displacements,
                statUpdates: aggregatedStatUpdates,
            })
        );

        dispatch(
            triggerStatChangeEvents(
                updated.map(({ statUpdate, action }) => ({
                    statUpdate,
                    source: { ...source, source: action },
                }))
            )
        );

        // *But don't trigger the related effect events until after the action has resolved
        hitEffects.forEach((statChanges) => {
            dispatch(
                triggerStatChangeEvents(
                    statChanges.map(({ statUpdate, action }) => ({
                        statUpdate,
                        source: {
                            ...source,
                            source: action,
                            type: TRIGGER_SOURCE_TYPES.EFFECT,
                            actorId,
                            targetId: actorId,
                            statUpdate,
                        },
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
                        source: { ...source, source: action },
                    }))
                )
            );
        }

        dispatch(checkCastRadiate({ source: parentSource, action, selectedIndex, side, parent }));

        // If eg. a bonus card draw was applied during the stat update action, checkCardActions should consume it.
        const postUpdateAction = updated?.[0]?.action || action;
        dispatch(checkCardActions({ action: postUpdateAction, source: parentSource, isAutoCast }));

        const multiplier = getMultiplier({
            multiplier: action.multiplier,
            actor: actorData,
            ...getState().battle,
        });
        dispatch(checkHandleAutoCast({ autoCastAbilities, actor: actorData.combatant, parentAbility: parent as any, multiplier }));
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
        dispatch(checkHandleActionSummon({ action, actorId, parentSource }));
        dispatch(checkHandleMorph({ action, morphTargetIds: targetIds, actorId, parentSource: { ...parentSource, actorId } }));
        dispatch(checkInduce({ action, affectedTargetIds: targetIds, parentSource }));
        if (retreat) {
            const { friendly, friendlySide } = findCombatantData(getState, actorId);
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
    hostile,
    actorData,
    initialIndex,
    area,
}: {
    hostile: (Combatant | null)[];
    actorData: CombatantInfo;
    initialIndex?: number;
    area?: number;
}) => {
    const targetIndices = getValidTargetIndices(hostile, {
        // TODO area attacks are still applicable to stealthed units
        excludeStealth: !hasTruesight(actorData.combatant),
        onlyTaunt: true,
    }).filter((i) => {
        return Math.abs(i - initialIndex || 0) <= (area || Infinity);
    });

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
}) => {
    const actorData = findCombatantData(getState, actorId);
    const { friendly, hostile, friendlySide, hostileSide } = actorData;
    const { targetArea: area = 0, target, targetName } = action;

    let isPlayerHostile;
    if (target === TARGET_TYPES.PLAYER) {
        const friendlyPlayerIndex = friendly.findIndex((combatant) => combatant?.isPlayer);
        if (friendlyPlayerIndex > -1) {
            return {
                index: friendlyPlayerIndex,
                side: friendlySide,
            };
        }

        const hostilePlayerIndex = hostile.findIndex((combatant) => combatant?.isPlayer);
        const targetIndices = getValidTargetIndices(hostile, { excludeStealth: true, onlyTaunt: true }).filter((i) => {
            return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
        });

        if (hostilePlayerIndex > -1 && targetIndices.includes(hostilePlayerIndex)) {
            return {
                index: hostilePlayerIndex,
                side: hostileSide,
            };
        }

        isPlayerHostile = hostilePlayerIndex > -1;
    }

    const noValidSelection = typeof initialSelectedIndex !== "number" || !initialSelectedSide;

    if ((target === TARGET_TYPES.HOSTILE || isPlayerHostile) && noValidSelection) {
        return {
            index: pickHostileIndex({ hostile, actorData, initialIndex: initialSelectedIndex, area }),
            side: hostileSide,
        };
    }

    if (target === TARGET_TYPES.RANDOM_HOSTILE || isPlayerHostile) {
        const targetIndices = getValidTargetIndices(hostile, { onlyTaunt: true }).filter((i) => {
            return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
        });

        return {
            index: getRandomItem(targetIndices),
            side: hostileSide,
        };
    }

    if (target === TARGET_TYPES.RANDOM_FRIENDLY || (target === TARGET_TYPES.FRIENDLY && noValidSelection)) {
        const targetIndices = getValidTargetIndices(friendly).filter((i) => {
            return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
        });

        return {
            index: getRandomItem(targetIndices),
            side: friendlySide,
        };
    }

    if (target === TARGET_TYPES.SELF) {
        return {
            index: friendly.findIndex((ally) => ally?.id === actorId),
            side: friendlySide,
        };
    }

    if (target === TARGET_TYPES.FRIENDLY_CHARACTER) {
        const index = friendly.findIndex((ally) => ally?.name === targetName);
        if (index > -1) {
            return {
                index,
                side: friendlySide,
            };
        }
    }

    if (target === TARGET_TYPES.HOSTILE_CHARACTER) {
        const index = hostile.findIndex((ally) => ally?.name === targetName);
        if (index > -1) {
            return {
                index,
                side: hostileSide,
            };
        }
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

const tributeKill = ({
    tributeSummon,
    resourceCost,
    actor,
    side,
    index,
}: {
    tributeSummon?: boolean;
    resourceCost: number | "x";
    actor?: Combatant;
    side: BATTLEFIELD_SIDES;
    index: number;
}) => {
    return (dispatch) => {
        if (typeof index !== "number") {
            return;
        }

        const actorResources = actor?.resources || 0;
        // The replaced minion dies
        dispatch(
            performAction({
                action: {
                    flatDamage: 1000,
                    type: ACTION_TYPES.NONE,
                    playbackTime: 750,
                    secondaryAction: tributeSummon
                        ? {
                              resources: resourceCost === "x" ? actorResources : resourceCost,
                          }
                        : undefined,
                },
                side,
                selectedIndex: index,
                actorId: actor?.id, // The actor is considered to have killed it
            })
        );
    };
};

/**
 * This is for player ability.minion handling only. Randomized summons from actions are handled at checkHandleActionSummon.
 */
const checkSummonMinion = ({
    ability,
    selectedIndex,
    side,
    actorId,
    parentSource,
    isAutoCast,
}: {
    side: BATTLEFIELD_SIDES;
    selectedIndex: number;
    ability: CombatAbility;
    actorId: string;
    parentSource: TriggerSource;
    isAutoCast?: boolean;
}) => {
    return (dispatch, getState) => {
        const { minion, minionOptions, removeAfterTurn, depletedOnUse, resourceCost = 0 } = ability;
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

        const actor = findCombatantData(getState, actorId)?.combatant;
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
            playerSummonsInPlay?: { [id: string]: Ability };
        } = {
            [side]: getState().battle[side].map((combatant: Combatant | null, i: number) => {
                return i === index ? summonedMinion : combatant;
            }),
        };

        // If the actor is the player, then move the ability to the "active summons" bucket, so that it is later sent to discard if the minion is removed from play
        // Checking for ability.instanceId: only cards owned by the player have this, whereas abilities triggered from eg. Metronome do not.
        // Minion summons from Metronome should not go into discard when they die.
        if (actor?.isPlayer && !removeAfterTurn && !depletedOnUse && ability.instanceId) {
            newBattleProps.playerSummonsInPlay = { ...getState().battle?.playerSummonsInPlay, [summonedMinion.id]: ability };
        }
        dispatch(updateBattle(newBattleProps));

        // Give minions time to appear before triggering any minion-related effect events.
        // Issue where enemies who automatically attacked summoned minions would fly off to 0, 0 since minions had not rendered
        dispatch(
            pushEventQueue({
                ...getState().battle,
                id: uuid.v4(),
                playbackTime: SUMMON_DELAY,
                newCombatants: [summonedMinion],
            } as Event)
        );

        // Tribute summons count as a kill for the new minion
        if (isKillPreviousMinion) {
            dispatch(checkEventTrigger({ combatantId: summonedMinion.id, effectEventKey: EFFECT_EVENT_KEYS.onKill }));
        }
        dispatch(onSummonTriggers({ summonedId: summonedMinion.id, summonerId: actorId, parentSource }));

        getState().battle.enemySide.forEach((enemy) => {
            if (!enemy?.HP) {
                return;
            }

            const enemyInfo = findCombatantData(getState, enemy.id);
            const targeting = autoPickTarget({ ability: getNextTelegraphedAbility(enemyInfo), actor: enemyInfo });
            dispatch(
                updateCombatant({
                    combatantId: enemy.id,
                    newProperties: {
                        targeting,
                    },
                })
            );
        });
    };
};

export const useAbility = ({
    ability,
    selectedIndex,
    side: initialSide,
    actorId,
    isAutoCast,
    isProc,
}: {
    side?: BATTLEFIELD_SIDES;
    selectedIndex?: number;
    ability: CombatAbility | Ability;
    actorId: string;
    isAutoCast?: boolean;
    isProc?: boolean;
}) => {
    return (dispatch, getState) => {
        // @ts-ignore -- We're providing a fallback so it doesn't matter whether effects exists or not
        const { resourceCost = 0, actions = [], effects = [] } = getAbilityUpgradedFromEffects({ ability }) as CombatAbility;
        const { combatant, friendlySide } = findCombatantData(getState, actorId) || {};

        const totalResourceCost = getAbilityResourceCost({ combatant, resourceCost, effects });
        ability = {
            ...ability,
            resourceCost: totalResourceCost, // Primarily used for calculating resourceCost === 'x' multiplier
        };

        const source = { type: TRIGGER_SOURCE_TYPES.ABILITY, source: ability, actorId, triggerHistory: [], isProc };
        const resourceSpend = { resources: -totalResourceCost, combatantId: combatant.id };

        if (!isAutoCast) {
            dispatch(applyStatChanges([resourceSpend]));
        }

        dispatch(checkSummonMinion({ ability, selectedIndex, side: friendlySide, actorId, parentSource: source, isAutoCast }));

        const { target: initialTarget } = actions[0] || {};

        // This could become stale between actions but not an issue at the time of implementation. Only Curse Eye applies this effect.
        const isEffectRandomTargeting = combatant.effects?.some((e) => e.hitRandomTarget);

        let prevSelection;

        const handleAction = (action: Action) => {
            const actorInfo = findCombatantData(getState, actorId);
            const actor = actorInfo?.combatant;
            // Something could've happened between actions that killed the actor
            const canAct = actor?.HP > 0 && !isTurnActionPrevented(actorInfo);
            if (!canAct) {
                return;
            }

            let selection;

            if (isEffectRandomTargeting && action.target === TARGET_TYPES.HOSTILE) {
                selection = autoSelectActionTarget({
                    initialSelectedIndex: selectedIndex,
                    initialSelectedSide: initialSide,
                    action: {
                        ...action,
                        target: TARGET_TYPES.RANDOM_HOSTILE,
                    },
                    actorId,
                    getState,
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
                    getState,
                });

                prevSelection = selection;
            }

            const { side, index } = selection;

            const getCalculationTarget = (calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES): CombatantInfo | BattleState => {
                if (calculationTarget === CONDITION_TARGETS.BATTLE) {
                    return getState().battle;
                }
                if (calculationTarget === CONDITION_TARGETS.ACTOR) {
                    return findCombatantData(getState, actorId);
                }

                return findCombatantData(getState, getState().battle[side]?.[index]?.id);
            };

            if (passesConditions({ getCalculationTarget, proc: action, source })) {
                dispatch(performAction({ action, selectedIndex: index, side, actorId, parent: ability, parentSource: source, isAutoCast }));
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
            dispatch(triggerStatChangeEvents([{ statUpdate: resourceSpend, source }]));
        }

        const actorInfo = findCombatantData(getState, actorId);
        // Due to morph, the combatant may no longer exist
        if (actorInfo) {
            dispatch(onUseAbility({ actorInfo, source, ability, isAutoCast }));
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
                    icon: item.image,
                    animation: ANIMATION_TYPES.CONSUMABLE,
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
    ({
        actorInfo,
        source,
        ability,
        isAutoCast,
    }: {
        actorInfo: CombatantInfo;
        source: TriggerSource;
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
                source: source,
            })
        );

        ability?.effects?.forEach((effect) => {
            if (effect.onUse?.ability) {
                dispatch(useAbility({ ability: effect.onUse?.ability, actorId: source?.actorId, isProc: true }));
            }
        });

        if (isOffensiveAbility(ability)) {
            dispatch(
                checkEventTrigger({
                    combatantId: actor.id,
                    effectEventKey: EFFECT_EVENT_KEYS.onOffensiveAbility,
                    source: source,
                })
            );
        } else if (isSupportAbility(ability)) {
            dispatch(
                checkEventTrigger({
                    combatantId: actor.id,
                    effectEventKey: EFFECT_EVENT_KEYS.onSupportAbility,
                    source: source,
                })
            );
        }

        actorInfo.hostile.forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onHostileAbility,
                        source: source,
                    })
                );

                if (actor.isPlayer) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onPlayerAbility,
                            source: source,
                        })
                    );
                }

                if (isSupportAbility(ability)) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onHostileSupportAbility,
                            source: source,
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
                        source: source,
                    })
                );

                if (actor.isPlayer) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onPlayerAbility,
                            source: source,
                        })
                    );
                }

                if (isSupportAbility(ability)) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onFriendlySupportAbility,
                            source: source,
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
                            source: source,
                        })
                    );
                }
            }
        });
    };

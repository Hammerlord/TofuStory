import {
    ACTION_TYPES,
    Ability,
    Action,
    CONDITION_TARGETS,
    CombatAbility,
    CombatEffect,
    EFFECT_EVENT_KEYS,
    EffectEventTrigger,
    TARGET_TYPES,
} from "../../ability/types";
import { playerStateSlice } from "../../character/playerReducer";
import { Combatant, Player } from "../../character/types";
import { abilityNameMap } from "../../enemy";
import { Item } from "../../item/types";
import { passesChance } from "../../utils";
import { passesConditions } from "../passesConditions";
import { BattleState, battleStateSlice } from "../reducer";
import { CombatantInfo, TRIGGER_SOURCE_TYPES, TriggerSource } from "../types";
import { canTargetIfStealthed, getMultiplier, isSilenced, isStunnedOrFrozen, isTurnActionPrevented, isTurnToTrigger } from "../utils";
import { findCombatantData } from "./combatantData";
import { TRIGGER_TARGET_TYPES } from "./../../ability/types";
import { ActionContext } from "./../types";
import { performAction } from "./actions";
import { checkHandleAutoCast } from "./autoCast";
import { checkCardActions, handleDrawOriginalAbility } from "./cardActions/cardActions";
import { applyAbilityEventEffects } from "./cardActions/drawCards";
import { checkUpdateEffectLifecycle } from "./effectLifecycle";
import { enqueueEvent } from "./enqueueEvent";
import { getUpdatedStats } from "./getUpdatedStats";
import { checkInduce } from "./inducedAction";
import { aggregateStatUpdates } from "./playbackCollector";
import { applyStatChanges, triggerStatChangeEvents } from "./statChanges";
import { autoSelectActionTarget, calculateTargetIndices } from "./targeting/targeting";
import { updateCombatant } from "./combatantData";
import { onUseAbility, useAbility } from "./useAbility";

const { updateBattle, updateBattleState, pushEventQueue } = battleStateSlice?.actions || {};
const { updatePlayer } = playerStateSlice?.actions || {};

export const onEffectEventTrigger = ({
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
                    actor: owner.combatant as Player,
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

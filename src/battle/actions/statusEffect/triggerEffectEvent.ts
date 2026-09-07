import {
    ACTION_TYPES,
    Ability,
    AbilityEvent,
    Action,
    CardPileType,
    CombatAbility,
    CombatEffect,
    EFFECT_EVENT_KEYS,
    Effect,
    EffectEventTrigger,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../../../ability/types";
import { Combatant, Player } from "../../../character/types";
import { abilityNameMap } from "../../../enemy";
import { Item } from "../../../item/types";
import { AppDispatch, RootState } from "../../../store";
import { passesChance } from "../../../utils";
import { calculateBonus } from "../../calculateBonus";
import { getMultiplier } from "../../getMultiplier";
import { passesConditions } from "../../passesConditions";
import { battleStateSlice } from "../../reducer";
import { ActionContext, BattleState, CombatantInfo, TRIGGER_SOURCE_TYPES, TriggerSource } from "../../types";
import { canTargetIfStealthed, isSilenced, isStunnedOrFrozen } from "../../utils";
import { checkHandleAutoCast } from "../autoCast";
import { checkCardActions, handleDrawOriginalAbility } from "../cardActions/cardActions";
import { applyAbilityEventEffects } from "../cardActions/utils";
import { findCombatantData, isTurnActionPrevented, updateCombatant } from "../combatantData";
import { enqueueEvent } from "../enqueueEvent";
import { getUpdatedStats } from "../getUpdatedStats";
import { checkInduce } from "../inducedAction";
import { performAction } from "../performAction";
import { aggregateStatUpdates } from "../playbackCollector";
import { applyStatChanges, triggerStatChangeEvents } from "../statChanges";
import { autoSelectActionTarget, calculateTargetIndices } from "../targeting/targeting";
import { onUseAbility, useAbility } from "../useAbility";
import { checkUpdateEffectLifecycle, isTurnToTrigger } from "./effectLifecycle";

const { updateBattle } = battleStateSlice?.actions || {};

/**
 * Checks conditions, chance, and silence/stun to determine if an effect event may proceed, updating the effect's lifecycle if so.
 */
const checkEffectEventTriggerGate = ({
    effect,
    effectEvent,
    context,
    ownerId,
    effectOwner,
    effectApplier,
    sourceActorInfo,
    targetInfo,
    allTargets,
    battleState,
    source,
    canBeSilenced,
    usableWhileStunned,
}: {
    effect: CombatEffect;
    effectEvent: EffectEventTrigger;
    context: ActionContext;
    ownerId: string;
    effectOwner: CombatantInfo;
    effectApplier: CombatantInfo | undefined;
    sourceActorInfo: CombatantInfo | undefined;
    targetInfo: CombatantInfo | undefined;
    allTargets: CombatantInfo[];
    battleState: BattleState;
    source: TriggerSource | undefined;
    canBeSilenced: boolean | undefined;
    usableWhileStunned: boolean | undefined;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState): boolean => {
        const conditionProps = {
            effectOwner,
            effectApplier,
            actor: sourceActorInfo,
            target: targetInfo,
            allTargets,
            battle: battleState,
            context,
        };

        // Must pass parent effect conditions as well as child effectEvent conditions (if any)
        const conditionsPassed =
            passesConditions({
                ...conditionProps,
                proc: effect,
            }) &&
            passesConditions({
                ...conditionProps,
                proc: effectEvent,
            });

        if (!conditionsPassed) {
            return false;
        }

        const caster = effectOwner;

        const chanceMultiplier = getMultiplier({
            ...getState().battle!,
            actor: caster,
            target: caster,
            allTargets: [caster],
            source: source,
            multiplier: effectEvent.multiplier,
            actionParent: source?.source,
        });

        const { chance: chanceWithBonus = 1 } =
            calculateBonus({
                ...getState().battle!,
                action: effectEvent,
                actor: caster,
                target: caster,
                allTargets: [caster],
                actionParent: source?.source,
                context,
                isTargetSelected: false,
            }) || {};

        const chanceCheckPass = Math.random() < chanceWithBonus * chanceMultiplier;
        if (!chanceCheckPass) {
            return false;
        }

        const ownerInfo = findCombatantData(getState().battle!, ownerId);
        if (!ownerInfo) {
            return false;
        }

        const { combatant } = ownerInfo;
        dispatch(checkUpdateEffectLifecycle({ effect, effectEvent, context, owner: combatant }));

        const cannotTrigger = (canBeSilenced && isSilenced(combatant)) || (!usableWhileStunned && isStunnedOrFrozen(combatant));
        return !cannotTrigger;
    };
};

/**
 * Applies the effect event's stat changes/effects to its calculated targets and enqueues the resulting playback.
 */
const applyEffectEventStatChanges = ({
    targets,
    other,
    effects,
    stacks,
    initialTargetIds,
    postCardActionsOwner,
    ownerId,
    procContext,
    multiplierConfig,
    source,
    effectEvent,
}: {
    targets: (Combatant | null)[] | undefined;
    other: Record<string, any>;
    effects: (Effect | string)[];
    stacks: number | undefined;
    initialTargetIds: string[];
    postCardActionsOwner: CombatantInfo;
    ownerId: string;
    procContext: ActionContext;
    multiplierConfig: EffectEventTrigger["multiplier"];
    source: TriggerSource | undefined;
    effectEvent: EffectEventTrigger;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        if (!targets) {
            return;
        }

        // No stat changes will trigger so skip the whole block
        // This check is pretty cursed and not comprehensive but fixes an issue where Magic Guard's initial turn end did not apply armor
        const onlyMetadata =
            Object.keys(other).length === 0 || (Object.keys(other).length === 1 && Object.keys(other)[0].toLowerCase().includes("target"));
        if (onlyMetadata && effects.length === 0) {
            return;
        }

        let effectsToApply: (Effect | string)[] = [];
        if (Array.isArray(effects)) {
            effectsToApply = effects.map((e) => {
                if (typeof e === "string") {
                    return e;
                }

                const totalStacks = (e.stacks || 1) * (stacks || 1);
                const maxStacks = e.maxStacks || Infinity;
                return { ...e, stacks: Math.min(maxStacks, totalStacks) };
            });
        }

        const action: Action = {
            type: ACTION_TYPES.NONE, // No animation
            ...other,
            effects: effectsToApply,
        };

        // This calculates `action.area` for the effect event trigger
        const targetIds: string[] = [];

        initialTargetIds
            .map((id) => findCombatantData(getState().battle!, id))
            // Bug with Curse Eye mirror images where a combatant could not be looked up; don't know why though
            .filter((data): data is CombatantInfo => data !== undefined)
            .map((data: CombatantInfo) => {
                return calculateTargetIndices({
                    action,
                    selectedIndex: data.index,
                    side: data.friendlySide,
                    actorData: postCardActionsOwner,
                    targetData: data,
                    battle: getState().battle!,
                    context: procContext,
                    isPreviewMode: Boolean(procContext?.isPreviewMode),
                }).targetedIndices;
            })
            .forEach((indices: number[]) => {
                indices.forEach((i) => {
                    const id = targets[i]?.id;
                    if (id && !targetIds.includes(id)) {
                        targetIds.push(id);
                    }
                });
            });

        const updated = getUpdatedStats({
            ...getState().battle!,
            targetIds,
            actorId: ownerId,
            action: {
                ...action,
                multiplier: multiplierConfig,
            },
            context: procContext,
            getCombatantById: (id: string) => findCombatantData(getState().battle!, id),
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
                actionParent: source?.source,
                actorId: ownerId,
                context: procContext,
                selectedIndex: postCardActionsOwner.index,
                targetSide: postCardActionsOwner.friendlySide,
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
    };
};

/**
 * Triggers the effect event's follow-up ability (if any) from the effect owner and reports it as used.
 */
const triggerEffectEventFollowUpAbility = ({
    effectEventAbility,
    context,
    procContext,
    ownerId,
    initialSelectedIndex,
    initialSelectedSide,
    usableWhileStunned,
    usableWhileDead,
    effectEventKey,
}: {
    effectEventAbility: EffectEventTrigger["ability"];
    context: ActionContext;
    procContext: ActionContext;
    ownerId: string;
    initialSelectedIndex: number | undefined;
    initialSelectedSide: CombatantInfo["friendlySide"] | undefined;
    usableWhileStunned: boolean | undefined;
    usableWhileDead: boolean | undefined;
    effectEventKey: string;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        // Disable procs for ability previews; especially procs that will randomly trigger or target are very problematic for preview
        if (!effectEventAbility || context?.isPreviewMode) {
            return;
        }

        const ability: Ability | undefined =
            typeof effectEventAbility === "string" ? abilityNameMap[effectEventAbility] : effectEventAbility;
        let abilityUsed = false; // One or more actions must have been performed to trigger onUseAbility

        const abilityContext: ActionContext = {
            ...procContext,
            sourceChain: [...(procContext.sourceChain || []), { source: ability }],
        };

        ability?.actions.forEach((action: Action) => {
            const selection = autoSelectActionTarget({
                initialSelectedIndex,
                initialSelectedSide,
                action,
                actorId: ownerId,
                battle: getState().battle!,
            });

            if (!selection) {
                return;
            }

            const { index, side } = selection;
            const target = getState().battle![side]?.[index];
            const targetData = findCombatantData(getState().battle!, target?.id);

            const actorInfo = findCombatantData(getState().battle!, ownerId);
            const actor = actorInfo?.combatant;
            if (!actor) {
                return;
            }

            const isPassAliveConditions = actor.HP > 0 || usableWhileDead || effectEventKey === EFFECT_EVENT_KEYS.onDeath;
            const canAct =
                isPassAliveConditions &&
                !isTurnActionPrevented(actorInfo!, {
                    bypassStun: usableWhileStunned,
                    bypassPreventTurnAction: Boolean(action.bypassPreventTurnAction),
                });

            // Something could've happened between actions that killed the actor
            if (!canAct) {
                return;
            }

            if (
                action.target &&
                [TARGET_TYPES.HOSTILE, TARGET_TYPES.RANDOM_HOSTILE].includes(action.target) &&
                !canTargetIfStealthed(actor, target, action)
            ) {
                return;
            }

            if (passesConditions({ actor: actorInfo, target: targetData, battle: getState().battle!, proc: action, context })) {
                abilityUsed = true;

                dispatch(
                    performAction({
                        action,
                        selectedIndex: index,
                        side,
                        actorId: ownerId,
                        parentContext: abilityContext,
                    })
                );
            }
        });

        if (!abilityUsed) {
            return;
        }

        const actorInfo = findCombatantData(getState().battle!, ownerId);
        if (!actorInfo) {
            return;
        }

        dispatch(
            onUseAbility({
                actorInfo,
                context: abilityContext,
                ability,
            })
        );
    };
};

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
    context: ActionContext;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
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
            effects = [],
            ...other
        } = effectEvent;

        const source: TriggerSource | undefined = context?.sourceChain?.at(-1);
        // Should all onEffectEventTriggers from effects just be considered procs?
        // This is currently to prevent Charged interacting with Green Bamboo Hat. Also be mindful of the bug where
        // buffs like Sweeping Reach stopped decrementing properly on offense ability.
        context = { ...context, isProc: source?.type === TRIGGER_SOURCE_TYPES.EFFECT };

        const battleState = getState().battle!;
        const effectOwner = findCombatantData(battleState, ownerId) as CombatantInfo;
        const effectApplier = findCombatantData(battleState, effect?.applierId);
        const sourceActorInfo = findCombatantData(battleState, source?.actorId);
        const targetInfo = findCombatantData(battleState, source?.targetId);
        const allTargets = (source?.allTargetIds || [])
            .map((id) => findCombatantData(battleState, id))
            .filter((v): v is CombatantInfo => v !== undefined);

        const canTrigger = dispatch(
            checkEffectEventTriggerGate({
                effect,
                effectEvent,
                context,
                ownerId,
                effectOwner,
                effectApplier,
                sourceActorInfo,
                targetInfo,
                allTargets,
                battleState,
                source,
                canBeSilenced,
                usableWhileStunned,
            })
        );

        if (!canTrigger) {
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

        const postCardActionsOwner = findCombatantData(getState().battle!, ownerId);
        if (!postCardActionsOwner) {
            return;
        }

        if (postCardActionsOwner?.combatant?.isPlayer) {
            const multiplier = getMultiplier({
                ...getState().battle!,
                multiplier: multiplierConfig,
                actor: postCardActionsOwner,
            });

            dispatch(
                checkHandleAutoCast({
                    autoCastAbilities,
                    actor: postCardActionsOwner.combatant as Player,
                    parentAbility: parent as any,
                    multiplier,
                    context: procContext,
                })
            );
        }

        const calculationTargetIds: string[] = (() => {
            if (!targetType) {
                return [ownerId];
            }

            const player = battleState.playerSide.find((combatant) => combatant?.isPlayer) as Player;

            const targetIds =
                {
                    [TRIGGER_TARGET_TYPES.EFFECT_OWNER]: [ownerId],
                    [TRIGGER_TARGET_TYPES.EFFECT_APPLIER]: [effect?.applierId],
                    [TRIGGER_TARGET_TYPES.ACTOR]: [source?.actorId],
                    // This is the PRIMARY target only:
                    [TRIGGER_TARGET_TYPES.TARGET]: [source?.targetId],
                    [TRIGGER_TARGET_TYPES.ALL_TARGETS]: source?.allTargetIds || [],
                    [TRIGGER_TARGET_TYPES.PLAYER]: [player.id],
                }[targetType] || [];

            return targetIds.filter((v): v is string => v !== undefined) as string[];
        })();

        // Check that the individual target passes conditions for the effect event if applicable. Prior to this, only the primary
        // target was checked and then it would pass/fail for all targets.
        const initialTargetIds = calculationTargetIds.filter((id) => {
            const perIdData = findCombatantData(battleState, id);
            const isTarget = targetType === TRIGGER_TARGET_TYPES.TARGET;
            const isAllTargets = targetType === TRIGGER_TARGET_TYPES.ALL_TARGETS;
            return passesConditions({
                effectOwner,
                effectApplier,
                actor: sourceActorInfo,
                target: isTarget ? perIdData : targetInfo,
                allTargets: isAllTargets ? (perIdData ? [perIdData] : []) : allTargets,
                battle: battleState,
                proc: effectEvent,
                context,
            });
        });

        const initialTargetData = findCombatantData(getState().battle!, initialTargetIds[0]);
        const { index: i, friendlySide, friendly: targets } = initialTargetData || {};

        dispatch(
            applyEffectEventStatChanges({
                targets,
                other,
                effects,
                stacks,
                initialTargetIds,
                postCardActionsOwner,
                ownerId,
                procContext,
                multiplierConfig,
                source,
                effectEvent,
            })
        );

        dispatch(
            triggerEffectEventFollowUpAbility({
                effectEventAbility,
                context,
                procContext,
                ownerId,
                initialSelectedIndex: i,
                initialSelectedSide: friendlySide,
                usableWhileStunned,
                usableWhileDead,
                effectEventKey,
            })
        );
    };
};

export const checkEventTrigger = ({
    combatantId,
    effectEventKey,
    context,
}: {
    combatantId: string | undefined | null;
    effectEventKey: EFFECT_EVENT_KEYS;
    context: ActionContext;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        if (!combatantId) {
            return;
        }

        const { combatant } = findCombatantData(getState().battle!, combatantId) || {};
        if (!combatant) {
            return;
        }

        const source = context?.sourceChain?.at(-1);
        const fromProc = source?.isProc || context?.isProc;

        const triggerEffectEvent = ({ effect, effectEvent }: { effect: CombatEffect; effectEvent: EffectEventTrigger }) => {
            const { uptime, turnsTriggerFrequency = 0, id, disableEffectEvents } = effect;

            if (disableEffectEvents) {
                return;
            }

            // Dead characters generally cannot trigger effects except in case of killing blows
            const usable = effectEventKey === EFFECT_EVENT_KEYS.onDeath || combatant.HP > 0 || effectEvent?.usableWhileDead;
            if (!usable) {
                return;
            }

            const excludeEffectOwner =
                effectEvent.excludeEffectOwner && (source?.actorId === combatantId || source?.targetId === combatantId);
            if (excludeEffectOwner) {
                return;
            }

            const eventTriggeredTimes = (effectEvent.eventTriggeredTimes || 0) + 1;
            const triggerSum = (effectEvent.triggerSum || 0) + (context?.trackSumAmount || 1);

            dispatch(updateEffectEventTriggeredTimes({ combatantId, effectEventKey, eventTriggeredTimes, triggerSum, effectId: id }));

            const meetsTriggerTimes = !effectEvent.eventTriggerFrequency || eventTriggeredTimes % effectEvent.eventTriggerFrequency === 0;
            const parentSource: Action | CombatEffect | Ability | Item | undefined = source?.source;
            const notTriggeringSameEffect = effect.id !== (parentSource as CombatEffect)?.id;
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

                    return Math.floor(triggerSum / freq) - Math.floor((effectEvent.triggerSum || 0) / freq);
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

        if (combatant.isPlayer && !fromProc) {
            dispatch(triggerCardEffectEvents({ effectEventKey, context, source }));
        }
    };
};

/**
 * Update the number of times an effect event triggered (regardless of whether the actual effects went through or not).
 */
const updateEffectEventTriggeredTimes = ({
    combatantId,
    effectEventKey,
    eventTriggeredTimes,
    triggerSum,
    effectId,
}: {
    combatantId: string;
    effectEventKey: EFFECT_EVENT_KEYS;
    eventTriggeredTimes: number;
    triggerSum: number;
    effectId: string;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        // Effects could have been removed from one effectEvent trigger to the next, so make sure we're getting the updated one here
        const currentEffects = findCombatantData(getState().battle!, combatantId)?.combatant?.effects || [];

        dispatch(
            updateCombatant({
                combatantId,
                newProperties: {
                    effects: currentEffects.map((e) => {
                        if (e.id !== effectId) {
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
    };
};

const triggerCardEffectEvents = ({
    effectEventKey,
    context,
    source,
}: {
    effectEventKey: EFFECT_EVENT_KEYS;
    context: ActionContext;
    source?: TriggerSource;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const { playerSide, hand } = getState().battle!;
        const actorId = source?.actorId;
        if (!actorId) {
            return;
        }

        const actorIsPlayer = playerSide.some((combatant: Combatant | null) => combatant?.isPlayer && combatant.id === actorId);
        if (!actorIsPlayer) {
            return;
        }

        hand.forEach((card: CombatAbility) => {
            const cardEvent = card[effectEventKey as keyof CombatAbility] as AbilityEvent | undefined;
            if (!cardEvent) {
                return;
            }

            const ability = cardEvent.ability;
            if (ability && passesChance(cardEvent.chance)) {
                dispatch(
                    useAbility({
                        ability,
                        actorId,
                        isProc: true,
                        context,
                    })
                );
            }
        });

        const applyEffects = (pileName: CardPileType) => {
            const pile = getState().battle![pileName];

            return pile.map((card: CombatAbility) => {
                const event: AbilityEvent | undefined = card[effectEventKey as keyof CombatAbility] as AbilityEvent | undefined;
                if (!event || (event?.inPile && !event.inPile.includes(pileName))) {
                    return card;
                }

                return applyAbilityEventEffects({
                    event,
                    ability: card,
                    battle: getState().battle!,
                    context,
                    player: playerSide.find((c: Combatant | null) => c?.isPlayer) as Player,
                });
            });
        };

        dispatch(
            updateBattle({
                hand: applyEffects("hand"),
                deck: applyEffects("deck"),
                discard: applyEffects("discard"),
                depleted: applyEffects("depleted"),
            })
        );
    };
};

import { uniq } from "lodash";
import { isOffensiveAction } from "../../ability/AbilityView/utils";
import {
    ACTION_TYPES,
    AbilityEffect,
    Action,
    ActionOptionalProperties,
    CombatAbility,
    EFFECT_EVENT_KEYS,
    TARGET_TYPES,
} from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { AppDispatch, RootState } from "../../store";
import { getMultiplier } from "../getMultiplier";
import { passesConditions } from "../passesConditions";
import { battleStateSlice } from "../reducer";
import { BattleState } from "../types";
import {
    ActionContext,
    BATTLEFIELD_SIDES,
    CombatantInfo,
    Displacement,
    NonCombatCharacterInfo,
    TRIGGER_SOURCE_TYPES,
    TriggerSource,
} from "../types";
import { checkHandleAutoCast } from "./autoCast";
import { checkCardActions, deleteCard } from "./cardActions/cardActions";
import { findCombatantData, updateCombatant } from "./combatantData";
import { enqueueEvent } from "./enqueueEvent";
import { UpdatedCombatantStats, UpdatedStatsProps, getUpdatedStats } from "./getUpdatedStats";
import { checkInduce } from "./inducedAction";
import { checkHandleMovement, checkHandleVacuum } from "./movement";
import { aggregateStatUpdates } from "./playbackCollector";
import { applyStatChanges, triggerStatChangeEvents } from "./statChanges";
import { getEnabledEffects } from "./statusEffect/getEnabledEffects";
import { checkEventTrigger } from "./statusEffect/triggerEffectEvent";
import { checkHandleMorph } from "./summon/morphMerge";
import { checkHandleActionSummon } from "./summon/summon";
import { autoSelectActionTarget, calculateTargetIndices } from "./targeting/targeting";

const { updateBattle } = battleStateSlice?.actions || {};

export const performAction = ({
    action,
    selectedIndex,
    side,
    actorId,
    parentContext,
    isAutoCast = false,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    actorId: string;
    parentContext: ActionContext;
    isAutoCast?: boolean;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const battle = getState().battle! as BattleState;
        const actorData: CombatantInfo | undefined = findCombatantData(battle, actorId);
        if (!actorData || !side) {
            return;
        }

        const battleSide = battle[side];
        const target = findCombatantData(battle, battleSide[selectedIndex]?.id)!;

        const { vacuum, secondaryAction, autoCastAbilities, retreat } = action;
        const combatants = battle[side];
        const parentSource = parentContext.sourceChain?.at(-1);

        const targetSource: TriggerSource = {
            ...parentSource,
            source: action,
            type: TRIGGER_SOURCE_TYPES.ACTION,
            actorId,
            targetId: combatants[selectedIndex]?.id,
            allTargetIds: [combatants[selectedIndex]?.id].filter((v) => v !== undefined),
        };

        const { targetedIndices, allIndices, area } = calculateTargetIndices({
            action,
            selectedIndex,
            side,
            actorData,
            targetData: target,
            battle,
            context: { ...parentContext, sourceChain: [...(parentContext?.sourceChain || []), targetSource] },
            isPreviewMode: Boolean(parentContext?.isPreviewMode),
        });

        const targetIds = targetedIndices.map((i: number) => combatants[i]?.id).filter((v) => v !== undefined);

        // Don't try to target things that are all gone/dead.
        // Amendment: unless it is a friendly-side ability such as a summon. There was an issue where the Dark Lord clone reveal was broken by this.
        if (isOffensiveAction(action) && targetIds.length === 0) {
            return;
        }

        action = { ...action, area };
        const source: TriggerSource = {
            ...targetSource,
            source: action,
            targetId: combatants[selectedIndex]?.id || targetIds[0],
            allTargetIds: targetIds,
        };

        const context: ActionContext = { ...parentContext, sourceChain: [...(parentContext?.sourceChain || []), source] };

        const updatedStatsProps: UpdatedStatsProps = {
            deck: battle.deck,
            hand: battle.hand,
            discard: battle.discard,
            selectedIndex,
            action,
            targetIds,
            actorId,
            actionParent: parentSource?.source,
            context,
            getCombatantById: (id: string) => findCombatantData(getState().battle! as BattleState, id),
        };

        let updatedSecondary: { statUpdate: UpdatedCombatantStats; action: Action; actorId?: string }[] | undefined;
        const triggerSecondaryAction = () => {
            return dispatch(
                handleSecondaryAction({
                    secondaryAction,
                    actorId,
                    context,
                    parentContext,
                    updatedStatsProps,
                    isAutoCast,
                    primaryActionTarget: findCombatantData(battle, combatants[selectedIndex]?.id),
                    battle,
                })
            );
        };

        if (secondaryAction?.isPriority) {
            updatedSecondary = triggerSecondaryAction();
        }

        const vacuumDisplacements: Displacement | undefined = dispatch(checkHandleVacuum({ vacuum, side, selectedIndex, area }));
        const movementDisplacements: Displacement | undefined = dispatch(
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
        const allTargetIndices = uniq([selectedIndex, ...allIndices]);

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

        const sourceChain = context?.sourceChain || [];

        dispatch(
            triggerStatChangeEvents(
                updated.map(({ statUpdate, action }) => {
                    const sourceWithUpdatedAction = { ...source, source: action };
                    return {
                        statUpdate,
                        context: { ...context, sourceChain: [...sourceChain, sourceWithUpdatedAction] },
                    };
                })
            )
        );

        if (secondaryAction && !secondaryAction.isPriority) {
            updatedSecondary = triggerSecondaryAction();
            if (updatedSecondary) {
                const statUpdates = updatedSecondary.reduce(
                    (acc, payload) => {
                        const statUpdate = payload.statUpdate;
                        if (statUpdate?.combatantId) {
                            acc[statUpdate.combatantId] = statUpdate;
                        }
                        return acc;
                    },
                    {} as { [combatantId: string]: UpdatedCombatantStats }
                );

                // Since this is a non-priority secondaryAction, the event did not get rolled into the main action's event group. So we need to create a new event for it.
                dispatch(
                    enqueueEvent({
                        action: secondaryAction,
                        actionParent: parentSource?.source,
                        actorId,
                        selectedIndex,
                        allTargetIndices,
                        targetSide: side,
                        context: context,
                        displacements,
                        statUpdates,
                        options: { alwaysGroup: true },
                    })
                );
            }
        }

        // *But don't trigger the related effect events until after the action has resolved
        hitEffects.forEach((statChanges) => {
            dispatch(
                triggerStatChangeEvents(
                    statChanges.map(({ statUpdate, action }) => ({
                        statUpdate,
                        context: {
                            ...context,
                            sourceChain: [...sourceChain, { ...hitTriggerSource, source: action, statUpdate }],
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
                        context: { ...context, sourceChain: [...sourceChain, { source: action, statUpdate }] },
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
            ...(getState().battle! as BattleState),
        });

        const parentAbility = parentSource?.type === TRIGGER_SOURCE_TYPES.ABILITY ? (parentSource.source as CombatAbility) : undefined;

        dispatch(
            checkHandleAutoCast({
                autoCastAbilities,
                actor: actorData.combatant as Player,
                parentAbility,
                multiplier,
                context,
            })
        );
        dispatch(
            onAction({
                action,
                context,
                parentAbility,
            })
        );

        dispatch(
            handleOnReceiveAction({
                updatedStats: updated,
                context: context,
                combatants,
            })
        );
        dispatch(checkHandleActionSummon({ action, actorId, parentContext, actionParent: parentSource?.source }));
        dispatch(checkHandleMorph({ action, morphTargetIds: targetIds, actorId, parentContext, actionParent: parentSource?.source }));
        dispatch(checkInduce({ action, affectedTargetIds: targetIds, parentContext }));

        if (retreat) {
            const { friendly, friendlySide } = findCombatantData(getState().battle!, actorId) || {};
            if (!friendly || !friendlySide) {
                return;
            }

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
    getState: () => RootState;
}): { statUpdate: UpdatedCombatantStats; action: Action }[][] => {
    if (!action.type) {
        return [];
    }

    if (![ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK].includes(action.type)) {
        return [];
    }

    const actorInfo = findCombatantData(getState().battle!, actorId);
    const { combatant: actor, index } = actorInfo || {};
    if (!actor || actor?.HP <= 0) {
        return [];
    }

    const results: { statUpdate: UpdatedCombatantStats; action: Action; actorId?: string }[][] = [];
    const lifeOnHit = getEnabledEffects({ combatantInfo: actorInfo, context, battle: getState().battle! }).reduce(
        (acc, { lifeOnHit = 0, stacks = 1 }) => acc + lifeOnHit * stacks,
        0
    );

    if (lifeOnHit) {
        const updated = getUpdatedStats({
            ...getState().battle!,
            actorId: actor.id,
            targetIds: [actor.id],
            selectedIndex: index,
            action: {
                type: ACTION_TYPES.EFFECT,
                healing: lifeOnHit * affectedTargets.length,
            },
            context: context,
            getCombatantById: (id) => findCombatantData(getState().battle!, id),
        });

        results.push(updated);
    }

    const totalThorns = affectedTargets.reduce((acc, id: string) => {
        const combatantData = findCombatantData(getState().battle!, id);
        getEnabledEffects({ combatantInfo: combatantData, context, battle: getState().battle! }).forEach(
            ({ thorns = 0, stacks = 1 }) => (acc += thorns * stacks)
        );
        return acc;
    }, 0);

    if (totalThorns) {
        const updated = getUpdatedStats({
            ...getState().battle!,
            targetIds: [actor.id],
            action: {
                type: ACTION_TYPES.EFFECT,
                flatDamage: totalThorns,
            },
            context: context,
            getCombatantById: (id) => findCombatantData(getState().battle!, id),
        });

        results.push(updated);
    }

    const totalMesoSteal = getEnabledEffects({ combatantInfo: actorInfo, context, battle: getState().battle! }).reduce(
        (acc, { mesoSteal = 0, stacks = 1 }) => acc + mesoSteal * stacks,
        0
    );

    if (totalMesoSteal) {
        const updatedTargets = getUpdatedStats({
            ...getState().battle!,
            actorId: actor.id,
            targetIds: affectedTargets,
            selectedIndex: index,
            action: {
                type: ACTION_TYPES.EFFECT,
                stealMesos: totalMesoSteal * affectedTargets.length,
            },
            context: context,
            getCombatantById: (id) => findCombatantData(getState().battle!, id),
        });

        const totalMesosGained = updatedTargets.reduce((acc, { statUpdate }) => {
            return acc + Math.abs(statUpdate.mesos || 0);
        }, 0);

        const updatedActor = getUpdatedStats({
            ...getState().battle!,
            actorId: actor.id,
            targetIds: [actor.id],
            selectedIndex: index,
            action: {
                type: ACTION_TYPES.EFFECT,
                mesos: totalMesosGained,
            },
            context: context,
            getCombatantById: (id) => findCombatantData(getState().battle!, id),
        });

        results.push(updatedTargets, updatedActor);
    }

    return results;
};

const handleOnReceiveAction = ({
    updatedStats,
    context: context,
    combatants,
}: {
    updatedStats: { statUpdate: UpdatedCombatantStats; action: Action }[];
    context: ActionContext;
    combatants: (Combatant | null)[];
}) => {
    return (dispatch: AppDispatch) => {
        const isAttack = (action: Action) => action.type && [ACTION_TYPES.RANGE_ATTACK, ACTION_TYPES.ATTACK].includes(action.type);
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

const onAction = ({ action, context, parentAbility }: { action: Action; context: ActionContext; parentAbility?: CombatAbility }) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const latestSource = context?.sourceChain?.at(-1);
        const actorId = latestSource?.actorId;
        const combatantData = findCombatantData(getState().battle!, actorId);
        if (!combatantData) {
            return;
        }
        const { combatant, hostile } = combatantData;

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

        if (!parentAbility) {
            return;
        }

        const turnHistory = combatant.turnHistory || [];
        dispatch(
            updateCombatant({
                combatantId: actorId!,
                newProperties: {
                    turnHistory: [...turnHistory, { ...action, parent: parentAbility }],
                },
            })
        );
    };
};

const handleSecondaryAction = ({
    secondaryAction,
    actorId,
    context,
    parentContext,
    updatedStatsProps,
    isAutoCast,
    primaryActionTarget,
    battle,
}: {
    secondaryAction: (ActionOptionalProperties & { isPriority?: boolean; returnParentCardToHand?: boolean }) | undefined;
    actorId: string;
    context: ActionContext;
    parentContext: ActionContext;
    updatedStatsProps: any;
    isAutoCast: boolean;
    primaryActionTarget: CombatantInfo | NonCombatCharacterInfo | undefined;
    battle: BattleState;
}) => {
    return (
        dispatch: AppDispatch,
        getState: () => RootState
    ): { statUpdate: UpdatedCombatantStats; action: Action; actorId?: string }[] | undefined => {
        const actorData = findCombatantData(getState().battle! as BattleState, actorId);

        if (
            !secondaryAction ||
            !passesConditions({ target: primaryActionTarget, actor: actorData, proc: secondaryAction, context, battle })
        ) {
            return;
        }

        if (!actorData) {
            return;
        }

        const combatant = actorData?.combatant;
        if (!combatant?.HP) {
            return;
        }

        secondaryAction = {
            ...secondaryAction,
            type: secondaryAction.type || ACTION_TYPES.NONE,
            target: secondaryAction.target || TARGET_TYPES.SELF,
        };

        const target = autoSelectActionTarget({
            action: secondaryAction,
            actorId: combatant.id,
            battle,
        });

        if (!target.side || target.index === undefined) {
            return;
        }

        const targetId = battle[target.side]?.[target.index]?.id;
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
            isPreviewMode: Boolean(context?.isPreviewMode),
            context,
        });

        const recipientIds: string[] = recipientIndices.targetedIndices
            .map((i: number) => targetData.friendly[i]?.id)
            .filter((id): id is string => id !== undefined && id !== null);

        const source = context?.sourceChain?.at(-1);
        const updatedSecondary = getUpdatedStats({
            ...updatedStatsProps,
            actorId,
            targetIds: source?.allTargetIds || [],
            recipientIds,
            selectedIndex: target.index,
            action: secondaryAction,
        });
        dispatch(applyStatChanges(updatedSecondary.map(({ statUpdate }) => statUpdate)));

        if (secondaryAction.returnParentCardToHand) {
            // Tada, it copies and deletes the old card, and adds the copy with a new id to the hand
            const ability: CombatAbility | undefined = source?.source as CombatAbility;

            if (ability) {
                ability.instanceId && dispatch(deleteCard(ability.instanceId));
                const cardCopy: CombatAbility = {
                    ...ability,
                    effects: ability.effects.filter((e: AbilityEffect) => {
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
        }
        dispatch(
            triggerStatChangeEvents(
                updatedSecondary.map(({ statUpdate }) => ({
                    statUpdate,
                    context,
                }))
            )
        );

        dispatch(checkInduce({ action: secondaryAction, affectedTargetIds: recipientIds, parentContext: context }));
        dispatch(checkCardActions({ action: secondaryAction, context: parentContext, isAutoCast }));
        return updatedSecondary;
    };
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
    return (dispatch: AppDispatch, getState: () => RootState) => {
        if (!action.radiate) {
            return;
        }

        const battle: BattleState = getState().battle!;
        const actorId = battle[side][selectedIndex]?.id;
        if (!actorId) {
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
                actorId,
                parentContext: parentContext,
            })
        );
    };
};

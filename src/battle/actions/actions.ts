import { uniq } from "lodash";
import { isOffensiveAction } from "../../ability/AbilityView/utils";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    AbilityEffect,
    Action,
    ActionOptionalProperties,
    CONDITION_TARGETS,
    CombatAbility,
    CombatEffect,
    EFFECT_EVENT_KEYS,
    TARGET_TYPES,
} from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { getRandomItem } from "../../utils";
import { passesConditions } from "../passesConditions";
import { BattleState, battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES, CombatantInfo, Displacement, TRIGGER_SOURCE_TYPES, TriggerSource } from "../types";
import { applyVacuum, calculateActionArea, findCombatantData, getEnabledEffects, getMultiplier, getPossibleMoveIndices } from "../utils";
import { TRIGGER_TARGET_TYPES } from "./../../ability/types";
import { ActionContext } from "./../types";
import { checkHandleAutoCast } from "./autoCast";
import { checkCardActions, deleteCard } from "./cardActions/cardActions";
import { enqueueEvent } from "./enqueueEvent";
import { UpdatedCombatantStats, getUpdatedStats } from "./getUpdatedStats";
import { checkInduce } from "./inducedAction";
import { PlaybackCollector, aggregateStatUpdates } from "./playbackCollector";
import { applyStatChanges, triggerStatChangeEvents } from "./statChanges";
import { checkHandleActionSummon, checkHandleMorph } from "./summon";
import { autoSelectActionTarget, calculateTargetIndices } from "./targeting";
import { checkEventTrigger } from "./triggerEffectEvent";
import { updateCombatant } from "./updateCombatant";

const { updateBattle } = battleStateSlice?.actions || {};

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
                actor: actorData.combatant as Player,
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

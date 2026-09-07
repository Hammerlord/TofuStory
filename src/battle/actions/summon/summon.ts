import { cloneDeep } from "lodash";
import { tributeSummonBuff } from "../../../ability/Effects";
import {
    ACTION_TYPES,
    Ability,
    Action,
    ActionSummon,
    CombatAbility,
    EFFECT_EVENT_KEYS,
    Effect,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../../../ability/types";
import { Combatant } from "../../../character/types";
import { enemyNameMap } from "../../../enemy";
import { createCombatant } from "../../../enemy/createEnemy";
import { Item } from "../../../item/types";
import { getRandomItem, passesChance } from "../../../utils";
import { SUMMON_DELAY } from "../../constants";
import { passesConditions } from "../../passesConditions";
import { BattleState, battleStateSlice } from "../../reducer";
import { ActionContext, ActionParent, BATTLEFIELD_SIDES, CombatantInfo, TRIGGER_SOURCE_TYPES, TriggerSource } from "../../types";
import { performAction } from "../performAction";
import { findCombatantData } from "../combatantData";
import { requeueRecentlyUsedAbility } from "../phases/phases";
import { enqueueEvent } from "../enqueueEvent";
import { updateEnemyTargetingAfterEffectsApplied } from "../targeting/enemyTargeting";
import { checkEventTrigger } from "../statusEffect/triggerEffectEvent";
import { AppDispatch, RootState } from "../../../store";

const { updateBattle } = battleStateSlice?.actions || {};

/*
 * Handle action that summons a combatant in an empty slot on the board
 * TODO: Reuse checkSummonMinion code
 * @see checkSummonMinion
 */
export const checkHandleActionSummon = ({
    action,
    actorId,
    parentContext,
    // used to deal with the event grouping on the 'event' created for purely visual reasons
    actionParent,
}: {
    action: Action;
    actorId: string;
    parentContext: ActionContext;
    actionParent: ActionParent;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const bonuses = Array.isArray(action.bonus) ? action.bonus : [action.bonus];
        const actorData = findCombatantData(getState().battle! as BattleState, actorId);
        if (!actorData) {
            return;
        }

        const getCalculationTarget = (targetType: TRIGGER_TARGET_TYPES): CombatantInfo | undefined => {
            if (targetType === TRIGGER_TARGET_TYPES.ACTOR) {
                return actorData;
            }
        };

        const actionSummon = action.summon || [];
        const potentialBonusSummons: ActionSummon[] = bonuses.flatMap((b) => b?.summon || []);
        const summons = actionSummon
            .concat(potentialBonusSummons)
            .filter((b) => passesConditions({ getCalculationTarget, proc: b, context: parentContext }));

        if (!summons.length) {
            return;
        }

        const minionsSummoned: Combatant[] = [];
        const tributeSummonedMinions: string[] = []; // IDs of killers
        const { friendly, hostile, friendlySide, hostileSide, index: actorIndex, combatant: actor } = actorData;
        const mutableFriendly = friendly!.slice(); // This gets used to update the battlefield side at the end
        const mutableHostile = hostile!.slice();

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
            let pos: number | undefined;
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
                const indices: number[] = [];
                friendly.forEach((f, i) => {
                    if (f?.name && replaceMinionByName.includes(f.name)) {
                        indices.push(i);
                    }
                });

                if (indices.length > 0) {
                    pos = getRandomItem(indices);
                    pos = pos as number;

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
                }, [] as number[]);

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
                }, [] as Effect[]);
                minionEffects.push(...itemEffects);
            }

            if (typeof pos === "number") {
                const summonedMinion = createCombatant(cloneDeep({ ...baseMinion, effects: minionEffects }));
                if (summonedMinion) {
                    minionsSummoned.push(summonedMinion);
                    mutableSide[pos] = summonedMinion;

                    if (isTributeKill) {
                        tributeSummonedMinions.push(summonedMinion.id);
                    }
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
                    actionParent,
                })
            );
        }

        // Tribute summons count as a kill for the new minion
        tributeSummonedMinions.forEach((id) =>
            dispatch(checkEventTrigger({ combatantId: id, effectEventKey: EFFECT_EVENT_KEYS.onKill, context: parentContext }))
        );

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
            dispatch(requeueRecentlyUsedAbility({ combatantId: minion.id }));
            dispatch(updateEnemyTargetingAfterEffectsApplied({ combatantId: minion.id, effectsApplied: minion.effects }));
        });
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
    selectedIndex?: number;
    ability: Ability | CombatAbility;
    actorId: string;
    parentContext: ActionContext;
    isAutoCast?: boolean;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const { minion, minionOptions, resourceCost = 0 } = ability;
        if (!minion) {
            return;
        }

        const battle: BattleState = getState().battle!;
        const battlefieldSide = battle[side];
        const pickRandomSummonIndex = () => {
            if (isAutoCast) {
                const indices = battlefieldSide.map((_, i) => i).filter((_, i) => !battlefieldSide[i]?.isPlayer);
                return getRandomItem(indices);
            }
            return getRandomItem(getPossibleSummonIndices(battlefieldSide));
        };
        const index = typeof selectedIndex === "number" ? selectedIndex : pickRandomSummonIndex();
        const previousMinionInSlot = battlefieldSide[index];
        const isKillPreviousMinion = (previousMinionInSlot?.HP || 0) > 0;
        const minionEffects = minion.effects?.slice() || [];
        if (isKillPreviousMinion) {
            minionEffects.push(tributeSummonBuff);
        }

        const actor = findCombatantData(getState().battle!, actorId)?.combatant;
        if (actor?.isPlayer) {
            const itemEffects = actor.items.reduce((acc, item: Item) => {
                if (item.applyEffectsToSummons) {
                    acc.push(...(item.effects || []));
                }
                return acc;
            }, [] as Effect[]);

            minionEffects.push(...itemEffects);
        }

        const baseMinion = cloneDeep({ ...minion, effects: minionEffects });
        const summonedMinion = createCombatant(baseMinion) as Combatant;

        if (isKillPreviousMinion) {
            const { tributeSummon } = minionOptions || {};
            dispatch(tributeKill({ tributeSummon, resourceCost, actor, side, index, parentContext }));
        }

        const newBattleProps: {
            playerSide?: (Combatant | null)[];
            enemySide?: (Combatant | null)[];
        } = {
            [side]: getState().battle![side].map((combatant: Combatant | null, i: number) => {
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
                actionParent: ability,
            })
        );

        // Tribute summons count as a kill for the new minion
        if (isKillPreviousMinion) {
            dispatch(
                checkEventTrigger({ combatantId: summonedMinion.id, effectEventKey: EFFECT_EVENT_KEYS.onKill, context: parentContext })
            );
        }
        dispatch(onSummonTriggers({ summonedId: summonedMinion.id, summonerId: actorId, parentContext }));

        dispatch(updateEnemyTargetingAfterEffectsApplied({ combatantId: summonedMinion.id, effectsApplied: summonedMinion.effects }));
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
    parentContext: ActionContext;
}) => {
    return (dispatch: AppDispatch) => {
        if (typeof index !== "number") {
            return;
        }

        const actorResources = actor?.resources || 0;

        const action = {
            flatDamage: Infinity,
            type: ACTION_TYPES.NONE,
            target: TARGET_TYPES.FRIENDLY,
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

        if (!actor?.id) {
            // Actions always need an actor atm.
            return;
        }

        // The replaced minion dies
        dispatch(
            performAction({
                action,
                side,
                parentContext: { ...parentContext, sourceChain: [...(parentContext?.sourceChain || []), source] },
                selectedIndex: index,
                actorId: actor.id, // The actor is considered to have killed it
            })
        );
    };
};

/**
 * Called when a combatant is summoned on the board, typically handling status effect events
 */
export const onSummonTriggers =
    ({ summonedId, summonerId, parentContext }: { summonedId: string; summonerId: string; parentContext: ActionContext }) =>
    (dispatch: AppDispatch, getState: () => RootState) => {
        const context: ActionContext = {
            ...parentContext,
            sourceChain: [...(parentContext?.sourceChain || []), { actorId: summonerId, targetId: summonedId, allTargetIds: [summonedId] }],
        };

        dispatch(checkEventTrigger({ combatantId: summonedId, effectEventKey: EFFECT_EVENT_KEYS.onSummoned, context: context }));
        const { hostile, friendly } = findCombatantData(getState().battle!, summonerId) || {};
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

export const getPossibleSummonIndices = (friendly: (Combatant | null)[]): number[] => {
    const indices: number[] = [];
    friendly.forEach((f, i) => {
        if (!f || f.HP <= 0) indices.push(i);
    });

    return indices;
};

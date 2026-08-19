import { cloneDeep } from "lodash";
import * as uuid from "uuid";
import { tributeSummonBuff } from "../../ability/Effects";
import {
    ACTION_TYPES,
    Ability,
    Action,
    CombatAbility,
    CombatEffect,
    EFFECT_CLASSES,
    EFFECT_EVENT_KEYS,
    EFFECT_TYPES,
    Effect,
    MORPH_MINION_MODIFIERS,
    MORPH_TYPES,
    Minion,
    Morph,
    TARGET_TYPES,
} from "../../ability/types";
import { Combatant } from "../../character/types";
import { enemyNameMap } from "../../enemy";
import { CloudIcon, HourglassIcon } from "../../images/icons";
import { Item } from "../../item/types";
import { getRandomItem, shuffle } from "../../utils";
import { SUMMON_DELAY } from "../constants";
import { passesConditions } from "../passesConditions";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES, CombatantInfo, TRIGGER_SOURCE_TYPES, TriggerSource } from "../types";
import { getPossibleSummonIndices } from "../utils";
import { findCombatantData } from "./combatantData";
import { TRIGGER_TARGET_TYPES } from "./../../ability/types";
import { createCombatant } from "./../../enemy/createEnemy";
import { ActionContext } from "./../types";
import { updateEnemyTargetingAfterEffectsApplied } from "./enemyTargeting";
import { requeueRecentlyUsedAbility } from "./enemyTurn";
import { checkEventTrigger } from "./triggerEffectEvent";
import { enqueueEvent } from "./enqueueEvent";
import { performAction } from "./actions";

const { updateBattle, updateBattleState, pushEventQueue } = battleStateSlice?.actions || {};

/*
 * Handle action that summons a combatant in an empty slot on the board
 * TODO: Reuse checkSummonMinion code
 * @see checkSummonMinion
 */
export const checkHandleActionSummon = ({
    action,
    actorId,
    parentContext,
}: {
    action: Action;
    actorId: string;
    parentContext: ActionContext;
}) => {
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
export const checkHandleMorph = ({
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

const getStoredTargetEffect = ({ combatant, duration }: { combatant: Combatant; duration?: number }): CombatEffect => {
    const reveal = {
        usableWhileStunned: true,
        ability: {
            name: "Reveal",
            image: CloudIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    summon: [
                        {
                            minion: [
                                {
                                    ...combatant,
                                    effects: combatant.effects.filter((effect: Effect) => effect?.class !== EFFECT_CLASSES.DEBUFF),
                                },
                            ],
                            placement: "on-top",
                        },
                    ],
                },
            ],
        } as Ability,
    };

    return {
        name: "Reveal Timer",
        description: "When destroyed or when this effect ends, the hidden character will be revealed.",
        icon: HourglassIcon,
        type: EFFECT_TYPES.NONE,
        class: EFFECT_CLASSES.NONE,
        id: uuid.v4(),
        uptime: 1,
        canBeSilenced: false,
        duration,
        onDeath: reveal,
        onEnd: duration ? reveal : undefined,
        disableDisplayIcon: !duration,
    };
};

/**
 * Handle MORPH_TYPES.MERGE (take n minion(s) and transform them all to z minion(s))
 * This ignores morph conditions
 */
export const getMorphMerge = ({
    targets,
    morph,
    summoner,
}: {
    targets: CombatantInfo[];
    morph: Morph;
    summoner: CombatantInfo;
}): { side: BATTLEFIELD_SIDES; combatants: (Combatant | null)[]; summons: Combatant[] } | null => {
    const { minions, modifiers = {} } = morph;
    const targetIds = targets.map((t: CombatantInfo) => t?.combatant?.id);
    const { friendly, friendlySide, index } = summoner || targets[0] || {};

    if (!friendly) {
        return null;
    }

    const combatants = friendly.map((combatant: Combatant | null) => {
        if (targetIds.includes(combatant?.id)) {
            return null;
        }
        return combatant;
    });

    const possibleSummonIndices = shuffle(getPossibleSummonIndices(combatants));
    const summons = [];
    const getSummonPos = (positionIndex?: number): number => {
        if (typeof positionIndex === "number") {
            return positionIndex;
        }

        // If there is only one mutate target, replace the target
        if (targets.length === 1 && minions.length === 1) {
            return index;
        }

        return possibleSummonIndices.shift();
    };

    const modifierValues = Object.entries(modifiers).reduce((acc, [property, modifierType]) => {
        let value = targets.reduce((acc, targetInfo: CombatantInfo) => {
            return acc + (targetInfo.combatant[property] || 0);
        }, 0); // Default is sum
        if (modifierType === MORPH_MINION_MODIFIERS.DIVIDE_EVENLY) {
            value = Math.ceil(value / minions.length);
        } else if (modifierType === MORPH_MINION_MODIFIERS.MULTIPLY) {
            value = Math.ceil(value * 1.5);
        }
        acc[property] = value;
        return acc;
    }, {});

    for (const { minion, positionIndex, storeSummoner, turnLimit } of minions) {
        const pos = getSummonPos(positionIndex);
        const minionToSummon = typeof minion === "string" ? enemyNameMap[minion] : minion;
        if (!minionToSummon) {
            console.warn(`Didn't find a corresponding object for ${minion}. Is the lookup map up to date?`);
            return null;
        }

        if (typeof pos === "number") {
            combatants[pos] = {
                ...createCombatant({
                    ...minionToSummon,
                    ...modifierValues,
                }),
            };

            if (storeSummoner && summoner) {
                combatants[pos].effects.push(getStoredTargetEffect({ combatant: summoner.combatant, duration: turnLimit }));
            }

            summons.push(combatants[pos]);
        }
    }

    return { side: friendlySide, combatants, summons };
};

/**
 * Handle MORPH_TYPES.MAP (for each minion, transform it to another minion)
 */
export const getMorphMap = ({
    targets,
    morph,
    source,
    getState,
    summoner,
}: {
    targets: CombatantInfo[];
    morph: Morph;
    getState: Function;
    source: TriggerSource;
    summoner: CombatantInfo;
}): { side: BATTLEFIELD_SIDES; combatants: (Combatant | null)[]; summons: Combatant[] } | null => {
    const { minions, setOriginalHealthPercentage } = morph;
    const targetIds = targets.map((t: CombatantInfo) => t?.combatant?.id);
    const { friendly, friendlySide } = summoner || targets[0] || {};
    if (!friendly) {
        return null;
    }

    const summons = [];
    const combatants = friendly.map((combatant: Combatant, i) => {
        if (!targetIds.includes(combatant?.id)) {
            return combatant;
        }

        const minionConfig = minions.find((minionConfig) => {
            const getCalculationTarget = () => findCombatantData(getState().battle, combatant?.id); // Current combatant will always be the target
            return passesConditions({ getCalculationTarget, proc: minionConfig, source: source });
        });

        const minion = minionConfig?.minion;

        if (minion) {
            const minionToSummon = typeof minion === "string" ? enemyNameMap[minion] : minion;
            if (minionToSummon) {
                const { storeTarget, turnLimit } = minionConfig;

                // Retain id: it is the "same" combatant, now transformed. Used for allowing the transformed character to make a move on the same turn as the mutation
                const summon = { ...createCombatant(minionToSummon), id: combatant.id };
                if (storeTarget) {
                    summon.effects.push(getStoredTargetEffect({ combatant, duration: turnLimit }));
                }

                if (setOriginalHealthPercentage) {
                    const originalPercentage = (combatant?.HP || 1) / (combatant?.maxHP || 1);
                    summon.HP = Math.ceil(summon.HP * originalPercentage);
                }

                summons.push(summon);
                return summon;
            } else {
                console.warn(`Didn't find a corresponding object for ${minion}. Is the lookup map up to date?`);
            }
        }

        return combatant;
    });

    return { side: friendlySide, combatants, summons };
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

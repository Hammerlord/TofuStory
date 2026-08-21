import * as uuid from "uuid";
import {
    ACTION_TYPES,
    Ability,
    Action,
    CombatEffect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    MORPH_MINION_MODIFIERS,
    MORPH_TYPES,
    Morph,
    TARGET_TYPES,
} from "../../../ability/types";
import { Combatant } from "../../../character/types";
import { enemyNameMap } from "../../../enemy";
import createCombatant from "../../../enemy/createEnemy";
import { CloudIcon, HourglassIcon } from "../../../images/icons";
import { shuffle } from "../../../utils";
import { SUMMON_DELAY } from "../../constants";
import { passesConditions } from "../../passesConditions";
import { battleStateSlice } from "../../reducer";
import { ActionContext, ActionParent, BATTLEFIELD_SIDES, CombatantInfo, TriggerSource } from "../../types";
import { findCombatantData } from "../combatantData";
import { requeueRecentlyUsedAbility } from "../phases/enemyTurn";
import { enqueueEvent } from "../enqueueEvent";
import { getPossibleSummonIndices, onSummonTriggers } from "./summon";

const { updateBattle } = battleStateSlice?.actions || {};

/**
 * Handle action that transforms combatants to another combatant, eg. Mutant Snail casts Mutate and transforms Blue Snails to Red Snails
 */
export const checkHandleMorph = ({
    action,
    morphTargetIds,
    actorId,
    parentContext,
    actionParent,
}: {
    action: Action;
    morphTargetIds: string[];
    actorId: string;
    parentContext: ActionContext;
    actionParent: ActionParent;
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
                actionParent,
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
}; /**
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
}; /**
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

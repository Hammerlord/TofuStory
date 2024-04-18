import uuid from "uuid";
import {
    Ability,
    ACTION_TYPES,
    CombatEffect,
    Effect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Morph,
    MORPH_MINION_MODIFIERS,
    TARGET_TYPES,
} from "../../ability/types";
import { Combatant } from "../../character/types";
import { enemyNameMap } from "../../enemy";
import { createCombatant } from "../../enemy/createEnemy";
import { shuffle } from "../../utils";
import { passesConditions } from "../passesConditions";
import { CombatantInfo, TriggerSource } from "../types";
import { getPossibleSummonIndices } from "../utils";
import { findCombatantData } from "./actions";
import { CloudIcon, HourglassIcon } from "../../images/icons";

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
export const getMorphMerge = ({ targets, morph, summoner }: { targets: CombatantInfo[]; morph: Morph; summoner: CombatantInfo }) => {
    const { minions, modifiers = {} } = morph;
    const targetIds = targets.map((t: CombatantInfo) => t?.combatant?.id);
    const { friendly, friendlySide, index } = summoner || targets[0] || {};
    if (!friendly) {
        return {};
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
            return;
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
}) => {
    const { minions } = morph;
    const targetIds = targets.map((t: CombatantInfo) => t?.combatant?.id);
    const { friendly, friendlySide } = summoner || targets[0] || {};
    if (!friendly) {
        return {};
    }

    const summons = [];
    const combatants = friendly.map((combatant: Combatant, i) => {
        if (!targetIds.includes(combatant?.id)) {
            return combatant;
        }

        const minionConfig = minions.find((minionConfig) => {
            const getCalculationTarget = () => findCombatantData(getState, combatant?.id); // Current combatant will always be the target
            return passesConditions({ getCalculationTarget, proc: minionConfig, source });
        });

        const minion = minionConfig?.minion;

        if (minion) {
            const minionToSummon = typeof minion === "string" ? enemyNameMap[minion] : minion;
            if (minionToSummon) {
                const { storeTarget, turnLimit } = minionConfig;

                const summon = createCombatant(minionToSummon);
                if (storeTarget) {
                    summon.effects.push(getStoredTargetEffect({ combatant, duration: turnLimit }));
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

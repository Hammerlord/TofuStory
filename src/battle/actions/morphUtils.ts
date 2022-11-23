import uuid from "uuid";
import {
    ACTION_TYPES,
    CombatEffect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Morph,
    MORPH_MINION_MODIFIERS,
    MORPH_TYPES,
    TARGET_TYPES,
} from "../../ability/types";
import { Combatant } from "../../character/types";
import { enemyNameMap } from "../../enemy";
import { createCombatant } from "../../enemy/createEnemy";
import { shuffle } from "../../utils";
import { passesConditions } from "../passesConditions";
import { CombatantInfo, TriggerSource } from "../types";
import { getPossibleSummonIndices } from "../utils";

const getStoredSummonerEffect = (summoner): CombatEffect => {
    return {
        name: "Reveal",
        type: EFFECT_TYPES.NONE,
        class: EFFECT_CLASSES.NONE,
        id: uuid.v4(),
        uptime: 0,
        canBeSilenced: false,
        onDeath: {
            usableWhileStunned: true,
            ability: {
                name: "Reveal",
                actions: [
                    {
                        type: ACTION_TYPES.EFFECT,
                        target: TARGET_TYPES.SELF,
                        morph: {
                            type: MORPH_TYPES.MAP,
                            minions: [
                                {
                                    minion: summoner,
                                },
                            ],
                        },
                    },
                ],
            },
        },
    };
};

/**
 * Handle MORPH_TYPES.MERGE (take n minion(s) and transform them all to z minion(s))
 * This ignores morph conditions
 */
export const getMorphMerge = ({ targets, morph, summoner }: { targets: CombatantInfo[]; morph: Morph; summoner: Combatant }) => {
    const { minions, modifiers = {} } = morph;
    const targetIds = targets.map((t: CombatantInfo) => t?.combatant?.id);
    const { friendly, friendlySide, index } = targets[0];
    const combatants = friendly.map((combatant: Combatant | null) => {
        if (targetIds.includes(combatant?.id)) {
            return null;
        }
        return combatant;
    });

    const possibleSummonIndices = shuffle(getPossibleSummonIndices(friendly));
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
        }
        acc[property] = value;
        return acc;
    }, {});

    for (const { minion, positionIndex, storeSummoner } of minions) {
        const pos = getSummonPos(positionIndex);
        const minionToSummon = typeof minion === "string" ? enemyNameMap[minion] : minion;
        if (!minionToSummon) {
            console.warn(`Didn't find a corresponding object for ${minion}. Is the lookup map up to date?`);
            return;
        }

        if (typeof pos === "number") {
            combatants[pos] = {
                ...createCombatant(minionToSummon),
                ...modifierValues,
            };

            if (storeSummoner && summoner) {
                combatants[pos].effects.push(getStoredSummonerEffect(summoner));
            }

            summons.push(combatants[pos]);
        }
    }

    return { side: friendlySide, combatants, summons };
};

/**
 * Handle MORPH_TYPES.MAP (for each minion, transform it to another minion)
 */
export const getMorphMap = ({ targets, morph, source }: { targets: CombatantInfo[]; morph: Morph; source: TriggerSource }) => {
    const { minions } = morph;
    const targetIds = targets.map((t: CombatantInfo) => t?.combatant?.id);
    const { friendly, friendlySide } = targets[0];
    const summons = [];
    const combatants = friendly.map((combatant, i) => {
        if (!targetIds.includes(combatant?.id)) {
            return combatant;
        }

        const minion = minions.find((minionConfig) => {
            const getCalculationTarget = () => ({ combatant, index: i }); // Current combatant will always be the target
            return passesConditions({ getCalculationTarget, proc: minionConfig, source });
        })?.minion;

        if (minion) {
            const minionToSummon = typeof minion === "string" ? enemyNameMap[minion] : minion;
            if (minionToSummon) {
                const summon = createCombatant(minionToSummon);
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

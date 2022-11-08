import { findCombatantData } from "./actions";
import { MORPH_MINION_MODIFIERS } from "../../ability/types";
import { Combatant } from "../../character/types";
import { enemyNameMap } from "../../enemy";
import { createCombatant } from "../../enemy/createEnemy";
import { getRandomItem } from "../../utils";
import { passesConditions } from "../passesConditions";
import { getPossibleSummonIndices } from "../utils";

/**
 * Handle MORPH_TYPES.MERGE (take n minion(s) and transform them all to z minion(s))
 * This ignores morph conditions
 */
export const getMorphMerge = ({ targets, morph, findCombatantData }) => {
    const { minions, modifiers = {} } = morph;
    const targetIds = targets.map((t: Combatant) => t.id);
    const { friendly, friendlySide, index } = findCombatantData(targetIds[0]);
    const combatants = friendly.map((combatant: Combatant | null) => {
        if (targetIds.includes(combatant?.id)) {
            return null;
        }
        return combatant;
    });

    const summons = [];
    const getSummonPos = (positionIndex?: number): number => {
        if (typeof positionIndex === "number") {
            return positionIndex;
        }

        // If there is only one mutate target, replace the target
        if (targets.length === 1) {
            return index;
        }

        return getRandomItem(getPossibleSummonIndices(friendly));
    };

    const modifierValues = Object.entries(modifiers).reduce((acc, [property, modifierType]) => {
        let value = targets.reduce((acc, combatant) => {
            return acc + (combatant[property] || 0);
        }, 0); // Default is sum
        if (modifierType === MORPH_MINION_MODIFIERS.DIVIDE_EVENLY) {
            value = Math.ceil(value / minions.length);
        }
        acc[property] = value;
        return acc;
    }, {});

    for (const { minion, positionIndex } of minions) {
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

            summons.push(combatants[pos]);
        }
    }

    return { side: friendlySide, combatants, summons };
};

/**
 * Handle MORPH_TYPES.MAP (for each minion, transform it to another minion)
 */
export const getMorphMap = ({ targets, morph, findCombatantData }) => {
    const { minions } = morph;
    const targetIds = targets.map((t: Combatant) => t.id);
    const { friendly, friendlySide } = findCombatantData(targetIds[0]);
    const summons = [];
    const combatants = friendly.map((combatant, i) => {
        if (!targetIds.includes(combatant?.id)) {
            return combatant;
        }

        const minion = minions.find((minionConfig) => {
            const getCalculationTarget = () => ({ combatant, index: i }); // Current combatant will always be the target
            return passesConditions({ getCalculationTarget, proc: minionConfig });
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

import { Action, Bonus, CombatEffect, Condition, CONDITION_TARGETS, TRIGGER_TARGET_TYPES } from "../ability/types";
import { Combatant } from "../character/types";
import { getMaxHP } from "./utils";

const passesValueComparison = ({
    val,
    otherVal,
    comparator,
}: {
    val: any;
    otherVal: any;
    comparator: "eq" | "lt" | "gt" | "not";
}): boolean => {
    switch (comparator) {
        case "eq":
            return val === otherVal;
        case "lt":
            return val < otherVal;
        case "gt":
            return val > otherVal;
        case "not":
            return val !== otherVal;
        default:
            return false;
    }
};

export const passesConditions = ({
    getCalculationTarget, // If targets are an array, check that at least one satisfies conditions (OR).
    proc,
}: {
    getCalculationTarget: (
        calculationTarget: CONDITION_TARGETS.ACTOR | CONDITION_TARGETS.TARGET | TRIGGER_TARGET_TYPES
    ) => Combatant | Combatant[] | undefined;
    proc: Action | CombatEffect | Bonus; // The thing to activate conditionally--an action, an effect, a bonus
}): boolean => {
    const passesCondition = (condition: Condition) => {
        // Silence does not affect conditions, but should it?
        const { hasEffectType, hasEffectClass, healthPercentage, armor, comparator, calculationTarget, characterName } = condition;
        const combatant: Combatant | Combatant[] = getCalculationTarget(calculationTarget);
        if (!combatant) {
            return false;
        }

        const checkPass = (combatant) => {
            const procId = (proc as any)?.id; // It is OK that actions don't have an id because we only mind effect IDs; checking the conditions of an effect should not include itself in the calculation
            const otherEffects = procId ? combatant.effects.filter((e) => e.id !== procId) : combatant.effects;

            const meetsHealthPercentage =
                healthPercentage === undefined
                    ? true
                    : passesValueComparison({ val: combatant.HP / getMaxHP(combatant), otherVal: healthPercentage, comparator });

            const meetsArmor = armor === undefined ? true : passesValueComparison({ val: combatant.armor, otherVal: armor, comparator });
            const meetsEffectType = (() => {
                if (hasEffectType === undefined) return true;
                if (comparator === "not") {
                    return otherEffects.every(({ type }) => !hasEffectType.includes(type));
                }

                return otherEffects.some(({ type }) => hasEffectType.includes(type));
            })();
            const meetsEffectClass = (() => {
                if (hasEffectClass === undefined) return true;
                if (comparator === "not") {
                    return otherEffects.every(({ class: effectClass }) => effectClass !== hasEffectClass);
                }
                return otherEffects.some(({ class: effectClass }) => effectClass === hasEffectClass);
            })();

            const meetsCharacterName = (() => {
                if (!characterName) {
                    return true;
                }

                if (comparator === "eq") {
                    return characterName === combatant.name;
                }

                if (comparator === "not") {
                    return characterName !== combatant.name;
                }

                return true;
            })();

            return meetsEffectType && meetsHealthPercentage && meetsArmor && meetsEffectClass && meetsCharacterName;
        };

        return Array.isArray(combatant) ? combatant.some(checkPass) : checkPass(combatant);
    };
    const { conditions = [] } = proc;
    return !conditions.length || conditions.some(passesCondition);
};

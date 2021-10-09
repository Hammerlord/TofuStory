import { AbilityCondition, EffectCondition } from "../ability/types";
import { Combatant } from "../character/types";

const passesValueComparison = ({ val, otherVal, comparator }: { val: any; otherVal: any; comparator: "eq" | "lt" | "gt" }): boolean => {
    switch (comparator) {
        case "eq":
            return val === otherVal;
        case "lt":
            return val < otherVal;
        case "gt":
            return val > otherVal;
        default:
            return false;
    }
};

export const passesConditions = ({
    getCalculationTarget,
    conditions = [],
}: {
    getCalculationTarget: (calculationTarget: "target" | "actor" | "effectOwner" | "externalParty") => Combatant | undefined;
    conditions: (AbilityCondition | EffectCondition)[];
}): boolean => {
    const passesCondition = (condition: AbilityCondition | EffectCondition) => {
        const { hasEffectType, hasEffectClass, healthPercentage, armor, comparator, calculationTarget, name } = condition;
        const combatant: Combatant = getCalculationTarget(calculationTarget);
        if (!combatant) {
            return false;
        }

        const meetsHealthPercentage =
            healthPercentage === undefined
                ? true
                : passesValueComparison({ val: combatant.HP / combatant.maxHP, otherVal: healthPercentage, comparator });

        const meetsArmor = armor === undefined ? true : passesValueComparison({ val: combatant.armor, otherVal: armor, comparator });
        const meetsEffectType = hasEffectType === undefined ? true : combatant.effects.some(({ type }) => hasEffectType.includes(type));
        const meetsEffectClass =
            hasEffectClass === undefined ? true : combatant.effects.some(({ class: effectClass }) => effectClass === hasEffectClass);

        const nameIncludes = name === undefined ? true : combatant.name?.includes(name);
        return meetsEffectType && meetsHealthPercentage && meetsArmor && meetsEffectClass && nameIncludes;
    };
    return !conditions.length || conditions.some(passesCondition);
};

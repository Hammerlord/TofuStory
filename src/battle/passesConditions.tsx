import { BonusCondition, EffectCondition } from "../ability/types";
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
    conditions: (BonusCondition | EffectCondition)[];
}): boolean => {
    const passesCondition = (condition: BonusCondition | EffectCondition) => {
        const { hasEffectType = [], healthPercentage, comparator, calculationTarget } = condition;
        const combatant: Combatant = getCalculationTarget(calculationTarget);
        if (!combatant) {
            return false;
        }

        const meetsHealthPercentage =
            healthPercentage === undefined
                ? true
                : passesValueComparison({ val: combatant.HP / combatant.maxHP, otherVal: healthPercentage, comparator });

        const meetsEffectType = hasEffectType.length === 0 ? true : combatant.effects.some(({ type }) => hasEffectType.includes(type));
        return meetsEffectType && meetsHealthPercentage;
    };
    return !conditions.length || conditions.some(passesCondition);
};

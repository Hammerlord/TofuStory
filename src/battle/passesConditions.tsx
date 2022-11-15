import { Action, Bonus, CombatEffect, Condition, CONDITION_TARGETS, TRIGGER_TARGET_TYPES } from "../ability/types";
import { Combatant } from "../character/types";
import { TriggerSource } from "./types";
import { getMaxHP } from "./utils";

const passesValueComparison = ({
    val,
    otherVal,
    comparator,
}: {
    val: any;
    otherVal: any;
    comparator: "eq" | "lt" | "gt" | "not" | "modulo";
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
        case "modulo":
            return val !== 0 && val % otherVal === 0;
        default:
            return false;
    }
};

export interface IndexedCombatant {
    combatant?: Combatant;
    index: number;
}

export const passesConditions = ({
    getCalculationTarget, // If targets are an array, check that at least one satisfies conditions (OR).
    proc,
    source,
}: {
    getCalculationTarget: (
        calculationTarget: CONDITION_TARGETS.ACTOR | CONDITION_TARGETS.TARGET | TRIGGER_TARGET_TYPES
    ) => IndexedCombatant | IndexedCombatant[] | undefined;
    proc: Action | CombatEffect | Bonus; // The thing to activate conditionally--an action, an effect, a bonus
    source?: TriggerSource;
}): boolean => {
    const passesCondition = (condition: Condition) => {
        // Silence does not affect conditions, but should it?
        const {
            hasEffectType,
            hasEffectClass,
            healthPercentage,
            resourcePercentage,
            armor,
            comparator,
            calculationTarget,
            characterName,
            proximity,
            isElite,
            numAbilitiesUsed,
            sourceType,
        } = condition;
        const calcTargets: IndexedCombatant | IndexedCombatant[] = getCalculationTarget(calculationTarget);
        if (!calcTargets) {
            return false;
        }

        let effectOwner = getCalculationTarget(TRIGGER_TARGET_TYPES.EFFECT_OWNER);
        if (Array.isArray(effectOwner)) {
            effectOwner = effectOwner[0];
        }

        const checkPass = (calcTarget: IndexedCombatant) => {
            const { combatant, index } = calcTarget;
            if (!combatant) {
                return false;
            }

            if (
                healthPercentage !== undefined &&
                !passesValueComparison({ val: combatant.HP / getMaxHP(combatant), otherVal: healthPercentage, comparator })
            ) {
                return false;
            }

            if (armor !== undefined && !passesValueComparison({ val: combatant.armor, otherVal: armor, comparator })) {
                return false;
            }

            const procId = (proc as any)?.id; // It is OK that actions don't have an id because we only mind effect IDs; checking the conditions of an effect should not include itself in the calculation
            const otherEffects = procId ? combatant?.effects.filter((e) => e.id !== procId) : combatant.effects;

            if (hasEffectType !== undefined) {
                if (comparator === "not") {
                    if (!otherEffects.every(({ type }) => !hasEffectType.includes(type))) {
                        return false;
                    }
                } else if (!otherEffects.some(({ type }) => hasEffectType.includes(type))) {
                    return false;
                }
            }

            if (hasEffectClass !== undefined) {
                if (comparator === "not") {
                    if (!otherEffects.every(({ class: effectClass }) => effectClass !== hasEffectClass)) {
                        return false;
                    }
                } else if (!otherEffects.some(({ class: effectClass }) => effectClass === hasEffectClass)) {
                    return false;
                }
            }

            if (characterName) {
                if (!passesValueComparison({ val: characterName, otherVal: combatant.name, comparator })) {
                    return false;
                }
            }

            if (proximity !== undefined) {
                const effectOwnerIndex = (effectOwner as IndexedCombatant)?.index;
                if (effectOwnerIndex === undefined || index === undefined) {
                    return false;
                }

                if (!passesValueComparison({ val: Math.abs(effectOwnerIndex - index), otherVal: proximity, comparator })) {
                    return false;
                }
            }

            if (resourcePercentage !== undefined) {
                if (
                    !passesValueComparison({
                        val: combatant.resources / combatant.maxResources,
                        otherVal: resourcePercentage,
                        comparator,
                    })
                ) {
                    return false;
                }
            }

            if (numAbilitiesUsed !== undefined) {
                if (
                    !passesValueComparison({
                        val: combatant.abilityHistory.length,
                        otherVal: numAbilitiesUsed,
                        comparator,
                    })
                ) {
                    return false;
                }
            }

            if (sourceType !== undefined) {
                if (
                    !passesValueComparison({
                        val: source?.type,
                        otherVal: sourceType,
                        comparator,
                    })
                ) {
                    return false;
                }
            }

            if (isElite !== undefined && Boolean(combatant.isBoss || combatant.isElite) !== isElite) {
                return false;
            }
        };

        return Array.isArray(calcTargets) ? calcTargets.some(checkPass) : checkPass(calcTargets);
    };
    const { conditions = [] } = proc;
    return !conditions.length || conditions.some(passesCondition);
};

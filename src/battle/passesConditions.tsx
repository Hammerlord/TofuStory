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
}: {
    getCalculationTarget: (
        calculationTarget: CONDITION_TARGETS.ACTOR | CONDITION_TARGETS.TARGET | TRIGGER_TARGET_TYPES
    ) => IndexedCombatant | IndexedCombatant[] | undefined;
    proc: Action | CombatEffect | Bonus; // The thing to activate conditionally--an action, an effect, a bonus
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
            const procId = (proc as any)?.id; // It is OK that actions don't have an id because we only mind effect IDs; checking the conditions of an effect should not include itself in the calculation
            const otherEffects = procId ? combatant?.effects.filter((e) => e.id !== procId) : combatant.effects;

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

                return passesValueComparison({ val: characterName, otherVal: combatant.name, comparator });
            })();

            const withinProximity = (() => {
                if (proximity === undefined) {
                    return true;
                }

                const effectOwnerIndex = (effectOwner as IndexedCombatant)?.index;

                if (effectOwnerIndex === undefined || index === undefined) {
                    return false;
                }
                return passesValueComparison({ val: Math.abs(effectOwnerIndex - index), otherVal: proximity, comparator });
            })();

            const meetsResourcePercentage = (() => {
                if (resourcePercentage === undefined) {
                    return true;
                }

                return passesValueComparison({
                    val: combatant.resources / combatant.maxResources,
                    otherVal: resourcePercentage,
                    comparator,
                });
            })();

            const meetsAbilitiesUsed = (() => {
                if (numAbilitiesUsed === undefined) {
                    return true;
                }

                return passesValueComparison({
                    val: combatant.abilityHistory.length,
                    otherVal: numAbilitiesUsed,
                    comparator,
                });
            })();

            const meetsEliteStatus = isElite === undefined || Boolean(combatant.isBoss || combatant.isElite) === isElite;

            return (
                meetsEffectType &&
                meetsHealthPercentage &&
                meetsArmor &&
                meetsEffectClass &&
                meetsCharacterName &&
                withinProximity &&
                meetsResourcePercentage &&
                meetsEliteStatus &&
                meetsAbilitiesUsed
            );
        };

        return Array.isArray(calcTargets) ? calcTargets.some(checkPass) : checkPass(calcTargets);
    };
    const { conditions = [] } = proc;
    return !conditions.length || conditions.some(passesCondition);
};

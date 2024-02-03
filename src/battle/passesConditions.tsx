import { isOffensiveAbility } from "../ability/AbilityView/utils";
import {
    Ability,
    Action,
    Bonus,
    CombatEffect,
    Condition,
    CONDITION_TARGETS,
    Effect,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import { Combatant } from "../character/types";
import { CombatantInfo, TRIGGER_SOURCE_TYPES, TriggerSource } from "./types";
import { getMaxHP } from "./utils";

export const passesValueComparison = ({
    val,
    otherVal,
    comparator,
}: {
    val: any;
    otherVal: any;
    comparator: "eq" | "lt" | "gt" | "not" | "modulo" | "includes";
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
        case "includes": {
            if (typeof val === "string" && typeof otherVal === "string") {
                return val.toLowerCase().includes(otherVal.toLowerCase());
            }
        }
        default:
            return false;
    }
};

export const passesConditions = ({
    getCalculationTarget, // If targets are an array, check that at least one satisfies conditions (OR).
    proc,
    source,
}: {
    getCalculationTarget: (calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES) => CombatantInfo | CombatantInfo[] | undefined;
    proc: Ability | Action | CombatEffect | Bonus; // The thing to activate conditionally--an action, an effect, a bonus
    source?: TriggerSource;
}): boolean => {
    const passesCondition = (condition: Condition) => {
        // Silence does not affect conditions, but should it?
        const {
            hasEffectType,
            hasEffectClass,
            hasEffect,
            healthPercentage,
            resourcePercentage,
            armor,
            comparator,
            calculationTarget,
            name,
            proximity,
            isElite,
            numAbilitiesUsed,
            sourceType,
            resourceCost,
            HP,
            isOffense,
            numFriendly,
        } = condition;

        if (calculationTarget === CONDITION_TARGETS.TRIGGER_SOURCE) {
            const { type, source: sourcePayload = {} } = source;
            if (type === TRIGGER_SOURCE_TYPES.ABILITY) {
                const { name: sourceName, resourceCost: sourceResourceCost }: Ability = sourcePayload as Ability;

                if (name) {
                    const names = Array.isArray(name) ? name : [name];
                    if (names.every((n: string) => !passesValueComparison({ val: n, otherVal: sourceName, comparator }))) {
                        return false;
                    }
                }

                if (resourceCost !== undefined) {
                    if (!passesValueComparison({ val: sourceResourceCost, otherVal: resourceCost, comparator })) {
                        return false;
                    }
                }

                if (isOffense !== undefined) {
                    return isOffense === isOffensiveAbility(source?.source as Ability);
                }

                return true;
            }

            if (type === TRIGGER_SOURCE_TYPES.EFFECT) {
                const { type: effectType }: Effect = sourcePayload as Effect;

                if (hasEffectType !== undefined) {
                    if (comparator === "not") {
                        if (hasEffectType.includes(effectType)) {
                            return false;
                        }
                    } else if (!hasEffectType.includes(effectType)) {
                        return false;
                    }
                }

                return true;
            }
        }

        const calcTargets: CombatantInfo | CombatantInfo[] = getCalculationTarget(calculationTarget);
        if (!calcTargets) {
            return false;
        }

        let effectOwner: CombatantInfo | CombatantInfo[] = getCalculationTarget(TRIGGER_TARGET_TYPES.EFFECT_OWNER);
        if (Array.isArray(effectOwner)) {
            effectOwner = effectOwner[0];
        }

        const checkPass = (calcTarget: CombatantInfo) => {
            const { combatant, index, friendly } = calcTarget || {};
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

            if (hasEffect) {
                if (comparator === "not") {
                    if (!otherEffects.every(({ name }) => name !== hasEffect)) {
                        return false;
                    }
                } else if (!otherEffects.some(({ name }) => name === hasEffect)) {
                    return false;
                }
            }

            if (name) {
                const names = Array.isArray(name) ? name : [name];
                if (names.every((n: string) => !passesValueComparison({ val: n, otherVal: combatant.name, comparator }))) {
                    return false;
                }
            }

            if (proximity !== undefined) {
                const effectOwnerIndex = (effectOwner as CombatantInfo)?.index;
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

            if (HP !== undefined) {
                if (
                    !passesValueComparison({
                        val: combatant.HP,
                        otherVal: HP,
                        comparator,
                    })
                ) {
                    return false;
                }
            }

            if (numAbilitiesUsed !== undefined) {
                const { amount: required = numAbilitiesUsed, type } = (typeof numAbilitiesUsed === "object" && numAbilitiesUsed) || {};
                const abilityMatchesType = (ability: Ability) =>
                    !type || Boolean(ability?.actions?.some((action: Action) => action.type === type));
                const used = combatant.abilityHistory.filter(abilityMatchesType).length;

                if (
                    !passesValueComparison({
                        val: used,
                        otherVal: required,
                        comparator,
                    }) ||
                    !abilityMatchesType(source.source as Ability)
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

            if (numFriendly !== undefined) {
                const calculatedNumFriendly = friendly.filter((combatant) => combatant?.HP > 0).length;

                if (
                    !passesValueComparison({
                        val: calculatedNumFriendly,
                        otherVal: numFriendly,
                        comparator,
                    })
                ) {
                    return false;
                }
            }

            return true;
        };

        return Array.isArray(calcTargets) ? calcTargets.some(checkPass) : checkPass(calcTargets);
    };
    // @ts-ignore -- conditionOperator is 'or' by default and we have a fallback here
    const { conditions = [], conditionOperator = "or" } = proc;
    return !conditions.length || (conditionOperator === "or" ? conditions.some(passesCondition) : conditions.every(passesCondition));
};

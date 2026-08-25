import _ from "lodash";
import { isOffensiveAbility } from "../ability/AbilityView/utils";
import {
    Ability,
    Action,
    CONDITION_TARGETS,
    CombatAbility,
    CombatEffect,
    Comparator,
    Condition,
    EFFECT_CLASSES,
    Effect,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import { BattleState } from "./reducer";
import { CombatantInfo, TRIGGER_SOURCE_TYPES, ActionContext, TriggerSource } from "./types";
import { getMaxHP } from "./utils";
import { getMaxResources } from "./actions/playerAbility";

export const passesValueComparison = ({ val, otherVal, comparator }: { val: any; otherVal: any; comparator: Comparator }): boolean => {
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
            if (Array.isArray(val)) {
                if (Array.isArray(otherVal)) {
                    return val.every((item) => otherVal.includes(item));
                }

                return val.includes(otherVal);
            }
        }
        case "not-includes": {
            if (typeof val === "string" && typeof otherVal === "string") {
                return !val.toLowerCase().includes(otherVal.toLowerCase());
            }
            if (Array.isArray(val)) {
                if (Array.isArray(otherVal)) {
                    return val.every((item) => !otherVal.includes(item));
                }

                return !val.includes(otherVal);
            }
        }
        default:
            return false;
    }
};

export const passesConditions = ({
    getCalculationTarget, // If targets are an array, check that at least one satisfies conditions (OR).
    proc,
    context: context,
}: {
    getCalculationTarget: (
        calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES
    ) => CombatantInfo | CombatantInfo[] | CombatAbility | BattleState | CombatEffect | undefined;
    proc: { conditions?: Condition[]; conditionOperator?: "and" | "or" }; // The thing to activate conditionally--an action, an effect, a bonus
    context?: ActionContext;
}): boolean => {
    const passesCondition = (condition: Condition) => {
        // Silence does not affect conditions, but should it?
        const {
            numBuffs,
            numDebuffs,
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
            otherCalculationTarget,
            property,
            value,
            notProc,
            filters,
            hasAbilityEffectName,
        } = condition;

        const isProc = context?.isProc;
        const sourceChain = [...(context?.sourceChain || [])].reverse();
        const abilitySource = sourceChain.find((source) => source.type === TRIGGER_SOURCE_TYPES.ABILITY);

        if (calculationTarget === CONDITION_TARGETS.TRIGGER_SOURCE) {
            if (sourceType === TRIGGER_SOURCE_TYPES.ABILITY) {
                const sourcePayload = abilitySource?.source || {};
                const { name: sourceName, resourceCost: sourceResourceCost } = sourcePayload as Ability | CombatAbility;

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

                if (notProc !== undefined) {
                    if (notProc && isProc) {
                        return false;
                    }
                }

                if (isOffense !== undefined) {
                    return isOffense === isOffensiveAbility(sourcePayload as CombatAbility);
                }

                if (property !== undefined) {
                    const propertyVal = _.get(sourcePayload, property);
                    return passesValueComparison({ val: propertyVal, otherVal: value, comparator });
                }

                if (hasAbilityEffectName !== undefined) {
                    return ((sourcePayload as CombatAbility)?.effects || []).some((e) => e.name === hasAbilityEffectName);
                }

                return true;
            }

            if (sourceType === TRIGGER_SOURCE_TYPES.ACTION) {
                const actionSource = sourceChain.find((source) => source.type === TRIGGER_SOURCE_TYPES.ACTION);
                const sourcePayload = actionSource?.source || {};
                if (property !== undefined) {
                    const propertyVal = _.get(sourcePayload, property);
                    return passesValueComparison({ val: propertyVal, otherVal: value, comparator });
                }

                return true;
            }

            if (sourceType === TRIGGER_SOURCE_TYPES.EFFECT) {
                const effectSource = sourceChain.find((source) => source.type === TRIGGER_SOURCE_TYPES.EFFECT);
                const sourcePayload = effectSource?.source || {};
                const { type: effectType, class: effectClass, name: effectName }: Effect = sourcePayload as Effect;

                if (hasEffectType !== undefined) {
                    if (comparator === "not") {
                        if (hasEffectType.includes(effectType)) {
                            return false;
                        }
                    } else if (!hasEffectType.includes(effectType)) {
                        return false;
                    }
                }

                if (hasEffectClass !== undefined) {
                    if (comparator === "not") {
                        if (effectClass === hasEffectClass) {
                            return false;
                        }
                    } else if (effectClass !== hasEffectClass) {
                        return false;
                    }
                }

                if (notProc !== undefined) {
                    if (notProc && isProc) {
                        return false;
                    }
                }

                if (property !== undefined) {
                    const propertyVal = _.get(sourcePayload, property);
                    return passesValueComparison({ val: propertyVal, otherVal: value, comparator });
                }

                if (name) {
                    const names = Array.isArray(name) ? name : [name];
                    if (names.every((n: string) => !passesValueComparison({ val: n, otherVal: effectName, comparator }))) {
                        return false;
                    }
                }

                return true;
            }

            if (!sourceType) {
                console.warn(
                    // @ts-ignore
                    `TRIGGER_SOURCE_TYPE must be configured for condition TRIGGER_SOURCE to work properly. None was configured for ${context?.source?.name}.`
                );
                return false;
            }
        }

        if (calculationTarget === CONDITION_TARGETS.BATTLE) {
            if (property !== undefined) {
                const battle = getCalculationTarget(calculationTarget) as BattleState;
                return passesValueComparison({ val: battle[property], otherVal: value, comparator });
            }

            console.warn(`property must be configured for calculation target BATTLE to work properly. None was configured.`);
            return false;
        }

        // TRIGGER_SOURCE already handled above
        const calcTargets: CombatantInfo | CombatantInfo[] = getCalculationTarget(calculationTarget) as CombatantInfo | CombatantInfo[];
        if (!calcTargets) {
            return false;
        }

        let effectOwner: CombatantInfo | CombatantInfo[] = getCalculationTarget(TRIGGER_TARGET_TYPES.EFFECT_OWNER) as
            | CombatantInfo
            | CombatantInfo[];
        if (Array.isArray(effectOwner)) {
            effectOwner = effectOwner[0];
        }

        const checkPass = (calcTarget: CombatantInfo) => {
            const { combatant, index, friendly = [] } = calcTarget || {};
            if (!combatant) {
                return false;
            }

            if (otherCalculationTarget) {
                let otherCalcTargets: CombatantInfo | CombatantInfo[] = getCalculationTarget(otherCalculationTarget.targetType) as
                    | CombatantInfo
                    | CombatantInfo[];
                if (!otherCalcTargets) {
                    return false;
                }

                if (!Array.isArray(otherCalcTargets)) {
                    otherCalcTargets = [otherCalcTargets];
                }

                const prop = otherCalculationTarget.property;
                if (
                    otherCalcTargets.some(
                        (targetInfo) => !passesValueComparison({ val: combatant[prop], otherVal: targetInfo?.combatant[prop], comparator })
                    )
                ) {
                    return false;
                }
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

            const procId = (proc as CombatEffect)?.id; // It is OK that actions don't have an id because we only mind effect IDs; checking the conditions of an effect should not include itself in the calculation
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

            if (typeof numDebuffs === "number") {
                const numQualifyingEffects = otherEffects.filter(({ class: effectClass }) => effectClass === EFFECT_CLASSES.DEBUFF).length;

                if (!passesValueComparison({ val: numQualifyingEffects, otherVal: numDebuffs, comparator })) {
                    return false;
                }
            }

            if (typeof numBuffs === "number") {
                const numQualifyingEffects = otherEffects.filter(({ class: effectClass }) => effectClass === EFFECT_CLASSES.BUFF).length;

                if (!passesValueComparison({ val: numQualifyingEffects, otherVal: numBuffs, comparator })) {
                    return false;
                }
            }

            if (name) {
                const names = Array.isArray(name) ? name : [name];
                if (names.every((n: string) => !passesValueComparison({ val: combatant.name, otherVal: n, comparator }))) {
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
                        val: combatant.resources / getMaxResources(combatant),
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
                const { amount: required = numAbilitiesUsed, type = [] } = (typeof numAbilitiesUsed === "object" && numAbilitiesUsed) || {};
                const abilityMatchesType = (ability: Ability) => {
                    return !type || ability?.actions?.some((action: Action) => type.some((t) => t === action.type));
                };

                const used = combatant.abilityHistory.filter(abilityMatchesType).length;
                const sourceMatchesType = !abilitySource?.source || abilityMatchesType(abilitySource?.source as Ability);

                if (
                    !passesValueComparison({
                        val: used,
                        otherVal: required,
                        comparator,
                    }) ||
                    !sourceMatchesType
                ) {
                    return false;
                }
            }

            if (sourceType !== undefined) {
                if (
                    !passesValueComparison({
                        val: context?.sourceChain?.at(-1)?.type,
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
                const calculatedNumFriendly = friendly.filter((combatant) => {
                    if (!combatant?.HP) {
                        return false;
                    }

                    if (filters) {
                        return filters.some((filter) => {
                            const { property, comparator, value } = filter;
                            return passesValueComparison({ val: combatant[property], otherVal: value, comparator });
                        });
                    }

                    return true;
                }).length;

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

            if (property !== undefined) {
                const propertyVal = _.get(combatant, property);
                if (!passesValueComparison({ val: propertyVal, otherVal: value, comparator })) {
                    return false;
                }
            }

            return true;
        };

        return Array.isArray(calcTargets) ? calcTargets.some(checkPass) : checkPass(calcTargets);
    };
    // @ts-ignore -- conditionOperator is 'or' by default and we have a fallback here
    const { conditions = [], conditionOperator = "or" } = proc || {};
    return !conditions.length || (conditionOperator === "or" ? conditions.some(passesCondition) : conditions.every(passesCondition));
};

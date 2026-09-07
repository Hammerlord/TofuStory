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
import { getMaxResources } from "./actions/playerAbility";
import { BattleState } from "./types";
import { ActionContext, CombatantInfo, NonCombatPlayerInfo, TRIGGER_SOURCE_TYPES } from "./types";
import { getMaxHP } from "./utils";
import { findCombatantData } from "./actions/combatantData";

type GetCombatantCalcTargetFn = (
    targetType: CONDITION_TARGETS | TRIGGER_TARGET_TYPES
) => CombatantInfo | CombatantInfo[] | NonCombatPlayerInfo | NonCombatPlayerInfo[] | undefined;

export const passesValueComparison = ({
    val,
    otherVal,
    comparator,
}: {
    val: any;
    otherVal: any;
    comparator: Comparator | undefined;
}): boolean => {
    switch (comparator) {
        case "eq":
            return val === otherVal;
        case "lt":
            return val < otherVal;
        case "lte":
            return val <= otherVal;
        case "gt":
            return val > otherVal;
        case "gte":
            return val >= otherVal;
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
    proc,
    effectApplier,
    effectOwner,
    actor,
    target,
    allTargets = [],
    battle,
    context,
}: {
    effectApplier?: NonCombatPlayerInfo | CombatantInfo;
    effectOwner?: NonCombatPlayerInfo | NonCombatPlayerInfo[] | CombatantInfo | CombatantInfo[];
    actor?: NonCombatPlayerInfo | CombatantInfo;
    target?: NonCombatPlayerInfo | CombatantInfo;
    allTargets?: NonCombatPlayerInfo[] | CombatantInfo[];
    proc: { conditions?: Condition[]; conditionOperator?: "and" | "or" }; // The thing to activate conditionally--an action, an effect, a bonus
    battle?: BattleState | null; // Eg. not provided if out of combat
    context?: ActionContext;
}): boolean => {
    const passesCondition = (condition: Condition) => {
        // Silence does not affect conditions, but should it?
        const { comparator, calculationTarget, property, value } = condition;

        if (calculationTarget === CONDITION_TARGETS.TRIGGER_SOURCE) {
            return passesTriggerSourceCondition({ condition, context });
        }

        if (calculationTarget === CONDITION_TARGETS.BATTLE) {
            if (!battle) {
                return false;
            }

            if (property !== undefined) {
                const val = _.get(battle, property);
                return passesValueComparison({ val, otherVal: value, comparator });
            }

            console.warn("The condition `property` must be configured for calculation target BATTLE to work. None was configured.");
            return false;
        }

        const getCalculationTarget = (targetType: CONDITION_TARGETS | TRIGGER_TARGET_TYPES) => {
            return getCalculationCombatantTarget({
                calculationTarget: targetType,
                effectApplier,
                effectOwner,
                actor,
                target,
                allTargets,
            });
        };

        const calcTargets = getCalculationTarget(calculationTarget);

        if (!calcTargets) {
            return false;
        }

        const effectOwnerData = getCalculationTarget(TRIGGER_TARGET_TYPES.EFFECT_OWNER) as CombatantInfo | undefined;
        const checkPass = (calcTarget: CombatantInfo | NonCombatPlayerInfo) => {
            return passesCombatantCondition({ condition, calcTarget, getCalculationTarget, context, proc, effectOwner: effectOwnerData });
        };

        return Array.isArray(calcTargets) ? calcTargets.some(checkPass) : checkPass(calcTargets);
    };
    // @ts-ignore -- conditionOperator is 'or' by default and we have a fallback here
    const { conditions = [], conditionOperator = "or" } = proc || {};
    return !conditions.length || (conditionOperator === "or" ? conditions.some(passesCondition) : conditions.every(passesCondition));
};

const passesTriggerSourceCondition = ({ condition, context }: { condition: Condition; context?: ActionContext }): boolean => {
    const {
        hasEffectType,
        hasEffectClass,
        comparator,
        name,
        sourceType,
        resourceCost,
        isOffense,
        property,
        value,
        notProc,
        hasAbilityEffectName,
    } = condition;

    const isProc = context?.isProc;
    // Reverse to get the order of most recent to least
    const sourceChain = [...(context?.sourceChain || [])].reverse();

    if (notProc !== undefined) {
        if (notProc && isProc) {
            return false;
        }
    }

    if (sourceType === TRIGGER_SOURCE_TYPES.ABILITY) {
        const abilitySource = sourceChain.find((source) => source.type === TRIGGER_SOURCE_TYPES.ABILITY);
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

        if (isOffense !== undefined) {
            return isOffense === isOffensiveAbility(sourcePayload as CombatAbility);
        }

        if (!passesPropertyCheck({ property, object: sourcePayload, value, comparator })) {
            return false;
        }

        if (hasAbilityEffectName !== undefined) {
            return ((sourcePayload as CombatAbility)?.effects || []).some((e) => e.name === hasAbilityEffectName);
        }

        return true;
    }

    if (sourceType === TRIGGER_SOURCE_TYPES.ACTION) {
        const actionSource = sourceChain.find((source) => source.type === TRIGGER_SOURCE_TYPES.ACTION);
        if (!passesPropertyCheck({ property, object: actionSource?.source, value, comparator })) {
            return false;
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

        if (!passesPropertyCheck({ property, object: sourcePayload, value, comparator })) {
            return false;
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

    return true;
};

const passesCombatantCondition = ({
    condition,
    calcTarget,
    getCalculationTarget,
    context,
    proc,
    effectOwner,
}: {
    condition: Condition;
    calcTarget?: CombatantInfo | NonCombatPlayerInfo;
    getCalculationTarget: GetCombatantCalcTargetFn;
    context?: ActionContext;
    effectOwner?: CombatantInfo;
    proc: { conditions?: Condition[]; conditionOperator?: "and" | "or" };
}) => {
    const { combatant, index, friendly = [] } = calcTarget || {};
    if (!combatant) {
        return false;
    }

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
        name,
        proximity,
        isElite,
        numAbilitiesUsed,
        sourceType,
        HP,
        numFriendly,
        otherCalculationTarget,
        property,
        value,
        filters,
    } = condition;

    if (otherCalculationTarget) {
        let otherCalcTargets = getCalculationTarget(otherCalculationTarget.targetType) as CombatantInfo | CombatantInfo[];
        if (!otherCalcTargets) {
            return false;
        }

        if (!Array.isArray(otherCalcTargets)) {
            otherCalcTargets = [otherCalcTargets];
        }

        const prop = otherCalculationTarget.property;
        const val = _.get(combatant, prop);

        if (
            otherCalcTargets.some((targetInfo) => {
                const otherVal = _.get(targetInfo?.combatant || {}, prop);
                return !passesValueComparison({ val, otherVal, comparator });
            })
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
    const otherEffects = procId ? combatant.effects.filter((e) => e.id !== procId) : combatant.effects;

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

        // Reverse to get the order of most recent to least
        const sourceChain = [...(context?.sourceChain || [])].reverse();
        const abilitySource = sourceChain.find((source) => source.type === TRIGGER_SOURCE_TYPES.ABILITY);
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
                    const val = _.get(combatant, property);
                    return passesValueComparison({ val, otherVal: value, comparator });
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

    if (!passesPropertyCheck({ property, object: combatant, value, comparator })) {
        return false;
    }

    return true;
};

const passesPropertyCheck = ({
    property,
    object,
    value,
    comparator,
}: {
    property: string | undefined;
    object?: object;
    value: any;
    comparator: Comparator | undefined;
}) => {
    if (property === undefined) {
        return true;
    }

    if (!object) {
        return false;
    }

    const propertyVal = _.get(object, property);
    return passesValueComparison({ val: propertyVal, otherVal: value, comparator });
};

const getCalculationCombatantTarget = ({
    calculationTarget,
    effectApplier,
    effectOwner,
    actor,
    target,
    allTargets = [],
}: {
    calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES;
    effectApplier?: NonCombatPlayerInfo | CombatantInfo;
    effectOwner?: NonCombatPlayerInfo | NonCombatPlayerInfo[] | CombatantInfo | CombatantInfo[];
    actor?: NonCombatPlayerInfo | CombatantInfo;
    target?: NonCombatPlayerInfo | CombatantInfo;
    allTargets?: NonCombatPlayerInfo[] | CombatantInfo[];
}) => {
    if (calculationTarget === CONDITION_TARGETS.ACTOR) {
        return actor;
    }

    if (calculationTarget === CONDITION_TARGETS.TARGET) {
        return target;
    }

    if (calculationTarget === TRIGGER_TARGET_TYPES.EFFECT_APPLIER) {
        return effectApplier;
    }

    if (calculationTarget === TRIGGER_TARGET_TYPES.ALL_TARGETS) {
        return allTargets.filter((data): data is CombatantInfo => data !== undefined);
    }

    // Why can this be an array?
    if (Array.isArray(effectOwner)) {
        effectOwner = effectOwner[0];
    }

    return effectOwner;
};

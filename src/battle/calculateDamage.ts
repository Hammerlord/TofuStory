import { isOffensiveAction } from "../ability/AbilityView/utils";
import {
    Ability,
    AbilityEffect,
    Action,
    ACTION_TYPES,
    ActionOptionalProperties,
    CombatAbility,
    CombatEffect,
    EFFECT_TYPES,
    SkillBonus,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import { Item } from "../item/types";
import { hasEffectType } from "./actions/combatantData";
import { getEnabledEffects } from "./actions/statusEffect/getEnabledEffects";
import { DAMAGE_COEFF } from "./constants";
import { getMultiplier } from "./getMultiplier";
import { ActionContext, ActionParent, CombatantInfo } from "./types";

export const calculateDamage = ({
    actor,
    target,
    targetIndex,
    selectedIndex,
    action,
    actionParent,
    multiplier = 1,
    context,
}: {
    actor?: CombatantInfo;
    target?: CombatantInfo;
    targetIndex?: number;
    selectedIndex?: number;
    action: Action | ActionOptionalProperties;
    actionParent?: ActionParent; // TODO can this just be from `source` (source.source should probably be equivalent to this object) instead of having this separate param?
    multiplier?: number;
    context?: ActionContext;
}): number => {
    const isAttack = action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK;

    if (
        !action.bypassImmunity &&
        (hasEffectType(target, EFFECT_TYPES.IMMUNITY) || (isAttack && hasEffectType(target, EFFECT_TYPES.ATTACK_IMMUNITY)))
    ) {
        return 0;
    }

    let baseDamage: number = (() => {
        if (action.secondaryDamage && targetIndex !== selectedIndex) {
            return action.secondaryDamage;
        }

        return action.damage || 0;
    })();

    const parentEffects = (actionParent as CombatAbility)?.effects;
    if (parentEffects?.length) {
        baseDamage += parentEffects.reduce((acc, effect: AbilityEffect) => {
            return acc + (effect.damage || 0);
        }, 0);

        baseDamage = Math.max(0, baseDamage);
    }

    if (!actor) {
        return baseDamage;
    }

    const getCalculationTarget = (calculationTarget: TRIGGER_TARGET_TYPES): CombatantInfo | undefined => {
        if (calculationTarget === TRIGGER_TARGET_TYPES.ACTOR) {
            return actor;
        }

        if (calculationTarget === TRIGGER_TARGET_TYPES.TARGET) {
            return target;
        }
    };

    let totalAttackPower = 0;
    let totalSkillBonus = 0;
    let minimumDamage = 0;
    let maximumDamage = action.maxDamage;

    if (isAttack) {
        getEnabledEffects({ combatantInfo: actor, getCalculationTarget, context }).forEach(
            ({
                attackPower = 0,
                skillBonus = [],
                excludeEffectOwner,
                minimumAttackDamage = 0,
                stacks = 1,
                multiplier: multiplierConfig,
            }) => {
                if (excludeEffectOwner) {
                    return;
                }

                const effectMultiplier = getMultiplier({
                    actor,
                    target,
                    allTargets: [target],
                    multiplier: multiplierConfig,
                    // TODO needs access to deck, hand, discard for multiplier to work for those.
                    deck: [],
                    hand: [],
                    discard: [],
                });
                totalSkillBonus += getSkillBonusDamage({ ability: actionParent as CombatAbility, skillBonus }) * stacks;
                totalAttackPower += attackPower * effectMultiplier * stacks;
                if (minimumAttackDamage > minimumDamage) {
                    minimumDamage = minimumAttackDamage;
                }
            }
        );
    }

    let totalDefDown = 0;
    const targetEnabledEffects = getEnabledEffects({ combatantInfo: target, getCalculationTarget, context });

    targetEnabledEffects.forEach((effect: CombatEffect) => {
        const { maxDamageTaken, excludeEffectOwner, defenseDown: defDown = 0, stacks = 1 } = effect;
        if (excludeEffectOwner) {
            return;
        }

        if ((maxDamageTaken && isNaN(maximumDamage)) || maximumDamage < maxDamageTaken) {
            maximumDamage = maxDamageTaken;
        }

        totalDefDown += defDown * stacks;
    });

    const damage = baseDamage * multiplier + totalSkillBonus;
    let debuffModifiers = 0;
    if (isAttack || (isOffensiveAction(action) && typeof action.damage === "number")) {
        const hasBleed = targetEnabledEffects.some((e) => e.type === EFFECT_TYPES.BLEED);
        const bleedModifier = hasBleed ? 1 : 0;
        debuffModifiers += bleedModifier + totalDefDown;
    }

    const withDamageMods = calculateDamageModifierCoeff({ damage, totalDamageMod: totalAttackPower + debuffModifiers });

    let total = withDamageMods;
    // Between minimum and maximum damage, minimum damage wins (arbitrarily).
    if (typeof maximumDamage === "number") {
        total = Math.min(total, maximumDamage);
    }
    return Math.max(minimumDamage, Math.ceil(total));
};

export const getSkillBonusDamage = ({ ability, skillBonus }: { ability: Ability | Item; skillBonus: SkillBonus[] }) => {
    if (!skillBonus || !ability) {
        return 0;
    }

    let totalDamage = 0;
    for (const { skill, damage = 0, comparator } of skillBonus) {
        if (comparator === "includes" && ability?.name?.toLowerCase().includes(skill.toLowerCase())) {
            totalDamage += damage || 0;
        } else if (skill === ability?.name) {
            totalDamage += damage || 0;
        }
    }

    return totalDamage;
};

export const calculateDamageModifierCoeff = ({ damage, totalDamageMod }: { damage: number; totalDamageMod: number }): number => {
    if (!totalDamageMod) {
        return damage;
    }
    const withAttackPower = Math.ceil(damage + Math.max(1, damage / DAMAGE_COEFF) * totalDamageMod);
    // Enemy damage cannot be reduced below 1 by ATT down modifiers
    if (damage && withAttackPower < 1) {
        return 1;
    }

    return withAttackPower;
};

import { AbilityEffect, CombatAbility } from "../ability/types";
import { getEnabledEffects } from "./actions/statusEffect/getEnabledEffects";
import { ActionContext, CombatantInfo } from "./types";

export const calculateArmor = ({
    target,
    action,
    multiplier = 1,
    context,
}: {
    target?: CombatantInfo;
    action: { armor?: number; maxArmor?: number; flatArmor?: number };
    multiplier: number;
    context?: ActionContext;
}): number => {
    const { armor: initArmor, maxArmor = Infinity, flatArmor } = action;
    if (!initArmor && !flatArmor) {
        return 0;
    }

    if (flatArmor) {
        const armor = Math.min(maxArmor, flatArmor * multiplier);
        return Math.max(0, armor);
    }

    let armor = Math.min(maxArmor, (initArmor || 0) * multiplier);

    const source = context?.sourceChain?.at(-1);
    const parentEffects = (source?.source as CombatAbility)?.effects;
    if (parentEffects?.length) {
        armor += parentEffects.reduce((acc, effect: AbilityEffect) => {
            return acc + (effect.armor || 0);
        }, 0);
    }

    const targetArmorReceived =
        getEnabledEffects({ combatantInfo: target, context }).reduce(
            (acc: number, { armorReceived = 0, stacks = 1 }) => acc + armorReceived * stacks,
            0
        ) || 0;

    const totalArmor = targetArmorReceived + armor;
    return Math.max(0, totalArmor);
};

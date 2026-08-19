import { CombatAbility, AbilityEffect } from "../ability/types";
import { getEnabledEffects } from "./actions/statusEffect/getEnabledEffects";
import { CombatantInfo, TriggerSource } from "./types";

export const calculateArmor = ({
    target,
    action,
    multiplier = 1,
    source: source,
}: {
    target?: CombatantInfo;
    action: { armor?: number; maxArmor?: number; flatArmor?: number };
    multiplier: number;
    source?: TriggerSource;
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

    const parentEffects = (source?.source as CombatAbility)?.effects;
    if (parentEffects?.length) {
        armor += parentEffects.reduce((acc, effect: AbilityEffect) => {
            return acc + (effect.armor || 0);
        }, 0);
    }

    const targetArmorReceived =
        getEnabledEffects({ combatantInfo: target }).reduce(
            (acc: number, { armorReceived = 0, stacks = 1 }) => acc + armorReceived * stacks,
            0
        ) || 0;

    const totalArmor = targetArmorReceived + armor;
    return Math.max(0, totalArmor);
};

import { Combatant } from "../../character/types";
import { CombatantInfo } from "../types";
import { getEnabledEffects } from "./../utils";
import { applyStatChanges, triggerStatChangeEvents } from "./actions";

export const checkHalveArmor = (side: (CombatantInfo | null)[]) => (dispatch) => {
    const statChanges = side
        .map((combatantInfo: CombatantInfo) => {
            if (!combatantInfo) {
                return;
            }

            const armor = getHalveArmorAmount(combatantInfo);
            if (armor === 0) {
                return;
            }
            return { combatantId: combatantInfo?.combatant?.id, armor };
        })
        .filter((v) => v);

    dispatch(applyStatChanges(statChanges));
    dispatch(triggerStatChangeEvents(statChanges.map((statUpdate) => ({ statUpdate }))));
};

const getHalveArmorAmount = (target: CombatantInfo): number => {
    if (getEnabledEffects({ combatantInfo: target }).some((effect) => effect.preventArmorDecay)) {
        return 0;
    }

    const armor = target?.combatant?.armor;
    if (!armor) {
        return 0;
    }

    return -Math.ceil(armor / 2);
};

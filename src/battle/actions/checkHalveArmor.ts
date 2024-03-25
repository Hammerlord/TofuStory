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
            return { combatantId: combatantInfo?.combatant?.id, armor, isArmorDecay: true };
        })
        .filter((v) => v);

    /**
     * Trigger armor decay regardless of whether any armor actually decayed.
     * @see preventArmorDecayPlayer the player "Pristine Armor" needs this event to know when to tick down.
     */
    dispatch(applyStatChanges(statChanges));
    dispatch(triggerStatChangeEvents(statChanges.map((statUpdate) => ({ statUpdate }))));
};

export const getHalveArmorAmount = (target: CombatantInfo): number => {
    if (getEnabledEffects({ combatantInfo: target }).some((effect) => effect.preventArmorDecay)) {
        return 0;
    }

    const armor = target?.combatant?.armor;
    if (!armor) {
        return 0;
    }

    return -Math.ceil(armor / 2);
};

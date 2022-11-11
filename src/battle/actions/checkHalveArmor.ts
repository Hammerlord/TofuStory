import { Combatant } from "../../character/types";
import { getEnabledEffects } from "./../utils";
import { applyStatChanges, triggerStatChangeEvents } from "./actions";

export const checkHalveArmor = (side: (Combatant | null)[]) => (dispatch) => {
    const statChanges = side
        .map((combatant) => {
            if (!combatant) {
                return;
            }

            const armor = getHalveArmorAmount(combatant);
            if (armor === 0) {
                return;
            }
            return { combatantId: combatant?.id, armor };
        })
        .filter((v) => v);

    dispatch(applyStatChanges(statChanges));
    dispatch(triggerStatChangeEvents(statChanges.map((statUpdate) => ({ statUpdate }))));
};

const getHalveArmorAmount = (target: Combatant): number => {
    if (getEnabledEffects({ combatant: target }).some((effect) => effect.preventArmorDecay)) {
        return 0;
    }

    return -Math.ceil(target.armor / 2);
};

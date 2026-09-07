import { ActionContext, CombatantInfo } from "../../types";
import { getEnabledEffects } from "../statusEffect/getEnabledEffects";
import { applyStatChanges, triggerStatChangeEvents } from "../statChanges";
import { AppDispatch } from "../../../store";
import { UpdatedCombatantStats } from "../getUpdatedStats";

export const checkHalveArmor = (side: (CombatantInfo | null | undefined)[], context: ActionContext) => (dispatch: AppDispatch) => {
    const statChanges: UpdatedCombatantStats[] = side
        .map((combatantInfo: CombatantInfo | null | undefined) => {
            if (!combatantInfo?.combatant) {
                return;
            }

            const armor = getHalveArmorAmount(combatantInfo);
            const prevArmor = combatantInfo.combatant.armor || 0;
            const isArmorBroken = prevArmor > 0 && prevArmor + armor === 0;
            return { combatantId: combatantInfo.combatant.id, armor, isArmorDecay: true, isArmorBroken } as UpdatedCombatantStats;
        })
        .filter((v): v is UpdatedCombatantStats => v !== undefined);

    /**
     * Trigger armor decay regardless of whether any armor actually decayed.
     * @see preventArmorDecayPlayer the player "Pristine Armor" needs this event to know when to tick down.
     */
    dispatch(applyStatChanges(statChanges));
    dispatch(triggerStatChangeEvents(statChanges.map((statUpdate) => ({ statUpdate, context }))));
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

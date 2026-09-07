import { CombatEffect, EFFECT_CLASSES } from "../../../ability/types";
import { passesConditions } from "../../passesConditions";
import { BattleState } from "../../types";
import { ActionContext, CombatantInfo, NonCombatCharacterInfo } from "../../types";
import { isSilenced } from "../../utils";
import { findCombatantData } from "../combatantData";
import { isTurnToTrigger } from "./effectLifecycle";

/**
 * Given a character, return its effects that have not been canceled due to silence or failing conditions.
 */

export const getEnabledEffects = ({
    combatantInfo,
    battle,
    context,
}: {
    combatantInfo?: NonCombatCharacterInfo | CombatantInfo;
    battle?: BattleState | null;
    context?: ActionContext;
}): CombatEffect[] => {
    const { combatant } = combatantInfo || {};
    if (!combatant?.effects) {
        return [];
    }

    const silenced = isSilenced(combatant);

    return combatant.effects?.filter((effect: CombatEffect) => {
        const { canBeSilenced, turnsTriggerFrequency, uptime } = effect;
        const disabled = silenced && canBeSilenced && effect.class === EFFECT_CLASSES.BUFF; // Only buffs can be silenced
        let effectApplier;
        if (effect.applierId === combatant.id) {
            effectApplier = combatantInfo;
        } else if (battle) {
            effectApplier = findCombatantData(battle, effect.applierId);
        }

        return (
            !disabled &&
            passesConditions({
                effectOwner: combatantInfo,
                effectApplier,
                proc: effect,
                battle,
                context,
            }) &&
            isTurnToTrigger({ turnsTriggerFrequency, uptime })
        );
    });
};

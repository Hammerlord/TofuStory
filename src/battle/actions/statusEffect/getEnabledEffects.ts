import { CombatEffect, EFFECT_CLASSES, EFFECT_TYPES } from "../../../ability/types";
import { passesConditions } from "../../passesConditions";
import { BattleState } from "../../types";
import { ActionContext, CombatantInfo, NonCombatPlayerInfo } from "../../types";
import { isSilenced } from "../../utils";
import { findCombatantData } from "../combatantData";
import { isTurnToTrigger } from "./effectLifecycle";

export const hasEffectType = (
    target: CombatantInfo | undefined,
    effectType: EFFECT_TYPES | EFFECT_TYPES[],
): boolean => {
    if (!target) {
        return false;
    }

    return getEnabledEffects({ combatantInfo: target }).some(({ type }) =>
        Array.isArray(effectType) ? effectType.includes(type) : type === effectType,
    );
};

/**
 * Given a character, return its effects that have not been canceled due to silence or failing conditions.
 */

export const getEnabledEffects = ({
    combatantInfo,
    battle,
    context,
    actor,
    target,
}: {
    combatantInfo?: NonCombatPlayerInfo | CombatantInfo;
    battle?: BattleState | null;
    context?: ActionContext;
    actor?: NonCombatPlayerInfo | CombatantInfo;
    target?: NonCombatPlayerInfo | CombatantInfo;
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
                actor,
                target,
            }) &&
            isTurnToTrigger({ turnsTriggerFrequency, uptime })
        );
    });
};

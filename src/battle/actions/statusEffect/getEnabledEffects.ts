import { CONDITION_TARGETS, TRIGGER_TARGET_TYPES, Ability, CombatEffect, EFFECT_CLASSES } from "../../../ability/types";
import { passesConditions } from "../../passesConditions";
import { ActionContext, CombatantInfo, TriggerSource } from "../../types";
import { isSilenced } from "../../utils";
import { isTurnToTrigger } from "./effectLifecycle";

/**
 * Given a character, return its effects that have not been canceled due to silence or failing conditions.
 */

export const getEnabledEffects = ({
    combatantInfo,
    getCalculationTarget,
    context: context,
}: {
    combatantInfo?: CombatantInfo;
    getCalculationTarget?: (
        calculationTarget: CONDITION_TARGETS.ACTOR | CONDITION_TARGETS.TARGET | TRIGGER_TARGET_TYPES
    ) => CombatantInfo | CombatantInfo[] | Ability;
    context?: ActionContext;
}): CombatEffect[] => {
    const { combatant } = combatantInfo || {};
    if (!combatant?.effects) {
        return [];
    }

    const silenced = isSilenced(combatant);
    const getCalculationTargetFn = (calcTarget) => {
        if (!calcTarget || calcTarget === TRIGGER_TARGET_TYPES.EFFECT_OWNER) {
            return combatantInfo;
        }

        // getCalculationTarget allows finding combatants beyond the effect owner, and should be provided for scenarios where a check against an external party needs to be made,
        // for example, proximity between two combatants. It need not be provided by consumers in cases where there is no "other party" in the calculation, such as
        // determining whether `combatant` has a certain effect type has nothing to do with any other combatant.
        if (getCalculationTarget) {
            return getCalculationTarget(calcTarget);
        }
    };

    return combatant.effects?.filter((effect) => {
        const { canBeSilenced, turnsTriggerFrequency, uptime } = effect;
        const disabled = silenced && canBeSilenced && effect.class === EFFECT_CLASSES.BUFF; // Only buffs can be silenced

        return (
            !disabled &&
            passesConditions({ getCalculationTarget: getCalculationTargetFn, proc: effect, context }) &&
            isTurnToTrigger({ turnsTriggerFrequency, uptime })
        );
    });
};

import { isSupportAbility } from "../../../ability/AbilityView/utils";
import { Combatant } from "../../../character/types";

/**
 * Get the order in which auto-attacking combatants move on their turn.
 */
export const getCombatantMoveOrder = ({
    combatants,
    round,
    ignoreSupport,
}: {
    combatants: (Combatant | null)[];
    round: number;
    ignoreSupport?: boolean;
}): string[] => {
    const isEvenRound = round % 2 === 0;
    if (isEvenRound) {
        combatants = combatants.slice().reverse();
    }

    return combatants
        .filter((v): v is Combatant => v !== undefined)
        .sort((a, b) => {
            const aVal = isSupportAbility(a?.targeting?.ability) ? 1 : -1;
            const bVal = isSupportAbility(b?.targeting?.ability) ? 1 : -1;
            const compareSupport = aVal - bVal;
            if (!ignoreSupport && compareSupport !== 0) {
                return compareSupport;
            }

            const middle = 2;
            const aIndex = combatants.findIndex((c: Combatant | null) => c?.id === a?.id);
            const bIndex = combatants.findIndex((enemy: Combatant | null) => enemy?.id === b?.id);

            return Math.abs(aIndex - middle) - Math.abs(bIndex - middle);
        })
        .map((e) => e?.id);
};

import { Combatant } from "../../character/types";
import { battleStateSlice } from "../reducer";
import { findCombatantData } from "../utils";

const { updateBattle } = battleStateSlice?.actions || {};

/**
 * Updates a combatant given its ID. This overwrites the combatant.
 */
export const updateCombatant = ({ combatantId, newProperties }: { combatantId: string; newProperties: any }) => {
    return (dispatch, getState) => {
        const { combatant: oldCombatant, friendlySide, friendly } = findCombatantData(getState().battle, combatantId) || {};
        // Due to morph, the combatant may no longer exist
        if (!oldCombatant) {
            return;
        }

        const newCombatant = { ...oldCombatant, ...newProperties };

        dispatch(
            updateBattle({
                [friendlySide]: friendly.map((combatant: Combatant | null) => (combatant?.id !== combatantId ? combatant : newCombatant)),
            })
        );
    };
};

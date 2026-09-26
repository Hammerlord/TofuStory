import { Combatant } from "../../character/types";
import { AppDispatch, RootState } from "../../store";
import { battleStateSlice } from "../reducer";
import { findCombatantData } from "./combatantData";

const { updateBattle } = battleStateSlice.actions;

/**
 * Updates a combatant given its ID. This overwrites the combatant.
 */
export const updateCombatant = ({
    combatantId,
    newProperties,
}: {
    combatantId: string;
    newProperties: { [key in keyof Combatant]?: Combatant[key] };
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        // Due to morph, the combatant may no longer exist
        const combatantData = findCombatantData(getState().battle!, combatantId);
        if (!combatantData) {
            return;
        }
        const { combatant: oldCombatant, friendlySide, friendly } = combatantData;
        const newCombatant = { ...oldCombatant, ...newProperties };

        dispatch(
            updateBattle({
                [friendlySide]: friendly.map((combatant: Combatant | null) =>
                    combatant?.id !== combatantId ? combatant : newCombatant,
                ),
            }),
        );
    };
};

import { Combatant } from "../../character/types";
import { BattleState, battleStateSlice } from "../reducer";
import { CombatantInfo, BATTLEFIELD_SIDES } from "../types";

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

/**
 * Helper to get the combatant data and additional details such as what slot index it sits on the board, who its allies and enemies are.
 * @returns {CombatantInfo|undefined} - Undefined if combatant associated to the UUID not found on the board
 */

export const findCombatantData = (battle: BattleState, combatantId?: string): CombatantInfo | undefined => {
    if (!battle || !combatantId) {
        return;
    }

    const { playerSide, enemySide } = battle;
    const enemyIndex = enemySide.findIndex((c: Combatant | null) => c?.id === combatantId);
    if (enemyIndex > -1) {
        return {
            combatant: enemySide[enemyIndex],
            index: enemyIndex,
            friendly: enemySide.slice(),
            hostile: playerSide.slice(),
            friendlySide: BATTLEFIELD_SIDES.ENEMY_SIDE,
            hostileSide: BATTLEFIELD_SIDES.PLAYER_SIDE,
        };
    }

    const index = playerSide.findIndex((c: Combatant | null) => c?.id === combatantId);
    if (index > -1) {
        return {
            combatant: playerSide[index],
            index,
            friendly: playerSide.slice(),
            hostile: enemySide.slice(),
            friendlySide: BATTLEFIELD_SIDES.PLAYER_SIDE,
            hostileSide: BATTLEFIELD_SIDES.ENEMY_SIDE,
        };
    }
};
export const updateCombatants = (
    characters: (Combatant | null)[],
    updateFn: (character: Combatant | null) => any
): (Combatant | null)[] => {
    return characters.map((character) => {
        if (!character) {
            return character;
        }

        return updateFn(character);
    });
};

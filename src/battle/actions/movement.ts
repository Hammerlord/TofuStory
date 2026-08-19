import { Action, EFFECT_EVENT_KEYS, EFFECT_TYPES } from "../../ability/types";
import { Combatant } from "../../character/types";
import { getRandomItem } from "../../utils";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES, Displacement } from "../types";
import { ActionContext } from "./../types";
import { checkEventTrigger } from "./statusEffect/triggerEffectEvent";

const { updateBattle } = battleStateSlice?.actions || {};

export const checkHandleVacuum = ({
    vacuum,
    side,
    selectedIndex,
    area,
}: {
    vacuum: number;
    side: BATTLEFIELD_SIDES;
    selectedIndex: number;
    area: number;
}) => {
    return (dispatch, getState) => {
        if (!vacuum) {
            return;
        }

        const { updatedCharacters, displacements } = applyVacuum({
            characters: getState().battle[side],
            index: selectedIndex,
            area,
            distance: vacuum,
            side,
        });

        dispatch(
            updateBattle({
                [side]: updatedCharacters,
            })
        );

        return displacements;
    };
};

export const checkHandleMovement = ({
    action,
    side,
    selectedIndex: to,
    actorIndex: from,
    context,
}: {
    action: Action;
    side: BATTLEFIELD_SIDES;
    selectedIndex: number;
    actorIndex: number;
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        const { movement } = action;
        if (!movement) {
            return;
        }

        const characters = getState().battle[side];
        // to === from: this is legacy from when enemies use a movement ability.
        // It's classified as a "self" ability, so they target themselves when they cast it, hence `to` and `from` indices will be the same for them.
        // Make them move randomly still, if that's the case.
        if (isNaN(to) || to === from) {
            const moveIndices = getPossibleMoveIndices({ currentLocationIndex: from, friendly: characters, action });
            to = getRandomItem(moveIndices);
        }

        if (isNaN(to)) {
            return;
        }

        const newCharacters = characters.slice();
        const temp = newCharacters[to];
        newCharacters[to] = newCharacters[from];
        newCharacters[from] = temp;

        dispatch(
            updateBattle({
                [side]: newCharacters,
            })
        );
        // Triggering effect events before event queue push of the main ability may play events out of the intended order, especially
        // if anything reacts to the movement.
        newCharacters.forEach((combatant) => {
            if (combatant) {
                dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onFriendlyMove, context }));
            }
        });

        const displacements = {};
        if (newCharacters[from]?.id) {
            displacements[newCharacters[from].id] = { from: to, to: from, side };
        }

        if (newCharacters[to]?.id) {
            displacements[newCharacters[to].id] = { from, to, side };
        }
        return displacements;
    };
};

export const applyVacuum = ({
    characters: initCharacters,
    index,
    area,
    distance,
    side,
}: {
    characters: (Combatant | null)[];
    index: number;
    area: number;
    distance: number;
    side: BATTLEFIELD_SIDES;
}): {
    updatedCharacters: (Combatant | null)[];
    displacements: Displacement;
} => {
    const characters = initCharacters.slice();
    const isValidSlot = (combatant: Combatant | null): Boolean => {
        return !combatant || (combatant.HP === 0 && combatant.effects.every((effect) => effect.type !== EFFECT_TYPES.LIFE_LINK));
    };

    const displacements = {};

    for (let i = 1; i <= area; ++i) {
        if (characters[index + i]) {
            for (let j = 0; j < i && j < distance; ++j) {
                const existingCharacter = characters[index + j];
                if (isValidSlot(existingCharacter)) {
                    characters[index + j] = characters[index + i];
                    characters[index + i] = null;
                    const id = characters[index + j]?.id;
                    if (id) {
                        displacements[id] = {
                            from: index + i,
                            to: index + j,
                        };
                    }
                }
            }
        }
        if (characters[index - i]) {
            for (let j = 0; j < i && j < distance; ++j) {
                const existingCharacter = characters[index - j];
                if (isValidSlot(existingCharacter)) {
                    characters[index - j] = characters[index - i];
                    characters[index - i] = null;

                    const id = characters[index - j]?.id;
                    if (id) {
                        displacements[id] = {
                            from: index - i,
                            to: index - j,
                        };
                    }
                }
            }
        }
    }

    return {
        updatedCharacters: characters,
        displacements,
    };
};

export const getPossibleMoveIndices = ({
    currentLocationIndex,
    friendly,
    action,
}: {
    currentLocationIndex: number;
    friendly: (Combatant | null)[];
    action: Action;
}): number[] => {
    const { movement = 0, movementOptions = {} } = action;
    if (!movement) {
        return [];
    }

    const { canSwapCharacterPlaces: swapPlaces } = movementOptions;
    const min = Math.max(0, currentLocationIndex - movement);
    const max = Math.min(friendly.length - 1, currentLocationIndex + movement);
    const moveIndices = [];
    for (let i = min; i <= max; ++i) {
        if (!friendly[i]?.HP || swapPlaces) {
            moveIndices.push(i);
        }
    }

    return moveIndices;
};

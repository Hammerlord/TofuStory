import { Combatant } from "../../character/types";
import { getEnabledEffects, isSilenced, isUnableToAct } from "./../utils";
import { applyStatChanges, triggerStatChangeEvents } from "./actions";

export const checkTurnResourceGain = (side: (Combatant | null)[]) => (dispatch) => {
    const statChanges = side
        .map((combatant) => {
            if (!combatant) {
                return;
            }

            const { rawResources, resources } = getResourcesPerTurn(combatant);
            if (rawResources === 0) {
                return;
            }

            return { combatantId: combatant.id, resources, rawResources };
        })
        .filter((v) => v);

    dispatch(applyStatChanges(statChanges));
    dispatch(triggerStatChangeEvents(statChanges.map((statUpdate) => ({ statUpdate }))));
};

const getResourcesPerTurn = (character: Combatant): { rawResources: number; resources: number } => {
    if (isSilenced(character) || isUnableToAct(character)) {
        return {
            rawResources: 0,
            resources: 0,
        };
    }

    const baseResourcesGained =
        character.resourcesPerTurn +
        getEnabledEffects({ combatant: character }).reduce((acc: number, { resourcesPerTurn = 0 }) => acc + resourcesPerTurn, 0);

    const resourcesGained = Math.max(0, baseResourcesGained);

    return {
        rawResources: resourcesGained,
        resources: Math.min(character.maxResources - character.resources, resourcesGained),
    };
};

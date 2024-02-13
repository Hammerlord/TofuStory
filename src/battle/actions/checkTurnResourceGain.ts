import { Combatant } from "../../character/types";
import { CombatantInfo } from "../types";
import { getEnabledEffects, isSilenced, isStunnedOrFrozen } from "./../utils";
import { applyStatChanges, triggerStatChangeEvents } from "./actions";

export const checkTurnResourceGain = (side: (CombatantInfo | null)[]) => (dispatch) => {
    const statChanges = side
        .map((combatantInfo) => {
            if (!combatantInfo?.combatant) {
                return;
            }

            const { rawResources, resources } = getResourcesPerTurn(combatantInfo);
            if (rawResources === 0) {
                return;
            }

            return { combatantId: combatantInfo?.combatant?.id, resources, rawResources };
        })
        .filter((v) => v);

    dispatch(applyStatChanges(statChanges));
    dispatch(triggerStatChangeEvents(statChanges.map((statUpdate) => ({ statUpdate }))));
};

const getResourcesPerTurn = (combatantInfo: CombatantInfo): { rawResources: number; resources: number } => {
    const { combatant } = combatantInfo;
    if (isSilenced(combatant) || isStunnedOrFrozen(combatant)) {
        return {
            rawResources: 0,
            resources: 0,
        };
    }

    const baseResourcesGained =
        combatant.resourcesPerTurn +
        getEnabledEffects({ combatantInfo }).reduce((acc: number, { resourcesPerTurn = 0 }) => acc + resourcesPerTurn, 0);

    const resourcesGained = Math.max(0, baseResourcesGained);

    return {
        rawResources: resourcesGained,
        resources: Math.min(combatant.maxResources - combatant.resources, resourcesGained),
    };
};

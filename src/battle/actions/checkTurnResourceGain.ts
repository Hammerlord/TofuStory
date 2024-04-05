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
    if (isStunnedOrFrozen(combatant)) {
        return {
            rawResources: 0,
            resources: 0,
        };
    }

    // Resources per turn caps out at max resources
    const baseResourcesGained = Math.min(combatant.maxResources - combatant.resources, combatant.resourcesPerTurn);
    // But you always get resources from effects, even if it overcaps
    const resourceGainFromEffects = getEnabledEffects({ combatantInfo }).reduce(
        (acc: number, { resourcesPerTurn = 0 }) => acc + resourcesPerTurn,
        0
    );

    const resourcesGained = Math.max(0, baseResourcesGained + resourceGainFromEffects);

    return {
        rawResources: resourcesGained, // TODO clean me up, no different from resources
        resources: resourcesGained,
    };
};

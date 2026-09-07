import { CombatantInfo, ActionContext } from "../../types";
import { isStunnedOrFrozen } from "../../utils";
import { getMaxResources } from "../../utils";
import { getEnabledEffects } from "../statusEffect/getEnabledEffects";
import { applyStatChanges, triggerStatChangeEvents } from "../statChanges";
import { UpdatedCombatantStats } from "../getUpdatedStats";
import { AppDispatch } from "../../../store";

export const checkTurnResourceGain = (side: (CombatantInfo | null | undefined)[], context: ActionContext) => (dispatch: AppDispatch) => {
    const statChanges = side
        .map((combatantInfo) => {
            if (!combatantInfo) {
                return;
            }

            const combatant = combatantInfo?.combatant;
            if ((combatant?.HP || 0) === 0) {
                return;
            }

            const { rawResources, resources } = getResourcesPerTurn(combatantInfo);
            if (rawResources === 0) {
                return;
            }

            return { combatantId: combatant.id, resources, rawResources } as UpdatedCombatantStats;
        })
        .filter((v): v is UpdatedCombatantStats => v !== undefined);

    dispatch(applyStatChanges(statChanges));
    dispatch(triggerStatChangeEvents(statChanges.map((statUpdate) => ({ statUpdate, context }))));
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
    const baseResourcesGained = Math.min(getMaxResources(combatant) - combatant.resources, combatant.resourcesPerTurn);
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

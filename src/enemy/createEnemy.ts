import { getMaxHP } from "./../battle/utils";
import { cloneDeep } from "lodash";
import * as uuid from "uuid";
import { aggregateItemEffects } from "../Menu/utils";
import { Ability, CombatEffect, Effect } from "../ability/types";
import { Combatant } from "../character/types";

export const createCombatant = (combatant): Combatant => {
    if (!combatant) {
        return combatant;
    }

    const effects = [
        ...aggregateItemEffects(combatant.items || []),
        ...(combatant.effects?.map((effect: Effect | CombatEffect) => ({
            ...cloneDeep(effect),
            // @ts-ignore
            uptime: effect.uptime || 1,
            id: uuid.v4(),
        })) || []),
    ];

    const baseChar = {
        id: uuid.v4(),
        ...combatant,
        effects,
        armor: combatant.armor || 0,
        resources: typeof combatant.resources === "number" ? combatant.resources : 1,
        maxResources: combatant.maxResources || 3,
        resourcesPerTurn: combatant.resourcesPerTurn || 1,
        casting: null,
        abilities:
            combatant.abilities?.map((ability: Ability) => ({
                ...cloneDeep(ability),
                id: uuid.v4(),
            })) || [],
        turnHistory: [],
        abilityHistory: [],
    };

    return {
        ...baseChar,
        // If this was tribute summoned, it gets a max HP buff. We want to reflect that in its HP.
        HP: combatant.HP || getMaxHP(baseChar),
    };
};

export default createCombatant;

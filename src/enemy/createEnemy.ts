import { getMaxHP } from "./../battle/utils";
import { cloneDeep } from "lodash";
import uuid from "uuid";
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

    const maxHP = getMaxHP(baseChar);

    return {
        ...baseChar,
        HP: combatant.HP || maxHP,
        maxHP,
    };
};

export default createCombatant;

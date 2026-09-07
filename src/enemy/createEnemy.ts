import { getMaxHP } from "./../battle/utils";
import { cloneDeep } from "lodash";
import * as uuid from "uuid";
import { aggregateItemEffects } from "../Menu/utils";
import { Ability, CombatEffect, Effect, Minion } from "../ability/types";
import { Combatant } from "../character/types";
import { createCombatAbility } from "../ability/createCombatAbility";
import { createCombatEffect } from "../character/effects/createCombatEffect";

export const createCombatant = (combatant: Minion | Combatant | undefined | null): Combatant | null => {
    if (!combatant) {
        return null;
    }

    const effects = [...aggregateItemEffects(combatant.items || []), ...(combatant.effects?.map(createCombatEffect) || [])];

    const baseChar = {
        id: uuid.v4(),
        ...combatant,
        effects,
        armor: combatant.armor || 0,
        resources: typeof combatant.resources === "number" ? combatant.resources : 1,
        maxResources: (combatant as Combatant).maxResources || 3,
        resourcesPerTurn: (combatant as Combatant).resourcesPerTurn || 1,
        casting: null,
        abilities: combatant.abilities?.map(createCombatAbility) || [],
        turnHistory: [],
        abilityHistory: [],
        mesos: combatant.mesos || 0,
        items: combatant.items || [],
        isPlayer: false,
    };

    return {
        ...baseChar,
        // If this was tribute summoned, it gets a max HP buff. We want to reflect that in its HP.
        HP: combatant.HP || getMaxHP(baseChar),
    };
};

export default createCombatant;

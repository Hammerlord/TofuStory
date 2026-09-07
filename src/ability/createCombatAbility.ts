import { Ability, CombatAbility } from "./types";
import * as uuid from "uuid";

/**
 * Normalizes an Ability object -> CombatAbility.
 * The same instanceId is retained if already provided. Otherwise, it creates one.
 */
export const createCombatAbility = (ability: Ability | CombatAbility): CombatAbility => {
    return {
        ...ability,
        instanceId: (ability as CombatAbility).instanceId || uuid.v4(),
        effects: ability.effects || [],
        level: ability.level || 1,
    };
};

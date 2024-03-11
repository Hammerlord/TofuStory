import { AbilityEffect } from "./../ability/types";
import { CombatAbility } from "../ability/types";

export const getAbilityLevel = (ability: CombatAbility) => {
    const { level = 1, effects = [] } = ability || {};
    const abilityLevel = effects.reduce((acc, effect: AbilityEffect) => {
        return acc + (effect.upgradedByLevels || 0);
    }, level);

    const numStars = abilityLevel > 1 ? abilityLevel : 0;
    return Array.from({ length: numStars })
        .map(() => "⋆")
        .join("");
};

export const getAbilityMap = (items: CombatAbility[]): { [abilityName: string]: { count: number; ability: CombatAbility } } => {
    return items
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce((acc, ability) => {
            const levelDisplay = getAbilityLevel(ability);
            const name = levelDisplay ? `${ability.name} ${levelDisplay}` : ability.name;
            acc[name] = {
                ability,
                count: (acc[name]?.count || 0) + 1,
            };
            return acc;
        }, {});
};

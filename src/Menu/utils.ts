import uuid from "uuid";
import { cloneDeep } from "lodash";
import { Ability, Effect } from "../ability/types";
import { Item } from "../item/types";

const copyEffect = (e: Effect) => ({
    ...cloneDeep(e),
    id: uuid.v4(),
    uptime: 0,
});

export const aggregateItemEffects = (items: Item[]): Effect[] => {
    const effects = [];
    items.forEach((item) => {
        const itemEffects = item?.effects?.map(copyEffect) || [];
        effects.push(...itemEffects);
    });
    return effects;
};

export const aggregateAbilityEffects = (abilities: Ability[]): Effect[] => {
    const effects = [];
    abilities.forEach((a: Ability) => {
        const abilityEffects =
            a.effectsWhileOwned?.map((e) => ({
                ...copyEffect(e),
                isEffectFromHoldingAbility: true, // Flag to recalculate if a card event occurs
            })) || [];
        effects.push(...abilityEffects);
    });
    return effects;
};

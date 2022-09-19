import { cloneDeep } from "lodash";
import { Effect } from "../ability/types";
import { Item } from "../item/types";

export const aggregateItemEffects = (items: Item[]): Effect[] => {
    const effects = [];
    items.forEach((item) => {
        const itemEffects = item.effects?.map(cloneDeep) || [];
        effects.push(...itemEffects);
    });
    return effects;
};

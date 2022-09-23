import uuid from "uuid";
import { cloneDeep } from "lodash";
import { Effect } from "../ability/types";
import { Item } from "../item/types";

export const aggregateItemEffects = (items: Item[]): Effect[] => {
    const effects = [];
    items.forEach((item) => {
        const itemEffects =
            item.effects?.map((effect) => ({
                ...cloneDeep(effect),
                id: uuid.v4(),
            })) || [];
        effects.push(...itemEffects);
    });
    return effects;
};

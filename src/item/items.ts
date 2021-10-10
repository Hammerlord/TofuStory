import { EFFECT_CLASSES, EFFECT_TYPES } from "../ability/types";
import { hotdog, stolenFenceImage } from "../images";
import { Item, ITEM_TYPES } from "./types";

export const halfEatenHotdog: Item = {
    name: "Half-eaten Hot Dog",
    healing: 10,
    image: hotdog,
    type: ITEM_TYPES.CONSUMABLE,
};

export const stolenFence: Item = {
    name: "Stolen Fence",
    description: "Reduces damage received by 1 when health is less than half",
    type: ITEM_TYPES.EQUIPMENT,
    image: stolenFenceImage,
    sellPrice: 10,
    effects: [
        {
            name: "Stolen Fence",
            description: "Reducing damage taken by 1",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: stolenFenceImage,
            damageReceived: -1,
            onlyVisibleWhenProcced: true,
            conditions: [
                {
                    calculationTarget: "effectOwner",
                    healthPercentage: 1,
                    comparator: "lt",
                },
            ],
        },
    ],
};

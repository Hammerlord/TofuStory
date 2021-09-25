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
    type: ITEM_TYPES.EQUIPMENT,
    image: stolenFenceImage,
    armorReceived: 1,
    sellPrice: 10,
};

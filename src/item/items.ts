import { hotdog } from "../images";
import { Item, ITEM_TYPES } from "./types";

export const halfEatenHotdog: Item = {
    name: "Half-eaten Hot Dog",
    HP: 10,
    image: hotdog,
    type: ITEM_TYPES.CONSUMABLE,
};

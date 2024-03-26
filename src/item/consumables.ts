import { CakeSliceImage, HotdogImage, UnagiImage } from "../images";
import { ITEM_TYPES, Item } from "./types";

export const cakeItem: Item = {
    name: "Slice of Cake",
    healing: 10,
    image: CakeSliceImage,
    type: ITEM_TYPES.CONSUMABLE,
};

export const unagiItem: Item = {
    name: "Unagi",
    healing: 20,
    image: UnagiImage,
    type: ITEM_TYPES.CONSUMABLE,
};

export const halfEatenHotdog: Item = {
    name: "Half-eaten Hot Dog",
    healing: 10,
    image: HotdogImage,
    type: ITEM_TYPES.CONSUMABLE,
};

import { Ability } from "../ability/types";
import { Item, RARITIES } from "../item/types";

export const NUM_SHOP_ABILITIES = 8;
export const NUM_SHOP_ITEMS = 8;

export const ABILITIES_PRICE_RARITY_MAP = {
    [RARITIES.COMMON]: [50, 65],
    [RARITIES.UNCOMMON]: [90, 120],
    [RARITIES.RARE]: [140, 170],
};

export const ITEMS_PRICE_RARITY_MAP = {
    [RARITIES.COMMON]: [60, 75],
    [RARITIES.UNCOMMON]: [130, 150],
    [RARITIES.RARE]: [180, 210],
};

export type OnBuyItem = ({
    items,
    mesosSpent,
    type,
}: {
    items: Item[] | Ability[];
    mesosSpent: number;
    type: "item" | "ability";
    statChanges?: { maxHP?: number; HP?: number };
}) => void;

export type ShopConfigProperties = {
    refresh: Function;
    buy: OnBuyItem;
    selectedAbilityIndex: number | null;
    selectedItemIndex: number | null;
    setSelectedAbilityIndex: Function;
    setSelectedItemIndex: Function;
    items: Item[];
    abilities: Ability[];
    numRefreshes: number;
    freeFood: boolean;
};

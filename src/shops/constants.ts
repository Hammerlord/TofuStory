import { Ability } from "../ability/types";
import { Item, RARITIES } from "../item/types";

export const NUM_SHOP_ABILITIES = 8;
export const NUM_SHOP_ITEMS = 8;

export const NUM_TRADING_POST_ITEMS = 11;
export const NUM_TRADING_POST_TRADES = 2;

export const NUM_TRANSMUTATIONS = 2;

export const INCENSE_BASE_PRICE = 60;
export const CONSUMABLE_COST_MULTIPLIER = 1.2;
export const CONSUMABLE_MULTIPLIER_MAX = 5;

export const SHOP_REFRESH_COST = 50;

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

export type ShopItem = {
    price: number;
    item: Item;
    isConsumable: boolean;
    isFood: boolean;
    statChanges?;
};

export type ShopAbility = {
    price: number;
    item: Ability;
};

export type TradingPostConfigProperties = {
    trade: (options: { playerItem: Item; forItem: Item }) => void;
    playerItems: Item[];
    vendorItems: Item[];
    tradesRemaining: number;
    selectedPlayerItem: Item;
    setSelectedPlayerItem: (item: Item | null) => void;
    selectedVendorItem: Item;
    setSelectedVendorItem: (item: Item | null) => void;
};

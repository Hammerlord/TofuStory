import * as uuid from "uuid";
import { JOB_CARD_MAP } from "../ability";
import { NEUTRAL_ABILITIES } from "../ability/neutralAbilities";
import { createCombatAbility } from "../ability/createCombatAbility";
import { CombatAbility } from "../ability/types";
import { CharacterState, ShopState, TownShops } from "../character/playerReducer";
import type { Player } from "../character/types";
import { cakeItem, halfEatenHotdog, unagiItem } from "../item/consumables";
import {
    chargingStone,
    greaterChargingStone,
    integrityStone,
    honestyStone,
    rageStone,
    rampageStone,
} from "../item/starterItems";
import { Item } from "../item/types";
import { CLASS_ITEMS } from "../map/routes/eventList";
import { ShopAbility, ShopItem } from "../shops/constants";
import { getUpgradeCard } from "./utils";
import { tofu, tofuSoup } from "../item/items";
import { ITEM_MASTERLIST } from "../item/masterList";

/**
 * The flattened form of a deck card. Due to card effects sometimes using SVGs
 * (functions, which cannot be stringified), objects are flattened to just their
 * name/level here and do a lookup on retrieval.
 */
type FlatCard = {
    name: string;
    level?: number;
};

/** The flattened form of a player item. */
type FlatPlayerItem = {
    name: string;
    stacks?: number;
};

/** A ShopItem whose `item` has been flattened to just the item's name. */
type FlatShopItem = Omit<ShopItem, "item"> & {
    item: string;
};

/** A ShopAbility whose `item` has been flattened to its name/level. */
type FlatShopAbility = {
    price: number;
    item: FlatCard;
};

/** TownShops with every Ability/Item replaced by its lookup name. */
type FlatTownShops = {
    shop: Omit<ShopState, "abilities" | "items"> & {
        abilities: (FlatShopAbility | null)[];
        items: (FlatShopItem | null)[];
    };
    tradingPost: Omit<TownShops["tradingPost"], "items"> & {
        items: string[];
    };
    workshop: TownShops["workshop"];
};

/** The serialized form of a CharacterState, as written to localStorage. */
type SaveFile = {
    deck: FlatCard[];
    player: Omit<Player, "items"> & {
        items: FlatPlayerItem[];
    };
    townShops: Record<string, FlatTownShops>;
} & Omit<CharacterState, "deck" | "player" | "townShops">;

export const saveGame = (characterObject: CharacterState) => {
    const { deck, player, townShops } = characterObject;

    if (!player) {
        return;
    }

    const flattenDeck = deck.map((card) => ({
        name: card.name,
        level: card.level,
    }));
    const flattenPlayerItems = player.items.map((item) => ({
        name: item.name,
        stacks: item.stacks,
    }));

    const flattenTownShops = Object.entries(townShops).reduce<Record<string, FlatTownShops>>(
        (acc, [townName, shopsObj]) => {
            const { shop, tradingPost, workshop } = shopsObj;

            /**
             * Given: { price: number, item: Item, ... }
             * Output: { price: number, item: <item name>, ... }
             * Or null if the input is null.
             */
            const flattenShopItem = (item: ShopItem | null): FlatShopItem | null => {
                if (!item) return item as null;
                return {
                    ...item,
                    item: item.item.name,
                };
            };

            /**
             * Given: { price: number, item: Ability }
             * Output: { price: number, item: { name: string, level?: number } }
             * Or null if the input is null.
             */
            const flattenShopAbility = (item: ShopAbility | null): FlatShopAbility | null => {
                if (!item) return item as null;
                return {
                    ...item,
                    item: {
                        name: item.item.name,
                        level: item.item.level,
                    },
                };
            };

            if (shop) {
                acc[townName] = {
                    ...acc[townName],
                    shop: {
                        ...shop,
                        abilities: shop.abilities.map(flattenShopAbility),
                        items: shop.items.map(flattenShopItem),
                    },
                };
            }

            if (tradingPost) {
                acc[townName] = {
                    ...acc[townName],
                    tradingPost: {
                        ...tradingPost,
                        items: tradingPost.items.map((item) => item.name),
                    },
                };
            }

            acc[townName] = {
                ...acc[townName],
                workshop,
            };

            return acc;
        },
        {},
    );

    try {
        localStorage.setItem(
            "saveFile",
            JSON.stringify({
                ...characterObject,
                deck: flattenDeck,
                player: { ...player, items: flattenPlayerItems },
                townShops: flattenTownShops,
            }),
        );
    } catch (e) {
        console.log("Failed to save file:", e);
        console.log("File object was", {
            ...characterObject,
            deck: flattenDeck,
            player: { ...player, items: flattenPlayerItems },
            townShops: flattenTownShops,
        });
    }
};

export const getGameFile = (): CharacterState | undefined => {
    const saveFileString = localStorage.getItem("saveFile");
    if (!saveFileString) {
        return;
    }

    try {
        const fileObj = JSON.parse(saveFileString) as SaveFile;
        const { deck = [], player, townShops = {} } = fileObj;

        if (!player) {
            return;
        }

        const cards = [...JOB_CARD_MAP[player.class].all, ...NEUTRAL_ABILITIES];

        const hydrateAbility = (flatCard: FlatCard): CombatAbility | undefined => {
            const { name, level = 1 } = flatCard;
            const hydrated = cards.find((card) => card.name === name);
            if (hydrated) {
                let upgradedCard = hydrated;
                while ((upgradedCard.level || 1) < level) {
                    const newUpgradedCard = getUpgradeCard(upgradedCard);
                    if (newUpgradedCard) {
                        upgradedCard = newUpgradedCard;
                    } else {
                        break;
                    }
                }
                return createCombatAbility({ ...upgradedCard, instanceId: uuid.v4() });
            }
        };

        const hydratedDeck = deck.map(hydrateAbility).filter((v): v is CombatAbility => !!v);

        const starters = [
            rageStone,
            rampageStone,
            chargingStone,
            greaterChargingStone,
            honestyStone,
            integrityStone,
        ];
        const consumables = [halfEatenHotdog, unagiItem, cakeItem];
        const other = [tofu, tofuSoup];
        const itemLookup = [
            ...ITEM_MASTERLIST,
            ...CLASS_ITEMS[player.class],
            ...starters,
            ...consumables,
            ...other,
        ];

        const items: Item[] = player.items.map((item: FlatPlayerItem): Item => {
            const found = itemLookup.find((otherItem) => otherItem.name === item.name);
            if (found) {
                return {
                    ...found,
                    stacks: item.stacks || undefined,
                };
            }

            // The item is not in the lookup (eg. an outdated save file).
            return item as unknown as Item;
        });

        const hydrateTownShops = Object.entries(townShops).reduce<Record<string, TownShops>>(
            (acc, [townName, shopsObj]) => {
                const { shop, tradingPost, workshop } = shopsObj;

                /**
                 * See the output of flattenShopItem above for the input here.
                 */
                const hydrateShopItem = (
                    shopItem: FlatShopItem | null,
                ): ShopItem | FlatShopItem | null => {
                    if (!shopItem) return shopItem;
                    const lookup = itemLookup.find(({ name }) => name === shopItem.item);
                    if (lookup) {
                        return {
                            ...shopItem,
                            item: lookup,
                        };
                    }

                    return shopItem;
                };

                const hydrateShopAbility = (item: FlatShopAbility | null): ShopAbility | null => {
                    if (!item) return item as null;
                    const hydratedAbility = hydrateAbility(item.item);
                    // The ability has no matching card in the class/neutral pool
                    // (eg. an outdated save file). Treat the slot as empty.
                    if (!hydratedAbility) {
                        return null;
                    }
                    return { ...item, item: hydratedAbility };
                };

                if (shop) {
                    acc[townName] = {
                        ...acc[townName],
                        shop: {
                            ...shop,
                            abilities: shop.abilities.map(hydrateShopAbility),
                            items: shop.items
                                .map(hydrateShopItem)
                                .filter(
                                    (v): v is ShopItem | null =>
                                        v === null || typeof v.item !== "string",
                                ),
                        },
                    };
                }

                if (tradingPost) {
                    acc[townName] = {
                        ...acc[townName],
                        tradingPost: {
                            ...tradingPost,
                            items: tradingPost.items
                                .map((itemName: string) => {
                                    return itemLookup.find(
                                        (otherItem) => otherItem.name === itemName,
                                    );
                                })
                                .filter((v): v is Item => !!v),
                        },
                    };
                }

                acc[townName] = {
                    ...acc[townName],
                    workshop,
                };

                return acc;
            },
            {},
        );

        return {
            ...fileObj,
            deck: hydratedDeck,
            player: { ...player, items },
            townShops: hydrateTownShops,
        };
    } catch (e) {
        console.error(e);
        // Just return nothing if something failed. It will be treated as a new run.
    }
};

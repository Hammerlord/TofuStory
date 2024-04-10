import uuid from "uuid";
import { JOB_CARD_MAP } from "../ability";
import { getUpgradeCard } from "./utils";
import { CLASS_ITEMS } from "../map/routes/eventList";
import { ITEM_MASTERLIST } from "../devtools/DevItemViewer";
import { chargingStone, greaterChargingStone, rageStone, rampageStone } from "../item/starterItems";
import { cakeItem, halfEatenHotdog, unagiItem } from "../item/consumables";
import { NEUTRAL_ABILITIES } from "../ability/neutralAbilities";
import { CharacterState } from "../character/playerReducer";
import { Ability } from "../ability/types";
import { Item } from "../item/types";

export const saveGame = (characterObject: CharacterState) => {
    const { deck, player, townShops } = characterObject;
    // Due to card effects sometimes using SVGs (functions, which cannot be stringified), flatten the objects to just their name/level here and do a lookup on retrieval.
    const flattenDeck = deck.map((card) => ({ name: card.name, level: card.level }));
    const flattenPlayerItems = player.items.map((item) => ({ name: item.name, stacks: item.stacks }));
    const flattenTownShops = Object.entries(townShops).reduce((acc, [townName, shopsObj]) => {
        acc[townName] = {
            ...shopsObj,
        };
        const { shop, tradingPost } = shopsObj;

        /**
         * Given: { price: number, item: Item }
         * Output: { price: number, item: [<item name>: string] }
         * Or null if the input is null.
         */
        const flattenShopItem = (item: { price: number; item: Item } | null): { price: number; item: string } | null => {
            if (!item) return item as null;
            return {
                ...item,
                item: item.item.name,
            };
        };

        /**
         * Given: { price: number, item: Ability }
         * Output: { price: number, item: { name: string<item name>, level?: number } }
         * Or null if the input is null.
         */
        const flattenShopAbility = (
            item: { price: number; item: Ability } | null
        ): { price: number; item: { name: string; level?: number } } | null => {
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
            acc[townName].shop = {
                ...shop,
                abilities: shop.abilities.map(flattenShopAbility),
                item: shop.items.map(flattenShopItem),
            };
        }

        if (tradingPost) {
            acc[townName].tradingPost = {
                ...tradingPost,
                items: tradingPost.items.map((item) => item.name),
            };
        }

        return acc;
    }, {});

    localStorage.setItem(
        "saveFile",
        JSON.stringify({
            ...characterObject,
            deck: flattenDeck,
            player: { ...player, items: flattenPlayerItems },
            townShops: flattenTownShops,
        })
    );
};

export const getGameFile = () => {
    const saveFileString = localStorage.getItem("saveFile");
    if (!saveFileString) {
        return;
    }

    try {
        const fileObj = JSON.parse(saveFileString);
        const { deck = [], player = {}, townShops = {} } = fileObj;
        const cards = [...JOB_CARD_MAP[player.class].all, ...NEUTRAL_ABILITIES];

        const hydrateAbility = (flatCard: { name: string; level?: number }) => {
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
                return { ...upgradedCard, instanceId: uuid.v4() };
            }
        };

        const hydratedDeck = deck.map(hydrateAbility).filter((v) => v);

        const starters = [rageStone, rampageStone, chargingStone, greaterChargingStone];
        const consumables = [halfEatenHotdog, unagiItem, cakeItem];
        const itemLookup = [...ITEM_MASTERLIST, ...CLASS_ITEMS[player.class], ...starters, ...consumables];

        const items = player.items.map((item) => {
            const found = itemLookup.find((otherItem) => otherItem.name === item.name);
            if (found) {
                return {
                    ...found,
                    stacks: item.stacks || undefined,
                };
            }

            return item;
        });

        const hydrateTownShops = Object.entries(townShops).reduce((acc, [townName, shopsObj]) => {
            acc[townName] = {};
            const { shop, tradingPost, workshop } = shopsObj as any;

            /**
             * See output of flattenShopItem above for the input here.
             */
            const hydrateShopItem = (item: { price: number; item: string } | null) => {
                if (!item) return item;
                return {
                    ...item,
                    item: itemLookup.find(({ name }) => name === item),
                };
            };

            const hydrateShopAbility = (item: { price: number; item: { name: string; level?: number } } | null) => {
                if (!item) return item;
                return { ...item, item: hydrateAbility(item.item) };
            };

            if (shop) {
                acc[townName].shop = {
                    ...shop,
                    abilities: shop.abilities.map(hydrateShopAbility),
                    item: shop.items.map(hydrateShopItem),
                };
            }

            if (tradingPost) {
                acc[townName].tradingPost = {
                    ...tradingPost,
                    items: tradingPost.items
                        .map((itemName: string) => {
                            return itemLookup.find((otherItem) => otherItem.name === itemName);
                        })
                        .filter((v) => v),
                };
            }

            acc[townName].workshop = workshop;

            return acc;
        }, {});

        return { ...fileObj, deck: hydratedDeck, player: { ...player, items }, townShops: hydrateTownShops };
    } catch (e) {
        console.error(e);
        // Just return nothing if something failed. It will be treated as a new run.
    }
};

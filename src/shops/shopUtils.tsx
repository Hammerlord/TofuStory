import { clubMembership } from "../item/items";
import { JOB_CARD_MAP } from "../ability";
import { NEUTRAL_ABILITIES } from "../ability/neutralAbilities";
import { Ability } from "../ability/types";
import { Player } from "../character/types";
import { NewYearRiceSoupImage, TofuImage } from "../images";
import { bigMesoItem, goldenHammer, hugeMesoItem, incense, mesoItem } from "../item/items";
import { Item, RARITIES } from "../item/types";
import { rollItemPool, rollRarity } from "../item/utils";
import { getRandomInt, getRandomItem, shuffle } from "../utils";
import { ABILITIES_PRICE_RARITY_MAP, ITEMS_PRICE_RARITY_MAP, NUM_SHOP_ABILITIES, NUM_SHOP_ITEMS, ShopConfigProperties } from "./constants";
import { getUpgradeCard } from "../Menu/utils";
import { useEffect, useState } from "react";

/**
 * Get refreshes/shop discount from the player's item effects.
 * For an example of such an item that affects the shop,
 * @see clubMembership
 */
export const getShopCustomerProperties = (player: Player) => {
    const { totalRefreshes, totalDiscount, freeFood } = player.items.reduce(
        (acc, item: Item) => {
            const { refreshTimes = 0, discount = 0, freeFood } = item?.merchant || {};
            acc.totalRefreshes += refreshTimes;
            acc.totalDiscount += discount;
            if (freeFood) {
                acc.freeFood = true;
            }
            return acc;
        },
        { totalRefreshes: 0, totalDiscount: 0, freeFood: false }
    );
    const cappedDiscount = Math.min(1, totalDiscount);
    return {
        discount: cappedDiscount,
        numRefreshes: totalRefreshes,
        freeFood,
    };
};

/**
 * Hook for generating + storing shop state.
 */
export const useShopConfig = ({
    player,
    onBuyItem,
}: {
    player: Player;
    onBuyItem: ({
        items,
        mesosSpent,
        type,
    }: {
        items: Item[] | Ability[];
        mesosSpent: number;
        type: "item" | "ability";
        statChanges?: { maxHP?: number; HP?: number };
    }) => void;
}): ShopConfigProperties => {
    const [abilities, setAbilities] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const [shopOptions, setShopOptions] = useState(getShopCustomerProperties(player));
    const [usedFreeFood, setUsedFreeFood] = useState(false);
    const [usedNumRefreshes, setUsedNumRefreshes] = useState(0);

    const { discount, numRefreshes, freeFood } = shopOptions;

    const applyDiscount = (price: number) => {
        return Math.max(0, price - Math.floor(discount * price));
    };

    const refreshItems = () => {
        // Abilities
        const potentialAbilities = JOB_CARD_MAP[player.class].all
            .map((ability: Ability) => {
                if (JOB_CARD_MAP[player.class].starters.includes(ability) && ability.upgrades?.length > 0) {
                    return getUpgradeCard(ability);
                }

                return ability;
            })
            .concat(NEUTRAL_ABILITIES);

        const rolledAbilities = [];
        Array.from({ length: NUM_SHOP_ABILITIES }).forEach(() => {
            const selectedRarity = rollRarity({ player });
            const [filteredByRarity] = shuffle(potentialAbilities).filter((ability: Ability) => {
                const noDuplicate = rolledAbilities.every((choice) => choice.name !== ability.name);
                return (ability.rarity || RARITIES.COMMON) === selectedRarity && noDuplicate;
            });
            rolledAbilities.push(filteredByRarity);
        });

        const abilitiesForSale = rolledAbilities.map((ability: Ability) => {
            const priceRangeForRarity: [number, number] = ABILITIES_PRICE_RARITY_MAP[ability.rarity || RARITIES.COMMON] as [number, number];
            const price = getRandomInt(...priceRangeForRarity);
            return { price, item: ability };
        });

        setAbilities(abilitiesForSale);

        // Items
        const itemsRolledForSale = [];
        Array.from({ length: NUM_SHOP_ITEMS }).forEach(() => {
            const item = getRandomItem(
                rollItemPool({ player, excludeItems: [...itemsRolledForSale, mesoItem, bigMesoItem, hugeMesoItem] })
            );
            itemsRolledForSale.push(item);
        });

        const itemsForSale = itemsRolledForSale.map((item) => {
            const priceRangeForRarity: [number, number] = ITEMS_PRICE_RARITY_MAP[item.rarity || RARITIES.COMMON];
            const price = getRandomInt(...priceRangeForRarity);
            return { price, item, isConsumable: false, isFood: false };
        });

        const consumables = [
            {
                item: goldenHammer,
                price: 40,
                isConsumable: true,
                isFood: false,
            },
            {
                item: incense,
                price: 60,
                isConsumable: true,
                isFood: false,
            },
        ];

        itemsForSale.push(...consumables);

        const food = [
            {
                item: {
                    name: "Tofu",
                    image: TofuImage,
                    description: "Permanently increase max HP by 3.",
                },
                price: 50,
                isConsumable: true,
                isFood: true,
                statChanges: {
                    maxHP: 3,
                },
            },
            {
                item: {
                    name: "Tofu Soup",
                    image: NewYearRiceSoupImage,
                    description: "Restore 15 HP.",
                },
                price: 50,
                isConsumable: true,
                isFood: true,
                statChanges: {
                    HP: 15,
                },
            },
        ];

        itemsForSale.push(...food);
        setItems(itemsForSale);
    };

    useEffect(() => {
        refreshItems();
    }, []);

    useEffect(() => {
        // Items like Tofu Special and Shopper's Club Membership should take effect if bought.
        setShopOptions(getShopCustomerProperties(player));
    }, [player?.items]);

    const buy = () => {
        if (abilities[selectedAbilityIndex]) {
            const { price: initPrice, item } = abilities[selectedAbilityIndex];
            const price = applyDiscount(initPrice);
            if (player.mesos >= price) {
                onBuyItem({ items: [item], mesosSpent: price, type: "ability" });
                const updatedAbilities = abilities.slice();
                updatedAbilities[selectedAbilityIndex] = null;
                setAbilities(updatedAbilities);
                setSelectedAbilityIndex(null);
            }
            return;
        }

        if (items[selectedItemIndex]) {
            const { price, item, isConsumable, isFood, statChanges } = items[selectedItemIndex];
            const canAfford = player.mesos >= price;
            if (!canAfford) {
                return;
            }

            if (isConsumable) {
                if (isFood) {
                    if (freeFood) {
                        setUsedFreeFood(true);
                        onBuyItem({ items: [], mesosSpent: 0, type: "item", statChanges });
                    } else {
                        onBuyItem({ items: [], mesosSpent: price, type: "item", statChanges });
                    }

                    setSelectedItemIndex(null);
                    return;
                }

                // Else an incense or golden hammer was bought. These are not removed from the shop when bought, but they do become more expensive.
                onBuyItem({ items: [item], mesosSpent: price, type: "item" });
                const updatedItems = items.map((other) => {
                    if (other?.item?.name === item.name) {
                        return {
                            ...other,
                            price: Math.floor(price * 1.2),
                        };
                    }

                    return other;
                });
                setItems(updatedItems);
                setSelectedItemIndex(null);
                return;
            }

            onBuyItem({ items: [item], mesosSpent: price, type: "item" });
            const updatedItems = items.slice();
            updatedItems[selectedItemIndex] = null;
            setItems(updatedItems);
            setSelectedItemIndex(null);
        }
    };

    const refresh = () => {
        refreshItems();
        setUsedNumRefreshes((prev) => prev + 1);
    };

    return {
        refresh,
        buy,
        selectedAbilityIndex,
        selectedItemIndex,
        setSelectedAbilityIndex,
        setSelectedItemIndex,
        numRefreshes: Math.max(0, numRefreshes - usedNumRefreshes),
        abilities,
        items,
        applyDiscount,
        freeFood: freeFood && !usedFreeFood,
    };
};

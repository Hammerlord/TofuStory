import { Ability, CombatAbility } from "../ability/types";
import { Player } from "../character/types";
import { clubMembership, tofu, tofuSoup } from "../item/items";
import { Item } from "../item/types";

import { getCardPool, getUpgradeCard } from "../Menu/utils";
import { JOB_CARD_MAP } from "../ability";
import { NEUTRAL_ABILITIES } from "../ability/neutralAbilities";
import { NewYearRiceSoupImage, TofuImage } from "../images";
import { bigMesoItem, goldenHammer, hugeMesoItem, incense, mesoItem } from "../item/items";
import { RARITIES } from "../item/types";
import { rollItemPool, rollRarity } from "../item/utils";
import { getRandomInt, getRandomItem, shuffle } from "../utils";
import {
    ABILITIES_PRICE_RARITY_MAP,
    INCENSE_BASE_PRICE,
    ITEMS_PRICE_RARITY_MAP,
    NUM_SHOP_ABILITIES,
    NUM_SHOP_ITEMS,
    ShopAbility,
    ShopItem,
} from "./constants";

/**
 * Get refreshes/shop discount from the player's item effects.
 * For an example of such an item that affects the shop,
 * @see clubMembership
 */
export const getShopCustomerProperties = (player: Player) => {
    const { totalRefreshes, totalDiscount, freeFood } = player.items.reduce(
        (acc, item: Item) => {
            const { refreshTimes = 0, discount = 0, freeFood = 0 } = item?.merchant || {};
            acc.totalRefreshes += refreshTimes;
            acc.totalDiscount += discount;
            if (freeFood) {
                acc.freeFood += 1;
            }
            return acc;
        },
        { totalRefreshes: 0, totalDiscount: 0, freeFood: 0 }
    );
    const cappedDiscount = Math.min(1, totalDiscount);
    return {
        discount: cappedDiscount,
        numRefreshes: totalRefreshes,
        freeFood,
    };
};

export const generateShopInventory = ({
    player,
    deck,
}: {
    player: Player;
    deck: CombatAbility[];
}): { abilities: ShopAbility[]; items: ShopItem[] } => {
    // Abilities
    const potentialAbilities = getCardPool(player, deck);

    const rolledAbilities = [];
    Array.from({ length: NUM_SHOP_ABILITIES }).forEach(() => {
        const selectedRarity = rollRarity({ player });
        const [filteredByRarity] = shuffle(potentialAbilities).filter((ability: Ability) => {
            const noDuplicate = rolledAbilities.every((choice) => choice.name !== ability.name);
            return (ability.rarity || RARITIES.COMMON) === selectedRarity && noDuplicate;
        });
        rolledAbilities.push(filteredByRarity);
    });

    const abilities = rolledAbilities.map((ability: Ability) => {
        const priceRangeForRarity: [number, number] = ABILITIES_PRICE_RARITY_MAP[ability.rarity || RARITIES.COMMON] as [number, number];
        const price = getRandomInt(...priceRangeForRarity);
        return { price, item: ability };
    });

    // Items
    const itemsRolledForSale = [];
    Array.from({ length: NUM_SHOP_ITEMS }).forEach(() => {
        const item = getRandomItem(rollItemPool({ player, excludeItems: [...itemsRolledForSale, mesoItem, bigMesoItem, hugeMesoItem] }));
        itemsRolledForSale.push(item);
    });

    const items = itemsRolledForSale.map((item) => {
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
            price: INCENSE_BASE_PRICE,
            isConsumable: true,
            isFood: false,
        },
    ];

    items.push(...consumables);

    const food = [
        {
            item: tofu,
            price: 50,
            isConsumable: false,
            isFood: true,
        },
        {
            item: tofuSoup,
            price: 50,
            isConsumable: true,
            isFood: true,
            statChanges: {
                HP: 15,
            },
        },
    ];

    items.push(...food);

    return { abilities, items };
};

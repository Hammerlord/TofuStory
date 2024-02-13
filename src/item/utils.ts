import { ITEMS } from "../Map/routes/eventList";
import { RARE_ITEM_CHANCE, UNCOMMON_ITEM_CHANCE } from "../constants";
import { ITEM_TYPES, Item, RARITIES } from "./types";

export const rollRarity = (player, bonuses = { uncommon: 0, rare: 0 }): RARITIES => {
    const roll = Math.random();
    const { bonusUncommonChance, bonusRareChance } = player.items.reduce(
        (acc, item: Item) => {
            const { uncommonRateIncrease = 0, rareRateIncrease = 0 } = item.equipment || {};
            return {
                ...acc,
                bonusUncommonChance: acc.bonusUncommonChance + uncommonRateIncrease,
                bonusRareChance: acc.bonusRareChance + rareRateIncrease,
            };
        },
        { bonusUncommonChance: bonuses.uncommon || 0, bonusRareChance: bonuses.rare || 0 }
    );

    const uncommonChance = UNCOMMON_ITEM_CHANCE + bonusUncommonChance;
    const rareChance = RARE_ITEM_CHANCE + bonusRareChance;

    if (roll <= rareChance) {
        return RARITIES.RARE;
    }

    if (roll > rareChance && roll <= rareChance + uncommonChance) {
        return RARITIES.UNCOMMON;
    }

    return RARITIES.COMMON;
};

export const rollItemPool = ({
    player,
    excludeItems = [],
    bonuses = { uncommon: 0, rare: 0 },
}: {
    player;
    excludeItems?: Item[];
    bonuses?: { uncommon: number; rare: number };
}): Item[] => {
    const alreadyObtained = player.items.concat(excludeItems).reduce((acc, item: Item) => {
        if (item.type === ITEM_TYPES.EQUIPMENT) {
            acc[item.name] = true;
        }
        return acc;
    }, {});

    const selectedRarity = rollRarity(player, bonuses);
    let itemPool = ITEMS.filter((item: Item) => !alreadyObtained[item.name]);
    let filteredByRarity = itemPool.filter((item) => (item.rarity || RARITIES.COMMON) === selectedRarity);
    if (!filteredByRarity.length) {
        const changeRarity = {
            [RARITIES.COMMON]: RARITIES.UNCOMMON,
            [RARITIES.UNCOMMON]: RARITIES.RARE,
            [RARITIES.RARE]: RARITIES.UNCOMMON, // If there are no rare items, try giving an uncommon item
        }[selectedRarity];

        if (changeRarity) {
            return itemPool.filter((item) => item.rarity === changeRarity);
        }
    }

    // This can be an empty array if the player has acquired all items of a rarity and changeRarity failed.
    return filteredByRarity;
};

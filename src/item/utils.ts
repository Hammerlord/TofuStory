import { CLASS_ITEMS, ITEMS } from "../Map/routes/eventList";
import { Player } from "../character/types";
import { RARE_ITEM_CHANCE, UNCOMMON_ITEM_CHANCE } from "../constants";
import { ITEM_TYPES, Item, RARITIES } from "./types";

export const rollRarity = ({
    player,
    bonuses = { uncommon: 0, rare: 0 },
    disableRarities = [],
}: {
    player: Player;
    bonuses?: { uncommon: number; rare: number };
    disableRarities?: RARITIES[]; // Only works for rare and uncommon
}): RARITIES => {
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

    const uncommonChance = disableRarities.includes(RARITIES.UNCOMMON) ? 0 : UNCOMMON_ITEM_CHANCE + bonusUncommonChance;
    const rareChance = disableRarities.includes(RARITIES.RARE) ? 0 : RARE_ITEM_CHANCE + bonusRareChance;

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
    const selectedRarity = rollRarity({ player, bonuses });
    const itemPool = getAllPossibleItems({ player, excludeItems });
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

export const getAllPossibleItems = ({ player, excludeItems = [] }) => {
    // Exclude already-obtained equipment
    const exclude = player.items.reduce((acc, item: Item) => {
        if (item.type === ITEM_TYPES.EQUIPMENT) {
            acc[item.name] = true;
        }
        return acc;
    }, {});

    excludeItems.forEach((item) => (exclude[item.name] = true));
    return ITEMS.concat(CLASS_ITEMS[player.class] || []).filter((item: Item) => !exclude[item.name]);
};

import { COMMON_ITEM_CHANCE, UNCOMMON_ITEM_CHANCE } from "../constants";
import { Item, RARITIES } from "./types";

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
        { bonusUncommonChance: bonuses.uncommon, bonusRareChance: bonuses.rare }
    );
    const commonChance = COMMON_ITEM_CHANCE - bonusUncommonChance - bonusRareChance;
    const uncommonChance = UNCOMMON_ITEM_CHANCE + bonusUncommonChance;

    if (roll <= commonChance) {
        return RARITIES.COMMON;
    }

    if (roll > commonChance && roll <= commonChance + uncommonChance) {
        return RARITIES.UNCOMMON;
    }

    return RARITIES.RARE;
};

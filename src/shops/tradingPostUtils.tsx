import { Player } from "../character/types";
import { bigMesoItem, hugeMesoItem, mesoItem } from "../item/items";
import { STARTER_ITEM_UPGRADE_MAP } from "../item/starterItems";
import { Item } from "../item/types";
import { CLASS_ITEMS, ITEMS } from "../map/routes/eventList";
import { filterUnobtainableItems } from "../Menu/utils";
import { getRandomItem, shuffle } from "../utils";
import { NUM_TRADING_POST_ITEMS } from "./constants";

/**
 * Rolls a single item in the Trading Post.
 * Used by {@link generateTradingPostInventory} and to re-roll already-obtained
 * equipment on revisits. Will not roll items the player already owns or meso items.
 */
export const rollTradingPostItem = ({
    player,
    excludeItems = [],
}: {
    player: Player;
    excludeItems?: Item[];
}): Item | undefined => {
    const itemPool = shuffle(
        filterUnobtainableItems({
            playerItems: player.items,
            excludeItems: [...excludeItems, mesoItem, bigMesoItem, hugeMesoItem],
            itemsToFilter: ITEMS.concat(CLASS_ITEMS[player.class] || []),
        }),
    );
    return getRandomItem(itemPool);
};

export const generateTradingPostInventory = (player: Player) => {
    const upgradedStarterItem = STARTER_ITEM_UPGRADE_MAP[player.class];

    const mesoItems = [mesoItem, bigMesoItem, hugeMesoItem];
    const rolledItems: Item[] = [];
    Array.from({ length: NUM_TRADING_POST_ITEMS }).forEach(() => {
        const rolledItem = rollTradingPostItem({ player, excludeItems: rolledItems });
        if (rolledItem) {
            rolledItems.push(rolledItem);
        }
    });

    const items = rolledItems.concat(mesoItems);

    if (
        upgradedStarterItem &&
        !player.items.some((item) => item.name === upgradedStarterItem.name)
    ) {
        items.push(upgradedStarterItem);
    }

    return items;
};

import { Player } from "../character/types";
import { bigMesoItem, hugeMesoItem, mesoItem } from "../item/items";
import { STARTER_ITEM_UPGRADE_MAP } from "../item/starterItems";
import { CLASS_ITEMS, ITEMS } from "../map/routes/eventList";
import { filterUnobtainableItems } from "../Menu/utils";
import { shuffle } from "../utils";
import { NUM_TRADING_POST_ITEMS } from "./constants";

export const generateTradingPostInventory = (player: Player) => {
    const upgradedStarterItem = STARTER_ITEM_UPGRADE_MAP[player.class];

    const mesoItems = [mesoItem, bigMesoItem, hugeMesoItem];
    const itemPool = shuffle(
        filterUnobtainableItems({
            playerItems: player.items,
            excludeItems: mesoItems,
            itemsToFilter: ITEMS.concat(CLASS_ITEMS[player.class] || []),
        })
    );
    const items = itemPool.slice(0, NUM_TRADING_POST_ITEMS).concat(mesoItems);

    if (upgradedStarterItem && !player.items.some((item) => item.name === upgradedStarterItem.name)) {
        items.push(upgradedStarterItem);
    }

    return items;
};

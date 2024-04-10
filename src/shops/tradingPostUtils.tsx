import { Player } from "../character/types";
import { bigMesoItem, hugeMesoItem, mesoItem } from "../item/items";
import { STARTER_ITEM_UPGRADE_MAP } from "../item/starterItems";
import { ITEM_TYPES, Item } from "../item/types";
import { CLASS_ITEMS, ITEMS } from "../map/routes/eventList";
import { shuffle } from "../utils";
import { NUM_TRADING_POST_ITEMS } from "./constants";

export const generateTradingPostInventory = (player: Player) => {
    const upgradedStarterItem = STARTER_ITEM_UPGRADE_MAP[player.class];
    // Exclude already-obtained equipment
    const exclude = player.items.reduce((acc, item: Item) => {
        acc[item.name] = acc[item.name] || item.type === ITEM_TYPES.EQUIPMENT;
        return acc;
    }, {});

    const itemPool = shuffle(
        ITEMS.concat(CLASS_ITEMS[player.class] || [])
            .filter((item: Item) => !exclude[item.name] && item.type === ITEM_TYPES.EQUIPMENT)
            .concat([mesoItem, bigMesoItem, hugeMesoItem])
    );
    const items = itemPool.slice(0, NUM_TRADING_POST_ITEMS);

    if (upgradedStarterItem && !exclude[upgradedStarterItem.name]) {
        items.push(upgradedStarterItem);
    }

    return items;
};

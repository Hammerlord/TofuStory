import { useEffect, useState } from "react";
import { CLASS_ITEMS, ITEMS } from "../map/routes/eventList";
import { bigMesoItem, hugeMesoItem, mesoItem } from "../item/items";
import { STARTER_ITEM_UPGRADE_MAP } from "../item/starterItems";
import { ITEM_TYPES, Item, RARITIES } from "../item/types";
import { shuffle } from "../utils";
import { NUM_TRADING_POST_ITEMS, NUM_TRADING_POST_TRADES, TradingPostConfigProperties } from "./constants";

export const useTradingPostConfig = ({ player, onTrade }): TradingPostConfigProperties => {
    const [playerItems, setPlayerItems] = useState([]);
    const [tradesRemaining, setTradesRemaining] = useState(NUM_TRADING_POST_TRADES);
    const [vendorItems, setVendorItems] = useState([]);
    const [selectedPlayerItem, setSelectedPlayerItem] = useState(null);
    const [selectedVendorItem, setSelectedVendorItem] = useState(null);
    const upgradedStarterItem = STARTER_ITEM_UPGRADE_MAP[player.class];

    useEffect(() => {
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
        setVendorItems(items);
    }, []);

    useEffect(() => {
        // Only equipment is available to trade. Trading Post also does not want the starter item or its upgraded version.
        setPlayerItems(
            player.items.filter(
                (item: Item) =>
                    item.type === ITEM_TYPES.EQUIPMENT &&
                    item.rarity !== RARITIES.STARTER &&
                    item.name !== STARTER_ITEM_UPGRADE_MAP[player.class]?.name
            )
        );
        // If the player acquired new equipment prior to a revisit, those equipments should not be in the inventory
        const alreadyObtained = player.items.reduce((acc, item: Item) => {
            if (item.type === ITEM_TYPES.EQUIPMENT) {
                acc[item.name] = true;
            }
            return acc;
        }, {});
        setVendorItems((prev) =>
            prev.filter((item) => {
                if (!alreadyObtained[item.name]) {
                    return true;
                }
            })
        );
    }, [player.items]);

    const trade = () => {
        if (!selectedPlayerItem || !selectedVendorItem) {
            return;
        }
        setTradesRemaining((prev) => prev - 1);
        setVendorItems((prev) => prev.filter((p) => p.name !== selectedVendorItem.name));
        setSelectedPlayerItem(null);
        setSelectedVendorItem(null);
        onTrade({ playerItem: selectedPlayerItem, forItem: selectedVendorItem });
    };

    return {
        trade,
        playerItems,
        vendorItems,
        tradesRemaining,
        selectedPlayerItem,
        setSelectedPlayerItem,
        selectedVendorItem,
        setSelectedVendorItem,
    };
};

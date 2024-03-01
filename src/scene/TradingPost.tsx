import { useEffect, useState } from "react";
import { ITEM_TYPES, Item, RARITIES } from "../item/types";
import { CLASS_ITEMS, ITEMS } from "../Map/routes/eventList";
import { shuffle } from "../utils";
import ItemView from "../item/ItemView";
import { createUseStyles } from "react-jss";
import classNames from "classnames";
import Button from "../view/Button";
import { STARTER_ITEM_UPGRADE_MAP } from "../item/starterItems";
import { bigMesoItem, hugeMesoItem, mesoItem } from "../item/items";
import { Player } from "../character/types";

const HEADER_BAR = 72;

const useStyles = createUseStyles({
    tradingPostRoot: {
        color: "white",
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        paddingTop: HEADER_BAR,
        bottom: 0,
        maxHeight: `calc(100% - ${HEADER_BAR}px)`,
        background: "rgba(20, 20, 20, 0.99)",
        textAlign: "center",
    },
    doneContainer: {
        position: "absolute",
        right: "32px",
        paddingTop: "32px",
    },
    titleContainer: {
        display: "inline-block",
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        padding: "8px 96px",
        color: "white",
        marginBottom: "24px",
        minWidth: 400,
    },
    flex: {
        display: "flex",
        justifyContent: "space-around",
    },
    offerContainer: {
        margin: 8,
        display: "inline-block",
    },
    itemsContainer: {
        width: "45%",
        overflowY: "scroll",
        maxHeight: "60vh",
    },
    itemContainer: {
        display: "inline-block",
        margin: 8,
        minHeight: 200,
    },
    candidate: {
        filter: "drop-shadow(0px 0px 4px rgb(240, 220, 0)) drop-shadow(0px 0px 4px rgb(240, 220, 0))",
    },

    itemPlaceholder: {
        display: "inline-block",
        borderRadius: "8px",
        padding: 16,
        verticalAlign: "bottom",
        width: "198px",
        minHeight: "148px",
        color: "white",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        cursor: "pointer",
    },
    disable: {
        filter: "brightness(0.5)",
    },
    highlight: {
        filter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
    },
    tradesRemainingLabel: {
        margin: 8,
    },
});

const BASE_VENDOR_ITEMS = 8;

// At the trading post, players can exchange one of their items for an item of equivalent or lower rarity,
// or exchange their starter equipment for an upgraded version of their starter equipment.
const TradingPost = ({
    player,
    onTrade,
    onExit,
}: {
    player: Player;
    onTrade: (options: { playerItem: Item; forItem: Item }) => void;
    onExit: () => void;
}) => {
    const [playerItems, setPlayerItems] = useState([]);
    const [tradesRemaining, setTradesRemaining] = useState(2);
    const [vendorItems, setVendorItems] = useState([]);
    const [selectedPlayerItem, setSelectedPlayerItem] = useState(null);
    const [selectedVendorItem, setSelectedVendorItem] = useState(null);
    const classes = useStyles();

    useEffect(() => {
        // Exclude already-obtained equipment
        const exclude = playerItems.reduce((acc, item: Item) => {
            acc[item.name] = true;
            return acc;
        }, {});

        const itemPool = shuffle(
            ITEMS.concat(CLASS_ITEMS[player.class] || []).filter((item: Item) => !exclude[item.name] && item.type === ITEM_TYPES.EQUIPMENT)
        );
        const items = itemPool.slice(0, BASE_VENDOR_ITEMS);
        const upgradedStarterItem = STARTER_ITEM_UPGRADE_MAP[player.class];
        items.push(...[mesoItem, bigMesoItem, hugeMesoItem]);
        if (upgradedStarterItem && playerItems.every((item) => item.name !== upgradedStarterItem.name)) {
            items.push(upgradedStarterItem);
        }
        setVendorItems(items);
    }, []);

    useEffect(() => {
        // Only equipment is available to trade. Trading Post also does not want the upgraded version of the starter item.
        setPlayerItems(
            player.items.filter(
                (item: Item) => item.type === ITEM_TYPES.EQUIPMENT && item.name !== STARTER_ITEM_UPGRADE_MAP[player.class]?.name
            )
        );
    }, [tradesRemaining]);

    const handleTrade = () => {
        if (!selectedPlayerItem || !selectedVendorItem) {
            return;
        }
        setTradesRemaining((prev) => prev - 1);
        setVendorItems((prev) => prev.filter((p) => p.name !== selectedVendorItem.name));
        setSelectedPlayerItem(null);
        setSelectedVendorItem(null);
        onTrade({ playerItem: selectedPlayerItem, forItem: selectedVendorItem });
    };

    const onClickPlayerItem = (item: Item) => {
        if (selectedPlayerItem?.name === item.name) {
            setSelectedPlayerItem(null);
            return;
        }

        if (canPlayerItemBeExchanged(item)) {
            setSelectedPlayerItem(item);
        }
    };

    const onClickVendorItem = (item: Item) => {
        if (selectedVendorItem?.name === item.name) {
            setSelectedVendorItem(null);
            return;
        }

        if (canVendorItemBeExchanged(item)) {
            setSelectedVendorItem(item);
        }
    };

    const offerElement = (item: Item, isPlayerItem: boolean) => {
        if (!item) {
            return <div className={classes.itemPlaceholder}>None yet</div>;
        }

        const onClick = () => {
            if (isPlayerItem) {
                setSelectedPlayerItem(null);
            } else {
                setSelectedVendorItem(null);
            }
        };
        return <ItemView item={item} onClick={onClick} />;
    };

    // Items without a rarity specified are always common.
    const getRarity = (item: Item): RARITIES => {
        return item?.rarity || RARITIES.COMMON;
    };

    const RARITY_CHART = {
        [RARITIES.RARE]: 3,
        [RARITIES.UNCOMMON]: 2,
        [RARITIES.COMMON]: 1,
    };

    const canVendorItemBeExchanged = (item: Item) => {
        if (!tradesRemaining) {
            return false;
        }
        if (!selectedPlayerItem) {
            return true;
        }

        // You can trade for an equivalent rarity item or down one rarity.
        return (
            getRarity(item) === getRarity(selectedPlayerItem) ||
            RARITY_CHART[getRarity(selectedPlayerItem)] - RARITY_CHART[getRarity(item)] === 1
        );
    };

    const canPlayerItemBeExchanged = (item) => {
        if (!tradesRemaining) {
            return false;
        }
        if (!selectedVendorItem) {
            return true;
        }

        // You can trade for an equivalent rarity item or down one rarity.
        return (
            getRarity(item) === getRarity(selectedVendorItem) ||
            RARITY_CHART[getRarity(item)] - RARITY_CHART[getRarity(selectedVendorItem)] === 1
        );
    };

    return (
        <div className={classes.tradingPostRoot}>
            <div className={classes.titleContainer}>
                <h2>Trading Post</h2>
            </div>
            <div className={classes.doneContainer}>
                <Button color="secondary" variant="contained" onClick={onExit}>
                    Leave Shop
                </Button>
            </div>
            <div>
                <div className={classes.offerContainer}>
                    <p>Your offer</p>
                    {offerElement(selectedPlayerItem, true)}
                </div>
                <div className={classes.offerContainer}>
                    <p>To be exchanged for</p>
                    {offerElement(selectedVendorItem, false)}
                </div>
            </div>
            <span className={classes.tradesRemainingLabel}>Trades remaining: {tradesRemaining}</span>
            {tradesRemaining > 0 && (
                <Button color="primary" disabled={!selectedPlayerItem || !selectedVendorItem} onClick={handleTrade}>
                    Trade
                </Button>
            )}
            <div className={classes.flex}>
                <div className={classes.itemsContainer}>
                    <h4>Your Items</h4>
                    {playerItems.map((item: Item) => (
                        <div
                            className={classNames(classes.itemContainer, {
                                [classes.disable]: !canPlayerItemBeExchanged(item),
                                [classes.highlight]: selectedPlayerItem?.name === item.name,
                            })}
                            key={item.name}
                        >
                            <ItemView item={item} onClick={() => onClickPlayerItem(item)} />
                        </div>
                    ))}
                </div>
                <div className={classes.itemsContainer}>
                    <h4>Trading Post Items</h4>
                    {vendorItems.map((item: Item) => (
                        <div
                            className={classNames(classes.itemContainer, {
                                [classes.disable]: !canVendorItemBeExchanged(item),
                                [classes.highlight]: selectedVendorItem?.name === item.name,
                            })}
                            key={item.name}
                        >
                            <ItemView item={item} onClick={() => onClickVendorItem(item)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TradingPost;

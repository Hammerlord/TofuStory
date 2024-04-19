import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { playerStateSlice } from "../character/playerReducer";
import { Player } from "../character/types";
import { COMMON_STYLES } from "../constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import Icon from "../icon/Icon";
import { KerningTowerImage, MoonBunnyImage } from "../images";
import ItemView from "../item/ItemView";
import { STARTER_ITEM_UPGRADE_MAP } from "../item/starterItems";
import { ITEM_TYPES, Item, RARITIES } from "../item/types";
import { TOWNS } from "../map/types";
import Button from "../view/Button";
import Tooltip from "../view/Tooltip";
import LeaveButton from "./LeaveButton";
import { NUM_TRADING_POST_TRADES } from "./constants";
import { generateTradingPostInventory } from "./tradingPostUtils";

const HEADER_BAR = 72;

const useStyles = createUseStyles({
    ...COMMON_STYLES,
    tradingPostRoot: {
        color: "white",
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        paddingTop: HEADER_BAR,
        bottom: 0,
        maxHeight: `calc(100% - ${HEADER_BAR}px)`,
        background: "rgba(30, 30, 30, 0.99)",
        textAlign: "center",
    },
    tradingPostBackdrop: {
        width: "100%",
        minHeight: "300px",
        background: `url(${KerningTowerImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        position: "fixed",
        top: 519,
        zIndex: -1,
        opacity: 0.2,
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
        padding: "0 96px",
        margin: 8,
        color: "white",
        marginBottom: "24px",
        minWidth: 400,
    },
    characterContainer: {
        height: "100px",
        position: "relative",
        pointerEvents: "none",

        "& img": {
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
        },
    },
    flex: {
        display: "flex",
        justifyContent: "space-around",
    },
    offerSection: {
        minHeight: 275,
    },
    offerContainer: {
        margin: 8,
        display: "inline-block",
    },
    itemsColumn: {
        width: "45%",
        marginTop: -64,
    },
    itemsContainer: {
        overflowY: "scroll",
        maxHeight: "55vh",
    },
    itemContainer: {
        display: "inline-block",
        margin: 8,
        minHeight: 200,
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
        margin: "9px 16px",
        display: "inline-block",
        verticalAlign: "bottom",
    },
    columnLabel: {
        textShadow: Array.from({ length: 5 })
            .map(() => "0 0 3px black")
            .join(", "),
    },
});

const { acquireItems, loseItems, updateTownShop } = playerStateSlice.actions;

// At the trading post, players can exchange one of their items for an item of equivalent or lower rarity,
// or exchange their starter equipment for an upgraded version of their starter equipment.
const TradingPostView = ({
    player,
    onTrade,
    onExit,
    vendorItems: initVendorItems,
    tradesRemaining = 2,
}: {
    player: Player;
    onTrade;
    vendorItems: Item[];
    tradesRemaining: number;
    onExit?: () => void;
}) => {
    const [vendorDialog, setVendorDialog] = useState("");
    const classes = useStyles();
    const upgradedStarterItem = STARTER_ITEM_UPGRADE_MAP[player.class];
    const starterItem = player.items.find((item) => item.rarity === RARITIES.STARTER);
    const [selectedPlayerItem, setSelectedPlayerItem] = useState(null);
    const [selectedVendorItem, setSelectedVendorItem] = useState(null);
    const isSelectedUpgradedStarter = selectedVendorItem?.name === upgradedStarterItem?.name;
    const dialogMemo = useRef([]);

    const playerItems = player.items.filter(
        (item: Item) =>
            item.type === ITEM_TYPES.EQUIPMENT &&
            item.rarity !== RARITIES.STARTER &&
            item.name !== STARTER_ITEM_UPGRADE_MAP[player.class]?.name
    );
    // If the player acquired new equipment prior to a revisit, those equipments should not be in the inventory
    const alreadyObtained = player.items.reduce((acc, item: Item) => {
        if (item.type === ITEM_TYPES.EQUIPMENT) {
            acc[item.name] = true;
        }
        return acc;
    }, {});

    const vendorItems = initVendorItems.filter((item) => {
        return !alreadyObtained[item.name];
    });

    useEffect(() => {
        const getDialog = () => {
            if (!selectedPlayerItem && !selectedVendorItem) {
                if (tradesRemaining === NUM_TRADING_POST_TRADES) {
                    const greeting = "Hello, stranger. Got something to trade?";
                    if (dialogMemo.current.includes(greeting)) {
                        return "Change your mind? Hehe... it's no problem. Take your time.";
                    }

                    dialogMemo.current.push(greeting);
                    return greeting;
                }

                if (tradesRemaining === 0) {
                    return "Hehe, thank you for your business.";
                }

                return "Well struck. Anything else catch your eye?";
            }

            if (!selectedVendorItem) {
                if (selectedPlayerItem.rarity === RARITIES.STARTER) {
                    return "Hmmm, that item. It seems to be resonating with something of mine.";
                }

                if (selectedPlayerItem.rarity === RARITIES.RARE) {
                    return "Oh, what a fine item. I'll offer you my best wares. Or... something else, if you want.";
                }

                if (vendorItems.some(canVendorItemBeExchanged)) {
                    return "Yes, I'll take it. Here's what I'll offer.";
                }

                return "Hmm... offer another item, perhaps.";
            }

            if (!selectedPlayerItem) {
                if (isSelectedUpgradedStarter) {
                    return "Oh, this? I've had it for a long time. It seems to be... resonating with something you own.";
                }

                // These are always mesos
                if (selectedVendorItem.type === ITEM_TYPES.CONSUMABLE) {
                    return "Yes, I've got coin! Now, have you wares?";
                }

                if (selectedVendorItem.rarity === RARITIES.RARE) {
                    return "You have a keen eye for quality. I'll require an equally fine ware, though...";
                }

                if (playerItems.some(canPlayerItemBeExchanged)) {
                    return "Here's what I'll accept for that.";
                }

                return "I'm afraid there's nothing I'd like to trade for this item.";
            }

            if (selectedPlayerItem.rarity === RARITIES.STARTER) {
                return "Ah! Can you feel that magnetism?";
            }
            return "Well then, shall we settle the deal?";
        };
        setVendorDialog(getDialog());

        const timeout = setTimeout(() => {
            setVendorDialog("");
        }, 5000);
        return () => clearTimeout(timeout);
    }, [selectedPlayerItem, selectedVendorItem]);

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
            return <div className={classes.itemPlaceholder}>{isPlayerItem ? "Your offer" : "Trading Post offer"}</div>;
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

    const handleClickExit = () => {
        setSelectedPlayerItem(null);
        setSelectedVendorItem(null);
        onExit && onExit();
    };

    const handleTrade = () => {
        setSelectedPlayerItem(null);
        setSelectedVendorItem(null);
        onTrade({ selectedPlayerItem, selectedVendorItem });
    };

    return (
        <div className={classes.tradingPostRoot}>
            <div className={classes.tradingPostBackdrop} />
            <div className={classes.titleContainer}>
                <h2>Trading Post</h2>
            </div>
            <div className={classes.doneContainer}>
                <LeaveButton onClick={handleClickExit} />
            </div>
            <div className={classes.offerSection}>
                <div className={classes.offerContainer}>{offerElement(selectedPlayerItem, true)}</div>
                <div className={classes.offerContainer}>{offerElement(selectedVendorItem, false)}</div>
                {isSelectedUpgradedStarter && (
                    <div>
                        {selectedVendorItem?.name} replaces {<Icon icon={starterItem.image} size="sm" />} {starterItem?.name}.
                    </div>
                )}
            </div>
            <span className={classes.tradesRemainingLabel}>Trades remaining: {tradesRemaining}</span>
            {tradesRemaining > 0 && (
                <span
                    className={classNames({
                        [classes.highlightAnimation]: selectedPlayerItem && selectedVendorItem,
                    })}
                >
                    <Button color="primary" disabled={!selectedPlayerItem || !selectedVendorItem} onClick={handleTrade}>
                        Trade
                    </Button>
                </span>
            )}
            <div className={classes.flex}>
                <div className={classes.itemsColumn}>
                    <div className={classes.characterContainer}>
                        <img src={player.image} alt="Player character" />
                    </div>
                    <h4 className={classes.columnLabel}>Your Items</h4>
                    <div className={classes.itemsContainer}>
                        {playerItems.map((item: Item) => (
                            <div
                                className={classNames(classes.itemContainer, {
                                    [classes.disable]: !canPlayerItemBeExchanged(item),
                                    [classes.highlight]: selectedPlayerItem?.name === item.name,
                                })}
                                key={item.name}
                            >
                                <ItemView item={item} onClick={() => onClickPlayerItem(item)} playerClass={player.class} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={classes.itemsColumn}>
                    <Tooltip title={vendorDialog} open={Boolean(vendorDialog)} placement="top">
                        <div className={classes.characterContainer}>
                            <img src={MoonBunnyImage} alt="Trading Post Vendor" />
                        </div>
                    </Tooltip>
                    <h4 className={classes.columnLabel}>Trading Post Items</h4>
                    <div className={classes.itemsContainer}>
                        {vendorItems.map((item: Item) => (
                            <div
                                className={classNames(classes.itemContainer, {
                                    [classes.disable]: !canVendorItemBeExchanged(item),
                                    [classes.highlight]: selectedVendorItem?.name === item.name,
                                })}
                                key={item.name}
                            >
                                <ItemView item={item} onClick={() => onClickVendorItem(item)} playerClass={player.class} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TradingPost = ({ onExit, town }: { onExit?: () => void; town?: TOWNS }) => {
    const { player, townShops } = useAppSelector((state) => state).character;
    const [tradesRemaining, setTradesRemaining] = useState(NUM_TRADING_POST_TRADES);
    const [vendorItems, setVendorItems] = useState(generateTradingPostInventory(player));
    const townTradingPost = townShops[town]?.tradingPost;

    const dispatch = useAppDispatch();

    const handleTrade = ({ selectedPlayerItem, selectedVendorItem }) => {
        if (!selectedPlayerItem || !selectedVendorItem) {
            return;
        }
        if (townTradingPost) {
            dispatch(
                updateTownShop({
                    town,
                    shopKey: "tradingPost",
                    shopState: {
                        numTradesRemaining: townTradingPost.numTradesRemaining - 1,
                        items: townTradingPost.items.filter((p) => p.name !== selectedVendorItem.name),
                    },
                })
            );
        } else {
            setTradesRemaining((prev) => prev - 1);
            setVendorItems((prev) => prev.filter((p) => p.name !== selectedVendorItem.name));
        }

        dispatch(loseItems([selectedPlayerItem.name]));
        dispatch(acquireItems([selectedVendorItem]));
    };

    return (
        <TradingPostView
            onExit={onExit}
            onTrade={handleTrade}
            player={player}
            vendorItems={townTradingPost?.items || vendorItems}
            tradesRemaining={townTradingPost ? townTradingPost.numTradesRemaining : tradesRemaining}
        />
    );
};

export default TradingPost;

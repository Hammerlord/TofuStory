import classNames from "classnames";
import { clamp } from "ramda";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import RarityTag from "../ability/AbilityView/RarityTag";
import { Ability } from "../ability/types";
import { getMaxHP } from "../battle/utils";
import { ShopState, playerStateSlice } from "../character/playerReducer";
import { Player } from "../character/types";
import { useAppDispatch, useAppSelector } from "../hooks";
import { MesoCoinImage } from "../images";
import ItemView from "../item/ItemView";
import { ITEM_TYPES, Item } from "../item/types";
import { TOWNS } from "../map/types";
import Button from "../view/Button";
import LeaveButton from "./LeaveButton";
import { generateShopInventory, getShopCustomerProperties } from "./shopUtils";
import { CONSUMABLE_COST_MULTIPLIER, CONSUMABLE_MULTIPLIER_MAX } from "./constants";

const HEADER_BAR = 72;

const useStyles = createUseStyles({
    root: {
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        paddingTop: HEADER_BAR,
        bottom: 0,
        maxHeight: `calc(100% - ${HEADER_BAR}px)`,
        background: "rgba(40, 40, 40, 0.95)",
        overflowY: "scroll",
    },
    inner: {
        position: "absolute",
        maxHeight: `calc(100% - ${HEADER_BAR * 2}px)`,
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
        width: "100%",
        padding: "64px 0",
        "& .selected": {
            filter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
        },
    },
    titleContainer: {
        display: "inline-block",
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        padding: "8px 96px",
        color: "white",
        marginBottom: "24px",
    },
    mesoBag: {
        width: "32px",
        marginRight: 8,
        verticalAlign: "bottom",
    },
    container: {
        margin: "40px 0",
        verticalAlign: "top",
    },
    ability: {
        verticalAlign: "bottom",
        borderRadius: 4,
    },
    item: {
        verticalAlign: "bottom",
        borderRadius: 8,
    },
    abilitiesSection: {
        marginBottom: "24px",
    },
    abilityContainer: {
        display: "inline-block",
        minHeight: "400px",
        verticalAlign: "bottom",
        margin: 16,
    },
    itemContainer: {
        display: "inline-block",
        minHeight: "300px",
        verticalAlign: "bottom",
        margin: "4 8",
    },
    priceContainer: {
        textAlign: "center",
        color: "white",
        margin: "12px 0",
    },
    priceContainerInner: {
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        padding: "4px 0",
        maxWidth: "150px",
        margin: "auto",
    },
    priceLabel: {
        marginLeft: 4,
        display: "inline-block",
        verticalAlign: "top",
    },
    doneContainer: {
        position: "absolute",
        right: "32px",
        paddingTop: "32px",
    },
    cannotAfford: {
        filter: "saturate(0%)",
        color: "rgba(200, 200, 200, 0.8)",
    },
    refreshText: {
        color: "rgb(240, 240, 240)",
        marginRight: "16px",
    },
    refreshContainer: {
        height: "40px",
    },
    abilityColumn: {
        maxWidth: 850,
    },
    column: {
        width: "45%",
        display: "inline-block",
        verticalAlign: "top",
    },
    sectionHeader: {
        display: "flex",
        color: "white",
        padding: "16 200",
        "& hr": {
            borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
            width: "50%",
        },
    },
    free: {
        color: "#25b814",
        fontWeight: "bold",
    },
    headerText: {
        padding: "0 24",
        fontSize: 18,
    },
    abilityPlaceholder: {
        width: 168,
    },
    itemPlaceholder: {
        width: 232,
        height: 150,
    },
});

const { updateTownShop, updateMesos, updatePlayer, updateDeck, acquireItems, onPurchaseConsumable, refreshTownItemShop } =
    playerStateSlice.actions;

const ShopView = ({
    onBuyItem,
    onExit,
    shopState,
    onUpdateShopState,
    onRefresh,
}: {
    onBuyItem: ({
        items,
        mesosSpent,
        type,
    }: {
        items: Item[] | Ability[];
        mesosSpent: number;
        type: "item" | "ability";
        statChanges?: { maxHP?: number; HP?: number };
    }) => void;
    onExit?: () => void; // MUST be provided to get the button to leave the shop
    shopState: ShopState;
    onUpdateShopState: (updatedConfig: { [key in keyof ShopState]?: ShopState[key] }) => void;
    onRefresh: () => void;
}) => {
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const { player, purchasedConsumables } = useAppSelector((state) => state).character;
    const { abilities, items: initialItems, usedFreeFood = 0, usedNumRefreshes = 0 } = shopState;
    const dispatch = useAppDispatch();

    // Items like Tofu Special and Shopper's Club Membership should take effect if bought. So regenerate the 'shop customer properties'.
    const shopOptions = getShopCustomerProperties(player);

    const { discount = 0, numRefreshes: initRefreshes = 0, freeFood: initFreeFood = 0 } = shopOptions;
    const freeFood = initFreeFood - usedFreeFood;
    const numRefreshes = initRefreshes - usedNumRefreshes;

    const applyDiscount = (price: number) => {
        return Math.max(0, price - Math.floor(discount * price));
    };

    const getFinalConsumableItemPrice = (item: Item, initPrice: number): number => {
        let price = applyDiscount(initPrice);
        const timesMultiplier = Math.min(CONSUMABLE_MULTIPLIER_MAX, purchasedConsumables[item.name] || 0);
        Array.from({ length: timesMultiplier }).forEach(() => (price *= CONSUMABLE_COST_MULTIPLIER));
        return Math.ceil(price);
    };

    // If the player acquired new equipment prior to a revisit, those equipments should not be in the shop inventory
    const alreadyObtained = player.items.reduce((acc, item: Item) => {
        if (item.type === ITEM_TYPES.EQUIPMENT) {
            acc[item.name] = true;
        }
        return acc;
    }, {});

    const items = initialItems.map((item) => {
        if (!item || !alreadyObtained[item.item?.name]) {
            return item;
        }

        return null;
    });

    const buy = () => {
        if (abilities[selectedAbilityIndex]) {
            const { price: initPrice, item } = abilities[selectedAbilityIndex];
            const price = applyDiscount(initPrice);
            if (player.mesos >= price) {
                onBuyItem({ items: [item], mesosSpent: price, type: "ability" });
                const updatedAbilities = abilities.slice();
                updatedAbilities[selectedAbilityIndex] = null;
                onUpdateShopState({ abilities: updatedAbilities });
                setSelectedAbilityIndex(null);
            }
            return;
        }

        if (items[selectedItemIndex]) {
            const { price: initPrice, item, isConsumable, isFood, statChanges } = items[selectedItemIndex];
            const price = getFinalConsumableItemPrice(item, initPrice);

            if (isFood) {
                if (freeFood) {
                    onUpdateShopState({ usedFreeFood: usedFreeFood + 1 });
                    if (statChanges) {
                        onBuyItem({ items: [], mesosSpent: 0, type: "item", statChanges });
                    } else {
                        onBuyItem({ items: [item], mesosSpent: 0, type: "item" });
                    }
                } else {
                    if (statChanges) {
                        onBuyItem({ items: [], mesosSpent: price, type: "item", statChanges });
                    } else {
                        onBuyItem({ items: [item], mesosSpent: price, type: "item" });
                    }
                }

                setSelectedItemIndex(null);
                return;
            }

            if (isConsumable) {
                // Else an incense or golden hammer was bought. These are not removed from the shop when bought, but they do become more expensive.
                onBuyItem({ items: [item], mesosSpent: price, type: "item" });
                dispatch(onPurchaseConsumable(item.name));
                setSelectedItemIndex(null);
                return;
            }

            onBuyItem({ items: [item], mesosSpent: price, type: "item" });
            const updatedItems = items.slice();
            updatedItems[selectedItemIndex] = null;
            onUpdateShopState({ items: updatedItems });
            setSelectedItemIndex(null);
        }
    };

    const classes = useStyles();

    const getShopAbility = (shopItem, i: number) => {
        if (!shopItem) {
            return <div className={classNames(classes.abilityContainer, classes.abilityPlaceholder)} key={i} />;
        }

        const { item, price } = shopItem;
        return (
            <div className={classes.abilityContainer} key={[item.name, i].join("-")}>
                <RarityTag rarity={item.rarity} />
                <div
                    className={classNames(classes.ability, {
                        selected: i === selectedAbilityIndex,
                    })}
                    onClick={() => {
                        if (player.mesos >= price) {
                            setSelectedAbilityIndex(i);
                            setSelectedItemIndex(null);
                        }
                    }}
                >
                    <AbilityView ability={item} />
                </div>
                <div className={classes.priceContainer}>
                    <div
                        className={classNames(classes.priceContainerInner, {
                            [classes.cannotAfford]: player.mesos < price,
                        })}
                    >
                        <img src={MesoCoinImage} alt={"Mesos"} />
                        <span className={classes.priceLabel}>{price}</span>
                    </div>
                </div>
                {i === selectedAbilityIndex && (
                    <div>
                        <Button color={"primary"} onClick={buy}>
                            Buy
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const getShopItem = (shopItem, i: number) => {
        if (!shopItem) {
            return <div className={classNames(classes.itemContainer, classes.itemPlaceholder)} key={i} />;
        }

        const { item, price: initPrice, isFood } = shopItem;
        const price = getFinalConsumableItemPrice(item, initPrice);

        return (
            <div className={classes.itemContainer} key={[item.name, i].join("-")}>
                <div
                    className={classNames(classes.item, {
                        selected: i === selectedItemIndex,
                    })}
                    onClick={() => {
                        if (player.mesos >= price) {
                            setSelectedAbilityIndex(null);
                            setSelectedItemIndex(i);
                        }
                    }}
                >
                    <ItemView item={item} playerClass={player.class} />
                </div>
                <div className={classes.priceContainer}>
                    <div
                        className={classNames(classes.priceContainerInner, {
                            [classes.cannotAfford]: (!isFood || !freeFood) && player.mesos < price,
                        })}
                    >
                        {isFood && Boolean(freeFood) && <span className={classes.free}>FREE</span>}
                        {(!isFood || !freeFood) && (
                            <>
                                <img src={MesoCoinImage} alt={"Mesos"} />
                                <span className={classes.priceLabel}>{price}</span>
                            </>
                        )}
                    </div>
                </div>
                {i === selectedItemIndex && (
                    <div>
                        <Button color={"primary"} onClick={buy}>
                            Buy
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const handleExitClick = () => {
        onExit();
        setSelectedAbilityIndex(null);
        setSelectedItemIndex(null);
    };

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <div className={classes.doneContainer}>{onExit && <LeaveButton onClick={handleExitClick} />}</div>
                <div className={classes.refreshContainer}>
                    {numRefreshes > 0 && (
                        <>
                            <span className={classes.refreshText}>Refreshes remaining: {numRefreshes}</span>
                            <Button color={"secondary"} onClick={onRefresh}>
                                Refresh Shop
                            </Button>
                        </>
                    )}
                </div>

                <div className={classes.container}>
                    <div className={classNames(classes.column, classes.abilityColumn)}>
                        <div className={classes.sectionHeader}>
                            <hr />
                            <span className={classes.headerText}>Abilities</span>
                            <hr />
                        </div>
                        <div className={classes.abilitiesSection}>{abilities.map(getShopAbility)}</div>
                    </div>
                    <div className={classes.column}>
                        <div className={classes.sectionHeader}>
                            <hr />
                            <span className={classes.headerText}>Items</span>
                            <hr />
                        </div>
                        {items.map(getShopItem)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Shop = ({ town, ...other }: { town?: TOWNS; onExit?: () => void }) => {
    const { deck, player, townShops } = useAppSelector((state) => state).character;

    // Only used if `town` is not supplied, for temporary merchant shops not found in town
    const [shopState, setShopState] = useState({ ...generateShopInventory({ player }), usedFreeFood: 0, usedNumRefreshes: 0 });

    const shopStateRedux = townShops?.[town]?.shop;
    const dispatch = useAppDispatch();

    const handleRefresh = () => {
        if (shopStateRedux) {
            dispatch(refreshTownItemShop(town));
        } else {
            setShopState((prev) => ({ ...prev, ...generateShopInventory({ player }), usedNumRefreshes: prev.usedNumRefreshes + 1 }));
        }
    };

    const handleBuyItem = ({ items, mesosSpent, type, statChanges }) => {
        const { maxHP = 0, HP = 0 } = statChanges || {};
        const effectiveMaxHP = getMaxHP(player) + maxHP;
        const newHP = clamp(0, effectiveMaxHP, player.HP + HP);
        dispatch(updateMesos(-mesosSpent));
        dispatch(
            updatePlayer({
                HP: newHP,
                maxHP: player.maxHP + maxHP,
            })
        );

        if (type === "ability") {
            dispatch(updateDeck([...(items as Ability[]), ...deck]));
            return;
        }

        if (type === "item") {
            dispatch(acquireItems(items as Item[]));
        }
    };

    const handleUpdateShopState = (obj) => {
        if (shopStateRedux) {
            dispatch(updateTownShop({ town, shopKey: "shop", shopState: obj }));
        } else {
            setShopState((prev) => ({ ...prev, ...obj }));
        }
    };

    return (
        <ShopView
            {...other}
            shopState={shopStateRedux || shopState}
            onRefresh={handleRefresh}
            onUpdateShopState={handleUpdateShopState}
            onBuyItem={handleBuyItem}
        />
    );
};

export default Shop;

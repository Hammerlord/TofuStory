import classNames from "classnames";
import { clamp } from "ramda";
import { useRef, useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import RarityTag from "../ability/AbilityView/RarityTag";
import { Ability } from "../ability/types";
import { getMaxHP } from "../battle/utils";
import {
    playFadeInAnimation,
    playFadeOutAnimation,
    copyComputedStyles,
} from "../character/animations";
import { ShopState, playerStateSlice } from "../character/playerReducer";
import { HEADER_BAR } from "../constants";
import { CARD_SELECTION_KEYBINDS, useCardSelection } from "../hooks/useCardSelection";
import { useAppDispatch, useAppSelector } from "../hooks";
import { MesoBagImage, MesoCoinImage } from "../images";
import ItemView from "../item/ItemView";
import { ITEM_TYPES, Item } from "../item/types";
import { TOWNS } from "../map/types";
import Button from "../view/Button";
import KeyboardReticle from "../view/KeyboardReticle";
import LeaveButton from "./LeaveButton";
import { OnBuyItem, SHOP_REFRESH_COST, ShopAbility, ShopItem } from "./constants";
import { generateShopInventory, getShopCustomerProperties, rollShopItem } from "./shopUtils";
import {
    confirmButtonDropStyle,
    panelKeyframes,
    CARD_ANIMATION_MS,
    CARD_ANIMATION_DELAY_MS,
} from "../Menu/panelAnimation";

const MESO_BAG_NATIVE_SIZE = 23;
const MESO_BAG_SCALE = 2;
const ITEM_FADE_OUT_MS = 250;
const BAG_DROP_MS = 400; // time for the bag to fade in and descend into place
const BAG_HOLD_MS = 400; // how long the bag sits on the item before fading away
const BAG_FADE_OUT_MS = 300;
const BAG_START_SHIFT_PX = 50; // the bag starts this many px above the item, then drops down

const RETURNING_ITEM_FADE_OUT_MS = 120;
const RETURNING_ITEM_FADE_IN_MS = 150;
const RETURNING_BAG_DROP_MS = 250;
const RETURNING_BAG_HOLD_MS = 200;
const RETURNING_BAG_FADE_OUT_MS = 200;
const RETURNING_BAG_START_SHIFT_PX = 30;

const useStyles = createUseStyles({
    ...panelKeyframes,
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
    shopObjectContainer: {
        position: "relative",
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
        margin: "16px",
    },
    itemContainer: {
        display: "inline-block",
        minHeight: "300px",
        verticalAlign: "bottom",
        margin: "4px 8px",
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
        marginLeft: "4px",
        display: "inline-block",
        verticalAlign: "top",
    },
    doneContainer: {
        position: "absolute",
        right: "32px",
        paddingTop: "32px",
    },
    confirmContainer: {
        minHeight: 38,
        marginBottom: 16,
        ...confirmButtonDropStyle,
    },
    cannotAfford: {
        filter: "saturate(0%)",
        color: "rgba(200, 200, 200, 0.8)",
    },
    refreshText: {
        color: "rgb(240, 240, 240)",
        marginRight: "16px",
        verticalAlign: "middle",
        lineHeight: "30px",
    },
    refreshMesos: {
        verticalAlign: "middle",
    },
    refreshContainer: {
        height: "40px",
    },
    abilityColumn: {
        maxWidth: "850px",
    },
    column: {
        width: "45%",
        display: "inline-block",
        verticalAlign: "top",
    },
    free: {
        color: "#25b814",
        fontWeight: "bold",
    },
    abilityPlaceholder: {
        width: "168px",
    },
    itemPlaceholder: {
        width: "232px",
        height: "150px",
    },
});

const {
    updateTownShop,
    updateMesos,
    updatePlayer,
    updateDeck,
    acquireItems,
    onPurchaseConsumable,
    refreshTownItemShop,
} = playerStateSlice.actions;

/**
 * A single purchasable slot of the shop. Abilities and items are shown in separate
 * columns, but the keyboard controls treat them as one list: the abilities first (in
 * their own slot order), then the items.
 */
type ShopEntry =
    | { type: "ability"; index: number; ability: ShopAbility }
    | { type: "item"; index: number; shopItem: ShopItem };

const getEntryId = (entry: ShopEntry): string => `${entry.type}:${entry.index}`;

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
    onUpdateShopState: (updatedConfig: {
        [key in keyof ShopState]?: ShopState[key];
    }) => void;
    onRefresh: (cost: number) => void;
}) => {
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const abilityRefs = useRef<(HTMLDivElement | null)[]>([]);
    const itemContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
    // Incremented every time the shop is refreshed so the entrance animation replays.
    const [refreshCount, setRefreshCount] = useState<number>(0);
    // The shop is only reachable once a player exists (after class selection).
    const player = useAppSelector((state) => state.character?.player)!;
    const { abilities, items: initialItems, usedFreeFood = 0, usedNumRefreshes = 0 } = shopState;
    const dispatch = useAppDispatch();

    // Items like Tofu Special and Shopper's Club Membership should take effect if bought. So regenerate the 'shop customer properties'.
    const shopOptions = getShopCustomerProperties(player);

    const {
        discount = 0,
        numRefreshes: initRefreshes = 0,
        freeFood: initFreeFood = 0,
    } = shopOptions;
    const hasFreeFood: boolean = initFreeFood - usedFreeFood > 0;
    const numRefreshes = initRefreshes - usedNumRefreshes;

    const applyDiscount = (price: number) => {
        return Math.max(0, price - Math.floor(discount * price));
    };

    const getFinalConsumableItemPrice = (item: Item, initPrice: number): number => {
        const price = applyDiscount(initPrice);
        return Math.ceil(price);
    };

    // If the player acquired new equipment prior to a revisit, re-roll those equipment
    // slots so the shop offers a fresh random item instead of already-obtained gear.
    const alreadyObtained = player.items.reduce<Record<string, boolean>>((acc, item: Item) => {
        if (item.type === ITEM_TYPES.EQUIPMENT) {
            acc[item.name] = true;
        }
        return acc;
    }, {});

    const [replacementItems] = useState<(ShopItem | null)[] | null>(() => {
        if (!initialItems.some((shopItem) => shopItem && alreadyObtained[shopItem.item.name])) {
            return null;
        }

        return initialItems.map((shopItem) => {
            if (!shopItem || !alreadyObtained[shopItem.item.name]) {
                return null;
            }

            const otherSoldItems = initialItems
                .filter((other) => other && other.item.name !== shopItem.item.name)
                .map((other) => other!.item);

            return rollShopItem({ player, excludeItems: otherSoldItems });
        });
    });

    const items = initialItems.map((shopItem, i) => {
        if (!shopItem || !alreadyObtained[shopItem.item.name]) {
            return shopItem;
        }

        return replacementItems?.[i] ?? null;
    });

    const getEntryPrice = (entry: ShopEntry): number => {
        return entry.type === "ability"
            ? applyDiscount(entry.ability.price)
            : getFinalConsumableItemPrice(entry.shopItem.item, entry.shopItem.price);
    };

    const canAffordEntry = (entry: ShopEntry | undefined): boolean => {
        if (!entry) {
            return false;
        }

        if (entry.type === "ability") {
            return player.mesos >= getEntryPrice(entry);
        }

        // Food is free while the player has a free food charge available.
        const { isFood } = entry.shopItem;
        return (isFood && hasFreeFood) || player.mesos >= getEntryPrice(entry);
    };

    const buyAbility = (index: number) => {
        const shopAbility = abilities[index];
        if (!shopAbility) {
            return;
        }

        const entry: ShopEntry = { type: "ability", index, ability: shopAbility };
        if (!canAffordEntry(entry)) {
            return;
        }

        const { price: initPrice, item } = shopAbility;
        const price = applyDiscount(initPrice);
        onBuyItem({ items: [item], mesosSpent: price, type: "ability" });

        const updatedAbilities = abilities.slice();
        updatedAbilities[index] = null;
        onUpdateShopState({ abilities: updatedAbilities });
    };

    const buyItem = (index: number) => {
        const shopItem = items[index];
        if (!shopItem) {
            return;
        }

        const entry: ShopEntry = { type: "item", index, shopItem };
        if (!canAffordEntry(entry)) {
            return;
        }

        const { price: initPrice, item, isConsumable, isFood, statChanges } = shopItem;
        const price = getFinalConsumableItemPrice(item, initPrice);

        if (isFood) {
            if (hasFreeFood) {
                onUpdateShopState({ usedFreeFood: usedFreeFood + 1 });
                if (statChanges) {
                    onBuyItem({ items: [], mesosSpent: 0, type: "item", statChanges });
                } else {
                    onBuyItem({ items: [item], mesosSpent: 0, type: "item" });
                }
            } else {
                if (statChanges) {
                    onBuyItem({
                        items: [],
                        mesosSpent: price,
                        type: "item",
                        statChanges,
                    });
                } else {
                    onBuyItem({ items: [item], mesosSpent: price, type: "item" });
                }
            }

            const returningItemElement = itemRefs.current[index];
            if (returningItemElement) {
                animateItemPurchase(returningItemElement, true);
            }
            return;
        }

        onBuyItem({ items: [item], mesosSpent: price, type: "item" });

        const itemElement = itemRefs.current[index];
        if (itemElement) {
            animateItemPurchase(itemElement, false);
        }

        const updatedItems = items.slice();
        updatedItems[index] = null;
        onUpdateShopState({ items: updatedItems });

        if (isConsumable) {
            dispatch(onPurchaseConsumable(item.name));
        }
    };

    const entries: ShopEntry[] = [
        ...abilities.flatMap((ability, index) =>
            ability ? [{ type: "ability" as const, index, ability }] : [],
        ),
        ...items.flatMap((shopItem, index) =>
            shopItem ? [{ type: "item" as const, index, shopItem }] : [],
        ),
    ];

    const buyEntry = (entry: ShopEntry | undefined) => {
        if (!entry) {
            return;
        }

        if (entry.type === "ability") {
            buyAbility(entry.index);
        } else {
            buyItem(entry.index);
        }

        resetSelection();
    };

    const {
        selectedIds,
        currentIndex,
        focusSource,
        handleCardClick,
        handleConfirm,
        resetSelection,
    } = useCardSelection<ShopEntry>({
        items: entries,
        maxAmount: 1,
        getId: getEntryId,
        isConfirmDisabled: (ids, focusedEntry) => !ids.length || !canAffordEntry(focusedEntry),
        onConfirm: (focusedEntry) => buyEntry(focusedEntry),
    });

    const focusedEntry = entries[currentIndex];

    const isEntryFocused = (entry: ShopEntry): boolean =>
        focusSource === "keyboard" &&
        focusedEntry?.type === entry.type &&
        focusedEntry.index === entry.index;

    const isEntrySelected = (entry: ShopEntry): boolean =>
        selectedIds.includes(getEntryId(entry)) && canAffordEntry(entry);

    const handleEntryClick = (entry: ShopEntry) => {
        const listIndex = entries.findIndex((other) => getEntryId(other) === getEntryId(entry));
        if (listIndex >= 0) {
            handleCardClick(entry, listIndex);
        }
    };

    const animateItemPurchase = (itemElement: HTMLElement, itemReturns: boolean) => {
        const rect = itemElement.getBoundingClientRect();

        const itemFadeOutMs = itemReturns ? RETURNING_ITEM_FADE_OUT_MS : ITEM_FADE_OUT_MS;
        const bagDropMs = itemReturns ? RETURNING_BAG_DROP_MS : BAG_DROP_MS;
        const bagHoldMs = itemReturns ? RETURNING_BAG_HOLD_MS : BAG_HOLD_MS;
        const bagFadeOutMs = itemReturns ? RETURNING_BAG_FADE_OUT_MS : BAG_FADE_OUT_MS;
        const bagStartShiftPx = itemReturns ? RETURNING_BAG_START_SHIFT_PX : BAG_START_SHIFT_PX;

        let clone: HTMLElement | null = null;

        if (itemReturns) {
            const fadeOut = playFadeOutAnimation({
                object: itemElement,
                playbackTime: itemFadeOutMs,
                fill: "both",
            });
            fadeOut.finished.then(() => {
                if (document.contains(itemElement)) {
                    playFadeInAnimation({
                        object: itemElement,
                        playbackTime: RETURNING_ITEM_FADE_IN_MS,
                        delay: bagDropMs + bagHoldMs + bagFadeOutMs,
                        fill: "both",
                    });
                }
            });
        } else {
            clone = itemElement.cloneNode(true) as HTMLElement;
            copyComputedStyles(itemElement, clone);
            Object.assign(clone.style, {
                position: "fixed",
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                margin: "0",
                zIndex: "9999",
                pointerEvents: "none",
            });
            document.body.appendChild(clone);
            playFadeOutAnimation({ object: clone, playbackTime: itemFadeOutMs, fill: "forwards" });
        }

        const bag = document.createElement("img");
        bag.src = MesoBagImage;
        const bagSize = MESO_BAG_NATIVE_SIZE * MESO_BAG_SCALE;
        Object.assign(bag.style, {
            position: "fixed",
            left: `${rect.left + rect.width / 2 - bagSize / 2}px`,
            top: `${rect.top + rect.height / 2 - bagSize / 2}px`,
            width: `${bagSize}px`,
            height: `${bagSize}px`,
            opacity: "0",
            pointerEvents: "none",
            zIndex: "9999",
        });
        document.body.appendChild(bag);

        const cleanup = () => {
            clone?.remove();
            bag.remove();
        };

        const bagDropIn = playFadeInAnimation({
            object: bag,
            shift: -bagStartShiftPx,
            playbackTime: bagDropMs,
            fill: "both",
        });

        bagDropIn.finished
            .then(() => {
                window.setTimeout(() => {
                    const bagFadeOut = playFadeOutAnimation({
                        object: bag,
                        playbackTime: bagFadeOutMs,
                        fill: "forwards",
                    });
                    bagFadeOut.finished.then(cleanup).catch(cleanup);
                }, bagHoldMs);
            })
            .catch(cleanup);
    };

    const classes = useStyles();

    useEffect(() => {
        const shopEntries = [...abilityRefs.current, ...itemContainerRefs.current];
        const animations = shopEntries
            .map((ref, index) => {
                if (!ref) {
                    return null;
                }
                return playFadeInAnimation({
                    object: ref,
                    delay: (index + 1) * CARD_ANIMATION_DELAY_MS,
                    playbackTime: CARD_ANIMATION_MS,
                    fill: "both",
                });
            })
            .filter((animation): animation is Animation => animation !== null);

        return () => {
            animations.forEach((animation) => animation.cancel());
        };
    }, [refreshCount]);

    const getShopAbility = (shopAbility: ShopAbility | null, i: number) => {
        if (!shopAbility) {
            return (
                <div
                    ref={(el) => {
                        abilityRefs.current[i] = el;
                    }}
                    className={classNames(classes.abilityContainer, classes.abilityPlaceholder)}
                    key={i}
                />
            );
        }

        const { item, price: initPrice } = shopAbility;
        const price = applyDiscount(initPrice);
        const entry: ShopEntry = { type: "ability", index: i, ability: shopAbility };
        const isSelected = isEntrySelected(entry);

        return (
            <div
                ref={(el) => {
                    abilityRefs.current[i] = el;
                }}
                className={classes.abilityContainer}
                key={[item.name, i].join("-")}
            >
                <RarityTag rarity={item.rarity} />
                <div className={classes.shopObjectContainer}>
                    <div
                        className={classNames(classes.ability, {
                            selected: isSelected,
                        })}
                        onClick={() => handleEntryClick(entry)}
                    >
                        <AbilityView ability={item} />
                    </div>
                    {isEntryFocused(entry) && <KeyboardReticle />}
                </div>
                <div className={classes.priceContainer}>
                    <div
                        className={classNames(classes.priceContainerInner, {
                            [classes.cannotAfford]: !canAffordEntry(entry),
                        })}
                    >
                        <img src={MesoCoinImage} alt={"Mesos"} />
                        <span className={classes.priceLabel}>{price}</span>
                    </div>
                </div>
                <div className={classes.confirmContainer} key={isSelected ? "show" : "hide"}>
                    {isSelected && (
                        <Button color={"primary"} onClick={handleConfirm}>
                            Buy
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const getShopItem = (shopItem: ShopItem | null, i: number) => {
        if (!shopItem) {
            return (
                <div
                    ref={(el) => {
                        itemContainerRefs.current[i] = el;
                    }}
                    className={classNames(classes.itemContainer, classes.itemPlaceholder)}
                    key={i}
                />
            );
        }

        const { item, isFood } = shopItem;
        const price = getFinalConsumableItemPrice(item, shopItem.price);
        const entry: ShopEntry = { type: "item", index: i, shopItem };
        const isSelected = isEntrySelected(entry);

        return (
            <div
                ref={(el) => {
                    itemContainerRefs.current[i] = el;
                }}
                className={classes.itemContainer}
                key={[item.name, i].join("-")}
            >
                <div className={classes.shopObjectContainer}>
                    <div
                        ref={(el) => {
                            itemRefs.current[i] = el;
                        }}
                        className={classNames(classes.item, {
                            selected: isSelected,
                        })}
                        onClick={() => handleEntryClick(entry)}
                    >
                        <ItemView item={item} playerClass={player.class} />
                    </div>
                    {isEntryFocused(entry) && <KeyboardReticle />}
                </div>
                <div className={classes.priceContainer}>
                    <div
                        className={classNames(classes.priceContainerInner, {
                            [classes.cannotAfford]: !canAffordEntry(entry),
                        })}
                    >
                        {isFood && hasFreeFood && <span className={classes.free}>FREE</span>}
                        {(!isFood || !hasFreeFood) && (
                            <>
                                <img src={MesoCoinImage} alt={"Mesos"} />
                                <span className={classes.priceLabel}>{price}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className={classes.confirmContainer} key={isSelected ? "show" : "hide"}>
                    {isSelected && (
                        <Button color={"primary"} onClick={handleConfirm}>
                            Buy
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const handleExitClick = () => {
        onExit?.();
        resetSelection();
    };

    const shopRefreshCost = numRefreshes > 0 ? 0 : SHOP_REFRESH_COST;

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <div className={classes.doneContainer}>
                    {onExit && <LeaveButton onClick={handleExitClick} />}
                </div>
                <div className={classes.refreshContainer}>
                    <span
                        className={classNames(classes.refreshText, {
                            [classes.cannotAfford]: player.mesos < shopRefreshCost,
                        })}
                    >
                        Refresh Shop for{" "}
                        {shopRefreshCost === 0 ? (
                            <span className={classes.free}>FREE</span>
                        ) : (
                            <>
                                <img
                                    src={MesoCoinImage}
                                    alt={"Mesos"}
                                    className={classes.refreshMesos}
                                />{" "}
                                {shopRefreshCost}
                            </>
                        )}
                    </span>
                    <Button
                        color={"secondary"}
                        onClick={() => {
                            onRefresh(shopRefreshCost);
                            setRefreshCount((count) => count + 1);
                            resetSelection();
                        }}
                        disabled={player.mesos < shopRefreshCost}
                    >
                        Refresh
                    </Button>
                </div>

                <div className={classes.container}>
                    <div className={classNames(classes.column, classes.abilityColumn)}>
                        <div className={classes.abilitiesSection}>
                            {abilities.map(getShopAbility)}
                        </div>
                    </div>
                    <div className={classes.column}>{items.map(getShopItem)}</div>
                </div>
            </div>
        </div>
    );
};

const Shop = ({ town, ...other }: { town?: TOWNS; onExit?: () => void }) => {
    const { deck, player: maybeNullPlayer, townShops } = useAppSelector((state) => state.character);
    // The shop can only be opened after a class has been selected, so a player always exists.
    const player = maybeNullPlayer!;

    // Only used if `town` is not supplied, for temporary merchant shops not found in town
    const [shopState, setShopState] = useState<ShopState>({
        ...generateShopInventory({ player, deck }),
        usedFreeFood: 0,
        usedNumRefreshes: 0,
    });

    const shopStateRedux = town ? townShops?.[town]?.shop : undefined;
    const dispatch = useAppDispatch();

    const handleRefresh = (cost: number) => {
        if (shopStateRedux) {
            dispatch(refreshTownItemShop(town!));
        } else {
            setShopState((prev) => ({
                ...prev,
                ...generateShopInventory({ player, deck }),
                usedNumRefreshes: prev.usedNumRefreshes + 1,
            }));
        }

        dispatch(updateMesos(-cost));
    };

    const handleBuyItem: OnBuyItem = ({ items, mesosSpent, type, statChanges }) => {
        const { maxHP = 0, HP = 0 } = statChanges || {};
        const effectiveMaxHP = getMaxHP(player) + maxHP;
        const newHP = clamp(0, effectiveMaxHP, player.HP + HP);
        dispatch(updateMesos(-mesosSpent));
        dispatch(
            updatePlayer({
                HP: newHP,
                maxHP: player.maxHP + maxHP,
            }),
        );

        if (type === "ability") {
            dispatch(updateDeck([...(items as Ability[]), ...deck]));
            return;
        }

        if (type === "item") {
            dispatch(acquireItems(items as Item[]));
        }
    };

    const handleUpdateShopState = (obj: { [key in keyof ShopState]?: ShopState[key] }) => {
        if (shopStateRedux) {
            dispatch(updateTownShop({ town: town!, shopKey: "shop", shopState: obj }));
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

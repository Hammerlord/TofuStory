import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import RarityTag from "../ability/AbilityView/RarityTag";
import { Ability } from "../ability/types";
import { Player } from "../character/types";
import { MesoCoinImage, NewYearRiceSoupImage, TofuImage } from "../images";
import ItemView from "../item/ItemView";
import { bigMesoItem, goldenHammer, hugeMesoItem, incense, mesoItem } from "../item/items";
import { Item, RARITIES } from "../item/types";
import { rollItemPool, rollRarity } from "../item/utils";
import { getRandomInt, getRandomItem, shuffle } from "../utils";
import Button from "../view/Button";
import { getUpgradeCard } from "../Menu/utils";
import { NEUTRAL_ABILITIES } from "../ability/neutralAbilities";
import { useShopConfig } from "./shopUtils";
import { OnBuyItem, ShopConfigProperties } from "./constants";

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

const ShopView = ({
    player,
    shopConfig,
    onExit,
}: {
    player: Player;
    shopConfig: ShopConfigProperties;
    onExit?: () => void; // MUST be provided to get the button to leave the shop
}) => {
    const {
        refresh,
        buy,
        selectedAbilityIndex,
        selectedItemIndex,
        setSelectedAbilityIndex,
        setSelectedItemIndex,
        numRefreshes,
        abilities,
        items,
        freeFood,
        applyDiscount,
    } = shopConfig;
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
        const price = applyDiscount(initPrice);

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
                        {isFood && freeFood && <span className={classes.free}>FREE</span>}
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
                <div className={classes.doneContainer}>
                    {onExit && (
                        <Button color="secondary" variant="contained" onClick={handleExitClick}>
                            Leave Shop
                        </Button>
                    )}
                </div>
                <div className={classes.refreshContainer}>
                    {numRefreshes > 0 && (
                        <>
                            <span className={classes.refreshText}>Refreshes remaining: {numRefreshes}</span>
                            <Button color={"secondary"} onClick={refresh}>
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

const Shop = ({
    shopConfig: injectShopConfig,
    ...other
}: {
    shopConfig?: ShopConfigProperties;
    player: Player;
    onBuyItem: OnBuyItem;
    onExit?: () => void;
}) => {
    const { player, onBuyItem } = other;
    const shopConfig = useShopConfig({ player, onBuyItem });

    if (injectShopConfig) {
        return <ShopView shopConfig={injectShopConfig} {...other} />;
    }

    return <ShopView shopConfig={shopConfig} {...other} />;
};

export default Shop;

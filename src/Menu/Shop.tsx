import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability } from "../ability/types";
import { MesoBagImage, MesoCoinImage, NewYearRiceSoupImage, TofuImage } from "../images";
import ItemView from "../item/ItemView";
import { bigMesoItem, goldenHammer, hugeMesoItem, incense, mesoItem } from "../item/items";
import { Item, RARITIES } from "../item/types";
import { rollItemPool, rollRarity } from "../item/utils";
import { getRandomInt, getRandomItem, shuffle } from "../utils";
import Button from "../view/Button";
import AbilityRarityTag from "../ability/AbilityView/RarityTag";
import { Player } from "../character/types";
import { getUpgradeCard } from "./utils";

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

    headerText: {
        padding: "0 24",
        fontSize: 18,
    },
});

const NUM_SHOP_ABILITIES = 8;
const NUM_SHOP_ITEMS = 8;

const ABILITIES_PRICE_RARITY_MAP = {
    [RARITIES.COMMON]: [50, 65],
    [RARITIES.UNCOMMON]: [90, 120],
    [RARITIES.RARE]: [140, 170],
};

const ITEMS_PRICE_RARITY_MAP = {
    [RARITIES.COMMON]: [60, 75],
    [RARITIES.UNCOMMON]: [130, 150],
    [RARITIES.RARE]: [180, 210],
};

const Shop = ({
    player,
    onBuyItem,
    merchant,
    onExit,
}: {
    player: Player;
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
    merchant?: { name: string };
    onExit: () => void;
}) => {
    const [abilities, setAbilities] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const [freeFood, setFreeFood] = useState(false);
    const [numRefreshes, setNumRefreshes] = useState(0);
    const [discount, setDiscount] = useState(0);
    const classes = useStyles();

    const refreshItems = (initDiscount) => {
        // Abilities
        const potentialAbilities = JOB_CARD_MAP[player.class].all.map((ability: Ability) => {
            if (JOB_CARD_MAP[player.class].starters.includes(ability) && ability.upgrades?.length > 0) {
                return getUpgradeCard(ability);
            }

            return ability;
        });

        const rolledAbilities = [];
        Array.from({ length: NUM_SHOP_ABILITIES }).forEach(() => {
            const selectedRarity = rollRarity({ player });
            const [filteredByRarity] = shuffle(potentialAbilities).filter((ability: Ability) => {
                const noDuplicate = rolledAbilities.every((choice) => choice.name !== ability.name);
                return (ability.rarity || RARITIES.COMMON) === selectedRarity && noDuplicate;
            });
            rolledAbilities.push(filteredByRarity);
        });

        const abilitiesForSale = rolledAbilities.map((ability: Ability) => {
            const priceRangeForRarity: [number, number] = ABILITIES_PRICE_RARITY_MAP[ability.rarity || RARITIES.COMMON] as [number, number];
            const price = getRandomInt(...priceRangeForRarity);
            return { price, item: ability };
        });

        setAbilities(abilitiesForSale);

        // Items
        const itemsRolledForSale = [];
        Array.from({ length: NUM_SHOP_ITEMS }).forEach(() => {
            const item = getRandomItem(
                rollItemPool({ player, excludeItems: [...itemsRolledForSale, mesoItem, bigMesoItem, hugeMesoItem] })
            );
            itemsRolledForSale.push(item);
        });

        const itemsForSale = itemsRolledForSale.map((item) => {
            const priceRangeForRarity: [number, number] = ITEMS_PRICE_RARITY_MAP[item.rarity || RARITIES.COMMON];
            const price = getRandomInt(...priceRangeForRarity);
            return { price, item, isConsumable: false, isFood: false };
        });

        const applyDiscount = (price) => {
            return Math.max(0, price - Math.floor(initDiscount * price));
        };

        const consumables = [
            {
                item: goldenHammer,
                price: applyDiscount(40),
                isConsumable: true,
                isFood: false,
            },
            {
                item: incense,
                price: applyDiscount(60),
                isConsumable: true,
                isFood: false,
            },
        ];

        itemsForSale.push(...consumables);

        const food = [
            {
                item: {
                    name: "Tofu",
                    image: TofuImage,
                    description: "Permanently increase max HP by 3.",
                },
                price: applyDiscount(50),
                isConsumable: true,
                isFood: true,
                statChanges: {
                    maxHP: 3,
                },
            },
            {
                item: {
                    name: "Tofu Soup",
                    image: NewYearRiceSoupImage,
                    description: "Restore 15 HP.",
                },
                price: applyDiscount(50),
                isConsumable: true,
                isFood: true,
                statChanges: {
                    HP: 15,
                },
            },
        ];

        itemsForSale.push(...food);
        setItems(itemsForSale);
    };

    useEffect(() => {
        // Set refreshes/discount from item effects
        const { totalRefreshes, totalDiscount, freeFood } = player.items.reduce(
            (acc, item: Item) => {
                const { refreshTimes = 0, discount = 0, freeFood } = item?.merchant || {};
                acc.totalRefreshes += refreshTimes;
                acc.totalDiscount += discount;
                if (freeFood) {
                    acc.freeFood = true;
                }
                return acc;
            },
            { totalRefreshes: 0, totalDiscount: 0, freeFood: false }
        );
        const cappedDiscount = Math.min(1, totalDiscount);
        refreshItems(cappedDiscount);
        setDiscount(cappedDiscount);
        setNumRefreshes(totalRefreshes);
        setFreeFood(freeFood);
    }, []);

    const handleBuyClick = () => {
        if (abilities[selectedAbilityIndex]) {
            const { price, item } = abilities[selectedAbilityIndex];
            if (player.mesos >= price) {
                onBuyItem({ items: [item], mesosSpent: price, type: "ability" });
                const updatedAbilities = abilities.slice();
                updatedAbilities.splice(selectedAbilityIndex, 1);
                setAbilities(updatedAbilities);
                setSelectedAbilityIndex(null);
            }
            return;
        }

        if (items[selectedItemIndex]) {
            const { price, item, isConsumable, isFood, statChanges } = items[selectedItemIndex];
            const canAfford = player.mesos >= price;
            if (!canAfford) {
                return;
            }

            if (isConsumable) {
                if (isFood) {
                    if (freeFood) {
                        setFreeFood(false);
                        onBuyItem({ items: [], mesosSpent: 0, type: "item", statChanges });
                    } else {
                        onBuyItem({ items: [], mesosSpent: price, type: "item", statChanges });
                    }

                    setSelectedItemIndex(null);
                    return;
                }

                // Else an incense or golden hammer was bought. These are not removed from the shop when bought, but they do become more expensive.
                onBuyItem({ items: [item], mesosSpent: price, type: "item" });
                const updatedItems = items.map((other) => {
                    if (other.item.name === item.name) {
                        return {
                            ...other,
                            price: Math.floor(price * 1.2),
                        };
                    }

                    return other;
                });
                setItems(updatedItems);
                setSelectedItemIndex(null);
                return;
            }

            onBuyItem({ items: [item], mesosSpent: price, type: "item" });
            const updatedItems = items.slice();
            updatedItems.splice(selectedItemIndex, 1);
            setItems(updatedItems);
            setSelectedItemIndex(null);
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <div className={classes.doneContainer}>
                    <Button color="secondary" variant="contained" onClick={onExit}>
                        Leave Shop
                    </Button>
                </div>
                <div className={classes.refreshContainer}>
                    {numRefreshes > 0 && (
                        <>
                            <span className={classes.refreshText}>Refreshes remaining: {numRefreshes}</span>
                            <Button
                                color={"secondary"}
                                onClick={() => {
                                    refreshItems(discount);
                                    setNumRefreshes((prev) => prev - 1);
                                }}
                            >
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
                        <div className={classes.abilitiesSection}>
                            {abilities.map(({ item, price }, i) => (
                                <div className={classes.abilityContainer} key={i}>
                                    <AbilityRarityTag ability={item} />
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
                                            <Button color={"primary"} onClick={handleBuyClick}>
                                                Buy
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={classes.column}>
                        <div className={classes.sectionHeader}>
                            <hr />
                            <span className={classes.headerText}>Items</span>
                            <hr />
                        </div>
                        {items.map(({ item, price, isFood }, i) => (
                            <div className={classes.itemContainer} key={i}>
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
                                    <ItemView item={item} />
                                </div>
                                <div className={classes.priceContainer}>
                                    <div
                                        className={classNames(classes.priceContainerInner, {
                                            [classes.cannotAfford]: (!isFood || !freeFood) && player.mesos < price,
                                        })}
                                    >
                                        {isFood && freeFood && <span>FREE</span>}
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
                                        <Button color={"primary"} onClick={handleBuyClick}>
                                            Buy
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;

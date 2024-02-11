import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability } from "../ability/types";
import { MesoBagImage, MesoCoinImage, NewYearRiceSoupImage, TofuImage } from "../images";
import ItemView from "../item/ItemView";
import { goldenHammer, incense } from "../item/items";
import { Item, RARITIES } from "../item/types";
import { rollItemPool } from "../item/utils";
import { getRandomInt, getRandomItem, shuffle } from "../utils";
import Button from "../view/Button";
import { SECONDARY_JOBS } from "./types";

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
        background: "rgba(40, 40, 40, 0.9)",
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
            WebkitFilter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
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
        minHeight: "360px",
        verticalAlign: "bottom",
        margin: 16,
    },
    itemContainer: {
        display: "inline-block",
        minHeight: "300px",
        verticalAlign: "bottom",
        margin: 16,
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
});

const Shop = ({
    player,
    onBuyItem,
    merchant,
    onExit,
}: {
    player: any;
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
    const [food, setFood] = useState([]);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const [selectedFoodIndex, setSelectedFoodIndex] = useState(null);
    const [freeFood, setFreeFood] = useState(false);
    const [numRefreshes, setNumRefreshes] = useState(0);
    const [discount, setDiscount] = useState(0);
    const classes = useStyles();

    const applyDiscount = (price) => {
        return Math.max(0, price - Math.floor(discount * price));
    };

    const createShopItems = ({
        items,
        numItems,
        priceMin,
        priceMax,
    }: {
        items: any[];
        numItems?: number;
        priceMin: number;
        priceMax: number;
    }): { item: any; price: number }[] => {
        return shuffle(items)
            .slice(0, numItems || items.length)
            .map((item) => ({ item, price: applyDiscount(getRandomInt(priceMin, priceMax)) }));
    };

    const refreshItems = () => {
        // Abilities
        const abilitiesForSale: { item: Ability; price: number }[] = [];
        const otherSecondaryJobs = Object.values(SECONDARY_JOBS[player.class]).filter((job) => job !== player.secondaryClass) || [];
        const otherSecondaryJobCards = otherSecondaryJobs.reduce(
            (acc: Ability[], job: string) => [...acc, ...JOB_CARD_MAP[job]],
            [] as Ability[]
        ) as Ability[];
        if (otherSecondaryJobCards.length) {
            abilitiesForSale.push({ item: getRandomItem(otherSecondaryJobCards), price: applyDiscount(getRandomInt(150, 170)) });
        }

        const firstJobAbilities = JOB_CARD_MAP[player.class].all.map((ability: Ability) => {
            if (JOB_CARD_MAP[player.class].starters.includes(ability) && ability.upgrades?.length > 0) {
                return ability.upgrades[0];
            }

            return ability;
        });
        const potentialAbilities = firstJobAbilities.concat(JOB_CARD_MAP[player.secondaryClass]?.all || []);
        abilitiesForSale.push(...createShopItems({ items: potentialAbilities, numItems: 6, priceMin: 100, priceMax: 125 }));
        // Use deck to determine which abilities have a higher chance to roll
        setAbilities(shuffle(abilitiesForSale));

        // Items
        const itemsRolledForSale = [];
        Array.from({ length: 4 }).forEach(() => {
            const item = getRandomItem(rollItemPool({ player, excludeItems: itemsRolledForSale }));
            itemsRolledForSale.push(item);
        });
        const rareItems = itemsRolledForSale.filter((item) => item.rarity === RARITIES.RARE);
        const uncommonItems = itemsRolledForSale.filter((item) => item.rarity === RARITIES.UNCOMMON);
        const commonItems = itemsRolledForSale.filter((item) => item.rarity === RARITIES.COMMON || !item.rarity);

        const itemsForSale = [
            ...createShopItems({
                items: commonItems,
                priceMin: 70,
                priceMax: 100,
            }),
            ...createShopItems({
                items: uncommonItems,
                priceMin: 120,
                priceMax: 150,
            }),
            ...createShopItems({
                items: rareItems,
                priceMin: 180,
                priceMax: 210,
            }),
            ...createShopItems({
                items: [incense, incense, goldenHammer, goldenHammer, goldenHammer],
                numItems: 2,
                priceMin: 80,
                priceMax: 100,
            }),
        ];

        setItems(itemsForSale);

        const food = [
            {
                name: "Tofu",
                image: TofuImage,
                price: applyDiscount(50),
                description: "Permanently increase max HP by 3.",
                statChanges: {
                    maxHP: 3,
                },
            },
            {
                name: "Tofu Soup",
                image: NewYearRiceSoupImage,
                price: applyDiscount(50),
                description: "Restore 15 HP.",
                statChanges: {
                    HP: 15,
                },
            },
        ];

        setFood(food);
    };

    useEffect(() => {
        refreshItems();
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
        setNumRefreshes(totalRefreshes);
        setDiscount(Math.min(1, totalDiscount));
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
            const { price, item } = items[selectedItemIndex];
            if (player.mesos >= price) {
                onBuyItem({ items: [item], mesosSpent: price, type: "item" });
                const updatedItems = items.slice();
                updatedItems.splice(selectedItemIndex, 1);
                setItems(updatedItems);
                setSelectedItemIndex(null);
            }
            return;
        }

        if (food[selectedFoodIndex]) {
            const { price, statChanges } = food[selectedFoodIndex];
            if (freeFood) {
                setFreeFood(false);
                setSelectedFoodIndex(null);
                onBuyItem({ items: [], mesosSpent: 0, type: "item", statChanges });
                return;
            }
            if (player.mesos >= price) {
                onBuyItem({ items: [], mesosSpent: price, type: "item", statChanges });
                setSelectedFoodIndex(null);
            }
            return;
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <div className={classes.doneContainer}>
                    <Button color="primary" variant="contained" onClick={onExit}>
                        Done
                    </Button>
                </div>
                <div className={classes.titleContainer}>
                    <h2>
                        <img src={MesoBagImage} alt="Meso Bag" className={classes.mesoBag} /> {merchant?.name || "Merchant"}'s Shop
                    </h2>
                </div>
                <div className={classes.refreshContainer}>
                    {numRefreshes > 0 && (
                        <>
                            <span className={classes.refreshText}>Refreshes remaining: {numRefreshes}</span>
                            <Button
                                color={"secondary"}
                                onClick={() => {
                                    refreshItems();
                                    setNumRefreshes((prev) => prev - 1);
                                }}
                            >
                                Refresh Items
                            </Button>
                        </>
                    )}
                </div>

                <div className={classes.container}>
                    <div className={classes.abilitiesSection}>
                        {abilities.map(({ item, price }, i) => (
                            <div className={classes.abilityContainer} key={i}>
                                <div
                                    className={classNames(classes.ability, {
                                        selected: i === selectedAbilityIndex,
                                    })}
                                    onClick={() => {
                                        if (player.mesos >= price) {
                                            setSelectedAbilityIndex(i);
                                            setSelectedFoodIndex(null);
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
                    <div>
                        {items.map(({ item, price }, i) => (
                            <div className={classes.itemContainer} key={i}>
                                <div
                                    className={classNames(classes.item, {
                                        selected: i === selectedItemIndex,
                                    })}
                                    onClick={() => {
                                        if (player.mesos >= price) {
                                            setSelectedAbilityIndex(null);
                                            setSelectedFoodIndex(null);
                                            setSelectedItemIndex(i);
                                        }
                                    }}
                                >
                                    <ItemView item={item} />
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
                    <div>
                        {food.map(({ price, ...other }, i) => (
                            <div className={classes.itemContainer} key={i}>
                                <div
                                    className={classNames(classes.item, {
                                        selected: i === selectedFoodIndex,
                                    })}
                                    onClick={() => {
                                        if (freeFood || player.mesos >= price) {
                                            setSelectedAbilityIndex(null);
                                            setSelectedItemIndex(null);
                                            setSelectedFoodIndex(i);
                                        }
                                    }}
                                >
                                    <ItemView item={other} />
                                </div>
                                <div className={classes.priceContainer}>
                                    <div
                                        className={classNames(classes.priceContainerInner, {
                                            [classes.cannotAfford]: !freeFood && player.mesos < price,
                                        })}
                                    >
                                        <img src={MesoCoinImage} alt={"Mesos"} />
                                        <span className={classes.priceLabel}>{freeFood ? "FREE (1)" : price}</span>
                                    </div>
                                </div>
                                {i === selectedFoodIndex && (
                                    <div>
                                        <Button color={"primary"} onClick={handleBuyClick}>
                                            Buy & Eat
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

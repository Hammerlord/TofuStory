import Button from "../view/Button";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability } from "../ability/types";
import { MesoBagImage, MesoCoinImage } from "../images";
import { getRandomInt, getRandomItem, shuffle } from "../utils";
import Overlay from "../view/Overlay";
import { SECONDARY_JOBS } from "./types";
import { Item, ITEM_TYPES } from "../item/types";
import { ITEMS } from "../Map/routes/eventList";
import { blackScroll, goldenHammer, incense } from "../item/items";
import ItemView from "../item/ItemView";

const useStyles = createUseStyles({
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
        width: "100%",
        background: "rgb(50, 50, 50)",
        padding: "64px 0",
        "& .selected": {
            boxShadow: "0 0 8px 4px #45ff61",
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
        margin: "64px 0",
        verticalAlign: "top",
    },
    ability: {
        margin: "0 24px",
        verticalAlign: "bottom",
        borderRadius: 4,
    },
    item: {
        margin: "0 24px",
        verticalAlign: "bottom",
        borderRadius: 8,
    },
    abilitiesSection: {
        marginBottom: "32px",
    },
    abilityContainer: {
        display: "inline-block",
        minHeight: "350px",
        verticalAlign: "bottom",
    },
    itemContainer: {
        display: "inline-block",
        minHeight: "300px",
        verticalAlign: "bottom",
    },
    priceContainer: {
        textAlign: "center",
        color: "white",
        margin: "12px 0",
    },
    priceLabel: {
        marginLeft: 4,
        display: "inline-block",
        verticalAlign: "top",
    },
    doneContainer: {
        position: "absolute",
        right: "32px",
        top: "32px",
    },
});

const createShopItems = ({
    items,
    numItems,
    priceMin,
    priceMax,
}: {
    items: any[];
    numItems: number;
    priceMin: number;
    priceMax: number;
}): { item: any; price: number }[] => {
    return shuffle(items)
        .slice(0, numItems)
        .map((item) => ({ item, price: getRandomInt(priceMin, priceMax) }));
};

const Shop = ({
    player,
    updatePlayer,
    updateDeck,
    deck,
    merchant,
    onExit,
}: {
    player: any;
    updatePlayer: (player: any) => void;
    updateDeck: (deck: Ability[]) => void;
    deck: Ability[];
    merchant?: { name: string };
    onExit: () => void;
}) => {
    const [abilities, setAbilities] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const classes = useStyles();

    useEffect(() => {
        // Abilities
        const abilitiesForSale: { item: Ability; price: number }[] = [];
        const otherSecondaryJobs = Object.values(SECONDARY_JOBS[player.class]).filter((job) => job !== player.secondaryClass) || [];
        const otherSecondaryJobCards = otherSecondaryJobs.reduce(
            (acc: Ability[], job: string) => [...acc, ...JOB_CARD_MAP[job]],
            [] as Ability[]
        ) as Ability[];
        if (otherSecondaryJobCards.length) {
            abilitiesForSale.push({ item: getRandomItem(otherSecondaryJobCards), price: getRandomInt(80, 100) });
        }
        const potentialAbilities = JOB_CARD_MAP[player.class].all.concat(JOB_CARD_MAP[player.secondaryClass]?.all || []);
        abilitiesForSale.push(...createShopItems({ items: potentialAbilities, numItems: 6, priceMin: 40, priceMax: 60 }));
        // Use deck to determine which abilities have a higher chance to roll
        setAbilities(shuffle(abilitiesForSale));

        // Items
        const alreadyObtained = player.items.reduce((acc, item: Item) => {
            if (item.type === ITEM_TYPES.EQUIPMENT) {
                acc[item.name] = true;
            }
            return acc;
        }, {});

        const itemsForSale = [
            ...createShopItems({
                items: ITEMS.filter((item: Item) => !alreadyObtained[item.name]),
                numItems: 3,
                priceMin: 50,
                priceMax: 70,
            }),
            ...createShopItems({
                items: [incense, incense, goldenHammer, goldenHammer, blackScroll, blackScroll],
                numItems: 3,
                priceMin: 40,
                priceMax: 60,
            }),
        ];

        setItems(itemsForSale);
    }, []);

    const handleBuyClick = () => {
        if (abilities[selectedAbilityIndex]) {
            const { price, item } = abilities[selectedAbilityIndex];
            if (player.mesos >= price) {
                updateDeck([item, ...deck]);
                updatePlayer({
                    mesos: player.mesos - price,
                });
                const updatedAbilities = abilities.slice();
                updatedAbilities.splice(selectedAbilityIndex, 1);
                setAbilities(updatedAbilities);
                setSelectedAbilityIndex(null);
            }
        } else if (items[selectedItemIndex]) {
            const { price, item } = items[selectedItemIndex];
            if (player.mesos >= price) {
                updatePlayer({
                    mesos: player.mesos - price,
                    items: [...player.items, item],
                });
                const updatedItems = items.slice();
                updatedItems.splice(selectedItemIndex, 1);
                setItems(updatedItems);
                setSelectedItemIndex(null);
            }
        }
    };

    return (
        <Overlay>
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
                <div className={classes.container}>
                    <div className={classes.abilitiesSection}>
                        {abilities.map(({ item, price }, i) => (
                            <div className={classes.abilityContainer} key={i}>
                                <div
                                    className={classNames(classes.ability, {
                                        selected: i === selectedAbilityIndex,
                                    })}
                                    onClick={() => {
                                        const { price } = abilities[i];
                                        if (player.mesos >= price) {
                                            setSelectedAbilityIndex(i);
                                            setSelectedItemIndex(null);
                                        }
                                    }}
                                >
                                    <AbilityView ability={item} />
                                </div>
                                <div className={classes.priceContainer}>
                                    <img src={MesoCoinImage} alt={"Mesos"} />
                                    <span className={classes.priceLabel}>{price}</span>
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
                                        const { price } = items[i];
                                        if (player.mesos >= price) {
                                            setSelectedAbilityIndex(null);
                                            setSelectedItemIndex(i);
                                        }
                                    }}
                                >
                                    <ItemView item={item} />
                                </div>
                                <div className={classes.priceContainer}>
                                    <img src={MesoCoinImage} alt={"Mesos"} />
                                    <span className={classes.priceLabel}>{price}</span>
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
        </Overlay>
    );
};

export default Shop;

import { Button } from "@material-ui/core";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP, SECONDARY_JOBS } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability } from "../ability/types";
import { mesoCoinImage } from "../images";
import { getRandomInt, getRandomItem, shuffle } from "../utils";
import Overlay from "../view/Overlay";

const useStyles = createUseStyles({
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
        width: "100%",
        background: "rgb(50, 50, 50)",
    },
    titleContainer: {
        display: "inline-block",
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        padding: "8px 96px",
        color: "white",
        marginBottom: "24px",
    },
    abilityContainer: {
        margin: "64px 0",
    },
    ability: {
        margin: "0 24px",
        verticalAlign: "bottom",
        "&.selected": {
            boxShadow: "0 0 8px 4px #45ff61",
        },
    },
    itemContainer: {
        display: "inline-block",
        minHeight: "400px",
        verticalAlign: "bottom",
    },
    priceContainer: {
        textAlign: "center",
        color: "white",
    },
    doneContainer: {
        position: "absolute",
        right: "32px",
        top: "0px",
    },
});

const Shop = ({ player, mesos = 0, updateDeck, deck, merchant, hasDiscount, onExit }) => {
    const [items, setItems] = useState([]);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const classes = useStyles();
    useEffect(() => {
        const wares: { item: any; price: number }[] = [];
        const otherSecondaryJobs = Object.values(SECONDARY_JOBS[player.class]).filter((job) => job !== player.secondaryClass) || [];
        const otherSecondaryJobCards = otherSecondaryJobs.reduce(
            (acc: Ability[], job: string) => [...acc, ...JOB_CARD_MAP[job]],
            [] as Ability[]
        ) as Ability[];
        if (otherSecondaryJobCards.length) {
            wares.push({ item: getRandomItem(otherSecondaryJobCards), price: 150 });
        }
        const potentialAbilities = JOB_CARD_MAP[player.class].all.concat(JOB_CARD_MAP[player.secondaryClass]?.all || []);
        wares.push(
            ...shuffle(potentialAbilities)
                .slice(0, 5)
                .map((ability) => ({ item: ability, price: 100 }))
        );
        // Use deck to determine which abilities have a higher chance to roll
        setItems(shuffle(wares));
    }, []);

    const handleBuyClick = () => {
        updateDeck([items[selectedItemIndex], ...deck]);
        const newItems = items.slice();
        newItems.splice(selectedItemIndex, 1);
        setItems(newItems);
        setSelectedItemIndex(null);
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
                    <h2>{merchant.name}'s Shop</h2>
                </div>
                <div className={classes.abilityContainer}>
                    {items.map(({ item, price }, i) => (
                        <div className={classes.itemContainer} key={i}>
                            <div
                                className={classNames(classes.ability, {
                                    selected: i === selectedItemIndex,
                                })}
                                onClick={() => setSelectedItemIndex(i)}
                            >
                                <AbilityView ability={item} />
                            </div>
                            <div className={classes.priceContainer}>
                                <img src={mesoCoinImage} alt={"Mesos"} />
                                {price}
                                {i === selectedItemIndex && (
                                    <div>
                                        <Button variant={"contained"} color={"primary"} onClick={handleBuyClick}>
                                            Buy
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Overlay>
    );
};

export default Shop;

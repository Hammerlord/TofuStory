import { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import { BATTLE_TYPES } from "../battle/types";
import { blackScroll, goldenHammer, incense } from "../item/items";
import { Item, ITEM_TYPES } from "../item/types";
import { ITEMS } from "../Map/routes/eventList";
import { getRandomItem } from "../utils";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
const useStyles = createUseStyles({
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
        width: "100%",
        color: "white",
    },
    titleContainer: {
        display: "inline-block",
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        padding: "8px 96px",
        color: "white",
        marginBottom: "24px",
    },
    container: {
        margin: "64px 0",
        verticalAlign: "top",
    },
    selectContainer: {
        marginBottom: 40,
    },
    item: {
        display: "inline-block",
        borderRadius: "8px",
        margin: 16,
        padding: 24,
        verticalAlign: "bottom",
        background: "#666",
        width: "200px",
        minHeight: "150px",
        "& hr": {
            opacity: 0.6,
        },
    },
    itemImage: {
        margin: "8px 0",
    },
});

const ItemRewards = ({
    playerCurrentItems,
    onLoot,
    onClose,
    rewardType,
    overrideItems,
}: {
    playerCurrentItems: Item[];
    onLoot: ({ items }: { items: Item[] }) => void;
    onClose: () => void;
    rewardType: BATTLE_TYPES;
    // Eg. encounter-specific item(s); it takes the place of the auto-generated item from elites/bosses
    overrideItems: Item[];
}) => {
    const classes = useStyles();
    const [rewards, setRewards] = useState([]);
    useEffect(() => {
        const alreadyObtained = playerCurrentItems.reduce((acc, item: Item) => {
            if (item.type === ITEM_TYPES.EQUIPMENT) {
                acc[item.name] = true;
            }
            return acc;
        }, {});

        const items = [];

        if (overrideItems?.length > 0) {
            items.push(...overrideItems);
        } else {
            const equipment = getRandomItem(ITEMS.filter((item: Item) => !alreadyObtained[item.name]));
            if (equipment) {
                items.push(equipment);
            }
        }

        if (rewardType === BATTLE_TYPES.BOSS) {
            items.push(...[incense, goldenHammer, blackScroll]);
        } else if (rewardType === BATTLE_TYPES.ELITE_ENCOUNTER) {
            items.push(...[goldenHammer, blackScroll]);
        }

        onLoot({ items });
        setRewards(items);
    }, []);

    return (
        <Overlay>
            <div className={classes.inner}>
                <div className={classes.titleContainer}>
                    <h1>You obtained</h1>
                </div>

                <div className={classes.container}>
                    {rewards.map((item: Item) => (
                        <div key={item.name} className={classes.item}>
                            <img src={item.image} className={classes.itemImage} />
                            <div>{item.name}</div>
                            <hr />
                            <div>{item.description}</div>
                        </div>
                    ))}
                </div>
                <Button color="primary" onClick={onClose}>
                    Exit
                </Button>
            </div>
        </Overlay>
    );
};

export default ItemRewards;

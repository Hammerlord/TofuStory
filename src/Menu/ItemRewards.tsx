import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { BATTLE_TYPES } from "../battle/types";
import { goldenHammer, incense } from "../item/items";
import ItemView from "../item/ItemView";
import { Item, ITEM_TYPES } from "../item/types";
import { ITEMS } from "../Map/routes/eventList";
import { getRandomItem } from "../utils";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
import { rollItemPool } from "../item/utils";
import { BOSS_RARE_RATE, ELITE_RARE_RATE, ELITE_UNCOMMON_RATE } from "../constants";

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
    itemContainer: {
        margin: 16,
        display: "inline-block",
        filter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
        WebkitFilter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
    },
});

const ItemRewards = ({
    player,
    playerCurrentItems,
    onLoot,
    onClose,
    rewardType,
    overrideItems,
}: {
    player: any;
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

        const items = (overrideItems || []).filter((item: Item) => !alreadyObtained[item.name]);
        if (!items.length) {
            const rareBonus = rewardType === BATTLE_TYPES.BOSS ? BOSS_RARE_RATE : ELITE_RARE_RATE;
            const itemPool = rollItemPool(player, { rare: rareBonus, uncommon: ELITE_UNCOMMON_RATE });
            const equipment = getRandomItem(itemPool);
            if (equipment) {
                items.push(equipment);
            }
        }

        items.push(...[goldenHammer]);

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
                    {rewards.map((item: Item, i) => (
                        <div className={classes.itemContainer} key={i}>
                            <ItemView item={item} />
                        </div>
                    ))}
                </div>
                <Button color="primary" onClick={onClose}>
                    Continue
                </Button>
            </div>
        </Overlay>
    );
};

export default ItemRewards;

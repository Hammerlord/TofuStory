import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { BATTLE_TYPES } from "../battle/types";
import { BOSS_RARE_RATE, ELITE_RARE_RATE, ELITE_UNCOMMON_RATE } from "../constants";
import ItemView from "../item/ItemView";
import { goldenHammer, mesoItem } from "../item/items";
import { ITEM_TYPES, Item } from "../item/types";
import { rollItemPool } from "../item/utils";
import { getRandomItem } from "../utils";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
import { Player } from "../character/types";

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
        width: "40%",
    },
    container: {
        margin: "64px 0",
        verticalAlign: "top",
    },
    containerInner: {
        display: "inline-block",
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.8) 70%, rgba(0,212,255,0) 100%)",

        width: "40%",
        color: "white",
        padding: "64px 100px",
    },
    selectContainer: {
        marginBottom: 40,
    },
    item: {
        margin: 16,
    },
    border: {
        borderTop: 0,
        width: 250,
        borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
    },
    itemChoices: {
        marginBottom: 48,
    },
    rewardListIcon: {
        verticalAlign: "bottom",
        marginRight: 8,
    },
    listItem: {
        lineHeight: "28px",
        fontSize: "18px",
        marginBottom: "16px",
        "& img": {
            verticalAlign: "bottom",
        },
    },
});

const BASE_NUM_CHOICES = 3; // How many choices are offered
const maxAmount = 1; // How many items the player can choose

const ItemRewards = ({
    player,
    playerCurrentItems,
    onLoot,
    onClose,
    rewardType,
    overrideItems,
    disableAttainConsumable,
}: {
    player: Player;
    playerCurrentItems: Item[];
    onLoot: ({ items }: { items: Item[] }) => void;
    onClose: () => void;
    rewardType?: BATTLE_TYPES;
    // Eg. encounter-specific item(s); it takes the place of the auto-generated item from elites/bosses
    overrideItems: Item[];
    disableAttainConsumable?: boolean;
}) => {
    const classes = useStyles();
    const [rewards, setRewards] = useState([]);
    const [itemChoices, setItemChoices] = useState([]);
    const [selectedItemIndices, setSelectedItemIndices] = useState([]);

    useEffect(() => {
        const alreadyObtained = playerCurrentItems.reduce((acc, item: Item) => {
            if (item.type === ITEM_TYPES.EQUIPMENT) {
                acc[item.name] = true;
            }
            return acc;
        }, {});

        const items = (overrideItems || []).filter((item: Item) => !alreadyObtained[item.name]);
        if (items.length < BASE_NUM_CHOICES) {
            Array.from({ length: BASE_NUM_CHOICES - items.length }).forEach(() => {
                let rareBonus = 0;
                let uncommonBonus = 0;
                if (rewardType === BATTLE_TYPES.BOSS) {
                    rareBonus = BOSS_RARE_RATE;
                    uncommonBonus = ELITE_UNCOMMON_RATE;
                } else if (rewardType === BATTLE_TYPES.ELITE_ENCOUNTER) {
                    rareBonus = ELITE_RARE_RATE;
                    uncommonBonus = ELITE_UNCOMMON_RATE;
                }
                const itemPool = rollItemPool({ player, bonuses: { rare: rareBonus, uncommon: ELITE_UNCOMMON_RATE }, excludeItems: items });
                const equipment = getRandomItem(itemPool);
                if (equipment) {
                    items.push(equipment);
                }
            });
        }

        if (!items.length) {
            items.push(mesoItem);
        }

        const itemRewards = [];
        if ([BATTLE_TYPES.BOSS, BATTLE_TYPES.ELITE_ENCOUNTER].includes(rewardType) && !disableAttainConsumable) {
            itemRewards.push(goldenHammer);
        }

        setRewards(itemRewards);
        setItemChoices(items);
        onLoot({ items: itemRewards });
    }, []);

    const handleClickItem = (index: number) => {
        if (maxAmount === 1) {
            setSelectedItemIndices([index]);
            return;
        }
        if (selectedItemIndices.includes(index)) {
            // Deselect if selected
            setSelectedItemIndices((prev) => prev.filter((i) => i !== index));
            return;
        }
        if (selectedItemIndices.length < maxAmount) {
            setSelectedItemIndices((prev) => [...prev, index]);
        }
    };

    const handleClickSelect = () => {
        onLoot({ items: selectedItemIndices.map((i) => itemChoices[i]) });
        onClose();
    };

    return (
        <Overlay>
            <div className={classes.inner}>
                <div className={classes.titleContainer}>
                    <h2>Loot!</h2>
                </div>
                <div className={classes.container}>
                    <div className={classes.containerInner}>
                        {rewards.length > 0 && <div>You obtain</div>}
                        {rewards.map((item: Item, i) => (
                            <div className={classes.listItem} key={[item.name, i].join("-")}>
                                <img src={item.image} /> <span>{item.name}</span>
                            </div>
                        ))}
                        <hr className={classes.border} />
                        <h3>Pick an item:</h3>
                        <div className={classes.itemChoices}>
                            {itemChoices.map((item, i) => (
                                <ItemView
                                    item={item}
                                    key={[item.name, i].join("-")}
                                    highlight={selectedItemIndices.includes(i)}
                                    className={classes.item}
                                    onClick={() => handleClickItem(i)}
                                />
                            ))}
                        </div>
                        <Button color="primary" onClick={handleClickSelect} disabled={!selectedItemIndices.length}>
                            Select!
                        </Button>
                    </div>
                </div>
            </div>
        </Overlay>
    );
};

export default ItemRewards;

import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { BATTLE_TYPES } from "../battle/types";
import { Player } from "../character/types";
import {
    BOSS_RARE_RATE,
    BOSS_UNCOMMON_RATE,
    ELITE_RARE_RATE,
    ELITE_UNCOMMON_RATE,
} from "../constants";
import ItemView from "../item/ItemView";
import { goldenHammer, incense, mesoItem, tofu } from "../item/items";
import { Item, RARITIES } from "../item/types";
import { rollItemPool } from "../item/utils";
import Button from "../view/Button";
import KeyboardReticle from "../view/KeyboardReticle";
import Overlay from "../view/Overlay";
import { CARD_SELECTION_KEYBINDS, useCardSelection } from "../hooks/useCardSelection";
import { filterUnobtainableItems } from "./utils";

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

        minWidth: "40%",
        color: "white",
        padding: "64px 100px",
    },
    selectContainer: {
        marginBottom: "40px",
    },
    item: {
        margin: "16px",
    },
    itemWrapper: {
        display: "inline-block",
        position: "relative",
    },
    border: {
        borderTop: 0,
        width: "250px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
    },
    itemChoices: {
        marginBottom: "48px",
    },
    rewardListIcon: {
        verticalAlign: "bottom",
        marginRight: "8px",
    },
    rewardsList: {
        marginBottom: "16px",
    },
    listItem: {
        lineHeight: "28px",
        fontSize: "18px",
        "& img": {
            verticalAlign: "bottom",
        },
    },
});

const BASE_NUM_CHOICES = 3; // How many choices are offered

const ItemRewards = ({
    player,
    onLoot,
    onClose,
    rewardType,
    overrideItemChoices,
    itemRewards = [],
    disableAttainConsumable,
    numChoicesOffered = BASE_NUM_CHOICES,
    rareItemBonusChance = 0,
    maxAmount = 1,
}: {
    player: Player;
    onLoot: ({ items }: { items: Item[] }) => void;
    onClose: (rolledItems: Item[]) => void;
    rewardType?: BATTLE_TYPES;
    // Eg. encounter-specific item(s); it takes the place of the auto-generated item from elites/bosses
    overrideItemChoices?: Item[];
    itemRewards?: Item[]; // Items which are granted automatically without having to choose
    disableAttainConsumable?: boolean;
    numChoicesOffered?: number;
    rareItemBonusChance?: number; // Pity system for rare items
    maxAmount?: number; // How many items the player can choose (defaults to 1)
}) => {
    const classes = useStyles();
    const [rewards, setRewards] = useState<Item[]>([]);
    const [itemChoices, setItemChoices] = useState<Item[]>([]);

    const {
        selectedItems,
        currentIndex,
        focusSource,
        isConfirmDisabled,
        isSelected,
        handleCardClick,
        handleConfirm,
    } = useCardSelection({
        items: itemChoices,
        maxAmount,
        onConfirm: () => {
            onLoot({ items: selectedItems });
            onClose(itemChoices);
        },
        preselectLoneOption: true,
    });

    useEffect(() => {
        const items = filterUnobtainableItems({
            playerItems: player.items,
            itemsToFilter: overrideItemChoices || [],
        });
        if (!overrideItemChoices && items.length < numChoicesOffered) {
            let rareBonus = rareItemBonusChance;
            let uncommonBonus = 0;
            if (rewardType === BATTLE_TYPES.BOSS) {
                rareBonus += BOSS_RARE_RATE;
                uncommonBonus = BOSS_UNCOMMON_RATE;
            } else if (rewardType === BATTLE_TYPES.ELITE_ENCOUNTER) {
                rareBonus += ELITE_RARE_RATE;
                uncommonBonus = ELITE_UNCOMMON_RATE;
            }
            const itemPool = rollItemPool({
                player,
                bonuses: {
                    rare: rareBonus,
                    uncommon: uncommonBonus,
                },
                disableRarities: rewardType === BATTLE_TYPES.BOSS ? [RARITIES.COMMON] : [],
                excludeItems: items,
            });

            for (let i = 0; i < numChoicesOffered; i++) {
                const index = Math.floor(Math.random() * itemPool.length);

                if (index === undefined || itemPool.length === 0) {
                    break;
                }

                const [equipment] = itemPool.splice(index, 1);

                if (equipment) {
                    items.push(equipment);
                }
            }
        }

        if (!items.length) {
            items.push(mesoItem);
        }

        const itemsToBeRewarded = itemRewards.slice();
        if (rewardType === BATTLE_TYPES.BOSS && !disableAttainConsumable) {
            if (Math.random() < 0.5) {
                itemsToBeRewarded.push(goldenHammer);
            } else {
                itemsToBeRewarded.push(incense);
            }
        }

        if (rewardType === BATTLE_TYPES.BOSS) {
            itemsToBeRewarded.push(tofu);
        }

        setRewards(itemsToBeRewarded);
        setItemChoices(items);
        onLoot({ items: itemsToBeRewarded });
    }, []);

    return (
        <Overlay>
            <div className={classes.inner}>
                <div className={classes.titleContainer}>
                    <h2>Loot</h2>
                </div>
                <div className={classes.container}>
                    <div className={classes.containerInner}>
                        {rewards.length > 0 && (
                            <div className={classes.rewardsList}>
                                <div>You obtain</div>
                                {rewards.map((item: Item, i) => (
                                    <div
                                        className={classes.listItem}
                                        key={[item.name, i].join("-")}
                                    >
                                        <img src={item.image} /> <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {rewards.length > 0 && <hr className={classes.border} />}
                        {itemChoices.length > 1 && <h3>Pick an item:</h3>}
                        <div className={classes.itemChoices}>
                            {itemChoices.map((item, i) => (
                                <div className={classes.itemWrapper} key={[item.name, i].join("-")}>
                                    <ItemView
                                        item={item}
                                        highlight={isSelected(item, i)}
                                        className={classes.item}
                                        onClick={() => handleCardClick(item, i)}
                                        playerClass={player.class}
                                    />
                                    {maxAmount > 1 &&
                                        focusSource === "keyboard" &&
                                        currentIndex === i && <KeyboardReticle />}
                                </div>
                            ))}
                        </div>
                        <Button
                            color="primary"
                            onClick={handleConfirm}
                            disabled={isConfirmDisabled}
                        >
                            Confirm [{CARD_SELECTION_KEYBINDS.confirm.hint}]
                        </Button>
                    </div>
                </div>
            </div>
        </Overlay>
    );
};

export default ItemRewards;

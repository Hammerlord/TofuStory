import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Popper from "@material-ui/core/Popper";
import classNames from "classnames";
import Handlebars from "handlebars";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { CombatEffect, EFFECT_EVENT_KEYS } from "../ability/types";
import { COLOR_RARITY_COMMON, COLOR_RARITY_RARE, COLOR_RARITY_UNCOMMON } from "../constants";
import { useAppSelector } from "../hooks";
import { ITEM_TYPES, Item, RARITIES } from "../item/types";
import Button from "../view/Button";
import { resourceClassNameMap } from "../ability/AbilityView/constants";
import { Player } from "../character/types";

const useStyles = createUseStyles({
    root: {
        margin: "0 16px",
    },
    itemContainer: {
        display: "inline-flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
        boxSizing: "border-box",
        position: "relative",
        padding: 0,
        background: "none",
        border: "none",
    },
    item: {
        border: "1px solid transparent",
        height: "50px",
        padding: 4,
    },
    stacks: {
        color: "white",
        position: "absolute",
        left: 5,
        bottom: 3,
        fontWeight: "bold",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
    },
    selectedItem: {
        border: "1px solid rgba(255, 255, 255, 0.75)",
        borderRadius: "2px",
    },
    menu: {
        background: "rgba(30, 30, 30, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: "4px",
        fontFamily: "Barlow",
        zIndex: "1000",
        color: "white",
        maxWidth: 300,
    },
    menuInner: {
        padding: "16px",
    },
    itemName: {
        fontSize: "18px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.4)",
        paddingBottom: "8px",
        marginBottom: "8px",
    },
    useButtonContainer: {
        marginTop: "8px",
    },
    diamond: {
        width: "8px",
        height: "8px",
        transform: "rotate(45deg)",
        display: "inline-block",
        margin: "4px",
        verticalAlign: "bottom",
    },
    uncommon: {
        background: COLOR_RARITY_UNCOMMON,
    },
    common: {
        background: COLOR_RARITY_COMMON,
    },
    rare: {
        background: COLOR_RARITY_RARE,
    },
    rarity: {
        marginBottom: "8px",
    },
    "@keyframes glow": {
        "0%": {
            filter: "drop-shadow(0 0 1px #45ff61) drop-shadow(0 0 1px #45ff61)",
        },
        "100%": {
            filter: "drop-shadow(0 0 5px #45ff61) drop-shadow(0 0 5px #45ff61)",
        },
    },
    glow: {
        animationName: "$glow",
        animationDuration: "1s",
    },
    combatCounter: {
        color: "white",
        position: "absolute",
        right: 5,
        top: 3,
        fontWeight: "bold",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 4px black")
            .join(", "),
    },
});

const ITEM_CLASS_NAME = "inventory-item";

const Inventory = ({ player, inventory, onUseItem }: { player: Player; inventory: Item[]; onUseItem: (item: Item) => void }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const { battle } = useAppSelector((state) => state);

    const shouldGlow = (item: Item): boolean => {
        const event = battle?.eventQueue?.[0];
        return (event?.source?.source as CombatEffect)?.itemSource === item.name;
    };

    // For example, if an item like Steely is tracking the number of cards that has been drawn before proccing, show how many cards have been drawn.
    // Effects are copied over from the item onto the player during combat. So we need to do a lookup to find the effect instance.
    const getCombatCounter = (item: Item): number | undefined => {
        const combatPlayer = battle?.playerSide?.find((combatant) => combatant?.isPlayer);
        if (!combatPlayer) {
            return;
        }

        // Just take the first one for now; items don't often have more than 1 effect event
        const effectEventKey = Object.values(EFFECT_EVENT_KEYS).find((key) => item.effects?.[0]?.[key]);
        if (!effectEventKey) {
            return;
        }

        const relatedEffect: CombatEffect | undefined = combatPlayer?.effects.find((e: CombatEffect) => e.itemSource === item.name);
        const relatedEffectEvent = relatedEffect?.[effectEventKey];
        if (!relatedEffectEvent) {
            return;
        }

        const { triggerSum, triggerFrequencyFromSum, eventTriggeredTimes, eventTriggerFrequency } = relatedEffectEvent;
        if (triggerSum && triggerFrequencyFromSum) {
            return triggerSum % triggerFrequencyFromSum;
        }

        if (eventTriggeredTimes && eventTriggerFrequency) {
            return eventTriggeredTimes % eventTriggerFrequency;
        }
    };

    const handleItemClick = (e, itemIndex: number) => {
        if (itemIndex === selectedItemIndex) {
            setSelectedItemIndex(null);
            setMenuAnchor(null);
        } else {
            setSelectedItemIndex(itemIndex);
            setMenuAnchor(e.currentTarget);
        }
    };

    const selectedItem = inventory[selectedItemIndex];

    const handleItemUse = () => {
        onUseItem(selectedItem);
        setMenuAnchor(null);
        setSelectedItemIndex(null);
    };

    const classes = useStyles();

    const handleClose = (e) => {
        // Only close the item tooltip if we didn't click an item.
        // This is to allow the user to consecutively look through item descriptions more easily.
        if (!e.target?.classList?.contains(ITEM_CLASS_NAME)) {
            setMenuAnchor(null);
            setSelectedItemIndex(null);
        }
    };

    const isItemUsable = selectedItem?.type === ITEM_TYPES.CONSUMABLE || selectedItem?.upgradeCard;

    const interpolateDescription = (item: Item) =>
        Handlebars.compile(item.description || "")({
            ...item,
            resources: resourceClassNameMap[player.class] || "resource",
        });

    return (
        <>
            {inventory.map((item: Item, i: number) => (
                <button className={classes.itemContainer} key={i}>
                    <img
                        src={item.image}
                        alt={item.name}
                        onClick={(e) => handleItemClick(e, i)}
                        className={classNames(ITEM_CLASS_NAME, classes.item, {
                            [classes.selectedItem]: i === selectedItemIndex,
                            [classes.glow]: shouldGlow(item) || getCombatCounter(item) === 0,
                        })}
                    />
                    <span className={classes.stacks}>{item.stacks > 1 && `x${item.stacks}`}</span>
                    <span className={classes.combatCounter}>{getCombatCounter(item)}</span>
                </button>
            ))}
            {menuAnchor && (
                <Popper anchorEl={menuAnchor} open={true} placement={"bottom-start"} className={classes.menu}>
                    <ClickAwayListener onClickAway={handleClose}>
                        <div className={classes.menuInner}>
                            <div className={classes.itemName}>
                                {selectedItem.name} {selectedItem.stacks > 1 && `x${selectedItem.stacks}`}
                            </div>
                            <div className={classes.rarity}>
                                <span
                                    className={classNames(classes.diamond, {
                                        [classes.common]:
                                            selectedItem.rarity === RARITIES.COMMON ||
                                            selectedItem.rarity === RARITIES.STARTER ||
                                            !selectedItem.rarity,
                                        [classes.uncommon]: selectedItem.rarity === RARITIES.UNCOMMON,
                                        [classes.rare]: selectedItem.rarity === RARITIES.RARE,
                                    })}
                                />{" "}
                                {selectedItem.rarity || RARITIES.COMMON}
                            </div>
                            {selectedItem.healing > 0 && `Recover ${selectedItem.healing} HP.`}
                            {interpolateDescription(selectedItem)}
                            <div className={classes.useButtonContainer}>
                                {isItemUsable && onUseItem && (
                                    <Button variant="contained" color="primary" onClick={handleItemUse}>
                                        Use
                                    </Button>
                                )}
                            </div>
                        </div>
                    </ClickAwayListener>
                </Popper>
            )}
        </>
    );
};

export default Inventory;

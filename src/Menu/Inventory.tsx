import { ClickAwayListener, Popper } from "@mui/material";
import classNames from "classnames";
import Handlebars from "handlebars";
import { useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { CombatEffect, EFFECT_EVENT_KEYS } from "../ability/types";
import { COLOR_RARITY_COMMON, COLOR_RARITY_RARE, COLOR_RARITY_UNCOMMON } from "../constants";
import { useAppSelector } from "../hooks";
import { ITEM_TYPES, Item, RARITIES } from "../item/types";
import Button from "../view/Button";
import { resourceClassNameMap } from "../ability/AbilityView/constants";
import { Combatant, Player } from "../character/types";
import { getIconInterpolationMap } from "../ability/descriptionInterpolation";
import { EventGroup } from "../battle/types";

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
    const playerSide = useAppSelector((state) => state.battle?.playerSide);

    const handleOnUseItem = (item: Item) => {
        onUseItem(item);
    };

    return inventory.map((item, i) => (
        <InventoryItem playerSide={playerSide} item={item} key={item.name} onUseItem={handleOnUseItem} player={player} index={i} />
    ));
};

const InventoryItem = ({
    item,
    playerSide,
    onUseItem,
    player,
    index,
}: {
    item: Item;
    playerSide: (Combatant | null)[];
    onUseItem: (item: Item) => void;
    player: Player;
    index: number;
}) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [isTriggerHovered, setIsTriggerHovered] = useState(false);
    const [isPopperHovered, setIsPopperHovered] = useState(false);

    const isOpen = isTriggerHovered || isPopperHovered;

    const classes = useStyles();

    const handleItemUse = () => {
        onUseItem(item);
        setIsTriggerHovered(false);
        setIsPopperHovered(false);
    };

    const playerClass = player.class;
    const isItemUsable = item?.type === ITEM_TYPES.CONSUMABLE || item?.upgradeCard;
    const elementMapping = useMemo(() => getIconInterpolationMap({ playerClass }), [playerClass]);
    const interpolateDescription = (item: Item) => Handlebars.compile(item.description || "")({ ...item, ...elementMapping });

    // For example, if an item like Steely is tracking the number of cards that has been drawn before proccing, show how many cards have been drawn.
    // Effects are copied over from the item onto the player during combat. So we need to do a lookup to find the effect instance.
    const getCombatCounter = (item: Item): number | undefined => {
        const combatPlayer = playerSide?.find((combatant) => combatant?.isPlayer);
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

        const { triggerSum, triggerFrequencyFromSum, eventTriggeredTimes, eventTriggerFrequency } = Array.isArray(relatedEffectEvent)
            ? relatedEffectEvent[0]
            : relatedEffectEvent;

        if (triggerSum && triggerFrequencyFromSum) {
            return triggerSum % triggerFrequencyFromSum;
        }

        if (eventTriggeredTimes && eventTriggerFrequency) {
            return eventTriggeredTimes % eventTriggerFrequency;
        }
    };

    const handleItemClick = (e) => {
        setMenuAnchor(e.currentTarget);
    };

    const handleItemMouseEnter = (e) => {
        setMenuAnchor(e.currentTarget);
        setIsTriggerHovered(true);
    };

    const handleItemMouseOut = () => {
        setIsTriggerHovered(false);
    };

    return (
        <>
            <button
                className={classes.itemContainer}
                onClick={(e) => handleItemClick(e)}
                onMouseEnter={(e) => handleItemMouseEnter(e)}
                onMouseLeave={(e) => handleItemMouseOut()}
            >
                <img
                    src={item.image}
                    alt={item.name}
                    className={classNames(ITEM_CLASS_NAME, classes.item, {
                        [classes.selectedItem]: isOpen,
                        [classes.glow]: getCombatCounter(item) === 0,
                    })}
                />
                <span className={classes.stacks}>{item.stacks > 1 && `x${item.stacks}`}</span>
                <span className={classes.combatCounter}>{getCombatCounter(item)}</span>
            </button>
            {menuAnchor && isOpen && (
                <Popper
                    anchorEl={menuAnchor}
                    open={isOpen}
                    placement={"bottom-start"}
                    className={classes.menu}
                    disablePortal={true}
                    onMouseEnter={() => setIsPopperHovered(true)}
                    onMouseLeave={() => setIsPopperHovered(false)}
                >
                    <div className={classes.menuInner}>
                        <div className={classes.itemName}>
                            {item.name} {item.stacks > 1 && `x${item.stacks}`}
                        </div>
                        <div className={classes.rarity}>
                            <span
                                className={classNames(classes.diamond, {
                                    [classes.common]: item.rarity === RARITIES.COMMON || item.rarity === RARITIES.STARTER || !item.rarity,
                                    [classes.uncommon]: item.rarity === RARITIES.UNCOMMON,
                                    [classes.rare]: item.rarity === RARITIES.RARE,
                                })}
                            />{" "}
                            {item.rarity || RARITIES.COMMON}
                        </div>
                        {item.healing > 0 && `Recover ${item.healing} HP.`}
                        <div dangerouslySetInnerHTML={{ __html: interpolateDescription(item) }} />
                        <div className={classes.useButtonContainer}>
                            {isItemUsable && onUseItem && (
                                <Button variant="contained" color="primary" onClick={handleItemUse}>
                                    Use
                                </Button>
                            )}
                        </div>
                    </div>
                </Popper>
            )}
        </>
    );
};

export default Inventory;

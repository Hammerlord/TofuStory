import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Popper from "@material-ui/core/Popper";
import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { Item, ITEM_TYPES, RARITIES } from "../item/types";
import Button from "../view/Button";
import { COLOR_RARITY_COMMON, COLOR_RARITY_RARE, COLOR_RARITY_UNCOMMON } from "../constants";

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
    },
    item: {
        border: "1px solid transparent",
        height: "50px",
        padding: 4,
    },
    selectedItem: {
        border: "1px solid rgba(255, 255, 255, 0.8)",
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
});

const ITEM_CLASS_NAME = "inventory-item";

const Inventory = ({ inventory, onUseItem }: { inventory: Item[]; onUseItem: (itemIndex: number) => void }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);

    const handleItemClick = (e, itemIndex: number) => {
        if (itemIndex === selectedItemIndex) {
            setSelectedItemIndex(null);
            setMenuAnchor(null);
        } else {
            setSelectedItemIndex(itemIndex);
            setMenuAnchor(e.currentTarget);
        }
    };

    const handleItemUse = () => {
        onUseItem(selectedItemIndex);
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

    const selectedItem = inventory[selectedItemIndex];
    const isItemUsable = selectedItem?.type === ITEM_TYPES.CONSUMABLE || selectedItem?.upgradeCard;

    return (
        <div className={classes.root}>
            {inventory.map((item: Item, i: number) => (
                <div className={classes.itemContainer} key={i}>
                    <img
                        src={item.image}
                        alt={item.name}
                        onClick={(e) => handleItemClick(e, i)}
                        className={classNames(ITEM_CLASS_NAME, classes.item, {
                            [classes.selectedItem]: i === selectedItemIndex,
                        })}
                    />
                </div>
            ))}
            {menuAnchor && (
                <Popper anchorEl={menuAnchor} open={true} placement={"bottom-start"} className={classes.menu}>
                    <ClickAwayListener onClickAway={handleClose}>
                        <div className={classes.menuInner}>
                            <div className={classes.itemName}>{selectedItem.name}</div>
                            <div className={classes.rarity}>
                                <span
                                    className={classNames(classes.diamond, {
                                        [classes.common]: selectedItem.rarity === RARITIES.COMMON || !selectedItem.rarity,
                                        [classes.uncommon]: selectedItem.rarity === RARITIES.UNCOMMON,
                                        [classes.rare]: selectedItem.rarity === RARITIES.RARE,
                                    })}
                                />{" "}
                                {selectedItem.rarity || RARITIES.COMMON}
                            </div>
                            {selectedItem.healing > 0 && `Recover ${selectedItem.healing} HP.`}
                            {selectedItem.description}
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
        </div>
    );
};

export default Inventory;

import { Button, ClickAwayListener, Menu, MenuItem, Popper } from "@material-ui/core";
import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { Item, ITEM_TYPES } from "../item/types";

const useStyles = createUseStyles({
    root: {
        margin: "0 16px",
    },
    itemContainer: {
        display: "inline-flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
    },
    item: {
        border: "1px solid transparent",
        height: "50px",
    },
    selectedItem: {
        border: "1px solid rgba(255, 255, 255, 0.8)",
    },
    menu: {
        background: "rgba(60, 56, 56, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: "4px",
        fontFamily: "Barlow",
        zIndex: "1000",
        color: "white",
    },
    menuInner: {
        padding: "16px",
    },
    itemName: {
        fontSize: "18px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.7)",
        paddingBottom: "8px",
        marginBottom: "8px",
    },
    useButtonContainer: {
        marginTop: "8px",
    },
});

const Inventory = ({ inventory, onUseItem }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);

    const handleItemClick = (e, itemIndex: number) => {
        setSelectedItemIndex(itemIndex);
        setMenuAnchor(e.currentTarget);
    };

    const handleItemUse = () => {
        onUseItem(selectedItemIndex);
        setMenuAnchor(null);
        setSelectedItemIndex(null);
    };

    const classes = useStyles();

    const handleClose = () => {
        setMenuAnchor(null);
        setSelectedItemIndex(null);
    };

    const selectedItem = inventory[selectedItemIndex];

    return (
        <div className={classes.root}>
            {inventory.map((item: Item, i: number) => (
                <div className={classes.itemContainer} key={i}>
                    <img
                        src={item.image}
                        alt={item.name}
                        onClick={(e) => handleItemClick(e, i)}
                        className={classNames(classes.item, {
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
                            {selectedItem.healing > 0 && `Recover ${selectedItem.healing} HP.`}
                            <div className={classes.useButtonContainer}>
                                {selectedItem?.type === ITEM_TYPES.CONSUMABLE && onUseItem && (
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

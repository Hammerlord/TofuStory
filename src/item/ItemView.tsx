import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Item, RARITIES } from "./types";
import { COLOR_RARITY_COMMON, COLOR_RARITY_RARE, COLOR_RARITY_UNCOMMON } from "../constants";

const SIZE = "7px";

const useStyles = createUseStyles({
    item: {
        display: "inline-block",
        borderRadius: "8px",
        padding: 24,
        verticalAlign: "bottom",
        background: "#4f4f4f",
        width: "200px",
        minHeight: "150px",
        color: "white",
        cursor: "pointer",
        boxShadow: "1px 1px 4px rgba(0, 0, 0, 0.3)",
        "& hr": {
            opacity: 0.6,
            width: "100%",
            height: 0,
            borderTop: 0,
            marginTop: 12,
        },
    },
    itemImage: {
        margin: "8px 0",
    },
    diamond: {
        width: 0,
        height: 0,
        border: `${SIZE} solid transparent`,
        position: "relative",
        top: `-${SIZE}`,
        display: "inline-block",
        margin: "6px",
        verticalAlign: "bottom",
        "&:after": {
            content: '""',
            position: "absolute",
            left: `-${SIZE}`,
            top: SIZE,
            width: 0,
            height: 0,
            border: `${SIZE} solid transparent`,
        },
    },
    uncommon: {
        borderBottomColor: COLOR_RARITY_UNCOMMON,
        "&:after": {
            borderTopColor: COLOR_RARITY_UNCOMMON,
        },
    },
    common: {
        borderBottomColor: COLOR_RARITY_COMMON,
        "&:after": {
            borderTopColor: COLOR_RARITY_COMMON,
        },
    },
    rare: {
        borderBottomColor: COLOR_RARITY_RARE,
        "&:after": {
            borderTopColor: COLOR_RARITY_RARE,
        },
    },
    rarityContainer: {
        display: "flex",
    },
});

const ItemView = ({ item }: { item: Item }) => {
    const classes = useStyles();
    return (
        <div key={item.name} className={classes.item}>
            <img src={item.image} className={classes.itemImage} />
            <div>{item.name}</div>
            <div className={classes.rarityContainer}>
                <hr />
                <div>
                    <span
                        className={classNames(classes.diamond, {
                            [classes.common]: item.rarity === RARITIES.COMMON || !item.rarity,
                            [classes.uncommon]: item.rarity === RARITIES.UNCOMMON,
                            [classes.rare]: item.rarity === RARITIES.RARE,
                        })}
                    />{" "}
                </div>
                <hr />
            </div>
            <div>{item.description}</div>
        </div>
    );
};

export default ItemView;

import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Item, RARITIES } from "./types";
import { COLOR_RARITY_COMMON, COLOR_RARITY_RARE, COLOR_RARITY_UNCOMMON } from "../constants";

const useStyles = createUseStyles({
    item: {
        display: "inline-block",
        borderRadius: "8px",
        padding: 16,
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
        width: "8px",
        height: "8px",
        transform: "rotate(45deg)",
        display: "inline-block",
        margin: "8px",
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
    rarityContainer: {
        display: "flex",
    },
    highlight: {
        filter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
        WebkitFilter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
    },
});

const ItemView = ({ item, highlight }: { item: Item; highlight?: boolean }) => {
    const classes = useStyles();
    return (
        <div
            key={item.name}
            className={classNames(classes.item, {
                [classes.highlight]: highlight,
            })}
        >
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

import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Item, RARITIES } from "./types";
import { COLOR_RARITY_COMMON, COLOR_RARITY_RARE, COLOR_RARITY_UNCOMMON } from "../constants";
import Handlebars from "handlebars";
import { PLAYER_CLASSES } from "../Menu/types";
import { GREEN, resourceClassNameMap } from "../ability/AbilityView/constants";
import { KeywordsTooltips, TooltipSection } from "../view/KeywordsTooltip";
import { Tooltip } from "@mui/material";

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
        boxShadow: "1px 1px 4px rgba(0, 0, 0, 0.75)",
        textAlign: "center",
        position: "relative",
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
        minHeight: 24,
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
    },
    affectsSummons: {
        position: "absolute",
        right: 8,
        top: 8,
        background: GREEN,
        width: "10px",
        height: "10px",
        transform: "rotate(45deg)",
        display: "inline-block",
        margin: "8px",
    },
    tooltip: {
        "&&": {
            maxWidth: "400px",
            background: "none",
            minHeight: "200px",
        },
    },
});

const ItemView = ({
    item,
    highlight,
    className,
    onClick,
    playerClass,
}: {
    item: Item;
    highlight?: boolean;
    className?: string;
    onClick?;
    playerClass?: PLAYER_CLASSES;
}) => {
    const classes = useStyles();
    const interpolatedDescription = Handlebars.compile(item.description || "")({
        ...item,
        resources: resourceClassNameMap[playerClass] || "resource",
    });

    let tooltips;
    if (item.overrideTooltip) {
        if (item.tooltip) {
            tooltips = <TooltipSection {...item.tooltip} />;
        }
    } else {
        tooltips = <KeywordsTooltips object={item} />;
    }

    return (
        <Tooltip title={tooltips} placement={"right-end"} classes={{ tooltip: classes.tooltip }} enterDelay={500}>
            <div
                key={item.name}
                className={classNames(classes.item, className, {
                    [classes.highlight]: highlight,
                })}
                onClick={onClick}
            >
                <img src={item.image} className={classes.itemImage} />
                <div>{item.name}</div>
                {item.applyEffectsToSummons && (
                    <Tooltip title="Your summons also gain this effect.">
                        <span className={classNames(classes.affectsSummons)} />
                    </Tooltip>
                )}
                <div className={classes.rarityContainer}>
                    <hr />
                    <div>
                        <span
                            className={classNames(classes.diamond, {
                                [classes.common]: item.rarity === RARITIES.COMMON || item.rarity === RARITIES.STARTER || !item.rarity,
                                [classes.uncommon]: item.rarity === RARITIES.UNCOMMON,
                                [classes.rare]: item.rarity === RARITIES.RARE,
                            })}
                        />{" "}
                    </div>
                    <hr />
                </div>
                <div>{interpolatedDescription}</div>
            </div>
        </Tooltip>
    );
};

export default ItemView;

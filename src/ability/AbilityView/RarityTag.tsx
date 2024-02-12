import { makeStyles } from "@material-ui/core/styles";
import { COLOR_RARITY_COMMON, COLOR_RARITY_RARE, COLOR_RARITY_UNCOMMON } from "../../constants";
import classNames from "classnames";
import { RARITIES } from "../../item/types";

const useStyles = makeStyles({
    diamond: {
        width: "10px",
        height: "10px",
        marginRight: "4px",
        transform: "rotate(45deg)",
        display: "inline-block",
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
        marginBottom: "16px",
        background: "rgba(10, 10, 10, 0.7)",
        borderRadius: "4px",
        padding: "6px 8px",
        color: COLOR_RARITY_COMMON,
    },
    uncommonText: {
        color: COLOR_RARITY_UNCOMMON,
    },
    rareText: {
        color: COLOR_RARITY_RARE,
    },
});

/**
 * Rarity indicator that appears above a card.
 */
const AbilityRarityTag = ({ ability }) => {
    const classes = useStyles();
    return (
        <div className={classes.rarityContainer}>
            <span
                className={classNames(classes.diamond, {
                    [classes.common]: ability.rarity === RARITIES.COMMON || !ability.rarity,
                    [classes.uncommon]: ability.rarity === RARITIES.UNCOMMON,
                    [classes.rare]: ability.rarity === RARITIES.RARE,
                })}
            />{" "}
            <span
                className={classNames({
                    [classes.uncommonText]: ability.rarity === RARITIES.UNCOMMON,
                    [classes.rareText]: ability.rarity === RARITIES.RARE,
                })}
            >
                {ability.rarity || RARITIES.COMMON}
            </span>
        </div>
    );
};

export default AbilityRarityTag;

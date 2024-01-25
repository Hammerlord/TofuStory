import { createUseStyles } from "react-jss";
import { calculateActionArea } from "../../battle/utils";
import { Ability } from "../types";
import { getDamageStatistics } from "./DamageIcon";
import classNames from "classnames";

const useStyles = createUseStyles({
    root: {
        fontSize: "0.8rem",
    },
    area: {
        width: "14px",
        height: "15px",
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        display: "inline-block",
        fontSize: "0.7rem",
        color: "white",
        verticalAlign: "bottom",

        "&:not(:last-child)": {
            marginRight: "4px",
        },
    },
    mainTarget: {
        width: "14px",
        height: "15px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "inline-block",
        marginRight: "4px",
        color: "white",
        fontSize: "0.7rem",
        verticalAlign: "bottom",
    },
    highlight: {
        color: "#42f57b",
    },
});

const Area = ({
    ability,
    player,
    deck = [],
    hand = [],
    discard = [],
}: {
    ability: Ability;
    player: any;
    deck?: Ability[];
    hand?: Ability[];
    discard?: Ability[];
}) => {
    const { actions = [] } = ability || {};
    const area = calculateActionArea({ action: actions[0], actor: player }) || actions[0]?.area || 0;

    const classes = useStyles();

    if (!area) {
        return null;
    }

    const { damageBonusFromConditions, damageBonusFromEffects, baseDamage, secondaryDamage } = getDamageStatistics({
        ability,
        player,
        deck,
        hand,
        discard,
    });

    const isTextHighlighted = damageBonusFromEffects > 0 || damageBonusFromConditions > 0;

    const areaIndicator = Array.from({ length: area }).map((_, i) => (
        <span
            className={classNames(classes.area, {
                [classes.highlight]: isTextHighlighted,
            })}
            key={i}
        >
            {(secondaryDamage > 0 && secondaryDamage) || (baseDamage > 0 && baseDamage)}
        </span>
    ));
    return (
        <div className={classes.root}>
            Area: {areaIndicator}
            <span
                className={classNames(classes.mainTarget, {
                    [classes.highlight]: isTextHighlighted,
                })}
            >
                {baseDamage > 0 && baseDamage}
            </span>
            {areaIndicator}
        </div>
    );
};

export default Area;

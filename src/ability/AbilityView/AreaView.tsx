import { createUseStyles } from "react-jss";
import { calculateActionArea } from "../../battle/utils";
import { Ability, Action } from "../types";
import { getDamageStatistics } from "./DamageIcon";
import classNames from "classnames";
import { CombatantInfo } from "../../battle/types";

const useStyles = createUseStyles({
    root: {
        fontSize: "0.8rem",
        whiteSpace: "nowrap",
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
    small: {
        width: "11px",
        height: "12px",
        marginRight: "2px",

        "&:not(:last-child)": {
            marginRight: "2px",
        },
    },
    highlight: {
        color: "#42f57b",
    },
});

const Area = ({
    ability,
    playerInfo,
    deck = [],
    hand = [],
    discard = [],
}: {
    ability: { actions: Action[] };
    playerInfo: CombatantInfo;
    deck?: Ability[];
    hand?: Ability[];
    discard?: Ability[];
}) => {
    const { actions = [] } = ability || {};
    const area = calculateActionArea({ action: actions[0], actor: playerInfo }) || actions[0]?.area || 0;

    if (!area) {
        return null;
    }

    const { baseDamage, secondaryDamage, hasBonus } = getDamageStatistics({
        ability,
        playerInfo,
        deck,
        hand,
        discard,
    });

    return <AreaIndicator area={area} hasBonus={hasBonus} baseDamage={baseDamage} secondaryDamage={secondaryDamage} />;
};

export const AreaIndicator = ({
    area,
    hasBonus,
    baseDamage,
    secondaryDamage,
    size,
}: {
    area: number;
    hasBonus?: boolean;
    baseDamage?: number;
    secondaryDamage?: number;
    size?: "sm";
}) => {
    const classes = useStyles();

    const areaIndicator = Array.from({ length: area }).map((_, i) => (
        <span
            className={classNames(classes.area, {
                [classes.highlight]: hasBonus,
                [classes.small]: size === "sm",
            })}
            key={i}
        >
            {(secondaryDamage > 0 && secondaryDamage) || (baseDamage > 0 && baseDamage)}
        </span>
    ));
    return (
        <div className={classes.root}>
            {areaIndicator}
            <span
                className={classNames(classes.mainTarget, {
                    [classes.highlight]: hasBonus,
                    [classes.small]: size === "sm",
                })}
            >
                {baseDamage > 0 && baseDamage}
            </span>
            {areaIndicator}
        </div>
    );
};

export default Area;

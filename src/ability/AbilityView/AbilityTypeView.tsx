import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, Minion, TARGET_TYPES } from "../types";
import { BLUE, GREEN, GREY, RED } from "./constants";

const SIZE = "5px";
const useStyles = createUseStyles({
    root: {
        textAlign: "center",
        fontSize: "0.7rem",
        textTransform: "uppercase",
    },
    inner: {
        lineHeight: "24px",
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
    offensive: {
        borderBottomColor: RED,
        "&:after": {
            borderTopColor: RED,
        },
    },
    support: {
        borderBottomColor: BLUE,
        "&:after": {
            borderTopColor: BLUE,
        },
    },
    minion: {
        borderBottomColor: GREEN,
        "&:after": {
            borderTopColor: GREEN,
        },
    },
    hindrance: {
        borderBottomColor: GREY,
        "&:after": {
            borderTopColor: GREY,
        },
    },
});

const AbilityTypeView = ({ targetType, type, minion }: { targetType: TARGET_TYPES; type: ACTION_TYPES; minion: Minion }) => {
    let typeLabel;
    if (minion) {
        typeLabel = "Summon";
    } else if (type === ACTION_TYPES.HINDER) {
        typeLabel = "Hindrance";
    } else if (targetType === TARGET_TYPES.HOSTILE || targetType === TARGET_TYPES.RANDOM_HOSTILE) {
        typeLabel = "Offensive";
    } else if (targetType === TARGET_TYPES.FRIENDLY) {
        typeLabel = "Support - Ally";
    } else if (targetType === TARGET_TYPES.SELF) {
        typeLabel = "Support - Self";
    }

    const classes = useStyles();
    const diamond = (
        <span
            className={classNames(classes.diamond, {
                [classes.offensive]: targetType === TARGET_TYPES.HOSTILE || targetType === TARGET_TYPES.RANDOM_HOSTILE,
                [classes.support]: targetType === TARGET_TYPES.FRIENDLY || targetType === TARGET_TYPES.SELF,
                [classes.minion]: Boolean(minion),
                [classes.hindrance]: type === ACTION_TYPES.HINDER,
            })}
        />
    );

    return (
        <div className={classes.root}>
            <span className={classes.inner}>
                {diamond}
                <span>{typeLabel}</span>
                {diamond}
            </span>
        </div>
    );
};

export default AbilityTypeView;

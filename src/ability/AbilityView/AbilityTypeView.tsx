import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { TARGET_TYPES } from "../types";

const SIZE = "5px";
const useStyles = createUseStyles({
    root: {
        textAlign: "center",
        fontSize: "0.7rem",
        textTransform: "uppercase",
        marginTop: "4px",
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
        borderBottomColor: "rgb(221, 46, 68)",
        "&:after": {
            borderTopColor: "rgb(221, 46, 68)",
        },
    },
    support: {
        borderBottomColor: "rgb(23, 111, 189)",
        "&:after": {
            borderTopColor: "rgb(23, 111, 189)",
        },
    },
    minion: {
        borderBottomColor: "rgb(50, 168, 82)",
        "&:after": {
            borderTopColor: "rgb(50, 168, 82)",
        },
    },
});

const AbilityTypeView = ({ targetType, minion }) => {
    let typeLabel;
    if (minion) {
        typeLabel = "Summon";
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

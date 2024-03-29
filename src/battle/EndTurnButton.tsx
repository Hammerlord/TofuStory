import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { COMMON_STYLES } from "../constants";

const useStyles = createUseStyles({
    ...COMMON_STYLES,
    root: {
        fontFamily: "Barlow, Arial",
        padding: "8px 16px",
        background: "#ffd736",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "4px",
        border: "2px solid rgba(0, 0, 0, 0.3)",
        boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
        cursor: "pointer",
        transition: "0.25s",
        "&:active": {
            transform: "translate(1.5px, 1.5px)",
        },
        "&.highlight": {
            background: "#25b814",
            color: "white",
            textShadow:
                "0 0 3px rgba(0, 0, 0, 1), 0 0 3px rgba(0, 0, 0, 1), 0 0 2px rgba(0, 0, 0, 1), 0 0 2px rgba(0, 0, 0, 1), 0 0 2px rgba(0, 0, 0, 1)",
        },
        "&.disabled": {
            background: "#cccccc",
            color: "rgba(0, 0, 0, 0.5)",
            cursor: "auto",
            textShadow: "none",
        },
    },
});

const EndTurnButton = ({ disabled, onClick, highlight }) => {
    const classes = useStyles();
    return (
        <button
            className={classNames(classes.root, {
                highlight,
                disabled,
                [classes.highlightAnimation]: highlight && !disabled,
            })}
            disabled={disabled}
            onClick={onClick}
        >
            End Turn
        </button>
    );
};

export default EndTurnButton;

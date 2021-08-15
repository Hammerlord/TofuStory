import classNames from "classnames";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        padding: "8px 16px",
        background: "#ffd736",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "4px",
        border: "2px solid rgba(0, 0, 0, 0.3)",
        boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
        "&.highlight": {
            background: "#25b814",
            color: "white",
        },

        "&.disabled": {
            background: "#cccccc",
            color: "rgba(0, 0, 0, 0.5)",
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
            })}
            disabled={disabled}
            onClick={onClick}
        >
            End Turn
        </button>
    );
};

export default EndTurnButton;

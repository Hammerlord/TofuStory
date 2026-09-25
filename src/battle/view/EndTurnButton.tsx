import classNames from "classnames";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        isolation: "isolate",
        display: "inline-block",
        "&:after": {
            content: "''",
            position: "absolute",
            inset: "-3px",
            borderRadius: "7px",
            zIndex: -1,
            pointerEvents: "none",
            backgroundSize: "300% 300%",
            animationName: "$borderFlow",
            animationDuration: "2.5s",
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
            opacity: 0,
            transition: "opacity 0.15s",
        },
        "&:before": {
            content: "''",
            position: "absolute",
            inset: "-3px",
            borderRadius: "7px",
            zIndex: -1,
            pointerEvents: "none",
            backgroundSize: "300% 300%",
            transformOrigin: "50% 50%",
            opacity: 0,
            animationName: "$borderPulse",
            animationDuration: "1.6s",
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-out",
        },
    },
    // Green "no more playable cards" state:
    highlight: {
        "&:after": {
            background: "linear-gradient(45deg, #8dff9e, #19d94c, #00e676, #1e9e43, #8dff9e)",
            boxShadow: "0 0 12px rgba(46, 200, 80, 0.45)",
            opacity: 1,
        },
        "&:before": {
            background: "linear-gradient(45deg, #8dff9e, #19d94c, #00e676, #1e9e43, #8dff9e)",
            opacity: 1,
        },
        "& button": {
            background: "linear-gradient(360deg, #587100 0%, #adcb08 100%)",
        },
    },
    disabled: {
        "&:after, &:before": {
            opacity: 0,
        },
        "& button": {
            color: "rgba(255, 255, 255, 0.9)",
            opacity: 0.7,
            filter: "brightness(0.9) saturate(0.25)",
            cursor: "auto",
        },
    },
    "@keyframes borderFlow": {
        "0%": {
            backgroundPosition: "0% 50%",
        },
        "50%": {
            backgroundPosition: "100% 50%",
        },
        "100%": {
            backgroundPosition: "0% 50%",
        },
    },
    "@keyframes borderPulse": {
        "0%": {
            transform: "scale(1)",
            opacity: 0.55,
        },
        "70%": {
            transform: "scale(1.18)",
            opacity: 0,
        },
        "100%": {
            transform: "scale(1.18)",
            opacity: 0,
        },
    },
    button: {
        fontFamily: "Barlow, Arial",
        padding: "8px 16px",
        background: "linear-gradient(360deg, #d1830d 0%, #f4b902 100%)",
        fontSize: "16px",
        fontWeight: "bold",
        letterSpacing: "0.05rem",
        color: "rgba(255, 255, 255, 0.9)",
        textStroke: "3px rgba(0,0,0,0.7)",
        WebkitTextStroke: "3px rgba(0,0,0,0.7)",
        textShadow:
            "0 0 2px rgba(0, 0, 0, 1), 0 0 2px rgba(0, 0, 0, 1), 0 0 2px rgba(0, 0, 0, 1), 0 0 2px rgba(0, 0, 0, 1)",
        paintOrder: "stroke fill",
        borderRadius: "4px",
        border: "2px solid rgba(0, 0, 0, 0.3)",
        boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
        cursor: "pointer",
        transition: "0.25s",
        "&:active": {
            transform: "translate(1.5px, 1.5px)",
        },
    },
});

const EndTurnButton = ({
    disabled,
    onClick,
    highlight,
    onHoverChange,
}: {
    disabled: boolean;
    onClick;
    highlight: boolean;
    onHoverChange?: (hovering: boolean) => void;
}) => {
    const classes = useStyles();
    return (
        <div
            className={classNames(classes.root, {
                [classes.highlight]: highlight && !disabled,
                [classes.disabled]: disabled,
            })}
        >
            <button
                className={classes.button}
                disabled={disabled}
                onClick={onClick}
                onMouseEnter={() => onHoverChange?.(true)}
                onMouseLeave={() => onHoverChange?.(false)}
            >
                End Turn
            </button>
        </div>
    );
};

export default EndTurnButton;

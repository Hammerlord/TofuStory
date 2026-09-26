import classNames from "classnames";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    // Pulsing corner frame drawn over the element the keyboard controls are currently
    // pointing at. Render it as the last child of a positioned (eg. position: relative)
    // wrapper around the focused element; it stretches 8px past that wrapper.
    root: {
        position: "absolute",
        inset: "-8px",
        pointerEvents: "none",
        zIndex: 10,
        animation: "$reticlePulse 1.4s ease-in-out infinite",
    },
    corner: {
        position: "absolute",
        width: "26px",
        height: "26px",
        border: "3px solid #d3d3d3",
        filter: "drop-shadow(0 0 3px rgba(0, 0, 0, 0.9))",
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRight: "none",
        borderBottom: "none",
        borderTopLeftRadius: 10,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeft: "none",
        borderBottom: "none",
        borderTopRightRadius: 10,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRight: "none",
        borderTop: "none",
        borderBottomLeftRadius: 10,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeft: "none",
        borderTop: "none",
        borderBottomRightRadius: 10,
    },
    "@keyframes reticlePulse": {
        "0%": {
            opacity: 1,
        },
        "50%": {
            opacity: 0.55,
        },
        "100%": {
            opacity: 1,
        },
    },
});

/**
 * Focus marker for the keyboard controls: a pulsing corner frame drawn over the item
 * currently selected by the arrow keys. Distinct from the selection glow, so a player
 * can tell where they are pointing apart from what is already chosen.
 */
const KeyboardReticle = ({ className }: { className?: string }) => {
    const classes = useStyles();

    return (
        // The literal class name is a stable hook for tests/debugging; the jss class
        // carries the styling.
        <div className={classNames("keyboard-reticle", classes.root, className)}>
            <span className={classNames(classes.corner, classes.topLeft)} />
            <span className={classNames(classes.corner, classes.topRight)} />
            <span className={classNames(classes.corner, classes.bottomLeft)} />
            <span className={classNames(classes.corner, classes.bottomRight)} />
        </div>
    );
};

export default KeyboardReticle;

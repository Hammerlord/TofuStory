import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { BLUE, RED } from "../ability/AbilityView/constants";

const useStyles = createUseStyles({
    "@keyframes throb": {
        from: {
            opacity: 0.5,
        },
        to: {
            opacity: 1,
        },
    },
    root: {
        animationName: "$throb",
        animationDuration: "0.5s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
});

export const DEFAULT_RETICLE_COLOR = "rgba(0, 0, 0, 0.3)";
export const OFFENSE_RETICLE_COLOR = RED;
export const SUPPORT_RETICLE_COLOR = BLUE;

const Reticle = ({ color = DEFAULT_RETICLE_COLOR, className, ...props }) => {
    const classes = useStyles();
    return (
        <div className={classNames(classes.root, className)} {...props}>
            <svg width="100%" height="100%" viewBox="-1 -1 102 102">
                {["m 0 10 Q 0 0 10 0", "m 90 0 Q 100 0 100 10", "M 0 90 Q 0 100 10 100", "M 100 90 Q 100 100 90 100"].map((d) => (
                    <path key={d} d={d} stroke={color} fill="transparent" strokeWidth="2.5" strokeLinecap="round" />
                ))}
            </svg>
        </div>
    );
};

export default Reticle;

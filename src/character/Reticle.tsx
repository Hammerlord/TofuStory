import classNames from "classnames";
import { createUseStyles } from "react-jss";

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

const Reticle = ({ color = "rgba(0, 0, 0, 0.25)", className, ...props }) => {
    const classes = useStyles();
    return (
        <div className={classNames(classes.root, className)} {...props}>
            <svg width="100%" height="100%" viewBox="-1 -1 102 102">
                {[
                    "m 0 10 Q 0 0 10 0",
                    "m 90 0 Q 100 0 100 10",
                    "M 0 90 Q 0 100 10 100",
                    "M 100 90 Q 100 100 90 100",
                ].map((d) => (
                    <path
                        d={d}
                        stroke={color}
                        fill="transparent"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                ))}
            </svg>
        </div>
    );
};

export default Reticle;

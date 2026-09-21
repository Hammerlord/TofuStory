import { ReactNode } from "react";
import { createUseStyles } from "react-jss";

const FADE_IN_TIME = 0.4; // Seconds

const useStyles = createUseStyles({
    "@keyframes fadeIn": {
        "0%": {
            opacity: 0,
        },
        "100%": {
            opacity: 1,
        },
    },
    root: {
        width: "100%",
        height: "100%",
        animationName: "$fadeIn",
        animationDuration: `${FADE_IN_TIME}s`,
        animationTimingFunction: "ease-in",
        animationFillMode: "forwards",
    },
});

const FadeIn = ({ children }: { children: ReactNode }) => {
    const classes = useStyles();
    return <div className={classes.root}>{children}</div>;
};

export default FadeIn;
import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { CloudIcon } from "../../images/icons";

const useStyles = createUseStyles({
    "@keyframes stealthCloud": {
        from: {
            opacity: 0.8,
            transform: "translateY(-8px)",
            filter: "brightness(0.75)",
        },
        to: {
            opacity: 0.2,
            transform: "translateY(0px)",
            filter: "brightness(0.75)",
        },
    },
    root: {
        animationName: "$stealthCloud",
        animationDuration: "1s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        position: "absolute",
        width: "100%",
        height: "100%",
        top: -80,
    },
});

const Stealth = ({ isStealthed }) => {
    const classes = useStyles();
    if (!isStealthed) {
        return null;
    }
    return (
        <div className={classNames(classes.root)}>
            <CloudIcon />
        </div>
    );
};

export default Stealth;

import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Cloud } from "../../images";

const useStyles = createUseStyles({
    "@keyframes stealthCloud": {
        from: {
            opacity: 0.5,
            transform: "translateY(-8px)",
        },
        to: {
            opacity: 0.1,
            transform: "translateY(0px)",
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
        top: "15%",
    },
});

const Stealth = ({ isStealthed }) => {
    const classes = useStyles();
    if (!isStealthed) {
        return null;
    }
    return (
        <div className={classNames(classes.root)}>
            <Cloud />
        </div>
    );
};

export default Stealth;

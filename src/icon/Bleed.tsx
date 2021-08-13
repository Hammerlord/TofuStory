import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { Blood } from "../images";
import Icon from "./Icon";

const ANIMATION_DURATION = 3;

const useStyles = createUseStyles({
    "@keyframes animation": {
        '0%': {
            opacity: 1,
            transform: "translateY(-15%)",
        },
        '75%': {
            opacity: 1,
            transform: "translateY(-15%)",
        },
        '100%': {
            opacity: 0,
            transform: "translateY(25%)",
        },
    },
    refresh: {
        "& .icon": {
            animationName: "$animation",
            animationDuration: `${ANIMATION_DURATION}s`,
            animationIterationCount: "infinite",
        },
    },
    hidden: {
        opacity: 0,
    },
});

const Bleed = ({ amount }) => {
    const [oldAmount, setOldAmount] = useState(0);
    useEffect(() => {
        let timeout;
        if (amount > oldAmount) {
            timeout = setTimeout(() => {
                setOldAmount(amount);
            }, ANIMATION_DURATION * 1000);
        } else {
            setOldAmount(amount);
        }
        return () => clearTimeout(timeout);
    }, [amount]);
    const classes = useStyles();

    return (
        <Icon
            size="lg"
            icon={<Blood />}
            text={amount}
            className={classNames({
                [classes.refresh]: true,
                [classes.hidden]: amount === 0,
            })}
        />
    );
};

export default Bleed;

import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { Shield } from "../images";
import Icon from "./Icon";

const ANIMATION_DURATION = 0.5;

const useStyles = createUseStyles({
    "@keyframes refreshAnimation": {
        from: {
            opacity: 0,
            transform: "translateY(-150%)",
        },
        to: {
            opacity: 1,
            transform: "translateY(0)",
        },
    },
    refresh: {
        "& .icon": {
            animationName: "$refreshAnimation",
            animationDuration: `${ANIMATION_DURATION}s`,
            animationDelay: "0s",
        },
    },
    hidden: {
        opacity: 0,
    },
});

const Armor = ({ amount, className }) => {
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
            icon={<Shield />}
            text={amount}
            className={classNames(className, {
                [classes.refresh]: amount > oldAmount,
                [classes.hidden]: amount === 0,
            })}
        />
    );
};

export default Armor;

import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { Shield } from "../images";
import Tooltip from "../view/Tooltip";
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
    tooltipTitle: {
        fontSize: "1.1rem",
        marginBottom: "4px",
    },
    tooltipContents: {
        display: "flex",
    },
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    iconContainer: {
        marginRight: "16px",
    },
});

interface ArmorInterface {
    amount: number;
    className?: string;
}

const Armor = ({ amount, className }: ArmorInterface) => {
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
        <Tooltip
            title={
                <div className={classes.tooltipContents}>
                    <div className={classes.iconContainer}>
                        <Icon size="lg" icon={<Shield />} />
                    </div>
                    <div className={classes.container}>
                        <div className={classes.tooltipTitle}>Armor</div>
                        <div>
                            Blocks damage from incoming attacks. When the character's turn starts, the current amount of armor reduces by
                            half.
                        </div>
                    </div>
                </div>
            }
            arrow
        >
            <span>
                <Icon
                    size="lg"
                    icon={<Shield />}
                    text={amount}
                    className={classNames(className, {
                        [classes.refresh]: amount > oldAmount,
                        [classes.hidden]: amount === 0,
                    })}
                />
            </span>
        </Tooltip>
    );
};

export default Armor;

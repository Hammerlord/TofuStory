import { Tooltip } from "@material-ui/core";
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
    tooltip: {
        display: "flex",
        fontSize: "0.8rem",
        padding: "8px",
        fontFamily: "Barlow",
        fontWeight: "500",
        lineHeight: "24px",
    },
    tooltipTitle: {
        fontSize: "1.1rem",
        marginBottom: "4px",
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
                <div className={classes.tooltip}>
                    <div className={classes.iconContainer}>
                        <Icon size="lg" icon={<Shield />} />
                    </div>
                    <div className={classes.container}>
                        <div className={classes.tooltipTitle}>Armor</div>
                        <div>Blocks damage from incoming attacks</div>
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

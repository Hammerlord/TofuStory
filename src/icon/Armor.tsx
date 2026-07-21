import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { PristineShieldIcon, ShieldIcon } from "../images/icons";
import Tooltip from "../view/Tooltip";
import Icon from "./Icon";
import { CombatantInfo } from "../battle/types";
import { getEnabledEffects } from "../battle/utils";
import { useAppSelector } from "../hooks";
import { BattleState } from "../battle/reducer";

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
    "@keyframes hideAnimation": {
        from: {
            opacity: 1,
        },
        to: {
            opacity: 0,
        },
    },
    hidden: {
        "& .icon": {
            animationName: "$hideAnimation",
            animationDuration: `${ANIMATION_DURATION}s`,
            animationDelay: "0s",
        },
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
    "@keyframes shakeAnimation": {
        from: {
            opacity: 0.9,
            transform: "translateX(-5%)",
        },
        to: {
            opacity: 1,
            transform: "translateX(5%)",
        },
    },
    shake: {
        "& .icon": {
            animationName: "$shakeAnimation",
            animationDuration: `0.1s`,
            animationDelay: "0s",
            animationIterationCount: "infinite",
            animationDirection: "alternate-reverse",
        },
    },
});

interface ArmorInterface {
    amount: number;
    className?: string;
    combatantInfo: CombatantInfo;
}

const Armor = ({ amount, className, combatantInfo }: ArmorInterface) => {
    const [oldAmount, setOldAmount] = useState(0);
    const selectedAlly: string | null = useAppSelector((state) => (state.battle as BattleState).selectedAllyId);
    const selectedAbility: string | null = useAppSelector((state) => (state.battle as BattleState).selectedHandAbilityId);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setOldAmount(amount);
        }, ANIMATION_DURATION * 1000);

        return () => clearTimeout(timeout);
    }, [amount]);
    const classes = useStyles();

    if (oldAmount === 0 && !amount) {
        return null;
    }

    const effects = getEnabledEffects({ combatantInfo });
    const pristineArmorEffect = effects.find((e) => e.preventArmorDecay);

    const inner = (
        <span>
            <Icon
                size="lg"
                icon={pristineArmorEffect ? <PristineShieldIcon /> : <ShieldIcon />}
                text={amount}
                className={classNames(className, {
                    [classes.refresh]: amount > oldAmount,
                    [classes.hidden]: amount === 0,
                    [classes.shake]: oldAmount > amount,
                })}
            />
        </span>
    );

    if (selectedAlly || selectedAbility) {
        return inner;
    }

    return (
        <Tooltip
            title={
                <div className={classes.tooltipContents}>
                    <div className={classes.iconContainer}>
                        <Icon size="lg" icon={<ShieldIcon />} />
                    </div>
                    <div className={classes.container}>
                        <div className={classes.tooltipTitle}>Armor</div>
                        <div>Blocks damage. Decays by half at the start of every turn.</div>
                        {pristineArmorEffect && (
                            <div>
                                <hr />
                                <div>Modifiers:</div>
                                <span>
                                    <Icon icon={pristineArmorEffect.icon || PristineShieldIcon} size="sm" /> - Prevents armor decay
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            }
            arrow
        >
            {inner}
        </Tooltip>
    );
};

export default Armor;

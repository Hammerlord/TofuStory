import { Box } from "@mui/material";
import { Action } from "../ability/types";
import { MesoCoinImage, MesoImage, MesoStackImage } from "../images";
import { Combatant } from "./types";
import { useEffect, useRef, useState } from "react";
import { playTossUpAnimation } from "./animations";
import { createUseStyles } from "react-jss";
import { UpdatedCombatantStats } from "../battle/actions/getUpdatedStats";

const getMoneyImage = (amount: number) => {
    if (amount >= 25) {
        return MesoStackImage;
    } else if (amount >= 10) {
        return MesoCoinImage;
    } else {
        return MesoImage;
    }
};

const useStyles = createUseStyles({
    coin: {
        opacity: 0,
    },
});

const Coin = ({
    action,
    statChanges,
    playbackDelay,
    combatant,
    isDeathBlow = false,
}: {
    action?: Action;
    statChanges: UpdatedCombatantStats;
    playbackDelay: number;
    combatant: Combatant;
    isDeathBlow: boolean;
}) => {
    const classes = useStyles();

    const amount = Math.abs(action?.mesos || action?.stealMesos || statChanges?.mesos || (isDeathBlow && combatant?.mesos) || 0);

    const [coins, setCoins] = useState<number[]>([]);
    const nextCoinId = useRef(0);

    useEffect(() => {
        if (!amount) {
            return;
        }

        const timeout = setTimeout(() => {
            setCoins((current) => [...current, nextCoinId.current++]);
        }, playbackDelay || 500);

        return () => {
            clearTimeout(timeout);
        };
    }, [amount, playbackDelay]);

    if (!amount) {
        return null;
    }

    const moneyImage = getMoneyImage(amount);

    return (
        <>
            {coins.map((coinId) => (
                <CoinInstance
                    key={coinId}
                    moneyImage={moneyImage}
                    classes={classes}
                    onComplete={() => {
                        setCoins((current) => current.filter((id) => id !== coinId));
                    }}
                />
            ))}
        </>
    );
};

const CoinInstance = ({
    moneyImage,
    classes,
    onComplete,
}: {
    moneyImage: string;
    classes: ReturnType<typeof useStyles>;
    onComplete: () => void;
}) => {
    const ref = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const animations = playTossUpAnimation({
            from: ref.current,
            spin: false,
            flash: false,
            flipY: [MesoImage, MesoCoinImage].includes(moneyImage),
        });

        animations.forEach((animation) => {
            if (animation?.finished) {
                animation.finished.then(onComplete).catch(() => {});
            }
        });
    }, [onComplete]);

    return (
        <Box
            sx={{
                position: "absolute",
                left: "50%",
                bottom: "50%",
                transform: "translate(-50%, 0)",
                width: 30,
                height: 30,
                pointerEvents: "none",

                "& img": {
                    display: "block",
                    width: "100%",
                    height: "100%",
                },
            }}
        >
            <img src={moneyImage} alt="meso" ref={ref} className={classes.coin} />
        </Box>
    );
};

export default Coin;

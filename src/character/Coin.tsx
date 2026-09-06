import { Box } from "@mui/material";
import { Action } from "../ability/types";
import { MesoCoinImage, MesoImage, MesoStackImage } from "../images";
import { Combatant } from "./types";
import { useEffect, useRef } from "react";
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
    let amount = action?.mesos || action?.stealMesos || statChanges?.mesos || (isDeathBlow && combatant?.mesos);
    amount = Math.abs(amount);

    const ref = useRef(null);
    const classes = useStyles();

    useEffect(() => {
        if (!amount || !ref.current) {
            return;
        }

        const timeout = setTimeout(() => {
            playTossUpAnimation({ from: ref.current, spin: false, flash: false });
        }, playbackDelay || 500);

        return () => {
            clearTimeout(timeout);
        };
    }, [amount]);

    if (!amount) {
        return;
    }

    const moneyImage = getMoneyImage(amount);

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

import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { BATTLE_STATES } from "../../states";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        overflow: "hidden",
        width: "225px",
        padding: "18px",
        paddingRight: "32px",
        fontSize: "1.25rem",
        textAlign: "right",
        color: "white",
        fontWeight: "bold",
        transition: "width 0.3s ease",
        zIndex: 0,
    },
    expanded: {
        width: "350px",
    },
    red: {
        position: "absolute",
        inset: 0,
        zIndex: -1,
        background:
            "linear-gradient(270deg, rgb(145, 0, 14) 0%, rgba(170, 25, 40, 0.5) 70%, rgba(170, 25, 40, 0) 100%)",

        transition: ({ duration }: { duration: number }) => `opacity ${duration / 1000}s ease`,
    },
    blue: {
        position: "absolute",
        inset: 0,
        zIndex: -1,
        background:
            "linear-gradient(270deg, rgb(0, 80, 185) 0%, rgba(15, 70, 140, 0.5) 70%, rgba(15, 70, 140, 0) 100%)",

        transition: ({ duration }: { duration: number }) => `opacity ${duration / 1000}s ease`,
    },
    visible: {
        opacity: 1,
    },

    hidden: {
        opacity: 0,
    },
});

const TurnAnnouncement = ({
    battlePhase,
    isPlayerTurn,
    duration = 300,
}: {
    battlePhase: BATTLE_STATES;
    isPlayerTurn: boolean;
    duration?: number;
}) => {
    const classes = useStyles({ duration });
    const [expanded, setExpanded] = useState(false);

    const isStartingBattlePhase =
        battlePhase === BATTLE_STATES.BATTLE_START || battlePhase === BATTLE_STATES.WAVE_START;

    useEffect(() => {
        if (isStartingBattlePhase) {
            return;
        }

        setExpanded(true);

        const timeout = setTimeout(() => {
            setExpanded(false);
        }, duration / 2);

        return () => clearTimeout(timeout);
    }, [isPlayerTurn, isStartingBattlePhase]);

    if (isStartingBattlePhase) {
        return null;
    }

    return (
        <div className={`${classes.root} ${expanded ? classes.expanded : ""}`}>
            <div className={`${classes.red} ${isPlayerTurn ? classes.hidden : classes.visible}`} />

            <div className={`${classes.blue} ${isPlayerTurn ? classes.visible : classes.hidden}`} />

            {isPlayerTurn ? "Player Turn" : "Enemy Turn"}
        </div>
    );
};

export default TurnAnnouncement;

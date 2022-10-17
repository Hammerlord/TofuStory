import { createUseStyles } from "react-jss";
import { Wave } from "./types";

const useStyles = createUseStyles({
    root: {
        background: "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        width: "200px",
        padding: "8px 16px",
        fontSize: "1rem",
        textAlign: "left",
        color: "white",
    },
    currentWave: {
        fontWeight: "600",
        fontSize: "1.3rem",
    },
});

const WaveInfo = ({ waves, currentWaveIndex, cleared }: { waves: Wave[]; currentWaveIndex: number; cleared: boolean }) => {
    const wave = waves[currentWaveIndex];

    if (!wave) {
        return null;
    }

    const { defeatBoss } = wave.winCondition || {};
    const classes = useStyles();

    let messageNode;
    if (defeatBoss) {
        messageNode = <div>Defeat the boss</div>;
    } else {
        messageNode = <div>Defeat all enemies</div>;
    }
    return (
        <div className={classes.root}>
            <div className={classes.currentWave}>
                Wave {currentWaveIndex + 1} / {waves.length}
            </div>
            {messageNode}
        </div>
    );
};

export default WaveInfo;

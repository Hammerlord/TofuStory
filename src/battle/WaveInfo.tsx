import { createUseStyles } from "react-jss";
import { Wave } from "./types";
import { JapaneseOgreIcon } from "../images/icons";
import Icon from "../icon/Icon";

const useStyles = createUseStyles({
    root: {
        background: "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 70%, rgba(0,212,255,0) 100%)",
        width: "250px",
        padding: "8px 16px",
        paddingRight: "32px",
        fontSize: "1rem",
        textAlign: "left",
        color: "white",
    },
    currentWave: {
        fontWeight: "600",
        fontSize: "1.3rem",
    },
    boss: {
        color: "rgb(255, 175, 150)",
    },
    currentRound: {
        marginLeft: "24px",
        fontSize: "1.2rem",
    },
});

const WaveInfo = ({ waves, currentWaveIndex, round }: { waves: Wave[]; currentWaveIndex: number; round: number }) => {
    const wave = waves[currentWaveIndex];

    if (!wave) {
        return null;
    }

    const { defeatBoss, surviveRounds } = wave.winCondition || {};
    const classes = useStyles();

    let messageNode;
    if (defeatBoss) {
        messageNode = (
            <div>
                Defeat the <Icon icon={JapaneseOgreIcon} size="sm" /> <span className={classes.boss}>boss</span>
            </div>
        );
    } else if (surviveRounds) {
        messageNode = <div>Survive {surviveRounds} turns</div>;
    } else {
        messageNode = <div>Defeat all enemies</div>;
    }
    return (
        <div className={classes.root}>
            <div>
                <span className={classes.currentWave}>
                    Wave {currentWaveIndex + 1} of {waves.length}
                </span>
                <span className={classes.currentRound}>Turn {round || 1}</span>
            </div>
            {messageNode}
        </div>
    );
};

export default WaveInfo;

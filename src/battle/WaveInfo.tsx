import { createUseStyles } from "react-jss";
import { Wave } from "../Menu/tutorial";

const useStyles = createUseStyles({
    root: {
        background:
            "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
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

const WaveInfo = ({
    waves,
    currentIndex,
    cleared,
}: {
    waves: Wave[];
    currentIndex: number;
    cleared: boolean;
}) => {
    const wave = waves[currentIndex];

    if (!wave) {
        return null;
    }

    const { surviveRounds } = wave.winCondition || {};
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <div className={classes.currentWave}>
                Wave {currentIndex + 1} / {waves.length}
            </div>
            {surviveRounds ? (
                <div>
                    Survive {surviveRounds} round{surviveRounds > 1 && "s"}
                </div>
            ) : (
                <div>Defeat all enemies</div>
            )}
        </div>
    );
};

export default WaveInfo;

import { createUseStyles } from "react-jss";

interface BattleEndOverlay {
    result: "Victory" | "Defeat" | "Draw";
}

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        position: "fixed",
        background: "rgba(0, 0, 0, 0.25)",
        zIndex: "3",
    },
    inner: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        color: "white",
        textAlign: "center"
    },
    continue: {
        fontSize: "20px",
    },
});

const BattleEndOverlay = ({ result, onClickContinue }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <h2>{result}</h2>
                <button className={classes.continue} onClick={onClickContinue}>
                    Continue
                </button>
            </div>
        </div>
    );
};

export default BattleEndOverlay;

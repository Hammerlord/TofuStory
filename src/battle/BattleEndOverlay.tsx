import { createUseStyles } from "react-jss";
import Overlay from "./Overlay";

interface BattleEndOverlay {
    result: "Victory" | "Defeat" | "Draw";
}

const useStyles = createUseStyles({
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
        <Overlay>
            <div className={classes.inner}>
                <h2>{result}</h2>
                <button className={classes.continue} onClick={onClickContinue}>
                    Continue
                </button>
            </div>
        </Overlay>
    );
};

export default BattleEndOverlay;

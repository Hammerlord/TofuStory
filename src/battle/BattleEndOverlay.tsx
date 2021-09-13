import { createUseStyles } from "react-jss";
import Overlay from "../view/Overlay";
import Rewards from "./Rewards";

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
        textAlign: "center",
        width: "100%",
        height: "100%",
    },
    continue: {
        fontSize: "20px",
    },
});

const BattleEndOverlay = ({ result, onClickContinue, rewards, deck, onUpdateDeck }) => {
    const classes = useStyles();

    return (
        <Overlay>
            {result === "Victory" && (
                <div className={classes.inner}>
                    <Rewards deck={deck} updateDeck={onUpdateDeck} onClose={() => onClickContinue()} />
                </div>
            )}
            {result === "Defeat" && (
                <button className={classes.continue} onClick={onClickContinue}>
                    Continue
                </button>
            )}
        </Overlay>
    );
};

export default BattleEndOverlay;

import { Button } from "@material-ui/core";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";

const useStyles = createUseStyles({
    root: {
        background: "rgba(75, 75, 75, 0.95)",
        width: "calc(100% - 20vw)",
        height: "calc(100% - 20vh)",
        position: "absolute",
        marginTop: "80px",
        zIndex: 5,
        borderRadius: "16px",
        padding: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        overflow: "auto",
    },
    abilityContainer: {
        margin: "16px",
        marginTop: "32px",
        display: "inline-block",
    },
    closeBar: {
        width: "100%",
        color: "white",
        fontWeight: 500,
        background: "none",
        border: "none",
        borderBottom: "1px solid rgba(255, 255, 255, 0.6)",
        paddingBottom: "16px",
        fontSize: "1.1rem",
    },
});

const DeckViewer = ({ deck, onClose }) => {
    const classes = useStyles();
    deck = deck.sort((a, b) => {
        return a.resourceCost || 0 - (b.resourceCost || 0);
    });
    return (
        <div className={classes.root}>
            <button className={classes.closeBar} onClick={onClose}>
                Close
            </button>
            {deck.map((card, i) => (
                <div className={classes.abilityContainer} key={i}>
                    <AbilityView ability={card} />
                </div>
            ))}
        </div>
    );
};

export default DeckViewer;

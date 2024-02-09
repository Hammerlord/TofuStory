import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { ClickAwayListener } from "@material-ui/core";
import { HandAbility } from "../ability/types";

const useStyles = createUseStyles({
    root: {
        background: "rgba(15, 15, 15, 0.9)",
        width: "calc(80vw)",
        height: "calc(80vh)",
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
        verticalAlign: "top",
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
        fontFamily: "barlow",
        cursor: "pointer",
    },
});

const DeckViewer = ({ deck, onClose, player }: { deck: HandAbility[]; onClose; player }) => {
    const classes = useStyles();
    const getResourceCost = (ability: HandAbility): number => {
        if (ability.resourceCost === "x") {
            return Infinity;
        }

        if (!ability.resourceCost) {
            return 0;
        }

        return ability.resourceCost;
    };

    deck = deck.slice().sort((a, b) => {
        return getResourceCost(a) - getResourceCost(b);
    });
    return (
        <ClickAwayListener onClickAway={onClose}>
            <div className={classes.root}>
                <button className={classes.closeBar} onClick={onClose}>
                    Close
                </button>
                {deck.map((card: HandAbility) => (
                    <div className={classes.abilityContainer} key={card.instanceId}>
                        <AbilityView ability={card} deck={deck} hand={[]} discard={[]} player={player} disableGlow={true} />
                    </div>
                ))}
            </div>
        </ClickAwayListener>
    );
};

export default DeckViewer;

import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { CombatAbility } from "../ability/types";

const useStyles = createUseStyles({
    root: {
        background: "rgba(15, 15, 15, 0.9)",
        width: "calc(80vw)",
        height: "calc(80vh)",
        position: "absolute",
        marginTop: "88px",
        zIndex: 5,
        borderRadius: "16px",
        padding: "24px",
        paddingTop: "0",
        left: "50%",
        transform: "translateX(-50%)",
        overflow: "auto",
        textAlign: "center",
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
        paddingTop: 24,
        fontSize: "1.1rem",
        fontFamily: "barlow",
        cursor: "pointer",
    },
});

const DeckViewer = ({ deck, onClose }: { deck: CombatAbility[]; onClose; player }) => {
    const classes = useStyles();
    const getResourceCost = (ability: CombatAbility): number => {
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
                {deck.map((card: CombatAbility) => (
                    <div className={classes.abilityContainer} key={card.instanceId}>
                        <AbilityView ability={card} disableGlow={true} disableBattleBonuses={true} />
                    </div>
                ))}
            </div>
        </ClickAwayListener>
    );
};

export default DeckViewer;

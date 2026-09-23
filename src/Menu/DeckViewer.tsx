import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { ClickAwayListener } from "@mui/material";
import { CombatAbility } from "../ability/types";
import CardSortControls, { useCardSort } from "./CardSortControls";
import { scrollFade } from "./cardGridStyles";

const useStyles = createUseStyles({
    root: {
        background: "rgba(15, 15, 15, 0.9)",
        width: "calc(80vw)",
        height: "calc(80vh)",
        position: "absolute",
        top: "88px",
        zIndex: 5,
        borderRadius: "8px",
        padding: "24px",
        paddingTop: "0",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
    },
    cardsSection: {
        overflow: "auto",
        flex: 1,
        minHeight: 0,
        marginTop: "16px",
        ...scrollFade,
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
    sortControls: {
        marginTop: "16px",
    },
});

const DeckViewer = ({
    deck,
    onClose,
    onClickAbility = () => {},
}: {
    deck: CombatAbility[];
    onClose: () => void;
    onClickAbility?: (card: CombatAbility) => void;
}) => {
    const classes = useStyles();
    const { sortedCards, sortBy, setSortBy, sortDirection, toggleSortDirection } =
        useCardSort(deck);

    return (
        <ClickAwayListener onClickAway={onClose}>
            <div className={classes.root}>
                <button className={classes.closeBar} onClick={onClose}>
                    Close
                </button>
                <div className={classes.sortControls}>
                    <CardSortControls
                        sortBy={sortBy}
                        onSortByChange={setSortBy}
                        sortDirection={sortDirection}
                        onSortDirectionChange={toggleSortDirection}
                    />
                </div>
                <div className={classes.cardsSection}>
                    {sortedCards.map((card: CombatAbility) => (
                        <div className={classes.abilityContainer} key={card.instanceId}>
                            <AbilityView
                                ability={card}
                                disableGlow={true}
                                disableBattleBonuses={true}
                                onClick={() => onClickAbility(card)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </ClickAwayListener>
    );
};

export default DeckViewer;
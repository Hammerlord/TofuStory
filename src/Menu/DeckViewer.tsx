import { createUseStyles } from "react-jss";
import classNames from "classnames";
import AbilityView from "../ability/AbilityView/AbilityView";
import { ClickAwayListener } from "@mui/material";
import { CombatAbility } from "../ability/types";
import CardSortControls, { useCardSort } from "./CardSortControls";
import { scrollFade } from "./cardGridStyles";
import {
    panelKeyframes,
    slideFadeInStyle,
    slideFadeOutStyle,
    useCardStaggerAnimation,
    usePanelTransition,
} from "./panelAnimation";

const useStyles = createUseStyles({
    ...panelKeyframes,
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
        ...slideFadeInStyle,
        "&.panelClosing": {
            ...slideFadeOutStyle,
        },
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
    const { isClosing, close, closeDuration } = usePanelTransition();
    const { setCardRef, animateCardsOut } = useCardStaggerAnimation();
    const { sortedCards, sortBy, setSortBy, sortDirection, toggleSortDirection } =
        useCardSort(deck);

    const handleClose = () => {
        close(onClose, animateCardsOut());
    };

    return (
        <ClickAwayListener onClickAway={handleClose}>
            <div
                className={classNames(classes.root, { panelClosing: isClosing })}
                style={{ animationDuration: isClosing ? `${closeDuration}ms` : undefined }}
            >
                <button className={classes.closeBar} onClick={handleClose}>
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
                    {sortedCards.map((card: CombatAbility, index: number) => (
                        <div
                            className={classes.abilityContainer}
                            key={card.instanceId}
                            ref={setCardRef(index)}
                        >
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
import { useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "./AbilityView/AbilityView";

const useStyles = createUseStyles({
    root: {
        position: "fixed",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        background: "#999",
        "& ::-webkit-scrollbar": {
            width: "10px",
        },

        "& ::-webkit-scrollbar-track": {
            background: "transparent",
        },

        "& ::-webkit-scrollbar-thumb": {
            background: "rgba(0, 0, 0, 0.25)",
            borderRadius: "10px",
            border: "4px solid transparent"
        },

        "& ::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0, 0, 0, 0.4)",
        },
    },
    inner: {
        background: "#f5ebcb",
        display: "flex",
        width: "100%",
        margin: "auto",
        height: "100%",
    },
    albumContainer: {
        width: "80%",
        overflowY: "scroll",
    },
    albumCardContainer: {
        padding: '16px',
    },
    header: {
        padding: "16px",
        borderBottom: "1px solid #aaa",
    },
    count: {
        textAlign: "center",
        marginTop: "8px",
        "& button": {
            marginLeft: "16px",
        },
    },
    deckContainer: {
        width: "20%",
        overflowY: "scroll",
        position: "relative",
        display: "flex",
        flexDirection: "column",
    },
    deckCard: {
        display: "flex",
        justifyContent: "space-between",
        border: "1px solid rgba(0, 0, 0, 0.5)",
        borderRadius: "2px",
        background: "rgba(0, 0, 0, 0.7)",
        color: "white",
    },
    deckCardName: {
        padding: "8px 16px",
    },
    deckHeader: {
        padding: "16px 8px",
    },
    removeCard: {
        fontWeight: "bold",
        fontSize: "20px",
        padding: "8px 16px",
        cursor: "pointer",
    },
    saveButtonContainer: {
        position: "absolute",
        bottom: "0",
        padding: "8px",
    },
    abilityContainer: {
        display: "inline-block",
        padding: "16px",
    },
});

const DeckEditor = ({ allCards, onSaveDeck, onBack, currentDeck }) => {
    const [workingDeck, setWorkingDeck] = useState(currentDeck.slice());
    const [allCardsCount] = useState(
        allCards.reduce((acc, ability) => {
            if (!acc[ability.name]) {
                acc[ability.name] = 1;
            } else {
                acc[ability.name] += 1;
            }
            return acc;
        }, {})
    );

    const workingDeckCardsCount = workingDeck.reduce((acc, ability) => {
        if (!acc[ability.name]) {
            acc[ability.name] = 1;
        } else {
            acc[ability.name] += 1;
        }
        return acc;
    }, {});

    const allCardsOrder = Object.keys(allCardsCount).sort();

    const classes = useStyles();

    const handleRemoveCard = (i) => {
        const updatedDeck = workingDeck.slice();
        updatedDeck.splice(i, 1);
        setWorkingDeck(updatedDeck);
    };

    const handleAddCard = (cardName) => {
        if (allCardsCount[cardName] - (workingDeckCardsCount[cardName] || 0) > 0) {
            setWorkingDeck([
                ...workingDeck,
                allCards.find((card) => card.name === cardName),
            ]);
        }
    };

    const getNumLeft = (cardName) => {
        return (
            (allCardsCount[cardName] || 0) -
            (workingDeckCardsCount[cardName] || 0)
        );
    };

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <div className={classes.albumContainer}>
                    <div className={classes.header}>
                        <button onClick={onBack}>Back</button>
                    </div>
                    <div className={classes.albumCardContainer}>
                    {allCardsOrder.map((cardName) => (
                        <div
                            key={cardName}
                            className={classes.abilityContainer}
                        >
                            <AbilityView
                                ability={allCards.find(
                                    (card) => card.name === cardName
                                )}
                            />
                            <div className={classes.count}>
                                {getNumLeft(cardName)} /{" "}
                                {allCardsCount[cardName]} left
                                <button
                                    disabled={getNumLeft(cardName) <= 0}
                                    onClick={() => handleAddCard(cardName)}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
                <div className={classes.deckContainer}>
                    <div className={classes.deckHeader}>
                        {workingDeck.length} / 30 abilities
                    </div>
                    {workingDeck.map((ability, i) => (
                        <div key={i} className={classes.deckCard}>
                            <span className={classes.deckCardName}>
                                {ability.name}
                            </span>
                            <span
                                onClick={() => handleRemoveCard(i)}
                                className={classes.removeCard}
                            >
                                -
                            </span>
                        </div>
                    ))}
                    <div className={classes.saveButtonContainer}>
                        <button onClick={() => onSaveDeck(workingDeck)}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeckEditor;

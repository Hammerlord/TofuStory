import { Button } from "@material-ui/core";
import classNames from "classnames";
import { compose, flatten, repeat } from "ramda";
import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import {
    bluemushroomCard,
    bluesnailCard,
    cardback,
    coldeyeCard,
    crabCard,
    curseeyeCard,
    drakeCard,
    evileyeCard,
    hornymushroomCard,
    kargoCard,
    lupinCard,
    octopusCard,
    pigCard,
    ribbonPigCard,
    turtleCard,
    wraithCard,
} from "../images";
import { getRandomItem, shuffle } from "../utils";
import Overlay from "../view/Overlay";
import TurnAnnouncement from "./../battle/TurnNotification";

const useStyles = createUseStyles({
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
        width: "100%",
    },
    cardContainer: {
        position: "relative",
        width: 118,
        height: 148,
        display: "inline-block",
        margin: "4px",
        verticalAlign: "bottom",
        cursor: "pointer",
        "&.flip $cardInner": {
            transform: "rotateY(180deg)",
        },
    },
    cardInner: {
        transformStyle: "preserve-3d",
        width: "100%",
        height: "100%",
        transition: "all 0.75s linear",
        "&.hidden": {
            display: "none",
        },
    },
    card: {
        backfaceVisibility: "hidden",
        position: "relative",
        display: "inline-block",
        width: "100%",
        height: "100%",
        transform: "rotateY(180deg)",
    },
    cardBack: {
        background: `url(${cardback}) no-repeat`,
        backgroundSize: "100% 100%",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        width: "100%",
        height: "100%",
        display: "inline-block",
        position: "absolute",
        top: 0,
        left: 0,
        borderRadius: "4px",
    },
});

const getRandomizedDeck = () => {
    const cards = [
        bluemushroomCard,
        bluesnailCard,
        coldeyeCard,
        crabCard,
        curseeyeCard,
        drakeCard,
        evileyeCard,
        hornymushroomCard,
        kargoCard,
        lupinCard,
        octopusCard,
        pigCard,
        ribbonPigCard,
        turtleCard,
        wraithCard,
    ];

    return compose(shuffle, flatten, (cards) => repeat(cards, 2))(cards);
};

const CARD_RANGE_TO_FLIP = 3;

const CardGame = ({ onExit }) => {
    const [cardLayout] = useState(getRandomizedDeck());
    const [flippedCardIndex, setFlippedCardIndex] = useState(null);
    const [selectedCardIndices, setSelectedCardIndices] = useState([null, null]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(null);
    const [disableUI, setDisableUI] = useState(true);
    const [showTurnAnnouncement, setShowTurnAnnouncement] = useState(false);
    const [matchedCards, setMatchedCards] = useState([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [opponentSelections, setOpponentSelections] = useState([]);
    const classes = useStyles();
    const cardsRemaining = cardLayout.length - matchedCards.filter((_, i) => matchedCards[i]).length;

    useEffect(() => {
        // Intro
        let i = -CARD_RANGE_TO_FLIP;
        const flip = () => {
            setFlippedCardIndex(i);
            ++i;
            if (i < cardLayout.length + CARD_RANGE_TO_FLIP) {
                setTimeout(() => {
                    flip();
                }, 250);
            } else {
                setTimeout(() => {
                    setIsPlayerTurn(true);
                }, 1000);
            }
        };
        flip();
    }, []);

    const handleOpponentTurn = () => {
        // Opponent turn
        const selectRandomCardIndex = (excluding = []) => {
            return getRandomItem(cardLayout.map((_, i) => i).filter((i) => !matchedCards[i] && !excluding.includes(i)));
        };
        let indices = [selectRandomCardIndex()];

        const getCorrectCardMatch = () => {
            const index = indices[indices.length - 1];
            return cardLayout.findIndex((card, i) => card === cardLayout[index] && index !== i);
        };

        let chance = 0.5;
        const rollCard = () => {
            let index: number;
            if (indices.length % 2 === 0 || Math.random() > chance) {
                index = selectRandomCardIndex(indices); // This could be a match
            } else {
                index = getCorrectCardMatch();
            }
            const isMatch = cardLayout[index] === cardLayout[indices[indices.length - 1]];
            indices.push(index);
            const needsMatchingCard = indices.length % 2 !== 0;

            if ((isMatch || needsMatchingCard) && indices.length < cardsRemaining) {
                rollCard();
            }
        };

        rollCard();
        setOpponentSelections(indices);
    };

    useEffect(() => {
        if (!opponentSelections.length) {
            return;
        }

        const newSelections = opponentSelections.slice();
        const selection = newSelections.shift();
        handleSelectCard(selection);
        setTimeout(() => {
            setOpponentSelections(newSelections);
        }, 1500);
    }, [opponentSelections]);

    useEffect(() => {
        if (isPlayerTurn === null) {
            return;
        }
        setTimeout(() => {
            setShowTurnAnnouncement(true);
            setTimeout(() => {
                setShowTurnAnnouncement(false);
                if (!isPlayerTurn) {
                    handleOpponentTurn();
                } else {
                    setDisableUI(false);
                }
            }, 1000);
        }, 500);
    }, [isPlayerTurn]);

    useEffect(() => {
        if (selectedCardIndices[0] === null || selectedCardIndices[1] === null) {
            return;
        }

        setTimeout(() => {
            const [firstCard, secondCard] = selectedCardIndices.map((index) => cardLayout[index]);
            if (firstCard === secondCard) {
                if (isPlayerTurn) {
                    setPlayerScore((prev) => prev + 1);
                } else {
                    setOpponentScore((prev) => prev + 1);
                }

                setMatchedCards((prev) => {
                    const newMatches = [...prev];
                    selectedCardIndices.forEach((index) => (newMatches[index] = true));
                    return newMatches;
                });
            } else {
                setDisableUI(true);
                setTimeout(() => {
                    setIsPlayerTurn((prev) => !prev);
                }, 500);
            }

            setSelectedCardIndices([null, null]);
        }, 1250);
    }, [selectedCardIndices]);

    const handleSelectCard = (index: number) => {
        if (selectedCardIndices[0] === null) {
            setSelectedCardIndices([index, null]);
        } else if (index !== selectedCardIndices[0]) {
            setSelectedCardIndices([selectedCardIndices[0], index]);
        }
    };

    const handleClickCard = (index: number) => {
        if (disableUI || matchedCards[index] || selectedCardIndices.every((index) => typeof index === "number")) {
            return;
        }
        handleSelectCard(index);
    };

    const isCardRevealed = (i: number): boolean => {
        const isInitialReveal = typeof flippedCardIndex === "number" && Math.abs(i - flippedCardIndex) <= CARD_RANGE_TO_FLIP - 1;
        const isSelected = selectedCardIndices.some((index) => index === i);
        return isInitialReveal || isSelected;
    };

    return (
        <Overlay>
            <div className={classes.inner}>
                {cardLayout.map((card, i) => (
                    <React.Fragment key={i}>
                        <div
                            className={classNames(classes.cardContainer, {
                                flip: isCardRevealed(i),
                            })}
                        >
                            <div
                                className={classNames(classes.cardInner, {
                                    hidden: matchedCards[i],
                                })}
                                onClick={() => handleClickCard(i)}
                            >
                                <img src={card} className={classes.card} />
                                <div className={classes.cardBack} />
                            </div>
                        </div>
                        {(i + 1) % 6 === 0 && <br />}
                    </React.Fragment>
                ))}
                Your Score: {playerScore} <br />
                Opponent Score: {opponentScore}
                {cardsRemaining === 0 && (
                    <div>
                        {playerScore > opponentScore && "You win"}
                        {playerScore < opponentScore && "You lose"}
                        {playerScore === opponentScore && "Draw"}
                        <br />
                        <Button variant="contained" color="primary" onClick={onExit}>
                            Exit
                        </Button>
                    </div>
                )}
            </div>
            {showTurnAnnouncement && <TurnAnnouncement isPlayerTurn={isPlayerTurn} />}
        </Overlay>
    );
};

export default CardGame;

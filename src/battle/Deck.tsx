import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";

const DECK_COLOR = "#176fbd";
const DECK_SHADOW = "#125896";
const COOLDOWN_COLOR = "#aaaaaa";
const COOLDOWN_SHADOW = "#8a8a8a";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        width: "100px",
        minHeight: "125px",
        "& svg": {
            left: 0,
            position: "absolute",
        },
    },
    onCooldown: {
        position: "absolute",
        bottom: "-36px",
        zIndex: 3,
        textAlign: "center",
        width: "100%",
    },
    deckContainer: {
        height: "100px",
        zIndex: -1,
        top: "16px",
    },
});

const Deck = ({ deck, discard }) => {
    const classes = useStyles();

    const getCardColor = (i: number): string => {
        const isLast = i === deck.length + discard.length - 1;
        if (i < discard.length) {
            return isLast ? COOLDOWN_COLOR : COOLDOWN_SHADOW;
        }
        return isLast ? DECK_COLOR : DECK_SHADOW;
    };

    return (
        <div className={classes.root}>
            <div className={classes.deckContainer}>
                {Array.from({ length: deck.length + discard.length }).map((_, i) => {
                    return (
                        <div key={i}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                    bottom: `${i * 5}px`,
                                }}
                            >
                                <path fill={getCardColor(i)} d="M 50 75 100 100 50 125 0 100 Z" />
                                {i === deck.length + discard.length - 1 && (
                                    <text fill="rgba(255, 255, 255, 0.8)" x="50" fontSize="26px" y="110" textAnchor="middle">
                                        {deck.length}
                                    </text>
                                )}
                            </svg>
                        </div>
                    );
                })}
            </div>
            <div className={classes.onCooldown}>Cooldown: {discard.length}</div>
        </div>
    );
};

export default Deck;

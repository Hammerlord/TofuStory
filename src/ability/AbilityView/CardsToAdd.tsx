import { createUseStyles } from "react-jss";
import { Ability } from "../types";

const useStyles = createUseStyles({
    cardIcon: {
        maxWidth: "24px",
    },
});

const CardToAddCount = ({ count, card }) => {
    const classes = useStyles();

    return (
        <span>
            <img className={classes.cardIcon} src={card.image} /> {card.name} {count > 1 && <>x{count}</>}{" "}
        </span>
    );
};

const CardsToAdd = ({ ability }) => {
    const {
        addCards = {},
        addCardsToDeck = {},
        addCardsToDiscard = {},
    } = ability.actions.reduce((acc, { addCards = [], addCardsToDeck = [], addCardsToDiscard = [] }) => {
        if (!acc.addCards) {
            acc.addCards = {};
        }
        addCards.forEach((card) => {
            acc.addCards[card.name] = {
                count: (acc.addCards[card.name]?.count || 0) + 1,
                card,
            };
        });

        if (!acc.addCardsToDeck) {
            acc.addCardsToDeck = {};
        }

        addCardsToDeck.forEach((card) => {
            acc.addCardsToDeck[card.name] = {
                count: (acc.addCardsToDeck[card.name]?.count || 0) + 1,
                card,
            };
        });

        if (!acc.addCardsToDiscard) {
            acc.addCardsToDiscard = {};
        }

        addCardsToDiscard.forEach((card) => {
            acc.addCardsToDiscard[card.name] = {
                count: (acc.addCardsToDiscard[card.name]?.count || 0) + 1,
                card,
            };
        });

        return acc;
    }, {});

    return (
        <>
            {Object.keys(addCards).length > 0 && (
                <div>
                    Add{" "}
                    {Object.values(addCards).map((val) => {
                        const { count, card } = val as { count: number; card: Ability };
                        return <CardToAddCount card={card} count={count} key={card.name} />;
                    })}
                    to your hand
                </div>
            )}
            {Object.keys(addCardsToDeck).length > 0 && (
                <div>
                    Add{" "}
                    {Object.values(addCardsToDeck).map((val) => {
                        const { count, card } = val as { count: number; card: Ability };
                        return <CardToAddCount card={card} count={count} key={card.name} />;
                    })}
                    to your deck
                </div>
            )}
            {Object.keys(addCardsToDiscard).length > 0 && (
                <div>
                    Add{" "}
                    {Object.values(addCardsToDiscard).map((val) => {
                        const { count, card } = val as { count: number; card: Ability };
                        return <CardToAddCount card={card} count={count} key={card.name} />;
                    })}
                    to your discard
                </div>
            )}
        </>
    );
};

export default CardsToAdd;

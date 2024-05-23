import { createUseStyles } from "react-jss";
import { Ability, Action, CombatAbility } from "../types";
import { Player } from "../../character/types";
import { getLastPlayedCards } from "./utils";

const useStyles = createUseStyles({
    cardIcon: {
        maxWidth: "20px",
        verticalAlign: "bottom",
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

const CardsToAdd = ({ ability, isInline, player }: { ability: { actions: Action[] }; isInline?: boolean; player?: Player }) => {
    const {
        addCards = {},
        addCardsToDeck = {},
        addCardsToDiscard = {},
    } = ability.actions.reduce((acc, { addCards = [], addCardsToDeck = [], addCardsToDiscard = [], addLastPlayedCards }) => {
        if (!acc.addCards) {
            acc.addCards = {};
        }

        addCards.forEach((card) => {
            acc.addCards[card.name] = {
                count: (acc.addCards[card.name]?.count || 0) + 1,
                card,
            };
        });

        if (addLastPlayedCards && player) {
            getLastPlayedCards({ player, amount: addLastPlayedCards.amount }).forEach((card) => {
                acc.addCards[card.name] = {
                    count: (acc.addCards[card.name]?.count || 0) + 1,
                    card,
                };
            });
        }

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
    }, {} as any);

    const add = isInline ? "add" : "Add";

    const renderCount = (cardsObj, description: string) => {
        if (Object.keys(cardsObj).length === 0) {
            return;
        }
        const content = (
            <>
                {add}{" "}
                {Object.values(cardsObj).map((val) => {
                    const { count, card } = val as { count: number; card: Ability };
                    return <CardToAddCount card={card} count={count} key={card.name} />;
                })}
                {description}
            </>
        );

        if (isInline) {
            return content;
        }

        return <div>{content}</div>;
    };

    return (
        <>
            {renderCount(addCards, "to your hand")}
            {renderCount(addCardsToDeck, "to your deck")}
            {renderCount(addCardsToDiscard, "to your discard")}
        </>
    );
};

export default CardsToAdd;

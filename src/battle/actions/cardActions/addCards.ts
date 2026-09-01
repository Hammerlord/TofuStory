import * as uuid from "uuid";
import { Ability, Action, CombatAbility } from "../../../ability/types";
import { getRandomInt } from "../../../utils";
import { CARD_ADDED_PLAYBACK_SPEED, MAX_HAND_SIZE, battleWarnings } from "../../constants";
import { battleStateSlice } from "../../reducer";
import { ActionContext } from "../../types";
import { prepareForDiscard } from "./discardCards";
import { enqueueEvent } from "../enqueueEvent";
import { triggerAddCardsToHandEvent } from "./cardActions";
import { filterImmunedHindranceCards } from "./hindranceCards";

const { updateBattle, setNotification } = battleStateSlice?.actions || {};

/**
 * Remove a card from existence based on its id.
 */
export const deleteCard = (abilityId: string) => (dispatch, getState) => {
    const { hand, deck, discard } = getState().battle;

    dispatch(
        updateBattle({
            hand: hand.filter((card: CombatAbility) => card.instanceId !== abilityId),
            deck: deck.filter((card: CombatAbility) => card.instanceId !== abilityId),
            discard: discard.filter((card: CombatAbility) => card.instanceId !== abilityId),
        })
    );
};

export const checkAddCardsToDeck = ({
    action,
    ownedCards,
    context,
}: {
    action: Action;
    ownedCards: { [abilityName: string]: true };
    context?: ActionContext;
}) => {
    return (dispatch, getState) => {
        let { addCardsToDeck, addCardsToDeckOptions } = action;
        addCardsToDeck = dispatch(filterImmunedHindranceCards({ cardsToAdd: addCardsToDeck, context }));

        if (!addCardsToDeck) {
            return;
        }

        const updatedDeck = [...getState().battle.deck];
        const cardsToAdd = addCardsToDeck.filter((card) => !card.isUnique || !ownedCards[card.name]);
        cardsToAdd.forEach((card: Ability) => {
            const combatCard = {
                ...card,
                instanceId: uuid.v4(),
            };

            const moveType = addCardsToDeckOptions?.moveType || "random";
            if (moveType === "random") {
                const index = getRandomInt(1, updatedDeck.length - 1);
                updatedDeck.splice(index, 0, combatCard);
                return;
            }

            if (moveType === "append") {
                updatedDeck.push(combatCard);
                return;
            }

            if (moveType === "prepend") {
                updatedDeck.unshift(combatCard);
            }
        });

        dispatch(
            enqueueEvent({
                newCards: cardsToAdd,
                cardsAddedTo: "deck",
                context,
            })
        );

        dispatch(
            updateBattle({
                deck: updatedDeck,
            })
        );
    };
};

export const handleAddCardsToDiscard = ({
    addCardsToDiscard,
    ownedCards,
    context,
}: {
    addCardsToDiscard: Ability[];
    ownedCards: { [cardName: string]: boolean };
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        let cardsToAdd = addCardsToDiscard.filter((card) => !card.isUnique || !ownedCards[card.name]);
        cardsToAdd = dispatch(filterImmunedHindranceCards({ cardsToAdd, context }));
        if (!cardsToAdd.length) {
            return;
        }

        dispatch(
            enqueueEvent({
                playbackTime: CARD_ADDED_PLAYBACK_SPEED,
                newCards: cardsToAdd,
                cardsAddedTo: "discard",
                context: context,
            })
        );

        dispatch(
            updateBattle({
                discard: [
                    ...getState().battle.discard,
                    ...cardsToAdd.map((card: Ability) => ({
                        ...card,
                        instanceId: uuid.v4(),
                    })),
                ],
            })
        );
    };
};

export const handleAddCardsToHand = ({
    addCards,
    ownedCards,
    context,
}: {
    addCards: Ability[];
    ownedCards: { [abilityName: string]: true };
    context?: ActionContext;
}) => {
    return (dispatch, getState) => {
        let cardsToAdd = addCards.filter((card) => !card.isUnique || !ownedCards[card.name]);

        cardsToAdd = dispatch(filterImmunedHindranceCards({ cardsToAdd, context }));
        if (!cardsToAdd.length) {
            return;
        }

        cardsToAdd = cardsToAdd
            .map((card: Ability) => ({
                ...card,
                instanceId: uuid.v4(),
            }))
            .reverse();

        let newHand = [...cardsToAdd, ...getState().battle.hand];
        let discard = [...getState().battle.discard];

        if (newHand.length >= MAX_HAND_SIZE) {
            const toDiscard = newHand.slice(MAX_HAND_SIZE);
            newHand = newHand.slice(0, MAX_HAND_SIZE);
            dispatch(setNotification({ text: battleWarnings.handFull, severity: "warning", id: uuid.v4() }));
            discard.unshift(...prepareForDiscard(toDiscard));
        }

        dispatch(
            updateBattle({
                hand: newHand,
                discard,
            })
        );

        dispatch(triggerAddCardsToHandEvent(addCards.length, context));
    };
};

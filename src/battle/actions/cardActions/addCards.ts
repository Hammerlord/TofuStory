import * as uuid from "uuid";
import { Ability, Action, ActionOptionalProperties, CombatAbility } from "../../../ability/types";
import { getRandomInt } from "../../../utils";
import { CARD_ADDED_PLAYBACK_SPEED } from "../../constants";
import { BattleState, battleStateSlice } from "../../reducer";
import { ActionContext } from "../../types";
import { enqueueEvent } from "../enqueueEvent";
import { triggerAddCardsToHandEvent } from "./cardActions";
import { filterImmunedHindranceCards } from "./hindranceCards";
import { AppDispatch, RootState } from "../../../store";

const { updateBattle, addCardsToHand } = battleStateSlice?.actions || {};

/**
 * Remove a card from existence based on its id.
 */
export const deleteCard = (abilityId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const battle: BattleState = getState().battle!;
    const { hand, deck, discard } = battle;

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
    action: ActionOptionalProperties;
    ownedCards: { [abilityName: string]: true };
    context: ActionContext;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        let { addCardsToDeck: initialCardsToDeck, addCardsToDeckOptions } = action;
        const addCardsToDeck: Ability[] | undefined = dispatch(filterImmunedHindranceCards({ cardsToAdd: initialCardsToDeck, context }));

        if (!addCardsToDeck) {
            return;
        }

        const battle: BattleState = getState().battle!;
        const updatedDeck = [...battle.deck];
        const cardsToAdd = addCardsToDeck.filter((card) => !card.isUnique || !ownedCards[card.name]);
        const combatCards: CombatAbility[] = cardsToAdd.map((card) => ({
            ...card,
            effects: card.effects || [],
            instanceId: uuid.v4(),
        }));

        combatCards.forEach((card) => {
            const moveType = addCardsToDeckOptions?.moveType || "random";
            if (moveType === "random") {
                const index = getRandomInt(1, updatedDeck.length - 1);
                updatedDeck.splice(index, 0, card);
                return;
            }

            if (moveType === "append") {
                updatedDeck.push(card);
                return;
            }

            if (moveType === "prepend") {
                updatedDeck.unshift(card);
            }
        });

        dispatch(
            enqueueEvent({
                newCards: combatCards,
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
    return (dispatch: AppDispatch, getState: () => RootState) => {
        let cardsToAdd = addCardsToDiscard.filter((card) => !card.isUnique || !ownedCards[card.name]);
        cardsToAdd = dispatch(filterImmunedHindranceCards({ cardsToAdd, context }));
        if (!cardsToAdd.length) {
            return;
        }

        const combatCards = cardsToAdd.map((card: Ability) => ({
            ...card,
            instanceId: uuid.v4(),
        })) as CombatAbility[];

        dispatch(
            enqueueEvent({
                playbackTime: CARD_ADDED_PLAYBACK_SPEED,
                newCards: combatCards,
                cardsAddedTo: "discard",
                context: context,
            })
        );

        const battle: BattleState = getState().battle!;
        dispatch(
            updateBattle({
                discard: [...combatCards, ...battle.discard],
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
    ownedCards?: { [abilityName: string]: true };
    context: ActionContext;
}) => {
    return (dispatch: AppDispatch) => {
        let cardsToAdd = addCards.filter((card) => !card.isUnique || !ownedCards || !ownedCards[card.name]);

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

        dispatch(addCardsToHand(cardsToAdd));
        dispatch(triggerAddCardsToHandEvent(addCards.length, context));
    };
};

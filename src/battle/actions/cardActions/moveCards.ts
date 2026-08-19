import _ from "lodash";
import * as uuid from "uuid";
import { getLastPlayedCards } from "../../../ability/AbilityView/utils";
import {
    Ability,
    Action,
    AutoPlayCards,
    CARD_PILE_TYPES,
    CombatAbility,
    CombatEffect,
    EFFECT_EVENT_KEYS,
    FROM_CARD_PILE_TYPES,
    MoveCards,
} from "../../../ability/types";
import { Combatant } from "../../../character/types";
import { getRandomInt, shuffle } from "../../../utils";
import { CARD_ADDED_PLAYBACK_SPEED, MAX_HAND_SIZE, battleWarnings } from "../../constants";
import { passesValueComparison } from "../../passesConditions";
import { BattleState, battleStateSlice } from "../../reducer";
import { cardPassesFilterCondition } from "../../selectCardUtils";
import { ActionContext, TriggerSource } from "../../types";
import { checkEventTrigger, enqueueEvent } from "../actions";
import { handleDiscard, prepareForDiscard, usePlayerAbility } from "../playerTurn";
import { applyAbilityEventEffects, drawCards } from "./drawCards";
import { handleSelectCards } from "./selectCards";

const { updateBattle, promptPlayerSelectCards, setNotification } = battleStateSlice?.actions || {};

export const handleMoveCards = ({
    moveCards,
    triggerAddCardsToHandEvent,
    context,
}: {
    moveCards: MoveCards;
    triggerAddCardsToHandEvent;
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        const { from, to, amount = 1, moveType, filters } = moveCards;
        const battle: BattleState = getState().battle;
        const toPile: CombatAbility[] = battle[to]?.slice() || [];
        if (from === to) {
            return;
        }
        const source = context?.sourceChain?.at(-1);
        const parentCardId = (source?.source as CombatAbility)?.instanceId;

        const moveFromPile = (fromPile: CombatAbility[]): { updatedFromPile: CombatAbility[]; movedCards: CombatAbility[] } => {
            // If there are not enough cards in the `from` pile, just whiff the rest
            const cardsToMove = fromPile
                .filter((card) => {
                    // Card cannot move itself (eg. if it was played and went to discard, it cannot move itself from the discard pile)
                    if (parentCardId === card.instanceId) {
                        return false;
                    }

                    if (filters) {
                        return filters.some((filter) => {
                            const { value, property, comparator } = filter;
                            const propertyVal = _.get(card, property);
                            return passesValueComparison({ val: propertyVal, otherVal: value, comparator });
                        });
                    }

                    return true;
                })
                .slice(0, amount);

            const filteredCardsToMove = cardsToMove.filter((card) => {
                // If we're moving an Ephemeral card to discard/deplete, treat it as a normal discard (the card vanishes).
                if (card.removeAfterTurn && (to === CARD_PILE_TYPES.DISCARD || to === CARD_PILE_TYPES.DEPLETED)) {
                    return false;
                }
                return true;
            });

            const filteredFromPile = fromPile.filter((card) => cardsToMove.every((movedCard) => movedCard.instanceId !== card.instanceId));
            return { updatedFromPile: filteredFromPile, movedCards: filteredCardsToMove };
        };

        const cardsToMove = [];
        const updatedCardPiles = {};

        if (from === FROM_CARD_PILE_TYPES.ANYWHERE) {
            ["hand", "deck", "discard", "depleted"].forEach((fromPileName: string) => {
                if (fromPileName === to) {
                    return;
                }

                const pile = battle[fromPileName];
                const { updatedFromPile, movedCards } = moveFromPile(pile);
                updatedCardPiles[fromPileName] = updatedFromPile;
                cardsToMove.push(...movedCards);
            });
        } else {
            const fromPile = battle[from];
            const { updatedFromPile, movedCards } = moveFromPile(fromPile);
            updatedCardPiles[from] = updatedFromPile;
            cardsToMove.push(...movedCards);
        }

        if (!cardsToMove.length) {
            return;
        }

        if (moveType === "append") {
            toPile.push(...cardsToMove);
        } else {
            cardsToMove.reverse();
            toPile.unshift(...cardsToMove);
        }

        dispatch(
            enqueueEvent({
                newCards: cardsToMove,
                cardsAddedTo: to,
                context,
            })
        );

        dispatch(
            updateBattle({
                ...updatedCardPiles,
                [to]: toPile,
            })
        );

        if (to === CARD_PILE_TYPES.HAND) {
            triggerAddCardsToHandEvent(cardsToMove.length);
        }
    };
};

export const handleRetrieveDepletedCards = ({
    amount,
    source: source,
    triggerAddCardsToHandEvent,
}: {
    amount: number;
    source: TriggerSource;
    triggerAddCardsToHandEvent: Function;
}) => {
    return (dispatch, getState) => {
        const sourceAbilityId = source?.source ? (source?.source as CombatAbility)?.instanceId : undefined;
        // Prevent eg. Bag From Beyond from pulling itself back out (it can still pull out other Bags From Beyond)
        const eligible = shuffle([...getState().battle.depleted.filter((card) => card.instanceId !== sourceAbilityId)]);
        if (eligible.length > 0) {
            const cardsToHand = [];
            Array.from({ length: amount }).forEach(() => {
                const retrieved = eligible.pop();

                if (retrieved) {
                    cardsToHand.push(retrieved);
                }
            });

            dispatch(
                updateBattle({
                    hand: [...getState().battle.hand, ...cardsToHand],
                    depleted: getState().battle.depleted.filter((card) =>
                        cardsToHand.every(({ instanceId }) => instanceId !== card.instanceId)
                    ),
                })
            );

            triggerAddCardsToHandEvent(cardsToHand.length);
        }
    };
};

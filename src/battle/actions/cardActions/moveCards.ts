import _ from "lodash";
import { CARD_PILE_TYPES, CombatAbility, FROM_CARD_PILE_TYPES, MoveCards } from "../../../ability/types";
import { shuffle } from "../../../utils";
import { passesValueComparison } from "../../passesConditions";
import { BattleState, battleStateSlice } from "../../reducer";
import { ActionContext, TriggerSource } from "../../types";
import { enqueueEvent } from "../enqueueEvent";
import { triggerAddCardsToHandEvent } from "./cardActions";

const { updateBattle, addCardsToHand } = battleStateSlice?.actions || {};

export const handleMoveCards = ({ moveCards, context }: { moveCards: MoveCards; context: ActionContext }) => {
    return (dispatch, getState) => {
        const { from, to, amount = 1, moveType, filters } = moveCards;
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

                const battle: BattleState = getState().battle;
                const pile = battle[fromPileName];
                const { updatedFromPile, movedCards } = moveFromPile(pile);
                updatedCardPiles[fromPileName] = updatedFromPile;
                cardsToMove.push(...movedCards);
            });
        } else {
            const battle: BattleState = getState().battle;
            const fromPile = battle[from];
            const { updatedFromPile, movedCards } = moveFromPile(fromPile);
            updatedCardPiles[from] = updatedFromPile;
            cardsToMove.push(...movedCards);
        }

        if (!cardsToMove.length) {
            return;
        }

        dispatch(
            enqueueEvent({
                newCards: cardsToMove,
                cardsAddedTo: to,
                context,
            })
        );

        if (to === CARD_PILE_TYPES.HAND) {
            if (moveType !== "append") {
                cardsToMove.reverse();
            }

            // TODO this doesn't support append
            dispatch(addCardsToHand(cardsToMove));
            triggerAddCardsToHandEvent(cardsToMove.length, context);
            dispatch(
                updateBattle({
                    ...updatedCardPiles,
                })
            );
            return;
        }

        const toPile: CombatAbility[] = getState().battle[to]?.slice();
        if (moveType === "append") {
            toPile.push(...cardsToMove);
        } else {
            cardsToMove.reverse();
            toPile.unshift(...cardsToMove);
        }

        dispatch(
            updateBattle({
                ...updatedCardPiles,
                [to]: toPile,
            })
        );
    };
};

export const handleRetrieveDepletedCards = ({
    amount,
    source: source,
    context,
}: {
    amount: number;
    source: TriggerSource;
    context?: ActionContext;
}) => {
    return (dispatch, getState) => {
        const sourceAbilityId = source?.source ? (source?.source as CombatAbility)?.instanceId : undefined;
        // Prevent eg. Bag From Beyond from pulling itself back out (it can still pull out other Bags From Beyond)
        const eligible = shuffle([...getState().battle.depleted.filter((card: CombatAbility) => card.instanceId !== sourceAbilityId)]);
        if (eligible.length > 0) {
            const cardsToHand: CombatAbility[] = [];
            Array.from({ length: amount }).forEach(() => {
                const retrieved = eligible.pop();

                if (retrieved) {
                    cardsToHand.push(retrieved);
                }
            });

            dispatch(
                updateBattle({
                    hand: [...getState().battle.hand, ...cardsToHand],
                    depleted: getState().battle.depleted.filter((card: CombatAbility) =>
                        cardsToHand.every(({ instanceId }) => instanceId !== card.instanceId)
                    ),
                })
            );

            dispatch(triggerAddCardsToHandEvent(cardsToHand.length, context));
        }
    };
};

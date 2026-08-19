import _ from "lodash";
import * as uuid from "uuid";
import { getLastPlayedCards } from "../../../ability/AbilityView/utils";
import { Action, AutoPlayCards, CombatAbility, CombatEffect, EFFECT_EVENT_KEYS } from "../../../ability/types";
import { Combatant } from "../../../character/types";
import { shuffle } from "../../../utils";
import { MAX_HAND_SIZE, battleWarnings } from "../../constants";
import { passesValueComparison } from "../../passesConditions";
import { BattleState, battleStateSlice } from "../../reducer";
import { cardPassesFilterCondition } from "../../selectCardUtils";
import { ActionContext } from "../../types";
import { checkEventTrigger } from "../actions";
import { handleDiscard, usePlayerAbility } from "../playerTurn";
import { checkAddCardsToDeck, handleAddCardsToDiscard, handleAddCardsToHand } from "./addCards";
import { applyAbilityEventEffects, drawCards } from "./drawCards";
import { handleMoveCards, handleRetrieveDepletedCards } from "./moveCards";
import { handleSelectCards } from "./selectCards";

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

/**
 * Handle effects that add card(s) to the player's hand, deck, discard.
 */
export const checkCardActions = ({
    action,
    context: context,
    isAutoCast,
}: {
    action: { [key in keyof Action]?: Action[key] };
    context?: ActionContext;
    isAutoCast?: boolean;
}) => {
    return (dispatch, getState) => {
        const {
            drawCards: cardsToDraw,
            addCards,
            addCardsToDiscard,
            applyAbilityEffects,
            selectCards,
            retrieveDepletedCards,
            moveCards,
            addLastPlayedCards,
            discardCardsFromHand,
            playCards,
        } = action;
        const source = context?.sourceChain.at(-1);

        if (playCards) {
            dispatch(handleAutoPlayCards(playCards));
        }

        if (cardsToDraw) {
            dispatch(drawCards({ ...cardsToDraw, context: context }));
        }

        if (discardCardsFromHand) {
            const { amount } = discardCardsFromHand;
            const { hand, discard } = getState().battle;

            const cardsDiscarded = shuffle(hand).slice(0, amount);
            const newHand = hand.filter((card) => cardsDiscarded.every((discarded) => discarded.instanceId !== card.instanceId));

            dispatch(
                updateBattle({
                    hand: newHand,
                    discard: [...cardsDiscarded, ...discard],
                })
            );
        }

        const triggerAddCardsToHandEvent = (amount: number) => {
            if (amount === 0) {
                return;
            }

            const { playerSide, enemySide } = getState().battle;
            playerSide.concat(enemySide).forEach((combatant) => {
                if (combatant) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onAddCardToHand,
                            context: {
                                ...context,
                                trackSumAmount: amount,
                            },
                        })
                    );
                }
            });
        };

        const { hand, deck, discard } = getState().battle as BattleState;

        const ownedCards = [...hand, ...deck, ...discard].reduce((acc, card) => {
            acc[card.name] = true;
            return acc;
        }, {});

        if (addCards) {
            dispatch(handleAddCardsToHand({ addCards, ownedCards, triggerAddCardsToHandEvent }));
        }

        dispatch(checkAddCardsToDeck({ action, ownedCards, context }));

        if (addCardsToDiscard) {
            dispatch(handleAddCardsToDiscard({ addCardsToDiscard, ownedCards, context }));
        }

        if (typeof retrieveDepletedCards?.amount === "number") {
            dispatch(handleRetrieveDepletedCards({ amount: retrieveDepletedCards?.amount, source, triggerAddCardsToHandEvent }));
        }

        // If we apply card effects, assume we always want to do it AFTER drawCards/addCards. Otherwise, configure the actions to be separate and in the desired order!
        if (applyAbilityEffects) {
            const { amount = Infinity, pile: pileKey, filters } = applyAbilityEffects;
            const pile = getState().battle[pileKey];
            const affectedCards = shuffle(pile)
                .filter((card) => {
                    return cardPassesFilterCondition(card, filters);
                })
                .slice(0, amount)
                .reduce((acc, ability: CombatAbility) => {
                    acc[ability.instanceId] = true;
                    return acc;
                }, {});

            dispatch(
                updateBattle({
                    [pileKey]: pile.map((card: CombatAbility) => {
                        if (affectedCards[card.instanceId]) {
                            return applyAbilityEventEffects({ event: applyAbilityEffects, ability: card, source });
                        }
                        return card;
                    }),
                })
            );
        }

        if (selectCards) {
            dispatch(handleSelectCards({ isAutoCast, source, selectCards, triggerAddCardsToHandEvent, context }));
        }

        if (moveCards) {
            dispatch(handleMoveCards({ moveCards, triggerAddCardsToHandEvent, context }));
        }

        if (addLastPlayedCards) {
            const { amount, abilityEffects = [] } = addLastPlayedCards;
            const { hand, playerSide } = getState().battle;
            const player = playerSide.find((c: Combatant | null) => c?.isPlayer);

            const cardsToHand = getLastPlayedCards({ player, amount }).map((card) =>
                applyAbilityEventEffects({
                    event: { abilityEffects },
                    ability: {
                        ...card,
                        instanceId: uuid.v4(),
                        removeAfterTurn: abilityEffects.some((e) => e.removeParentCardAfterTurn), // Why not make this effect consumed properly by the system?
                    },
                    source,
                })
            );

            dispatch(
                updateBattle({
                    hand: [...cardsToHand, ...hand],
                })
            );
        }
    };
};

const handleAutoPlayCards = (playCards: AutoPlayCards) => {
    return (dispatch, getState) => {
        const { amount, filters } = playCards;
        const { deck } = getState().battle;
        const cardsToPlay = deck
            .filter((card) => {
                return (
                    !filters ||
                    filters.some((filter) => {
                        const { property, value, comparator } = filter;
                        const propertyVal = _.get(card, property);
                        return passesValueComparison({ val: propertyVal, otherVal: value, comparator });
                    })
                );
            })
            .slice(0, amount);

        dispatch(
            updateBattle({
                deck: deck.filter((card: CombatAbility) =>
                    cardsToPlay.every((otherCard: CombatAbility) => card.instanceId !== otherCard.instanceId)
                ),
            })
        );

        cardsToPlay.forEach((ability) => {
            // Cards played from an action are considered procs, atm for the sole purpose of not allowing Charged to proc from Yellow Hat.
            dispatch(usePlayerAbility({ ability, isProc: true }));
            dispatch(handleDiscard(ability));
        });
    };
};

/**
 * @see ping for an example of how this is used.
 */
export const handleDrawOriginalAbility = ({
    drawOriginalAbility,
    effect,
    context,
}: {
    drawOriginalAbility: boolean;
    effect: CombatEffect;
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        if (!drawOriginalAbility || !effect.originalAbilityId) {
            return;
        }

        const { hand, deck, discard, depleted, playerSide, enemySide } = getState().battle;
        let newHand = hand.slice();
        const newDeck = deck.slice();
        const newDiscard = discard.slice();
        const newDeplete = depleted.slice();

        const lookupPile = (pile: CombatAbility[]) => {
            const i = pile.findIndex((ability) => ability.instanceId === effect.originalAbilityId);
            if (i > -1) {
                const [card] = pile.splice(i, 1);
                newHand.push(card);
                return true;
            }
        };

        const found = [newDeck, newDiscard, newDeplete].some(lookupPile);
        let foundCard;
        if (!found) {
            // This card can still enter the hand even if it was supposed to be ephemeral. Look up the player's ability history to see if it's there.
            const player = playerSide.find((combatant) => combatant?.isPlayer);
            const card = player.abilityHistory.find((ability: CombatAbility) => ability.instanceId === effect.originalAbilityId);
            if (!card) {
                return;
            }
            if (newHand.every((ability: CombatAbility) => ability.instanceId !== card.instanceId)) {
                newHand.push(card);
                foundCard = card;
            }
        }

        if (newHand.length >= MAX_HAND_SIZE) {
            newHand = newHand.slice(0, MAX_HAND_SIZE);
            dispatch(setNotification({ text: battleWarnings.handFull, severity: "warning", id: uuid.v4() }));
            if (!foundCard.removeAfterTurn) {
                newDiscard.unshift(foundCard);
            }
        }

        dispatch(
            updateBattle({
                hand: newHand,
                deck: newDeck,
                discard: newDiscard,
                deplete: newDeplete,
            })
        );
    };
};

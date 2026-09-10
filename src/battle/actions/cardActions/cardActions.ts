import _ from "lodash";
import * as uuid from "uuid";
import { getLastPlayedCards } from "../../../ability/AbilityView/utils";
import { Action, ActionOptionalProperties, AutoPlayCards, CombatAbility, CombatEffect, EFFECT_EVENT_KEYS } from "../../../ability/types";
import { Combatant, Player } from "../../../character/types";
import { shuffle } from "../../../utils";
import { battleWarnings, MAX_HAND_SIZE } from "../../constants";
import { passesValueComparison } from "../../passesConditions";
import { battleStateSlice } from "../../reducer";
import { BattleState } from "../../types";
import { cardPassesFilterCondition } from "../../selectCardUtils";
import { ActionContext } from "../../types";
import { enqueueEvent } from "../enqueueEvent";
import { usePlayerAbility } from "../playerAbility";
import { checkEventTrigger } from "../statusEffect/triggerEffectEvent";
import { checkAddCardsToDeck, handleAddCardsToDiscard, handleAddCardsToHand, addCardsToHandWithEvents } from "./addCards";
import { handleDiscardAfterUse } from "./discardCards";
import { drawCards } from "./drawCards";
import { handleMoveCards, handleRetrieveDepletedCards } from "./moveCards";
import { handleSelectCards } from "./selectCards";
import { applyAbilityEventEffects, prepareForDiscard } from "./utils";
import { AppDispatch, RootState } from "../../../store";

const { updateBattle, setNotification } = battleStateSlice?.actions || {};

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

/**
 * Handle effects that add card(s) to the player's hand, deck, discard.
 */
export const checkCardActions = ({
    action,
    context,
    isAutoCast,
}: {
    action: ActionOptionalProperties;
    context: ActionContext;
    isAutoCast?: boolean;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
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
        const source = context?.sourceChain?.at(-1);

        if (playCards) {
            dispatch(handleAutoPlayCards(playCards, context));
        }

        if (cardsToDraw) {
            dispatch(drawCards({ ...cardsToDraw, context: context }));
        }

        if (discardCardsFromHand) {
            const { amount } = discardCardsFromHand;
            const battle: BattleState = getState().battle!;
            const { hand, discard, playerSide } = battle;
            const player = playerSide.find((c) => c?.isPlayer) as Player;

            const cardsDiscarded = prepareForDiscard({ cards: shuffle(hand).slice(0, amount), alwaysKeepRetain: true, battle, player });
            const newHand = hand.filter((card) => cardsDiscarded.every((discarded) => discarded.instanceId !== card.instanceId));

            dispatch(
                updateBattle({
                    hand: newHand,
                    discard: [...cardsDiscarded, ...discard],
                })
            );

            dispatch(enqueueEvent({ newCards: cardsDiscarded, cardsAddedTo: "discard", context, options: { alwaysGroup: true } }));
        }

        // A new instance of owned cards in case they become stale in between actions
        const getOwnedCards = () => {
            const battle: BattleState = getState().battle!;
            const { hand, deck, discard } = battle;

            return [...hand, ...deck, ...discard].reduce(
                (acc, card) => {
                    acc[card.name] = true;
                    return acc;
                },
                {} as { [cardName: string]: true }
            );
        };

        if (addCards) {
            dispatch(handleAddCardsToHand({ addCards, ownedCards: getOwnedCards(), context }));
        }

        dispatch(checkAddCardsToDeck({ action, ownedCards: getOwnedCards(), context }));

        if (addCardsToDiscard) {
            dispatch(handleAddCardsToDiscard({ addCardsToDiscard, ownedCards: getOwnedCards(), context }));
        }

        if (typeof retrieveDepletedCards?.amount === "number") {
            dispatch(handleRetrieveDepletedCards({ amount: retrieveDepletedCards?.amount, source, context }));
        }

        // If we apply card effects, assume we always want to do it AFTER drawCards/addCards. Otherwise, configure the actions to be separate and in the desired order!
        if (applyAbilityEffects) {
            const { amount = Infinity, pile: pileKey, filters } = applyAbilityEffects;
            const battle = getState().battle! as BattleState;
            const player = battle.playerSide.find((c: Combatant | null) => c?.isPlayer) as Player;
            const pile: CombatAbility[] = battle[pileKey];
            const affectedCards = shuffle(pile)
                .filter((card) => {
                    return cardPassesFilterCondition(card, filters);
                })
                .slice(0, amount)
                .reduce(
                    (acc, ability: CombatAbility) => {
                        if (ability.instanceId) {
                            acc[ability.instanceId] = true;
                        }
                        return acc;
                    },
                    {} as { [cardId: string]: true }
                );

            dispatch(
                updateBattle({
                    [pileKey]: pile.map((card: CombatAbility) => {
                        if (card.instanceId && affectedCards[card.instanceId]) {
                            return applyAbilityEventEffects({ event: applyAbilityEffects, ability: card, context, battle, player });
                        }
                        return card;
                    }),
                })
            );
        }

        if (selectCards) {
            dispatch(handleSelectCards({ isAutoCast, source, selectCards, context }));
        }

        if (moveCards) {
            dispatch(handleMoveCards({ moveCards, context }));
        }

        if (addLastPlayedCards) {
            const { amount, abilityEffects = [] } = addLastPlayedCards;
            const { playerSide } = getState().battle! as BattleState;
            const player: Player = playerSide.find((c: Combatant | null) => c?.isPlayer) as Player;

            if (!player) {
                return;
            }

            const cardsToAdd = getLastPlayedCards({ player, amount }).map((card) =>
                applyAbilityEventEffects({
                    event: { abilityEffects },
                    ability: {
                        ...card,
                        instanceId: uuid.v4(),
                        removeAfterTurn: abilityEffects.some((e) => e.removeParentCardAfterTurn), // Why not make this effect consumed properly by the system?
                    },
                    context,
                    battle: getState().battle! as BattleState,
                    player,
                })
            );

            dispatch(addCardsToHandWithEvents(cardsToAdd, context));
        }
    };
};

const handleAutoPlayCards = (playCards: AutoPlayCards, context?: ActionContext) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const { amount, filters } = playCards;
        const { deck } = getState().battle! as BattleState;
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

        cardsToPlay.forEach((ability: CombatAbility) => {
            // Cards played from an action are considered procs, atm for the sole purpose of not allowing Charged to proc from Yellow Hat.
            dispatch(usePlayerAbility({ ability, isProc: true, context }));
            dispatch(handleDiscardAfterUse(ability));
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
    return (dispatch: AppDispatch, getState: () => RootState) => {
        if (!drawOriginalAbility || !effect.originalAbilityId) {
            return;
        }

        const { hand, deck, discard, depleted, playerSide } = getState().battle! as BattleState;
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
            const player = playerSide.find((combatant: Combatant | null) => combatant?.isPlayer) as Player;
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
            if (foundCard && !foundCard.removeAfterTurn) {
                newDiscard.unshift(foundCard);
            }
        }

        dispatch(
            updateBattle({
                hand: newHand,
                deck: newDeck,
                discard: newDiscard,
                depleted: newDeplete,
            })
        );
    };
};

export const triggerAddCardsToHandEvent = (amount: number, context: ActionContext) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        if (amount === 0) {
            return;
        }

        const { playerSide, enemySide } = getState().battle! as BattleState;
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
};

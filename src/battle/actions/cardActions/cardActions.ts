import _ from "lodash";
import * as uuid from "uuid";
import { getLastPlayedCards } from "../../../ability/AbilityView/utils";
import {
    Ability,
    Action,
    CARD_PILE_TYPES,
    CombatAbility,
    CombatEffect,
    EFFECT_EVENT_KEYS,
    FROM_CARD_PILE_TYPES,
    MoveCards,
    SELECT_CARD_TYPES,
    SelectCards,
} from "../../../ability/types";
import { Combatant } from "../../../character/types";
import { getRandomInt, shuffle } from "../../../utils";
import { CARD_ADDED_PLAYBACK_SPEED, MAX_HAND_SIZE, battleWarnings } from "../../constants";
import { passesValueComparison } from "../../passesConditions";
import { BattleState, battleStateSlice } from "../../reducer";
import getCardSelection, { cardPassesFilterCondition } from "../../selectCardUtils";
import { ActionContext, TRIGGER_SOURCE_TYPES, TriggerSource } from "../../types";
import { checkEventTrigger, enqueueEvent } from "../actions";
import { playbackCollector } from "../playbackCollector";
import { handleDiscard, prepareForDiscard, usePlayerAbility } from "../playerTurn";
import { applyAbilityEventEffects, drawCards, handleOnDrawEvents } from "./drawCards";

const { updateBattle, promptPlayerSelectCards, setNotification, pushEventQueue } = battleStateSlice?.actions || {};

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

const handleSelectCards = ({
    selectCards,
    isAutoCast,
    source: source,
    triggerAddCardsToHandEvent,
    context,
}: {
    selectCards: SelectCards;
    isAutoCast?: boolean;
    source?: TriggerSource;
    triggerAddCardsToHandEvent: (numCards: number) => void;
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        if (!isAutoCast) {
            dispatch(
                promptPlayerSelectCards({
                    selectCards,
                    isAutoCast,
                    source,
                })
            );
            return;
        }
        const { type, maxAmount = 1 } = selectCards;

        const { hand, deck, discard, playerSide } = getState().battle;
        const player = playerSide.find((c: Combatant | null) => c?.isPlayer);

        const cards = getCardSelection({
            hand,
            deck,
            discard,
            selectCards: selectCards,
            selectedAbilityId: undefined,
            player,
            numOptions: maxAmount,
        });

        if (!cards.length) {
            return;
        }

        if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
            // TODO no op for now. There are no actions which deplete from hand.
        } else if (type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK) {
            const cardsToMove = cards.map((card: CombatAbility) => applyAbilityEventEffects({ event: card.onLeaveHand, ability: card }));
            const updatedHand = hand.filter((ability: CombatAbility) =>
                cardsToMove.every((card) => card.instanceId !== ability.instanceId)
            );
            const updatedDeck = [...cards, ...deck];
            dispatch(updateBattle({ hand: updatedHand, deck: updatedDeck }));
        } else {
            dispatch(updateBattle({ hand: [...cards, ...hand] }));
            triggerAddCardsToHandEvent(cards.length);
        }

        if (type === SELECT_CARD_TYPES.SEARCH_DECK) {
            dispatch(handleOnDrawEvents({ cardsToDraw: cards, context }));
        }
    };
};

const handleMoveCards = ({
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

const handleRetrieveDepletedCards = ({
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

const handleAddCardsToDiscard = ({
    addCardsToDiscard,
    ownedCards,
    context,
}: {
    addCardsToDiscard: Ability[];
    ownedCards: { [cardName: string]: boolean };
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        const cardsToAdd = addCardsToDiscard.filter((card) => !card.isUnique || !ownedCards[card.name]);

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

const handleAddCardsToHand = ({ addCards, ownedCards, triggerAddCardsToHandEvent }) => {
    return (dispatch, getState) => {
        let cardsToAdd = addCards.filter((card) => !card.isUnique || !ownedCards[card.name]);
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

        triggerAddCardsToHandEvent(addCards.length);
    };
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

const checkAddCardsToDeck = ({
    action,
    ownedCards,
    context,
}: {
    action: Action;
    ownedCards: { [abilityName: string]: true };
    context?: ActionContext;
}) => {
    return (dispatch, getState) => {
        const { addCardsToDeck, addCardsToDeckOptions } = action;
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

/**
 * Send `abilities` to the deplete pile and trigger the onDeplete effect event.
 */
export const depleteAbilities =
    ({ actorId, abilities = [], source: context }: { actorId: string; abilities: CombatAbility[]; source?: ActionContext }) =>
    (dispatch, getState) => {
        const { hand, depleted = [] } = getState().battle;
        dispatch(
            enqueueEvent({
                newCards: abilities,
                cardsAddedTo: CARD_PILE_TYPES.DEPLETED,
                context,
            })
        );

        dispatch(
            updateBattle({
                hand: hand.filter((ability: CombatAbility) => {
                    return abilities.every((card) => card.instanceId !== ability.instanceId);
                }),
                depleted: [...depleted, ...abilities],
            })
        );

        abilities.forEach((card) => {
            dispatch(
                checkEventTrigger({
                    combatantId: actorId,
                    effectEventKey: EFFECT_EVENT_KEYS.onDepleteAbility,
                    context: {
                        triggerHistory: [],
                        ...context,
                        sourceChain: [...(context?.sourceChain || []), { source: card, type: TRIGGER_SOURCE_TYPES.ABILITY }],
                    },
                })
            );
        });
    };

export const selectCardsAction =
    ({ type, selectedAbilities, player, effects, abilityQueued }) =>
    (dispatch, getState) => {
        const { deck, hand, discard, playerSide, enemySide } = getState().battle;
        if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
            dispatch(depleteAbilities({ actorId: player?.id, abilities: selectedAbilities }));
            return;
        }

        const selectedAbilityIds = selectedAbilities.map((ability) => ability.instanceId);

        if (type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK) {
            const updatedHand = [];
            const updatedDeck = [...deck];
            hand.forEach((ability: CombatAbility) => {
                if (selectedAbilityIds.includes(ability.instanceId)) {
                    updatedDeck.unshift(applyAbilityEventEffects({ event: ability.onLeaveHand, ability }));
                } else {
                    updatedHand.push(ability);
                }
            });

            dispatch(
                updateBattle({
                    hand: updatedHand,
                    deck: updatedDeck,
                })
            );

            return;
        }

        if (type === SELECT_CARD_TYPES.DISCARD_TO_DRAW) {
            const updatedHand = [];
            const updatedDiscard = [...discard];
            hand.forEach((ability: CombatAbility) => {
                if (selectedAbilityIds.includes(ability.instanceId)) {
                    updatedDiscard.unshift(...prepareForDiscard([ability]));
                } else {
                    updatedHand.push(ability);
                }
            });
            dispatch(
                updateBattle({
                    hand: updatedHand,
                    discard: updatedDiscard,
                })
            );
            dispatch(drawCards({ amount: selectedAbilityIds.length }));

            return;
        }

        const triggerAddCardsToHandEvent = () => {
            if (selectedAbilities.length === 0) {
                return;
            }

            playerSide.concat(enemySide).forEach((combatant) => {
                if (combatant) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onAddCardToHand,
                            context: {
                                sourceChain: [{ type: TRIGGER_SOURCE_TYPES.ABILITY, source: abilityQueued }],
                                trackSumAmount: selectedAbilities.length,
                            },
                        })
                    );
                }
            });
        };

        if (type === SELECT_CARD_TYPES.SEARCH_DECK) {
            const updatedDeck = [...deck];
            const updatedDiscard = [...discard];
            const cardsToAdd = [];

            selectedAbilityIds.forEach((id) => {
                const findAndAppendFrom = (pile: CombatAbility[]): boolean => {
                    const index = pile.findIndex((ability) => ability.instanceId === id);
                    if (index > -1) {
                        const [card] = pile.splice(index, 1);
                        cardsToAdd.push({ ...card, effects: [...(card.effects || []), ...effects] });
                        return true;
                    }
                };

                if (!findAndAppendFrom(updatedDeck)) {
                    findAndAppendFrom(updatedDiscard);
                }
            });

            dispatch(
                updateBattle({
                    hand: [...cardsToAdd, ...hand],
                    deck: updatedDeck,
                    discard: updatedDiscard,
                })
            );

            triggerAddCardsToHandEvent();
            const playbackCollectorInstance = playbackCollector();
            const context: ActionContext = { playbackCollector: playbackCollectorInstance };
            dispatch(handleOnDrawEvents({ cardsToDraw: cardsToAdd, context }));
            dispatch(pushEventQueue(playbackCollectorInstance.get()));

            return;
        }

        dispatch(
            updateBattle({
                hand: [...selectedAbilities, ...hand],
            })
        );

        triggerAddCardsToHandEvent();
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

import uuid from "uuid";
import { aggregateAbilityEffects } from "../../Menu/utils";
import {
    ACTION_TYPES,
    Ability,
    AbilityEffect,
    AbilityEvent,
    Action,
    CARD_PILE_TYPES,
    CombatAbility,
    CombatEffect,
    EFFECT_EVENT_KEYS,
    MoveCards,
    SELECT_CARD_TYPES,
} from "../../ability/types";
import { Combatant } from "../../character/types";
import { getRandomItem, getRandomItems, shuffle } from "../../utils";
import { CARD_ADDED_PLAYBACK_SPEED, CARD_DEPLETED_PLAYBACK_SPEED, MAX_HAND_SIZE, battleWarnings } from "../constants";
import { battleStateSlice } from "../reducer";
import getCardSelection from "../selectCardUtils";
import { Event, TRIGGER_SOURCE_TYPES } from "../types";
import { ping } from "./../../ability/magician/magicianAbilities";
import { getRandomInt } from "./../../utils";
import { TriggerSource } from "./../types";
import { checkEventTrigger, updateCombatant, useAbility } from "./actions";
import { handleDiscard, prepareForDiscard, usePlayerAbility } from "./playerTurn";
import { passesConditions, passesValueComparison } from "../passesConditions";
import _ from "lodash";
import { getLastPlayedCards } from "../../ability/AbilityView/utils";

const { updateBattle, pushEventQueue, promptPlayerSelectCards, setNotification } = battleStateSlice?.actions || {};

export const drawCards = ({
    effects = [],
    filters = [],
    amount,
    source,
}: {
    effects?: AbilityEffect[];
    filters?: ACTION_TYPES[];
    amount: number;
    source?: TriggerSource;
}) => {
    return (dispatch, getState) => {
        const { deck, hand, discard, playerSide, enemySide } = getState().battle;
        let newDeck: Ability[] = deck.slice();
        let newHand = hand.slice();
        let newDiscard = discard.slice();
        const cardsToDraw = [];
        let deckCycled = false;

        if (filters.length) {
            // If we are looking for eg. offense cards only, the deck cannot be cycled; search the discard for remaining offense cards instead.
            // If there are not enough to fulfill the quota, it just whiffs.
            while (cardsToDraw.length !== amount) {
                const i = newDeck.findIndex((ability) => ability.actions.some((action: Action) => filters.includes(action.type)));
                if (i === -1) {
                    break;
                }

                const [card] = newDeck.splice(i, 1);
                cardsToDraw.push(card);
            }

            while (cardsToDraw.length !== amount) {
                const i = newDiscard.findIndex((ability) => ability.actions.some((action: Action) => filters.includes(action.type)));
                if (i === -1) {
                    break;
                }

                const [card] = newDiscard.splice(i, 1);
                cardsToDraw.push(card);
            }
        } else {
            // Handle normal card draw
            if (newDeck.length < amount) {
                cardsToDraw.push(...newDeck.slice());
                newDeck = shuffle(discard);
                newDiscard = [];
                cardsToDraw.push(...newDeck.splice(0, amount - cardsToDraw.length));
                deckCycled = true;
            } else {
                cardsToDraw.push(...newDeck.splice(0, amount));
            }
        }

        let handTooFull = false;
        for (const card of cardsToDraw) {
            if (newHand.length > MAX_HAND_SIZE) {
                newDiscard.push(card);
                handTooFull = true;
                continue;
            }

            const existingEffects = card.effects || [];
            newHand.push({
                ...card,
                effects: [...existingEffects, ...effects],
            });
        }

        if (handTooFull) {
            dispatch(setNotification({ text: battleWarnings.handFull, severity: "warning", id: uuid.v4() }));
        }

        const newState = {
            deck: newDeck,
            hand: newHand,
            discard: newDiscard,
            deckCycled,
        };

        dispatch(updateBattle(newState));
        cardsToDraw.forEach((card: CombatAbility) => {
            if (card.onDraw?.ability) {
                const player = playerSide.find((combatant: Combatant | null) => combatant?.isPlayer);
                dispatch(useAbility({ ability: card.onDraw?.ability, actorId: player?.id, isProc: true }));
            }
        });
        playerSide.concat(enemySide).forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onDrawCard,
                        source: {
                            ...source,
                            isProc: true,
                            trackSumAmount: cardsToDraw.length,
                        },
                    })
                );
            }
        });
        if (deckCycled) {
            playerSide.concat(enemySide).forEach((combatant) => {
                if (combatant) {
                    dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onDeckCycle, source }));
                }
            });
        }
        dispatch(recalculateEffectsFromAbilities());
    };
};

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

const handleSelectCards = ({ selectCards, isAutoCast, triggerAddCardsToHandEvent }) => {
    return (dispatch, getState) => {
        if (!isAutoCast) {
            dispatch(
                promptPlayerSelectCards({
                    selectCards,
                })
            );
            return;
        }
        const { type, maxAmount = 1 } = selectCards;

        const { hand, deck, discard, playerSide } = getState().battle;
        const player = playerSide.find((c: Combatant | null) => c?.isPlayer);

        const cards = getRandomItems(
            getCardSelection({
                hand,
                deck,
                discard,
                selectCards: selectCards,
                selectedAbilityId: null,
                player,
            }),
            maxAmount
        );

        if (cards.length) {
            if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
                // TODO no op for now. There are no actions which deplete from hand.
            } else if (type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK) {
                const cardsToMove = cards.map((card: CombatAbility) =>
                    applyAbilityEventEffects({ event: card.onLeaveHand, ability: card })
                );
                const updatedHand = hand.filter((ability: CombatAbility) =>
                    cardsToMove.every((card) => card.instanceId !== ability.instanceId)
                );
                const updatedDeck = [...cards, ...deck];
                dispatch(updateBattle({ hand: updatedHand, deck: updatedDeck }));
            } else {
                dispatch(updateBattle({ hand: [...hand, ...cards] }));
                triggerAddCardsToHandEvent(cards.length);
            }
        }
    };
};

const handleMoveCards = ({
    moveCards,
    triggerAddCardsToHandEvent,
    source,
}: {
    moveCards: MoveCards;
    triggerAddCardsToHandEvent;
    source: TriggerSource;
}) => {
    return (dispatch, getState) => {
        const { from, to, amount = 1, moveType, filters } = moveCards;
        const validKeys = Object.values(CARD_PILE_TYPES);
        if (!validKeys.includes(from) || !validKeys.includes(to)) {
            return;
        }

        const battle = getState().battle;
        const fromPile: CombatAbility[] = battle[from]?.slice() || [];
        const toPile: CombatAbility[] = battle[to]?.slice() || [];

        const parentCardId = (source?.source as CombatAbility)?.instanceId;

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
            // If we're moving an Ephemeral card to discard, treat it as a normal discard (the card vanishes).
            if (card.removeAfterTurn && to === CARD_PILE_TYPES.DISCARD) {
                return false;
            }
            return true;
        });

        if (moveType === "append") {
            toPile.push(...filteredCardsToMove);
        } else {
            toPile.unshift(...filteredCardsToMove);
        }

        dispatch(
            pushEventQueue({
                id: uuid.v4(),
                playbackTime: CARD_ADDED_PLAYBACK_SPEED,
                newCards: cardsToMove,
                cardsAddedTo: to,
            } as Event)
        );

        dispatch(
            updateBattle({
                [from]: fromPile.filter((card) => cardsToMove.every((movedCard) => movedCard.instanceId !== card.instanceId)),
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
    source,
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

/**
 * Handle effects that add card(s) to the player's hand, deck, discard.
 */
export const checkCardActions = ({
    action,
    source,
    isAutoCast,
}: {
    action: { [key in keyof Action]?: Action[key] };
    source?: TriggerSource;
    isAutoCast?: boolean;
}) => {
    return (dispatch, getState) => {
        const {
            drawCards: cardsToDraw,
            addCards,
            addCardsToDeck,
            addCardsToDiscard,
            applyAbilityEffects,
            selectCards,
            retrieveDepletedCards,
            moveCards,
            addLastPlayedCards,
            discardCardsFromHand,
            playCards,
        } = action;

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
                dispatch(usePlayerAbility({ ability }));
                dispatch(handleDiscard(ability));
            });
        }

        if (cardsToDraw) {
            dispatch(drawCards({ ...cardsToDraw, source }));
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
                            source: {
                                ...source,
                                trackSumAmount: amount,
                            },
                        })
                    );
                }
            });
        };

        if (addCards) {
            let newHand = [
                ...getState().battle.hand,
                ...addCards.map((card: Ability) => ({
                    ...card,
                    instanceId: uuid.v4(),
                })),
            ];

            if (newHand.length > MAX_HAND_SIZE) {
                newHand = newHand.slice(0, MAX_HAND_SIZE);
                dispatch(setNotification({ text: battleWarnings.handFull, severity: "warning", id: uuid.v4() }));
            }

            dispatch(
                updateBattle({
                    hand: newHand,
                })
            );

            triggerAddCardsToHandEvent(addCards.length);
        }

        if (addCardsToDeck) {
            const updatedDeck = [...getState().battle.deck];
            addCardsToDeck.forEach((card: Ability) => {
                const index = getRandomInt(1, updatedDeck.length - 1);
                updatedDeck.splice(index, 0, {
                    ...card,
                    instanceId: uuid.v4(),
                });
            });

            dispatch(
                pushEventQueue({
                    id: uuid.v4(),
                    playbackTime: CARD_ADDED_PLAYBACK_SPEED,
                    newCards: addCardsToDeck,
                    cardsAddedTo: "deck",
                } as Event)
            );

            dispatch(
                updateBattle({
                    deck: updatedDeck,
                })
            );
        }

        if (addCardsToDiscard) {
            dispatch(
                pushEventQueue({
                    id: uuid.v4(),
                    playbackTime: CARD_ADDED_PLAYBACK_SPEED,
                    newCards: addCardsToDiscard,
                    cardsAddedTo: "discard",
                } as Event)
            );

            dispatch(
                updateBattle({
                    discard: [
                        ...getState().battle.discard,
                        ...addCardsToDiscard.map((card: Ability) => ({
                            ...card,
                            instanceId: uuid.v4(),
                        })),
                    ],
                })
            );
        }

        if (typeof retrieveDepletedCards?.amount === "number") {
            dispatch(handleRetrieveDepletedCards({ amount: retrieveDepletedCards?.amount, source, triggerAddCardsToHandEvent }));
        }

        // If we apply card effects, assume we always want to do it AFTER drawCards/addCards. Otherwise, configure the actions to be separate and in the desired order!
        if (applyAbilityEffects) {
            const { amount = Infinity, pile: pileKey } = applyAbilityEffects;
            const pile = getState().battle[pileKey];
            const affectedCards = shuffle(pile)
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
            dispatch(handleSelectCards({ isAutoCast, selectCards, triggerAddCardsToHandEvent }));
        }

        if (moveCards) {
            dispatch(handleMoveCards({ moveCards, triggerAddCardsToHandEvent, source }));
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
                    hand: [...hand, ...cardsToHand],
                })
            );
        }
    };
};

/**
 * Some status effects are stored on the ability object and are gained only when holding/owning the ability.
 * These effects need to be recalculated as your hand/deck/discard change.
 * @see greaterBolt for an example
 */
export const recalculateEffectsFromAbilities = () => {
    return (dispatch, getState) => {
        const { playerSide, deck, hand, discard } = getState().battle;
        const player = playerSide.find((combatant) => combatant?.isPlayer);
        if (!player) {
            return;
        }

        const effects = player.effects.filter((e) => !e.isEffectFromHoldingAbility);
        dispatch(
            updateCombatant({
                combatantId: player.id,
                newProperties: {
                    effects: [...effects, ...aggregateAbilityEffects([...deck, ...hand, ...discard])],
                },
            })
        );
    };
};

/**
 * Send `abilities` to the deplete pile and trigger the onDeplete effect event.
 */
export const depleteAbilities =
    ({ actorId, abilities = [] }: { actorId: string; abilities: CombatAbility[] }) =>
    (dispatch, getState) => {
        const { hand, depleted = [] } = getState().battle;
        dispatch(
            pushEventQueue({
                ...getState().battle,
                id: uuid.v4(),
                playbackTime: CARD_DEPLETED_PLAYBACK_SPEED,
                newCards: abilities,
                cardsAddedTo: CARD_PILE_TYPES.DEPLETED,
            } as Event)
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
                    source: { source: card, type: TRIGGER_SOURCE_TYPES.ABILITY, triggerHistory: [] },
                })
            );
        });
    };

export const applyAbilityEventEffects = ({
    event,
    ability,
    source,
}: {
    event: AbilityEvent;
    ability: CombatAbility;
    source?: TriggerSource;
}): CombatAbility => {
    if (!event) {
        return ability;
    }

    const { abilityEffects = [], mode } = event || {};
    const effectsToApply = mode === "random-pick" ? [getRandomItem(abilityEffects)].filter((v) => v) : abilityEffects;

    const getCalculationTarget = () => undefined; // TODO for more comprehensive check, add combatants
    if (!passesConditions({ source, getCalculationTarget, proc: event })) {
        return ability;
    }

    const effects = [...(ability.effects || [])];

    effectsToApply.forEach((e: AbilityEffect) => {
        const countMap = effects.reduce((acc, e: AbilityEffect) => {
            if (e.name) {
                acc[e.name] = (acc[e.name] || 0) + 1;
            }

            return acc;
        }, {});

        const { name, maxApplications } = e;
        if (!maxApplications || !countMap[name] || countMap[name] < maxApplications) {
            effects.push(e);
        }
    });

    return { ...ability, effects };
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
                            source: {
                                type: TRIGGER_SOURCE_TYPES.ABILITY,
                                triggerHistory: [],
                                source: abilityQueued,
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
                        cardsToAdd.push({ ...card, effects });
                        return true;
                    }
                };

                if (!findAndAppendFrom(updatedDeck)) {
                    findAndAppendFrom(updatedDiscard);
                }
            });

            dispatch(
                updateBattle({
                    hand: [...hand, ...cardsToAdd],
                    deck: updatedDeck,
                    discard: updatedDiscard,
                })
            );

            triggerAddCardsToHandEvent();
            return;
        }

        dispatch(
            updateBattle({
                hand: [...hand, ...selectedAbilities],
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
    source,
}: {
    drawOriginalAbility: boolean;
    effect: CombatEffect;
    source: TriggerSource;
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

        if (newHand.length > MAX_HAND_SIZE) {
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

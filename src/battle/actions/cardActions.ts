import uuid from "uuid";
import { aggregateAbilityEffects } from "../../Menu/utils";
import {
    ACTION_TYPES,
    Ability,
    AbilityEffect,
    Action,
    EFFECT_EVENT_KEYS,
    CombatAbility,
    SELECT_CARD_TYPES,
    AbilityEvent,
} from "../../ability/types";
import { Combatant } from "../../character/types";
import { getRandomItems, shuffle } from "../../utils";
import { CARD_ADDED_PLAYBACK_SPEED, CARD_DEPLETED_PLAYBACK_SPEED, MAX_HAND_SIZE } from "../constants";
import { battleStateSlice } from "../reducer";
import getCardSelection from "../selectCardUtils";
import { Event, TRIGGER_SOURCE_TYPES } from "../types";
import { getRandomInt } from "./../../utils";
import { TriggerSource } from "./../types";
import { checkEventTrigger, updateCombatant, useAbility } from "./actions";
import { prepareForDiscard } from "./playerTurn";

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
            dispatch(setNotification({ text: "Your hand is too full!", severity: "warning", id: uuid.v4() }));
        }

        const newState = {
            deck: newDeck,
            hand: newHand,
            discard: newDiscard,
        };

        dispatch(updateBattle(newState));
        cardsToDraw.forEach((card: CombatAbility) => {
            if (card.onDraw?.ability) {
                const player = playerSide.find((combatant: Combatant | null) => combatant?.isPlayer);
                dispatch(useAbility({ ability: card.onDraw?.ability, actorId: player?.id }));
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

/**
 * Handle effects that add card(s) to the player's hand, deck, discard.
 */
export const checkCardActions = (action: { [key in keyof Action]?: Action[key] }, source?: TriggerSource, isAutoCast?: boolean) => {
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
        } = action;

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
                dispatch(setNotification({ text: "Your hand is too full!", severity: "warning", id: uuid.v4() }));
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
                    ...getState().battle,
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
                    ...getState().battle,
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

        if (retrieveDepletedCards?.amount) {
            const sourceAbilityId = source?.source ? (source?.source as CombatAbility)?.instanceId : undefined;
            // Prevent eg. Bag From Beyond from pulling itself back out (it can still pull out other Bags From Beyond)
            const eligible = shuffle([...getState().battle.depleted.filter((card) => card.instanceId !== sourceAbilityId)]);
            if (eligible.length > 0) {
                const cardsToHand = [];
                Array.from({ length: retrieveDepletedCards.amount }).forEach(() => {
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
                            return applyAbilityEventEffects({ event: applyAbilityEffects, ability: card });
                        }
                        return card;
                    }),
                })
            );
        }

        if (selectCards) {
            if (isAutoCast) {
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
                return;
            }

            dispatch(
                promptPlayerSelectCards({
                    selectCards,
                })
            );
        }

        if (moveCards) {
            const { from, to, amount = 1 } = moveCards;
            const validKeys = ["hand", "deck", "discard", "deplete"];
            if (!validKeys.includes(from) || !validKeys.includes(to)) {
                return;
            }

            const battle = getState().battle;
            const fromPile: CombatAbility[] = battle[from]?.slice() || [];
            const toPile: CombatAbility[] = battle[to]?.slice() || [];
            const cardsToMove = [];
            // If there are no cards in the `from` pile, just whiff
            for (let i = 0; i < amount && fromPile.length > 0; ++i) {
                cardsToMove.push(fromPile.shift());
            }

            toPile.unshift(...cardsToMove);

            dispatch(
                pushEventQueue({
                    ...getState().battle,
                    id: uuid.v4(),
                    playbackTime: CARD_ADDED_PLAYBACK_SPEED,
                    newCards: cardsToMove,
                    cardsAddedTo: to,
                } as Event)
            );

            dispatch(
                updateBattle({
                    [from]: fromPile,
                    [to]: toPile,
                })
            );

            if (to === "hand") {
                triggerAddCardsToHandEvent(cardsToMove.length);
            }
        }

        if (addLastPlayedCards) {
            const { amount, abilityEffects = [] } = addLastPlayedCards;
            const { hand, playerSide } = getState().battle;
            const player = playerSide.find((c: Combatant | null) => c?.isPlayer);

            // Procced abilities do not have instanceIds, only actual cards do. Do not copy procs.
            const historyPile = player.abilityHistory
                .slice()
                .reverse()
                .filter((ability) => ability.instanceId);

            const cardsToHand = historyPile.slice(0, amount).map((card) =>
                applyAbilityEventEffects({
                    event: { abilityEffects },
                    ability: {
                        ...card,
                        instanceId: uuid.v4(),
                        removeAfterTurn: abilityEffects.some((e) => e.removeParentCardAfterTurn), // Why not make this effect consumed properly by the system?
                    },
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
                cardsAddedTo: "deplete",
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

export const applyAbilityEventEffects = ({ event, ability }: { event: AbilityEvent; ability: CombatAbility }) => {
    if (!event) {
        return ability;
    }

    const { abilityEffects = [] } = event || {};

    const effects = [...(ability.effects || [])];

    abilityEffects.forEach((e: AbilityEffect) => {
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

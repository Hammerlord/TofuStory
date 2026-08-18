import _ from "lodash";
import * as uuid from "uuid";
import { aggregateAbilityEffects } from "../../Menu/utils";
import { getLastPlayedCards } from "../../ability/AbilityView/utils";
import {
    ACTION_TYPES,
    Ability,
    AbilityEffect,
    AbilityEvent,
    Action,
    CARD_PILE_TYPES,
    CardBonus,
    CombatAbility,
    CombatEffect,
    Comparator,
    EFFECT_EVENT_KEYS,
    Effect,
    FROM_CARD_PILE_TYPES,
    MoveCards,
    SELECT_CARD_TYPES,
    SelectCards,
    TARGET_TYPES,
} from "../../ability/types";
import { Combatant } from "../../character/types";
import { getRandomItem, getRandomItems, passesChance, shuffle } from "../../utils";
import { CARD_ADDED_PLAYBACK_SPEED, MAX_HAND_SIZE, battleWarnings } from "../constants";
import { passesConditions, passesValueComparison } from "../passesConditions";
import { BattleState, battleStateSlice } from "../reducer";
import getCardSelection, { cardPassesFilterCondition } from "../selectCardUtils";
import { TRIGGER_SOURCE_TYPES, TriggerSource } from "../types";
import { getRandomInt } from "./../../utils";
import { ActionContext } from "./../types";
import {
    applyStatChanges,
    checkEventTrigger,
    enqueueEvent,
    findCombatantData,
    triggerStatChangeEvents,
    updateCombatant,
    useAbility,
} from "./actions";
import { getUpdatedStats } from "./getUpdatedStats";
import { handleDiscard, prepareForDiscard, usePlayerAbility } from "./playerTurn";

const { updateBattle, promptPlayerSelectCards, setNotification } = battleStateSlice?.actions || {};

const sumCardDrawAmount = ({ effects, source, amount }: { effects?: AbilityEffect[]; amount: number; source?: TriggerSource }) => {
    if (effects?.length) {
        amount += effects.reduce((acc, cur) => {
            return (acc += cur?.drawCards || 0);
        }, 0);
    }

    const parentEffects = (source?.source as CombatAbility)?.effects;
    if (parentEffects?.length) {
        amount += parentEffects.reduce((acc, cur) => {
            return (acc += cur?.drawCards || 0);
        }, 0);
    }

    return amount;
};

/**
 * Bowman mechanic.
 * The "Critical" keyword is actually just an onDraw effect where its chance rate is the player's total criticalChance + the draw effect event's chance.
 */
const getTotalCritChance = (playerSide: (Combatant | null)[]) => {
    let total = 0;
    playerSide.forEach((combatant) => {
        if (!combatant?.HP) {
            return;
        }

        combatant.effects.forEach((e) => {
            if (typeof e.criticalChance === "number") {
                total += e.criticalChance;
            }
        });
    });

    return total;
};

/**
 * Eg. when you draw a card, check that card for a certain condition to trigger a bonus.
 * @see maneuver Bowman ability for an example how this is used.
 */
const handleCardActionBonus = ({
    bonus,
    targetCards,
    context: context,
}: {
    bonus?: CardBonus[];
    targetCards: CombatAbility[];
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        if (!bonus) {
            return;
        }

        const passesConditions = (
            conditions: {
                property?: string;
                value?: any;
                comparator?: Comparator;
            }[]
        ) => {
            if (!conditions?.length) {
                return true;
            }
            return targetCards.some((card) => {
                return conditions.some((condition) => {
                    const { property, value, comparator } = condition;
                    const propertyVal = _.get(card, property);
                    return passesValueComparison({ val: propertyVal, otherVal: value, comparator });
                });
            });
        };

        const battle: BattleState = getState().battle;
        const player = battle.playerSide.find((c) => c?.isPlayer);

        const bonusesInEffect = bonus
            .filter((bonus: CardBonus) => {
                return passesConditions(bonus.conditions);
            })
            .reduce((acc, cur) => {
                return {
                    ...acc,
                    resources: (acc.resources || 0) + (cur.resources || 0),
                };
            }, {});

        const updated = getUpdatedStats({
            ...getState().battle,
            actorId: player.id,
            targetIds: [player.id],
            action: {
                type: ACTION_TYPES.EFFECT,
                ...bonusesInEffect,
            },
            context: {
                ...context,
            },
            getCombatantById: (id) => findCombatantData(getState().battle, id),
        });
        dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));
    };
};

const triggerCardActionCombatantBonuses = ({ ability, effects }: { ability: CombatAbility; effects: Effect[] }) => {
    return (dispatch, getState) => {
        const player = getState().battle.playerSide.find((combatant: Combatant | null) => combatant?.isPlayer);
        const parentSourceChain = [{ source: ability, type: TRIGGER_SOURCE_TYPES.ABILITY }];
        const updated = getUpdatedStats({
            ...getState().battle,
            action: {
                type: ACTION_TYPES.EFFECT,
                target: TARGET_TYPES.SELF,
                effects,
            },
            actorId: player.id,
            targetIds: [player.id],
            actionParent: ability,
            context: { sourceChain: parentSourceChain },
            getCombatantById: (id) => findCombatantData(getState().battle, id),
        });
        /**
 * {
                        source: action,
                        type: TRIGGER_SOURCE_TYPES.EFFECT,
                        actorId: player.id,
                        targetId: player.id,
                        statUpdate,
                        triggerHistory: [],
                    }
 */
        dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));
        dispatch(
            triggerStatChangeEvents(
                updated.map(({ statUpdate, action }) => ({
                    statUpdate,
                    context: {
                        sourceChain: [
                            ...parentSourceChain,
                            {
                                source: action,
                                type: TRIGGER_SOURCE_TYPES.EFFECT,
                                actorId: player.id,
                                targetId: player.id,
                                statUpdate,
                                triggerHistory: [],
                            },
                        ],
                    },
                }))
            )
        );
    };
};

export const applyAbilityEffectsOnDraw = ({
    drawnCard,
    source: source,
    effects,
    playerSide,
}: {
    drawnCard: CombatAbility;
    source: TriggerSource;
    effects: AbilityEffect[];
    playerSide: (Combatant | null)[];
}) => {
    const onDrawEffects = drawnCard.onDraw?.abilityEffects;
    if (onDrawEffects) {
        const totalCritChance = getTotalCritChance(playerSide);
        drawnCard = applyAbilityEventEffects({
            event: drawnCard.onDraw,
            source: source,
            ability: drawnCard,
            bonusChance: totalCritChance,
        });
    }
    return {
        ...drawnCard,
        effects: [...(drawnCard.effects || []), ...effects],
    };
};

export const drawCards = ({
    effects = [],
    filters = [],
    amount,
    bonus,
    context: context,
}: {
    effects?: AbilityEffect[];
    filters?: ACTION_TYPES[];
    amount: number;
    bonus?: CardBonus[];
    context?: ActionContext;
}) => {
    return (dispatch, getState) => {
        const { deck, hand, discard, playerSide, enemySide } = getState().battle;
        const player = playerSide?.find((c) => c?.isPlayer);
        const hasViewDeckInOrder = player?.effects.some((e) => e.viewDeckInOrder);

        // Deck cards are mostly hidden. Eg. don't give away the fact that Sudden Death is going to be drawn
        // unless we have Spectrum Goggles
        if (context?.isPreviewMode && !hasViewDeckInOrder) {
            return;
        }

        let newDeck: Ability[] = deck.slice();
        let newHand: Ability[] = hand.slice();
        let newDiscard = discard.slice();
        let cardsToDraw: CombatAbility[] = [];
        let deckCycled = false;
        const source = context?.sourceChain?.at(-1);
        amount = sumCardDrawAmount({ effects, source, amount });

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
        cardsToDraw = cardsToDraw.map((card) => applyAbilityEffectsOnDraw({ drawnCard: card, source, effects, playerSide }));

        for (let card of cardsToDraw) {
            if (newHand.length > MAX_HAND_SIZE) {
                newDiscard.push(card);
                handTooFull = true;
                continue;
            }

            newHand.unshift(card);
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
            const onDraw = card.onDraw;
            if (onDraw) {
                const { chance = 1, ability, effects } = onDraw;

                if (!passesChance(chance)) {
                    return;
                }

                if (ability) {
                    const player = getState().battle.playerSide.find((combatant: Combatant | null) => combatant?.isPlayer);
                    dispatch(useAbility({ ability, actorId: player.id, isProc: true }));
                }

                if (effects) {
                    dispatch(triggerCardActionCombatantBonuses({ ability: card, effects }));
                }
            }
        });

        dispatch(handleCardActionBonus({ bonus, targetCards: cardsToDraw, context }));

        playerSide.concat(enemySide).forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onDrawCard,
                        context: {
                            ...context,
                            trackSumAmount: cardsToDraw.length,
                            isProc: true,
                        },
                    })
                );
            }
        });

        if (deckCycled) {
            playerSide.concat(enemySide).forEach((combatant) => {
                if (combatant) {
                    dispatch(
                        checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onDeckCycle, context: context })
                    );
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

const handleSelectCards = ({
    selectCards,
    isAutoCast,
    source: source,
    triggerAddCardsToHandEvent,
}: {
    selectCards: SelectCards;
    isAutoCast?: boolean;
    source?: TriggerSource;
    triggerAddCardsToHandEvent: (numCards: number) => void;
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

        const cards = getRandomItems(
            getCardSelection({
                hand,
                deck,
                discard,
                selectCards: selectCards,
                selectedAbilityId: undefined,
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
            let cardsToAdd = addCards.filter((card) => !card.isUnique || !ownedCards[card.name]);
            cardsToAdd = cardsToAdd
                .map((card: Ability) => ({
                    ...card,
                    instanceId: uuid.v4(),
                }))
                .reverse();

            let newHand = [...cardsToAdd, ...getState().battle.hand];

            if (newHand.length > MAX_HAND_SIZE) {
                const toDiscard = newHand.slice(MAX_HAND_SIZE);
                newHand = newHand.slice(0, MAX_HAND_SIZE);
                dispatch(setNotification({ text: battleWarnings.handFull, severity: "warning", id: uuid.v4() }));
                dispatch(prepareForDiscard(toDiscard));
            }

            dispatch(
                updateBattle({
                    hand: newHand,
                })
            );

            triggerAddCardsToHandEvent(addCards.length);
        }

        dispatch(checkAddCardsToDeck({ action, ownedCards, context }));

        if (addCardsToDiscard) {
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
            dispatch(handleSelectCards({ isAutoCast, source, selectCards, triggerAddCardsToHandEvent }));
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
                    hand: [...hand, ...cardsToHand],
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

export const applyAbilityEventEffects = ({
    event,
    ability,
    source,
    bonusChance,
}: {
    event: AbilityEvent;
    ability: CombatAbility;
    source?: TriggerSource;
    bonusChance?: number;
}): CombatAbility => {
    if (!event) {
        return ability;
    }

    const { abilityEffects = [], mode, chance } = event || {};

    const totalChance = typeof chance === "number" ? chance + (bonusChance || 0) : undefined;
    if (!passesChance(totalChance)) {
        return ability;
    }

    const effectsToApply = mode === "random-pick" ? [getRandomItem(abilityEffects)].filter((v) => v) : abilityEffects;

    const getCalculationTarget = () => undefined; // TODO for more comprehensive check, add combatants
    if (!passesConditions({ source: source, getCalculationTarget, proc: event })) {
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

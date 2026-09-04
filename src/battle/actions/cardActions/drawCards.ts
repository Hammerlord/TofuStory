import _ from "lodash";
import { aggregateAbilityEffects } from "../../../Menu/utils";
import {
    ACTION_TYPES,
    Ability,
    AbilityEffect,
    Action,
    CardBonus,
    CombatAbility,
    Comparator,
    EFFECT_EVENT_KEYS,
    Effect,
    TARGET_TYPES,
} from "../../../ability/types";
import { Combatant } from "../../../character/types";
import { passesChance, shuffle } from "../../../utils";
import { passesValueComparison } from "../../passesConditions";
import { BattleState, battleStateSlice } from "../../reducer";
import { ActionContext, TRIGGER_SOURCE_TYPES, TriggerSource } from "../../types";
import { findCombatantData, updateCombatant } from "../combatantData";
import { getUpdatedStats } from "../getUpdatedStats";
import { applyStatChanges, triggerStatChangeEvents } from "../statChanges";
import { checkEventTrigger } from "../statusEffect/triggerEffectEvent";
import { useAbility } from "../useAbility";
import { applyAbilityEventEffects } from "./utils";

const { updateBattle, addCardsToHand } = battleStateSlice?.actions || {};

export const drawCards = ({
    effects = [],
    filters = [],
    amount,
    bonus,
    context: context,
    isOnTurnDraw = false,
}: {
    effects?: AbilityEffect[];
    filters?: ACTION_TYPES[];
    amount: number;
    bonus?: CardBonus[];
    context?: ActionContext;
    isOnTurnDraw?: boolean;
}) => {
    return (dispatch, getState) => {
        const { deck, discard, playerSide, enemySide } = getState().battle;
        const player = playerSide?.find((c) => c?.isPlayer);
        const hasViewDeckInOrder = player?.effects.some((e) => e.viewDeckInOrder);

        // Deck cards are mostly hidden. Eg. don't give away the fact that Sudden Death is going to be drawn
        // unless we have Spectrum Goggles
        if (context?.isPreviewMode && !hasViewDeckInOrder) {
            return;
        }

        let newDeck: Ability[] = deck.slice();
        let newDiscard = discard.slice();
        let cardsToDraw: CombatAbility[] = [];
        let deckCycled = false;
        const source = context?.sourceChain?.at(-1);
        amount = sumCardDrawAmount({ effects, source, amount });

        const addCardsToDraw = (numCards: number) => {
            const cards = [];
            if (filters.length) {
                // If we are looking for eg. offense cards only, the deck cannot be cycled; search the discard for remaining offense cards instead.
                // If there are not enough to fulfill the quota, it just whiffs.
                while (cards.length !== numCards) {
                    const i = newDeck.findIndex((ability) => ability.actions.some((action: Action) => filters.includes(action.type)));
                    if (i === -1) {
                        break;
                    }

                    const [card] = newDeck.splice(i, 1);
                    cards.push(card);
                }

                while (cards.length !== numCards) {
                    const i = newDiscard.findIndex((ability) => ability.actions.some((action: Action) => filters.includes(action.type)));
                    if (i === -1) {
                        break;
                    }

                    const [card] = newDiscard.splice(i, 1);
                    cards.push(card);
                }
            } else {
                // Handle normal card draw
                if (newDeck.length < numCards) {
                    cards.push(...newDeck.slice());
                    newDeck = shuffle(discard);
                    newDiscard = [];
                    cards.push(...newDeck.splice(0, numCards - cards.length));
                    deckCycled = true;
                } else {
                    cards.push(...newDeck.splice(0, numCards));
                }
            }

            cardsToDraw.push(...cards);
            return cards;
        };

        const cardsDrawn = addCardsToDraw(amount);

        const handlePreemptive = (cards: CombatAbility[], maxRetries = 3) => {
            const numPreemptiveCards = cards.filter((c) => c.preemptive).length;
            if (numPreemptiveCards > 0) {
                const newCards = addCardsToDraw(numPreemptiveCards);
                if (newCards.length > 0) {
                    handlePreemptive(newCards, --maxRetries);
                }
            }
        };

        if (isOnTurnDraw) {
            handlePreemptive(cardsDrawn);
        }

        cardsToDraw = cardsToDraw.map((card) => applyAbilityEffectsOnDraw({ drawnCard: card, context, effects, playerSide }));

        const newState = {
            deck: newDeck,
            discard: newDiscard,
            deckCycled,
        };

        dispatch(updateBattle(newState));
        dispatch(addCardsToHand(cardsToDraw));

        dispatch(handleOnDrawEvents({ cardsToDraw, bonus, context }));

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

export const applyAbilityEffectsOnDraw = ({
    drawnCard,
    context: context,
    effects,
    playerSide,
}: {
    drawnCard: CombatAbility;
    context: ActionContext;
    effects: AbilityEffect[];
    playerSide: (Combatant | null)[];
}) => {
    const onDrawEffects = drawnCard.onDraw?.abilityEffects;
    if (onDrawEffects) {
        const totalCritChance = getTotalCritChance(playerSide);
        drawnCard = applyAbilityEventEffects({
            event: drawnCard.onDraw,
            context: context,
            ability: drawnCard,
            bonusChance: totalCritChance,
        });
    }
    return {
        ...drawnCard,
        effects: [...(drawnCard.effects || []), ...effects],
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

export const handleOnDrawEvents = ({
    cardsToDraw,
    bonus,
    context,
}: {
    cardsToDraw: CombatAbility[];
    bonus?: CardBonus[];
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        const { playerSide, enemySide } = getState().battle;

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

        dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));
        dispatch(
            triggerStatChangeEvents(
                updated.map(({ statUpdate, action }) => ({
                    statUpdate,
                    context: {
                        name: "Card Action Bonuses",
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

import { AbilityEffect, CombatAbility, SELECT_CARD_TYPES, SelectCards } from "../../../ability/types";
import { Combatant, Player } from "../../../character/types";
import { battleStateSlice } from "../../reducer";
import getCardSelection from "../../selectCardUtils";
import { ActionContext, BATTLEFIELD_SIDES, TRIGGER_SOURCE_TYPES, TriggerSource } from "../../types";
import { playbackCollector } from "../playbackCollector";
import { triggerAddCardsToHandEvent } from "./cardActions";
import { depleteAbilities } from "./depleteCards";
import { prepareForDiscard } from "./utils";
import { drawCards, handleOnDrawEvents } from "./drawCards";
import { applyAbilityEventEffects } from "./utils";
import { AppDispatch, RootState } from "../../../store";

const { updateBattle, promptPlayerSelectCards, pushEventQueue, addCardsToHand } = battleStateSlice?.actions || {};

/**
 * Remove a card from existence based on its id.
 */
export const deleteCard = (abilityId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const { hand, deck, discard } = getState().battle!;

    dispatch(
        updateBattle({
            hand: hand.filter((card: CombatAbility) => card.instanceId !== abilityId),
            deck: deck.filter((card: CombatAbility) => card.instanceId !== abilityId),
            discard: discard.filter((card: CombatAbility) => card.instanceId !== abilityId),
        })
    );
};

export const selectCardsAction =
    ({
        type,
        selectedAbilities,
        player,
        effects = [],
        abilityQueued,
    }: {
        type: SELECT_CARD_TYPES;
        selectedAbilities: CombatAbility[];
        player: Player;
        effects?: AbilityEffect[];
        abilityQueued?: CombatAbility;
    }) =>
    (dispatch: AppDispatch, getState: () => RootState) => {
        const battle = getState().battle!;
        const { deck, hand, discard } = battle;
        const playbackCollectorInstance = playbackCollector();
        const context: ActionContext = { name: "Select Cards", playbackCollector: playbackCollectorInstance };

        if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
            dispatch(depleteAbilities({ actorId: player?.id, abilities: selectedAbilities, context }));
            dispatch(pushEventQueue(playbackCollectorInstance.get()));
            return;
        }

        const selectedAbilityIds = selectedAbilities.map((ability) => ability.instanceId);

        if (type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK) {
            const updatedHand: CombatAbility[] = [];
            const updatedDeck = [...deck];
            hand.forEach((ability: CombatAbility) => {
                if (selectedAbilityIds.includes(ability.instanceId)) {
                    updatedDeck.unshift(applyAbilityEventEffects({ event: ability.onLeaveHand, ability, player, battle }));
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

            dispatch(pushEventQueue(playbackCollectorInstance.get()));
            return;
        }

        if (type === SELECT_CARD_TYPES.DISCARD_TO_DRAW) {
            const updatedHand: CombatAbility[] = [];
            const updatedDiscard = [...discard];
            hand.forEach((ability: CombatAbility) => {
                if (selectedAbilityIds.includes(ability.instanceId)) {
                    updatedDiscard.unshift(...prepareForDiscard({ cards: [ability], player, battle }));
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
            dispatch(drawCards({ amount: selectedAbilityIds.length, context }));
            dispatch(pushEventQueue(playbackCollectorInstance.get()));
            return;
        }

        const triggerAddCardsEvent = () => {
            if (selectedAbilities.length === 0) {
                return;
            }

            const selectedAbilityContext: ActionContext = {
                ...context,
                sourceChain: [{ type: TRIGGER_SOURCE_TYPES.ABILITY, source: abilityQueued }],
                trackSumAmount: selectedAbilities.length,
            };

            dispatch(triggerAddCardsToHandEvent(selectedAbilities.length, selectedAbilityContext));
        };

        if (type === SELECT_CARD_TYPES.SEARCH_DECK) {
            const updatedDeck = [...deck];
            const updatedDiscard = [...discard];
            const cardsToAdd: CombatAbility[] = [];

            selectedAbilityIds.forEach((id) => {
                const findAndAppendFrom = (pile: CombatAbility[]): boolean => {
                    const index = pile.findIndex((ability) => ability.instanceId === id);
                    if (index > -1) {
                        const [card] = pile.splice(index, 1);
                        cardsToAdd.push({ ...card, effects: [...(card?.effects || []), ...effects] });
                        return true;
                    }

                    return false;
                };

                if (!findAndAppendFrom(updatedDeck)) {
                    findAndAppendFrom(updatedDiscard);
                }
            });

            dispatch(
                updateBattle({
                    deck: updatedDeck,
                    discard: updatedDiscard,
                })
            );

            dispatch(addCardsToHand(cardsToAdd));
            triggerAddCardsEvent();
            dispatch(handleOnDrawEvents({ cardsToDraw: cardsToAdd, context }));
            dispatch(pushEventQueue(playbackCollectorInstance.get()));

            return;
        }

        dispatch(addCardsToHand(selectedAbilities));
        triggerAddCardsEvent();
        dispatch(pushEventQueue(playbackCollectorInstance.get()));
    };

export const handleSelectCards = ({
    selectCards,
    isAutoCast,
    source: source,
    context,
}: {
    selectCards: SelectCards;
    isAutoCast?: boolean;
    source?: TriggerSource;
    context: ActionContext;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
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

        const battle = getState().battle!;
        const { hand, deck, discard, playerSide } = battle;
        const player = playerSide.find((c: Combatant | null) => c?.isPlayer) as Player;

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
            const cardsToMove = cards.map((card: CombatAbility) =>
                applyAbilityEventEffects({ event: card.onLeaveHand, ability: card, battle, player })
            );
            const updatedHand = hand.filter((ability: CombatAbility) =>
                cardsToMove.every((card) => card.instanceId !== ability.instanceId)
            );
            const updatedDeck = [...cards, ...deck];
            dispatch(updateBattle({ hand: updatedHand, deck: updatedDeck }));
        } else {
            dispatch(addCardsToHand(cards));
            dispatch(triggerAddCardsToHandEvent(cards.length, context));
        }

        if (type === SELECT_CARD_TYPES.SEARCH_DECK) {
            dispatch(handleOnDrawEvents({ cardsToDraw: cards, context }));
        }
    };
};

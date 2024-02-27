import { Action } from "@reduxjs/toolkit";
import uuid from "uuid";
import { JOB_CARD_MAP } from "../ability";
import { AbilityEffect, CombatAbility } from "../ability/types";
import { shuffle } from "../utils";
import { SELECT_CARD_TYPES, SelectCards } from "./../ability/types";
import { Player } from "../character/types";

const DEFAULT_NUM_OPTIONS = 3;

const getCardSelection = ({
    hand,
    deck,
    discard,
    selectCards,
    selectedAbilityId,
    player,
}: {
    selectCards: SelectCards;
    selectedAbilityId?: string;
    hand: CombatAbility[];
    deck: CombatAbility[];
    discard: CombatAbility[];
    player: Player;
}): CombatAbility[] => {
    const { effects = [], type, filters } = selectCards || {};
    const removeParentCardAfterTurn = effects.some((e: AbilityEffect) => e.removeParentCardAfterTurn); // Can't this stay as a part of `effects` and get read there?

    const createNewOption = (ability: CombatAbility): CombatAbility => {
        return {
            ...ability,
            instanceId: uuid.v4(),
            removeAfterTurn: removeParentCardAfterTurn,
            effects,
        };
    };

    const applyFilters = (cards: CombatAbility[]) => {
        // If we are prompting card selection as a prerequisite to using an ability, don't include that ability as an option
        if (selectedAbilityId) {
            cards = cards.filter(({ instanceId }) => instanceId !== selectedAbilityId);
        }
        if (filters?.length) {
            return cards.filter(({ actions }) => actions.some((action: Action) => filters.includes(action.type)));
        }
        return cards;
    };
    if (type === SELECT_CARD_TYPES.COPY_FROM_HAND) {
        return applyFilters(hand).map(createNewOption);
    }
    if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
        return applyFilters(hand);
    }

    if (type === SELECT_CARD_TYPES.DISCOVER_FROM_CLASS) {
        const firstJobCards = JOB_CARD_MAP[player.class]?.all || [];
        const secondJobCards = JOB_CARD_MAP[player.secondaryClass]?.all || [];
        const potentialAbilities = applyFilters([...firstJobCards, ...secondJobCards]);
        const shuffled = shuffle(potentialAbilities);
        return shuffled.slice(0, DEFAULT_NUM_OPTIONS).map(createNewOption);
    }

    if (type === SELECT_CARD_TYPES.PRESET_CARDS) {
        return selectCards?.cards?.map((card) => ({ ...card, instanceId: uuid.v4() })) || [];
    }

    if (type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK) {
        return applyFilters(hand);
    }

    if (type === SELECT_CARD_TYPES.DISCARD_TO_DRAW) {
        return applyFilters(hand);
    }

    if (type === SELECT_CARD_TYPES.SEARCH_DECK) {
        return applyFilters(deck.concat(discard))
            .slice(0, DEFAULT_NUM_OPTIONS)
            .map((card) => ({ ...card, effects }));
    }

    return [];
};

export default getCardSelection;

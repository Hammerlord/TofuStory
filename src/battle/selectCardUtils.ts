import { Action } from "@reduxjs/toolkit";
import * as uuid from "uuid";
import { JOB_CARD_MAP } from "../ability";
import { isOffensiveAction, isSupportAction } from "../ability/AbilityView/utils";
import { AbilityEffect, CardFilterCondition, CombatAbility } from "../ability/types";
import { Player } from "../character/types";
import { shuffle } from "../utils";
import { SELECT_CARD_TYPES, SelectCards } from "./../ability/types";

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
            removeAfterTurn: ability.removeAfterTurn || removeParentCardAfterTurn,
            effects: [...(ability.effects || []), ...effects],
        };
    };

    const applyFilters = (cards: CombatAbility[]) => {
        // If we are prompting card selection as a prerequisite to using an ability, don't include that ability as an option
        if (selectedAbilityId) {
            cards = cards.filter(({ instanceId }) => instanceId !== selectedAbilityId);
        }
        if (filters?.length) {
            return cards.filter((card) => cardPassesFilterCondition(card, filters));
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
        return selectCards?.cards?.map(createNewOption) || [];
    }

    if (type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK) {
        return applyFilters(hand).map((card) => ({ ...card, effects: [...(card.effects || []), ...effects] }));
    }

    if (type === SELECT_CARD_TYPES.DISCARD_TO_DRAW) {
        return applyFilters(hand).map((card) => ({ ...card, effects: [...(card.effects || []), ...effects] }));
    }

    if (type === SELECT_CARD_TYPES.SEARCH_DECK) {
        return applyFilters(deck.concat(discard))
            .slice(0, DEFAULT_NUM_OPTIONS)
            .map((card) => ({ ...card, effects: [...(card.effects || []), ...effects] }));
    }

    return [];
};

export const cardPassesFilterCondition = (card: CombatAbility, filters?: CardFilterCondition[]) => {
    if (!filters?.length) {
        return true;
    }
    // If we are prompting card selection as a prerequisite to using an ability, don't include that ability as an option
    return filters.some((filter) => {
        const { actionTypes, hasMinion, comparator, abilityType } = filter;
        const primaryAction = card.actions?.[0];
        if (abilityType === "support" && isSupportAction(primaryAction)) {
            return comparator !== "not";
        }

        if (abilityType === "offense" && isOffensiveAction(primaryAction)) {
            return comparator !== "not";
        }

        if (actionTypes) {
            if (comparator === "not") {
                // @ts-ignore
                return card.actions.every((action: Action) => !actionTypes.includes(action.type));
            }

            // @ts-ignore
            return card.actions.some((action: Action) => actionTypes.includes(action.type));
        }

        if (hasMinion !== undefined) {
            if ((hasMinion && card.minion) || (!hasMinion && !card.minion)) {
                return comparator !== "not";
            }
        }

        return true;
    });
};

export default getCardSelection;

import { Ability, SELECT_CARD_TYPES, SelectCards } from "./../ability/types";
import uuid from "uuid";
import { HandAbility } from "../ability/types";
import { Action } from "@reduxjs/toolkit";
import { JOB_CARD_MAP } from "../ability";
import { shuffle } from "../utils";

const getCardSelection = ({
    hand,
    selectCards,
    selectedAbilityId,
    player,
}: {
    selectCards: SelectCards;
    selectedAbilityId?: string;
    hand: HandAbility[];
    player: any;
}) => {
    const { effects = {}, type, filters } = selectCards || {};
    const { removeAfterTurn, ...other } = effects;

    const createNewOption = (ability: Ability | HandAbility): HandAbility => {
        return {
            ...ability,
            instanceId: uuid.v4(),
            removeAfterTurn,
            effects: other,
        };
    };

    const applyFilters = (cards: HandAbility[]) => {
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
        return shuffled.slice(0, 3).map(createNewOption);
    }

    if (type === SELECT_CARD_TYPES.PRESET_CARDS) {
        return selectCards?.cards?.map((card) => ({ ...card, instanceId: uuid.v4() })) || [];
    }

    if (type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK) {
        return applyFilters(hand);
    }
    return [];
};

export default getCardSelection;

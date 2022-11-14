import { Ability, ACTION_TYPES, Effect, TARGET_TYPES } from "./../types";
import { GREEN, GREY, BLUE, RED } from "./constants";

export const getAllEffects = (ability: Ability): Effect[] => {
    return ability.actions
        ?.reduce((acc, { effects = [] }) => {
            acc.push(...effects);
            return acc;
        }, [])
        .concat(ability.minion?.effects || []);
};

export const getAbilityColor = (ability: Ability): string | undefined => {
    const { actions = [], minion } = ability || {};
    const { target: targetType, type } = actions[0] || {};

    if (minion) {
        return GREEN;
    }

    if (type === ACTION_TYPES.HINDER) {
        return GREY;
    }

    if (targetType === TARGET_TYPES.HOSTILE || targetType === TARGET_TYPES.RANDOM_HOSTILE) {
        return RED;
    }

    if (targetType === TARGET_TYPES.FRIENDLY || targetType === TARGET_TYPES.SELF) {
        return BLUE;
    }
};

import { Action, ACTION_TYPES } from "./types";

export const getActionType = (action: Action): ACTION_TYPES => {
    if (!action) {
        return;
    }

    const { damage, healing, resources, armor, movement, effects } = action;
    if (damage) {
        return ACTION_TYPES.DAMAGE;
    } else if (healing || resources || effects?.length > 0) {
        return ACTION_TYPES.CASTING;
    } else if (armor) {
        return ACTION_TYPES.ARMOR;
    } else if (movement) {
        return ACTION_TYPES.MOVEMENT;
    }

    return ACTION_TYPES.NONE;
};

export const isAttack = (action: Action): boolean => {
    return getActionType(action) === ACTION_TYPES.DAMAGE;
};
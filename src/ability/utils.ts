import { Ability, Action, ACTION_TYPES, TARGET_TYPES } from "./types";

export const getActionType = (action: Action): ACTION_TYPES => {
    if (!action) {
        return;
    }

    const { damage, healing, resources, armor, movement, effects } = action;
    if (damage) {
        return ACTION_TYPES.DAMAGE;
    } else if (healing || resources || effects?.length > 0 || armor) {
        return ACTION_TYPES.EFFECT;
    } else if (armor) { // TODO
        return ACTION_TYPES.ARMOR;
    } else if (movement) {
        return ACTION_TYPES.MOVEMENT;
    }

    return ACTION_TYPES.NONE;
};

export const isAttack = (action: Action): boolean => {
    return getActionType(action) === ACTION_TYPES.DAMAGE;
};

const RED = "rgb(221, 46, 68)";
const BLUE = "rgb(23, 111, 189)";
const GREEN = "rgb(50, 168, 82)";

export const getAbilityColor = (ability: Ability): string | undefined => {
    const {actions = [], minion} = ability || {};
    const { target: targetType } = actions[0] || {};

    if (minion) {
        return GREEN;
    }

    if (targetType === TARGET_TYPES.HOSTILE) {
        return RED;
    }

    if (targetType === TARGET_TYPES.FRIENDLY || targetType === TARGET_TYPES.SELF) {
        return BLUE;
    }
};
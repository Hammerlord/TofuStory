import { Ability, TARGET_TYPES } from "./types";

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
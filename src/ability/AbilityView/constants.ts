import { PLAYER_CLASSES } from "../../Menu/types";
import { MULTIPLIER_TYPES } from "../types";

const { ATTACKS_MADE_IN_TURN, ARMOR, ABILITIES_WITH_NAME, MAX_HP, DEBUFFS, NUM_AFFECTED_TARGETS, NUM_SOURCE_TARGETS } = MULTIPLIER_TYPES;

export const multiplierTypeKeyLabelMap = {
    [ATTACKS_MADE_IN_TURN]: "times the number of attacks made this turn by {{ calculationTarget }}",
    [ARMOR]: "times current armor on {{ calculationTarget }}",
    [ABILITIES_WITH_NAME]: 'times the number of "{{ value }}" abilities',
    [MAX_HP]: "for {{ value }} of max health",
    [DEBUFFS]: "for each debuff on {{ calculationTarget }}",
    [NUM_AFFECTED_TARGETS]: "for each affected target",
    [NUM_SOURCE_TARGETS]: "for each affected target",
};

/**
 * Colour coding ability cards, eg. red is offensive, blue is support, green is minion, grey are negative/useless cards that act like a debuff
 */
export const RED = "rgb(221, 46, 68)";
export const BLUE = "rgb(23, 111, 189)";
export const GREEN = "rgb(50, 168, 82)";
export const GREY = "rgb(100, 100, 100)";

export const resourceClassNameMap = {
    [PLAYER_CLASSES.WARRIOR]: "Fury",
    [PLAYER_CLASSES.MAGICIAN]: "Mana",
    [PLAYER_CLASSES.BOWMAN]: "Stamina",
};

export const DEFAULT_CARD_MAX_LEVEL = 2;
export const STARTER_CARD_MAX_LEVEL = 3;

export const CRITICAL_KEYWORD = "Critical";

export const CARD_WIDTH = 170;

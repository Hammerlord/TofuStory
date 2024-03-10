import { PLAYER_CLASSES } from "../../Menu/types";
import { MULTIPLIER_TYPES } from "../types";

/**
 * Map EFFECT_EVENT_KEYS to more friendly strings.
 * @see EFFECT_EVENT_KEYS
 */
export const effectEventKeyLabelMap = {
    onAbility: "When you use an ability",
    onAttack: "When you attack",
    onDeath: "On death",
    onFriendlyDeath: "When an ally dies",
    onHostileDeath: "When an enemy dies",
    onReceiveAttack: "When attacked",
    onReceiveDamage: "When damaged",
    onReceiveHealing: "When healed",
    onReceiveArmor: "When you gain armor",
    onReceiveEffect: "When you receive an effect",
    onApplyEffect: "When you apply an effect",
    onRemoved: "When this effect is removed",
    onResourcesSpent: "After spending resources",
    onTurnStart: "When your turn starts",
    onTurnEnd: "When your turn ends",
    onEnd: "When this effect ends",
    onWaveStart: "On wave start",
    onWaveClear: "On wave clear",
    onDrawCard: "When you draw cards",
};

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
};

export const DEFAULT_CARD_MAX_LEVEL = 2;
export const STARTER_CARD_MAX_LEVEL = 3;

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
    onEffectRemoved: "When this effect is removed", // TODO probably not an actual event
    onResourcesSpent: "After spending resources",
    onTurnStart: "When your turn starts",
    onTurnEnd: "When your turn ends",
    onEnd: "When this effect ends",
    onWaveStart: "On wave start",
    onWaveClear: "On wave clear",
};

const { ATTACKS_MADE_IN_TURN, ARMOR, ABILITIES_WITH_NAME, MAX_HP, DEBUFFS, BLEEDS, NUM_AFFECTED_TARGETS, NUM_SOURCE_TARGETS } =
    MULTIPLIER_TYPES;

export const multiplierTypeKeyLabelMap = {
    [ATTACKS_MADE_IN_TURN]: "times the number of attacks made this turn by {{ calculationTarget }}",
    [ARMOR]: "times current armor on {{ calculationTarget }}",
    [ABILITIES_WITH_NAME]: 'times the number of "{{ value }}" abilities',
    [MAX_HP]: "for {{ value }} of max health",
    [DEBUFFS]: "for each debuff on {{ calculationTarget }}",
    [BLEEDS]: "for each bleed on {{ calculationTarget }}",
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

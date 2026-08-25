import { AlchemistStoneImage } from "../images";
import { Condition, CONDITION_TARGETS, Effect, EFFECT_CLASSES, EFFECT_TYPES, TRIGGER_TARGET_TYPES } from "./../ability/types";

import { lesserBolt } from "../ability/magician/defaultAttacks";
import { TRIGGER_SOURCE_TYPES } from "../battle/types";

// TODO we probably want a named bonus for this
export const abilityHasChargedCondition: Condition = {
    calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
    comparator: "includes",
    property: "description",
    value: "Charged:",
    sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
};

export const chargedEffect: Effect = {
    name: "Charged",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: AlchemistStoneImage,
    description: "Grants a bonus to certain cards. If unused at the end of your turn, fire a Lesser Bolt.",
    weaponAnimation: "glow",
    onAbility: {
        conditions: [abilityHasChargedCondition],
        removeEffect: true,
    },
    onTurnEnd: {
        ability: {
            ...lesserBolt,
        },
        removeEffect: true,
    },
};

export const chargingStoneEffect: Effect = {
    name: "Charging Stone",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    onAbility: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        disableTriggerFromProcs: true,
        conditions: [
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                comparator: "not",
                hasEffect: "Charged",
            },
        ],
        effects: [chargedEffect],
    },
};

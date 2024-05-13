import { JOB_CARD_MAP } from "../ability";
import { AlchemistStoneImage, HumilityStoneImage } from "../images";
import { PLAYER_CLASSES } from "../Menu/types";
import { lesserBolt, pong } from "./../ability/magician/magicianAbilities";
import { CONDITION_TARGETS, Effect, EFFECT_CLASSES, EFFECT_TYPES, TRIGGER_TARGET_TYPES } from "./../ability/types";
import { getUpgradeCard } from "./../Menu/utils";

import { furiousStrikeCard } from "../ability/warrior/warriorAbilities";
import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import { Item, ITEM_TYPES, RARITIES } from "./types";

export const rageStone: Item = {
    name: "Rage Stone",
    description: "Every {{ effects.0.onResourcesSpent.triggerFrequencyFromSum }} Fury you spend, add Furious Strike to your hand.",
    flavourText: "A mysterious keepsake you found on your person.",
    image: HumilityStoneImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.STARTER,
    effects: [
        {
            name: "Rage Stone Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onResourcesSpent: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                triggerFrequencyFromSum: 5,
                addCards: [furiousStrikeCard],
            },
        },
    ],
};

export const rampageStone: Item = {
    name: "Rampage Stone",
    description: "Every {{ effects.0.onResourcesSpent.triggerFrequencyFromSum }} Fury you spend, add Furious Strike to your hand.",
    image: HumilityStoneImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Rage Stone Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onResourcesSpent: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                triggerFrequencyFromSum: 4,
                addCards: [furiousStrikeCard],
            },
        },
    ],
};

// Bit of grease to check charged abilities to avoid doing it manually anymore
const chargedAbilityNames = JOB_CARD_MAP.Magician.all
    .filter((ability) => {
        if (ability.name === pong.name) {
            // Pong itself is not a charged ability (the abilities it adds to the hand are).
            return false;
        }
        if (JSON.stringify(ability.actions).includes('"hasEffect":"Charged"')) {
            return true;
        }
    })
    .map(({ name }) => name);

const chargingStoneEffect: Effect = {
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
        effects: [
            {
                name: "Charged",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                icon: AlchemistStoneImage,
                description: "Grants a bonus to certain cards. If unused at the end of your turn, fire a Lesser Bolt.",
                weaponAnimation: "glow",
                onAbility: {
                    conditions: [
                        {
                            calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            comparator: "eq",
                            name: chargedAbilityNames,
                            sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        },
                    ],
                    removeEffect: true,
                },
                onTurnEnd: {
                    ability: {
                        ...lesserBolt,
                    },
                    removeEffect: true,
                },
            },
        ],
    },
};

export const chargingStone: Item = {
    name: "Charging Stone",
    description: "Playing a card grants Charged. If unused by end of turn, fire a Lesser Bolt.",
    flavourText: "A mysterious keepsake you found on your person.",
    image: AlchemistStoneImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.STARTER,
    effects: [chargingStoneEffect],
};

export const greaterChargingStone: Item = {
    ...chargingStone,
    name: "Greater Charging Stone",
    description: "Playing a card grants Charged. On turn end, fire an Upgraded Bolt.",
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            ...chargingStoneEffect,
            name: "Greater Charging Stone",
            onAbility: {
                ...chargingStoneEffect.onAbility,
                effects: [
                    {
                        name: "Charged",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: AlchemistStoneImage,
                        description: "Grants a bonus to certain cards.",
                        weaponAnimation: "glow",
                        onAbility: {
                            conditions: [
                                {
                                    calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                    comparator: "eq",
                                    name: chargedAbilityNames,
                                    sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                                },
                            ],
                            removeEffect: true,
                        },
                    },
                ],
            },
            onTurnEnd: {
                ability: {
                    ...getUpgradeCard(lesserBolt),
                    instanceId: undefined, // This is a proc and so should not have an instanceId. Otherwise, Astral Rewind is copying it
                },
            },
        },
    ],
};

export const STARTER_ITEM_UPGRADE_MAP = {
    [PLAYER_CLASSES.WARRIOR]: rampageStone,
    [PLAYER_CLASSES.MAGICIAN]: greaterChargingStone,
};

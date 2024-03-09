import { PLAYER_CLASSES } from "../Menu/types";
import { JOB_CARD_MAP } from "../ability";
import { enrageEffect } from "../ability/Effects";
import { AlchemistStoneImage, HumilityStoneImage } from "../images";
import { energyBolt, greaterBolt } from "./../ability/magician/magicianAbilities";
import { CONDITION_TARGETS, Effect, EFFECT_CLASSES, EFFECT_TYPES, TRIGGER_TARGET_TYPES } from "./../ability/types";

import { Item, ITEM_TYPES, RARITIES } from "./types";

export const rageStone: Item = {
    name: "Rage Stone",
    description: "Every 2 Fury you spend, gain 1 next turn.",
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
                triggerFrequencyFromSum: 2,
                effects: [enrageEffect],
            },
        },
    ],
};

export const rampageStone: Item = {
    name: "Rampage Stone",
    description: "Every 2 Fury you spend, gain 1 next turn. +1 card draw while active.",
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
                triggerFrequencyFromSum: 2,
                effects: [
                    enrageEffect,
                    {
                        name: "Enrage - Card Draw",
                        type: EFFECT_TYPES.RAGE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: HumilityStoneImage,
                        drawCardsPerTurn: 1,
                        maxApplications: 1,
                        disableDisplayIcon: true,
                        onTurnInProgress: {
                            removeEffect: true,
                        },
                        conditions: [
                            {
                                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                hasEffect: "Enrage",
                            },
                        ],
                    },
                ],
            },
        },
    ],
};

// Bit of grease to check charged abilities to avoid doing it manually anymore
const chargedAbilityNames = JOB_CARD_MAP.Magician.all
    .filter((ability) => {
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
                description: "Charged. If unused at the end of your turn, fire an Energy Bolt.",
                duration: 0,
                weaponAnimation: "glow",
                onAbility: {
                    conditions: [
                        {
                            calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            comparator: "eq",
                            name: chargedAbilityNames,
                        },
                    ],
                    removeEffect: true,
                },
                onTurnEnd: {
                    ability: {
                        ...energyBolt,
                    },
                },
            },
        ],
    },
};

export const chargingStone: Item = {
    name: "Charging Stone",
    description: "Playing a card grants Charged. If unused by end of turn, fire an Energy Bolt.",
    flavourText: "A mysterious keepsake you found on your person.",
    image: AlchemistStoneImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.STARTER,
    effects: [chargingStoneEffect],
};

export const greaterChargingStone: Item = {
    ...chargingStone,
    name: "Greater Charging Stone",
    description: "Playing a card grants Charged. If unused by end of turn, fire a Greater Bolt.",
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
                        description: "Charged. If unused at the end of your turn, fire a Greater Bolt.",
                        duration: 0,
                        weaponAnimation: "glow",
                        onAbility: {
                            conditions: [
                                {
                                    calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                    comparator: "eq",
                                    name: chargedAbilityNames,
                                },
                            ],
                            removeEffect: true,
                        },
                        onTurnEnd: {
                            ability: greaterBolt,
                        },
                    },
                ],
            },
        },
    ],
};

export const STARTER_ITEM_UPGRADE_MAP = {
    [PLAYER_CLASSES.WARRIOR]: rampageStone,
    [PLAYER_CLASSES.MAGICIAN]: greaterChargingStone,
};

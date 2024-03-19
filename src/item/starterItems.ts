import { getUpgradeCard } from "./../Menu/utils";
import { PLAYER_CLASSES } from "../Menu/types";
import { JOB_CARD_MAP } from "../ability";
import { infuriateEffect } from "../ability/Effects";
import { AlchemistStoneImage, HumilityStoneImage } from "../images";
import { lesserBolt, pong } from "./../ability/magician/magicianAbilities";
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
                effects: [infuriateEffect],
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
                    infuriateEffect,
                    {
                        name: "Rage Stone - Card Draw",
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
                                hasEffect: infuriateEffect.name,
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
                description: "Charged. If unused at the end of your turn, fire a Lesser Bolt.",
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
    description: "Playing a card grants Greater Charged. On turn end, fire an Upgraded Bolt.",
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            ...chargingStoneEffect,
            name: "Greater Charging Stone",
            onAbility: {
                ...chargingStoneEffect.onAbility,
                effects: [
                    {
                        name: "Greater Charged",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: AlchemistStoneImage,
                        description: "No longer consumed by Charged abilities. Firing an Upgraded Bolt on turn end.",
                        weaponAnimation: "glow",
                        onTurnEnd: {
                            ability: {
                                ...getUpgradeCard(lesserBolt),
                            },
                            removeEffect: true,
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

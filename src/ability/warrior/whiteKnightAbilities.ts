import {
    advancedcharge,
    blastImage,
    blizzardcharge,
    divinechargeImage,
    flamecharge,
    lightningcharge,
    shieldmasteryImage,
} from "../../images";
import { burn, chill, stun } from "../Effects";
import { Ability, ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES } from "../types";

export const flameCharge: Ability = {
    name: "Flame Charge",
    resourceCost: 1,
    image: flamecharge,
    actions: [
        {
            damage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    ...burn,
                    duration: 3,
                },
            ],
        },
    ],
};

export const blizzardCharge: Ability = {
    name: "Blizzard Charge",
    resourceCost: 1,
    image: blizzardcharge,
    actions: [
        {
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            bonus: {
                damage: 3,
                conditions: [
                    {
                        calculationTarget: "target",
                        hasEffectType: [EFFECT_TYPES.BURN],
                    },
                ],
            },
            effects: [
                {
                    ...chill,
                    duration: 3,
                },
            ],
        },
    ],
};

export const lightningCharge: Ability = {
    name: "Lightning Charge",
    resourceCost: 2,
    image: lightningcharge,
    actions: [
        {
            area: 1,
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            bonus: {
                damage: 3,
                conditions: [
                    {
                        calculationTarget: "target",
                        hasEffectType: [EFFECT_TYPES.CHILL],
                    },
                ],
            },
            effects: [stun],
        },
    ],
};

export const frostFire: Ability = {
    name: "Frostfire Within",
    resourceCost: 0,
    image: advancedcharge,
    actions: [
        {
            addCards: [flameCharge, blizzardCharge].map((card) => ({ ...card, removeAfterTurn: true })),
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const divineCharge: Ability = {
    name: "Divine Charge",
    resourceCost: 1,
    image: divinechargeImage,
    description: "Hits again if the primary target is stunned",
    actions: [
        {
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
        },
        {
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            conditions: [
                {
                    calculationTarget: "target",
                    hasEffectType: [EFFECT_TYPES.STUN],
                },
            ],
        },
    ],
};

export const shieldMastery: Ability = {
    name: "Shield Mastery",
    resourceCost: 2,
    image: shieldmasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            armor: 5,
            effects: [
                {
                    name: "Shield Mastery",
                    icon: shieldmasteryImage,
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    preventArmorDecay: true,
                    armorReceived: 2,
                    duration: 1,
                },
            ],
        },
    ],
};

export const blast: Ability = {
    name: "Blast",
    resourceCost: 3,
    image: blastImage,
    description: "Reduce cost by 1 for every ability used this turn, until Blast is used or discarded",
    onAbilityUse: {
        resourceCost: -1,
    },
    actions: [
        {
            damage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    ...burn,
                    duration: 3,
                },
                {
                    ...chill,
                    duration: 3,
                },
            ],
        },
    ],
};
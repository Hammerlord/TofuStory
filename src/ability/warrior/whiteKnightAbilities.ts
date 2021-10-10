import { MULTIPLIER_TYPES } from "./../types";
import {
    advancedcharge,
    blastImage,
    blizzardcharge,
    divinechargeImage,
    flamecharge,
    highPaladinImage,
    lightningcharge,
    parashockGuardImage,
    shieldmasteryImage,
} from "../../images";
import { burn, chill, stun } from "../Effects";
import { Ability, ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES } from "../types";
import { block } from "./warriorAbilities";

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
    description: "Reduce cost by 1 for every ability used this turn, until Lightning Charge is used or discarded",
    onAbilityUse: {
        resourceCost: -1,
    },
    actions: [
        {
            area: 1,
            damage: 2,
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
    description: "+ Damage equal to the number of debuffs on the target",
    actions: [
        {
            damage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            bonus: {
                damage: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.DEBUFFS,
                    calculationTarget: "target",
                },
                conditions: [
                    {
                        calculationTarget: "target",
                        hasEffectClass: EFFECT_CLASSES.DEBUFF,
                    },
                ],
            },
        },
    ],
};

export const shieldMastery: Ability = {
    name: "Shield Mastery",
    resourceCost: 1,
    image: shieldmasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            armor: 2,
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
            addCards: [block, block].map((card) => ({ ...card, removeAfterTurn: true })),
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

export const judgment: Ability = {
    name: "Judgment",
    resourceCost: 3,
    image: highPaladinImage,
    description:
        "Deals 1 damage multiplied by armor \n Reduce cost by 1 for every ability used this turn, until Judgment is used or discarded",
    onAbilityUse: {
        resourceCost: -1,
    },
    actions: [
        {
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: {
                type: MULTIPLIER_TYPES.ARMOR,
                calculationTarget: "actor",
            },
        },
    ],
};

export const parashockGuard: Ability = {
    name: "Parashock Guard",
    resourceCost: 2,
    image: parashockGuardImage,
    depletedOnUse: true,
    description: "(Armor gained equal to your current armor)",
    actions: [
        {
            armor: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            multiplier: {
                type: MULTIPLIER_TYPES.ARMOR,
                calculationTarget: "actor",
            },
        },
    ],
};

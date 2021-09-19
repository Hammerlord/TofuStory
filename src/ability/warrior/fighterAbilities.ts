import { brandishImage, chanceattack, combofuryImage, endureImage, punctureImage, risingrage } from "../../images";
import { wound } from "../Effects";
import { Ability, AbilityCondition, ACTION_TYPES, EFFECT_CLASSES, MULTIPLIER_TYPES, TARGET_TYPES } from "../types";

export const rampage: Ability = {
    name: "Rampage",
    resourceCost: 3,
    image: risingrage,
    area: 1,
    description: "Deal {{damage}} damage x 3 to random enemies in the area",
    actions: [
        {
            damage: 4,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
        {
            damage: 4,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
        {
            damage: 4,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
};

export const puncture: Ability = {
    name: "Puncture",
    resourceCost: 1,
    image: punctureImage,
    actions: [
        {
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    ...wound,
                    duration: 3,
                },
            ],
            area: 1,
        },
    ],
};

export const chanceStrike: Ability = {
    name: "Chance Strike",
    resourceCost: 1,
    image: chanceattack,
    actions: [
        {
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            bonus: {
                damage: 4,
                conditions: [
                    {
                        calculationTarget: "target",
                        hasEffectClass: EFFECT_CLASSES.DEBUFF,
                    } as AbilityCondition,
                ],
            },
        },
    ],
};

export const brandish: Ability = {
    name: "Brandish",
    resourceCost: 1,
    image: brandishImage,
    description: "Hits twice",
    actions: [
        {
            damage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            damage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
    ],
};

export const comboFury: Ability = {
    name: "Combo Fury",
    resourceCost: 1,
    image: combofuryImage,
    description: "Deals 1 damage for every attack you made this turn, hitting twice",
    actions: [
        {
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
        },
        {
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
        },
    ],
};

export const parry: Ability = {
    name: "Parry",
    resourceCost: 1,
    image: endureImage,
    description: "(+1 armor for every attack made this turn)",
    actions: [
        {
            armor: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            multiplier: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
        },
    ],
};

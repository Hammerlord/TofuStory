import {
    brandishImage,
    chanceattack,
    combofuryImage,
    endureImage,
    intrepidSlashImage,
    punctureImage,
    ragingblowImage,
    risingrageImage,
    worldreaverImage,
} from "../../images";
import { immunity, wound } from "../Effects";
import { Ability, AbilityCondition, Action, ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, MULTIPLIER_TYPES, TARGET_TYPES } from "../types";

export const intrepidSlash: Ability = {
    name: "Intrepid Slash",
    resourceCost: 2,
    image: intrepidSlashImage,
    area: 1,
    description: "Deal {{damage}} damage to a random enemy in the area, x3",
    actions: [
        {
            damage: 3,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
        {
            damage: 3,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
        {
            damage: 3,
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
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: "actor",
            },
        },
        {
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: "actor",
            },
        },
    ],
};

export const parry: Ability = {
    name: "Parry",
    resourceCost: 0,
    image: endureImage,
    description: "(Armor multiplied by the number of attacks made this turn)",
    actions: [
        {
            armor: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: "actor",
            },
        },
    ],
};

const rageEffect = {
    name: "Rage",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: ragingblowImage,
    skillBonus: [
        {
            skill: "Rising Rage",
            damage: 1,
        },
        { skill: "Raging Blow", damage: 1 },
    ],
};

const ragingBlowAction: Action = {
    damage: 1,
    type: ACTION_TYPES.ATTACK,
    target: TARGET_TYPES.HOSTILE,
};

export const ragingBlow: Ability = {
    name: "Raging Blow",
    resourceCost: 1,
    image: ragingblowImage,
    description: "Hits twice",
    actions: [
        ragingBlowAction,
        ragingBlowAction,
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    ...rageEffect,
                },
            ],
        },
    ],
};

ragingBlow.actions.push({
    type: ACTION_TYPES.EFFECT,
    target: TARGET_TYPES.SELF,
    addCardsToDiscard: [
        {
            ...ragingBlow,
        },
    ],
});

export const worldReaver: Ability = {
    name: "World Reaver",
    resourceCost: 1,
    depletedOnUse: true,
    image: worldreaverImage,
    description: "Deals 3 damage for every attack you made this turn",
    actions: [
        {
            area: 1,
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: "actor",
            },
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    ...immunity,
                },
            ],
        },
    ],
};

export const risingRage: Ability = {
    name: "Rising Rage",
    resourceCost: 0,
    image: risingrageImage,
    actions: [
        {
            area: 1,
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    ...rageEffect,
                },
            ],
        },
    ],
};

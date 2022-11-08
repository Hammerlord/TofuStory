import {
    BrandishImage,
    BurningSoulBladeImage,
    BurningSoulBladeMinionImage,
    ChanceAttackImage,
    ComboFuryImage,
    EndureImage,
    IntrepidSlashImage,
    PunctureImage,
    RagingBlowImage,
    RisingRageImage,
    WorldReaverImage,
} from "../../images";
import { immunity, wound } from "../Effects";
import { Ability, Action, ACTION_TYPES, CONDITION_TARGETS, EFFECT_CLASSES, EFFECT_TYPES, MULTIPLIER_TYPES, TARGET_TYPES } from "../types";
import { TRIGGER_TARGET_TYPES } from "./../types";

export const intrepidSlash: Ability = {
    name: "Intrepid Slash",
    resourceCost: 1,
    depletedOnUse: true,
    image: IntrepidSlashImage,
    description: "Deal {{damage}} damage to a random enemy in the area, x3",
    actions: [
        {
            damage: 4,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
            targetArea: 1,
        },
        {
            damage: 4,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
            targetArea: 1,
        },
        {
            damage: 4,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
            targetArea: 1,
        },
    ],
};

export const puncture: Ability = {
    name: "Puncture",
    resourceCost: 1,
    image: PunctureImage,
    actions: [
        {
            damage: 4,
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

export const chanceAttack: Ability = {
    name: "Chance Attack",
    resourceCost: 1,
    image: ChanceAttackImage,
    depletedOnUse: true,
    description: "against debuffed enemies",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Chance Attack",
                    icon: ChanceAttackImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 1,
                    conditions: [
                        {
                            calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                            hasEffectClass: EFFECT_CLASSES.DEBUFF,
                        },
                    ],
                },
            ],
        },
    ],
};

export const brandish: Ability = {
    name: "Brandish",
    resourceCost: 1,
    image: BrandishImage,
    description: "Hits twice",
    actions: [
        {
            damage: 4,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            damage: 4,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
    ],
};

export const comboFury: Ability = {
    name: "Combo Fury",
    resourceCost: 0,
    image: ComboFuryImage,
    description: "Deals 1 damage for every attack you made this turn, hitting twice",
    actions: [
        {
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
        {
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
};

export const parry: Ability = {
    name: "Parry",
    resourceCost: 0,
    image: EndureImage,
    description: "(Armor multiplied by the number of attacks made this turn)",
    actions: [
        {
            armor: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
};

const rageEffect = {
    name: "Rage",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: RagingBlowImage,
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
    resourceCost: 0,
    image: RagingBlowImage,
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
    image: WorldReaverImage,
    description: "Deals 3 damage for every attack you made this turn",
    actions: [
        {
            area: 1,
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: CONDITION_TARGETS.ACTOR,
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
    resourceCost: "x",
    image: RisingRageImage,
    description: "Expend the rest of your Fury to deal {{ damage }} damage for each Fury spent.",
    actions: [
        {
            area: 1,
            damage: 5,
            multiplier: {
                calculationTarget: CONDITION_TARGETS.ACTOR,
                type: MULTIPLIER_TYPES.RESOURCES_SPENT,
            },
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
    ],
};

export const burningSoulBlade: Ability = {
    name: "Burning Soul Blade",
    resourceCost: 1,
    image: BurningSoulBladeImage,
    actions: [],
    minion: {
        name: "Burning Soul Blade",
        image: BurningSoulBladeMinionImage,
        maxHP: 1,
        damage: 2,
        effects: [
            {
                name: "Burning Soul Blade",
                icon: BurningSoulBladeMinionImage,
                type: EFFECT_TYPES.IMMUNITY,
                class: EFFECT_CLASSES.BUFF,
                attackAreaIncrease: 1,
                onAttack: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    effects: [
                        {
                            name: "Burning Soul Blade",
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.BUFF,
                            attackPower: 1,
                        },
                    ],
                },
            },
        ],
    },
};

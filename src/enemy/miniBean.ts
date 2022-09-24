/**
 * @file Objects related to the Mini Bean fight
 */
import {
    bananaGrahamPieImage,
    cakeSliceImage,
    forkedTurkeyImage,
    greenCheeseImage,
    miniBeanImage,
    toyHammerImage,
    turkeyImage,
    unagiImage,
    yuckImage,
} from "../images";
import { hardy } from "./../ability/Effects";
import {
    Ability,
    ACTION_TYPES,
    ANIMATION_TYPES,
    Effect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";

const yum: Effect = {
    name: "Yum!",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: turkeyImage,
    damage: 1,
    duration: 5,
};

const yuck: Effect = {
    name: "Yuck!",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.DEBUFF,
    icon: yuckImage,
    damage: -1,
    damageReceived: 1,
    duration: 3,
};

export const cake: Minion = {
    name: "Cake",
    image: cakeSliceImage,
    maxHP: 30,
    damage: 0,
    effects: [
        {
            name: "Delicious",
            icon: turkeyImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeath: {
                targetType: TRIGGER_TARGET_TYPES.ACTOR,
                healing: 2,
                effects: [yum],
            },
        },
    ],
};

export const unagi: Minion = {
    name: "Unagi",
    image: unagiImage,
    maxHP: 50,
    damage: 0,
    effects: [
        {
            name: "Delicious",
            icon: turkeyImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeath: {
                targetType: TRIGGER_TARGET_TYPES.ACTOR,
                healing: 3,
                effects: [yum],
            },
        },
    ],
};

export const bananaGrahamPie: Minion = {
    name: "Banana Graham Pie",
    image: bananaGrahamPieImage,
    maxHP: 50,
    damage: 0,
    effects: [
        {
            name: "Delicious",
            icon: turkeyImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeath: {
                targetType: TRIGGER_TARGET_TYPES.ACTOR,
                healing: 3,
                effects: [yum],
            },
        },
    ],
};

export const moldyCheese: Minion = {
    name: "Moldy Cheese",
    image: greenCheeseImage,
    maxHP: 10,
    damage: 0,
    effects: [
        {
            name: "Disgusting",
            icon: yuckImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeath: {
                targetType: TRIGGER_TARGET_TYPES.ACTOR,
                effects: [yuck],
                damage: 3,
            },
        },
    ],
};

const suckIn: Ability = {
    name: "Suck In",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            excludePrimaryTarget: true,
            damage: 100,
            area: 1,
        },
        {
            area: 5,
            vacuum: 2,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            // TRICKY/TODO: We are assuming that summon comes AFTER the vacuum in resolved order of operations by the client, but
            // that may not be the case and we may need a no-animation action to handle this instead
            summon: [
                {
                    minion: [cake, unagi, bananaGrahamPie, moldyCheese],
                    positionIndex: 0,
                },
                {
                    minion: [cake, unagi, bananaGrahamPie, moldyCheese],
                    positionIndex: 4,
                },
            ],
        },
    ],
};

export const miniBean: Minion = {
    name: "Mini Bean, Pantry Raider",
    image: miniBeanImage,
    maxHP: 300,
    resources: 0,
    damage: 3,
    abilities: [
        suckIn,
        {
            name: "Pico Drop",
            resourceCost: 1,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: toyHammerImage,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    area: 1,
                },
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: toyHammerImage,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    area: 1,
                },
            ],
        },
        {
            name: "Big Suck",
            resourceCost: 3,
            channelDuration: 3,
            castTime: 1,
            actions: [...suckIn.actions, ...suckIn.actions],
        },
    ],
    effects: [hardy],
};

export const eat: Ability = {
    name: "Eat!",
    description: "Chow down on a food item",
    image: forkedTurkeyImage,
    resourceCost: 0,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 100,
            conditions: [cake.name, unagi.name, bananaGrahamPie.name, moldyCheese.name].map((name) => ({
                calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                characterName: name,
            })),
        },
    ],
};

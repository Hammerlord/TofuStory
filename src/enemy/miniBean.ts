/**
 * @file Objects related to the Mini Bean fight
 */
import {
    bananaGrahamPieImage,
    cakeSliceImage,
    forkedTurkeyImage,
    greenCheeseImage,
    grilledCheeseImage,
    hotdogSupremeImage,
    miniBeanImage,
    tofuImage,
    toyHammerImage,
    turkeyImage,
    unagiImage,
    yuckImage,
    zingyKebabImage,
} from "../images";
import { hardy } from "./../ability/Effects";
import {
    Ability,
    ACTION_TYPES,
    ANIMATION_TYPES,
    CONDITION_TARGETS,
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
    attackPower: 1,
    duration: 5,
};

const yuck: Effect = {
    name: "Yuck!",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.DEBUFF,
    icon: yuckImage,
    attackPower: -1,
    attackDamageReceived: 1,
    duration: 3,
};

const delicious: Effect = {
    name: "Delicious",
    icon: turkeyImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    onDeath: {
        targetType: TRIGGER_TARGET_TYPES.ACTOR,
        healing: 2,
        effects: [yum],
    },
};

const disgusting: Effect = {
    name: "Disgusting",
    icon: yuckImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    onDeath: {
        targetType: TRIGGER_TARGET_TYPES.ACTOR,
        effects: [yuck],
        damage: 3,
    },
};

export const cake: Minion = {
    name: "Cake",
    image: cakeSliceImage,
    maxHP: 20,
    effects: [delicious],
};

export const unagi: Minion = {
    name: "Unagi",
    image: unagiImage,
    maxHP: 25,
    effects: [delicious],
};

export const bananaGrahamPie: Minion = {
    name: "Banana Graham Pie",
    image: bananaGrahamPieImage,
    maxHP: 50,
    effects: [delicious, delicious],
};

export const hotdogSupremeMinion: Minion = {
    name: "Hotdog Supreme",
    image: hotdogSupremeImage,
    maxHP: 50,
    effects: [delicious, delicious],
};

export const tofuPlatter: Minion = {
    name: "Tofu",
    image: tofuImage,
    maxHP: 20,
    effects: [delicious],
};

export const grilledCheese: Minion = {
    name: "Grilled Cheese",
    image: grilledCheeseImage,
    maxHP: 25,
    effects: [delicious],
};

export const nastyKebab: Minion = {
    name: "Nasty Kebab",
    image: zingyKebabImage,
    maxHP: 12,
    effects: [disgusting],
};

export const moldyCheese: Minion = {
    name: "Moldy Cheese",
    image: greenCheeseImage,
    maxHP: 10,
    damage: 0,
    effects: [disgusting],
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
                    minion: [cake, unagi, bananaGrahamPie, moldyCheese, hotdogSupremeMinion, tofuPlatter, grilledCheese, nastyKebab],
                    positionIndex: 0,
                },
                {
                    minion: [cake, unagi, bananaGrahamPie, moldyCheese, hotdogSupremeMinion, tofuPlatter, grilledCheese, nastyKebab],
                    positionIndex: 4,
                },
            ],
        },
    ],
};

const throwFood: Ability = {
    name: "Throw Food",
    image: bananaGrahamPieImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            excludePrimaryTarget: true,
            area: 5,
            effects: [
                {
                    name: "Foodborne Projectile",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 2,
                    duration: 0,
                    onAttack: {
                        removeEffect: true,
                        damage: 5,
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    },
                },
            ],
            induceCombatantAttack: true,
        },
    ],
};

const picoDrop: Ability = {
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
};

export const miniBean: Minion = {
    name: "Mini Bean, Pantry Raider",
    image: miniBeanImage,
    maxHP: 300,
    resources: 0,
    damage: 3,
    abilities: [
        suckIn,
        picoDrop,
        throwFood,
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
            conditions: [cake, unagi, bananaGrahamPie, hotdogSupremeMinion, tofuPlatter, grilledCheese, moldyCheese, nastyKebab].map(
                ({ name }) => ({
                    calculationTarget: CONDITION_TARGETS.TARGET,
                    characterName: name,
                })
            ),
        },
    ],
};

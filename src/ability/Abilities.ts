import { spikedArmorEffect } from "./Effects";
import {
    axe,
    block as blockImage,
    brick,
    flag,
    mace,
    rage,
    rend as rendImage,
    risingrage,
    shieldred,
    shout,
    spikes,
    snail as snailPortrait,
    warleap,
    Wolf,
    warmush,
    bricks,
    hammer,
    chanceattack,
    puncture,
    ironwill as ironwillImage,
} from "../images";
import { Ability, ACTION_TYPES, CONDITION_TYPE, EFFECT_TYPES, TARGET_TYPES } from "./types";

export const bash: Ability = {
    name: "Bash",
    resourceCost: 0,
    image: brick,
    actions: [
        {
            damage: 1,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
};

export const charge: Ability = {
    name: "Charge",
    resourceCost: 1,
    image: warleap,
    actions: [
        {
            damage: 1,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            effects: [
                {
                    name: "Stun",
                    type: EFFECT_TYPES.STUN,
                    duration: 1,
                },
            ],
        },
    ],
};

export const cleave: Ability = {
    name: "Cleave",
    resourceCost: 1,
    image: axe,
    actions: [
        {
            damage: 2,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            area: 1,
        },
    ],
};

export const slam: Ability = {
    name: "Slam",
    resourceCost: 1,
    image: mace,
    actions: [
        {
            damage: 3,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
};

export const anger: Ability = {
    name: "Anger",
    resourceCost: 0,
    image: rage,
    actions: [
        {
            damage: 2,
            resources: 3,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const shieldStrike: Ability = {
    name: "Shield Strike",
    resourceCost: 2,
    image: shieldred,
    actions: [
        {
            damage: 2,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
        {
            armor: 3,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

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

export const block: Ability = {
    name: "Block",
    resourceCost: 1,
    image: blockImage,
    actions: [
        {
            armor: 2,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const rend: Ability = {
    name: "Rend",
    resourceCost: 2,
    image: rendImage,
    actions: [
        {
            damage: 2,
            area: 1,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            effects: [
                {
                    name: "Bleed",
                    type: EFFECT_TYPES.BLEED,
                    duration: 3,
                },
            ],
        },
    ],
};

export const bloodthirst: Ability = {
    name: "Bloodthirst",
    resourceCost: 0,
    image: shout,
    actions: [
        {
            effects: [
                {
                    name: "Bloodthirst",
                    type: EFFECT_TYPES.BUFF,
                    duration: 0,
                    healthPerResourcesSpent: 2,
                    icon: shout,
                },
            ],
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const wolf: Ability = {
    name: "Wolf",
    resourceCost: 2,
    minion: {
        name: "Wolf",
        image: Wolf,
        maxHP: 3,
        damage: 1,
    },
    actions: [],
};

export const spikedArmor: Ability = {
    name: "Spiked Armor",
    resourceCost: 2,
    image: spikes,
    actions: [
        {
            armor: 4,
            target: TARGET_TYPES.FRIENDLY,
            effects: [spikedArmorEffect],
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const warBanner: Ability = {
    name: "War Banner",
    resourceCost: 2,
    minion: {
        name: "War Banner",
        image: flag,
        maxHP: 3,
        damage: 0,
        aura: {
            damage: 1,
            armorPerTurn: 1,
            area: 1,
            type: EFFECT_TYPES.BUFF,
        },
    },
    actions: [],
};

export const snailMinion: Ability = {
    name: "Snail",
    resourceCost: 1,
    minion: {
        name: "Snail",
        image: snailPortrait,
        maxHP: 1,
        damage: 1,
    },
    actions: [],
};

export const yell: Ability = {
    name: "Yell",
    resourceCost: 1,
    image: warmush,
    description: "Decrease enemy attack power by 2 (minimum 1)",
    actions: [
        {
            area: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    damage: -2,
                    duration: 2,
                    type: EFFECT_TYPES.DEBUFF,
                    icon: warmush,
                },
            ],
        },
    ],
};

export const bunchOBricks: Ability = {
    name: "Bunch o' Bricks",
    resourceCost: 1,
    image: bricks,
    actions: [
        {
            addCards: [bash, bash, bash].map((card) => ({ ...card, removeAfterTurn: true })),
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const hammerang: Ability = {
    name: "Hammerang",
    resourceCost: 1,
    reusable: true, // Hmm... beware of any ability that reduces resource cost
    image: hammer,
    actions: [
        {
            damage: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: hammer,
        },
    ],
};

export const overpower: Ability = {
    name: "Overpower",
    resourceCost: 1,
    description: "+3 damage on targets affected by a debuff",
    image: puncture,
    actions: [
        {
            damage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            bonus: {
                conditions: [
                    {
                        calculationTarget: "target",
                        hasEffectType: [EFFECT_TYPES.BLEED, EFFECT_TYPES.STUN, EFFECT_TYPES.DEBUFF],
                    },
                ],
                damage: 3,
            },
        },
    ],
};

export const chanceStrike: Ability = {
    name: "Chance Strike",
    resourceCost: 1,
    image: chanceattack,
    actions: [
        {
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    name: "Bleed",
                    type: EFFECT_TYPES.BLEED,
                    duration: 2,
                },
            ],
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            addCards: [overpower].map((card) => ({ ...card, removeAfterTurn: true })),
        },
    ],
};

export const ironWill: Ability = {
    name: "Iron Will",
    resourceCost: 1,
    image: ironwillImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            armor: 1,
            effects: [
                {
                    type: EFFECT_TYPES.BUFF,
                    armorReceived: 1,
                    duration: 0,
                },
            ],
        },
    ],
};

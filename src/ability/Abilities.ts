import {
    advancedcharge,
    blizzardcharge,
    block as blockImage,
    brick,
    bricks,
    chanceattack,
    evileyeminion,
    evileyeskill,
    flag,
    flamecharge,
    hammer,
    Heart,
    hyperbody,
    ironwill as ironwillImage,
    lightningcharge,
    mace,
    puncture,
    rage,
    rend as rendImage,
    risingrage,
    shieldred,
    shout,
    slashblast,
    snail as snailPortrait,
    spikes,
    warleap,
    warmush,
    Wolf,
} from "../images";
import { burn, stealth, stun, thorns, wound } from "./Effects";
import { Ability, ACTION_TYPES, EFFECT_TYPES, TARGET_TYPES } from "./types";

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
            effects: [stun],
        },
    ],
};

export const cleave: Ability = {
    name: "Cleave",
    resourceCost: 1,
    image: slashblast,
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
                    ...wound,
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
            effects: [{ ...thorns, duration: 3 }],
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
                        hasEffectType: [EFFECT_TYPES.BLEED, EFFECT_TYPES.STUN, EFFECT_TYPES.DEBUFF, EFFECT_TYPES.BURN, EFFECT_TYPES.CHILL],
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
                    ...wound,
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
                    name: "Iron Will",
                    icon: ironwillImage,
                    description: "Receiving +1 armor from armor sources",
                    type: EFFECT_TYPES.BUFF,
                    armorReceived: 1,
                    duration: 0,
                },
            ],
        },
    ],
};

export const hyperBody: Ability = {
    name: "Hyper Body",
    resourceCost: 1,
    image: hyperbody,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            effects: [
                {
                    name: "Hyper Body",
                    icon: hyperbody,
                    description: "Gaining +1 resource per turn",
                    type: EFFECT_TYPES.BUFF,
                    resourcesPerTurn: 1,
                    duration: 3,
                },
            ],
        },
    ],
};

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
                    duration: 5,
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
                damage: 2,
                conditions: [
                    {
                        calculationTarget: "target",
                        hasEffectType: [EFFECT_TYPES.BURN],
                    },
                ],
            },
            effects: [],
        },
    ],
};

export const lightningCharge: Ability = {
    name: "Lightning Charge",
    resourceCost: 1,
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

export const evilEye: Ability = {
    name: "Evil Eye",
    resourceCost: 0,
    image: evileyeskill,
    minion: {
        name: "Evil Eye",
        image: evileyeminion,
        damage: 0,
        maxHP: 1,
        effects: [
            stealth,
            {
                type: EFFECT_TYPES.BUFF,
                description: "Heals a random ally for 1 each turn.",
                healTargetPerTurn: 1,
                duration: Infinity,
                icon: Heart,
            },
        ],
    },
    actions: [],
};

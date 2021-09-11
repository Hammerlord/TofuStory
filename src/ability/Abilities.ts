import {
    advancedcharge,
    blizzardcharge,
    blockImage,
    brandishImage,
    brick,
    bricks,
    chanceattack,
    combofuryImage,
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
    piercingdriveImage,
    punctureImage,
    rage,
    risingrage,
    shieldred,
    shout,
    slashblast,
    snailImage as snailPortrait,
    spearsweepImage,
    spikes,
    warleap,
    warmush,
    weaponbooster,
    weaponmasteryImage,
    Wolf,
} from "../images";
import { burn, chill, stealth, stun, thorns, wound } from "./Effects";
import {
    Ability,
    ACTION_TYPES,
    ANIMATION_TYPES,
    BonusCondition,
    Condition,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MULTIPLIER_TYPES,
    TARGET_TYPES,
} from "./types";

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

export const warLeap: Ability = {
    name: "War Leap",
    resourceCost: 1,
    image: warleap,
    actions: [
        {
            damage: 1,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            effects: [stun],
            bonus: {
                damage: 4,
                conditions: [
                    {
                        healthPercentage: 1,
                        calculationTarget: "target",
                        comparator: "eq",
                    },
                ],
            },
        },
    ],
};

export const slashBlast: Ability = {
    name: "Slash Blast",
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
            damage: 4,
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
            resources: 2,
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
            damage: 3,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
        {
            armor: 4,
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

export const bloodthirst: Ability = {
    name: "Bloodthirst",
    resourceCost: 1,
    image: shout,
    actions: [
        {
            effects: [
                {
                    name: "Bloodthirst",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 0,
                    healthPerResourcesSpent: 2,
                    icon: shout,
                },
            ],
            healing: 2,
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
    resourceCost: 1,
    minion: {
        name: "War Banner",
        image: flag,
        maxHP: 1,
        damage: 0,
        aura: {
            damage: 1,
            armorPerTurn: 1,
            area: 1,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
        },
        effects: [stealth],
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
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.DEBUFF,
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
            damage: 3,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.YOYO,
            icon: hammer,
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
                damage: 2,
                conditions: [
                    {
                        calculationTarget: "target",
                        hasEffectClass: EFFECT_CLASSES.DEBUFF,
                    } as BonusCondition,
                ],
            },
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
            armor: 2,
            effects: [
                {
                    name: "Iron Will",
                    icon: ironwillImage,
                    description: "Receiving +1 armor from armor sources",
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    armorReceived: 1,
                    duration: 3,
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
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
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
            damage: 1,
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
                damage: 2,
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
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                description: "Heals a random ally for 1 each turn.",
                healTargetPerTurn: 1,
                duration: Infinity,
                icon: Heart,
            },
        ],
    },
    actions: [],
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

export const sweepingReach: Ability = {
    name: "Sweeping Reach",
    resourceCost: 2,
    image: weaponbooster,
    description: "Increases the area of your next attack by 1",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Sweeping Reach",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: weaponbooster,
                    description: "Increases the area of your next offensive ability by 1",
                    attackAreaIncrease: 1,
                    onAttack: {
                        removeEffect: true,
                    },
                },
            ],
        },
    ],
};

export const piercingDrive: Ability = {
    name: "Piercing Drive",
    resourceCost: 1,
    image: piercingdriveImage,
    actions: [
        {
            area: 1,
            damage: 4,
            secondaryDamage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            bonus: {
                damage: 1,
                conditions: [
                    {
                        calculationTarget: "target",
                        hasEffectType: [EFFECT_TYPES.STUN],
                    },
                ],
            },
        },
    ],
};

export const spearSweep: Ability = {
    name: "Spear Sweep",
    resourceCost: 2,
    image: spearsweepImage,
    actions: [
        {
            area: 2,
            damage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [stun],
        },
    ],
};

export const sharpen: Ability = {
    name: "Sharpen",
    resourceCost: 0,
    image: weaponmasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Sharpen",
                    icon: weaponmasteryImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    damage: 1,
                    duration: 0,
                },
            ],
        },
    ],
};

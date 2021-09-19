import {
    blockImage,
    brick,
    bricks,
    closecombatImage,
    flag,
    hammer,
    hyperbody,
    ironbodyImage,
    ironwill as ironwillImage,
    mace,
    magiccrashImage,
    powerstanceImage,
    rage,
    rushImage,
    selfRecoveryImage,
    shieldred,
    shout,
    slashblast,
    snailImage as snailPortrait,
    spikes,
    warleap,
    warmush,
    warriormasteryImage,
    weaponbooster,
    weaponmasteryImage,
} from "../../images";
import { healingOverTime, silence, stealth, stun, thorns } from "../Effects";
import { Ability, ACTION_TYPES, ANIMATION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES } from "../types";

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

export const block: Ability = {
    name: "Block",
    resourceCost: 1,
    image: blockImage,
    actions: [
        {
            armor: 3,
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
        maxHP: 1,
        damage: 0,
        aura: {
            damage: 1,
            armorPerTurn: 1,
            area: 1,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
        },
        effects: [
            {
                ...stealth,
                duration: 2,
            },
        ],
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
    resourceCost: 2,
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
            damage: 4,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.YOYO,
            icon: hammer,
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
                    duration: 2,
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
            target: TARGET_TYPES.SELF,
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

export const sweepingReach: Ability = {
    name: "Sweeping Reach",
    resourceCost: 1,
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
                    onAttack: {
                        removeEffect: true,
                    },
                },
            ],
        },
    ],
};

export const rush: Ability = {
    name: "Rush",
    resourceCost: 1,
    image: rushImage,
    actions: [
        {
            damage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 1,
                effects: {
                    resourceCost: -1,
                },
            },
        },
    ],
};

export const berserk: Ability = {
    name: "Berserk",
    resourceCost: 3,
    image: powerstanceImage,
    description: "Reduces the cost of cards in your current hand by 3 until they are used or discarded",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            cards: {
                effects: {
                    resourceCost: -3,
                },
            },
        },
    ],
};

export const closeCombat: Ability = {
    name: "Close Combat",
    resourceCost: 2,
    image: closecombatImage,
    description: "Pulls enemies toward the selected target",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            vacuum: 2,
            area: 2,
            effects: [stun],
        },
    ],
};

export const recovery: Ability = {
    name: "Recovery",
    resourceCost: 2,
    image: selfRecoveryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    ...healingOverTime,
                },
            ],
        },
    ],
};

export const magicCrash: Ability = {
    name: "Magic Crash",
    resourceCost: 2,
    image: magiccrashImage,
    actions: [
        {
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            effects: [{ ...silence }],
        },
    ],
};

export const dash: Ability = {
    name: "Dash",
    resourceCost: 0,
    image: warriormasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 2,
            },
        },
    ],
};

export const ironBody: Ability = {
    name: "Iron Body",
    resourceCost: 1,
    image: ironbodyImage,
    actions: [
        {
            armor: 3,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Iron Body",
                    icon: ironbodyImage,
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    preventArmorDecay: true,
                    duration: 2,
                },
            ],
        },
    ],
};

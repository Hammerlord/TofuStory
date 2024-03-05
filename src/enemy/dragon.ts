import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import { BlueManonImage, DragonScreechImage, EncroachingDarknessImage, FireMarbleImage, RedMagicClawImage } from "../images";
import { CrossedSwordsIcon, JapaneseOgreIcon } from "../images/icons";
import { bleed, burn, poison, raging } from "./../ability/Effects";
import { loaf } from "./abilities";

const soulPain: Ability = {
    name: "Soul Pain",
    image: EncroachingDarknessImage,
    unplayable: true,
    onDraw: {
        ability: {
            name: "Pain",
            actions: [
                {
                    damage: 3,
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    icon: EncroachingDarknessImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                },
            ],
        },
    },
    actions: [],
};

const terriblePower: Effect = {
    ...raging,
    name: "Terrible Power",
    description: "Increasing ATT every turn.",
    image: JapaneseOgreIcon,
};

const reawakening: Effect = {
    name: "Reawakening",
    description: "When this effect ends, the character will regain its full power.",
    duration: 5,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
    onEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        usableWhileStunned: true,
        ability: {
            name: "Terrible Power",
            image: JapaneseOgreIcon,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    icon: JapaneseOgreIcon,
                    effects: [raging],
                },
            ],
        },
    },
};

export const basementDragon: Minion = {
    name: "Lost Dragon",
    maxHP: 500,
    image: BlueManonImage,
    abilities: [
        {
            name: "Blazing Flame",
            image: FireMarbleImage,
            actions: [
                {
                    area: 2,
                    damage: 5,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: FireMarbleImage,
                    effects: [{ ...burn, duration: 1 }],
                },
            ],
        },
        {
            name: "Screech of Pain",
            description: "Destroys Armor on all targets.",
            image: DragonScreechImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.SHOUT,
                    area: 3,
                    destroyArmor: 1,
                },
            ],
        },
        {
            name: "Toxic Claws",
            image: RedMagicClawImage,
            actions: [
                {
                    area: 2,
                    damage: 6,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: FireMarbleImage,
                    effects: [{ ...poison }],
                },
                {
                    area: 2,
                    damage: 6,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: FireMarbleImage,
                    effects: [{ ...bleed }],
                },
            ],
        },
        {
            name: "Thrash",
            image: CrossedSwordsIcon,
            actions: [
                {
                    area: 1,
                    damage: 10,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                },
            ],
        },
        {
            ...loaf,
            name: "Whisper of Remembrance",
        },
        {
            name: "Soul Pain",
            resourceCost: 3,
            actions: [
                {
                    damage: 3,
                    type: ACTION_TYPES.EFFECT,
                    icon: EncroachingDarknessImage,
                    animationOptions: {
                        width: 100,
                        height: 100,
                    },
                    addCardsToDiscard: [soulPain],
                },
            ],
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    hasEffect: terriblePower.name,
                },
            ],
        },
        {
            name: "Soul Anguish",
            resourceCost: 3,
            actions: [
                {
                    damage: 5,
                    type: ACTION_TYPES.EFFECT,
                    icon: EncroachingDarknessImage,
                    animationOptions: {
                        width: 100,
                        height: 100,
                    },
                    addCardsToDiscard: [soulPain, soulPain],
                },
            ],
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    hasEffect: reawakening.name,
                },
            ],
        },
        {
            name: "Rampage",
            image: JapaneseOgreIcon,
            castTime: 1,
            resourceCost: 3,
            actions: [
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    damage: 5,
                },
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    damage: 5,
                },
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    damage: 5,
                },
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    damage: 5,
                },
            ],
        },
    ],
    effects: [reawakening],
};

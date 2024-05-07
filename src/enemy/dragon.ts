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
import { CrossedSwordsIcon, JapaneseOgreIcon, ZzzIcon } from "../images/icons";
import { bleed, burn, hardy, poison, raging } from "./../ability/Effects";
import { loaf } from "./abilities";

const soulPain: Ability = {
    name: "Soul Pain",
    image: EncroachingDarknessImage,
    resourceCost: 1,
    hideResourceCostIcon: true,
    unplayable: true,
    description: "Deals {{ onDraw.ability.actions.0.damage }} {{{ _damage_ }}} to you when drawn.",
    onDraw: {
        ability: {
            name: "Pain",
            image: EncroachingDarknessImage,
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
    actions: [
        {
            type: ACTION_TYPES.HINDER,
            target: TARGET_TYPES.SELF,
        },
    ],
};

const terriblePower: Effect = {
    ...raging,
    name: "Terrible Power",
    icon: JapaneseOgreIcon,
    portraitImage: JapaneseOgreIcon,
};

const reawakening: Effect = {
    name: "Reawakening",
    description: "When this effect ends, the character will regain its full power.",
    icon: ZzzIcon,
    duration: 3,
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
                    effects: [terriblePower],
                },
            ],
        },
    },
};

export const lostDragon: Minion = {
    name: "Lost Dragon",
    maxHP: 500,
    image: BlueManonImage,
    isBoss: true,
    abilities: [
        {
            name: "Blazing Flame",
            image: FireMarbleImage,
            actions: [
                {
                    area: 2,
                    damage: 7,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: FireMarbleImage,
                    effects: [{ ...burn, stacks: 2 }],
                },
            ],
        },
        {
            name: "Screech of Pain",
            description: "Destroys all enemy Armor.",
            image: DragonScreechImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.SHOUT,
                    area: 5,
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
                    damage: 7,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    effects: [{ ...poison }],
                },
                {
                    area: 2,
                    damage: 7,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
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
                    damage: 15,
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
            image: EncroachingDarknessImage,
            description: "Adds a Soul Pain card to the player's discard.",
            resourceCost: 3,
            actions: [
                {
                    damage: 7,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.PLAYER,
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
                    hasEffect: reawakening.name,
                },
            ],
        },
        {
            name: "Soul Anguish",
            image: EncroachingDarknessImage,
            description: "Adds a Soul Pain card to the player's deck and discard.",
            resourceCost: 3,
            actions: [
                {
                    damage: 10,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.PLAYER,
                    icon: EncroachingDarknessImage,
                    animationOptions: {
                        width: 100,
                        height: 100,
                    },
                    addCardsToDeck: [soulPain],
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
            name: "Rampage",
            image: JapaneseOgreIcon,
            castTime: 1,
            resourceCost: 3,
            actions: [
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    damage: 6,
                },
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    damage: 6,
                },
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    damage: 6,
                },
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    damage: 6,
                },
            ],
        },
    ],
    effects: [hardy, reawakening],
};

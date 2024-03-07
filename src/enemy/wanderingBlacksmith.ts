import { attack } from "./abilities";
import {
    AvengersArrowImage,
    SirBlacksmithHammerImage,
    SirBlacksmithImage,
    SteelOreImage,
    TerracottaCrossbowmanImage,
    TerracottaDieImage,
    TerracottaSwordsmanImage,
    UrsusPawImage,
    WeaponBoosterImage,
} from "../images";
import { attackPower, hardy } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MULTIPLIER_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { earthen } from "./effect";

const terracottaCrossbowman: Minion = {
    name: "Terracotta Bowman",
    maxHP: 14,
    image: TerracottaCrossbowmanImage,
    abilities: [
        {
            name: "Shoot",
            image: AvengersArrowImage,
            resourceCost: 0,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    icon: AvengersArrowImage,
                    playbackTime: 400,
                    damage: 2,
                    animationOptions: {
                        rotateToFaceTarget: true,
                        rotate: -45,
                    },
                },
            ],
        },
    ],
    effects: [earthen],
};

const terracottaSwordsman: Minion = {
    name: "Terracotta Swordsman",
    image: TerracottaSwordsmanImage,
    maxHP: 20,
    abilities: [
        {
            ...attack,
        },
    ],
    effects: [earthen],
};

const forgeWarriors: Ability = {
    name: "Forge Warriors",
    image: TerracottaCrossbowmanImage,
    conditions: [
        {
            calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
            comparator: "lt",
            numFriendly: 5, // Only if there is room to summon
        },
    ],
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            icon: SirBlacksmithHammerImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            summon: [{ minion: [terracottaCrossbowman, terracottaSwordsman] }, { minion: [terracottaCrossbowman, terracottaSwordsman] }],
        },
    ],
};

export const wanderingBlacksmith: Minion = {
    name: "Wandering Blacksmith",
    image: SirBlacksmithImage,
    isElite: true,
    maxHP: 125,
    abilities: [
        {
            name: "Ghostly Palm Strike",
            image: UrsusPawImage,
            actions: [
                {
                    damage: 5,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: UrsusPawImage,
                    animationOptions: {
                        width: 60,
                        height: 64,
                    },
                    animation: ANIMATION_TYPES.BEAM,
                },
            ],
        },
        forgeWarriors,
        {
            name: "Enhance Weaponry",
            image: WeaponBoosterImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    area: 2,
                    excludePrimaryTarget: true,
                    effects: [attackPower],
                },
            ],
        },
        {
            name: "Ghostly Palm Strike",
            image: UrsusPawImage,
            actions: [
                {
                    damage: 5,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: UrsusPawImage,
                    animationOptions: {
                        width: 60,
                        height: 64,
                    },
                    animation: ANIMATION_TYPES.BEAM,
                },
            ],
        },
        forgeWarriors,
        forgeWarriors,
        {
            name: "Repurpose",
            dialog: "All things can be remade into something greater. Even one's self.",
            image: TerracottaDieImage,
            castTime: 1,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    comparator: "gt",
                    numFriendly: 1, // This is assuming there is at least 1 terracotta on the board
                },
            ],
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    icon: SirBlacksmithHammerImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    excludePrimaryTarget: true,
                    damage: 100,
                    area: 2,
                    secondaryAction: {
                        target: "actor",
                        armor: 3,
                        effects: [{ ...attackPower, duration: 3 }],
                        multiplier: {
                            type: MULTIPLIER_TYPES.NUM_AFFECTED_TARGETS,
                        },
                    },
                    playbackTime: 2000,
                },
            ],
        },
        {
            name: "Palms of Fury",
            image: UrsusPawImage,
            dialog: "I have no need of weapons in my paws to defeat you.",
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    damage: 4,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: UrsusPawImage,
                    animationOptions: {
                        width: 60,
                        height: 64,
                    },
                    animation: ANIMATION_TYPES.BEAM,
                },
                {
                    damage: 4,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: UrsusPawImage,
                    animationOptions: {
                        width: 60,
                        height: 64,
                    },
                    animation: ANIMATION_TYPES.BEAM,
                },
                {
                    damage: 4,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: UrsusPawImage,
                    animationOptions: {
                        width: 60,
                        height: 64,
                    },
                    animation: ANIMATION_TYPES.BEAM,
                },
            ],
        },
    ],
    effects: [
        {
            name: "",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onWaveStart: {
                ability: {
                    name: "",
                    dialog: "You have chosen poorly.",
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.NONE,
                            playbackTime: 2000,
                        },
                    ],
                },
                removeEffect: true,
            },
        },
        {
            name: "Steel Ore",
            icon: SteelOreImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            description: "This character cannot take more than 20 damage in one hit.",
            maxDamageTaken: 20,
        },
    ],
};

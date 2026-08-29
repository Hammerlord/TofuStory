import {
    BrokenMirrorGlassImage,
    HammerImage,
    SirBlacksmithHammerImage,
    SirBlacksmithImage,
    SteelPlateImage,
    TerracottaCrossbowmanImage,
    TerracottaDieImage,
    TerracottaSwordsmanImage,
    UrsusPawImage,
    WeaponMasteryImage,
} from "../images";
import { attackPower } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    MULTIPLIER_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { attack, shoot } from "./abilities";
import { resist } from "./effect";

const dissipate = {
    name: "Dissipate",
    image: BrokenMirrorGlassImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            retreat: true,
            animationOptions: {
                fadeOut: true, // TODO does nothing on combatant portraits
            },
        },
    ],
};

const construct: Effect = {
    name: "Construct",
    icon: SirBlacksmithHammerImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
    description: "Disappears if Wandering Blacksmith is defeated.",
    onFriendlyDeath: {
        usableWhileStunned: true,
        usableWhileDead: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.TARGET,
                name: "Wandering Blacksmith",
                comparator: "includes",
            },
        ],
        ability: dissipate,
    },
};

const terracottaCrossbowman: Minion = {
    name: "Terracotta Bowman",
    maxHP: 14,
    image: TerracottaCrossbowmanImage,
    abilities: [
        {
            ...shoot,
            actions: [
                {
                    ...shoot.actions[0],
                    damage: 3,
                },
            ],
        },
    ],
    effects: [resist, construct],
};

const terracottaSwordsman: Minion = {
    name: "Terracotta Swordsman",
    image: TerracottaSwordsmanImage,
    maxHP: 20,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
    ],
    effects: [resist, construct],
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
    maxHP: 150,
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
            image: WeaponMasteryImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    area: 2,
                    excludePrimaryTarget: true,
                    effects: [attackPower],
                },
            ],
            conditions: [
                {
                    numFriendly: 1,
                    comparator: "gt",
                    calculationTarget: CONDITION_TARGETS.ACTOR,
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
        {
            name: "Repurpose",
            dialog: "All things can be remade into something greater. Even one's self.",
            image: TerracottaDieImage,
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
            name: "Steel Plate",
            icon: SteelPlateImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            description: "This character cannot take more than 20 damage in one hit.",
            maxDamageTaken: 20,
        },
    ],
};

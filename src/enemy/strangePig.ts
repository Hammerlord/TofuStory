import { attack } from "./abilities";
import { Action, ANIMATION_TYPES, MORPH_TYPES } from "./../ability/types";
import { hardy, stun } from "../ability/Effects";
import {
    ACTION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    MULTIPLIER_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import { MutantRibbonPigImage, OmokPigImage, PigsRibbonImage, StrangePigImage } from "../images";
import { MountainIcon } from "../images/icons";
import { championsRibbon, pigHeaded } from "./effect";

export const strangePig: Minion = {
    name: "Strange Pig",
    image: StrangePigImage,
    isBoss: true,
    HP: 30,
    maxHP: 50,
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
        {
            name: "Headlong Rush",
            image: OmokPigImage,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                },
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [
                        {
                            ...stun,
                            name: "Dazed",
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        championsRibbon,
        pigHeaded,
        {
            name: "Mutate",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeath: {
                usableWhileStunned: true,
                ability: {
                    name: "Mutate",
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            animation: ANIMATION_TYPES.EXPLODE,
                            target: TARGET_TYPES.SELF,
                            summon: [
                                {
                                    minion: ["Mutant Ribbon Pig"],
                                    positionIndex: 2,
                                },
                            ],
                        },
                    ],
                },
            },
        },
    ],
};

const stalagmite: Minion = {
    name: "Stalagmite",
    maxHP: 15,
    image: MountainIcon,
    abilities: [],
    effects: [
        {
            name: "Heavy",
            description: "Immune to most debuff types. Targets struck by Stalagmite will receive -1 armor from armor sources.",
            icon: MountainIcon,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAttack: {
                usableWhileStunned: true,
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                effects: [
                    {
                        name: "Weighed Down",
                        icon: MountainIcon,
                        armorReceived: -1,
                        duration: 1,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.DEBUFF,
                    },
                ],
            },
        },
        {
            name: "Earthen",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            immunities: [EFFECT_TYPES.BLEED, EFFECT_TYPES.BURN, EFFECT_TYPES.CHILL, EFFECT_TYPES.STUN, EFFECT_TYPES.POISON],
        },
    ],
};

const throwRocks: Action[] = [
    {
        type: ACTION_TYPES.EFFECT,
        target: TARGET_TYPES.SELF,
        excludePrimaryTarget: true,
        area: 5,
        effects: [
            {
                name: "Earthen Projectile",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                attackPower: 2,
                duration: 0,
                onAttack: {
                    damage: 1,
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    removeEffect: true,
                    multiplier: {
                        type: MULTIPLIER_TYPES.HP,
                        value: 0.5,
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                    },
                },
            },
        ],
    },
    {
        type: ACTION_TYPES.EFFECT,
        target: TARGET_TYPES.SELF,
        excludePrimaryTarget: true,
        area: 5,
        induceCombatantAttack: true,
    },
];

export const mutantRibbonPig: Minion = {
    name: "Mutant Ribbon Pig",
    image: MutantRibbonPigImage,
    isBoss: true,
    maxHP: 250,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                },
            ],
        },
        {
            name: "Reckless Charge",
            image: OmokPigImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    damage: 3,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    damage: 3,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    damage: 3,
                },
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [
                        {
                            ...stun,
                            name: "Dazed",
                            duration: 2,
                        },
                    ],
                },
            ],
        },
        {
            name: "Rock Breaker",
            resourceCost: 3,
            castTime: 1,
            image: MountainIcon,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    animation: ANIMATION_TYPES.STOMP,
                    summon: [{ minion: [stalagmite] }],
                },
                ...throwRocks,
            ],
        },
        {
            name: "Seismic Toss",
            image: MountainIcon,
            actions: throwRocks,
        },
        {
            name: "Stomp",
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    animation: ANIMATION_TYPES.STOMP,
                    summon: [{ minion: [stalagmite] }, { minion: [stalagmite] }],
                },
            ],
        },
    ],
    effects: [
        hardy,
        {
            ...championsRibbon,
            onTurnEnd: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Retaliation",
                        description: "Countering on the next attack",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: OmokPigImage,
                        canBeSilenced: true,
                        duration: 1,
                        onReceiveAttack: {
                            usableWhileStunned: false,
                            removeEffect: true,
                            targetType: TRIGGER_TARGET_TYPES.ACTOR,
                            ability: {
                                name: "Retaliate",
                                actions: [
                                    {
                                        type: ACTION_TYPES.ATTACK,
                                        target: TARGET_TYPES.HOSTILE,
                                        damage: 5,
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
        },
        pigHeaded,
        {
            name: "Roar",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onSummoned: {
                ability: {
                    name: "",
                    actions: [
                        {
                            target: TARGET_TYPES.HOSTILE,
                            type: ACTION_TYPES.EFFECT,
                            animation: ANIMATION_TYPES.SHOUT,
                        },
                    ],
                },
            },
        },
    ],
};

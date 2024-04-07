import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Action,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MULTIPLIER_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import { IronHogHoofImage, OmokPigImage, PillagingWildBoarImage, RockImage } from "../images";
import { JapaneseOgreIcon, MountainIcon, ShieldIcon } from "../images/icons";
import { attackDown, hardy, stun } from "./../ability/Effects";
import { attack } from "./abilities";
import { championsRibbon, counterEffect, resist, pigHeaded } from "./effect";

const boulder: Minion = {
    name: "Boulder",
    image: RockImage,
    maxHP: 20,
    uncontrollable: true,
    abilities: [
        {
            ...attack,
            name: "Boulder",
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
    ],
    effects: [
        {
            ...resist,
            name: "Heavy",
            description: "Immune to debuffs. Targets struck by Boulder will have their Attack Power reduced by 1.",
            icon: MountainIcon,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAttack: {
                usableWhileStunned: true,
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                effects: [{ ...attackDown, duration: 3 }],
            },
        },
    ],
};

const throwRocks: Action[] = [
    {
        type: ACTION_TYPES.EFFECT,
        target: TARGET_TYPES.SELF,
        animation: ANIMATION_TYPES.SHOUT,
        excludePrimaryTarget: true,
        area: 5,
        effects: [
            {
                name: "Earthen Projectile",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
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
        induceCombatant: {
            mode: "random",
            action: {
                type: ACTION_TYPES.ATTACK,
                target: TARGET_TYPES.HOSTILE,
                damage: 3,
                targetArea: 2,
                numTargets: 2,
                animation: ANIMATION_TYPES.YOYO,
                animationOptions: {
                    ricochet: true,
                },
            },
        },
    },
];

export const pillagingWildBoar: Minion = {
    name: "Pillaging Boar",
    maxHP: 300,
    image: PillagingWildBoarImage,
    isBoss: true,
    mesos: 50,
    abilities: [
        {
            name: "Stomp",
            description: "Summons Boulders.",
            image: IronHogHoofImage,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    animation: ANIMATION_TYPES.STOMP,
                    summon: [
                        { minion: [boulder], placement: "adjacent" },
                        { minion: [boulder], placement: "adjacent" },
                    ],
                },
            ],
        },
        {
            name: "Seismic Toss",
            image: MountainIcon,
            actions: throwRocks,
        },
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
            name: "Shake Off",
            image: ShieldIcon,
            description: "Removes enemy debuffs and gains Armor.",
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    animation: ANIMATION_TYPES.SHOUT,
                    armor: 10,
                    removeDebuffs: true,
                },
            ],
        },
        {
            name: "Reckless Charge",
            image: JapaneseOgreIcon,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    damage: 5,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    damage: 5,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
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
                            bypassImmunity: true,
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
                    summon: [
                        { minion: [boulder], placement: "adjacent" },
                        { minion: [boulder], placement: "adjacent" },
                    ],
                },
                ...throwRocks,
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
                        ...counterEffect,
                        description: "Countering for 5 damage when next attacked.",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        canBeSilenced: true,
                        duration: 2,
                        onReceiveAttack: {
                            usableWhileStunned: false,
                            removeEffect: true,
                            disableTriggerFromProcs: true,
                            targetType: TRIGGER_TARGET_TYPES.ACTOR,
                            ability: {
                                name: "Retaliate",
                                image: OmokPigImage,
                                actions: [
                                    {
                                        type: ACTION_TYPES.ATTACK,
                                        target: TARGET_TYPES.HOSTILE,
                                        damage: 5,
                                    },
                                ],
                            },
                        },
                        onTurnStart: {
                            removeEffect: true,
                        },
                    },
                ],
            },
        },
        pigHeaded,
    ],
};

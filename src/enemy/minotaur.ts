import {
    TauromacisHornImage,
    TauromacisImage,
    TauromacisStampedeImage,
    TauromacisThunderCrashImage,
    TaurospearHornImage,
    TaurospearImage,
    TaurospearLightningSpearImage,
    WeaponMasteryImage,
    YellowThunderBoltProjectileImage,
} from "../images";
import { JapaneseOgreIcon } from "../images/icons";
import { attackPower, avenger, bleed, hardy, preventArmorDecay } from "./../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, CONDITION_TARGETS, Effect, MULTIPLIER_TYPES, Minion, TARGET_TYPES } from "./../ability/types";
import { attack } from "./abilities";
import { battleTrance } from "./effect";

const tauroAvenger: Effect = {
    ...avenger,
    onFriendlyDeath: {
        ...avenger.onFriendlyDeath,
        ability: {
            name: "Vengeful",
            image: JapaneseOgreIcon,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    icon: JapaneseOgreIcon,
                    armor: 3,
                    resources: 1,
                    bonus: {
                        armor: 1,
                        multiplier: {
                            type: MULTIPLIER_TYPES.MAX_HP,
                            value: 0.2,
                            calculationTarget: CONDITION_TARGETS.ACTOR,
                        },
                    },
                    playbackTime: 1500,
                },
            ],
            dialog: "No! Brother! I will avenge you!",
        },
    },
};

export const tauromacis: Minion = {
    name: "Tauromacis",
    maxHP: 200,
    image: TauromacisImage,
    isElite: true,
    mesos: 40,
    abilities: [
        {
            name: "Stampede",
            image: TauromacisStampedeImage,
            description: "Hits up to 2 extra targets for 3.",
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 6,
                    secondaryDamage: 3,
                    animationOptions: {
                        ricochet: true,
                    },
                    numTargets: 2,
                    targetArea: 2,
                },
            ],
        },
        {
            name: "Bolster Allies",
            image: WeaponMasteryImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.SHOUT,
                    area: 2,
                    excludePrimaryTarget: true,
                    effects: [attackPower],
                },
            ],
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
            name: "Gore",
            image: TauromacisHornImage,
            description: "Inflicts Bleed and heals itself for 10.",
            castTime: 1,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 8,
                    effects: [bleed],
                    secondaryAction: {
                        healing: 10,
                    },
                },
            ],
        },
        {
            name: "Thunder Crash",
            image: TauromacisThunderCrashImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    damage: 5,
                    secondaryDamage: 3,
                    area: 2,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: YellowThunderBoltProjectileImage,
                    animationOptions: {
                        height: 250,
                        width: 60,
                        flash: 200,
                    },
                },
                {
                    damage: 5,
                    secondaryDamage: 3,
                    area: 2,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: YellowThunderBoltProjectileImage,
                    animationOptions: {
                        height: 250,
                        width: 60,
                        flash: 200,
                    },
                },
            ],
        },
    ],
    effects: [tauroAvenger, hardy, battleTrance],
};

export const taurospear: Minion = {
    name: "Taurospear",
    maxHP: 200,
    image: TaurospearImage,
    isElite: true,
    mesos: 40,
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
            name: "Bolster Allies",
            image: preventArmorDecay.icon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.SHOUT,
                    area: 2,
                    armor: 10,
                    excludePrimaryTarget: true,
                    effects: [preventArmorDecay],
                },
            ],
        },
        {
            name: "Stampede",
            image: TauromacisStampedeImage,
            description: "Hits up to 2 extra targets for 3.",
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 6,
                    secondaryDamage: 3,
                    animationOptions: {
                        ricochet: true,
                    },
                    numTargets: 2,
                    targetArea: 2,
                },
            ],
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
            name: "Gore",
            image: TaurospearHornImage,
            description: "Inflicts Bleed. Taurospear gains 10 armor.",
            castTime: 1,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 8,
                    effects: [bleed],
                    secondaryAction: {
                        armor: 10,
                    },
                },
            ],
        },
        {
            name: "Lightning Bull Rush",
            image: TaurospearLightningSpearImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    damage: 5,
                    area: 2,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    animationOptions: {
                        flash: 200,
                    },
                },
                {
                    damage: 5,
                    area: 2,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    animationOptions: {
                        flash: 200,
                    },
                },
                {
                    damage: 5,
                    area: 2,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    animationOptions: {
                        flash: 200,
                    },
                },
            ],
        },
    ],
    effects: [tauroAvenger, hardy, battleTrance],
};

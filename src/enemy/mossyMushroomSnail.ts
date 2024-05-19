import { hardy, preventArmorDecay } from "../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { GreenFairiesImage, MossyMushroomImage, MossySnailImage, MushroomOmokImage, RedSnailShellImage } from "../images";
import { attack, loaf, whomp } from "./abilities";
import { agedShell, weightedShell } from "./effect";

export const mossyMushroom: Minion = {
    name: "Mossy Mushroom",
    maxHP: 200,
    mesos: 40,
    isElite: true,
    image: MossyMushroomImage,
    resources: 2,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 7,
                },
            ],
        },
        loaf,
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 7,
                },
            ],
        },
        whomp,
    ],
    effects: [
        hardy,
        {
            name: "Fairies",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                removeEffect: true,
                ability: {
                    name: "Fairy Swarm",
                    actions: [
                        {
                            target: TARGET_TYPES.RANDOM_FRIENDLY,
                            icon: GreenFairiesImage,
                            type: ACTION_TYPES.EFFECT,
                            effects: ["Fairy Swarm"],
                        },
                    ],
                },
            },
        },
    ],
};

export const mossySnail: Minion = {
    name: "Mossy Snail",
    maxHP: 50,
    armor: 150,
    mesos: 40,
    image: MossySnailImage,
    isElite: true,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 6,
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 6,
                },
            ],
        },
        loaf,
        {
            name: "Rollout",
            image: RedSnailShellImage,
            castTime: 1,
            channelDuration: 3,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.YOYO,
                    animationOptions: {
                        ricochet: true,
                    },
                    playbackTime: 750,
                    description: "Bounces to 2 other targets for 3 damage.",
                    damage: 6,
                    secondaryDamage: 3,
                    numTargets: 2,
                    targetArea: 2,
                },
            ],
        },
    ],
    effects: [
        agedShell,
        preventArmorDecay,
        {
            ...weightedShell,
            attackPower: 2,
        },
    ],
};

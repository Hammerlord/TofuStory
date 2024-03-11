import { preventArmorDecay } from "../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { GreenFairiesImage, MossyMushroomImage, MossySnailImage, MushroomOmokImage, RedSnailShellImage } from "../images";
import { attack } from "./abilities";
import { agedShell, weightedShell } from "./effect";

export const mossyMushroom: Minion = {
    name: "Mossy Mushroom",
    maxHP: 150,
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
                    damage: 4,
                },
            ],
        },
        {
            name: "Whomp",
            image: MushroomOmokImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    area: 1,
                    secondaryDamage: 3,
                },
            ],
        },
    ],
    effects: [
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
    armor: 100,
    image: MossySnailImage,
    isElite: true,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
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
                    playbackTime: 600,
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
            skillBonus: [
                {
                    skill: "Rollout",
                    damage: 2,
                },
            ],
        },
    ],
};

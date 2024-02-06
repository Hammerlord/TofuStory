import { attack } from "./abilities";
import { agedShell, toughShell, weightedShell } from "./effect";
import { ACTION_TYPES, ANIMATION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { GreenFairiesImage, MossyMushroomImage, MossySnailImage, MushroomOmokImage } from "../images";

export const mossyMushroom: Minion = {
    name: "Mossy Mushroom",
    maxHP: 200,
    isBoss: true,
    image: MossyMushroomImage,
    resources: 2,
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
    maxHP: 100,
    armor: 100,
    image: MossySnailImage,
    isBoss: true,
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
            name: "Rollout",
            castTime: 1,
            channelDuration: 3,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.YOYO,
                    playbackTime: 600,
                    damage: 3,
                },
            ],
        },
    ],
    effects: [
        agedShell,
        toughShell,
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

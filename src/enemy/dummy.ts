import { ACTION_TYPES, ANIMATION_TYPES, TARGET_TYPES } from "../ability/types";
import { Puppetree2Image, Puppetree3Image, PuppetreeImage, RedSnailShellImage } from "../images";
import { hardy, thorns } from "./../ability/Effects";
import { attack, loaf, tantrum } from "./abilities";

export const basicDummy2 = {
    name: "Dummy",
    image: PuppetreeImage,
    maxHP: 5,
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
};

export const basicAoeDummyMagician = {
    name: "Dummy",
    image: PuppetreeImage,
    maxHP: 3,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 1,
                },
            ],
        },
    ],
};

export const basicDummy = {
    name: "Dummy",
    image: PuppetreeImage,
    maxHP: 15,
    abilities: [loaf],
};

export const devDummy = {
    name: "Dummy",
    image: PuppetreeImage,
    maxHP: 50,
    resources: 3,
    abilities: [
        attack,
        {
            name: "Rollout",
            image: RedSnailShellImage,
            description: "Bounces to 2 other targets for 2 damage.",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                    secondaryDamage: 2,
                    animation: ANIMATION_TYPES.YOYO,
                    animationOptions: {
                        ricochet: true,
                    },
                    numTargets: 2,
                    targetArea: 2,
                    playbackTime: 750,
                },
            ],
        },
    ],
};

export const spikedDummy = {
    name: "Spiked Dummy",
    image: Puppetree2Image,
    maxHP: 21,
    abilities: [loaf],
    effects: [thorns],
};

export const ragingDummy = {
    name: "Raging Dummy",
    isElite: true,
    image: Puppetree3Image,
    maxHP: 30,
    abilities: [tantrum],
    effects: [hardy],
};

import { stealth } from "./../ability/Effects";
import { ACTION_TYPES, TARGET_TYPES } from "./../ability/types";
import { enemyHaste, loaf } from "./abilities";
import { Ability, Effect } from "../ability/types";
import {
    bluesnailImage,
    leetSin,
    noobClubA,
    noobClubB,
    orangeMushroomImage,
    redsnailImage,
    shroomImage,
    snailImage,
    subi,
} from "../images";

export interface Enemy {
    name: string;
    image: string;
    maxHP: number;
    HP?: number;
    armor?: number;
    abilities?: Ability[];
    damage: number;
    effects?: Effect[];
    resources?: number;
}

export const snail: Enemy = {
    name: "Snail",
    maxHP: 5,
    abilities: [loaf],
    image: snailImage,
    damage: 1,
};

export const blueSnail: Enemy = {
    name: "Blue Snail",
    maxHP: 10,
    image: bluesnailImage,
    damage: 2,
    abilities: [
        {
            name: "Block",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 2,
                },
            ],
        },
    ],
};

export const shroom: Enemy = {
    name: "Shroom",
    maxHP: 7,
    image: shroomImage,
    damage: 2,
};

export const redSnail: Enemy = {
    name: "Red Snail",
    maxHP: 20,
    image: redsnailImage,
    damage: 2,
    abilities: [
        {
            name: "Block",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 2,
                },
            ],
        },
    ],
};

export const orangeMushroom: Enemy = {
    name: "Orange Mushroom",
    maxHP: 25,
    image: orangeMushroomImage,
    damage: 3,
};

export const noobA: Enemy = {
    name: "Beginner A",
    maxHP: 35,
    image: noobClubA,
    damage: 2,
    abilities: [
        {
            name: "Club!",
            resourceCost: 4,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Block",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 2,
                },
            ],
        },
    ],
};

export const noobB: Enemy = {
    name: "Beginner B",
    maxHP: 35,
    image: noobClubB,
    damage: 2,
    abilities: [
        {
            name: "Flurry",
            resourceCost: 4,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
            ],
        },
        {
            name: "Potion",
            resourceCost: 4,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    healing: 5,
                },
            ],
        },
    ],
};

export const thiefAssassin: Enemy = {
    name: "XxLeetSinxX",
    maxHP: 40,
    image: leetSin,
    damage: 2,
    abilities: [
        {
            name: "Dark Sight",
            resourceCost: 2,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [
                        {
                            ...stealth,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
        {
            name: "Lucky Seven",
            resourceCost: 2,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                    icon: subi,
                },
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                    icon: subi,
                },
            ],
        },
        enemyHaste,
        {
            name: "Potion",
            resourceCost: 4,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    healing: 5,
                },
            ],
        },
    ],
};

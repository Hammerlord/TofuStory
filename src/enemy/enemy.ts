import { stealth, elite, burn, thorns, hardy, raging } from "./../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, TARGET_TYPES } from "./../ability/types";
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
    olafImage,
    octopusImage,
    wildboarImage,
    stumpImage,
    fireboarImage,
    axestumpImage,
    ligatorImage,
    greenmushroomImage,
    hornymushroomImage,
    kingslimeImage,
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
    /** Enemy basic attack. If not provided, one will be generated for the enemy. */
    attack?: Ability;
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
                    armor: 3,
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
                    armor: 3,
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
    effects: [hardy],
};

export const noobA: Enemy = {
    name: "Beginner A",
    maxHP: 25,
    image: noobClubA,
    damage: 2,
    abilities: [
        {
            name: "Club!",
            resourceCost: 3,
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
    maxHP: 25,
    image: noobClubB,
    damage: 2,
    abilities: [
        {
            name: "Flurry",
            resourceCost: 3,
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
            resourceCost: 3,
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
    maxHP: 30,
    image: leetSin,
    damage: 2,
    attack: {
        name: "Attack",
        actions: [
            {
                type: ACTION_TYPES.RANGE_ATTACK,
                target: TARGET_TYPES.HOSTILE,
                animation: ANIMATION_TYPES.ONE_WAY,
                damage: 2,
                icon: subi,
            },
        ],
    },
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
                    animation: ANIMATION_TYPES.ONE_WAY,
                    damage: 0,
                    icon: subi,
                },
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    damage: 0,
                    icon: subi,
                },
            ],
        },
        enemyHaste,
        {
            name: "Potion",
            resourceCost: 3,
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

export const olaf = {
    name: "Olaf",
    maxHP: 25,
    effects: [elite],
    abilities: [
        {
            name: "Double Punch",
            resourceCost: 3,
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
            ],
        },
    ],
    damage: 2,
    image: olafImage,
};

export const octopus: Enemy = {
    name: "Octopus",
    image: octopusImage,
    maxHP: 7,
    damage: 1,
};

export const wildBoar: Enemy = {
    name: "Wild Boar",
    image: wildboarImage,
    maxHP: 12,
    damage: 2,
    abilities: [
        {
            name: "Wild Charge",
            resourceCost: 3,
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

export const stump: Enemy = {
    name: "Stump",
    image: stumpImage,
    maxHP: 10,
    armor: 5,
    damage: 1,
    effects: [hardy],
};

export const axeStump: Enemy = {
    name: "Axe Stump",
    image: axestumpImage,
    maxHP: 17,
    armor: 10,
    damage: 2,
    abilities: [
        {
            name: "Barbs",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 3,
                    effects: [
                        {
                            ...thorns,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [hardy],
};

export const fireBoar: Enemy = {
    name: "Fire Boar",
    image: fireboarImage,
    maxHP: 25,
    damage: 3,
    abilities: [
        {
            name: "Blazing Charge",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    effects: [{ ...burn, duration: 1 }],
                },
            ],
        },
    ],
    effects: [hardy],
};

export const ligator: Enemy = {
    name: "Ligator",
    image: ligatorImage,
    maxHP: 15,
    damage: 2,
};

export const eliteLigator: Enemy = {
    name: "Ligator",
    image: ligatorImage,
    maxHP: 30,
    damage: 2,
    effects: [elite, raging],
};

export const greenMushroom: Enemy = {
    name: "Green Mushroom",
    image: greenmushroomImage,
    maxHP: 15,
    damage: 1,
};

export const hornyMushroom: Enemy = {
    name: "Horny Mushroom",
    image: hornymushroomImage,
    maxHP: 20,
    damage: 2,
    effects: [thorns],
};

export const kingSlimeEnemy: Enemy = {
    name: "King Slime",
    image: kingslimeImage,
    maxHP: 50,
    damage: 2,
    effects: [elite],
    abilities: [
        {
            name: "Earthquake",
            actions: [
                {
                    resources: 3,
                    type: ACTION_TYPES.ATTACK,
                    damage: 4,
                    area: 2,
                },
            ],
        },
    ],
};

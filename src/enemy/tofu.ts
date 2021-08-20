import { thorns } from './../ability/Effects';
import { Ability, TARGET_TYPES } from "../ability/types";
import matty from "../images/matty.png";
import realtofuPortrait from "../images/item118.png";
import theraretofuPortrait from "../images/item257.png";
import smalltofuPortrait from "../images/item394.png";
import { BigBeefy } from "../images";

const loaf = {
    name: "Loaf",
    actions: [
        {
            description: "{{caster}} is loafing around.",
        },
    ],
};

const move = {
    name: "Move",
    actions: [
        {
            movement: 1,
            description: "{{caster}} has moved.",
            target: TARGET_TYPES.SELF,
        },
    ],
};

export interface Enemy {
    name: string;
    image: string;
    maxHP: number;
    HP: number;
    armor: number;
    abilities: Ability[];
}

export const smalltofu = {
    name: "Smalltofu",
    image: smalltofuPortrait,
    maxHP: 3,
    armor: 0,
    damage: 1,
    abilities: [loaf, move],
    effects: [thorns],
};

export const thefaketofu = {
    name: "Thefaketofu",
    image: matty,
    maxHP: 5,
    armor: 0,
    damage: 2, // The damage that appears
    abilities: [loaf, move],
};

export const realtofu = {
    name: "Realtofu",
    image: realtofuPortrait,
    maxHP: 5,
    armor: 0,
    damage: 3,
    abilities: [loaf, move],
};

export const theraretofu = {
    name: "Theraretofu",
    image: theraretofuPortrait,
    maxHP: 10,
    armor: 0,
    damage: 3,
    abilities: [loaf, move],
};

export const bigBeefy = {
    name: "Big Beefy",
    image: BigBeefy,
    maxHP: 30,
    armor: 0,
    damage: 2,
};

export const createSyntheticAttack = (enemy) => {
    return {
        name: "Attack",
        actions: [
            {
                damage: enemy.damage || 1,
                target: TARGET_TYPES.HOSTILE,
            },
        ],
    };
};

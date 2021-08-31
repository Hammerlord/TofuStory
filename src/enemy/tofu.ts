import { Ability, ACTION_TYPES, TARGET_TYPES } from "../ability/types";
import { BigBeefy, regalTofu } from "../images";
import realtofuPortrait from "../images/item118.png";
import theraretofuPortrait from "../images/item257.png";
import smalltofuPortrait from "../images/item394.png";
import matty from "../images/matty.png";
import { hardy, thorns } from "./../ability/Effects";
import { loaf, move, rally, shiningLaser, tantrum, whip } from "./abilities";

export interface Enemy {
    name: string;
    image: string;
    maxHP: number;
    HP: number;
    armor: number;
    abilities: Ability[];
}

export const smalltofu = {
    name: "Small Tofu",
    image: smalltofuPortrait,
    maxHP: 3,
    armor: 0,
    damage: 1,
    abilities: [loaf, move],
    effects: [thorns],
};

export const thefaketofu = {
    name: "Fake Tofu",
    image: matty,
    maxHP: 5,
    armor: 0,
    damage: 2, // The damage that appears
    abilities: [loaf, move],
};

export const realtofu = {
    name: "Real Tofu",
    image: realtofuPortrait,
    maxHP: 5,
    armor: 0,
    damage: 3,
    abilities: [loaf, move],
};

export const theraretofu = {
    name: "Rare Tofu",
    image: theraretofuPortrait,
    maxHP: 10,
    armor: 0,
    damage: 2,
    resources: 2,
    abilities: [loaf, move, shiningLaser],
    effects: [hardy],
};

export const bigBeefy = {
    name: "Big Beefy",
    image: BigBeefy,
    maxHP: 30,
    armor: 0,
    damage: 2,
    resources: 2,
    abilities: [tantrum],
    effects: [hardy],
};

export const theRegalTofu = {
    name: "The Regal Tofu",
    image: regalTofu,
    maxHP: 10,
    armor: 0,
    damage: 3,
    abilities: [rally],
    effects: [hardy],
};

export const theCruelTofu = {
    name: "The Cruel Tofu",
    image: regalTofu, // TODO
    maxHP: 30,
    armor: 0,
    damage: 3,
    abilities: [whip],
};

/**
 * Creates a basic "attack" ability for monsters. Due for a revamp...
 */
export const createSyntheticAttack = () => {
    return {
        name: "Attack",
        actions: [
            {
                target: TARGET_TYPES.HOSTILE,
                type: ACTION_TYPES.ATTACK,
            },
        ],
    };
};
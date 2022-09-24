import { Minion } from "../ability/types";
import { BigBeefy, regalTofu } from "../images";
import realtofuPortrait from "../images/item118.png";
import theraretofuPortrait from "../images/item257.png";
import smalltofuPortrait from "../images/item394.png";
import matty from "../images/matty.png";
import { hardy, raging } from "./../ability/Effects";
import { loaf, move, rally, shiningLaser, tantrum } from "./abilities";

export const smalltofu: Minion = {
    name: "Small Tofu",
    image: smalltofuPortrait,
    maxHP: 3,
    armor: 0,
    damage: 1,
    abilities: [loaf, move],
    effects: [],
};

export const thefaketofu: Minion = {
    name: "Fake Tofu",
    image: matty,
    maxHP: 5,
    armor: 0,
    damage: 2,
    abilities: [loaf, move],
};

export const realtofu: Minion = {
    name: "Real Tofu",
    image: realtofuPortrait,
    maxHP: 8,
    armor: 0,
    damage: 2,
    abilities: [loaf, move],
    effects: [],
};

export const theraretofu: Minion = {
    name: "Rare Tofu",
    image: theraretofuPortrait,
    maxHP: 15,
    armor: 0,
    damage: 2,
    resources: 2,
    abilities: [loaf, move, shiningLaser],
    effects: [hardy],
};

export const bigBeefy: Minion = {
    name: "Big Beefy",
    image: BigBeefy,
    maxHP: 30,
    armor: 0,
    damage: 2,
    resources: 2,
    abilities: [tantrum],
    effects: [hardy, raging],
};

export const theRegalTofu: Minion = {
    name: "The Regal Tofu",
    image: regalTofu,
    maxHP: 10,
    armor: 0,
    damage: 3,
    abilities: [rally],
    effects: [hardy],
};

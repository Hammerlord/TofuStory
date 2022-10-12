import { Minion } from "../ability/types";
import { BigBeefyImage, FlanImage, MattyImage, RegalTofuImage, RubberImage, WhiteRockImage } from "../images";
import { hardy, raging } from "./../ability/Effects";
import { loaf, move, rally, shiningLaser, tantrum } from "./abilities";

export const smalltofu: Minion = {
    name: "Small Tofu",
    image: WhiteRockImage,
    maxHP: 3,
    armor: 0,
    damage: 1,
    abilities: [loaf, move],
    effects: [],
};

export const thefaketofu: Minion = {
    name: "Fake Tofu",
    image: MattyImage,
    maxHP: 5,
    armor: 0,
    damage: 2,
    abilities: [loaf, move],
};

export const realtofu: Minion = {
    name: "Real Tofu",
    image: RubberImage,
    maxHP: 8,
    armor: 0,
    damage: 2,
    abilities: [loaf, move],
    effects: [],
};

export const theraretofu: Minion = {
    name: "Rare Tofu",
    image: FlanImage,
    maxHP: 15,
    armor: 0,
    damage: 2,
    resources: 2,
    abilities: [loaf, move, shiningLaser],
    effects: [hardy],
};

export const bigBeefy: Minion = {
    name: "Big Beefy",
    image: BigBeefyImage,
    maxHP: 30,
    armor: 0,
    damage: 2,
    resources: 2,
    abilities: [tantrum],
    effects: [hardy, raging],
};

export const theRegalTofu: Minion = {
    name: "The Regal Tofu",
    image: RegalTofuImage,
    maxHP: 10,
    armor: 0,
    damage: 3,
    abilities: [rally],
    effects: [hardy],
};

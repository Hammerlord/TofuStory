import { Puppetree2Image, Puppetree3Image, PuppetreeImage } from "../images";
import { hardy, thorns } from "./../ability/Effects";
import { loaf, tantrum } from "./abilities";

export const basicDummy = {
    name: "Dummy",
    image: PuppetreeImage,
    maxHP: 15,
    abilities: [loaf],
    effects: [hardy],
    damage: 1,
};

export const spikedDummy = {
    name: "Spiked Dummy",
    image: Puppetree2Image,
    maxHP: 15,
    abilities: [loaf],
    damage: 1,
    effects: [thorns],
};

export const ragingDummy = {
    name: "Raging Dummy",
    image: Puppetree3Image,
    maxHP: 40,
    abilities: [tantrum],
    effects: [hardy],
    damage: 3,
};

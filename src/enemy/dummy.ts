import { Puppetree2Image, Puppetree3Image, PuppetreeImage } from "../images";
import { hardy, thorns } from "./../ability/Effects";
import { attack, loaf, tantrum } from "./abilities";

export const basicDummy2 = {
    name: "Dummy",
    image: PuppetreeImage,
    maxHP: 5,
};

export const basicDummy = {
    name: "Dummy",
    image: PuppetreeImage,
    maxHP: 12,
    abilities: [loaf],
};

export const devDummy = {
    name: "Dummy",
    image: PuppetreeImage,
    maxHP: 15,
    abilities: [attack],
};

export const spikedDummy = {
    name: "Spiked Dummy",
    image: Puppetree2Image,
    maxHP: 14,
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

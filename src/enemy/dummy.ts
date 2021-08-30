import { puppetree, puppetree2, puppetree3 } from '../images';
import { hardy, thorns } from './../ability/Effects';
import { loaf, tantrum } from './abilities';

export const basicDummy = {
    name: "Dummy",
    image: puppetree,
    maxHP: 5,
    abilities: [loaf],
    damage: 1
};

export const spikedDummy = {
    name: "Spiked Dummy",
    image: puppetree2,
    maxHP: 5,
    abilities: [loaf],
    damage: 1,
    effects: [thorns]
};

export const ragingDummy = {
    name: "Raging Dummy",
    image: puppetree3,
    maxHP: 20,
    abilities: [tantrum],
    effects: [hardy],
    damage: 2,
};
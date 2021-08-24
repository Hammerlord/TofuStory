import { puppetree } from '../images';
import { thorns } from './../ability/Effects';
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
    image: puppetree,
    maxHP: 5,
    abilities: [loaf],
    damage: 1,
    effects: [thorns]
};

export const ragingDummy = {
    name: "Raging Dummy",
    image: puppetree,
    maxHP: 10,
    abilities: [tantrum],
    damage: 1,
};
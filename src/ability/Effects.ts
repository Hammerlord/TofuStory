import { EFFECT_TYPES } from './types';
import { Cactus, spikes } from "../images";

export const thorns = {
    name: "Thorns",
    icon: Cactus,
    thorns: 1,
    duration: Infinity,
    type: EFFECT_TYPES.BUFF,
};

export const spikedArmorEffect = {
    name: "Spiked Armor",
    icon: Cactus,
    thorns: 1,
    duration: 3,
    type: EFFECT_TYPES.BUFF,
};
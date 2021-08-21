import { Effect, EFFECT_TYPES } from './types';
import { Cactus, spikes } from "../images";

export const thorns: Effect = {
    name: "Thorns",
    icon: Cactus,
    thorns: 1,
    duration: Infinity,
    type: EFFECT_TYPES.BUFF,
};

export const spikedArmorEffect: Effect = {
    name: "Spiked Armor",
    icon: Cactus,
    thorns: 1,
    duration: 3,
    type: EFFECT_TYPES.BUFF,
};
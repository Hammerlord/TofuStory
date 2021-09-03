import { Effect, EFFECT_TYPES } from "./types";
import { Cactus, Cloudy, Crossmark, Helmet, NoStun, spikes } from "../images";

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

export const controlImmune: Effect = {
    name: "Stun Immunity",
    description: "Target cannot be stunned or frozen.",
    icon: NoStun,
    immunities: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
    duration: 4,
    type: EFFECT_TYPES.BUFF,
};

export const hardy: Effect = {
    name: "Hardy",
    description: "After being stunned or frozen, gains temporary immunity to those effects.",
    icon: Helmet,
    onReceiveEffect: {
        conditions: [
            {
                types: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
                comparator: "eq",
            },
        ],
        target: {
            effects: [controlImmune],
        },
    },
    duration: Infinity,
    type: EFFECT_TYPES.BUFF,
};

export const stealth: Effect = {
    type: EFFECT_TYPES.STEALTH,
    name: "Stealth",
    icon: Cloudy,
    description: "Untargetable by attacks. Effect ends if this character attacks or is hit by area damage.",
    duration: 3,
};

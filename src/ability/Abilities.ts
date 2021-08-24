import { spikedArmorEffect } from "./Effects";
import {
    axe,
    block as blockImage,
    brick,
    flag,
    mace,
    rage,
    rend as rendImage,
    risingrage,
    shieldred,
    shout,
    spikes,
    snail as snailPortrait,
    warleap,
    Wolf,
} from "../images";
import { Ability, EFFECT_TYPES, TARGET_TYPES } from "./types";

export const bash: Ability = {
    name: "Bash",
    resourceCost: 0,
    image: brick,
    actions: [
        {
            damage: 1,
            target: TARGET_TYPES.HOSTILE,
        },
    ],
};

export const charge: Ability = {
    name: "Charge",
    resourceCost: 1,
    image: warleap,
    actions: [
        {
            damage: 1,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    name: "Stun",
                    type: EFFECT_TYPES.STUN,
                    duration: 1,
                },
            ],
        },
    ],
};

export const cleave: Ability = {
    name: "Cleave",
    resourceCost: 1,
    image: axe,
    actions: [
        {
            damage: 2,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
        },
    ],
};

export const slam: Ability = {
    name: "Slam",
    resourceCost: 1,
    image: mace,
    actions: [
        {
            damage: 3,
            target: TARGET_TYPES.HOSTILE,
        },
    ],
};

export const anger: Ability = {
    name: "Anger",
    resourceCost: 0,
    image: rage,
    actions: [
        {
            damage: 2,
            resources: 3,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const shieldStrike: Ability = {
    name: "Shield Strike",
    resourceCost: 2,
    image: shieldred,
    actions: [
        {
            damage: 2,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            armor: 3,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const rampage: Ability = {
    name: "Rampage",
    resourceCost: 3,
    image: risingrage,
    actions: [
        {
            damage: 9,
            target: TARGET_TYPES.HOSTILE,
        },
    ],
};

export const block: Ability = {
    name: "Block",
    resourceCost: 1,
    image: blockImage,
    actions: [
        {
            armor: 2,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const rend: Ability = {
    name: "Rend",
    resourceCost: 2,
    image: rendImage,
    actions: [
        {
            damage: 2,
            area: 1,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    name: "Bleed",
                    type: EFFECT_TYPES.BLEED,
                    duration: 3,
                },
            ],
        },
    ],
};

export const bloodthirst: Ability = {
    name: "Bloodthirst",
    resourceCost: 0,
    image: shout,
    actions: [
        {
            effects: [
                {
                    name: "Bloodthirst",
                    type: EFFECT_TYPES.BUFF,
                    duration: 0,
                    healthPerResourcesSpent: 2,
                    icon: shout,
                },
            ],
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const sprint: Ability = {
    name: "Sprint",
    actions: [
        {
            cards: -1,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const wolf: Ability = {
    name: "Wolf",
    resourceCost: 2,
    minion: {
        name: "Wolf",
        image: Wolf,
        maxHP: 3,
        damage: 1,
    },
    actions: [],
};

export const spikedArmor: Ability = {
    name: "Spiked Armor",
    resourceCost: 3,
    image: spikes,
    actions: [
        {
            armor: 4,
            target: TARGET_TYPES.FRIENDLY,
            effects: [spikedArmorEffect],
        },
    ],
};

export const warBanner: Ability = {
    name: "War Banner",
    resourceCost: 3,
    minion: {
        name: "War Banner",
        image: flag,
        maxHP: 3,
        damage: 0,
        aura: {
            damage: 1,
            armorPerTurn: 1,
            area: 1,
            type: EFFECT_TYPES.BUFF,
        },
    },
    actions: [],
};

export const snailMinion: Ability = {
    name: "Snail",
    resourceCost: 1,
    minion: {
        name: "Snail",
        image: snailPortrait,
        maxHP: 1,
        damage: 1,
    },
    actions: [],
};

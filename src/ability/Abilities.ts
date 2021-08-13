import { Ability, EFFECT_TYPES, TARGET_TYPES } from "./types";

export const bash: Ability = {
    name: "Bash",
    resourceCost: 0,
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
    actions: [
        {
            damage: 1,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
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
    actions: [
        {
            damage: 2,
            area: 1,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
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
    actions: [
        {
            effects: [
                {
                    type: EFFECT_TYPES.BUFF,
                    duration: 0,
                    healthPerResourcesSpent: 2,
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

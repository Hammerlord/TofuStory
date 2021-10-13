import { EFFECT_CLASSES, EFFECT_TYPES } from "../ability/types";
import {
    amethystImage,
    drakebloodImage,
    hotdog,
    lucksackImage,
    manualImage,
    safetyCharmImage,
    sandalsImage,
    stolenFenceImage,
} from "../images";
import { Item, ITEM_TYPES } from "./types";

export const halfEatenHotdog: Item = {
    name: "Half-eaten Hot Dog",
    healing: 10,
    image: hotdog,
    type: ITEM_TYPES.CONSUMABLE,
};

export const stolenFence: Item = {
    name: "Stolen Fence",
    description: "Reduces damage received by 1 when health is less than half.",
    type: ITEM_TYPES.EQUIPMENT,
    image: stolenFenceImage,
    sellPrice: 10,
    effects: [
        {
            name: "Stolen Fence",
            description: "Reducing damage taken by 1.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: stolenFenceImage,
            damageReceived: -1,
            onlyVisibleWhenProcced: true,
            conditions: [
                {
                    calculationTarget: "effectOwner",
                    healthPercentage: 0.5,
                    comparator: "lt",
                },
            ],
        },
    ],
};

export const safetyCharm: Item = {
    name: "Safety Charm",
    description: "Restores 2 HP on wave clear.",
    type: ITEM_TYPES.EQUIPMENT,
    image: safetyCharmImage,
    sellPrice: 10,
    effects: [
        {
            name: "Safety Charm",
            description: "Restores 2 HP on wave clear.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: safetyCharmImage,
            healingPerWaveClear: 2, // Should be on wave clear
        },
    ],
};

export const drakeBlood: Item = {
    name: "Drake Blood",
    description: "Grants 1 attack power and 1 health per kill, but you take 1 damage per turn.",
    type: ITEM_TYPES.EQUIPMENT,
    image: drakebloodImage,
    sellPrice: 10,
    effects: [
        {
            name: "Drake Blood",
            description: "Grants 1 attack power and 1 health per kill, but you take 1 damage per turn.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: drakebloodImage,
            damagePerTurn: 1,
            damage: 1,
            onHostileKilled: {
                effectOwner: {
                    healing: 1,
                },
            },
        },
    ],
};

export const luckSack: Item = {
    name: "Luck Sack",
    description: "Gain 20% more mesos.",
    type: ITEM_TYPES.EQUIPMENT,
    image: lucksackImage,
    sellPrice: 10,
    effects: [
        {
            name: "Luck Sack",
            description: "Gaining 20% more mesos.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            mesosGained: 0.2,
        },
    ],
};

export const amethyst: Item = {
    name: "Amethyst",
    description: "Increases maximum HP by 5.",
    type: ITEM_TYPES.EQUIPMENT,
    image: amethystImage,
    sellPrice: 10,
    effects: [
        {
            name: "Amethyst",
            description: "Increasing maximum HP by 5.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 5,
        },
    ],
};

export const leatherSandals: Item = {
    name: "Leather Sandals",
    description: "The quintessential footwear of aspiring adventurers. On wave start, draw an extra card.",
    type: ITEM_TYPES.EQUIPMENT,
    image: sandalsImage,
    sellPrice: 10,
    effects: [
        {
            name: "Leather Sandals",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                effectOwner: {
                    drawCards: 1,
                },
            },
        },
    ],
};

export const blackScroll: Item = {
    name: "Black Scroll",
    description: "Combine 3 scrolls to attain an ability of your choice for your class.",
    image: manualImage,
    type: ITEM_TYPES.MATERIAL,
};

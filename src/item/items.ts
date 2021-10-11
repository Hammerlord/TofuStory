import { EFFECT_CLASSES, EFFECT_TYPES } from "../ability/types";
import { drakebloodImage, hotdog, safetyCharmImage, stolenFenceImage } from "../images";
import { Item, ITEM_TYPES } from "./types";

export const halfEatenHotdog: Item = {
    name: "Half-eaten Hot Dog",
    healing: 10,
    image: hotdog,
    type: ITEM_TYPES.CONSUMABLE,
};

export const stolenFence: Item = {
    name: "Stolen Fence",
    description: "Reduces damage received by 1 when health is less than half",
    type: ITEM_TYPES.EQUIPMENT,
    image: stolenFenceImage,
    sellPrice: 10,
    effects: [
        {
            name: "Stolen Fence",
            description: "Reducing damage taken by 1",
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
    description: "Restores 2 HP on wave clear",
    type: ITEM_TYPES.EQUIPMENT,
    image: safetyCharmImage,
    sellPrice: 10,
    effects: [
        {
            name: "Safety Charm",
            description: "Restores 2 HP on wave clear",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: safetyCharmImage,
            healingPerWaveClear: 2,
        },
    ],
};

export const drakeBlood: Item = {
    name: "Drake Blood",
    description: "Grants 1 attack power and 1 health per kill, but you take 1 damage per turn",
    type: ITEM_TYPES.EQUIPMENT,
    image: drakebloodImage,
    sellPrice: 10,
    effects: [
        {
            name: "Drake Blood",
            description: "Grants 1 attack power and 1 health per kill, but you take 1 damage per turn",
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

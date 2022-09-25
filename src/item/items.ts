import { thorns } from "../ability/Effects";
import { EFFECT_CLASSES, EFFECT_TYPES, TRIGGER_TARGET_TYPES } from "./../ability/types";
import {
    alligatorTubeImage,
    amethystImage,
    cactusImage,
    coffeePotImage,
    drakebloodImage,
    guideBookImage,
    hotdog,
    humilityStoneImage,
    lucksackImage,
    manualImage,
    nependeathSapImage,
    panlidImage,
    PoisonIcon,
    respawnTokenImage,
    safetyCharmImage,
    sandalsImage,
    stolenFenceImage,
    sunshinePanImage,
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
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    healthPercentage: 0.5,
                    comparator: "lt",
                },
            ],
        },
    ],
};

export const safetyCharm: Item = {
    name: "Safety Charm",
    description: "Restores 5 HP on wave clear.",
    type: ITEM_TYPES.EQUIPMENT,
    image: safetyCharmImage,
    sellPrice: 10,
    effects: [
        {
            name: "Safety Charm",
            description: "Restores 5 HP on wave clear.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: safetyCharmImage,
            onWaveClear: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                healing: 5,
            },
        },
    ],
};

export const drakeBlood: Item = {
    name: "Drake Blood",
    description: "Grants 1 attack power and 3 health per kill, but you take 1 damage per turn.",
    type: ITEM_TYPES.EQUIPMENT,
    image: drakebloodImage,
    sellPrice: 10,
    effects: [
        {
            name: "Drake Blood",
            description: "Grants 1 attack power and 3 health per kill, but you take 1 damage per turn.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: drakebloodImage,
            damage: 1,
            onTurnEnd: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                damage: 1,
            },
            onHostileDeath: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                healing: 3,
            },
        },
    ],
};

// TODO doesn't do anything yet
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
    description: "Increases maximum HP by 10.",
    type: ITEM_TYPES.EQUIPMENT,
    image: amethystImage,
    sellPrice: 10,
    effects: [
        {
            name: "Amethyst",
            description: "Increasing maximum HP by 10.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 10,
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
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                drawCards: {
                    amount: 1,
                },
            },
        },
    ],
};

export const blackScroll: Item = {
    name: "Black Scroll",
    description: "Combine 3 scrolls to attain a non-deplete ability of your choice for your class.",
    image: manualImage,
    type: ITEM_TYPES.MATERIAL,
};

export const energyStone: Item = {
    name: "Energy Stone",
    description: "Grants 1 resource every 3 turns.",
    image: humilityStoneImage,
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Energy Stone",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            resourcesPerTurn: 1,
            turnsTriggerFrequency: 3,
        },
    ],
};

// TODO doesn't do anything yet
export const guideBook: Item = {
    name: "Guide Book",
    description: "Enemy encounters now offer 1 extra ability.",
    image: guideBookImage,
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Guide Book",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onEncounterEnd: {
                abilityChoices: 1,
            },
        },
    ],
};

export const panlid: Item = {
    name: "Pan Lid",
    description: "On wave start, grants 7 armor and prevents armor decay by 1 turn",
    image: panlidImage,
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Pan Lid",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 7,
                effects: [
                    {
                        name: "Pan Lid",
                        description: "Preventing armor decay.",
                        icon: panlidImage,
                        class: EFFECT_CLASSES.BUFF,
                        type: EFFECT_TYPES.NONE,
                        preventArmorDecay: true,
                        duration: 1,
                    },
                ],
            },
        },
    ],
};

export const alligatorTube: Item = {
    name: "Alligator Tube",
    description: "Your maximum health increases by 5. You emit an aura that increases ally attack power by 2.",
    image: alligatorTubeImage,
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Alligator Tube",
            description: "Increasing maximum HP by 5.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 5,
        },
        {
            name: "Alligator Tube",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            area: 1,
            excludeEffectOwner: true,
            damage: 2,
        },
    ],
};

export const cactus: Item = {
    name: "Cactus",
    description: "You reflect 1 damage to attackers.",
    type: ITEM_TYPES.EQUIPMENT,
    image: cactusImage,
    effects: [
        {
            ...thorns,
            name: "Cactus",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
        },
    ],
};

export const nependeathSap: Item = {
    name: "Nependeath Sap",
    description: "Every three turns, your first attack inflicts poison to your primary target.",
    type: ITEM_TYPES.EQUIPMENT,
    image: nependeathSapImage,
    effects: [
        {
            name: "Nependeath Sap",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 3,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Poisonous",
                        description: "Next attack applying poison to the primary target.",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: nependeathSapImage,
                        onAttack: {
                            removeEffect: true,
                            targetType: TRIGGER_TARGET_TYPES.TARGET,
                            effects: [
                                {
                                    name: "Poison",
                                    type: EFFECT_TYPES.POISON,
                                    class: EFFECT_CLASSES.DEBUFF,
                                    icon: PoisonIcon,
                                    duration: 3,
                                    onTurnEnd: {
                                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                        damage: 2,
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};

// TODO doesn't do anything yet
export const coffeePot: Item = {
    name: "Coffee Pot",
    description: "You can now learn an ability when camping.",
    type: ITEM_TYPES.EQUIPMENT,
    image: coffeePotImage,
    effects: [
        {
            name: "Coffee Pot",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onCamp: {
                abilityChoices: 3,
            },
        },
    ],
};

export const respawnToken: Item = {
    name: "Respawn Token",
    description: "If you die, you restore 20 HP and this item is consumed.",
    type: ITEM_TYPES.EQUIPMENT,
    image: respawnTokenImage,
    effects: [
        {
            name: "Respawn Token",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeath: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                resurrect: true,
                healing: 20,
            },
        },
    ],
};

// TODO doesn't do anything yet
export const sunshinePan: Item = {
    name: "Sunshine Pan",
    description: "Restore an additional 15 HP when camping.",
    type: ITEM_TYPES.EQUIPMENT,
    image: sunshinePanImage,
    effects: [
        {
            name: "Sunshine Pan",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onCamp: {
                healing: 15,
            },
        },
    ],
};

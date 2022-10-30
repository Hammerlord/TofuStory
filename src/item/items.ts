import { poison, thorns } from "../ability/Effects";
import {
    AlligatorTubeImage,
    AmethystImage,
    BlackManualImage,
    CactusImage,
    CoffeePotImage,
    DrakeBloodImage,
    GoldenHammerImage,
    GuidebookImage,
    HotdogImage,
    HumilityStoneImage,
    LeatherSandalsImage,
    LuckSackImage,
    PanlidImage,
    RespawnTokenImage,
    SafetyCharmImage,
    SapOfNependeathImage,
    StolenFenceImage,
    SunshinePanImage,
    WeaponMasteryImage,
} from "../images";
import { Effect, EFFECT_CLASSES, EFFECT_TYPES, TRIGGER_TARGET_TYPES } from "./../ability/types";

import { Item, ITEM_TYPES } from "./types";

export const halfEatenHotdog: Item = {
    name: "Half-eaten Hot Dog",
    healing: 10,
    image: HotdogImage,
    type: ITEM_TYPES.CONSUMABLE,
};

export const stolenFence: Item = {
    name: "Stolen Fence",
    description: "Reduces damage received by 1 when health is less than half.",
    type: ITEM_TYPES.EQUIPMENT,
    image: StolenFenceImage,
    sellPrice: 10,
    effects: [
        {
            name: "Stolen Fence",
            description: "Reducing damage taken by 1.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: StolenFenceImage,
            attackDamageReceived: -1,
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
    image: SafetyCharmImage,
    sellPrice: 10,
    effects: [
        {
            name: "Safety Charm",
            description: "Restores 5 HP on wave clear.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: SafetyCharmImage,
            onWaveClear: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                healing: 5,
            },
        },
    ],
};

export const drakeBlood: Item = {
    name: "Drake Blood",
    description: "Grants 1 attack power and 3 health per kill, but you take 3 damage per turn.",
    type: ITEM_TYPES.EQUIPMENT,
    image: DrakeBloodImage,
    sellPrice: 10,
    effects: [
        {
            name: "Drake Blood",
            description: "Grants 1 attack power and 3 health per kill, but you take 3 damage per turn.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: DrakeBloodImage,
            attackPower: 1,
            lifeOnKill: 3,
            onTurnEnd: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                damage: 3,
            },
        },
    ],
};

export const luckSack: Item = {
    name: "Luck Sack",
    description: "Gain 20% more mesos.",
    type: ITEM_TYPES.EQUIPMENT,
    image: LuckSackImage,
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
    image: AmethystImage,
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

const sandalsEffect: Effect = {
    name: "Leather Sandals",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: LeatherSandalsImage,
    drawCardsPerTurn: 1,
    duration: 1,
};

export const leatherSandals: Item = {
    name: "Leather Sandals",
    description: "The quintessential footwear of aspiring adventurers. On wave start, draw an extra card.",
    type: ITEM_TYPES.EQUIPMENT,
    image: LeatherSandalsImage,
    sellPrice: 10,
    effects: [
        {
            name: "Leather Sandals",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [sandalsEffect],
            },
        },
    ],
};

export const blackScroll: Item = {
    name: "Black Scroll",
    description: "Combine 3 scrolls to attain a non-deplete ability of your choice for your class.",
    image: BlackManualImage,
    type: ITEM_TYPES.MATERIAL,
};

export const engravedStone: Item = {
    name: "Engraved Stone",
    description: "A mysterious keepsake you found on your person. When you are attacked, gain 1 resource. This may occur once per turn.",
    image: HumilityStoneImage,
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Engraved Stone",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onTurnEnd: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Vigour",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: HumilityStoneImage,
                        duration: 1,
                        onReceiveAttack: {
                            targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                            removeEffect: true,
                            resources: 1,
                        },
                    },
                ],
            },
        },
    ],
};

// TODO doesn't do anything yet
export const guideBook: Item = {
    name: "Guide Book",
    description: "Enemy encounters now offer 1 extra ability choice.",
    image: GuidebookImage,
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
    image: PanlidImage,
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Pan Lid Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 7,
                effects: [
                    {
                        name: "Pan Lid",
                        description: "Preventing armor decay.",
                        icon: PanlidImage,
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
    description: "Increases your maximum health by 5. When you summon a minion, its attack power is increased by 1.",
    image: AlligatorTubeImage,
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
            onFriendlySummon: {
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                effects: [
                    {
                        name: "Attack Power Increase",
                        icon: WeaponMasteryImage,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        attackPower: 1,
                    },
                ],
            },
        },
    ],
};

export const cactus: Item = {
    name: "Cactus",
    description: "You reflect 1 damage to attackers.",
    type: ITEM_TYPES.EQUIPMENT,
    image: CactusImage,
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
    description: "Every three turns, your first attack inflicts poison.",
    type: ITEM_TYPES.EQUIPMENT,
    image: SapOfNependeathImage,
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
                        description: "Next attack applying poison.",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: SapOfNependeathImage,
                        onAttack: {
                            removeEffect: true,
                            targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
                            effects: [{ ...poison }],
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
    image: CoffeePotImage,
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
    image: RespawnTokenImage,
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
    image: SunshinePanImage,
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

export const goldenHammer: Item = {
    name: "Golden Hammer",
    description: "Use this item to upgrade a card.",
    type: ITEM_TYPES.MATERIAL,
    image: GoldenHammerImage,
    upgradeCard: true,
};

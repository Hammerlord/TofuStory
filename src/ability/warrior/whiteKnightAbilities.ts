import {
    AdvancedChargeImage,
    BlastImage,
    BlizzardChargeImage,
    DivineChargeImage,
    ElementalForceImage,
    FlameChargeImage,
    HighPaladinImage,
    LightningChargeImage,
    ParashockGuardImage,
    ShieldMasteryImage,
} from "../../images";
import { burn, chill, stun } from "../Effects";
import {
    Ability,
    ACTION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MULTIPLIER_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../types";
import { block } from "./warriorAbilities";

export const flameCharge: Ability = {
    name: "Flame Charge",
    resourceCost: 1,
    image: FlameChargeImage,
    actions: [
        {
            damage: 5,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    ...burn,
                    duration: 3,
                },
            ],
        },
    ],
};

export const blizzardCharge: Ability = {
    name: "Blizzard Charge",
    resourceCost: 1,
    image: BlizzardChargeImage,
    actions: [
        {
            damage: 5,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            bonus: {
                damage: 3,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        hasEffectType: [EFFECT_TYPES.BURN],
                    },
                ],
            },
            effects: [
                {
                    ...chill,
                    duration: 3,
                },
            ],
        },
    ],
};

export const lightningCharge: Ability = {
    name: "Lightning Charge",
    resourceCost: 1,
    image: LightningChargeImage,
    actions: [
        {
            area: 1,
            damage: 5,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            bonus: {
                damage: 3,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        hasEffectType: [EFFECT_TYPES.CHILL],
                    },
                ],
            },
            effects: [stun],
        },
    ],
};

export const frostFire: Ability = {
    name: "Frostfire Within",
    resourceCost: 1,
    image: AdvancedChargeImage,
    actions: [
        {
            addCards: [flameCharge, blizzardCharge].map((card) => ({ ...card, removeAfterTurn: true })),
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const divineCharge: Ability = {
    name: "Divine Charge",
    resourceCost: 0,
    image: DivineChargeImage,
    description: "damage times the number of debuffs on the target",
    actions: [
        {
            damage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            bonus: {
                damage: 2,
                multiplier: {
                    type: MULTIPLIER_TYPES.DEBUFFS,
                    calculationTarget: CONDITION_TARGETS.TARGET,
                },
            },
        },
    ],
};

export const shieldMastery: Ability = {
    name: "Shield Mastery",
    resourceCost: 1,
    image: ShieldMasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            armor: 2,
            effects: [
                {
                    name: "Shield Mastery",
                    icon: ShieldMasteryImage,
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    preventArmorDecay: true,
                    armorReceived: 2,
                    duration: 1,
                },
            ],
            addCards: [block, block].map((card) => ({ ...card, removeAfterTurn: true })),
        },
    ],
};

export const blast: Ability = {
    name: "Blast",
    resourceCost: 3,
    image: BlastImage,
    description: "Reduce cost by 1 for every ability used this turn, until Blast is used or discarded.",
    onAbilityUse: {
        resourceCost: -1,
    },
    actions: [
        {
            damage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    ...burn,
                    duration: 3,
                },
                {
                    ...chill,
                    duration: 3,
                },
            ],
        },
    ],
};

export const judgment: Ability = {
    name: "Judgment",
    resourceCost: 3,
    image: HighPaladinImage,
    description:
        "Deals 1 damage multiplied by armor \n Reduce cost by 1 for every ability used this turn, until Judgment is used or discarded.",
    onAbilityUse: {
        resourceCost: -1,
    },
    actions: [
        {
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: {
                type: MULTIPLIER_TYPES.ARMOR,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
};

export const parashockGuard: Ability = {
    name: "Parashock Guard",
    resourceCost: 1,
    image: ParashockGuardImage,
    depletedOnUse: true,
    description: "(Armor gained equal to your current armor)",
    actions: [
        {
            armor: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            multiplier: {
                type: MULTIPLIER_TYPES.ARMOR,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
};

export const elementalForce: Ability = {
    name: "Elemental Force",
    resourceCost: 1,
    depletedOnUse: true,
    image: ElementalForceImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Elemental Force",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: ElementalForceImage,
                    skillBonus: [
                        {
                            skill: flameCharge.name,
                            damage: 2,
                        },
                        { skill: blizzardCharge.name, damage: 2 },
                        { skill: lightningCharge.name, damage: 2 },
                    ],
                },
            ],
        },
    ],
};

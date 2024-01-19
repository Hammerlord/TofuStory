import { BrickImage, EnergyBoltImage, MagicArmorImage, MagicClawImage, MagicGuardImage, TeleportImage } from "../../images";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../types";

export const energyBolt: Ability = {
    name: "Energy Bolt",
    image: EnergyBoltImage,
    resourceCost: 0,
    actions: [
        {
            damage: 3,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY_SIDEWINDER,
            icon: EnergyBoltImage,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            resources: 1,
        },
    ],
    upgrades: [],
};

export const magicClaw: Ability = {
    name: "Magic Claw",
    resourceCost: 3,
    image: MagicClawImage,
    description: "Attacks twice.",
    actions: [
        {
            damage: 6,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY_SIDEWINDER,
            icon: MagicClawImage,
        },
        {
            damage: 6,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY_SIDEWINDER,
            icon: MagicClawImage,
        },
    ],
    upgrades: [],
};

export const magicGuard: Ability = {
    name: "Magic Guard",
    resourceCost: 1,
    image: MagicGuardImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [
                {
                    name: "Magic Guard",
                    description: "Gaining +3 armor every turn for 3 turns",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: MagicGuardImage,
                    duration: 3,
                    onTurnEnd: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        armor: 3,
                    },
                },
            ],
        },
    ],
};

export const magicArmor: Ability = {
    name: "Magic Armor",
    resourceCost: 2,
    image: MagicArmorImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            armor: 7,
        },
    ],
};

export const teleport: Ability = {
    name: "Teleport",
    resourceCost: 1,
    image: TeleportImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            drawCards: {
                amount: 3,
            },
        },
    ],
};

export const triEnergyBolt: Ability = {
    name: "Tri Energy Bolt",
    image: EnergyBoltImage,
    resourceCost: 1,
    description: "Deal {{damage}} damage to a random enemy in the area, x3",
    actions: [
        {
            damage: 3,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY_SIDEWINDER,
            icon: EnergyBoltImage,
            targetArea: 1,
        },
        {
            damage: 3,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY_SIDEWINDER,
            icon: EnergyBoltImage,
            targetArea: 1,
        },
        {
            damage: 3,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY_SIDEWINDER,
            icon: EnergyBoltImage,
            targetArea: 1,
        },
    ],
    upgrades: [],
};

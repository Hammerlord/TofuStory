import {
    BrickImage,
    EnergyBoltImage,
    EnergyBoltProjectileImage,
    MagicArmorImage,
    MagicClawImage,
    MagicClawProjectileImage,
    MagicGuardImage,
    TeleportImage,
    TriboltImage,
} from "../../images";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    Action,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../types";

const energyBolt2: Ability = {
    name: "Energy Bolt",
    image: EnergyBoltImage,
    resourceCost: 0,
    level: 2,
    actions: [
        {
            damage: 4,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: EnergyBoltProjectileImage,
            playbackTime: 400,
            animationOptions: {
                rotate: -45,
            },
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            playbackTime: 250,
            resources: 1,
        },
    ],
};

export const energyBolt: Ability = {
    name: "Energy Bolt",
    image: EnergyBoltImage,
    resourceCost: 0,
    actions: [
        {
            damage: 2,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: EnergyBoltProjectileImage,
            playbackTime: 400,
            animationOptions: {
                rotate: -45,
            },
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            playbackTime: 250,
            resources: 1,
        },
    ],
    upgrades: [energyBolt2],
};

const magicClawAction: Action = {
    damage: 3,
    target: TARGET_TYPES.HOSTILE,
    type: ACTION_TYPES.RANGE_ATTACK,
    animation: ANIMATION_TYPES.ONE_WAY,
    icon: MagicClawProjectileImage,
    playbackTime: 400,
    bonus: {
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.ACTOR,
                hasEffect: "Charged",
            },
        ],
        damage: 2,
    },
};

const magicClaw2: Ability = {
    name: "Magic Claw",
    resourceCost: 2,
    image: MagicClawImage,
    description: "Hits twice",
    level: 2,
    actions: [
        {
            ...magicClawAction,
            damage: 4,
            bonus: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
                damage: 3,
            },
        },
        {
            ...magicClawAction,
            damage: 4,
            bonus: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
                damage: 3,
            },
        },
    ],
};

export const magicClaw: Ability = {
    name: "Magic Claw",
    resourceCost: 2,
    image: MagicClawImage,
    description: "Hits twice",
    actions: [magicClawAction, magicClawAction],
    upgrades: [magicClaw2],
};

const magicGuard2: Ability = {
    name: "Magic Guard",
    resourceCost: 1,
    image: MagicGuardImage,
    level: 2,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [
                {
                    name: "Magic Guard",
                    description: "Gaining +4 armor every turn for 3 turns",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: MagicGuardImage,
                    duration: 3,
                    onTurnEnd: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        armor: 4,
                    },
                },
            ],
        },
    ],
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
    upgrades: [magicGuard2],
};

const magicArmor2: Ability = {
    name: "Magic Armor",
    resourceCost: 2,
    image: MagicArmorImage,
    level: 2,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            armor: 9,
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
    upgrades: [magicArmor2],
};

const teleport2: Ability = {
    name: "Teleport",
    resourceCost: 0,
    image: TeleportImage,
    level: 2,
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
    upgrades: [teleport2],
};

const triboltAction = {
    damage: 2,
    target: TARGET_TYPES.RANDOM_HOSTILE,
    type: ACTION_TYPES.RANGE_ATTACK,
    animation: ANIMATION_TYPES.ONE_WAY,
    icon: EnergyBoltProjectileImage,
    playbackTime: 400,
    animationOptions: {
        rotate: -45,
    },
    targetArea: 1,
    bonus: {
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.ACTOR,
                hasEffect: "Charged",
            },
        ],
        damage: 2,
    },
};

const tribolt2: Ability = {
    name: "Tribolt",
    image: TriboltImage,
    resourceCost: 1,
    description: "Randomly hits the target or adjacent enemies, x3",
    level: 2,
    actions: [
        {
            ...triboltAction,
            damage: 3,
        },
        {
            ...triboltAction,
            damage: 3,
        },
        {
            ...triboltAction,
            damage: 3,
        },
    ],
};

export const tribolt: Ability = {
    name: "Tribolt",
    image: TriboltImage,
    resourceCost: 1,
    description: "Randomly hits the target or adjacent enemies, x3",
    actions: [triboltAction, triboltAction, triboltAction],
    upgrades: [tribolt2],
};

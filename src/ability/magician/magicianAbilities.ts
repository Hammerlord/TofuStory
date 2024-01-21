import {
    ArcaneAimImage,
    ArcaneOverdriveImage,
    ElementalAdaptationEffectImage,
    ElementalAdaptationImage,
    EnergyBoltImage,
    EnergyBoltProjectileImage,
    IgniteImage,
    LightningOrbImage,
    LightningOrbProjectileImage,
    MPEaterImage,
    MagicArmorImage,
    MagicClawImage,
    MagicClawProjectileImage,
    MagicGuardImage,
    ShimmeringStarsImage,
    StarHairPinImage,
    StarImage,
    TeleportImage,
    TeleportMasteryImage,
    TriboltImage,
    WizMushImage,
} from "../../images";
import { FireIcon } from "../../images/icons";
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
import { stun, chill } from "./../Effects";

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
                rotateToFaceTarget: true,
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
                rotateToFaceTarget: true,
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
    animationOptions: {
        rotateToFaceTarget: false,
        width: 100,
        height: 100,
    },
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
            animationOptions: {
                ...magicClawAction.animationOptions,
                mirrorX: true,
            },
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
    actions: [
        magicClawAction,
        {
            ...magicClawAction,
            animationOptions: {
                ...magicClawAction.animationOptions,
                mirrorX: true,
            },
        },
    ],
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
    resourceCost: 1,
    image: MagicArmorImage,
    level: 2,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            armor: 5,
            bonus: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
                armor: 3,
            },
        },
    ],
};

export const magicArmor: Ability = {
    name: "Magic Armor",
    resourceCost: 1,
    image: MagicArmorImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            armor: 4,
            bonus: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
                armor: 2,
            },
        },
    ],
    upgrades: [magicArmor2],
};

const teleport2: Ability = {
    name: "Teleport",
    resourceCost: 1,
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
                amount: 2,
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
        rotateToFaceTarget: true,
    },
    targetArea: 1,
    bonus: {
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.ACTOR,
                hasEffect: "Charged",
            },
        ],
        damage: 1,
    },
};

const tribolt2: Ability = {
    name: "Tribolt",
    image: TriboltImage,
    resourceCost: 1,
    description: "Randomly hits the target or its neighbors, x3",
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
    description: "Randomly hits the target or its neighbors, x3",
    actions: [triboltAction, triboltAction, triboltAction],
    upgrades: [tribolt2],
};

const mpEater2: Ability = {
    name: "Mana Eater",
    level: 2,
    image: MPEaterImage,
    resourceCost: 0,
    depletedOnUse: true,
    description: "Destroy a target's resources",
    actions: [
        {
            damage: 0,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: WizMushImage,
            animation: ANIMATION_TYPES.BEAM,
            resources: -3,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            resources: 4,
        },
    ],
};

export const mpEater: Ability = {
    name: "Mana Eater",
    image: MPEaterImage,
    resourceCost: 0,
    depletedOnUse: true,
    description: "Destroy a target's resources",
    actions: [
        {
            damage: 0,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: WizMushImage,
            animation: ANIMATION_TYPES.BEAM,
            resources: -3,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            resources: 3,
        },
    ],
    upgrades: [mpEater2],
};

const arcaneAim2: Ability = {
    name: "Arcane Aim",
    image: ArcaneAimImage,
    level: 2,
    resourceCost: 0,
    description: "Gain +1 attack power for every attack made this turn.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 1,
            },
            effects: [
                {
                    name: "Arcane Aim",
                    icon: ArcaneAimImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 1,
                    onAttack: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        effects: [
                            {
                                name: "Attack Power Increase",
                                icon: ArcaneOverdriveImage,
                                type: EFFECT_TYPES.NONE,
                                class: EFFECT_CLASSES.BUFF,
                                attackPower: 1,
                                duration: 1,
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

export const arcaneAim: Ability = {
    name: "Arcane Aim",
    image: ArcaneAimImage,
    resourceCost: 0,
    description: "Gain +1 attack power for every attack made this turn.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Arcane Aim",
                    icon: ArcaneAimImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 1,
                    onAttack: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        effects: [
                            {
                                name: "Attack Power Increase",
                                icon: ArcaneOverdriveImage,
                                type: EFFECT_TYPES.NONE,
                                class: EFFECT_CLASSES.BUFF,
                                attackPower: 1,
                                duration: 1,
                            },
                        ],
                    },
                },
            ],
        },
    ],
    upgrades: [arcaneAim2],
};

const thunderclap2: Ability = {
    name: "Thunderclap",
    image: TeleportMasteryImage,
    level: 2,
    resourceCost: 1,
    actions: [
        {
            area: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: TeleportMasteryImage,
            effects: [stun],
        },
    ],
};

export const thunderclap: Ability = {
    name: "Thunderclap",
    image: TeleportMasteryImage,
    resourceCost: 1,
    actions: [
        {
            area: 1,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: TeleportMasteryImage,
            effects: [stun],
        },
    ],
    upgrades: [thunderclap2],
};

const ignite2: Ability = {
    name: "Ignite",
    image: IgniteImage,
    level: 2,
    resourceCost: 1,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            bonus: {
                area: 1,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
            },
            effects: [
                {
                    name: "Burn",
                    type: EFFECT_TYPES.BURN,
                    class: EFFECT_CLASSES.DEBUFF,
                    duration: 4,
                    icon: FireIcon,
                },
            ],
        },
    ],
};

export const ignite: Ability = {
    name: "Ignite",
    image: IgniteImage,
    resourceCost: 1,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            bonus: {
                area: 1,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
            },
            effects: [
                {
                    name: "Burn",
                    type: EFFECT_TYPES.BURN,
                    class: EFFECT_CLASSES.DEBUFF,
                    duration: 3,
                    icon: FireIcon,
                },
            ],
        },
    ],
    upgrades: [ignite2],
};

const frostBarrier2: Ability = {
    name: "Frost Barrier",
    image: ElementalAdaptationImage,
    resourceCost: 2,
    description: "Attackers are Chilled for 3 turns.",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            armor: 7,
            effects: [
                {
                    name: "Frost Barrier",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: ElementalAdaptationImage,
                    duration: 3,
                    onReceiveAttack: {
                        targetType: TRIGGER_TARGET_TYPES.ACTOR,
                        effects: [
                            {
                                ...chill,
                                duration: 3,
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

export const frostBarrier: Ability = {
    name: "Frost Barrier",
    image: ElementalAdaptationImage,
    resourceCost: 2,
    description: "Attackers are Chilled for 2 turns.",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            armor: 5,
            effects: [
                {
                    name: "Frost Barrier",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: ElementalAdaptationImage,
                    image: ElementalAdaptationEffectImage,
                    duration: 2,
                    onReceiveAttack: {
                        targetType: TRIGGER_TARGET_TYPES.ACTOR,
                        effects: [
                            {
                                ...chill,
                                duration: 3,
                            },
                        ],
                    },
                },
            ],
        },
    ],
    upgrades: [frostBarrier2],
};

const chainLightning2: Ability = {
    name: "Chain Lightning",
    image: LightningOrbImage,
    level: 2,
    resourceCost: 2,
    actions: [
        {
            damage: 9,
            secondaryDamage: 6,
            targetArea: 5,
            numTargets: 5,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            ricochet: true,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN,
            icon: LightningOrbProjectileImage,
            animationOptions: {
                width: 70,
                height: 70,
                opacity: 0.8,
            },
            bonus: {
                damage: 3,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
            },
        },
    ],
};

export const chainLightning: Ability = {
    name: "Chain Lightning",
    image: LightningOrbImage,
    resourceCost: 2,
    actions: [
        {
            damage: 7,
            secondaryDamage: 5,
            targetArea: 5,
            numTargets: 5,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            ricochet: true,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN,
            icon: LightningOrbProjectileImage,
            animationOptions: {
                width: 70,
                height: 70,
                opacity: 0.8,
            },
            bonus: {
                damage: 2,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
            },
        },
    ],
    upgrades: [chainLightning2],
};

export const swift: Ability = {
    name: "Swift",
    image: StarImage,
    resourceCost: 0,
    actions: [
        {
            damage: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN,
            icon: StarImage,
            animationOptions: {
                width: 70,
                height: 70,
            },
        },
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            drawCards: {
                amount: 1,
            },
        },
    ],
};

const shootingStars2: Ability = {
    name: "Shooting Stars",
    resourceCost: 1,
    level: 2,
    depletedOnUse: true,
    image: ShimmeringStarsImage,
    actions: [
        {
            addCards: [swift, swift, swift],
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const shootingStars: Ability = {
    name: "Shooting Stars",
    resourceCost: 1,
    depletedOnUse: true,
    image: ShimmeringStarsImage,
    actions: [
        {
            addCards: [swift, swift],
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
        },
    ],
    upgrades: [shootingStars2],
};

const fallingStar: Action = {
    type: ACTION_TYPES.RANGE_ATTACK,
    animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
    target: TARGET_TYPES.RANDOM_HOSTILE,
    icon: StarImage,
    damage: 2,
    playbackTime: 400,
};

const wishUponAStar2: Ability = {
    name: "Wish Upon A Star",
    resourceCost: 1,
    image: StarHairPinImage,
    level: 2,
    description: "On card draw, cast a star for 3 damage. On deck recycle, cast more stars.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Wish",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: StarHairPinImage,
                    duration: 3,
                    description: "Shooting stars on card draw and deck cycle.",
                    onDrawCard: {
                        ability: {
                            name: "Falling Star",
                            image: StarImage,
                            actions: [
                                {
                                    ...fallingStar,
                                    damage: 3,
                                },
                            ],
                        },
                    },
                    onDeckCycle: {
                        ability: {
                            name: "Star Shower",
                            image: StarImage,
                            actions: [
                                {
                                    ...fallingStar,
                                    area: 1,
                                    damage: 3,
                                },
                            ],
                        },
                    },
                },
            ],
        },
    ],
};

export const wishUponAStar: Ability = {
    name: "Wish Upon A Star",
    resourceCost: 1,
    image: StarHairPinImage,
    description: "On card draw, cast a star for 2 damage. On deck recycle, cast more stars.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Wish",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: StarHairPinImage,
                    duration: 3,
                    description: "Shooting stars on card draw and deck cycle.",
                    onDrawCard: {
                        ability: {
                            name: "Falling Star",
                            image: StarImage,
                            actions: [fallingStar],
                        },
                    },
                    onDeckCycle: {
                        ability: {
                            name: "Star Shower",
                            image: StarImage,
                            actions: [
                                {
                                    ...fallingStar,
                                    area: 1,
                                },
                            ],
                        },
                    },
                },
            ],
        },
    ],
};

import {
    ArcaneAimImage,
    ArcaneOverdriveImage,
    BlueRushImage,
    ChocolateCupcakeImage,
    ElementalAdaptationEffectImage,
    ElementalAdaptationImage,
    EnergyBoltImage,
    EnergyBoltProjectileImage,
    FireArrowImage,
    FireArrowProjectileImage,
    IgniteImage,
    LightningOrbImage,
    LightningOrbProjectileImage,
    MPEaterImage,
    MagicArmorImage,
    MagicClawImage,
    MagicClawProjectileImage,
    MagicFangProjectileImage,
    MagicGuardImage,
    OldEnergyBoltImage,
    ParfaitCupcakeImage,
    PieceOfBirthdayCakeImage,
    ShimmeringStarsImage,
    StarHairPinImage,
    StarImage,
    StarfishIdleImage,
    StarfishImage,
    TeleportImage,
    TeleportMasteryImage,
    TriboltImage,
    WizMushImage,
} from "../../images";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    Action,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../types";
import { burn, chill, stun } from "./../Effects";

const energyBolt2: Ability = {
    name: "Energy Bolt",
    image: OldEnergyBoltImage,
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
    image: OldEnergyBoltImage,
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

const magicFang2: Ability = {
    name: "Magic Fang",
    image: BlueRushImage,
    level: 2,
    resourceCost: 1,
    actions: [
        {
            area: 1,
            damage: 6,
            secondaryDamage: 5,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: MagicFangProjectileImage,
            playbackTime: 400,
            animationOptions: {
                rotateToFaceTarget: true,
                width: 100,
            },
            bonus: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
                damage: 2,
            },
        },
    ],
};

export const magicFang: Ability = {
    name: "Magic Fang",
    image: BlueRushImage,
    resourceCost: 1,
    actions: [
        {
            area: 1,
            damage: 4,
            secondaryDamage: 3,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: MagicFangProjectileImage,
            playbackTime: 400,
            animationOptions: {
                rotateToFaceTarget: true,
                width: 100,
            },
            bonus: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
                damage: 2,
            },
        },
    ],
    upgrades: [magicFang2],
};

const magicClawAction: Action = {
    damage: 4,
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
            damage: 5,
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
            damage: 5,
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

const triboltAction: Action = {
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
        damage: 2,
    },
};

const tribolt2Action: Action = {
    ...triboltAction,
    damage: 3,
    bonus: {
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.ACTOR,
                hasEffect: "Charged",
            },
        ],
        damage: 3,
    },
};

const tribolt2: Ability = {
    name: "Tribolt",
    image: TriboltImage,
    resourceCost: 1,
    description: "Randomly hits the target or its neighbors, x3",
    level: 2,
    actions: [tribolt2Action, tribolt2Action, tribolt2Action],
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
            damage: 3,
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
            damage: 1,
            area: 2,
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
            damage: 4,
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
                    ...burn,
                    duration: 4,
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
            damage: 3,
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
                    ...burn,
                    duration: 3,
                },
            ],
        },
    ],
    upgrades: [ignite2],
};

const frostBarrier2: Ability = {
    name: "Frost Barrier",
    image: ElementalAdaptationImage,
    resourceCost: 1,
    description: "Attackers are Chilled for 2 turns.",
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
                    duration: 4,
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
    resourceCost: 1,
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
    resourceCost: 0,
    level: 2,
    depletedOnUse: true,
    image: ShimmeringStarsImage,
    actions: [
        {
            addCards: [swift, swift],
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
    upgrades: [wishUponAStar2],
};

const fireArrow2: Ability = {
    name: "Fire Arrow",
    image: FireArrowImage,
    resourceCost: 2,
    description: "on the target's neighbors if the target is Burning.",
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: FireArrowProjectileImage,
            damage: 15,
            animationOptions: {
                height: 90,
            },
        },
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            conditions: [
                {
                    calculationTarget: CONDITION_TARGETS.TARGET,
                    hasEffectType: [EFFECT_TYPES.BURN],
                },
            ],
            excludePrimaryTarget: true,
            effects: [
                {
                    ...burn,
                    duration: 4,
                },
            ],
            area: 1,
        },
    ],
};

export const fireArrow: Ability = {
    name: "Fire Arrow",
    image: FireArrowImage,
    resourceCost: 2,
    description: "on the target's neighbors if the target is Burning.",
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: FireArrowProjectileImage,
            damage: 12,
            animationOptions: {
                height: 90,
            },
        },
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            conditions: [
                {
                    calculationTarget: CONDITION_TARGETS.TARGET,
                    hasEffectType: [EFFECT_TYPES.BURN],
                },
            ],
            excludePrimaryTarget: true,
            effects: [
                {
                    ...burn,
                    duration: 3,
                },
            ],
            area: 1,
        },
    ],
    upgrades: [fireArrow2],
};

const parfaitCupcake2: Ability = {
    name: "Parfait Cupcake",
    resourceCost: 0,
    image: ParfaitCupcakeImage,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            resources: 3,
        },
    ],
};

const parfaitCupcake: Ability = {
    name: "Parfait Cupcake",
    resourceCost: 0,
    image: ParfaitCupcakeImage,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            resources: 2,
        },
    ],
};

const chocolateCupcake2: Ability = {
    name: "Chocolate Cupcake",
    resourceCost: 0,
    image: ChocolateCupcakeImage,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            healing: 5,
            armor: 5,
        },
    ],
};

const chocolateCupcake: Ability = {
    name: "Chocolate Cupcake",
    resourceCost: 0,
    image: ChocolateCupcakeImage,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            healing: 3,
            armor: 3,
        },
    ],
};

const pieceOfCake2: Ability = {
    name: "Piece Of Cake",
    resourceCost: 0,
    image: PieceOfBirthdayCakeImage,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Attack Power Increase",
                    icon: ArcaneOverdriveImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 3,
                    duration: 1,
                },
            ],
        },
    ],
};

const pieceOfCake: Ability = {
    name: "Piece Of Cake",
    resourceCost: 0,
    image: PieceOfBirthdayCakeImage,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Attack Power Increase",
                    icon: ArcaneOverdriveImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 2,
                    duration: 1,
                },
            ],
        },
    ],
};

const conjureTreat2: Ability = {
    name: "Conjure Treat",
    level: 2,
    resourceCost: 1,
    description: "Conjure a treat.",
    image: ParfaitCupcakeImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.PRESET_CARDS,
                cards: [parfaitCupcake2, chocolateCupcake2, pieceOfCake2],
            },
        },
    ],
};

export const conjureTreat: Ability = {
    name: "Conjure Treat",
    resourceCost: 1,
    description: "Conjure a treat.",
    image: ParfaitCupcakeImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.PRESET_CARDS,
                cards: [parfaitCupcake, chocolateCupcake, pieceOfCake],
            },
        },
    ],
    upgrades: [conjureTreat2],
};

const avatarOfTheStars2: Ability = {
    name: "Avatar Of The Stars",
    level: 2,
    image: StarfishImage,
    depletedOnUse: true,
    resourceCost: 1,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Avatar Of The Stars",
                    icon: StarfishImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    lifeOnHit: 1,
                    duration: 3,
                    description: "When you use an ability that costs 1 or more mana, add Swift to your hand.",
                    onAbility: {
                        conditions: [
                            {
                                comparator: "gt",
                                resourceCost: 0,
                                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            },
                        ],
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        addCards: [{ ...swift, removeAfterTurn: true }],
                    },
                },
            ],
        },
    ],
};

export const avatarOfTheStars: Ability = {
    name: "Avatar Of The Stars",
    image: StarfishImage,
    depletedOnUse: true,
    resourceCost: 2,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Avatar Of The Stars",
                    icon: StarfishImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    lifeOnHit: 1,
                    duration: 3,
                    portrait: StarfishIdleImage,
                    description: "When you use an ability that costs 1 or more mana, add Swift to your hand.",
                    onAbility: {
                        conditions: [
                            {
                                comparator: "gt",
                                resourceCost: 0,
                                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            },
                        ],
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        addCards: [{ ...swift, removeAfterTurn: true }],
                    },
                },
            ],
        },
    ],
    upgrades: [avatarOfTheStars2],
};

export const empoweredBolt2: Ability = {
    name: "Empowered Bolt",
    image: EnergyBoltImage,
    level: 2,
    resourceCost: 1,
    actions: [
        {
            damage: 8,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: EnergyBoltProjectileImage,
            playbackTime: 400,
            animationOptions: {
                rotate: -45,
                rotateToFaceTarget: true,
                width: 100,
                height: 100,
            },
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Empowered Bolt",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: EnergyBoltImage,
                    skillBonus: [
                        {
                            comparator: "includes",
                            skill: "bolt",
                            damage: 1,
                        },
                    ],
                },
            ],
        },
    ],
};

export const empoweredBolt: Ability = {
    name: "Empowered Bolt",
    image: EnergyBoltImage,
    resourceCost: 1,
    actions: [
        {
            damage: 5,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: EnergyBoltProjectileImage,
            playbackTime: 400,
            animationOptions: {
                rotate: -45,
                rotateToFaceTarget: true,
                width: 100,
                height: 100,
            },
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Empowered Bolt",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: EnergyBoltImage,
                    skillBonus: [
                        {
                            comparator: "includes",
                            skill: "bolt",
                            damage: 1,
                        },
                    ],
                },
            ],
        },
    ],
    upgrades: [empoweredBolt2],
};

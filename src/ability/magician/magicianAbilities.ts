import {
    AdvancedChargeImage,
    ArcaneAimImage,
    BigSnowballImage,
    BlueRushImage,
    CakeTemptationImage,
    ChocolateCupcakeImage,
    ChocolateMuffinImage,
    ColdBeamImage,
    ColdBeamProjectileImage,
    DoTPunisherImage,
    ElementalAdaptationEffectImage,
    ElementalAdaptationFPImage,
    ElementalAdaptationImage,
    EliteFirebrandImage,
    EliteFirebrandMoveImage,
    EmptySackImage,
    EnergyBoltImage,
    EnergyBoltProjectileImage,
    FireArrowImage,
    FireArrowProjectileImage,
    FireMarbleImage,
    FlameHazeImage,
    GlisteningStarImage,
    HighWisdomImage,
    HolyMagicShellImage,
    IcicleImage,
    IcicleMinionImage,
    IciclesPortraitImage,
    IgniteImage,
    InfinityImage,
    InkSackImage,
    LightningOrbImage,
    LightningOrbProjectileImage,
    LunarPiecesImage,
    MPEaterImage,
    MagicArmorImage,
    MagicArmorOldImage,
    MagicBoosterImage,
    MagicClawImage,
    MagicClawProjectileImage,
    MagicFangProjectileImage,
    MagicGuardImage,
    ManaImage,
    MetalBucketSnowmanImage,
    NimbleJewelImage,
    OldEnergyBoltImage,
    ParalyzeImage,
    ParfaitCupcakeImage,
    PepeRollingASnowballImage,
    PieceOfBirthdayCakeImage,
    PurpleEnergyBoltImage,
    PurpleEnergyBoltProjectileImage,
    PurpleFlyingBookIconImage,
    PurpleFlyingBookImage,
    PurpleInfinityImage,
    ScarfSnowmanImage,
    ShimmeringStarsImage,
    SnowballImage,
    StarHairPinImage,
    StarImage,
    StarfallMagicSquareImage,
    StarfishIdleImage,
    StarfishImage,
    StrawHatSnowmanImage,
    TeleportImage,
    TeleportMasteryFireImage,
    TeleportMasteryImage,
    ThunderBoltImage,
    ThunderBoltProjectileImage,
    ThunderBreakImage,
    ThunderSparkImage,
    TriboltImage,
    WizMushImage,
} from "../../images";
import { ShieldIcon, SnowflakeIcon } from "../../images/icons";
import { RARITIES } from "../../item/types";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    AUTO_CAST_ABILITY_TYPES,
    Ability,
    Action,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    MULTIPLIER_TYPES,
    Minion,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../types";
import { armorUp, burn, chill, freeze, stun, preventArmorDecay } from "./../Effects";

const energyBolt2: Ability = {
    name: "Energy Bolt",
    image: OldEnergyBoltImage,
    resourceCost: 0,
    rarity: RARITIES.COMMON,
    level: 2,
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
            },
        },
    ],
};

export const energyBolt: Ability = {
    name: "Energy Bolt",
    image: OldEnergyBoltImage,
    resourceCost: 0,
    rarity: RARITIES.COMMON,
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
    ],
    upgrades: [energyBolt2],
};

const magicFang2: Ability = {
    name: "Magic Fang",
    image: BlueRushImage,
    level: 2,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    actions: [
        {
            area: 1,
            damage: 5,
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
                damage: 3,
            },
        },
    ],
};

export const magicFang: Ability = {
    name: "Magic Fang",
    image: BlueRushImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    actions: [
        {
            area: 1,
            damage: 3,
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
    rarity: RARITIES.COMMON,
    actions: [
        {
            ...magicClawAction,
            damage: 6,
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
            damage: 6,
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
    rarity: RARITIES.COMMON,
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
    rarity: RARITIES.COMMON,
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
    ...magicGuard2,
    level: 1,
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
    image: MagicArmorOldImage,
    rarity: RARITIES.COMMON,
    level: 2,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            armor: 8,
        },
    ],
};

export const magicArmor: Ability = {
    name: "Magic Armor",
    resourceCost: 1,
    image: MagicArmorOldImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            armor: 5,
        },
    ],
    upgrades: [magicArmor2],
};

const barrier2: Ability = {
    name: "Barrier",
    resourceCost: 1,
    image: MagicArmorImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            armor: 10,
            bonus: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
                armor: 4,
            },
        },
    ],
};

export const barrier: Ability = {
    name: "Barrier",
    resourceCost: 1,
    image: MagicArmorImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            armor: 7,
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
    upgrades: [barrier2],
};

const teleport2: Ability = {
    name: "Teleport",
    resourceCost: 1,
    image: TeleportImage,
    rarity: RARITIES.COMMON,
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
    rarity: RARITIES.COMMON,
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
    damage: 3,
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
};

const tribolt2Action: Action = {
    ...triboltAction,
    damage: 4,
};

const tribolt2: Ability = {
    name: "Tribolt",
    image: TriboltImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    description: "Randomly hits the target or its neighbors, x3",
    level: 2,
    actions: [tribolt2Action, tribolt2Action, tribolt2Action],
};

export const tribolt: Ability = {
    name: "Tribolt",
    image: TriboltImage,
    rarity: RARITIES.COMMON,
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
    rarity: RARITIES.RARE,
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
};

export const mpEater: Ability = {
    name: "Mana Eater",
    image: MPEaterImage,
    resourceCost: 0,
    depletedOnUse: true,
    rarity: RARITIES.RARE,
    description: "Destroy up to 2 resources on the target",
    actions: [
        {
            damage: 0,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: WizMushImage,
            animation: ANIMATION_TYPES.BEAM,
            resources: -2,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            resources: 2,
        },
    ],
    upgrades: [mpEater2],
};

const arcaneAiming: Effect = {
    name: "Arcane Aim",
    icon: ArcaneAimImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    duration: 0,
    attackPower: 1,
    onAttack: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                name: "Arcane Aiming",
                icon: ArcaneAimImage,
                disableDisplayIcon: true,
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                attackPower: 1,
                duration: 1,
            },
        ],
    },
};

const arcaneAim2: Ability = {
    name: "Arcane Aim",
    image: ArcaneAimImage,
    level: 2,
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    description: "Gain +1 attack power for every attack made this turn.",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 1,
            },
            effects: [arcaneAiming],
        },
    ],
};

export const arcaneAim: Ability = {
    name: "Arcane Aim",
    image: ArcaneAimImage,
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    description: "Gain +1 attack power for every attack made this turn.",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [arcaneAiming],
        },
    ],
    upgrades: [arcaneAim2],
};

const thunderclap2: Ability = {
    name: "Thunderclap",
    image: TeleportMasteryImage,
    level: 2,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    actions: [
        {
            damage: 2,
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
    rarity: RARITIES.COMMON,
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
    upgrades: [thunderclap2],
};

const ignite2: Ability = {
    name: "Ignite",
    image: IgniteImage,
    level: 2,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    actions: [
        {
            area: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
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

export const ignite: Ability = {
    name: "Ignite",
    image: IgniteImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    actions: [
        {
            area: 1,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
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
    level: 2,
    rarity: RARITIES.UNCOMMON,
    description: "Attackers are Chilled for 2 turns.",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            armor: 8,
            effects: [
                {
                    name: "Frost Barrier",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: ElementalAdaptationImage,
                    duration: 2,
                    maxApplications: 1,
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
    ...frostBarrier2,
    level: 1,
    actions: [
        {
            ...frostBarrier2.actions[0],
            armor: 5,
        },
    ],
    upgrades: [frostBarrier2],
};

const chainLightning2: Ability = {
    name: "Chain Lightning",
    image: LightningOrbImage,
    level: 2,
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            damage: 10,
            secondaryDamage: 7,
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
                flash: 200,
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
    ...chainLightning2,
    level: 1,
    actions: [
        {
            ...chainLightning2.actions[0],
            damage: 8,
            secondaryDamage: 5,
        },
    ],
    upgrades: [chainLightning2],
};

export const swift: Ability = {
    name: "Swift",
    image: StarImage,
    resourceCost: 0,
    removeAfterTurn: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            damage: 3,
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
            healing: 1,
        },
    ],
};

const shootingStars2: Ability = {
    name: "Shooting Stars",
    resourceCost: 0,
    level: 2,
    depletedOnUse: true,
    image: ShimmeringStarsImage,
    rarity: RARITIES.UNCOMMON,
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
    rarity: RARITIES.UNCOMMON,
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
    rarity: RARITIES.COMMON,
    description: "Fling 2-damage stars on draw or deck cycle.",
    depletedOnUse: true,
    preemptive: true,
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

export const wishUponAStar: Ability = {
    ...wishUponAStar2,
    level: 1,
    preemptive: false,
    description: "Fling 2-damage stars on draw or deck cycle.",
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
    rarity: RARITIES.UNCOMMON,
    level: 2,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: FireArrowProjectileImage,
            damage: 13,
            animationOptions: {
                height: 90,
                rotateToFaceTarget: true,
            },
            effects: [
                {
                    ...burn,
                    duration: 3,
                },
            ],
            bonus: [
                {
                    conditions: [
                        {
                            calculationTarget: CONDITION_TARGETS.TARGET,
                            hasEffectType: [EFFECT_TYPES.BURN],
                        },
                    ],
                    damage: 5,
                },
            ],
        },
    ],
};

export const fireArrow: Ability = {
    ...fireArrow2,
    level: 1,
    actions: [
        {
            ...fireArrow2.actions[0],
            damage: 10,
            bonus: [
                {
                    conditions: [
                        {
                            calculationTarget: CONDITION_TARGETS.TARGET,
                            hasEffectType: [EFFECT_TYPES.BURN],
                        },
                    ],
                    damage: 3,
                },
            ],
        },
    ],
    upgrades: [fireArrow2],
};

const parfaitCupcake2: Ability = {
    name: "Parfait Cupcake",
    resourceCost: 0,
    image: ParfaitCupcakeImage,
    removeAfterTurn: true,
    level: 2,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            resources: 2,
            armor: 3,
        },
    ],
};

const parfaitCupcake: Ability = {
    ...parfaitCupcake2,
    level: 1,
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
    removeAfterTurn: true,
    level: 2,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            healing: 5,
        },
    ],
};

const chocolateCupcake: Ability = {
    ...chocolateCupcake2,
    level: 1,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            healing: 3,
        },
    ],
};

const pieceOfCake2: Ability = {
    name: "Piece Of Cake",
    resourceCost: 0,
    image: PieceOfBirthdayCakeImage,
    removeAfterTurn: true,
    level: 2,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Cake",
                    icon: PieceOfBirthdayCakeImage,
                    disableDisplayIcon: true,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 1,
                },
            ],
        },
    ],
};

const pieceOfCake: Ability = {
    ...pieceOfCake2,
    level: 1,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Cake",
                    icon: PieceOfBirthdayCakeImage,
                    disableDisplayIcon: true,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 1,
                    duration: 5,
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
    rarity: RARITIES.UNCOMMON,
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
    rarity: RARITIES.UNCOMMON,
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
    rarity: RARITIES.RARE,
    depletedOnUse: true,
    resourceCost: 1,
    description: "When you use an ability that costs 1 or more mana, add Swift to your hand.",
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
                    maxApplications: 1,
                    duration: 3,
                    override: {
                        portrait: StarfishIdleImage,
                    },
                    description: "When you use an ability that costs 1 or more mana, add Swift to your hand.",
                    onOffensiveAbility: {
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
    ...avatarOfTheStars2,
    name: "Avatar Of The Stars",
    level: 1,
    resourceCost: 2,
    upgrades: [avatarOfTheStars2],
};

export const greaterBolt2: Ability = {
    name: "Greater Bolt",
    image: EnergyBoltImage,
    level: 2,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    description: "While you own this card, 'bolt' abilities gain +1 damage. Greater Bolt benefits twice.",
    effectsWhileOwned: [
        {
            name: "Greater Bolt",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            skillBonus: [
                {
                    comparator: "includes",
                    skill: "bolt",
                    damage: 1,
                },
                {
                    comparator: "includes",
                    skill: "greater bolt",
                    damage: 1,
                },
            ],
        },
    ],
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
    ],
};

export const greaterBolt: Ability = {
    ...greaterBolt2,
    level: 1,
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
    ],
    upgrades: [greaterBolt2],
};

const throwTheBook2: Ability = {
    name: "Throw The Book",
    level: 2,
    image: PurpleFlyingBookIconImage,
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    description: "Deals damage equal to the amount of cards you own",
    actions: [
        {
            damage: 1,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN,
            icon: PurpleFlyingBookImage,
            playbackTime: 400,
            animationOptions: {
                rotateToFaceTarget: true,
                width: 300,
                height: 100,
            },
            multiplier: {
                type: MULTIPLIER_TYPES.ALL_CARDS,
                value: 1,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
    upgrades: [],
};

export const throwTheBook: Ability = {
    ...throwTheBook2,
    level: 1,
    resourceCost: 3,
    upgrades: [throwTheBook2],
};

const magicBooster2: Ability = {
    name: "Magic Booster",
    image: MagicBoosterImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: MagicBoosterImage,
            drawCards: {
                amount: 2,
                effects: {
                    resourceCost: -1,
                },
                filters: [ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK],
            },
        },
    ],
};

export const magicBooster: Ability = {
    name: "Magic Booster",
    image: MagicBoosterImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: MagicBoosterImage,
            drawCards: {
                amount: 2,
                filters: [ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK],
            },
        },
    ],
    upgrades: [magicBooster2],
};

const coldBeam2: Ability = {
    name: "Cold Beam",
    image: ColdBeamImage,
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    level: 2,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: ColdBeamProjectileImage,
            damage: 8,
            animationOptions: {
                height: 100,
                rotateToFaceTarget: true,
            },
            area: 1,
            effects: [
                {
                    ...chill,
                    duration: 3,
                },
            ],
            bonus: [
                {
                    conditions: [
                        {
                            calculationTarget: CONDITION_TARGETS.ACTOR,
                            hasEffect: "Charged",
                        },
                    ],
                    effects: [
                        {
                            ...freeze,
                        },
                    ],
                },
            ],
        },
    ],
};

export const coldBeam: Ability = {
    ...coldBeam2,
    level: 1,
    actions: [
        {
            ...coldBeam2.actions[0],
            damage: 6,
        },
    ],
    upgrades: [coldBeam2],
};

const reboundingShard2: Ability = {
    name: "Rebounding Shard",
    image: NimbleJewelImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    reusable: true,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: NimbleJewelImage,
            animation: ANIMATION_TYPES.YOYO,
            damage: 11,
        },
    ],
};

export const reboundingShard: Ability = {
    name: "Rebounding Shard",
    image: NimbleJewelImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    reusable: true,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: NimbleJewelImage,
            animation: ANIMATION_TYPES.YOYO,
            damage: 8,
        },
    ],
    upgrades: [reboundingShard2],
};

const thunderBolt2: Ability = {
    name: "Thunder Bolt",
    image: ThunderBoltImage,
    level: 2,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    description: "Charged: Cast again for 3 damage",
    actions: [
        {
            damage: 6,
            area: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: ThunderBoltProjectileImage,
            animationOptions: {
                height: 250,
                width: 60,
                flash: 200,
            },
        },
        {
            damage: 3,
            area: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: ThunderBoltProjectileImage,
            animationOptions: {
                height: 175,
                width: 40,
                flash: 200,
            },
            conditions: [
                {
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                    hasEffect: "Charged",
                },
            ],
        },
    ],
};

export const thunderBolt: Ability = {
    ...thunderBolt2,
    level: 1,
    description: "Charged: Cast again for 2 damage",
    actions: [
        {
            damage: 4,
            area: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: ThunderBoltProjectileImage,
            animationOptions: {
                height: 250,
                width: 60,
                flash: 200,
            },
        },
        {
            damage: 2,
            area: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: ThunderBoltProjectileImage,
            animationOptions: {
                height: 175,
                width: 40,
                flash: 200,
            },
            conditions: [
                {
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                    hasEffect: "Charged",
                },
            ],
        },
    ],
    upgrades: [thunderBolt2],
};

const slimmingMuffin2: Ability = {
    name: "Conjured Slimming Muffin",
    image: ChocolateMuffinImage,
    level: 2,
    resourceCost: 0,
    rarity: RARITIES.COMMON,
    description: "Deplete a card in your hand to use this.",
    selectCards: {
        type: SELECT_CARD_TYPES.DEPLETE_FROM_HAND,
    },
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            healing: 5,
            drawCards: {
                amount: 2,
                effects: {
                    resourceCost: -1,
                },
            },
        },
    ],
};

export const slimmingMuffin: Ability = {
    name: "Conjured Slimming Muffin",
    image: ChocolateMuffinImage,
    resourceCost: 0,
    rarity: RARITIES.COMMON,
    description: "Deplete a card in your hand to use this.",
    selectCards: {
        type: SELECT_CARD_TYPES.DEPLETE_FROM_HAND,
    },
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            healing: 3,
            drawCards: {
                amount: 1,
                effects: {
                    resourceCost: -1,
                },
            },
        },
    ],
    upgrades: [slimmingMuffin2],
};

const aurora2: Ability = {
    name: "Aurora",
    image: HighWisdomImage,
    level: 2,
    resourceCost: 5,
    rarity: RARITIES.UNCOMMON,
    description: "Reduce cost by 1 for every ability used this turn, until Aurora is used or discarded.",
    onAbilityUse: {
        resourceCost: -1,
    },
    actions: [
        {
            damage: 10,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 2,
            icon: HighWisdomImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
        },
    ],
};

export const aurora: Ability = {
    ...aurora2,
    level: 1,
    actions: [
        {
            damage: 8,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 2,
            icon: HighWisdomImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
        },
    ],
    upgrades: [aurora2],
};

const feedback2: Ability = {
    name: "Feedback",
    image: TeleportMasteryFireImage,
    level: 2,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    description: "Gain 1 Mana and self-inflict 1 damage per enemy struck.",
    actions: [
        {
            damage: 0,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            area: 2,
            icon: TeleportMasteryFireImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            secondaryAction: {
                target: "actor",
                resources: 1,
                flatDamage: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.NUM_AFFECTED_TARGETS,
                },
            },
        },
    ],
};

export const feedback: Ability = {
    ...feedback2,
    level: 1,
    name: "Feedback",
    actions: [
        {
            ...feedback2.actions[0],
            area: 1,
        },
    ],
    upgrades: [feedback2],
};

export const metronome: Ability = {
    name: "Metronome",
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    image: InfinityImage,
    description: "Cast 2 random spells.",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: InfinityImage,
            autoCastAbilities: {
                type: AUTO_CAST_ABILITY_TYPES.FROM_CLASS,
                amount: 2,
            },
        },
    ],
};

const arcaneChanneling2: Ability = {
    name: "Arcane Channeling",
    level: 2,
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    depletedOnUse: true,
    image: ThunderBreakImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            addCards: [greaterBolt2, greaterBolt2, greaterBolt2].map((ability) => ({ ...ability, removeAfterTurn: true })),
        },
    ],
};

export const arcaneChanneling: Ability = {
    name: "Arcane Channeling",
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    depletedOnUse: true,
    image: ThunderBreakImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            addCards: [greaterBolt, greaterBolt, greaterBolt].map((ability) => ({ ...ability, removeAfterTurn: true })),
        },
    ],
    upgrades: [arcaneChanneling2],
};

export const polymorph: Ability = {
    name: "Polymorph",
    resourceCost: 2,
    rarity: RARITIES.RARE,
    image: ScarfSnowmanImage,
    description: "Sets targets' base attack to 1.",
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            effects: [
                {
                    name: "Polymorph",
                    icon: ScarfSnowmanImage,
                    description: "Transformed into a Snowman!",
                    duration: 2,
                    override: {
                        portrait: [ScarfSnowmanImage, StrawHatSnowmanImage, MetalBucketSnowmanImage],
                        damage: 1,
                    },
                    type: EFFECT_TYPES.SILENCE,
                    class: EFFECT_CLASSES.DEBUFF,
                    bypassImmunity: true,
                },
            ],
        },
    ],
};

const goutOfFlame2: Ability = {
    name: "Gout Of Flame",
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    image: DoTPunisherImage,
    level: 2,
    description: "When drawn, Burn a random enemy.",
    onDraw: {
        ability: {
            name: "Flame Gout",
            image: DoTPunisherImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    icon: FireMarbleImage,
                    effects: [
                        {
                            ...burn,
                            duration: 3,
                        },
                    ],
                },
            ],
        },
    },
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: FireMarbleImage,
            damage: 3,
            effects: [
                {
                    ...burn,
                    duration: 3,
                },
            ],
        },
    ],
};

export const goutOfFlame: Ability = {
    ...goutOfFlame2,
    level: 1,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: FireMarbleImage,
            animation: ANIMATION_TYPES.ONE_WAY,
            effects: [
                {
                    ...burn,
                    duration: 3,
                },
            ],
        },
    ],
    upgrades: [goutOfFlame2],
};

const temporalBag2: Ability = {
    name: "Temporal Bag",
    resourceCost: 0,
    rarity: RARITIES.COMMON,
    image: EmptySackImage,
    level: 2,
    description: "Place up to 3 cards from your hand on top of your deck.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.HAND_TO_TOP_DECK,
                maxAmount: 3,
            },
        },
    ],
};

export const temporalBag: Ability = {
    ...temporalBag2,
    level: 1,
    description: "Place up to 2 cards from your hand on top of your deck.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.HAND_TO_TOP_DECK,
                maxAmount: 2,
            },
        },
    ],
    upgrades: [temporalBag2],
};

const greatestBolt2: Ability = {
    name: "Greatest Bolt",
    resourceCost: 2,
    rarity: RARITIES.RARE,
    image: PurpleEnergyBoltImage,
    level: 2,
    description: "+2 damage for every other 'bolt' card you own.",
    overrideBodyText: true,
    actions: [
        {
            damage: 13,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: PurpleEnergyBoltProjectileImage,
            playbackTime: 400,
            animationOptions: {
                rotate: -45,
                rotateToFaceTarget: true,
                width: 150,
                height: 150,
            },
            bonus: {
                damage: 3,
                multiplier: {
                    type: MULTIPLIER_TYPES.ALL_CARDS,
                    filters: [{ property: "name", comparator: "includes", value: "bolt" }],
                },
            },
        },
    ],
};

export const greatestBolt: Ability = {
    ...greatestBolt2,
    level: 1,
    actions: [
        {
            ...greatestBolt2.actions[0],
            damage: 10,
            bonus: {
                damage: 2,
                multiplier: {
                    type: MULTIPLIER_TYPES.ALL_CARDS,
                    filters: [{ property: "name", comparator: "includes", value: "bolt" }],
                },
            },
        },
    ],
    upgrades: [greatestBolt2],
};

const copySpell2: Ability = {
    name: "Copy Spell",
    image: CakeTemptationImage,
    level: 2,
    resourceCost: 0,
    rarity: RARITIES.RARE,
    description: "Create a copy of a card in your hand.",
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.COPY_FROM_HAND,
            },
        },
    ],
};

export const copySpell: Ability = {
    ...copySpell2,
    level: 1,
    resourceCost: 1,
    upgrades: [copySpell2],
};

const moltenLaser2: Ability = {
    name: "Molten Laser",
    image: FlameHazeImage,
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    level: 2,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.BEAM,
            icon: FireMarbleImage,
            damage: 7,
            destroyArmor: 1,
            effects: [
                {
                    ...burn,
                    duration: 3,
                },
            ],
        },
    ],
};

export const moltenLaser: Ability = {
    ...moltenLaser2,
    level: 1,
    depletedOnUse: true,
    upgrades: [moltenLaser2],
};

const combust2: Ability = {
    name: "Combust",
    image: ParalyzeImage,
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    level: 2,
    description: "Deals damage equal to the pending damage of all Burns on the target.",
    actions: [
        {
            area: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.BEAM,
            icon: FireArrowProjectileImage,
            bonus: {
                damage: 3,
                multiplier: {
                    calculationTarget: CONDITION_TARGETS.TARGET,
                    type: MULTIPLIER_TYPES.EFFECT_DURATIONS,
                    filters: [{ property: "name", value: "Burn", comparator: "eq" }],
                },
            },
        },
    ],
};

export const combust: Ability = {
    ...combust2,
    level: 1,
    actions: [
        {
            area: 1,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.BEAM,
            icon: FireArrowProjectileImage,
            bonus: {
                damage: 3,
                multiplier: {
                    calculationTarget: CONDITION_TARGETS.TARGET,
                    type: MULTIPLIER_TYPES.EFFECT_DURATIONS,
                    filters: [{ property: "name", value: "Burn", comparator: "eq" }],
                },
            },
        },
    ],
    upgrades: [combust2],
};

const leechingFlame2: Ability = {
    name: "Leeching Flame",
    resourceCost: 1,
    level: 2,
    rarity: RARITIES.UNCOMMON,
    description: "While the target is Burning, it heals you for 1 HP and grants you 1 Mana per turn.",
    image: EliteFirebrandImage,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            icon: EliteFirebrandMoveImage,
            effects: [
                {
                    ...burn,
                    duration: 5,
                },
                {
                    name: "Leeching Flame",
                    description: "While the target is Burning, it heals you for 1 HP and grants you 1 Mana per turn.",
                    icon: EliteFirebrandImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.DEBUFF,
                    duration: 4,
                    onTurnStart: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_APPLIER,
                        resources: 1,
                        healing: 1,
                        conditions: [
                            {
                                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                hasEffectType: [EFFECT_TYPES.BURN],
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

export const leechingFlame: Ability = {
    ...leechingFlame2,
    level: 1,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            icon: EliteFirebrandMoveImage,
            effects: [
                {
                    ...burn,
                    duration: 4,
                },
                {
                    name: "Leeching Flame",
                    description: "While the target is Burning, it heals you for 1 HP and grants you 1 Mana per turn.",
                    icon: EliteFirebrandImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.DEBUFF,
                    duration: 3,
                    onTurnStart: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_APPLIER,
                        resources: 1,
                        healing: 1,
                        conditions: [
                            {
                                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                hasEffectType: [EFFECT_TYPES.BURN],
                            },
                        ],
                    },
                },
            ],
        },
    ],
    upgrades: [leechingFlame2],
};

const volatileMagicEffect: Effect = {
    name: "Volatile Magic",
    description: "When you use a 2+ cost offense ability, cast another 0-2 cost offense ability.",
    icon: StarfallMagicSquareImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    maxApplications: 1,
    stacks: 3,
    onAbility: {
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                comparator: "gt",
                resourceCost: 1,
                isOffense: true,
            },
        ],
        autoCastAbilities: {
            type: AUTO_CAST_ABILITY_TYPES.OFFENSE_FROM_CLASS,
            filters: [{ property: "resourceCost", comparator: "lt", value: 3 }],
            amount: 1,
        },
        decrementStacks: 1,
    },
};

const volatileMagic2: Ability = {
    name: "Volatile Magic",
    image: StarfallMagicSquareImage,
    resourceCost: 1,
    rarity: RARITIES.RARE,
    depletedOnUse: true,
    description: "For the next 4 times you use a 2+ cost offense ability, cast another 0-2 cost offense ability.",
    overrideBodyText: true,
    level: 2,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    ...volatileMagicEffect,
                    stacks: 4,
                },
            ],
        },
    ],
};

export const volatileMagic: Ability = {
    ...volatileMagic2,
    level: 1,
    description: "For the next 3 times you use a 2+ cost offense ability, cast another 0-2 cost offense ability.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [volatileMagicEffect],
        },
    ],
    upgrades: [volatileMagic2],
};

const bagFromBeyond2: Ability = {
    name: "Bag From Beyond",
    image: InkSackImage,
    rarity: RARITIES.RARE,
    resourceCost: 0,
    depletedOnUse: true,
    level: 2,
    description: "Retrieve a random Depleted card and place it in your hand.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            retrieveDepletedCards: {
                amount: 1,
            },
        },
    ],
};

export const bagFromBeyond: Ability = {
    ...bagFromBeyond2,
    level: 1,
    resourceCost: 1,
    upgrades: [bagFromBeyond2],
};

export const arcaneWard2: Ability = {
    name: "Arcane Ward",
    image: ElementalAdaptationFPImage,
    resourceCost: 1,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    level: 2,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            armor: 20,
            effects: [
                {
                    ...preventArmorDecay,
                    duration: 1,
                },
            ],
        },
    ],
};

export const arcaneWard: Ability = {
    ...arcaneWard2,
    level: 1,
    actions: [
        {
            ...arcaneWard2.actions[0],
            armor: 15,
        },
    ],
    upgrades: [arcaneWard2],
};

const icyDraft2: Ability = {
    name: "Icy Draft",
    image: IcicleImage,
    level: 2,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    description: "When drawn, Chill a random enemy.",
    onDraw: {
        ability: {
            name: "Chilling Draft",
            image: SnowflakeIcon,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    icon: SnowflakeIcon,
                    effects: [
                        {
                            ...chill,
                            duration: 3,
                        },
                    ],
                },
            ],
        },
    },
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            playbackTime: 500,
            icon: IcicleImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
            damage: 6,
            effects: [
                {
                    ...freeze,
                    duration: 1,
                },
            ],
        },
    ],
};

export const icyDraft: Ability = {
    ...icyDraft2,
    level: 1,
    actions: [
        {
            ...icyDraft2.actions[0],
            damage: 3,
        },
    ],
    upgrades: [icyDraft2],
};

export const hyperMetronome: Ability = {
    name: "Hyper Metronome",
    image: PurpleInfinityImage,
    resourceCost: 2,
    rarity: RARITIES.RARE,
    description: "Cast 3 random spells.",
    depletedOnUse: true,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: PurpleInfinityImage,
            autoCastAbilities: {
                type: AUTO_CAST_ABILITY_TYPES.FROM_CLASS,
                amount: 3,
            },
        },
    ],
};

const avalanche2: Ability = {
    name: "Avalanche",
    image: PepeRollingASnowballImage,
    resourceCost: 2,
    level: 2,
    removeAfterTurn: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
            animationOptions: {
                width: 125,
                height: 125,
            },
            icon: BigSnowballImage,
            damage: 15,
            area: 2,
            effects: [
                {
                    ...freeze,
                    duration: 1,
                },
            ],
        },
    ],
};

const avalanche: Ability = {
    ...avalanche2,
    level: 1,
    actions: [
        {
            ...avalanche2.actions[0],
            damage: 13,
        },
    ],
    upgrades: [avalanche2],
};

const snowBoulder2: Ability = {
    name: "Snow Boulder",
    image: BigSnowballImage,
    resourceCost: 1,
    removeAfterTurn: true,
    rarity: RARITIES.UNCOMMON,
    level: 2,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
            animationOptions: {
                width: 75,
                height: 75,
            },
            icon: BigSnowballImage,
            damage: 9,
            area: 1,
            effects: [
                {
                    ...chill,
                    duration: 2,
                },
            ],
            addCardsToDeck: [avalanche2],
        },
    ],
};

const snowBoulder: Ability = {
    ...snowBoulder2,
    level: 1,
    actions: [
        {
            ...snowBoulder2.actions[0],
            damage: 7,
            addCardsToDeck: [avalanche],
        },
    ],
    upgrades: [snowBoulder2],
};

const snowball2: Ability = {
    name: "Snowball",
    image: SnowballImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    level: 2,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN,
            playbackTime: 500,
            icon: SnowballImage,
            animationOptions: {
                width: 40,
                height: 40,
            },
            damage: 8,
            effects: [
                {
                    ...chill,
                    duration: 1,
                },
            ],
            addCardsToDeck: [snowBoulder2],
        },
    ],
};

export const snowball: Ability = {
    ...snowball2,
    level: 1,
    actions: [{ ...snowball2.actions[0], damage: 5, addCardsToDeck: [snowBoulder] }],
    upgrades: [snowball2],
};

const starBolt2: Ability = {
    name: "Star Bolt",
    resourceCost: 2,
    image: GlisteningStarImage,
    description: "Heal 1 HP each hit.",
    rarity: RARITIES.COMMON,
    level: 2,
    actions: [
        {
            damage: 8,
            secondaryDamage: 6,
            targetArea: 3,
            numTargets: 4,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            ricochet: true,
            animation: ANIMATION_TYPES.YOYO,
            icon: GlisteningStarImage,
            animationOptions: {
                width: 75,
                height: 75,
                flash: 500,
            },
            secondaryAction: {
                target: "actor",
                healing: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.NUM_AFFECTED_TARGETS,
                },
            },
        },
    ],
};

export const starBolt: Ability = {
    ...starBolt2,
    level: 1,
    actions: [
        {
            ...starBolt2.actions[0],
            damage: 6,
            targetArea: 3,
            numTargets: 2,
        },
    ],
    upgrades: [starBolt2],
};

export const moonlight2: Ability = {
    name: "Moonlight",
    resourceCost: 1,
    level: 2,
    image: LunarPiecesImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            healing: 5,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            drawCards: {
                amount: 1,
            },
        },
    ],
};

export const moonlight: Ability = {
    ...moonlight2,
    level: 1,
    actions: [
        {
            healing: 3,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            drawCards: {
                amount: 1,
            },
        },
    ],
    upgrades: [moonlight2],
};

const zap2: Ability = {
    name: "Zap",
    resourceCost: 1,
    image: ThunderSparkImage,
    description: "When drawn, Stun a random enemy.",
    level: 2,
    rarity: RARITIES.COMMON,
    onDraw: {
        ability: {
            name: "Spark",
            image: ThunderSparkImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    playbackTime: 500,
                    icon: ThunderSparkImage,
                    animationOptions: {
                        rotateToFaceTarget: true,
                        rotate: 135,
                        flash: 500,
                    },
                    effects: [stun],
                },
            ],
        },
    },
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            playbackTime: 500,
            icon: ThunderSparkImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
                flash: 200,
            },
            damage: 7,
            bonus: {
                damage: 5,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        hasEffectClass: EFFECT_CLASSES.DEBUFF,
                    },
                ],
            },
        },
    ],
};

export const zap: Ability = {
    ...zap2,
    level: 1,
    actions: [
        {
            ...zap2.actions[0],
            damage: 5,
            bonus: {
                damage: 3,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        hasEffectClass: EFFECT_CLASSES.DEBUFF,
                    },
                ],
            },
        },
    ],
    upgrades: [zap2],
};

const frostfireBlast2: Ability = {
    name: "Frostfire Blast",
    resourceCost: 1,
    level: 2,
    image: AdvancedChargeImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            damage: 6,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN,
            playbackTime: 500,
            icon: AdvancedChargeImage,
            animationOptions: {
                flash: 500,
            },
            effects: [
                {
                    ...burn,
                },
                {
                    ...chill,
                    duration: 3,
                },
            ],
        },
    ],
};

export const frostfireBlast: Ability = {
    ...frostfireBlast2,
    level: 1,
    actions: [
        {
            ...frostfireBlast2.actions[0],
            damage: 3,
        },
    ],
    upgrades: [frostfireBlast2],
};

const manaGem2: Ability = {
    name: "Mana Gem",
    resourceCost: 0,
    image: ManaImage,
    rarity: RARITIES.COMMON,
    level: 2,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            resources: 1,
            armor: 3,
        },
    ],
};

export const manaGem: Ability = {
    ...manaGem2,
    level: 1,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            resources: 1,
        },
    ],
    upgrades: [manaGem2],
};

export const wardBooster2: Ability = {
    name: "Ward Booster",
    resourceCost: 1,
    level: 2,
    rarity: RARITIES.UNCOMMON,
    image: HolyMagicShellImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            armor: 3,
            effects: [armorUp],
        },
    ],
};

export const wardBooster: Ability = {
    ...wardBooster2,
    depletedOnUse: true,
    level: 1,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            armor: 3,
            effects: [armorUp],
        },
    ],
    upgrades: [wardBooster2],
};

const icicleMinion: Minion = {
    name: "Icicle",
    image: IcicleMinionImage,
    maxHP: 1,
    abilities: [
        {
            name: "Strike",
            image: IcicleMinionImage,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                    animationOptions: {
                        rotateToFaceTarget: true,
                    },
                    effects: [
                        {
                            ...chill,
                        },
                    ],
                    secondaryAction: {
                        target: "actor",
                        damage: 1,
                    },
                },
            ],
        },
    ],
};

export const icicles: Ability = {
    name: "Icicles",
    image: IciclesPortraitImage,
    rarity: RARITIES.RARE,
    depletedOnUse: true,
    description: "For your next 3 offense spells that cost 1+, summon a 3/1 Icicle.",
    resourceCost: 1,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [
                {
                    name: "Icicles",
                    description: "When you cast a 1+ cost offense spell, summon a 3/1 Icicle.",
                    icon: IcicleMinionImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    maxApplications: 1,
                    stacks: 3,
                    onOffensiveAbility: {
                        ability: {
                            name: "Icicle",
                            image: IcicleMinionImage,
                            actions: [
                                {
                                    target: TARGET_TYPES.SELF,
                                    type: ACTION_TYPES.EFFECT,
                                    summon: [{ minion: [icicleMinion] }],
                                },
                            ],
                        },
                        conditions: [
                            {
                                comparator: "gt",
                                resourceCost: 0,
                                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            },
                        ],
                        decrementStacks: 1,
                    },
                },
            ],
        },
    ],
};

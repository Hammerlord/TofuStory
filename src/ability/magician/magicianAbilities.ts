import { TRIGGER_SOURCE_TYPES } from "../../battle/types";
import {
    AdvancedChargeImage,
    ArcaneAimImage,
    ArcaneOverdriveImage,
    BabyDragonImage,
    BigSnowballImage,
    BlazingExtinctionImage,
    BlueRushImage,
    CakeTemptationImage,
    ChocolateCupcakeImage,
    ChocolateMuffinImage,
    ColdBeamImage,
    ColdBeamProjectileImage,
    DarkShockImage,
    DoTPunisherImage,
    ElementalAdaptationFPImage,
    ElementalAdaptationImage,
    EliteFirebrandImage,
    EliteFirebrandMoveImage,
    ElquinesImage,
    EmptySackImage,
    EnergyBoltImage,
    EnergyBoltProjectileImage,
    EpicAdventureImage,
    FireArrowImage,
    FireArrowProjectileImage,
    FireMarbleImage,
    FireSpiritImage,
    FireworksImage,
    FlameHazeImage,
    FrostfireProjectileImage,
    FullMoonImage,
    GiantSnowmanImage,
    GlisteningStarImage,
    HighWisdomImage,
    HolyMagicShellImage,
    IcicleImage,
    IcicleMinionImage,
    IciclesPortraitImage,
    IfritImage,
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
    NimbleJewelCImage,
    NimbleJewelImage,
    OldEnergyBoltImage,
    ParalyzeImage,
    ParfaitCupcakeImage,
    PepeRollingASnowballImage,
    PieceOfBirthdayCakeImage,
    PingProjectileImage,
    PurpleEnergyBoltImage,
    PurpleEnergyBoltProjectileImage,
    PurpleFlyingBookIconImage,
    PurpleFlyingBookImage,
    PurpleInfinityImage,
    RocketImage,
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
import { SnowflakeIcon } from "../../images/icons";
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
import { attack } from "./../../enemy/abilities";
import { armorUp, attackPower, burn, chill, freeze, preventArmorDecayPlayer, stashCardEffect, stun, taunt } from "./../Effects";

export const lesserBolt: Ability = {
    name: "Lesser Bolt",
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
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const magicFang: Ability = {
    name: "Magic Fang",
    image: BlueRushImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    overrideBodyText: true,
    description: "<b>Charged: +{{ actions.0.bonus.damage }}</b> {{{ _damage_ }}}",
    actions: [
        {
            area: 1,
            damage: 3,
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
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                    bonus: {
                        damage: 1,
                    },
                },
            ],
        },
    ],
};

export const empower: Ability = {
    name: "Empower",
    image: ArcaneOverdriveImage,
    description: "This turn, gain <b>+{{ actions.0.effects.0.attackPower }}</b> {{{ _damage_ }}}.",
    overrideBodyText: true,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [{ ...attackPower, attackPower: 3, duration: 1 }],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            attackPower: 1,
                        },
                    ],
                },
            ],
        },
    ],
};

export const energyBolt: Ability = {
    name: "Energy Bolt",
    image: OldEnergyBoltImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    overrideBodyText: true,
    description: "<b>Charged: +{{ actions.0.bonus.damage }}</b> {{{ _damage_ }}}",
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
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                    bonus: {
                        damage: 1,
                    },
                },
            ],
        },
    ],
};

const magicClawAction: Action = {
    damage: 8,
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
        damage: 3,
    },
};

export const magicClaw: Ability = {
    name: "Magic Claw",
    resourceCost: 2,
    image: MagicClawImage,
    overrideBodyText: true,
    description: "Hits twice. <br/> <b>Charged: +{{ actions.0.bonus.damage }}</b> {{{ _damage_ }}}.",
    rarity: RARITIES.COMMON,
    actions: [
        {
            ...magicClawAction,
        },
        {
            ...magicClawAction,
            animationOptions: {
                ...magicClawAction.animationOptions,
                mirrorX: true,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                    bonus: {
                        damage: 1,
                    },
                },
                {
                    damage: 2,
                    bonus: {
                        damage: 1,
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
    rarity: RARITIES.COMMON,
    actions: [
        {
            target: TARGET_TYPES.FRIENDLY,
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
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            onTurnEnd: {
                                armor: 1,
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export const ping: Ability = {
    name: "Ping",
    resourceCost: 0,
    image: PingProjectileImage,
    rarity: RARITIES.COMMON,
    description: "<b>Charged:</b> This card enters your hand next turn.",
    actions: [
        {
            damage: 4,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN,
            icon: PingProjectileImage,
            playbackTime: 400,
            secondaryAction: {
                effects: [
                    {
                        name: "Draw Ping",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.NONE,
                        onTurnInProgress: {
                            drawOriginalAbility: true,
                            removeEffect: true,
                        },
                    },
                ],
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const pong: Ability = {
    name: "Pong",
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    image: DarkShockImage,
    depletedOnUse: true,
    actions: [
        {
            addCards: [ping, ping, ping].map((card) => ({ ...card, removeAfterTurn: true })),
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    addCardOptions: {
                        upgradeLevels: 1,
                    },
                },
            ],
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
            target: TARGET_TYPES.FRIENDLY,
            type: ACTION_TYPES.EFFECT,
            armor: 5,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 3,
                },
            ],
        },
    ],
};

export const barrier: Ability = {
    name: "Barrier",
    resourceCost: 1,
    image: MagicArmorImage,
    rarity: RARITIES.COMMON,
    overrideBodyText: true,
    description: "<b>Charged: +{{ actions.0.bonus.armor }}</b> {{{ _armor_ }}}",
    actions: [
        {
            target: TARGET_TYPES.FRIENDLY,
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
    upgrades: [
        {
            actions: [
                {
                    armor: 2,
                    bonus: {
                        armor: 1,
                    },
                },
            ],
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
    upgrades: [
        {
            actions: [
                {
                    drawCards: {
                        amount: 1,
                    },
                },
            ],
        },
    ],
};

const triboltAction: Action = {
    damage: 4,
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

export const tribolt: Ability = {
    name: "Tribolt",
    image: TriboltImage,
    rarity: RARITIES.COMMON,
    resourceCost: 1,
    description: "Randomly hits the target or its neighbors, x3",
    actions: [{ ...triboltAction }, { ...triboltAction }, { ...triboltAction }],
    upgrades: [{ actions: [{ damage: 1 }, { damage: 1 }, { damage: 1 }] }],
};

export const mpEater: Ability = {
    name: "Mana Eater",
    image: MPEaterImage,
    resourceCost: 0,
    depletedOnUse: true,
    rarity: RARITIES.RARE,
    description: "Destroy 1 energy on the target.",
    actions: [
        {
            damage: 0,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: WizMushImage,
            animation: ANIMATION_TYPES.BEAM,
            resources: -1,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            resources: 2,
        },
    ],
    upgrades: [
        {
            description: "Destroy 2 energy on the target.",
            actions: [
                {
                    resources: -1,
                },
                {
                    resources: 1,
                },
            ],
        },
    ],
};

const arcaneAimingAttackPower: Effect = {
    name: "Arcane Aiming",
    icon: ArcaneAimImage,
    disableDisplayIcon: true,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackPower: 1,
    duration: 0,
    maxApplications: 10,
};

const arcaneAiming: Effect = {
    name: "Arcane Aim",
    icon: ArcaneAimImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    duration: 0,
    onAttack: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [arcaneAimingAttackPower],
    },
};

export const arcaneAim: Ability = {
    name: "Arcane Aim",
    image: ArcaneAimImage,
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    description: "This turn only, gain +1 ATT whenever you attack.",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [arcaneAiming, arcaneAimingAttackPower],
        },
    ],
    upgrades: [
        {
            description: "Draw {{ actions.0.drawCards.amount }} card. This turn only, gain +1 ATT whenever you attack.",
            actions: [
                {
                    drawCards: {
                        amount: 1,
                    },
                },
            ],
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
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
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
    upgrades: [
        {
            actions: [
                {
                    area: 1,
                },
            ],
        },
    ],
};

export const frostBarrier: Ability = {
    name: "Frost Barrier",
    image: ElementalAdaptationImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    description:
        "Inflicts {{{ _chill_ }}} Chill <b>{{ actions.0.effects.0.onReceiveAttack.effects.0.duration }}</b>{{{ _duration_ }}} on attackers. <br/> </br> <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
    overrideBodyText: true,
    actions: [
        {
            target: TARGET_TYPES.FRIENDLY,
            type: ACTION_TYPES.EFFECT,
            armor: 7,
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
                                duration: 2,
                            },
                        ],
                    },
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 3,
                },
            ],
        },
    ],
};

export const chainLightning: Ability = {
    name: "Chain Lightning",
    image: LightningOrbImage,
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            damage: 8,
            secondaryDamage: 6,
            targetArea: 5,
            numTargets: 4,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN,
            icon: LightningOrbProjectileImage,
            animationOptions: {
                width: 70,
                height: 70,
                opacity: 0.8,
                flash: 200,
                ricochet: true,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                    secondaryDamage: 2,
                },
            ],
        },
    ],
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
    upgrades: [
        {
            actions: [
                {
                    addCardOptions: {
                        appendCards: 1,
                    },
                },
            ],
        },
    ],
};

const fallingStar: Action = {
    type: ACTION_TYPES.RANGE_ATTACK,
    animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
    target: TARGET_TYPES.RANDOM_HOSTILE,
    icon: StarImage,
    damage: 2,
    playbackTime: 400,
};

export const wishUponAStar: Ability = {
    name: "Wish Upon A Star",
    resourceCost: 1,
    image: StarHairPinImage,
    rarity: RARITIES.COMMON,
    description:
        "<b>On Draw</b> / <b>Deck Cycle:</b> Cast a {{ actions.0.effects.0.onDrawCard.ability.actions.0.damage }} {{{ _damage_ }}} star at a random enemy. <br/> <br/> <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
    overrideBodyText: true,
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
                            actions: [{ ...fallingStar }],
                        },
                    },
                    onDeckCycle: {
                        ability: {
                            name: "Falling Star",
                            image: StarImage,
                            actions: [{ ...fallingStar }],
                        },
                    },
                    duration: 5,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            onDrawCard: {
                                ability: {
                                    actions: [{ damage: 1 }],
                                },
                            },
                            onDeckCycle: {
                                ability: {
                                    actions: [{ damage: 1 }],
                                },
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export const fireArrow: Ability = {
    name: "Fire Arrow",
    image: FireArrowImage,
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    overrideBodyText: true,
    description:
        "Apply {{{ _burn_ }}} Burn <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}. <br/> <br/> <b>Charged:</b> Burn again.",
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: FireArrowProjectileImage,
            damage: 10,
            animationOptions: {
                height: 90,
                rotateToFaceTarget: true,
            },
            effects: [
                {
                    ...burn,
                    duration: 2,
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
                            ...burn,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

const parfaitCupcake: Ability = {
    name: "Parfait Cupcake",
    resourceCost: 0,
    image: ParfaitCupcakeImage,
    removeAfterTurn: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: ParfaitCupcakeImage,
            resources: 2,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 2,
                },
            ],
        },
    ],
};

const chocolateCupcake: Ability = {
    name: "Chocolate Cupcake",
    resourceCost: 0,
    image: ChocolateCupcakeImage,
    removeAfterTurn: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: ChocolateCupcakeImage,
            healing: 3,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    healing: 2,
                },
            ],
        },
    ],
};

const pieceOfCake: Ability = {
    name: "Piece Of Cake",
    resourceCost: 0,
    image: PieceOfBirthdayCakeImage,
    removeAfterTurn: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: PieceOfBirthdayCakeImage,
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
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            duration: Infinity,
                        },
                    ],
                },
            ],
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
    upgrades: [
        {
            actions: [
                {
                    selectCardOptions: {
                        upgradeLevels: 1,
                    },
                },
            ],
        },
    ],
};

export const avatarOfTheStars: Ability = {
    name: "Avatar Of The Stars",
    image: StarfishImage,
    rarity: RARITIES.RARE,
    depletedOnUse: true,
    resourceCost: 2,
    description:
        "When you play a 1+ cost {{{ _offense_ }}} card, add Swift to your hand. <br/> <br/> <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
    overrideBodyText: true,
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
                    description: "When you play a 1+ cost offense card, add Swift to your hand.",
                    onOffensiveAbility: {
                        conditions: [
                            {
                                comparator: "gt",
                                resourceCost: 0,
                                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                            },
                        ],
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        addCards: [{ ...swift, removeAfterTurn: true }],
                    },
                },
            ],
        },
    ],
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const greaterBolt: Ability = {
    name: "Greater Bolt",
    image: EnergyBoltImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    description:
        "While you own this card, 'bolt' abilities gain <b>+{{ effectsWhileOwned.0.skillBonus.0.damage }}</b> {{{ _damage_ }}}. Greater Bolt gains <b>+2</b> {{{ _damage_ }}}.",
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
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const throwTheBook: Ability = {
    name: "Throw The Book",
    image: PurpleFlyingBookIconImage,
    resourceCost: 3,
    rarity: RARITIES.UNCOMMON,
    description: "Deals damage equal to the amount of cards you own.",
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
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const quickspell: Ability = {
    name: "Quickspell",
    image: MagicBoosterImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    overrideBodyText: true,
    description: "Draw {{ actions.0.drawCards.amount }} {{{ _offense_ }}} cards.",
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
    upgrades: [
        {
            description:
                "Draw {{ actions.0.drawCards.amount }} {{{ _offense_ }}} cards. Their cost is reduced by {{ actions.0.drawCards.effects.0.resourceCost }} until discarded.",
            actions: [
                {
                    drawCards: {
                        effects: [
                            {
                                resourceCost: -1,
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

export const glacier: Ability = {
    name: "Glacier",
    image: ColdBeamImage,
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: ColdBeamProjectileImage,
            damage: 6,
            animationOptions: {
                height: 100,
                rotateToFaceTarget: true,
            },
            area: 1,
            effects: [
                {
                    ...chill,
                    duration: 2,
                },
                {
                    ...freeze,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
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
            damage: 6,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const thunderBolt: Ability = {
    name: "Thunder Bolt",
    image: ThunderBoltImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    description: "<b>Charged:</b> Cast again for {{ actions.1.damage }} {{{ _damage_ }}}.",
    actions: [
        {
            damage: 3,
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
    upgrades: [
        {
            actions: [
                {
                    damage: 1,
                },
                {
                    damage: 1,
                },
            ],
        },
    ],
};

export const slimmingMuffin: Ability = {
    name: "Conjured Slimming Muffin",
    image: ChocolateMuffinImage,
    resourceCost: 0,
    rarity: RARITIES.COMMON,
    description: "Draw a card. It costs ({{ actions.0.drawCards.effects.0.resourceCost }}) less until discarded.",
    overrideBodyText: true,
    selectCards: {
        type: SELECT_CARD_TYPES.DEPLETE_FROM_HAND,
    },
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: ChocolateMuffinImage,
            drawCards: {
                amount: 1,
                effects: [
                    {
                        resourceCost: -1,
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            description:
                "Draw {{ actions.0.drawCards.amount }}. It costs ({{ actions.0.drawCards.effects.0.resourceCost }}) less until discarded.",
            actions: [
                {
                    drawCards: {
                        amount: 1,
                    },
                },
            ],
        },
    ],
};

export const aurora: Ability = {
    name: "Aurora",
    image: HighWisdomImage,
    description: "While this card is in hand, its cost reduces by 1 whenever you use another ability.",
    resourceCost: 5,
    rarity: RARITIES.UNCOMMON,
    onAbility: {
        abilityEffects: [
            {
                resourceCost: -1,
            },
        ],
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
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const feedback: Ability = {
    name: "Feedback",
    image: TeleportMasteryFireImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    description:
        "Gain {{ actions.0.secondaryAction.resources }} Mana but self-inflict {{ actions.0.secondaryAction.flatDamage }} {{{ _damage_ }}} for each target.",
    actions: [
        {
            damage: 0,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            icon: TeleportMasteryFireImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            secondaryAction: {
                type: ACTION_TYPES.EFFECT,
                resources: 1,
                flatDamage: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.NUM_AFFECTED_TARGETS,
                },
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    area: 1,
                },
            ],
        },
    ],
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
    upgrades: [
        {
            description: "Cast 2 random Upgraded spells.",
            actions: [
                {
                    autoCastAbilities: {
                        upgradeLevels: 1,
                    },
                },
            ],
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
    upgrades: [
        {
            actions: [
                {
                    addCardOptions: {
                        upgradeLevels: 1,
                    },
                },
            ],
        },
    ],
};

export const polymorph: Ability = {
    name: "Polymorph",
    resourceCost: 2,
    rarity: RARITIES.RARE,
    image: ScarfSnowmanImage,
    description: "Apply Silence and 2 ATT Down. <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
    overrideBodyText: true,
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
                    description: "Disables certain buffs. Attack power reduced.",
                    duration: 2,
                    attackPower: -2,
                    maxApplications: 1,
                    override: {
                        portrait: [ScarfSnowmanImage, StrawHatSnowmanImage, MetalBucketSnowmanImage],
                    },
                    type: EFFECT_TYPES.SILENCE,
                    class: EFFECT_CLASSES.DEBUFF,
                },
            ],
        },
    ],
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const goutOfFlame: Ability = {
    name: "Gout Of Flame",
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    image: DoTPunisherImage,
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
            effects: [
                {
                    ...burn,
                    duration: 3,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const temporalBag: Ability = {
    name: "Temporal Bag",
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    image: EmptySackImage,
    description: "You may place {{ actions.0.effects.0.stacks }} cards from your hand onto your deck.",
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    ...stashCardEffect,
                    stacks: 2,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            stacks: 1,
                        },
                    ],
                },
            ],
        },
    ],
};

export const greatestBolt: Ability = {
    name: "Greatest Bolt",
    resourceCost: 2,
    rarity: RARITIES.RARE,
    image: PurpleEnergyBoltImage,
    description: "+2 {{{ _damage_ }}} for every other 'bolt' card you own.",
    overrideBodyText: true,
    actions: [
        {
            damage: 14,
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
                damage: 2,
                multiplier: {
                    type: MULTIPLIER_TYPES.ALL_CARDS,
                    filters: [{ property: "name", comparator: "includes", value: "bolt" }],
                },
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const copySpell: Ability = {
    name: "Copy Spell",
    image: CakeTemptationImage,
    resourceCost: 1,
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
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const moltenLaser: Ability = {
    name: "Molten Laser",
    image: FlameHazeImage,
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.BEAM,
            icon: FireMarbleImage,
            destroyArmor: 1,
            effects: [
                {
                    ...burn,
                    duration: 5,
                },
            ],
        },
    ],
    upgrades: [
        {
            depletedOnUse: false,
        },
    ],
};

export const combust: Ability = {
    name: "Combust",
    image: ParalyzeImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    description: "Deals damage equal to pending Burn damage on the target.",
    actions: [
        {
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
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const leechingFlame: Ability = {
    name: "Leeching Flame",
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    description:
        "Apply {{{ _burn_ }}} Burn <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}. <br/> While the target has {{{ _burn_ }}}, gain {{ actions.0.effects.1.onTurnStart.healing }} {{{ _healing_ }}} / {{ actions.0.effects.1.onTurnStart.resources }} Mana per turn. <b>{{ actions.0.effects.1.duration }}</b>{{{ _duration_ }}}",
    overrideBodyText: true,
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
                    duration: 3,
                },
                {
                    name: "Leeching Flame",
                    description: "Leeching 1 HP and 1 Mana while the target has Burn.",
                    icon: EliteFirebrandImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.DEBUFF,
                    maxApplications: 1,
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
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            duration: 1,
                        },
                        {
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
};

export const volatileMagic: Ability = {
    name: "Volatile Magic",
    image: StarfallMagicSquareImage,
    resourceCost: 1,
    rarity: RARITIES.RARE,
    depletedOnUse: true,
    description: "Once per turn, when you use a 2+ cost {{{ _offense_ }}} card, cast a random {{{ _offense_ }}} spell.",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Volatile Magic Effect",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    onTurnStart: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        effects: [
                            {
                                name: "Volatile Magic",
                                description: "When you use a 2+ cost offense card, cast a random offense spell.",
                                icon: StarfallMagicSquareImage,
                                type: EFFECT_TYPES.NONE,
                                class: EFFECT_CLASSES.BUFF,
                                onAbility: {
                                    conditions: [
                                        {
                                            calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                            comparator: "gt",
                                            resourceCost: 1,
                                            isOffense: true,
                                            sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                                        },
                                    ],
                                    autoCastAbilities: {
                                        type: AUTO_CAST_ABILITY_TYPES.OFFENSE_FROM_CLASS,
                                        amount: 1,
                                    },
                                    removeEffect: true,
                                },
                            },
                        ],
                    },
                },
            ],
        },
    ],
    upgrades: [
        {
            description: "Once per turn, when you use a 2+ cost {{{ _offense_ }}} card, cast a random Upgraded {{{ _offense_ }}} spell.",
            actions: [
                {
                    effects: [
                        {
                            onTurnStart: {
                                effects: [
                                    {
                                        onAbility: {
                                            autoCastAbilities: {
                                                upgradeLevels: 1,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export const bagFromBeyond: Ability = {
    name: "Bag From Beyond",
    image: InkSackImage,
    rarity: RARITIES.RARE,
    resourceCost: 1,
    depletedOnUse: true,
    description: "Return a random Depleted card to your hand.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            retrieveDepletedCards: {
                amount: 1,
            },
        },
    ],
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const arcaneWard: Ability = {
    name: "Arcane Ward",
    image: ElementalAdaptationFPImage,
    description: "Prevent the next time your armor decays.",
    overrideBodyText: true,
    resourceCost: 1,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            armor: 15,
            effects: [preventArmorDecayPlayer],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 5,
                },
            ],
        },
    ],
};

export const icyDraft: Ability = {
    name: "Icy Draft",
    image: IcicleImage,
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
            damage: 3,
            effects: [
                {
                    ...freeze,
                    duration: 1,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
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
    upgrades: [
        {
            description: "Cast 3 random Upgraded spells.",
            actions: [
                {
                    autoCastAbilities: {
                        upgradeLevels: 1,
                    },
                },
            ],
        },
    ],
};

const avalanche: Ability = {
    name: "Avalanche",
    image: PepeRollingASnowballImage,
    resourceCost: 2,
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
            damage: 13,
            area: 2,
            effects: [
                {
                    ...freeze,
                    duration: 1,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

const snowBoulder: Ability = {
    name: "Snow Boulder",
    image: BigSnowballImage,
    resourceCost: 1,
    removeAfterTurn: true,
    rarity: RARITIES.UNCOMMON,
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
            damage: 7,
            area: 1,
            effects: [
                {
                    ...chill,
                    duration: 2,
                },
            ],
            addCardsToDeck: [avalanche],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                    addCardsToDeckOptions: {
                        upgradeLevels: 1,
                    },
                },
            ],
        },
    ],
};

export const snowball: Ability = {
    name: "Snowball",
    image: SnowballImage,
    resourceCost: 1,
    rarity: RARITIES.RARE,
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
            damage: 5,
            effects: [
                {
                    ...chill,
                    duration: 1,
                },
            ],
            addCardsToDeck: [snowBoulder],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                    addCardsToDeckOptions: {
                        upgradeLevels: 1,
                    },
                },
            ],
        },
    ],
};

export const moonBolt: Ability = {
    name: "Moon Bolt",
    resourceCost: 2,
    image: FullMoonImage,
    overrideBodyText: true,
    description: "Heal all allies for <b>{{ actions.0.secondaryAction.healing }}</b> {{{ _healing_ }}} each hit.",

    rarity: RARITIES.COMMON,
    actions: [
        {
            damage: 6,
            targetArea: 3,
            numTargets: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.YOYO,
            icon: FullMoonImage,
            animationOptions: {
                width: 75,
                height: 75,
                ricochet: true,
            },
            secondaryAction: {
                healing: 2,
                area: 5,
                multiplier: {
                    type: MULTIPLIER_TYPES.NUM_AFFECTED_TARGETS,
                },
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const starBolt: Ability = {
    name: "Star Bolt",
    resourceCost: 1,
    image: GlisteningStarImage,
    description: "Draw {{ actions.0.drawCards.amount }} card. <br/> <b>Charged:</b> Draw {{ actions.0.bonus.drawCards.amount }} more.",
    overrideBodyText: true,
    rarity: RARITIES.COMMON,
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.YOYO,
            icon: GlisteningStarImage,
            drawCards: {
                amount: 1,
            },
            animationOptions: {
                width: 75,
                height: 75,
                flash: 500,
                ricochet: true,
            },
            bonus: {
                drawCards: {
                    amount: 1, // This doesn't work because card actions don't take bonuses into account yet
                },
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const moonlight: Ability = {
    name: "Moonlight",
    resourceCost: 1,
    image: LunarPiecesImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            healing: 3,
            target: TARGET_TYPES.FRIENDLY,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: LunarPiecesImage,
            drawCards: {
                amount: 1,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    healing: 2,
                },
            ],
        },
    ],
};

export const zap: Ability = {
    name: "Zap",
    resourceCost: 1,
    image: ThunderSparkImage,
    description: "When drawn, Stun a random enemy.",
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
            damage: 3,
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
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                    bonus: {
                        damage: 1,
                    },
                },
            ],
        },
    ],
};

export const frostfireBlast: Ability = {
    name: "Frostfire Blast",
    resourceCost: 1,
    image: AdvancedChargeImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            damage: 3,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN,
            playbackTime: 500,
            icon: FrostfireProjectileImage,
            animationOptions: {
                flash: 500,
            },
            effects: [
                {
                    ...burn,
                    duration: 2,
                },
                {
                    ...chill,
                    duration: 2,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const manaGem: Ability = {
    name: "Mana Gem",
    resourceCost: 0,
    image: ManaImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: ManaImage,
            resources: 1,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 2,
                },
            ],
        },
    ],
};

export const wardBooster: Ability = {
    name: "Ward Booster",
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    image: HolyMagicShellImage,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            armor: 3,
            effects: [armorUp],
        },
    ],
    upgrades: [
        {
            depletedOnUse: false,
        },
    ],
};

const icicleMinion: Minion = {
    name: "Icicle",
    image: IcicleMinionImage,
    description: "On attack: Applies Chill and self-inflicts 1 {{{ _damage_ }}}. <br/> Applies Chill to attackers.",
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
                        damage: 1,
                    },
                },
            ],
        },
    ],
    effects: [
        {
            name: "Icicle",
            icon: IcicleMinionImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            description: "On attack: Applies Chill and self-inflicts 1 damage. <br/> Applies Chill to attackers.",
            onReceiveAttack: {
                targetType: TRIGGER_TARGET_TYPES.ACTOR,
                usableWhileDead: true,
                effects: [
                    {
                        ...chill,
                        duration: 3,
                    },
                ],
            },
        },
    ],
};

export const icicles: Ability = {
    name: "Icicles",
    image: IciclesPortraitImage,
    rarity: RARITIES.UNCOMMON,
    depletedOnUse: true,
    description: "The next {{ actions.0.effects.0.stacks }} times you play a 1+ cost card, summon an Icicle.",
    resourceCost: 1,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [
                {
                    name: "Icicles",
                    description: "When you cast a 1+ cost card, summon a (3/1) Icicle.",
                    icon: IcicleMinionImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    maxApplications: 1,
                    stacks: 3,
                    onPlayCard: {
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
                        conditionOperator: "and",
                        conditions: [
                            {
                                comparator: "gt",
                                resourceCost: 0,
                                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                            },
                            {
                                // Only summon if there is room to summon
                                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                comparator: "lt",
                                numFriendly: 5,
                            },
                        ],
                        decrementStacks: 1,
                    },
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            stacks: 1,
                        },
                    ],
                },
            ],
        },
    ],
};

export const ifrit: Ability = {
    name: "Ifrit",
    image: IfritImage,
    resourceCost: 2,
    description: "<b>Summon:</b> Burns enemies in front of this character.",
    rarity: RARITIES.UNCOMMON,
    minion: {
        name: "Ifrit",
        image: IfritImage,
        imageOptions: {
            animation: "float",
        },
        maxHP: 7,
        abilities: [
            {
                name: "Ember",
                image: FireMarbleImage,
                actions: [
                    {
                        target: TARGET_TYPES.HOSTILE,
                        type: ACTION_TYPES.RANGE_ATTACK,
                        icon: FireMarbleImage,
                        damage: 2,
                        effects: [
                            {
                                ...burn,
                                duration: 1,
                            },
                        ],
                    },
                ],
            },
        ],
        effects: [
            {
                name: "Radiant Ember Effect",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                onSummoned: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    ability: {
                        name: "Radiant Ember",
                        image: FireMarbleImage,
                        actions: [
                            {
                                target: TARGET_TYPES.HOSTILE,
                                type: ACTION_TYPES.EFFECT,
                                icon: FireMarbleImage,
                                animation: ANIMATION_TYPES.ACTION_EXPLODE,
                                radiate: {
                                    area: 1,
                                    effects: [
                                        {
                                            ...burn,
                                            duration: 3,
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            },
        ],
    },
    actions: [],
    upgrades: [
        {
            minion: {
                maxHP: 1,
                abilities: [
                    {
                        actions: [
                            {
                                damage: 1,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};

export const elquines: Ability = {
    name: "Elquines",
    image: ElquinesImage,
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    description: "<b>Summon:</b> Freezes enemies in front of this character.",
    minion: {
        name: "Elquines",
        image: ElquinesImage,
        imageOptions: {
            animation: "float",
        },
        maxHP: 7,
        abilities: [
            {
                name: "Ice Bolt",
                image: NimbleJewelImage,
                actions: [
                    {
                        target: TARGET_TYPES.HOSTILE,
                        type: ACTION_TYPES.RANGE_ATTACK,
                        icon: NimbleJewelImage,
                        damage: 2,
                        effects: [{ ...chill, duration: 1 }],
                        playbackTime: 500,
                    },
                ],
            },
        ],
        effects: [
            {
                name: "Radiant Ice Effect",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                onSummoned: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    ability: {
                        name: "Radiant Ice",
                        image: NimbleJewelCImage,
                        actions: [
                            {
                                target: TARGET_TYPES.HOSTILE,
                                type: ACTION_TYPES.EFFECT,
                                icon: NimbleJewelCImage,
                                animation: ANIMATION_TYPES.ACTION_EXPLODE,
                                radiate: {
                                    area: 1,
                                    effects: [freeze],
                                },
                            },
                        ],
                    },
                },
            },
        ],
    },
    actions: [],
    upgrades: [
        {
            minion: {
                maxHP: 1,
                abilities: [
                    {
                        actions: [
                            {
                                damage: 1,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};

export const abominableSnowman: Ability = {
    name: "Abominable Snowman",
    description: "Gains {{ minion.effects.1.onAttack.ability.actions.0.armor }} {{{ _armor_ }}} when it attacks or kills.",
    image: GiantSnowmanImage,
    resourceCost: 2,
    rarity: RARITIES.RARE,
    minion: {
        name: "Abominable Snowman",
        image: GiantSnowmanImage,
        maxHP: 3,
        armor: 10,
        abilities: [
            {
                ...attack,
                actions: [
                    {
                        type: ACTION_TYPES.ATTACK,
                        target: TARGET_TYPES.HOSTILE,
                        damage: 5,
                        area: 1,
                    },
                ],
            },
        ],
        effects: [
            taunt,
            {
                name: "Abomination",
                description: "Gains 3 Armor when it attacks or kills.",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                onAttack: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    ability: {
                        name: "Abominable",
                        image: GiantSnowmanImage,
                        actions: [
                            {
                                target: TARGET_TYPES.SELF,
                                type: ACTION_TYPES.EFFECT,
                                armor: 3,
                            },
                        ],
                    },
                },
            },
        ],
    },
    actions: [],
    upgrades: [
        {
            minion: {
                armor: 3,
                abilities: [
                    {
                        actions: [
                            {
                                damage: 1,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};

export const whelp: Ability = {
    name: "Star Whelp",
    resourceCost: 1,
    image: BabyDragonImage,
    description: "<b>Charged:</b> Draw a card. <br/> <b>On death:</b> Draw a card.",
    overrideBodyText: true,
    rarity: RARITIES.UNCOMMON,
    minion: {
        name: "Star Whelp",
        image: BabyDragonImage,
        maxHP: 3,
        abilities: [
            {
                name: "Star Shot",
                image: StarImage,
                actions: [
                    {
                        target: TARGET_TYPES.HOSTILE,
                        type: ACTION_TYPES.RANGE_ATTACK,
                        animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
                        icon: StarImage,
                        damage: 2,
                        playbackTime: 500,
                    },
                ],
            },
        ],
        effects: [
            {
                name: "",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                onDeath: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    drawCards: {
                        amount: 1,
                    },
                },
            },
        ],
    },
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            drawCards: {
                amount: 1,
            },
            conditions: [
                {
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                    hasEffect: "Charged",
                },
            ],
        },
    ],
    upgrades: [
        {
            minion: {
                maxHP: 2,
                abilities: [
                    {
                        actions: [
                            {
                                damage: 1,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};

export const fireSpirit: Ability = {
    name: "Fire Spirit",
    resourceCost: 1,
    image: FireSpiritImage,
    description: "<b>Uncontrollable.</b> On Summon and turn start, Burn a random enemy.",
    overrideBodyText: true,
    rarity: RARITIES.COMMON,
    minion: {
        name: "Fire Spirit",
        image: FireSpiritImage,
        uncontrollable: true,
        maxHP: 6,
        abilities: [
            {
                ...attack,
                actions: [
                    {
                        type: ACTION_TYPES.ATTACK,
                        target: TARGET_TYPES.HOSTILE,
                        damage: 0,
                    },
                ],
            },
        ],
        effects: [
            {
                name: "",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                onSummoned: {
                    ability: {
                        name: "Ember",
                        image: FireMarbleImage,
                        actions: [
                            {
                                target: TARGET_TYPES.RANDOM_HOSTILE,
                                type: ACTION_TYPES.RANGE_ATTACK,
                                icon: FireMarbleImage,
                                effects: [
                                    {
                                        ...burn,
                                        duration: 1,
                                    },
                                ],
                            },
                        ],
                    },
                },
                onTurnStart: {
                    ability: {
                        name: "Ember",
                        image: FireMarbleImage,
                        actions: [
                            {
                                target: TARGET_TYPES.RANDOM_HOSTILE,
                                type: ACTION_TYPES.RANGE_ATTACK,
                                icon: FireMarbleImage,
                                effects: [
                                    {
                                        ...burn,
                                        duration: 1,
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        ],
    },
    actions: [],
    upgrades: [
        {
            minion: {
                maxHP: 2,
            },
        },
    ],
};

export const flareBolt: Ability = {
    name: "Flare Bolt",
    resourceCost: 2,
    description: "Summon a Fire Spirit.",
    image: FireMarbleImage,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: FireMarbleImage,
            damage: 10,
            animationOptions: {
                height: 90,
                rotateToFaceTarget: true,
            },
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            summon: [{ minion: [fireSpirit.minion] }],
        },
    ],
    upgrades: [
        {
            actions: [{ damage: 3 }],
        },
    ],
};

export const astralRewind: Ability = {
    name: "Astral Rewind",
    description: "Create Ephemeral copies of the last {{ actions.0.addLastPlayedCards.amount }} cards you used and add them to your hand.",
    image: EpicAdventureImage,
    depletedOnUse: true,
    rarity: RARITIES.RARE,
    resourceCost: 1,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            icon: EpicAdventureImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            addLastPlayedCards: {
                amount: 3,
                abilityEffects: [
                    {
                        removeParentCardAfterTurn: true,
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    addLastPlayedCards: {
                        amount: 1,
                    },
                },
            ],
        },
    ],
};

export const burst: Ability = {
    name: "Burst",
    description: "<b>+{{ actions.0.bonus.damage }}</b> {{{ _damage_ }}} for every unique {{{ _offense_ }}} card used this battle.",
    overrideBodyText: true,
    image: BlazingExtinctionImage,
    resourceCost: 3,
    rarity: RARITIES.RARE,
    actions: [
        {
            damage: 5,
            area: 2,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: FireMarbleImage,
            animationOptions: {
                width: 75,
                height: 75,
                fadeOut: true,
                brightness: 1.2,
                opacity: 0.5,
            },
            bonus: {
                damage: 2,
                multiplier: {
                    type: MULTIPLIER_TYPES.ABILITIES_USED,
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                    filters: [
                        {
                            property: "actions.0.target",
                            value: TARGET_TYPES.HOSTILE,
                            comparator: "eq",
                        },
                        {
                            property: "actions.0.target",
                            value: TARGET_TYPES.RANDOM_HOSTILE,
                            comparator: "eq",
                        },
                    ],
                    filterUnique: true,
                    filterOutProcs: true,
                },
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const fireworks: Ability = {
    name: "Fireworks",
    resourceCost: "x",
    rarity: RARITIES.RARE,
    image: FireworksImage,
    overrideBodyText: true,
    description:
        "Expend your mana to deal {{ actions.0.damage }} {{{ _damage_ }}} and apply <br/> {{{ _burn_ }}} <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}} {{{ _chill_ }}} <b>{{ actions.0.effects.1.duration }}</b>{{{ _duration_ }}} to up to 3 enemies, X times.",

    performXTimes: true,
    actions: [
        {
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animationOptions: {
                rotateToFaceTarget: true,
                width: 25,
                height: 50,
            },
            damage: 3,
            icon: RocketImage,
            playbackTime: 500,
            numTargets: 2, // 1 more target is hit than stated in this property due to the initial auto target
            targetArea: 5,
            effects: [burn, { ...chill, duration: 1 }],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

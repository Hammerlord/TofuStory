import { TRIGGER_SOURCE_TYPES } from "../../battle/types";
import { doomEffect } from "../../enemy/effect";
import {
    AdvancedChargeImage,
    ArcaneAimImage,
    ArcaneOverdriveImage,
    BabyDragonImage,
    BigSnowballImage,
    BlazingExtinctionImage,
    BlueRushImage,
    CakeTemptationImage,
    ChainLightningSpreadImage,
    ChargedBlastImage,
    ChocolateCupcakeImage,
    ChocolateMuffinImage,
    ColdBeamImage,
    ColdBeamProjectileImage,
    CrystalIlbiImage,
    DarkShockImage,
    DoTPunisherImage,
    DoomImage,
    ElementalAdaptationFPImage,
    ElementalAdaptationImage,
    EliteFirebrandImage,
    EliteFirebrandMoveImage,
    ElquinesImage,
    EmptySackImage,
    EnergyBoltImage,
    EnergyBoltProjectileImage,
    EpicAdventureImage,
    ExplosionImage,
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
    GlowingOrbImage,
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
    LucidDreamImage,
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
    MeditationImage,
    MetalBucketSnowmanImage,
    MysticDoorImage,
    NimbleJewelCImage,
    NimbleJewelImage,
    OldEnergyBoltImage,
    ParalyzeImage,
    ParfaitCupcakeImage,
    PepeRollingASnowballImage,
    PicoPicoHammerImage,
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
    SkullStrikerImage,
    SnowballImage,
    SnowflakeEmojiImage,
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
    WrathImage,
} from "../../images";
import { SnowflakeIcon } from "../../images/icons";
import { chargedEffect } from "../../item/starterItemEffects";
import { RARITIES } from "../../item/types";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    AUTO_CAST_ABILITY_TYPES,
    Ability,
    Action,
    CARD_PILE_TYPES,
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
            damage: 4,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: MagicFangProjectileImage,
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
    description:
        "This turn, gain <b>+{{ actions.0.effects.0.stacks }} {{{ _attUp_ }}}</b> <b>+{{ actions.0.effects.1.stacks }} {{{ _armorUp_ }}}.</b>",
    overrideBodyText: true,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [
                { ...attackPower, stacks: 2, duration: 1 },
                { ...armorUp, stacks: 2, duration: 1 },
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
                        {
                            stacks: 1,
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
            damage: 6,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: EnergyBoltProjectileImage,
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
                    damage: 3,
                    bonus: {
                        damage: 1,
                    },
                },
            ],
        },
    ],
};

const magicClawAction: Action = {
    damage: 7,
    target: TARGET_TYPES.HOSTILE,
    type: ACTION_TYPES.RANGE_ATTACK,
    animation: ANIMATION_TYPES.ONE_WAY,
    animationOptions: {
        rotateToFaceTarget: false,
        width: 100,
        height: 100,
    },
    icon: MagicClawProjectileImage,
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

export const magicClaw: Ability = {
    name: "Magic Claw",
    resourceCost: 2,
    image: MagicClawImage,
    overrideBodyText: true,
    description: "Hits x2. <br/> <b>Charged: +{{ actions.0.bonus.damage }}</b> {{{ _damage_ }}} per hit.",
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
                    description: "Gaining {{ onTurnEnd.armor }} armor at the end of the turn.",
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
            secondaryAction: {
                effects: [
                    {
                        name: "Draw Ping",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.NONE,
                        onTurnDraw: {
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
            addCards: [ping, ping].map((card) => ({ ...card, removeAfterTurn: true })),
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
                    armor: 4,
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
                armor: 2,
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
    description: "Draw {{ actions.0.drawCards.amount }} cards.",
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
    damage: 3,
    target: TARGET_TYPES.RANDOM_HOSTILE,
    type: ACTION_TYPES.RANGE_ATTACK,
    animation: ANIMATION_TYPES.ONE_WAY,
    icon: EnergyBoltProjectileImage,
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
    description: "Randomly hits the target or neighbors, x3",
    actions: [{ ...triboltAction }, { ...triboltAction }, { ...triboltAction }],
    upgrades: [{ actions: [{ damage: 1 }, { damage: 1 }, { damage: 1 }] }],
};

export const mpEater: Ability = {
    name: "Mana Eater",
    image: MPEaterImage,
    resourceCost: 0,
    depletedOnUse: true,
    rarity: RARITIES.RARE,
    description: "Destroy <b>{{ actions.0.resources }}</b> energy on the target.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
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
            actions: [
                {},
                {
                    resources: 1,
                },
            ],
        },
    ],
};

const arcaneAimingAttackPower: Effect = {
    ...attackPower,
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
    resourceCost: 1,
    rarity: RARITIES.RARE,
    description: "This turn, gain <b>+1 {{{ _attUp_ }}}</b> whenever you attack.",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [arcaneAiming],
        },
    ],
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const thunderclap: Ability = {
    name: "Thunderclap",
    image: TeleportMasteryImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    overrideBodyText: true,
    description: "Apply {{{ _stun_ }}}",
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
    overrideBodyText: true,
    description: "Apply <b>{{ actions.0.effects.0.stacks }}</b> {{{ _burn_ }}}",
    actions: [
        {
            area: 1,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    ...burn,
                    stacks: 4,
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
        "Inflicts {{{ _chill_ }}} <b>{{ actions.0.effects.0.onReceiveAttack.effects.0.duration }}</b>{{{ _duration_ }}} on attackers. <br/> </br> <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
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
            damage: 9,
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
                    damage: 3,
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
    description: "Draw a card.",
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
};

export const wishUponAStar: Ability = {
    name: "Wish Upon A Star",
    resourceCost: 1,
    image: StarHairPinImage,
    rarity: RARITIES.COMMON,
    description:
        "<b>Draw</b> + <b>Deck Cycle:</b> Deal <b>{{ actions.0.effects.0.onDrawCard.ability.actions.0.damage }}</b> {{{ _damage_ }}} to a random enemy. <br/> <br/> <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
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
        "Apply <b>{{ actions.0.effects.0.stacks }}</b> {{{ _burn_ }}} <br/> <br/> <b>Charged:</b> <b>+{{ actions.0.bonus.0.effects.0.stacks }}</b> {{{ _burn_ }}}",
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: FireArrowProjectileImage,
            damage: 12,
            animationOptions: {
                height: 90,
                rotateToFaceTarget: true,
            },
            effects: [
                {
                    ...burn,
                    stacks: 2,
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
                            stacks: 2,
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
                    damage: 2,
                    effects: [
                        {
                            stacks: 1,
                        },
                    ],
                    bonus: [
                        {
                            effects: [
                                //@ts-ignore
                                {
                                    stacks: 1,
                                },
                            ],
                        },
                    ],
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
    description: "Draw <b>{{ actions.0.drawCards.amount }}</b>   cards.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: ChocolateCupcakeImage,
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

const pieceOfCake: Ability = {
    name: "Piece Of Cake",
    resourceCost: 0,
    image: PieceOfBirthdayCakeImage,
    description: "Gain <b>{{ actions.0.resources }} {{{ _resource_ }}}.</b> Draw <b>{{ actions.0.drawCards.amount }}</b> cards.",
    overrideBodyText: true,
    removeAfterTurn: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: PieceOfBirthdayCakeImage,
            drawCards: {
                amount: 1,
            },
            resources: 1,
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

export const conjureTreat: Ability = {
    name: "Conjure Treat",
    resourceCost: 1,
    description: "Add 2 treats to your deck.",
    overrideBodyText: true,
    rarity: RARITIES.UNCOMMON,
    image: ParfaitCupcakeImage,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            addCardsToDeck: [parfaitCupcake, chocolateCupcake],
            //addCardsToDeck: [parfaitCupcake, chocolateCupcake, pieceOfCake],
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
            addCards: [{ ...swift, removeAfterTurn: true }],
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
    description: "Deals <b>+{{ actions.0.bonus.damage }}</b> {{{ _damage_ }}} for every other 'Bolt' card in your hand.",
    actions: [
        {
            damage: 8,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: EnergyBoltProjectileImage,
            animationOptions: {
                rotate: -45,
                rotateToFaceTarget: true,
                width: 100,
                height: 100,
            },
            bonus: {
                damage: 3,
                multiplier: {
                    type: MULTIPLIER_TYPES.CARDS_IN_HAND,
                    filters: [{ property: "name", comparator: "includes", value: "bolt" }],
                },
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
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    overrideBodyText: true,
    description: "<b>Search</b> your deck for an {{{ _offense_ }}} card.",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: MagicBoosterImage,
            selectCards: {
                type: SELECT_CARD_TYPES.SEARCH_DECK,
                filters: [
                    {
                        abilityType: "offense",
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            preemptive: true,
        },
    ],
};

export const glacier: Ability = {
    name: "Glacier",
    image: ColdBeamImage,
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    description: "Apply {{{ _chill_ }}} <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}} + {{{ _freeze_ }}}",
    overrideBodyText: true,
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
                    damage: 3,
                },
            ],
        },
    ],
};

export const reboundingShard: Ability = {
    name: "Rebounding Shard",
    image: NimbleJewelImage,
    description: "<b>Echo.</b>",
    overrideBodyText: true,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: NimbleJewelImage,
            animation: ANIMATION_TYPES.YOYO,
            damage: 9,
            addCards: [
                {
                    name: "Rebounding Shard",
                    image: NimbleJewelImage,
                    level: 1,
                    resourceCost: 1,
                    removeAfterTurn: true,
                    rarity: RARITIES.COMMON,
                    actions: [
                        {
                            type: ACTION_TYPES.RANGE_ATTACK,
                            target: TARGET_TYPES.HOSTILE,
                            icon: NimbleJewelImage,
                            animation: ANIMATION_TYPES.YOYO,
                            damage: 9,
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
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                    addCardOptions: {
                        upgradeLevels: 1,
                    },
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
    description: "<b>Charged:</b> Cast again for <b>{{ actions.1.damage }} {{{ _damage_ }}}.</b>",
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
            damage: 1,
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
                    damage: 2,
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
    rarity: RARITIES.UNCOMMON,
    description:
        "<b>Deplete</b> a card. Draw a card. It costs <b>{{ actions.0.drawCards.effects.0.resourceCost }} {{{ _resource_ }}}</b> until discarded.",
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

export const aurora: Ability = {
    name: "Aurora",
    image: HighWisdomImage,
    description: "While in hand, this costs <b>1 {{{ _resource_ }}}</b> less each card you play.",
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
        "For each target hit, gain <b>{{ actions.0.secondaryAction.resources }} {{{ _resource_ }}}</b> but self-inflict <b>{{ actions.0.secondaryAction.flatDamage }} {{{ _damage_ }}}.</b>",
    actions: [
        {
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
    depletedOnUse: true,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: InfinityImage,
            autoCastAbilities: {
                type: AUTO_CAST_ABILITY_TYPES.FROM_CLASS,
                amount: 2,
                filters: [
                    {
                        property: "name",
                        value: "Lucid Dream",
                        comparator: "not",
                    },
                    {
                        property: "name",
                        value: "Metronome",
                        comparator: "not",
                    },
                ],
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
    rarity: RARITIES.RARE,
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
    description:
        "<b>Pierce.</b> Apply {{{ _silence_ }}} + <b>2 {{{ _attDown_ }}}</b> <br/> <br/> <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
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
                    bypassImmunity: true,
                    description: "Disables certain buffs. ATT reduced.",
                    duration: 2,
                    attackPower: -2,
                    maxApplications: 1,
                    override: {
                        portrait: [ScarfSnowmanImage, StrawHatSnowmanImage, MetalBucketSnowmanImage],
                    },
                    persistsWhenDead: true,
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
    overrideBodyText: true,
    description:
        "Apply <b>{{ actions.0.effects.0.stacks }}</b> {{{ _burn_ }}} <br/> <br/> <b>Draw:</b> <b>{{ onDraw.ability.actions.0.effects.0.stacks }}</b> {{{ _burn_ }}} an enemy.",
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
                            stacks: 2,
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
                    stacks: 3,
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
                            ...burn,
                            stacks: 2,
                        },
                    ],
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
    description: "Every turn, you may place a card from your hand on top of your deck.",
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                stashCardEffect,
                {
                    name: "Temporal Bag Effect",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.NONE,
                    onTurnStart: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        effects: [stashCardEffect],
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

export const greatestBolt: Ability = {
    name: "Greatest Bolt",
    resourceCost: 2,
    rarity: RARITIES.RARE,
    image: PurpleEnergyBoltImage,
    description: "<b>+2</b> {{{ _damage_ }}} for every other 'Bolt' card you own.",
    disableConditionGlow: true,
    overrideBodyText: true,
    actions: [
        {
            damage: 14,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: PurpleEnergyBoltProjectileImage,
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
                    damage: 5,
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
    description: "Create a copy of a non-summon card in your hand.",
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.COPY_FROM_HAND,
                filters: [
                    {
                        hasMinion: true,
                        comparator: "not",
                    },
                ],
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
    description:
        "Destroy <b>{{ actions.0.destroyArmor }} {{{ _armor_ }}}</b> and apply <b>{{ actions.0.effects.0.stacks }} {{{ _burn_ }}}</b>",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.BEAM,
            icon: FireMarbleImage,
            destroyArmor: 0.5,
            effects: [
                {
                    ...burn,
                    stacks: 5,
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
    resourceCost: 3,
    rarity: RARITIES.RARE,
    description: "Deals <b>{{ actions.0.bonus.damage }}</b> {{{ _damage_ }}} for each {{{ _burn_ }}} on the target.",
    actions: [
        {
            damage: 10,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.BEAM,
            icon: FireArrowProjectileImage,
            bonus: {
                damage: 2,
                multiplier: {
                    calculationTarget: CONDITION_TARGETS.TARGET,
                    type: MULTIPLIER_TYPES.EFFECT_STACKS,
                    filters: [{ property: "name", value: "Burn", comparator: "eq" }],
                },
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    bonus: {
                        damage: 1,
                    },
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
        "Apply <b>{{ actions.0.effects.0.stacks }}</b> {{{ _burn_ }}}. Gain <br/> <b>{{ actions.0.effects.1.onTurnStart.effects.0.onTurnStart.healing }} {{{ _healing_ }}}</b> + <b>{{ actions.0.effects.1.onTurnStart.effects.0.resourcesPerTurn }} {{{ _resource_ }}}</b> per turn. <br/> <b>{{ actions.0.effects.1.duration }}</b>{{{ _duration_ }}}",
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
                    stacks: 3,
                },
                {
                    name: "Leeching Flame",
                    description: "Leeching 1 HP and 1 Mana while the target has Burn.",
                    icon: EliteFirebrandImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.DEBUFF,
                    maxApplications: 1,
                    duration: 2,
                    onTurnStart: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_APPLIER,
                        effects: [
                            {
                                name: "Leeching Flame Regen",
                                type: EFFECT_TYPES.NONE,
                                class: EFFECT_CLASSES.BUFF,
                                resourcesPerTurn: 1,
                                onTurnStart: {
                                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                    healing: 1,
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
            actions: [
                {
                    effects: [
                        {
                            stacks: 1,
                        },
                        {
                            duration: 1,
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
    description: "Gain <b>1 Pristine.</b>",
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
    overrideBodyText: true,
    description:
        "Apply {{{ _freeze_ }}}<br/> <br/> <b>Draw:</b> {{{ _chill_ }}} <b>{{ onDraw.ability.actions.0.effects.0.duration }}</b>{{{ _duration_ }}} an enemy.",
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
            icon: IcicleImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
            damage: 5,
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
                filters: [
                    {
                        property: "name",
                        value: "Lucid Dream",
                        comparator: "not",
                    },
                    {
                        property: "name",
                        value: "Hyper Metronome",
                        comparator: "not",
                    },
                ],
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
    description: "Apply {{{ _freeze_ }}}",
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
                    damage: 3,
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
    description: "Apply <b>{{{ _chill_ }}} {{ actions.0.effects.0.duration }} {{{ _duration_ }}}</b>",
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
    description: "Apply <b>{{{ _chill_ }}} {{ actions.0.effects.0.duration }} {{{ _duration_ }}}</b>",
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN,
            icon: SnowballImage,
            animationOptions: {
                width: 40,
                height: 40,
            },
            damage: 7,
            effects: [
                {
                    ...chill,
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
    description:
        "Bounces to up to 2 other targets. Grants all allies <b>{{ actions.0.secondaryAction.armor }}</b> {{{ _armor_ }}} per hit.",

    rarity: RARITIES.COMMON,
    actions: [
        {
            damage: 8,
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
                armor: 2,
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
                    damage: 3,
                    secondaryAction: {
                        armor: 1,
                    },
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
    rarity: RARITIES.UNCOMMON,
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
                    amount: 1,
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
    description: "Draw a card.",
    actions: [
        {
            armor: 6,
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
                    armor: 3,
                },
            ],
        },
    ],
};

export const zap: Ability = {
    name: "Zap",
    resourceCost: 1,
    image: ThunderSparkImage,
    overrideBodyText: true,
    description: "<b>Draw:</b> {{{ _stun_ }}} an enemy.",
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
            icon: ThunderSparkImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
                flash: 200,
            },
            damage: 5,
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
    description:
        "Apply <b>{{ actions.0.effects.0.stacks }}</b> {{{ _burn_ }}} + {{{ _chill_ }}} <b>{{ actions.0.effects.1.duration }}</b>{{{ _duration_ }}}",
    overrideBodyText: true,
    actions: [
        {
            damage: 5,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN,
            icon: FrostfireProjectileImage,
            animationOptions: {
                flash: 500,
            },
            effects: [
                {
                    ...burn,
                    stacks: 2,
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
    rarity: RARITIES.RARE,
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
    description: "<b>+1 {{{ _armorUp_ }}}</b>",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            armor: 7,
            effects: [armorUp],
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

const icicleMinion: Minion = {
    name: "Icicle",
    image: IcicleMinionImage,
    description:
        "<b>Controllable.</b> <b>Attack:</b> Applies {{{ _chill_ }}} and self-inflicts 1 {{{ _damage_ }}}. <br/> Applies {{{ _chill_ }}} to attackers.",
    maxHP: 1,
    controllable: true,
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
            description: "On attack: Applies Chill and self-inflicts 1 damage. Attackers are Chilled.",
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
    description: "The next {{ actions.0.effects.0.stacks }} times you play a <b>1+ {{{ _resource }}}</b> cost card, summon an Icicle.",
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
    description: "<b>Summon:</b> <b>Radiate 3 {{{ _burn_ }}}</b> to enemies within 2 spaces.",
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
                                stacks: 2,
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
                                            stacks: 3,
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
    description: "<b>Summon:</b> <b>Radiate {{{ _freeze_ }}}</b> to enemies within 2 spaces.",
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
    description: "Gains {{ minion.effects.1.onAttack.ability.actions.0.armor }} {{{ _armor_ }}} when it attacks.",
    image: GiantSnowmanImage,
    resourceCost: 2,
    rarity: RARITIES.RARE,
    minion: {
        name: "Abominable Snowman",
        image: GiantSnowmanImage,
        maxHP: 3,
        armor: 7,
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
                description: "Gains 3 Armor when it attacks.",
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
    description: "<b>Attack:</b> Draw a card.",
    overrideBodyText: true,
    rarity: RARITIES.UNCOMMON,
    minion: {
        name: "Star Whelp",
        image: BabyDragonImage,

        maxHP: 4,
        abilities: [
            {
                name: "Shoot",
                image: StarImage,
                actions: [
                    {
                        target: TARGET_TYPES.HOSTILE,
                        type: ACTION_TYPES.RANGE_ATTACK,
                        animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
                        icon: StarImage,
                        damage: 2,
                        drawCards: {
                            amount: 1,
                        },
                    },
                ],
            },
        ],
    },
    actions: [],
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
    overrideBodyText: true,
    rarity: RARITIES.COMMON,
    minion: {
        name: "Fire Spirit",
        image: FireSpiritImage,
        maxHP: 5,
        abilities: [
            {
                name: "Shoot",
                image: FireMarbleImage,
                actions: [
                    {
                        target: TARGET_TYPES.HOSTILE,
                        type: ACTION_TYPES.RANGE_ATTACK,
                        icon: FireMarbleImage,
                        damage: 1,
                        effects: [
                            {
                                ...burn,
                                stacks: 1,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    actions: [],
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

export const flareBolt: Ability = {
    name: "Flare Bolt",
    resourceCost: 2,
    description: "Apply <b>{{ actions.0.effects.0.stacks }} {{{ _burn_ }}}.</b> Summon a <b>Fire Spirit.</b>",
    image: FireMarbleImage,
    rarity: RARITIES.UNCOMMON,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: FireMarbleImage,
            damage: 5,
            effects: [
                {
                    ...burn,
                    stacks: 3,
                },
            ],
            animationOptions: {
                height: 90,
                rotateToFaceTarget: true,
            },
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            summon: [{ minion: [fireSpirit.minion as Minion] }],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
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

export const astralRewind: Ability = {
    name: "Astral Rewind",
    description: "Add Ephemeral copies of the last <b>{{ actions.0.addLastPlayedCards.amount }}</b> cards you used to your hand.",
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
                amount: 2,
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
    disableConditionGlow: true,
    resourceCost: 2,
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
        "Expend all {{{ _resource_ }}} to deal <br/> <b>{{ actions.0.damage }}</b> {{{ _damage_ }}} <b>{{ actions.0.effects.0.stacks }}</b> {{{ _burn_ }}} to up to 3 enemies, X times.",
    actions: [
        {
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.FIREWORKS,
            animationOptions: {
                rotateToFaceTarget: true,
                width: 25,
                height: 50,
            },
            damage: 5,
            icon: RocketImage,
            numTargets: 2, // 1 more target is hit than stated in this property due to the initial auto target
            targetArea: 5,
            effects: [{ ...burn, stacks: 2 }],
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

export const blizzard: Ability = {
    name: "Blizzard",
    resourceCost: "x",
    rarity: RARITIES.UNCOMMON,
    image: SnowflakeEmojiImage,
    description:
        "Expend all {{{ _resource_ }}} to deal {{{ _chill_ }}} <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}, <b>X</b> times.",
    overrideBodyText: true,
    actions: [
        {
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
            icon: SnowflakeEmojiImage,
            damage: 3,
            effects: [chill],
            area: 2,
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

export const shatter: Ability = {
    name: "Shatter",
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    image: CrystalIlbiImage,
    description:
        "Deal <b>{{ actions.0.damage }}</b> {{{ _damage_ }}} per unique debuff on the target. <b>Charged: +{{ actions.0.bonus.damage }} {{{ _damage_ }}}</b> more per.",
    overrideBodyText: true,
    actions: [
        {
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
            icon: CrystalIlbiImage,
            damage: 2,
            multiplier: {
                type: MULTIPLIER_TYPES.DEBUFFS,
                calculationTarget: CONDITION_TARGETS.TARGET,
            },
            bonus: {
                damage: 1,
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
                    damage: 1,
                },
            ],
        },
    ],
};

export const lucidDream: Ability = {
    name: "Lucid Dream",
    resourceCost: 1,
    image: LucidDreamImage,
    rarity: RARITIES.RARE,
    removeAfterTurn: true,
    description: "Cast a random spell for every unique {{{ _offense_ }}} card played this battle. <b>(Spells: {{ _multiplier_ }})</b>",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: LucidDreamImage,
            autoCastAbilities: {
                type: AUTO_CAST_ABILITY_TYPES.FROM_CLASS,
                amount: 1,
                filters: [
                    {
                        property: "name",
                        value: "Lucid Dream",
                        comparator: "not",
                    },
                    {
                        property: "name",
                        value: "Metronome",
                        comparator: "not",
                    },
                ],
            },
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
    ],
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const picoPicoHammerAbility: Ability = {
    name: "Pico Pico Hammer",
    resourceCost: 1,
    image: PicoPicoHammerImage,
    rarity: RARITIES.UNCOMMON,
    description: "Apply {{{ _stun_ }}}. <br/> <b>Charged:</b> Cast another <b>{{ actions.1.damage }}</b> {{{ _damage_ }}} hammer.",
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: PicoPicoHammerImage,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
            effects: [stun],
        },
        {
            damage: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: PicoPicoHammerImage,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
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
                    damage: 2,
                },
                {
                    damage: 1,
                },
            ],
        },
    ],
};

export const waningBlast: Ability = {
    name: "Waning Blast",
    rarity: RARITIES.COMMON,
    resourceCost: 0,
    image: GlowingOrbImage,
    description: "<b>Play:</b> Reduce this card's {{{ _damage_ }}} by <b>2.</b>",
    onUse: {
        abilityEffects: [
            {
                removeOnDiscard: false,
                damage: -2,
            },
        ],
    },
    actions: [
        {
            damage: 10,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: GlowingOrbImage,
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

export const wrath: Ability = {
    name: "Wrath",
    rarity: RARITIES.UNCOMMON,
    image: WrathImage,
    resourceCost: 1,
    description: "Reduces the cost of a random card in hand by <b>1 {{{ _resource_ }}}</b> until discarded.",
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: WrathImage,
            animationOptions: {
                width: 100,
                height: 100,
            },
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: WrathImage,
            applyAbilityEffects: {
                pile: CARD_PILE_TYPES.HAND,
                amount: 1,
                abilityEffects: [
                    {
                        resourceCost: -1,
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

export const chargedBlast: Ability = {
    name: "Charged Blast",
    description: "<b>Charged: +{{ actions.0.bonus.damage }}</b> {{{ _damage_ }}}",
    image: ChargedBlastImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    overrideBodyText: true,
    actions: [
        {
            damage: 1,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: ChargedBlastImage,
            animationOptions: {
                width: 100,
                height: 100,
            },
            bonus: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
                damage: 12,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    bonus: {
                        damage: 3,
                    },
                },
            ],
        },
    ],
};

export const flameWall: Ability = {
    name: "Flame Wall",
    description:
        "Inflicts <b>{{ actions.0.effects.0.onReceiveAttack.effects.0.stacks }} {{{ _burn_ }}}</b> on attackers. <br/> </br> <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
    image: ExplosionImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    overrideBodyText: true,
    actions: [
        {
            target: TARGET_TYPES.FRIENDLY,
            type: ACTION_TYPES.EFFECT,
            armor: 7,
            effects: [
                {
                    name: "Flame Wall",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    description: "Attackers are Burned.",
                    icon: ExplosionImage,
                    portraitImage: ExplosionImage,
                    duration: 3,
                    maxApplications: 1,
                    onReceiveAttack: {
                        targetType: TRIGGER_TARGET_TYPES.ACTOR,
                        effects: [{ ...burn, stacks: 1 }],
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

export const boltTag: Ability = {
    name: "Bolt Tag",
    description: "Command a random summoned minion to attack.",
    image: ChainLightningSpreadImage,
    rarity: RARITIES.COMMON,
    resourceCost: 1,
    actions: [
        {
            damage: 9,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: EnergyBoltProjectileImage,
            animationOptions: {
                rotate: -45,
                rotateToFaceTarget: true,
            },
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.RANDOM_FRIENDLY,
            excludeActor: true,
            induceCombatantAttack: true,
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

export const meditation: Ability = {
    name: "Meditation",
    image: MeditationImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    overrideBodyText: true,
    description: "Next turn, gain <b>Charged.</b> <b>Bide.</b>",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Meditation",
                    icon: MeditationImage,
                    resourcesPerTurn: 1,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 2,
                    // Remove AFTER the card draw (see upgrade)
                    onTurnInProgress: {
                        effects: [{ ...chargedEffect }],
                        removeEffect: true,
                    },
                },
            ],
        },
    ],
    upgrades: [
        {
            description: "Next turn, gain <b>Charged</b> and draw +1 card. <b>Bide.</b>",
            actions: [
                {
                    effects: [
                        {
                            drawCardsPerTurn: 1,
                        },
                    ],
                },
            ],
        },
    ],
};

export const mysticDoor: Ability = {
    name: "Mystic Door",
    rarity: RARITIES.UNCOMMON,
    image: MysticDoorImage,
    resourceCost: 1,
    description: "Draw {{ actions.0.drawCards.amount }} cards. <br/> <b>Charged:</b> Draw from your discard instead.",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            drawCards: {
                amount: 2,
            },
            conditions: [
                {
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                    comparator: "not",
                    hasEffect: "Charged",
                },
            ],
        },
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            moveCards: {
                from: "discard",
                to: "hand",
                amount: 2,
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
                    drawCards: {
                        amount: 1,
                    },
                },
                {
                    moveCards: {
                        amount: 1,
                    },
                },
            ],
        },
    ],
};

export const doomAbility: Ability = {
    name: "Doom",
    description: "Inflict <b>Doom.</b> <br/> <b>Charged:</b> +1 Area.",
    overrideBodyText: true,
    resourceCost: 3,
    image: DoomImage,
    rarity: RARITIES.RARE,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            bonus: {
                area: 1,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
            },
            animations: [
                {
                    type: ANIMATION_TYPES.ACTION_EXPLODE,
                    image: DoomImage,
                },
                {
                    type: ANIMATION_TYPES.ONE_WAY,
                    image: SkullStrikerImage,
                    options: {
                        rotate: 135,
                        rotateToFaceTarget: true,
                    },
                },
            ],
            effects: [
                {
                    ...doomEffect,
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

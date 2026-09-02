import { cloneDeep } from "lodash";
import { TRIGGER_SOURCE_TYPES } from "../../battle/types";
import { attack } from "../../enemy/abilities";
import { doomEffect } from "../../enemy/effect";
import {
    ArcheryMasteryImage,
    ArrowBlowImage,
    ArrowBombImage,
    ArrowEruptionImage,
    ArrowRainImage,
    AvengersArrowImage,
    BlazingExtinctionImage,
    BlindImage,
    BlockImage,
    BlueDirosImage,
    BreadImage,
    BroilerShotImage,
    BronzeCrossbowArrowImage,
    CatImage,
    ChestnutLeafImage,
    ChickenCouponImage,
    CocaFruitImage,
    ConcentrateImage,
    CoveringFireImage,
    CriticalShotImage,
    CrossbowImage,
    CrowImage,
    CupOfCoffeeImage,
    DeansBagImage,
    DogImage,
    DoubleJumpImage,
    DoubleShotImage,
    DragonsBreathImage,
    DrainArrowImage,
    ElitePuppetImage,
    EntrenchedFireImage,
    EucalyptusLeavesImage,
    EvasionBoostImage,
    FinalAttackImage,
    FireMarbleImage,
    FlamingFeatherImage,
    FocusImage,
    FrozenArrowImage,
    GoldenEagleImage,
    GreenLeafShoesImage,
    GreenWinterHatImage,
    GrossJaegerImage,
    GuidesWhistleImage,
    HamstringImage,
    HarvestDamageSkinImage,
    HerosWillImage,
    HuntersBowImage,
    HurricaneImage,
    IllusionStepImage,
    IronArrowImage,
    LycanthropeImage,
    MagicArrowImage,
    MarksmanBoostImage,
    MarksmanshipImage,
    MatchaManLeafImage,
    MeatImage,
    MortalBlowImage,
    PhoenixEggImage,
    PhoenixImage,
    PiercingArrowImage,
    PowerKnockbackImage,
    PuppetImage,
    Puppetree3Image,
    RavenImage,
    RoastingShotImage,
    ScarecrowImage,
    SharpEyesImage,
    ShatteringArrowImage,
    SkeletonOfHorrorImage,
    SkullStrikerImage,
    SlowAndSteadyImage,
    SnapfreezeShotImage,
    SnipeImage,
    SoulArrowImage,
    SteelArrowImage,
    StrafeImage,
    TakeAShotImage,
    TargetLockImage,
    ThrustImage,
    TortieShellImage,
    TragosImage,
    UltimateStrafeImage,
    VengeanceImage,
    WeaponMasteryLGImage,
    WoodenSlingshotImage,
    WuTienEagleImage,
} from "../../images";
import { BullseyeIcon } from "../../images/icons";
import { RARITIES } from "../../item/types";
import { CRITICAL_KEYWORD } from "../AbilityView/constants";
import {
    armorUp,
    attackDown,
    attackPower,
    avenger,
    bleed,
    burn,
    chill,
    defDown,
    freeze,
    preventArmorDecayPlayer,
    stun,
    taunt,
    thorns,
} from "../Effects";
import {
    Ability,
    ACTION_TYPES,
    ANIMATION_TYPES,
    CARD_PILE_TYPES,
    CONDITION_TARGETS,
    Effect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    FROM_CARD_PILE_TYPES,
    Minion,
    MULTIPLIER_TYPES,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../types";

const bowmanAnimationOption = {
    rotateToFaceTarget: true,
    rotate: 135,
    weapon: {
        rotateToFaceTarget: true,
    },
};

export const aimedShot: Ability = {
    name: "Aimed Shot",
    resourceCost: 1,
    image: TargetLockImage,
    rarity: RARITIES.RARE,
    retain: true,
    removeAfterTurn: true,
    isUnique: true,
    description: "<b>Pierce.</b> Removes all <b>Aim</b> stacks to deal +{{{ _damage_ }}} equal to that amount.",
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            bypassStealth: true,
            bypassImmunity: true,
            damage: 10,
            animationOptions: bowmanAnimationOption,
            secondaryAction: {
                removeEffects: ["Aim"],
            },
        },
    ],
};

export const aimEffect: Effect = {
    name: "Aim",
    icon: TargetLockImage,
    skillBonus: [{ skill: aimedShot.name, comparator: "eq", damage: 1 }],
    maxApplications: 1,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
};

export const bowmanDefaultAttack: Ability = {
    name: "Shoot",
    image: AvengersArrowImage,
    resourceCost: 0,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            damage: 3,
            animationOptions: bowmanAnimationOption,
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

export const sharpEyes: Ability = {
    name: "Sharp Eyes",
    resourceCost: 1,
    image: SharpEyesImage,
    description: "Apply <b>{{ actions.0.effects.0.stacks }} {{{ _defDown_ }}} {{ actions.0.effects.0.duration }} {{{ _duration_ }}}</b>",
    overrideBodyText: true,
    actions: [
        {
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.EFFECT,
            area: 1,
            effects: [{ ...defDown, duration: 2, stacks: 2 }],
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

export const volley: Ability = {
    name: "Volley",
    resourceCost: 1,
    image: ArrowRainImage,
    overrideBodyText: true,
    actions: [
        {
            damage: 4,
            area: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
        },
    ],
    upgrades: [
        {
            description: "<b>Critical: +{{ actions.0.bonus.damage }} {{{ _damage_ }}}</b>",
            onDraw: {
                chance: 0,
                abilityEffects: [
                    {
                        name: CRITICAL_KEYWORD,
                        maxApplications: 1,
                        highlightCard: true,
                    },
                ],
            },
            actions: [
                {
                    damage: 1,
                    bonus: {
                        damage: 2,
                        conditions: [
                            {
                                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                hasAbilityEffectName: CRITICAL_KEYWORD,
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

export const shootAbility: Ability = {
    name: "Shoot",
    resourceCost: 1,
    image: AvengersArrowImage,
    overrideBodyText: true,
    description: "<b>Critical: +{{ actions.0.bonus.damage }} {{{ _damage_ }}}</b>",
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            damage: 7,
            animationOptions: bowmanAnimationOption,
            bonus: {
                damage: 4,
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
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
                    bonus: {
                        damage: 1,
                    },
                },
            ],
        },
    ],
};

export const defend: Ability = {
    name: "Defend",
    resourceCost: 1,
    image: BlockImage,
    actions: [
        {
            armor: 5,
            target: TARGET_TYPES.FRIENDLY,
            type: ACTION_TYPES.EFFECT,
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

const puppetMinion = {
    name: "Puppet",
    image: ScarecrowImage,
    maxHP: 7,
    abilities: [],
    overrideBodyText: true,
    description: "Has <b>{{ effects.1.stacks }} {{{ _thorns_ }}}</b>",
    effects: [taunt, thorns],
};

export const puppetAbility: Ability = {
    name: "Puppet",
    image: ScarecrowImage,
    overrideBodyText: true,
    description: "Has <b>{{ minion.effects.1.stacks }} {{{ _thorns_ }}}</b>",
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    minion: puppetMinion,
    actions: [],
    upgrades: [
        {
            minion: {
                maxHP: 3,
            },
        },
    ],
};

export const arrowBomb: Ability = {
    name: "Arrow Bomb",
    image: ArrowBombImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    description: "Apply {{{ _stun_ }}}",
    overrideBodyText: true,
    actions: [
        {
            damage: 5,
            area: 1,
            effects: [stun],
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
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

export const ironArrow: Ability = {
    name: "Iron Arrow",
    image: IronArrowImage,
    description: "Damage is split between targets.",
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            damage: 13,
            damageDividedByTargets: true,
            area: 1,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 4,
                },
            ],
        },
    ],
};

export const soulShot: Ability = {
    name: "Soul Shot",
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    image: MagicArrowImage,
    removeAfterTurn: true,
    overrideBodyText: true,
    description: "Draw a card. <br/> <b>Critical:</b> <b>+{{ actions.0.bonus.drawCards.amount }}</b> more card.",
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: MagicArrowImage,
            bonus: {
                drawCards: {
                    amount: 1,
                },
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
                    },
                ],
            },
            animationOptions: {
                ...bowmanAnimationOption,
                width: 50,
                height: 50,
            },
            drawCards: {
                amount: 1,
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

export const soulArrow: Ability = {
    name: "Soul Arrow",
    rarity: RARITIES.UNCOMMON,
    image: SoulArrowImage,
    resourceCost: 1,
    depletedOnUse: true,
    actions: [
        {
            addCardsToDeck: [soulShot, soulShot],
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

const eagleMinion = {
    name: "Eagle",
    image: WuTienEagleImage,
    maxHP: 5,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                    effects: [{ ...bleed, stacks: 1 }],
                },
            ],
        },
    ],
    effects: [
        {
            name: "Critical Bonus",
            description: "Granting +{{ criticalChance }} Critical Chance.",
            icon: CriticalShotImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            criticalChance: 0.1,
        },
    ],
};

export const eagleAbility: Ability = {
    name: "Eagle",
    image: WuTienEagleImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    overrideBodyText: true,
    description: "Grants <b>+{{ minion.effects.0.criticalChance }} Critical</b> while active.",
    minion: eagleMinion,
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

export const darkArrow: Ability = {
    name: "Dark Arrow",
    resourceCost: 1,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    image: FrozenArrowImage,
    description: "Apply <b>{{ actions.0.effects.0.stacks }} {{{ _bleed_ }}}</b>",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: FrozenArrowImage,
            animationOptions: {
                ...bowmanAnimationOption,
                brightness: -0.75,
            },
            effects: [
                {
                    ...bleed,
                    stacks: 10,
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
                            stacks: 3,
                        },
                    ],
                },
            ],
        },
    ],
};

export const doubleShot: Ability = {
    name: "Double Shot",
    resourceCost: 1,
    overrideBodyText: true,
    description: "Hits x2 <br/> <b>Critical: +{{ actions.0.bonus.damage }} {{{ _damage_ }}}</b> per hit",
    image: DoubleShotImage,
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            damage: 4,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
            bonus: {
                damage: 2,
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
                    },
                ],
            },
        },
        {
            damage: 4,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
            bonus: {
                damage: 2,
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
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
                    bonus: {
                        damage: 2,
                    },
                },
                {
                    damage: 1,
                    bonus: {
                        damage: 2,
                    },
                },
            ],
        },
    ],
};

const strafeHit = {
    damage: 4,
    type: ACTION_TYPES.RANGE_ATTACK,
    target: TARGET_TYPES.HOSTILE,
    animation: ANIMATION_TYPES.ONE_WAY,
    icon: AvengersArrowImage,
    animationOptions: bowmanAnimationOption,
    bonus: {
        damage: 1,
        conditions: [
            {
                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                hasAbilityEffectName: CRITICAL_KEYWORD,
            },
        ],
    },
};

export const strafe: Ability = {
    name: "Strafe",
    resourceCost: 2,
    overrideBodyText: true,
    description: "Hits x4 <br/> <b>Critical: +{{ actions.0.bonus.damage }} {{{ _damage_ }}}</b> per hit",
    rarity: RARITIES.UNCOMMON,
    image: StrafeImage,
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [{ ...strafeHit }, { ...strafeHit }, { ...strafeHit }, { ...strafeHit }],
    upgrades: [
        {
            actions: [
                {
                    damage: 1,
                },
                {
                    damage: 1,
                },
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

export const mortalBlow: Ability = {
    name: "Mortal Blow",
    resourceCost: 1,
    description: "Deals extra damage based on target's missing HP, up to <b>{{ actions.0.bonus.damage }}</b>.",
    overrideBodyText: true,
    rarity: RARITIES.UNCOMMON,
    image: MortalBlowImage,
    actions: [
        {
            damage: 8,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,

            bonus: {
                damage: 10,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        healthPercentage: 1,
                        comparator: "lt",
                    },
                ],
                multiplier: {
                    type: MULTIPLIER_TYPES.MISSING_HP,
                    calculationTarget: CONDITION_TARGETS.TARGET,
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
                        damage: 5,
                    },
                },
            ],
        },
    ],
};

export const powerShot: Ability = {
    name: "Power Shot",
    resourceCost: 2,
    description:
        "<b>+{{ actions.0.bonus.0.damage }}</b> {{{ _damage_ }}} x every other 'Shot' / 'Shoot' card you own. <b>Critical: +1</b> {{{ _damage_ }}} more.",
    disableConditionGlow: true,
    overrideBodyText: true,
    image: PiercingArrowImage,
    rarity: RARITIES.RARE,
    onDraw: {
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            damage: 12,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
            bonus: [
                {
                    damage: 2,
                    multiplier: {
                        type: MULTIPLIER_TYPES.ALL_CARDS,
                        filters: [
                            { property: "name", comparator: "includes", value: "shoot" },
                            { property: "name", comparator: "includes", value: "shot" },
                        ],
                    },
                },
                {
                    damage: 1,
                    conditions: [
                        {
                            sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                            calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            hasAbilityEffectName: CRITICAL_KEYWORD,
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
                    damage: 5,
                },
            ],
        },
    ],
};

export const guard: Ability = {
    name: "Guard",
    resourceCost: 1,
    image: GreenWinterHatImage,
    overrideBodyText: true,
    description: "<b>Critical: +{{ actions.0.bonus.armor }} {{{ _armor_ }}}</b>",
    rarity: RARITIES.COMMON,
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            armor: 7,
            target: TARGET_TYPES.FRIENDLY,
            type: ACTION_TYPES.EFFECT,
            bonus: {
                armor: 3,
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 3,
                    bonus: {
                        armor: 2,
                    },
                },
            ],
        },
    ],
};

export const artillery: Ability = {
    name: "Artillery",
    description:
        "When you draw cards, shoot a random target for <b>{{ actions.0.effects.0.onDrawCard.ability.actions.0.damage }} {{{ _damage_ }}}</b> + {{{ _bleed_ }}}.",
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    image: SteelArrowImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            icon: SteelArrowImage,
            animation: ANIMATION_TYPES.CONSUMABLE,
            effects: [
                {
                    name: "Artillery",
                    icon: AvengersArrowImage,
                    duration: 4,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    onDrawCard: {
                        ability: {
                            name: "Shoot",
                            image: AvengersArrowImage,
                            actions: [
                                {
                                    damage: 2,
                                    type: ACTION_TYPES.RANGE_ATTACK,
                                    target: TARGET_TYPES.HOSTILE,
                                    animation: ANIMATION_TYPES.ONE_WAY,
                                    icon: AvengersArrowImage,
                                    effects: [{ ...bleed, stacks: 1 }],
                                    animationOptions: bowmanAnimationOption,
                                },
                            ],
                        },
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
                            onDrawCard: {
                                ability: {
                                    actions: [
                                        {
                                            damage: 1,
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export const barbedArrows: Ability = {
    name: "Barbed Arrows",
    resourceCost: 0,
    image: ArrowEruptionImage,
    overrideBodyText: true,
    description: "Apply <b>{{ actions.0.effects.0.stacks }}</b> {{{ _bleed_ }}}",
    actions: [
        {
            damage: 1,
            area: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
            effects: [{ ...bleed, stacks: 1 }],
        },
    ],
    upgrades: [
        {
            description: "Apply <b>{{ actions.0.effects.0.stacks }}</b> {{{ _bleed_ }}} <br/> <b>Critical: +1 {{{ _bleed_ }}}</b>",
            onDraw: {
                chance: 0,
                abilityEffects: [
                    {
                        name: CRITICAL_KEYWORD,
                        maxApplications: 1,
                        highlightCard: true,
                    },
                ],
            },
            actions: [
                {
                    damage: 1,
                    bonus: {
                        effects: [{ ...bleed, stacks: 1 }],
                        conditions: [
                            {
                                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                hasAbilityEffectName: CRITICAL_KEYWORD,
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

export const focus: Ability = {
    name: "Focus",
    resourceCost: 1,
    image: FocusImage,
    description:
        "Gain <b>+{{ actions.0.effects.1.criticalChance }} Critical {{ actions.0.effects.0.duration }}{{{ _duration_ }}}</b> and <b>Bide.</b>",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Focusing",
                    icon: FocusImage,
                    resourcesPerTurn: 1,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 2,
                },
                {
                    name: "Critical",
                    icon: BullseyeIcon,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    criticalChance: 0.2,
                    duration: 2,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {},
                        {
                            criticalChance: 0.1,
                        },
                    ],
                },
            ],
        },
    ],
};

export const chargedShot: Ability = {
    name: "Charged Shot",
    depletedOnUse: true,
    rarity: RARITIES.RARE,
    overrideBodyText: true,
    description:
        "Gain <b>{{ actions.0.secondaryAction.armor }} {{{ _armor_ }}}</b> and <b>{{ actions.0.secondaryAction.effects.0.stacks }} Aim.</b>",
    resourceCost: 1,
    image: DrainArrowImage,
    actions: [
        {
            damage: 15,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: {
                ...bowmanAnimationOption,
                flash: 200,
                width: 50,
                height: 50,
                weapon: {
                    rotateToFaceTarget: true,
                    glow: true,
                },
            },
            secondaryAction: {
                armor: 10,
                effects: [{ ...aimEffect, stacks: 10 }],
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 5,
                    secondaryAction: {
                        armor: 3,
                        effects: [
                            {
                                stacks: 3,
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

export const finalAttack: Ability = {
    name: "Final Attack",
    description: "<b>+{{ actions.0.bonus.damage }}</b> {{{ _damage_ }}} for each attack you made this turn.",
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    image: FinalAttackImage,
    actions: [
        {
            damage: 1,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,

            bonus: {
                damage: 2,
                multiplier: {
                    type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                    filterOutProcs: true,
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

export const coveringFire: Ability = {
    name: "Covering Fire",
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    image: CoveringFireImage,
    description: "You and your allies gain <b>{{ actions.0.secondaryAction.armor }} {{{ _armor_ }}}</b>",
    overrideBodyText: true,
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,

            secondaryAction: {
                armor: 2,
                area: 2,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                    secondaryAction: {
                        armor: 1,
                    },
                },
            ],
        },
    ],
};

export const tagShot: Ability = {
    name: "Tag Shot",
    description: "Command a random summoned minion to attack.",
    rarity: RARITIES.COMMON,
    resourceCost: 1,
    image: HamstringImage,
    actions: [
        {
            damage: 10,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.RANDOM_FRIENDLY,
            excludeActor: true,
            induceCombatantAttack: true,
            conditions: [
                {
                    numFriendly: 1, // Including the actor itself
                    comparator: "gt",
                    calculationTarget: CONDITION_TARGETS.ACTOR,
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

export const wolfMinion: Minion = {
    name: "Wolf",
    image: DogImage,
    maxHP: 4,
    description: "Gains <b>+1 {{{ _damage_}}}</b> for every other ally.",
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
    ],
    effects: [
        {
            name: "One with the Pack",
            description: "Gaining +1 ATT for every other ally.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: WeaponMasteryLGImage,
            attackPower: 1,
            multiplier: {
                type: MULTIPLIER_TYPES.NUM_ALLIES,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
};

export const wolfAbility: Ability = {
    name: "Wolf",
    image: DogImage,
    minion: wolfMinion,
    rarity: RARITIES.COMMON,
    resourceCost: 1,
    description: "Gains <b>+1 {{{ _damage_}}}</b> for every other ally.",
    overrideBodyText: true,
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

export const callWolves: Ability = {
    name: "Call Wolves",
    image: DogImage,
    resourceCost: 2,
    rarity: RARITIES.UNCOMMON,
    description: "Summon up to 2 Wolves.",
    depletedOnUse: true,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            summon: [{ minion: [cloneDeep(wolfMinion)] }, { minion: [cloneDeep(wolfMinion)] }],
        },
    ],
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const lycanthropeMinion: Minion = {
    name: "Lycanthrope",
    maxHP: 10,
    image: LycanthropeImage,
    description: "Gains +{{ onKill.effects.stacks }} {{{ _attUp_ }}} ATT when it kills.",
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    area: 1,
                    effects: [{ ...bleed, stacks: 1 }],
                },
            ],
        },
    ],
    effects: [
        {
            name: "Slayer",
            description: "Gains +{{ onKill.effects.stacks }} {{{ _attUp_ }}} ATT when it kills.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onKill: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [{ ...attackPower, stacks: 2 }],
                conditionOperator: "and",
                conditions: [
                    {
                        property: "abilities.0",
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        value: undefined,
                        comparator: "not",
                    },
                    {
                        property: "cantMove",
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        value: true,
                        comparator: "not",
                    },
                ],
            },
        },
    ],
};

export const lycanthropeAbility: Ability = {
    name: "Lycanthrope",
    description: "Gains <b>+{{{ minion.effects.0.onKill.effects.0.stacks }}} {{{ _attUp_ }}}</b> when it kills a threatening target.",
    minion: lycanthropeMinion,
    image: LycanthropeImage,
    resourceCost: 2,
    rarity: RARITIES.RARE,
    actions: [],
    upgrades: [
        {
            minion: {
                maxHP: 3,
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

export const doubleJump: Ability = {
    name: "Double Jump",
    resourceCost: 1,
    image: DoubleJumpImage,
    description: "Draw {{ actions.0.drawCards.amount }} cards. <br/> <b>Critical:</b> +1 card.",
    overrideBodyText: true,
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 2,
            },
            bonus: {
                drawCards: {
                    amount: 1,
                },
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
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
                        amount: 1,
                    },
                },
            ],
        },
    ],
};

export const tragosMinion: Minion = {
    name: "Tragos",
    maxHP: 15,
    image: TragosImage,

    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
    ],
    effects: [
        {
            ...taunt,
            onHostileAttack: {
                targetType: TRIGGER_TARGET_TYPES.ACTOR,
                ability: {
                    ...attack,
                    actions: [
                        {
                            type: ACTION_TYPES.ATTACK,
                            target: TARGET_TYPES.HOSTILE,
                            damage: 3,
                            playbackTime: 350,
                        },
                    ],
                },
            },
        },
    ],
};

export const tragosAbility: Ability = {
    name: "Tragos",
    description: "<b>Counters</b> whenever it or an ally is attacked.",
    overrideBodyText: true,
    minion: tragosMinion,
    image: TragosImage,
    resourceCost: 2,
    rarity: RARITIES.RARE,
    actions: [],
    upgrades: [
        {
            minion: {
                maxHP: 3,
                abilities: [
                    {
                        actions: [
                            {
                                damage: 1,
                            },
                        ],
                    },
                ],
                effects: [
                    {
                        onHostileAttack: {
                            ability: {
                                actions: [
                                    {
                                        damage: 1,
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
        },
    ],
};

export const roar: Ability = {
    name: "Roar",
    image: DragonsBreathImage,
    rarity: RARITIES.RARE,
    depletedOnUse: true,
    resourceCost: 0,
    description:
        "Gain {{{ _resource_ }}}. Draw a card. For <b>{{ actions.0.effects.0.duration }}{{{ _duration_ }}}</b>, gain <b>+{{ actions.0.effects.0.criticalChance }} Critical</b> + an extra {{{ _resource_ }}} and card draw.",
    overrideBodyText: true,
    actions: [
        {
            resources: 1,
            drawCards: {
                amount: 1,
            },
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.SHOUT,
            effects: [
                {
                    name: "Critical Roar",
                    icon: DragonsBreathImage,
                    drawCardsPerTurn: 1,
                    resourcesPerTurn: 1,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 2,
                    maxApplications: 1,
                    criticalChance: 0.3,
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
                    ],
                },
            ],
        },
    ],
};

export const snipe: Ability = {
    name: "Snipe",
    resourceCost: 2,
    image: SnipeImage,
    description: "+ {{{ _damage_ }}} equal to total attack damage of other {{{ _offense_ }}} cards in your hand.",
    overrideBodyText: true,
    rarity: RARITIES.RARE,
    actions: [
        {
            damage: 0,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,

            bonus: {
                damage: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.ATTACK_DAMAGE_IN_HAND,
                    calculationTarget: CONDITION_TARGETS.ACTOR,
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

export const lockOn: Ability = {
    name: "Lock On",
    image: MarksmanshipImage,
    resourceCost: 1,
    overrideBodyText: true,
    description:
        "<b>Pierce.</b> Apply <b>{{ actions.0.effects.0.stacks }} {{{ _defDown_ }}}</b> + <b>Priority</b> <b>{{ actions.0.effects.0.duration }}{{{ _duration_ }}}</b>. Command a friendly unit to attack.</b>",
    actions: [
        {
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.EFFECT,
            bypassStealth: true,
            effects: [
                {
                    ...defDown,
                    duration: 1,
                    stacks: 2,
                },
                {
                    name: "Locked On",
                    type: EFFECT_TYPES.PRIORITY_TARGET,
                    class: EFFECT_CLASSES.DEBUFF,
                    bypassImmunity: true,
                    duration: 1,
                },
            ],
            secondaryAction: {
                induceCombatantAttack: true,
                target: TARGET_TYPES.RANDOM_FRIENDLY,
            },
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

export const wayfind: Ability = {
    name: "Wayfind",
    image: IllusionStepImage,
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    description: "Select cards to discard from your hand. Then, draw that many + {{ actions.0.drawCards.amount }}.",
    overrideBodyText: true,
    depletedOnUse: true,
    selectCards: {
        type: SELECT_CARD_TYPES.DISCARD_TO_DRAW,
    },
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            drawCards: {
                amount: 1,
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

export const quickShot: Ability = {
    name: "Quick Shot",
    resourceCost: 1,
    image: MarksmanBoostImage,
    rarity: RARITIES.UNCOMMON,
    overrideBodyText: true,
    description: "Draw a card. <br/> <b>Critical: +{{ actions.0.bonus.damage }} {{{ _damage_ }}}</b>",
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            damage: 8,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
            drawCards: {
                amount: 1,
            },
            bonus: {
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
                    },
                ],
                damage: 4,
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

const crowMinion: Minion = {
    name: "Crow",
    maxHP: 5,
    image: CrowImage,
    description: "<b>Avenger.</b>",
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
    ],
    effects: [avenger],
};

const crowAbility: Ability = {
    name: "Crow",
    image: CrowImage,
    minion: crowMinion,
    resourceCost: 0,
    removeAfterTurn: true,
    rarity: RARITIES.UNCOMMON,
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

export const murderOfCrows: Ability = {
    name: "Murder Of Crows",
    rarity: RARITIES.RARE,
    resourceCost: 2,
    image: CrowImage,
    depletedOnUse: true,
    actions: [
        {
            addCards: [crowAbility, crowAbility, crowAbility].map((card) => ({ ...card, removeAfterTurn: true })),
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: BreadImage,
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

export const arrowBlow: Ability = {
    name: "Arrow Blow",
    resourceCost: 1,
    overrideBodyText: true,
    description: "<b>Critical: +{{ actions.0.bonus.damage }} {{{ _damage_ }}}</b>  <br/> <b>+{{ onDraw.chance }}</b> chance to crit.",
    image: ArrowBlowImage,
    onDraw: {
        chance: 0.2,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            damage: 3,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
            bonus: {
                damage: 13,
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    bonus: {
                        damage: 5,
                    },
                },
            ],
        },
    ],
};

export const momentum: Ability = {
    name: "Momentum",
    description:
        "<b>Search</b> for a {{{ _offense_ }}} card. It costs <b>{{ actions.0.selectCards.effects.0.resourceCost }} {{{ _resource_ }}}</b> less until discarded.",
    resourceCost: 0,
    depletedOnUse: true,
    image: PowerKnockbackImage,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.SEARCH_DECK,
                filters: [
                    {
                        abilityType: "offense",
                    },
                ],
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
                    selectCards: {
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

export const takeCover: Ability = {
    name: "Take Cover",
    image: HerosWillImage,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    description: "Gain <b>{{ actions.0.effects.0.stacks }} Pristine</b>",
    overrideBodyText: true,
    resourceCost: 1,
    actions: [
        {
            armor: 10,
            target: TARGET_TYPES.FRIENDLY,
            type: ACTION_TYPES.EFFECT,
            area: 2,
            effects: [{ ...preventArmorDecayPlayer }],
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

export const treat: Ability = {
    name: "Treat",
    image: MeatImage,
    rarity: RARITIES.COMMON,
    depletedOnUse: true,
    resourceCost: 1,
    overrideBodyText: true,
    description: "Gain <b>+1 {{{ _attUp_ }}} {{{ _armorUp_ }}}</b>, <b>x2</b> if played on a Summon.",
    actions: [
        {
            target: TARGET_TYPES.FRIENDLY,
            icon: MeatImage,
            animation: ANIMATION_TYPES.CONSUMABLE,
            bonus: [
                {
                    effects: [
                        {
                            ...attackPower,
                            stacks: 2,
                        },
                        {
                            ...armorUp,
                            stacks: 2,
                        },
                    ],
                    conditions: [
                        {
                            name: "Player",
                            comparator: "not",
                            calculationTarget: CONDITION_TARGETS.TARGET,
                        },
                    ],
                },
                {
                    effects: [
                        {
                            ...attackPower,
                        },
                        {
                            ...armorUp,
                        },
                    ],
                    conditions: [
                        {
                            name: "Player",
                            comparator: "eq",
                            calculationTarget: CONDITION_TARGETS.TARGET,
                        },
                    ],
                },
            ],
        },
    ],
    upgrades: [
        {
            preemptive: true,
        },
    ],
};

export const shatteringArrow: Ability = {
    name: "Shattering Arrow",
    image: ShatteringArrowImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    description:
        "<b>Pierce.</b> <br/> Destroy <b>{{ actions.0.destroyArmor }}</b> {{{ _armor_ }}}. <br/> <b>Critical:</b> <b>+{{ actions.0.bonus.0.destroyArmor }}</b> more.",
    overrideBodyText: true,
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            damage: 9,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
            bypassImmunity: true,
            bypassStealth: true,
            destroyArmor: 0.2,
            bonus: [
                {
                    destroyArmor: 0.2,
                    conditions: [
                        {
                            sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                            calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            hasAbilityEffectName: CRITICAL_KEYWORD,
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

export const fireStarter: Ability = {
    name: "Fire Starter",
    resourceCost: 1,
    description: "Your attacks inflict {{{ _burn_ }}}.",
    rarity: RARITIES.RARE,
    image: BroilerShotImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [
                {
                    name: "Flaming Arrows",
                    icon: BroilerShotImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 2,
                    onAttack: {
                        effects: [{ ...burn, stacks: 1 }],
                        targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
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
                    ],
                },
            ],
        },
    ],
};

const hurricaneHit = {
    damage: 3,
    type: ACTION_TYPES.RANGE_ATTACK,
    target: TARGET_TYPES.HOSTILE,
    animation: ANIMATION_TYPES.ONE_WAY,
    icon: AvengersArrowImage,
    animationOptions: bowmanAnimationOption,
    targetArea: 5,
    area: 2,
    bonus: {
        damage: 1,
        conditions: [
            {
                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                hasAbilityEffectName: CRITICAL_KEYWORD,
            },
        ],
    },
};

export const hurricaneAbility: Ability = {
    name: "Hurricane",
    resourceCost: 2,
    overrideBodyText: true,
    description: "Hits x3 <br/> <b>Critical: +{{ actions.0.bonus.damage }} {{{ _damage_ }}}</b> per hit",
    image: HurricaneImage,
    rarity: RARITIES.UNCOMMON,
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            ...cloneDeep(hurricaneHit),
        },
        {
            ...cloneDeep(hurricaneHit),
        },
        {
            ...cloneDeep(hurricaneHit),
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 1,
                    bonus: {
                        damage: 1,
                    },
                },
                {
                    damage: 1,
                    bonus: {
                        damage: 1,
                    },
                },
                {
                    damage: 1,
                    bonus: {
                        damage: 1,
                    },
                },
            ],
        },
    ],
};

export const snapfreezeShot: Ability = {
    name: "Frigid Shot",
    image: SnapfreezeShotImage,
    rarity: RARITIES.UNCOMMON,
    description:
        "Apply {{{ _chill_ }}} <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}} <br/> <b>Critical:</b> {{{ _freeze_ }}}",
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    overrideBodyText: true,
    resourceCost: 0,
    actions: [
        {
            damage: 2,
            area: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
            effects: [{ ...chill, stacks: 1, duration: 2 }],
            bonus: {
                effects: [freeze],
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
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

export const huddle: Ability = {
    name: "Huddle",
    image: TortieShellImage,
    resourceCost: 1,
    overrideBodyText: true,
    description: "<b>Critical: +{{ actions.0.bonus.armor }} {{{ _armor_ }}}</b>",
    rarity: RARITIES.COMMON,
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            armor: 5,
            target: TARGET_TYPES.FRIENDLY,
            type: ACTION_TYPES.EFFECT,
            icon: TortieShellImage,
            animation: ANIMATION_TYPES.YOYO,
            animationOptions: {
                ricochet: true,
            },
            area: 1,
            bonus: {
                armor: 2,
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
                    },
                ],
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

// Really loose way to check for the Critical keyword (existence of the onDraw.chance property, which for bowman at the moment only associates to Critical effects)
export const maneuver: Ability = {
    name: "Maneuver",
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    image: EvasionBoostImage,
    overrideBodyText: true,
    description: "Draw {{ actions.0.drawCards.amount }} card. If it is a <b>Critical</b> card, gain {{{ _resource_ }}}.",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            drawCards: {
                amount: 1,
                bonus: [
                    {
                        conditions: [
                            {
                                property: "onDraw.chance",
                                comparator: "not",
                                value: undefined,
                            },
                        ],
                        resources: 1,
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            description: "Draw {{ actions.0.drawCards.amount }} cards. If any of them is a <b>Critical</b> card, gain {{{ _resource_ }}}.",
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

export const peckingOrder: Ability = {
    name: "Pecking Order",
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    image: ChickenCouponImage,
    overrideBodyText: true,
    description: "Deal <b>{{ actions.0.flatDamage }} {{{ _damage_ }}}</b> to a friendly unit. Draw {{ actions.0.drawCards.amount }} cards.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            flatDamage: 5,
            drawCards: {
                amount: 3,
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

const fireBurst: Ability = {
    name: "Fire Burst",
    image: BlazingExtinctionImage,
    actions: [
        {
            damage: 3,
            area: 2,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animations: [
                {
                    type: ANIMATION_TYPES.ACTION_EXPLODE,
                    image: FireMarbleImage,
                    options: {
                        width: 75,
                        height: 75,
                        fadeOut: true,
                        brightness: 1.2,
                        opacity: 0.5,
                    },
                },
                {
                    type: ANIMATION_TYPES.ONE_WAY,
                    image: FlamingFeatherImage,
                    options: {
                        rotate: 135,
                        rotateToFaceTarget: true,
                        flash: 600,
                    },
                },
            ],
            secondaryAction: {
                damage: 1,
            },
            effects: [{ ...burn }],
        },
    ],
};

const phoenixMinion: Minion = {
    name: "Phoenix",
    maxHP: 1,
    armor: 30,
    abilities: [fireBurst],
    image: PhoenixImage,
    description: "<b>On summon</b> and <b>death:</b> Attack. <br/> Deals 1 damage to itself with each attack.",
    effects: [
        {
            name: "Blazing Bird",
            description: "When this character is summoned and when it dies, it will attack. Deals 1 damage to itself with each attack.",
            icon: BlazingExtinctionImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onSummoned: {
                ability: fireBurst,
            },
            onDeath: {
                ability: fireBurst,
                usableWhileDead: true,
            },
        },
    ],
};

export const phoenixEgg: Ability = {
    name: "Phoenix Egg",
    rarity: RARITIES.RARE,
    image: PhoenixEggImage,
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                bypassUnplayable: true,
                highlightCard: true,
            },
        ],
    },
    minion: phoenixMinion,
    resourceCost: 1,
    unplayable: true,
    description: "<b>Critical:</b> Playable. Summon a Phoenix.",
    actions: [],
    tooltip: {
        minion: phoenixMinion,
    },
    upgrades: [
        {
            description: "<b>Critical:</b> Playable. Summon a Phoenix. <b>+{{ onDraw.chance }}</b> chance to crit.",
            onDraw: {
                chance: 0.2,
            },
        },
    ],
};

export const potShot: Ability = {
    name: "Pot Shot",
    description: "<b>Critical:</b> This card enters your hand next turn.",
    rarity: RARITIES.COMMON,
    image: WoodenSlingshotImage,
    onDraw: {
        chance: 0,
        effects: [
            {
                name: "Draw Pot Shot",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.NONE,
                onTurnDraw: {
                    drawOriginalAbility: true,
                    // HACK: onTurnDraw happens immediately after onDraw procs, but we need it to be on the next turn's draw, hence the trigger frequency is 2
                    eventTriggerFrequency: 2,
                    removeEffect: true,
                },
            },
        ],
        abilityEffects: [
            {
                highlightCard: true,
            },
        ],
    },
    resourceCost: 0,
    actions: [
        {
            damage: 6,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            icon: AvengersArrowImage,
            animation: ANIMATION_TYPES.ONE_WAY,
            animationOptions: bowmanAnimationOption,
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

export const roastingShot: Ability = {
    name: "Roasting Shot",
    depletedOnUse: true,
    description:
        "Apply <b>{{ actions.0.effects.0.stacks }} {{{ _burn_ }}}</b>. After <b>{{ actions.0.effects.1.duration }}{{{ _duration_ }}}</b> or the target dies, gain a <b>Treat</b>.",
    overrideBodyText: true,
    image: RoastingShotImage,
    rarity: RARITIES.UNCOMMON,
    resourceCost: 1,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: AvengersArrowImage,
            animation: ANIMATION_TYPES.ONE_WAY,
            animationOptions: bowmanAnimationOption,
            damage: 3,
            effects: [
                {
                    ...burn,
                    stacks: 5,
                },
                {
                    name: "Roasting Alive",
                    icon: MeatImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.DEBUFF,
                    duration: 3,
                    onDeath: {
                        usableWhileDead: true,
                        usableWhileStunned: true,
                        addCards: [
                            {
                                ...treat,
                            },
                        ],
                        removeEffect: true,
                    },
                    onEnd: {
                        usableWhileDead: true,
                        usableWhileStunned: true,
                        addCards: [
                            {
                                ...treat,
                            },
                        ],
                        removeEffect: true,
                    },
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
                            stacks: 2,
                        },
                    ],
                },
            ],
        },
    ],
};

export const takeAim: Ability = {
    name: "Take Aim",
    resourceCost: 1,
    description: "Gain <b>{{ actions.0.effects.0.stacks }} Aim.</b> <br/> <b>Critical: +{{ actions.0.bonus.effects.0.stacks }} Aim</b>",
    overrideBodyText: true,
    image: ArcheryMasteryImage,
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [{ ...aimEffect, stacks: 8 }],
            bonus: {
                effects: [{ ...aimEffect, stacks: 3 }],
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            onDraw: {
                abilityEffects: [
                    {
                        effects: [
                            {
                                stacks: 1,
                            },
                        ],
                    },
                ],
            },
            actions: [
                {
                    effects: [
                        {
                            stacks: 3,
                        },
                    ],
                },
            ],
        },
    ],
};

export const concentrate: Ability = {
    name: "Concentrate",
    resourceCost: 1,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    image: ConcentrateImage,
    overrideBodyText: true,
    description: "Gain <b>{{ actions.0.effects.0.stacks }} Aim</b>",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [{ ...aimEffect, stacks: 15 }],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            stacks: 4,
                        },
                    ],
                },
            ],
        },
    ],
};

export const poise: Ability = {
    name: "Poise",
    overrideBodyText: true,
    resourceCost: 1,
    description: "Gain <b>{{ actions.0.effects.0.stacks }} Aim</b>",
    rarity: RARITIES.COMMON,
    image: ChestnutLeafImage,
    actions: [
        {
            armor: 5,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [{ ...aimEffect, stacks: 6 }],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 1,
                    effects: [
                        {
                            stacks: 2,
                        },
                    ],
                },
            ],
        },
    ],
};

export const steady: Ability = {
    name: "Steady",
    image: SlowAndSteadyImage,
    rarity: RARITIES.COMMON,
    resourceCost: 0,
    description: "When you draw this card, gain <b>{{ onDraw.ability.actions.0.effects.0.stacks }} Aim.</b> <br/> Draw a card.",
    onDraw: {
        ability: {
            name: "Steady",
            image: SlowAndSteadyImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [{ ...aimEffect, stacks: 3 }],
                },
            ],
        },
    },
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            drawCards: {
                amount: 1,
            },
        },
    ],
    upgrades: [
        {
            onDraw: {
                ability: {
                    actions: [
                        {
                            effects: [
                                {
                                    stacks: 2,
                                },
                            ],
                        },
                    ],
                },
            },
        },
    ],
};

export const windupShot: Ability = {
    name: "Windup Shot",
    rarity: RARITIES.UNCOMMON,
    overrideBodyText: true,
    image: HuntersBowImage,
    resourceCost: 1,
    description: "Gain <b>{{ actions.0.secondaryAction.effects.0.stacks }} Aim</b>",
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            damage: 9,
            animationOptions: bowmanAnimationOption,

            secondaryAction: {
                effects: [{ ...aimEffect, stacks: 4 }],
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                    secondaryAction: {
                        effects: [
                            {
                                stacks: 1,
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

export const sweepingArrows: Ability = {
    name: "Sweeping Aim",
    description: "Gain <b>{{ actions.0.effects.0.stacks }} Aim.</b> Your next Aimed Shot gains <b>+1 Area</b>.",
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    image: BronzeCrossbowArrowImage,
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                { ...aimEffect, stacks: 3 },
                {
                    name: "Sweeping Arrows",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: BronzeCrossbowArrowImage,
                    description: "Increases the area of your next Aimed Shot.",
                    conditions: [
                        {
                            calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                            notProc: true,
                            property: "name",
                            comparator: "eq",
                            value: aimedShot.name,
                        },
                    ],
                    attackAreaIncrease: 1,
                    stacks: 1,
                    onOffensiveAbility: {
                        decrementStacks: 1,
                        conditions: [
                            {
                                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                                notProc: true,
                                property: "name",
                                comparator: "eq",
                                value: aimedShot.name,
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
                            stacks: 2,
                        },
                    ],
                },
            ],
        },
    ],
};

const catMinion: Minion = {
    name: "Cat",
    description: "Attacks x2.",
    maxHP: 5,
    image: CatImage,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    ...attack.actions[0],
                    damage: 2,
                },
                {
                    ...attack.actions[0],
                    damage: 2,
                },
            ],
        },
    ],
};

export const catAbility: Ability = {
    name: "Cat",
    resourceCost: 1,
    image: CatImage,
    rarity: RARITIES.UNCOMMON,
    description: "Attacks x2.",
    minion: catMinion,
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

export const stimulant: Ability = {
    name: "Stimulant",
    image: CupOfCoffeeImage,
    rarity: RARITIES.UNCOMMON,
    depletedOnUse: true,
    description: "Gain <b>{{ actions.0.resources }} {{{ _resource_ }}}.</b> <b>Bide.</b>",
    overrideBodyText: true,
    actions: [
        {
            resources: 2,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: CupOfCoffeeImage,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    resources: 1,
                },
            ],
        },
    ],
};

export const followThrough: Ability = {
    name: "Follow Through",
    image: ThrustImage,
    description: "<b>+{{ actions.0.bonus.effects.0.stacks }} Aim</b> for each attack you made this turn.",
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            bonus: {
                effects: [{ ...aimEffect, stacks: 2 }],
                multiplier: {
                    type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                    filterOutProcs: true,
                },
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    bonus: {
                        effects: [
                            // @ts-ignore

                            {
                                stacks: 1,
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

export const blind: Ability = {
    name: "Blind",
    image: BlindImage,
    rarity: RARITIES.RARE,
    resourceCost: 1,
    overrideBodyText: true,
    description:
        "Apply <b>{{ actions.0.effects.0.stacks }} {{{ _attDown_ }}} {{ actions.0.effects.0.duration }} {{{ _duration_ }}}.</b> Gain <b>{{ actions.0.secondaryAction.effects.0.stacks }} Aim</b> for each target.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            effects: [
                {
                    ...attackDown,
                    stacks: 3,
                    duration: 1,
                },
            ],
            secondaryAction: {
                effects: [
                    {
                        ...aimEffect,
                        stacks: 2,
                    },
                ],
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

export const surge: Ability = {
    name: "Surge",
    resourceCost: 1,
    rarity: RARITIES.RARE,
    image: VengeanceImage,
    overrideBodyText: true,
    description: "Gain <b>{{ actions.1.effects.0.stacks }} Aim.</b> Move <b>Aimed Shot</b> to your hand, wherever it is.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            addCards: [aimedShot],
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [{ ...aimEffect, stacks: 4 }],
            moveCards: {
                from: FROM_CARD_PILE_TYPES.ANYWHERE,
                to: CARD_PILE_TYPES.HAND,
                filters: [
                    {
                        property: "name",
                        value: aimedShot.name,
                        comparator: "eq",
                    },
                ],
                amount: 1,
            },
        },
    ],
    upgrades: [
        {
            actions: [{}, { effects: [{ stacks: 2 }] }],
        },
    ],
};

export const longShot: Ability = {
    name: "Long Shot",
    unplayable: true,
    resourceCost: 0,
    image: GrossJaegerImage,
    rarity: RARITIES.UNCOMMON,
    overrideBodyText: true,
    description: "<b>Critical: Playable.</b>  <br/> <b>+{{ onDraw.chance }}</b> chance to crit.",
    onDraw: {
        chance: 0.2,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                bypassUnplayable: true,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            damage: 15,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
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

const greaterPuppetMinion: Minion = {
    name: "Greater Puppet",
    image: Puppetree3Image,
    maxHP: 13,
    description: "Has <b>{{ effects.1.stacks }} {{{ _thorns_ }}}</b>",
    effects: [
        taunt,
        {
            ...thorns,
            stacks: 3,
        },
    ],
    abilities: [],
};

export const puppetShot: Ability = {
    name: "Puppet Shot",
    description: "Summon a Puppet. If one is active, replace it with a Greater Puppet.",
    resourceCost: 2,
    rarity: RARITIES.RARE,
    image: ElitePuppetImage,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            damage: 12,
            animationOptions: bowmanAnimationOption,
            summon: [
                {
                    minion: [puppetMinion],
                    tributePossible: true,
                    conditions: [
                        {
                            calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                            numFriendly: 0,
                            comparator: "eq",
                            filters: [
                                {
                                    property: "name",
                                    comparator: "eq",
                                    value: puppetMinion.name,
                                },
                            ],
                        },
                    ],
                },
                {
                    minion: [greaterPuppetMinion],
                    tributePossible: true,
                    tributeMinionByName: [puppetMinion.name],
                    conditions: [
                        {
                            calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                            numFriendly: 0,
                            comparator: "gt",
                            filters: [
                                {
                                    property: "name",
                                    comparator: "eq",
                                    value: puppetMinion.name,
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
                    damage: 4,
                },
            ],
        },
    ],
};

const fleetfootProc: Effect = {
    name: "Fleet-Footed",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: GreenLeafShoesImage,
    description: "When you play an active Critical, draw a card.",
    duration: 1,
    onPlayCard: {
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                hasAbilityEffectName: CRITICAL_KEYWORD,
            },
        ],
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        drawCards: {
            amount: 1,
        },
        removeEffect: true,
    },
};

export const fleetFoot: Ability = {
    name: "Fleet Foot",
    overrideBodyText: true,
    description: "The first time you play an active Critical on your turn, draw a card.",
    image: GreenLeafShoesImage,
    depletedOnUse: true,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [
                {
                    name: "Fleet Foot",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    onTurnStart: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        effects: [fleetfootProc],
                    },
                },
                fleetfootProc,
            ],
        },
    ],
    upgrades: [
        {
            preemptive: true,
        },
    ],
};

export const bountyOrNothing: Ability = {
    name: "Bounty Or Nothing",
    rarity: RARITIES.UNCOMMON,
    overrideBodyText: true,
    image: HarvestDamageSkinImage,
    unplayable: true,
    description:
        "<b>Critical: Playable.</b>  <br/> Draw <b>{{ actions.0.drawCards.amount }}</b> cards. <br/> <b>+{{ onDraw.chance }}</b> chance to crit.",
    onDraw: {
        chance: 0.2,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                bypassUnplayable: true,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            drawCards: {
                amount: 5,
            },
        },
    ],
    upgrades: [
        {
            onDraw: {
                chance: 0.1,
            },
        },
    ],
};

export const takeAShot: Ability = {
    name: "Take A Shot",
    resourceCost: 2,
    rarity: RARITIES.RARE,
    image: TakeAShotImage,
    overrideBodyText: true,
    description:
        "<b>Critical: +{{ actions.0.bonus.damage }} {{{ _damage_ }}}</b> <br/> but <b>critical chance</b> is <b>{{ onDraw.chance }}.</b>",
    onDraw: {
        chance: -0.1,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            damage: 10,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
            bonus: {
                damage: 25,
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    bonus: {
                        damage: 10,
                    },
                },
            ],
        },
    ],
};

export const scavenge: Ability = {
    name: "Scavenge",
    resourceCost: 0,
    overrideBodyText: true,
    description: "<b>Deplete</b> a card. Gain {{{ _resource_ }}} and draw <b>1</b> card.",
    rarity: RARITIES.UNCOMMON,
    image: MatchaManLeafImage,
    selectCards: {
        type: SELECT_CARD_TYPES.DEPLETE_FROM_HAND,
    },
    actions: [
        {
            resources: 1,
            drawCards: {
                amount: 1,
            },
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
    upgrades: [
        {
            description: "<b>Deplete</b> a card. Gain {{{ _resource_ }}} and draw <b>{{ actions.0.drawCards.amount }}</b> cards.",
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

export const sidepack: Ability = {
    name: "Sidepack",
    retain: true,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    description: "Place up to {{ selectCards.maxAmount }} cards from your hand on top of your deck.",
    image: DeansBagImage,
    selectCards: {
        type: SELECT_CARD_TYPES.HAND_TO_TOP_DECK,
        maxAmount: 2,
    },
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            icon: DeansBagImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
        },
    ],
    upgrades: [
        {
            selectCards: {
                maxAmount: 1,
            },
        },
    ],
};

export const preciseDefense: Ability = {
    name: "Precise Defense",
    description: "Gain <b>{{ actions.0.secondaryAction.effects.0.stacks }} Aim</b>. Apply <b>{{{ _armor_ }}}</b> equal to your <b>Aim.</b>",
    image: BlueDirosImage,
    depletedOnUse: true,
    resourceCost: 2,
    rarity: RARITIES.RARE,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            secondaryAction: {
                isPriority: true,
                effects: [{ ...aimEffect, stacks: 10 }],
            },
            bonus: {
                armor: 1,
                multiplier: {
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                    type: MULTIPLIER_TYPES.EFFECT_STACKS,
                    filters: [{ property: "name", value: aimEffect.name, comparator: "eq" }],
                },
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: aimEffect.name,
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

export const entrenchedFire: Ability = {
    name: "Entrenched Fire",
    description: "Hits an extra time if you have {{{ _armor_ }}}. <b>Critical:</b> + Another time.",
    image: EntrenchedFireImage,
    rarity: RARITIES.RARE,
    resourceCost: 1,
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
        },
        {
            damage: 7,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    armor: 0,
                    comparator: "gt",
                },
            ],
        },
        {
            damage: 7,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
            conditions: [
                {
                    sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                    calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                    hasAbilityEffectName: CRITICAL_KEYWORD,
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
                    damage: 2,
                },
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const twain: Ability = {
    name: "Twain",
    rarity: RARITIES.UNCOMMON,
    resourceCost: 0,
    image: CrossbowImage,
    description: "Hits 2x",
    actions: [
        {
            damage: 3,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
        },
        {
            damage: 3,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const berry: Ability = {
    name: "Berry",
    removeAfterTurn: true,
    image: CocaFruitImage,
    description: "<b>Critical:</b> Draw a card.",
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            resources: 1,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: CocaFruitImage,
            bonus: {
                drawCards: {
                    amount: 1,
                },
                conditions: [
                    {
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        hasAbilityEffectName: CRITICAL_KEYWORD,
                    },
                ],
            },
        },
    ],
};

export const forage: Ability = {
    name: "Forage",
    resourceCost: 1,
    image: EucalyptusLeavesImage,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            addCardsToDeck: [berry],
            addCardsToDiscard: [berry],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    addCardsToDeck: [
                        {
                            description: "<b>Critical:</b> Draw a card. <br/> <b>+{{ onDraw.chance }}</b> chance to crit.",
                            onDraw: { chance: 0.2 },
                        },
                    ],
                    addCardsToDiscard: [
                        {
                            description: "<b>Critical:</b> Draw a card. <br/> <b>+{{ onDraw.chance }}</b> chance to crit.",
                            onDraw: { chance: 0.2 },
                        },
                    ],
                },
            ],
        },
    ],
};

const ultimateStrafeHit = {
    damage: 4,
    type: ACTION_TYPES.RANGE_ATTACK,
    target: TARGET_TYPES.HOSTILE,
    animation: ANIMATION_TYPES.ONE_WAY,
    icon: AvengersArrowImage,
    animationOptions: bowmanAnimationOption,
    bonus: {
        damage: 2,
        conditions: [
            {
                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                hasAbilityEffectName: CRITICAL_KEYWORD,
            },
        ],
    },
};

export const ultimateStrafe: Ability = {
    name: "Ultimate Strafe",
    resourceCost: 3,
    overrideBodyText: true,
    description: "Hits x6 <br/> <b>Critical: +{{ actions.0.bonus.damage }} {{{ _damage_ }}}</b> per hit",
    rarity: RARITIES.RARE,
    image: UltimateStrafeImage,
    onDraw: {
        chance: 0,
        abilityEffects: [
            {
                name: CRITICAL_KEYWORD,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        { ...ultimateStrafeHit },
        { ...ultimateStrafeHit },
        { ...ultimateStrafeHit },
        { ...ultimateStrafeHit },
        { ...ultimateStrafeHit },
        { ...ultimateStrafeHit },
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
                {
                    damage: 1,
                },
                {
                    damage: 1,
                },
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

const doomHeraldMinion: Minion = {
    name: "Doom Herald",
    image: RavenImage,
    maxHP: 5,
    abilities: [
        {
            name: "Doom!",
            image: SkeletonOfHorrorImage,
            actions: [
                {
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.EFFECT,
                    icon: SkullStrikerImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    effects: [
                        {
                            ...doomEffect,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        {
            ...doomEffect,
        },
    ],
};

export const doomHeraldAbility: Ability = {
    name: "Doom Herald",
    rarity: RARITIES.RARE,
    image: RavenImage,
    minion: doomHeraldMinion,
    resourceCost: 3,
    description: "Inflicts <b>Doom</b> every turn. The Doom Herald is also afflicted by <b>Doom.</b>",
    actions: [],
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const callCompanion: Ability = {
    name: "Call Companion",
    resourceCost: 1,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    image: GuidesWhistleImage,
    tooltip: {
        title: "Summon",
        description: "A minion fights alongside you in combat. Most minions will automatically attack at the end of your turn.",
    },
    overrideTooltip: true,
    description: "Summon a random minion. <b>{{ actions.0.chance }}</b> chance for a Rare.",
    disablePreview: true,
    actions: [
        {
            chance: 0.15,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: BreadImage,
            summon: [
                {
                    minion: [tragosMinion, doomHeraldMinion, lycanthropeMinion, phoenixMinion],
                    tributePossible: true,
                },
            ],
            stopAction: true,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: BreadImage,
            summon: [
                {
                    minion: [puppetMinion, wolfMinion, eagleMinion, crowMinion, catMinion],
                    tributePossible: true,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    chance: 0.1,
                },
            ],
        },
    ],
};

export const headshot: Ability = {
    name: "Headshot",
    description: "<b>On kill:</b> <b>+1 {{{ _resource_ }}} +{{ actions.0.secondaryAction.healing }} {{{ _healing_ }}}</b>",
    resourceCost: 2,
    image: PuppetImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
            damage: 17,
            secondaryAction: {
                resources: 1,
                healing: 2,
                conditions: [
                    {
                        healthPercentage: 0,
                        comparator: "eq",
                        calculationTarget: CONDITION_TARGETS.TARGET,
                    },
                ],
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

export const blitz: Ability = {
    name: "Blitz",
    image: GoldenEagleImage,
    rarity: RARITIES.UNCOMMON,
    resourceCost: 1,
    overrideBodyText: true,
    description:
        "When you play <b>Aimed Shot</b> or an active <b>Critical</b>, one of your minions attacks. <br/> {{ actions.0.effects.0.duration }}{{{ _duration_ }}}",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [
                {
                    name: "Blitz",
                    icon: GoldenEagleImage,
                    description: "When you play <b>Aimed Shot or an active <b>Critical</b> card, one of your minions attacks.",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 3,
                    onPlayCard: {
                        ability: {
                            name: "Blitz",
                            actions: [
                                {
                                    type: ACTION_TYPES.EFFECT,
                                    target: TARGET_TYPES.RANDOM_FRIENDLY,
                                    excludeActor: true,
                                    induceCombatantAttack: true,
                                },
                            ],
                            conditions: [
                                {
                                    numFriendly: 1, // Including the actor itself
                                    comparator: "gt",
                                    calculationTarget: CONDITION_TARGETS.ACTOR,
                                },
                            ],
                        },
                        conditions: [
                            {
                                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                hasAbilityEffectName: CRITICAL_KEYWORD,
                            },
                            {
                                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                name: aimedShot.name,
                            },
                        ],
                        conditionOperator: "or",
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
                    ],
                },
            ],
        },
    ],
};

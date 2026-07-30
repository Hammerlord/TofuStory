import { attack } from "../../enemy/abilities";
import {
    ArrowBlowImage,
    ArrowBombImage,
    ArrowEruptionImage,
    ArrowRainImage,
    AvengersArrowImage,
    BlockImage,
    BowExpertImage,
    ConcentrateImage,
    CoveringFireImage,
    CrowImage,
    DogImage,
    DoubleJumpImage,
    DoubleShotImage,
    DrainArrowImage,
    FinalAttackImage,
    FocusImage,
    FrozenArrowImage,
    HamstringImage,
    IllusionStepImage,
    IronArrowImage,
    LycanthropeImage,
    MagicArrowImage,
    MarksmanBoostImage,
    MarksmanshipImage,
    MortalBlowImage,
    PiercingArrowImage,
    PowerKnockbackImage,
    ScarecrowImage,
    SharpEyesImage,
    ShieldImage,
    SnipeImage,
    SoulArrowImage,
    SteelArrowImage,
    StrafeImage,
    TragosImage,
    WeaponMasteryLGImage,
    WuTienEagleImage,
} from "../../images";
import { BullseyeIcon } from "../../images/icons";
import { RARITIES } from "../../item/types";
import { attackPower, avenger, bleed, defDown, stun, taunt, thorns } from "../Effects";
import {
    Ability,
    ACTION_TYPES,
    ANIMATION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    MULTIPLIER_TYPES,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../types";
import { cloneDeep } from "lodash";

const bowmanAnimationOption = {
    rotateToFaceTarget: true,
    rotate: 135,
    weapon: {
        rotateToFaceTarget: true,
    },
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
            damage: 2,
            animationOptions: bowmanAnimationOption,
        },
    ],
};

export const spotWeakness: Ability = {
    name: "Spot Weakness",
    resourceCost: 1,
    image: MarksmanshipImage,
    actions: [
        {
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.EFFECT,
            area: 1,
            effects: [{ ...defDown, duration: 2, attackDamageReceived: 2 }],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            attackDamageReceived: 1,
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
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const shootAbility: Ability = {
    name: "Shoot",
    resourceCost: 1,
    image: AvengersArrowImage,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            damage: 7,
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
                    armor: 4,
                },
            ],
        },
    ],
};

export const puppet: Ability = {
    name: "Puppet",
    image: ScarecrowImage,
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    minion: {
        name: "Puppet",
        image: ScarecrowImage,
        uncontrollable: true,
        maxHP: 9,
        abilities: [],
        effects: [taunt, thorns],
    },
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
    rarity: RARITIES.UNCOMMON,
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
                    damage: 2,
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
            damage: 14,
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
    description: "<b>Critical:</b> +{{ onDraw.abilityEffects.0.damage }} {{{ _damage_ }}}",
    removeAfterTurn: true,
    onDraw: {
        chance: 0.5,
        abilityEffects: [
            {
                damage: 3,
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
            animationOptions: {
                ...bowmanAnimationOption,
                width: 50,
                height: 50,
            },
        },
    ],
    upgrades: [
        {
            onDraw: {
                abilityEffects: [
                    {
                        damage: 1,
                    },
                ],
            },
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
            addCardsToDeck: [soulShot, soulShot, soulShot],
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

export const eagle: Ability = {
    name: "Eagle",
    image: WuTienEagleImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    overrideBodyText: true,
    minion: {
        name: "Eagle",
        image: WuTienEagleImage,
        maxHP: 7,
        uncontrollable: true,
        abilities: [
            {
                ...attack,
                actions: [
                    {
                        type: ACTION_TYPES.ATTACK,
                        target: TARGET_TYPES.HOSTILE,
                        damage: 2,
                        effects: [{ ...bleed }],
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
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    induceCombatantAttack: true,
                },
                onTurnStart: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    induceCombatantAttack: true,
                },
            },
        ],
    },
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
    description: "Hits twice",
    image: DoubleShotImage,
    actions: [
        {
            damage: 4,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
        },
        {
            damage: 4,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
        },
    ],
};

export const strafe: Ability = {
    name: "Strafe",
    resourceCost: 2,
    description: "Hits x4",
    rarity: RARITIES.UNCOMMON,
    image: StrafeImage,
    actions: [
        {
            damage: 5,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
        },
        {
            damage: 5,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
        },
        {
            damage: 5,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
        },
        {
            damage: 5,
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
    description: "<b>+2</b> {{{ _damage_ }}} for every other 'Shot' or 'Shoot' card you own.",
    disableConditionGlow: true,
    overrideBodyText: true,
    image: PiercingArrowImage,
    rarity: RARITIES.RARE,
    actions: [
        {
            damage: 14,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,

            bonus: {
                damage: 2,
                multiplier: {
                    type: MULTIPLIER_TYPES.ALL_CARDS,
                    filters: [
                        { property: "name", comparator: "includes", value: "shoot" },
                        { property: "name", comparator: "includes", value: "shot" },
                    ],
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

export const guard: Ability = {
    name: "Guard",
    resourceCost: 1,
    image: ShieldImage,
    description: "<b>Critical:</b> +{{ onDraw.abilityEffects.0.armor }} {{{ _armor_ }}}",
    rarity: RARITIES.COMMON,
    onDraw: {
        chance: 0.5,
        abilityEffects: [
            {
                armor: 3,
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
        },
    ],
    upgrades: [
        {
            onDraw: {
                abilityEffects: [
                    {
                        armor: 1,
                    },
                ],
            },
            actions: [
                {
                    armor: 3,
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
    actions: [
        {
            damage: 0,
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
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const focus: Ability = {
    name: "Focus",
    resourceCost: 1,
    image: FocusImage,
    description: "Gain <b>+{{ actions.0.effects.0.attackPower }} {{{ _damage_ }}} {{ actions.0.effects.0.duration }}{{{ _duration_ }}}</b>",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            area: 2,
            armor: 3,
            effects: [
                {
                    ...attackPower,
                    duration: 3,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 1,
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

export const chargedShot: Ability = {
    name: "Charged Shot",
    removeAfterTurn: true,
    rarity: RARITIES.RARE,
    resourceCost: 1,
    image: DrainArrowImage,
    description: "<b>+{{ actions.0.bonus.damage }}</b> {{{ _damage_ }}} for every unique card used this battle.",
    overrideBodyText: true,
    actions: [
        {
            damage: 1,
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
            bonus: {
                damage: 2,
                multiplier: {
                    type: MULTIPLIER_TYPES.ABILITIES_USED,
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                    filterUnique: true,
                    filterOutProcs: true,
                },
            },
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
    rarity: RARITIES.UNCOMMON,
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
            damage: 9,
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
    maxHP: 5,
    description: "Gains <b>+1 {{{ _damage_}}}</b> when it attacks.",
    uncontrollable: true,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 1,
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
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                induceCombatantAttack: true,
            },
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                induceCombatantAttack: true,
            },
        },
        {
            name: "One with the Pack",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAttack: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [{ ...attackPower }],
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
};

export const lycanthropeMinion: Minion = {
    name: "Lycanthrope",
    maxHP: 10,
    image: LycanthropeImage,
    description: "Gains +3 ATT when it kills.",
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    area: 1,
                    effects: [{ ...bleed }],
                },
            ],
        },
    ],
    effects: [
        {
            name: "Slayer",
            description: "Gains +3 ATT when it kills a threatening target.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onKill: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [{ ...attackPower, stacks: 3 }],
                conditions: [
                    {
                        property: "abilities.0",
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        value: undefined,
                        comparator: "not",
                    },
                ],
            },
        },
    ],
};

export const lycanthropeAbility: Ability = {
    name: "Lycanthrope",
    description: "Gains <b>+3 {{{ _damage_ }}}</b> when it kills a threatening target.",
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
                                damage: 2,
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
    description: "Draw {{ actions.0.drawCards.amount }} cards. <b>Critical:</b> +1 card.",
    overrideBodyText: true,
    onDraw: {
        chance: 0.5,
        abilityEffects: [
            {
                drawCards: 1,
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
    uncontrollable: true,
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
        {
            name: "",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onSummoned: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                induceCombatantAttack: true,
            },
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                induceCombatantAttack: true,
            },
        },
    ],
};

export const tragosAbility: Ability = {
    name: "Tragos",
    description: "<b>Counterattacks</b> whenever it or an ally is attacked.",
    overrideBodyText: true,
    minion: tragosMinion,
    image: TragosImage,
    resourceCost: 2,
    rarity: RARITIES.RARE,
    actions: [],
    upgrades: [
        {
            minion: {
                maxHP: 5,
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
    image: ConcentrateImage,
    rarity: RARITIES.RARE,
    depletedOnUse: true,
    resourceCost: 0,
    description:
        "Gain {{{ _stamina_ }}} and draw a card. For the next <b>{{ actions.0.effects.0.duration }}{{{ _duration_ }}}</b>, gain an extra {{{ _stamina_ }}} and card draw.",
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
                    icon: ConcentrateImage,
                    drawCardsPerTurn: 1,
                    resourcesPerTurn: 1,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 2,
                    maxApplications: 1,
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
    image: SharpEyesImage,
    resourceCost: 1,
    overrideBodyText: true,
    description:
        "Applies <b>{{ actions.0.effects.0.attackDamageReceived }} DEF down.</b> Random attacks prioritize this target. <b>{{ actions.0.effects.0.duration}} {{{ _duration_ }}}</b>",
    actions: [
        {
            damage: 0,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.EFFECT,
            effects: [{ ...defDown, type: EFFECT_TYPES.PRIORITY_TARGET, duration: 2, attackDamageReceived: 1, icon: BullseyeIcon }],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            attackDamageReceived: 1,
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

const crow: Minion = {
    name: "Crow",
    maxHP: 6,
    image: CrowImage,
    description: "<b>Avenger.</b>",
    uncontrollable: true,
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
            name: "",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onSummoned: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                induceCombatantAttack: true,
            },
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                induceCombatantAttack: true,
            },
        },
        avenger,
    ],
};

export const murderOfCrows: Ability = {
    name: "Murder Of Crows",
    rarity: RARITIES.UNCOMMON,
    resourceCost: 3,
    image: CrowImage,
    depletedOnUse: true,
    description: "Summon 3 Crows. For each that doesn't fit, a random summon is Tributed.",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            summon: [
                { minion: [cloneDeep(crow)], tributePossible: true },
                { minion: [cloneDeep(crow)], tributePossible: true },
                { minion: [cloneDeep(crow)], tributePossible: true },
            ],
        },
    ],
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const arrowBlow: Ability = {
    name: "Arrow Blow",
    resourceCost: 0,
    description: "<b>Critical:</b> +{{ onDraw.abilityEffects.0.damage }} {{{ _damage_ }}}",
    image: ArrowBlowImage,
    onDraw: {
        chance: 0.5,
        abilityEffects: [
            {
                damage: 10,
                maxApplications: 1,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            damage: 1,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: bowmanAnimationOption,
        },
    ],
    upgrades: [
        {
            onDraw: {
                abilityEffects: [
                    {
                        damage: 4,
                    },
                ],
            },
        },
    ],
};

export const momentum: Ability = {
    name: "Momentum",
    description:
        "<b>Search</b> for a {{{ _offense_ }}} card. It costs <b>{{ actions.0.selectCards.effects.0.resourceCost }} {{{ _stamina_ }}}</b> less.",
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

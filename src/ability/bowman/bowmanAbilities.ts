import { attack } from "../../enemy/abilities";
import {
    ArrowBombImage,
    ArrowEruptionImage,
    ArrowRainImage,
    AvengersArrowImage,
    BlockImage,
    BowExpertImage,
    CoveringFireImage,
    DogImage,
    DoubleShotImage,
    DrainArrowImage,
    FinalAttackImage,
    FocusImage,
    FrozenArrowImage,
    HamstringImage,
    IronArrowImage,
    MarksmanshipImage,
    MortalBlowImage,
    PiercingArrowImage,
    ScarecrowImage,
    ShieldImage,
    SoulArrowImage,
    SteelArrowImage,
    StrafeImage,
    WeaponMasteryLGImage,
    WuTienEagleImage,
} from "../../images";
import { BullseyeIcon } from "../../images/icons";
import { RARITIES } from "../../item/types";
import { attackPower, bleed, defDown, stun, taunt, thorns } from "../Effects";
import {
    Ability,
    ACTION_TYPES,
    ANIMATION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    MULTIPLIER_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../types";
import { cloneDeep } from "lodash";

export const spotWeakness: Ability = {
    name: "Spot Weakness",
    resourceCost: 1,
    image: MarksmanshipImage,
    actions: [
        {
            damage: 0,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.EFFECT,
            area: 1,
            effects: [{ ...defDown, duration: 3, attackDamageReceived: 2 }],
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
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
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
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
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
    actions: [
        {
            damage: 5,
            area: 1,
            effects: [stun],
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
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
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
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

export const soulArrow: Ability = {
    name: "Soul Arrow",
    resourceCost: 0,
    rarity: RARITIES.UNCOMMON,
    image: SoulArrowImage,
    description: "<b>Critical:</b> +{{ onDraw.abilityEffects.0.damage }} {{{ _damage_ }}}",
    onDraw: {
        chance: 0.5,
        abilityEffects: [
            {
                damage: 3,
                maxApplications: 1,
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
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
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

export const eagle: Ability = {
    name: "Eagle",
    image: WuTienEagleImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
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
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
                brightness: -0.75,
            },
            effects: [
                {
                    name: "Dark Arrow",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.DEBUFF,
                    onFriendlyReceiveAttack: {
                        excludeEffectOwner: true,
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        damage: 2,
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
                            damage: 1,
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
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
        },
        {
            damage: 4,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
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
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
        },
        {
            damage: 5,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
        },
        {
            damage: 5,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
        },
        {
            damage: 5,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
        },
    ],
};

export const mortalBlow: Ability = {
    name: "Mortal Blow",
    resourceCost: 1,
    description: "Deals extra damage based on target's missing HP, up to {{ actions.0.bonus.damage }}.",
    rarity: RARITIES.UNCOMMON,
    image: MortalBlowImage,
    actions: [
        {
            damage: 8,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
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
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
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
        "On turn start, fire an arrow for <b>{{ actions.0.effects.0.onTurnStart.ability.actions.0.damage }} {{{ _damage_ }}} </b> and {{{ _bleed_ }}}.",
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    image: SteelArrowImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Artillery",
                    icon: AvengersArrowImage,
                    duration: 4,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    onTurnStart: {
                        ability: {
                            name: "Shoot",
                            image: AvengersArrowImage,
                            actions: [
                                {
                                    damage: 5,
                                    type: ACTION_TYPES.RANGE_ATTACK,
                                    target: TARGET_TYPES.HOSTILE,
                                    animation: ANIMATION_TYPES.ONE_WAY,
                                    icon: AvengersArrowImage,
                                    effects: [{ ...bleed }],
                                    animationOptions: {
                                        rotateToFaceTarget: true,
                                        rotate: 135,
                                    },
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
                            onTurnStart: {
                                ability: {
                                    actions: [
                                        {
                                            damage: 2,
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
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
            effects: [{ ...bleed }],
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
    retain: true,
    removeAfterTurn: true,
    rarity: RARITIES.RARE,
    resourceCost: 1,
    image: DrainArrowImage,
    description: "<b>+{{ actions.0.bonus.damage }}</b> {{{ _damage_ }}} for every unique card used this battle.",
    actions: [
        {
            damage: 1,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
                flash: 200,
                width: 50,
                height: 50,
                weapon: {
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

export const chargeUp: Ability = {
    name: "Charge Up",
    resourceCost: 1,
    rarity: RARITIES.RARE,
    depletedOnUse: true,
    image: BowExpertImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            addCardsToDiscard: [chargedShot],
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
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
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
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: 135,
            },
            secondaryAction: {
                armor: 3,
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

export const wolfMinion: Minion = {
    name: "Wolf",
    image: DogImage,
    maxHP: 6,
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

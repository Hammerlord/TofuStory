import { burn, hardy } from "./../ability/Effects";
import { TRIGGER_SOURCE_TYPES } from "./../battle/types";
import { stun } from "../ability/Effects";
import {
    Ability,
    ACTION_TYPES,
    ANIMATION_TYPES,
    CONDITION_TARGETS,
    Effect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import {
    BalrogIconImage,
    BlueSnailShellImage,
    BoarIconImage,
    BrandishImage,
    DancesWithBalrogImage,
    FireMarbleImage,
    GiganticSledgeImage,
    IntrepidSlashImage,
    JrBalrogImage,
    MossySnailImage,
    OmokPigImage,
    RedSnailShellImage,
    SlashBlastImage,
    StoneGolemIconImage,
    StoneGolemImage,
    StoneGolemRubbleImage,
    WarLeapImage,
    WildBoarImage,
} from "../images";

const golemStanceEffect: Effect = {
    name: "Stone Golem Stance - Unrelenting Strength",
    icon: StoneGolemIconImage,
    description:
        "Immune to Stun, Wound, Poison. Attacks apply Crushing Blow, increasing damage received from attacks and decreasing armor gained from sources.",
    immunities: [EFFECT_TYPES.STUN, EFFECT_TYPES.BLEED, EFFECT_TYPES.POISON],
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    canBeSilenced: false,
    duration: 3,
    onAttack: {
        targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
        effects: [
            {
                name: "Crushing Blow",
                icon: StoneGolemRubbleImage,
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.DEBUFF,
                armorReceived: -1,
                attackDamageReceived: 1,
                duration: 1,
            },
        ],
    },
    onEnd: {
        usableWhileStunned: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        ability: "Boar Stance",
    },
    onReceiveDamage: {
        usableWhileStunned: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        conditions: [
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                healthPercentage: 0.25,
                comparator: "lt",
            },
        ],
        removeEffect: true,
    },
};

const golemStanceAbility: Ability = {
    name: "Golem Stance",
    image: StoneGolemIconImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            icon: StoneGolemImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            removeDebuffs: true,
            effects: [golemStanceEffect],
        },
    ],
};

const snailStanceRedEffect: Effect = {
    name: "Snail Stance - Defensive Offence",
    icon: RedSnailShellImage,
    canBeSilenced: false,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    description: "While this character has armor, its damage is increased.",
    duration: 3,
    attackPower: 1,
    conditions: [
        {
            comparator: "gt",
            armor: 0,
            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        },
    ],
    onReceiveDamage: {
        usableWhileStunned: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        conditions: [
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                healthPercentage: 0.25,
                comparator: "lt",
            },
        ],
        removeEffect: true,
    },
};

const snailStanceBlueEffect: Effect = {
    name: "Snail Stance - Perfect Defence",
    icon: BlueSnailShellImage,
    canBeSilenced: true,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    description: "Gaining 3 armor on attack. Preventing armor decay.",
    duration: 3,
    preventArmorDecay: true,
    onAttack: {
        targetType: TRIGGER_TARGET_TYPES.ACTOR,
        armor: 3,
    },
    onEnd: {
        usableWhileStunned: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        ability: golemStanceAbility,
    },
    onReceiveDamage: {
        usableWhileStunned: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        conditions: [
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                healthPercentage: 0.25,
                comparator: "lt",
            },
        ],
        removeEffect: true,
    },
};

const snailStanceAbility: Ability = {
    name: "Snail Stance",
    image: RedSnailShellImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            icon: MossySnailImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            effects: [snailStanceRedEffect, snailStanceBlueEffect],
            armor: 20,
        },
    ],
};

const dancesWithBalrogWarLeap: Ability = {
    name: "War Leap",
    resourceCost: 0,
    image: WarLeapImage,
    actions: [
        {
            damage: 1,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            // effects: [stun], -- bugs out player turn
            bonus: {
                damage: 2,
                conditions: [
                    {
                        healthPercentage: 1,
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        comparator: "eq",
                    },
                ],
            },
        },
    ],
};

const boarStanceEffect: Effect = {
    name: "Boar Stance - Dauntless Aggression",
    icon: BoarIconImage,
    description: "Immediately attacks summoned enemy minions. Once per turn, this character will counter when attacked.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    canBeSilenced: false,
    duration: 3,
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                name: "Retaliation",
                description: "Countering on the next attack",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                icon: OmokPigImage,
                canBeSilenced: true,
                duration: 1,
                onReceiveAttack: {
                    usableWhileStunned: false,
                    removeEffect: true,
                    targetType: TRIGGER_TARGET_TYPES.ACTOR,
                    ability: {
                        name: "Retaliate",
                        actions: [
                            {
                                type: ACTION_TYPES.ATTACK,
                                target: TARGET_TYPES.HOSTILE,
                            },
                        ],
                    },
                },
            },
        ],
    },
    onHostileSummon: {
        targetType: TRIGGER_TARGET_TYPES.TARGET,
        ability: dancesWithBalrogWarLeap,
    },
    onEnd: {
        usableWhileStunned: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        ability: snailStanceAbility,
    },
    onReceiveDamage: {
        usableWhileStunned: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        conditions: [
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                healthPercentage: 0.25,
                comparator: "lt",
            },
        ],
        removeEffect: true,
    },
};

export const boarStanceAbility: Ability = {
    name: "Boar Stance",
    image: BoarIconImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [boarStanceEffect],
            icon: WildBoarImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
        },
        {
            damage: 1,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
            // effects: [stun]
            bonus: {
                damage: 2,
                conditions: [
                    {
                        healthPercentage: 1,
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        comparator: "eq",
                    },
                ],
            },
        },
    ],
};

const balrogStanceEffect: Effect = {
    name: "Balrog Stance - Overwhelming Power",
    description: "Attack area increased. +1 resource per turn. Every 6 abilities, this character casts Meteors.",
    attackAreaIncrease: 1,
    resourcesPerTurn: 1,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: BalrogIconImage,
    onAbility: {
        targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.ACTOR,
                numAbilitiesUsed: 5,
                comparator: "modulo",
            },
        ],
        ability: {
            name: "Meteor",
            image: FireMarbleImage,
            actions: [
                {
                    damage: 3,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    icon: FireMarbleImage,
                    area: 3,
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
};

const balrogStanceAbility: Ability = {
    name: "Balrog Stance",
    image: BalrogIconImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [balrogStanceEffect],
            icon: JrBalrogImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
        },
        {
            damage: 3,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            icon: FireMarbleImage,
            area: 3,
            effects: [
                {
                    ...burn,
                    duration: 3,
                },
            ],
        },
    ],
};

export const dancesWithBalrog: Minion = {
    name: "Dances With Balrog",
    image: DancesWithBalrogImage,
    maxHP: 250,
    damage: 3,
    abilities: [
        {
            name: "Slash Blast",
            resourceCost: 0,
            image: SlashBlastImage,
            actions: [
                {
                    damage: 4,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    area: 1,
                },
            ],
        },
        {
            name: "Brandish",
            resourceCost: 1,
            image: BrandishImage,
            description: "Hits twice",
            actions: [
                {
                    damage: 3,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                },
                {
                    damage: 3,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                },
            ],
        },
        {
            name: "Brave Slash",
            resourceCost: 3,
            depletedOnUse: true,
            image: IntrepidSlashImage,
            castTime: 1,
            description: "Deal {{damage}} damage to a random enemy in the area, x3",
            actions: [
                {
                    damage: 3,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    targetArea: 1,
                },
                {
                    damage: 3,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    targetArea: 1,
                },
                {
                    damage: 3,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    targetArea: 1,
                },
            ],
        },
        {
            name: "Sledge",
            resourceCost: 3,
            castTime: 1,
            image: GiganticSledgeImage,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 7,
                    destroyArmor: 0.5,
                },
            ],
        },
    ],
    effects: [
        hardy,
        {
            name: "Trigger Boar Stance",
            canBeSilenced: false,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onWaveStart: {
                ability: boarStanceAbility,
                removeEffect: true,
            },
        },
        {
            name: "Trigger Balrog Stance",
            canBeSilenced: false,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onReceiveDamage: {
                usableWhileStunned: true,
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        healthPercentage: 0.25,
                        comparator: "lt",
                    },
                ],
                removeEffect: true,
                ability: balrogStanceAbility,
            },
        },
    ],
};

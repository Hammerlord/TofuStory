import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    MULTIPLIER_TYPES,
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
    HighPaladinImage,
    IntrepidSlashImage,
    JrBalrogImage,
    MossySnailImage,
    RedSnailShellImage,
    SlashBlastImage,
    SpikedMaceImage,
    StoneGolemIconImage,
    StoneGolemImage,
    StoneGolemRubbleImage,
    WarLeapImage,
    WildBoarImage,
} from "../images";
import { bleed, burn, hardy } from "./../ability/Effects";
import { counterEffect } from "./effect";

const golemStanceEligible: Effect = {
    name: "Stone Golem Stance Ready",
    description: "Character may cast Stone Golem Stance.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
};

const boarStanceEligible: Effect = {
    name: "Boar Stance Ready",
    description: "Character may cast Boar Stance.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
};

const snailStanceEligible: Effect = {
    name: "Snail Stance Ready",
    description: "Character may cast Snail Stance.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
};

const balrogStanceEligible: Effect = {
    name: "Balrog Stance Ready",
    description: "Character may cast Balrog Stance.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
};

const golemStanceEffect: Effect = {
    name: "Stone Golem Stance - Unrelenting Strength",
    icon: StoneGolemIconImage,
    description: "Immune to Stun, Bleed, Poison. Attacks apply Armor Down.",
    immunities: {
        type: "effect-type",
        value: [EFFECT_TYPES.STUN, EFFECT_TYPES.BLEED, EFFECT_TYPES.POISON],
    },
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    canBeSilenced: false,
    onAttack: {
        targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
        effects: [
            {
                name: "Armor Down",
                icon: StoneGolemRubbleImage,
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.DEBUFF,
                armorReceived: -1,
                duration: 1,
            },
        ],
    },
    onRemoved: {
        usableWhileStunned: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [boarStanceEligible],
    },
};

const snailStanceRedEffect: Effect = {
    name: "Snail Stance - Defensive Offense",
    canBeSilenced: false,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    onRemoved: {
        usableWhileStunned: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [golemStanceEligible],
    },
};

const snailStanceBlueEffect: Effect = {
    name: "Snail Stance - Perfect Defense",
    icon: BlueSnailShellImage,
    canBeSilenced: true,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    description: "Gaining 5 armor on attack.",
    preventArmorDecay: true,
    onAttack: {
        targetType: TRIGGER_TARGET_TYPES.ACTOR,
        armor: 5,
    },
};

const dancesWithBalrogWarLeap: Ability = {
    name: "War Leap",
    resourceCost: 0,
    image: WarLeapImage,
    actions: [
        {
            damage: 3,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            effects: [bleed],
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
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                ...counterEffect,
                description: "Countering for 5 damage when next attacked.",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                canBeSilenced: true,
                duration: 2,
                onReceiveAttack: {
                    disableTriggerFromProcs: true,
                    usableWhileStunned: false,
                    removeEffect: true,
                    targetType: TRIGGER_TARGET_TYPES.ACTOR,
                    ability: {
                        name: "Retaliate",
                        actions: [
                            {
                                type: ACTION_TYPES.ATTACK,
                                target: TARGET_TYPES.HOSTILE,
                                damage: 5,
                            },
                        ],
                    },
                },
                onTurnStart: {
                    removeEffect: true,
                },
            },
        ],
    },
    onHostileSummon: {
        targetType: TRIGGER_TARGET_TYPES.TARGET,
        ability: dancesWithBalrogWarLeap,
    },
    onRemoved: {
        usableWhileStunned: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [snailStanceEligible],
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
            animationOptions: {
                width: 71,
                height: 47,
            },
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            removeEffects: [boarStanceEligible.name],
        },
        {
            damage: 3,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
};

const meteor = {
    name: "Meteor",
    image: FireMarbleImage,
    actions: [
        {
            damage: 5,
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
};

const balrogStanceEffect: Effect = {
    name: "Balrog Stance - Overwhelming Power",
    description: "Every 3 abilities, this character casts Meteors.",
    attackAreaIncrease: 1,
    resourcesPerTurn: 1,
    attackPower: 1,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: BalrogIconImage,
    onAbility: {
        targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.ACTOR,
                numAbilitiesUsed: 3,
                comparator: "modulo",
            },
        ],
        ability: meteor,
    },
};

export const dancesWithBalrog: Minion = {
    name: "Dances With Balrog",
    image: DancesWithBalrogImage,
    maxHP: 450,
    mesos: 75,
    resources: 1,
    abilities: [
        {
            name: "Snail Stance",
            image: RedSnailShellImage,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    hasEffect: snailStanceEligible.name,
                    comparator: "eq",
                },
            ],
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    icon: MossySnailImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    effects: [snailStanceRedEffect, snailStanceBlueEffect],
                    armor: 100,
                    removeEffects: [snailStanceEligible.name],
                },
            ],
        },
        {
            name: "Golem Stance",
            image: StoneGolemIconImage,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    hasEffect: golemStanceEligible.name,
                    comparator: "eq",
                },
            ],
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    icon: StoneGolemImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    removeDebuffs: true,
                    effects: [golemStanceEffect],
                    removeEffects: [golemStanceEligible.name],
                },
            ],
        },
        {
            ...boarStanceAbility,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    hasEffect: boarStanceEligible.name,
                    comparator: "eq",
                },
            ],
        },
        {
            name: "Balrog Stance",
            image: BalrogIconImage,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    hasEffect: balrogStanceEligible.name,
                    comparator: "eq",
                },
            ],
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    effects: [balrogStanceEffect],
                    icon: JrBalrogImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    removeEffects: [balrogStanceEligible.name],
                },
                {
                    damage: 5,
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
        },
        {
            name: "Slam",
            image: SpikedMaceImage,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 7,
                },
            ],
        },
        {
            name: "Cleave",
            image: SlashBlastImage,
            actions: [
                {
                    damage: 5,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    area: 1,
                },
            ],
        },
        {
            name: "Brandish",
            image: BrandishImage,
            description: "Hits twice",
            actions: [
                {
                    damage: 4,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                },
                {
                    damage: 4,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                },
            ],
        },
        {
            name: "Brave Slash",
            resourceCost: 3,
            image: IntrepidSlashImage,
            castTime: 1,
            description: "Deal {{damage}} damage to a random enemy within the targeted area, x3",
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    hasEffect: boarStanceEffect.name,
                    comparator: "eq",
                },
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    hasEffect: balrogStanceEffect.name,
                    comparator: "eq",
                },
            ],
            actions: [
                {
                    damage: 5,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    targetArea: 1,
                },
                {
                    damage: 5,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    targetArea: 1,
                },
                {
                    damage: 5,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    targetArea: 1,
                    secondaryAction: {
                        target: "actor",
                        removeEffects: [boarStanceEffect.name],
                    },
                },
            ],
        },
        {
            name: "Sledge",
            resourceCost: 3,
            castTime: 1,
            image: GiganticSledgeImage,
            description: "Destroy 100% armor and deal 7 damage",
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    hasEffect: golemStanceEffect.name,
                    comparator: "eq",
                },
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    hasEffect: balrogStanceEffect.name,
                    comparator: "eq",
                },
            ],
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 7,
                    destroyArmor: 1,
                    secondaryAction: {
                        target: "actor",
                        removeEffects: [golemStanceEffect.name],
                    },
                },
            ],
        },
        {
            name: "Judgment",
            resourceCost: 3,
            castTime: 1,
            image: HighPaladinImage,
            description: "Deal 1 damage times character armor",
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    hasEffect: snailStanceRedEffect.name,
                    comparator: "eq",
                },
            ],
            actions: [
                {
                    damage: 1,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    multiplier: {
                        type: MULTIPLIER_TYPES.ARMOR,
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                    },
                    secondaryAction: {
                        target: "actor",
                        removeEffects: [snailStanceBlueEffect.name, snailStanceRedEffect.name],
                    },
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
                effects: [balrogStanceEligible],
                removeEffects: [
                    boarStanceEligible.name,
                    snailStanceEligible.name,
                    golemStanceEligible.name,
                    boarStanceEffect.name,
                    snailStanceBlueEffect.name,
                    snailStanceRedEffect.name,
                    golemStanceEffect.name,
                ],
            },
        },
    ],
};

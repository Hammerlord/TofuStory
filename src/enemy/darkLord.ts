import { hardy, poison, stealth, bleed, preventArmorDecay } from "../ability/Effects";
import {
    AvengerImage,
    KumbiImage,
    SapOfNependeathImage,
    SubiImage,
    DarkLordImage,
    BystanderImage,
    FlashJumpImage,
    DarkSightImage,
    AssassinateImage,
} from "../images";
import { CloudyIcon } from "../images/icons";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
    CONDITION_TARGETS,
    MORPH_TYPES,
    Effect,
} from "./../ability/types";

const shadowClone: Minion = {
    name: "Shadow Clone",
    maxHP: 1,
    armor: 29,
    image: DarkLordImage,
    abilities: [
        {
            name: "Throw Star",
            image: SubiImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    damage: 1,
                    icon: SubiImage,
                },
            ],
        },
    ],
    effects: [preventArmorDecay],
};

const realShadow: Minion = {
    name: "Shadow Clone",
    maxHP: 1,
    armor: 29,
    image: DarkLordImage,
    abilities: [
        {
            name: "Throw Star",
            image: SubiImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    damage: 1,
                    icon: KumbiImage,
                    effects: [{ ...poison, duration: 1 }],
                },
            ],
        },
    ],
    effects: [
        {
            name: "Real Clone",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onDeath: {
                ability: {
                    image: BystanderImage,
                    name: "Reveal",
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            damage: 100,
                            area: 5,
                            excludePrimaryTarget: true,
                        },
                    ],
                },
            },
        },
        preventArmorDecay,
    ],
};

const shadowClonesEffect: Effect = {
    name: "Shadow Clones",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
    conditions: [
        {
            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            healthPercentage: 0.7,
            comparator: "lt",
        },
    ],
    onReceiveDamage: {
        removeEffect: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        usableWhileStunned: true,
        ability: {
            name: "Shadow Clones",
            image: BystanderImage,
            resourceCost: 0,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    morph: {
                        type: MORPH_TYPES.MERGE,
                        minions: [
                            {
                                minion: shadowClone,
                            },
                            {
                                minion: shadowClone,
                            },
                            {
                                minion: realShadow,
                                storeSummoner: true,
                            },
                            {
                                minion: shadowClone,
                            },
                            {
                                minion: shadowClone,
                            },
                        ],
                    },
                },
            ],
        },
    },
};

export const darkLord: Minion = {
    name: "Dark Lord",
    isBoss: true,
    maxHP: 200,
    image: DarkLordImage,
    mesos: 60,
    abilities: [
        {
            name: "Throw Star",
            image: KumbiImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    damage: 3,
                    icon: KumbiImage,
                },
            ],
        },
        {
            name: "Lucky Seven",
            image: KumbiImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    damage: 2,
                    icon: KumbiImage,
                },
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    damage: 2,
                    icon: KumbiImage,
                },
            ],
        },
        {
            name: "Avenger",
            image: AvengerImage,
            actions: [
                {
                    damage: 5,
                    targetArea: 2,
                    numTargets: 2,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animationOptions: {
                        ricochet: true,
                    },
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    icon: AvengerImage,
                },
            ],
        },
        {
            name: "Throw Star",
            image: KumbiImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    damage: 3,
                    icon: KumbiImage,
                },
            ],
        },
        {
            name: "Dark Sight",
            resourceCost: 3,
            preemptive: true,
            image: DarkSightImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    icon: DarkSightImage,
                    effects: [
                        {
                            type: EFFECT_TYPES.STEALTH,
                            class: EFFECT_CLASSES.BUFF,
                            name: "Stealth",
                            icon: CloudyIcon,
                            canBeSilenced: true,
                            duration: 3,
                            description:
                                "Untargetable by attacks. Healing for 7 HP per turn while active. Effect ends if this character is hit by area damage",
                            onTurnStart: {
                                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                healing: 7,
                            },
                            onReceiveAttack: {
                                removeEffect: true,
                            },
                        },
                    ],
                },
            ],
        },
        {
            name: "Assassinate",
            resourceCost: 3,
            image: AssassinateImage,
            castTime: 1,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.SHOUT,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                    bonus: {
                        damage: 1,
                        conditions: [
                            {
                                calculationTarget: CONDITION_TARGETS.ACTOR,
                                hasEffectType: [EFFECT_TYPES.STEALTH],
                            },
                        ],
                    },
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                    bonus: {
                        damage: 1,
                        conditions: [
                            {
                                calculationTarget: CONDITION_TARGETS.ACTOR,
                                hasEffectType: [EFFECT_TYPES.STEALTH],
                            },
                        ],
                    },
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                    bonus: {
                        damage: 1,
                        conditions: [
                            {
                                calculationTarget: CONDITION_TARGETS.ACTOR,
                                hasEffectType: [EFFECT_TYPES.STEALTH],
                            },
                        ],
                    },
                    effects: [
                        {
                            ...bleed,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        hardy,
        {
            name: "Venom",
            description: "This character's attacks apply poison for 1 turn.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: SapOfNependeathImage,
            onAttack: {
                targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
                effects: [{ ...poison, duration: 1 }],
            },
        },
        {
            name: "Flash Jump",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            turnsTriggerFrequency: 5,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                ability: {
                    name: "Flash Jump",
                    image: FlashJumpImage,
                    resourceCost: 0,
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.EFFECT,
                            resources: 3,
                            armor: 15,
                            movement: 2,
                        },
                    ],
                },
            },
        },
        shadowClonesEffect,
        {
            ...shadowClonesEffect,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    healthPercentage: 0.3,
                    comparator: "lt",
                },
            ],
        },
    ],
};

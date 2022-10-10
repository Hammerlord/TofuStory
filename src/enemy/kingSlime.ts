import { kingslimeImage, slimeBubbleImage, slimeImage, slimeOmokImage, squishyLiquidImage } from "../images";
import { controlImmune, hardy } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    MORPH_MINION_MODIFIERS,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";

export const slimeGlobule: Minion = {
    name: "Slime Globule",
    image: slimeImage,
    isBoss: true,
    maxHP: 100,
    effects: [
        hardy,
        {
            name: "Vulnerable",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.DEBUFF,
            attackDamageReceived: 1,
            canBeSilenced: false,
        },
    ],
    abilities: [
        {
            name: "Reconvene",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    area: 5,
                    morph: {
                        minions: [
                            {
                                minion: "King Slime",
                                positionIndex: 2,
                            },
                        ],
                        modifiers: {
                            HP: MORPH_MINION_MODIFIERS.SUM,
                        },
                    },
                },
            ],
        },
    ],
};

export const kingSlimeEnemy: Minion = {
    name: "King Slime",
    image: kingslimeImage,
    isBoss: true,
    maxHP: 300,
    damage: 5,
    armor: 20,
    resources: 0,
    effects: [
        {
            name: "Thick Slime",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackDamageReceived: -3,
            canBeSilenced: false,
            icon: squishyLiquidImage,
            onReceiveEffect: {
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
                        comparator: "eq",
                    },
                ],
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [controlImmune],
            },
        },
        {
            name: "Bubbly",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            preventArmorDecay: true,
            canBeSilenced: true,
            icon: slimeBubbleImage,
            description: "Preventing armor decay.",
        },
        {
            name: "Squishy Inside",
            description: "When all this character's armor has been destroyed, it will burst into three slimes.",
            canBeSilenced: false,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: slimeOmokImage,
            onReceiveDamage: {
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        armor: 0,
                        comparator: "eq",
                    },
                ],
                ability: {
                    name: "Split",
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            morph: {
                                minions: [
                                    {
                                        minion: slimeGlobule.name,
                                        positionIndex: 0,
                                    },
                                    {
                                        minion: slimeGlobule.name,
                                        positionIndex: 2,
                                    },
                                    {
                                        minion: slimeGlobule.name,
                                        positionIndex: 4,
                                    },
                                ],
                                modifiers: {
                                    HP: MORPH_MINION_MODIFIERS.DIVIDE_EVENLY,
                                },
                            },
                        },
                    ],
                },
            },
        },
    ],
    abilities: [
        {
            name: "Earthquake",
            resourceCost: 1,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    area: 2,
                    animation: ANIMATION_TYPES.CAST,
                },
            ],
        },
    ],
};

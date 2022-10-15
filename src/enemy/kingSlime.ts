import { KingSlimeImage, SlimeBubbleImage, SlimeImage, SlimeOmokImage, SquishyLiquidImage } from "../images";
import { MountainIcon } from "../images/icons";
import { controlImmune, hardy } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    MORPH_MINION_MODIFIERS,
    SCALING_VALUE_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";

export const slimeGlobule: Minion = {
    name: "Slime Globule",
    image: SlimeImage,
    isBoss: true,
    maxHP: 100,
    effects: [
        hardy,
        {
            name: "Vulnerable",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.DEBUFF,
            attackDamageReceived: 3,
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
    image: KingSlimeImage,
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
            icon: SquishyLiquidImage,
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
            icon: SlimeBubbleImage,
            description: "Preventing armor decay.",
        },
        {
            name: "Squishy Inside",
            description: "When all this character's armor has been destroyed, it will burst into three slimes.",
            canBeSilenced: false,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: SlimeOmokImage,
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
            resourceCost: 3,
            image: MountainIcon,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                    area: 2,
                    animation: ANIMATION_TYPES.CAST,
                    effects: [
                        {
                            name: "Quaking",
                            description: "Receiving increased damage from Earthquake.",
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.DEBUFF,
                            icon: MountainIcon,
                            abilityDamageReceived: [
                                {
                                    abilityName: "Earthquake",
                                    damage: 2,
                                    type: SCALING_VALUE_TYPES.FLAT,
                                },
                            ],
                            duration: 3,
                        },
                    ],
                },
            ],
        },
    ],
};

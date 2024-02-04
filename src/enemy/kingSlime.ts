import { attack } from "./abilities";
import { KingSlimeImage, SlimeBubbleImage, SlimeIdleImage, SlimeOmokImage, SquishyLiquidImage } from "../images";
import { CrossedSwordsIcon, MountainIcon } from "../images/icons";
import { hardy, raging, stun } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MORPH_MINION_MODIFIERS,
    MORPH_TYPES,
    Minion,
    SCALING_VALUE_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";

export const slimeGlobule: Minion = {
    name: "Slime Globule",
    image: SlimeIdleImage,
    isBoss: true,
    maxHP: 100,
    resources: 0,
    effects: [
        stun,
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
            name: "Slide",
            actions: [
                {
                    movement: 1,
                    description: "{{caster}} has moved.",
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.MOVEMENT,
                },
            ],
        },
        {
            name: "Merge",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    area: 5,
                    morph: {
                        type: MORPH_TYPES.MERGE,
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
    armor: 25,
    effects: [
        {
            ...hardy,
            name: "Thick Slime",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackDamageReceived: -3,
            canBeSilenced: false,
            icon: SquishyLiquidImage,
            disableDisplayIcon: false,
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
            description: "When this character receives direct damage, it will burst into three vulnerable slimes.",
            canBeSilenced: false,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: SlimeOmokImage,
            onReceiveDamage: {
                usableWhileStunned: true,
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
                                type: MORPH_TYPES.MERGE,
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
        {
            ...raging,
            disableDisplayIcon: true,
        },
    ],
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                },
            ],
        },
        {
            name: "Earthquake",
            resourceCost: 3,
            image: MountainIcon,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 7,
                    secondaryDamage: 3,
                    area: 2,
                    animation: ANIMATION_TYPES.STOMP,
                },
            ],
        },
    ],
};

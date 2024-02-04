import { attack } from "./abilities";
import { BarrelImage, BatsEffectImage, BombImage, StumpyBatImage, StumpyImage, WeaponMasteryImage } from "../images";
import { MountainIcon } from "../images/icons";
import { burn, hardy } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { bats, dryBranch, hardwood } from "./effect";

const explosiveBarrel: Minion = {
    name: "Explosive Barrel",
    maxHP: 12,
    image: BarrelImage,
    abilities: [],
    effects: [
        {
            name: "Explosive",
            description: "When destroyed, the barrel explodes, burning characters within 2 tiles on the same side.",
            icon: BombImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeath: {
                usableWhileStunned: true,
                ability: {
                    name: "Explode",
                    image: BombImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            animation: ANIMATION_TYPES.EXPLODE,
                            damage: 5,
                            area: 2,
                            effects: [burn],
                        },
                    ],
                },
            },
        },
    ],
};

export const stumpy: Minion = {
    name: "Stumpy",
    image: StumpyImage,
    isBoss: true,
    maxHP: 250,
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
        {
            name: "Bats!",
            image: StumpyBatImage,
            resourceCost: 3,
            preemptive: true,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    icon: BatsEffectImage,
                    effects: [bats],
                },
            ],
        },
        {
            name: "Quake",
            image: MountainIcon,
            resourceCost: 3,
            castTime: 1,
            channelDuration: 3,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.STOMP,
                    damage: 4,
                    area: 2,
                },
            ],
        },
    ],
    effects: [
        hardy,
        {
            ...hardwood,
            name: "Warped Wood",
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Growing Strength",
                        description: "Effect is removed if the character is burning.",
                        icon: WeaponMasteryImage,
                        attackPower: 1,
                        canBeSilenced: true,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        onReceiveEffect: {
                            conditions: [
                                {
                                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                    hasEffectType: [EFFECT_TYPES.BURN],
                                },
                            ],
                            removeEffect: true,
                        },
                    },
                ],
            },
        },
        dryBranch,
        {
            name: "Summon Barrel",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 6,
            onTurnStart: {
                usableWhileStunned: true,
                ability: {
                    name: "",
                    actions: [
                        {
                            type: ACTION_TYPES.NONE,
                            target: TARGET_TYPES.SELF,
                            summon: [
                                {
                                    minion: [explosiveBarrel],
                                },
                            ],
                        },
                    ],
                },
            },
        },
    ],
};

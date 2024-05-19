import { counterEffect } from "./effect";
import { ManjiImage, NamelessSwordImage, SwordImage } from "../images";
import { EyeIcon } from "../images/icons";
import { attackPower } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { attack } from "./abilities";

const counter: Ability = {
    name: "Counter",
    image: NamelessSwordImage,
    actions: [
        {
            icon: NamelessSwordImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [{ ...counterEffect, onTurnStart: { removeEffect: true } }],
        },
    ],
};

const spotWeaknessEffect: Effect = {
    name: "Spot Weakness",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: EyeIcon,
    description: "Gains +ATT for next turn whenever an enemy plays a support ability.",
    onHostileSupportAbility: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                ...attackPower,
                duration: 1,
            },
        ],
    },
};

export const manjiMirrorCounter: Minion = {
    name: "Mirror Image",
    isElite: true,
    image: ManjiImage,
    maxHP: 27,
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
    effects: [{ ...counterEffect }],
};

export const manjiMirrorSpotWeakness: Minion = {
    name: "Mirror Image",
    isElite: true,
    image: ManjiImage,
    maxHP: 27,
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
    effects: [{ ...spotWeaknessEffect }],
};

const spotWeakness: Ability = {
    name: "Spot Weakness",
    image: EyeIcon,
    actions: [
        {
            icon: EyeIcon,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [{ ...spotWeaknessEffect, onTurnStart: { removeEffect: true } }],
        },
    ],
};

export const manji: Minion = {
    name: "Manji, the Strongest Swordsman",
    maxHP: 350,
    isElite: true,
    image: ManjiImage,
    mesos: 50,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 6,
                },
            ],
        },
        {
            name: "Mirror Images",
            image: ManjiImage,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [
                        { minion: [manjiMirrorCounter, manjiMirrorSpotWeakness] },
                        { minion: [manjiMirrorCounter, manjiMirrorSpotWeakness] },
                    ],
                },
            ],
        },
        {
            ...attack,
            image: SwordImage,
            name: "Double Slash",
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 4,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 4,
                },
            ],
        },
    ],
    effects: [
        {
            name: "Perfect Counter Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            turnsTriggerFrequency: 2,
            uptime: 2,
            onTurnEnd: {
                ability: counter,
            },
        },
        {
            name: "Spot Weakness Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            turnsTriggerFrequency: 2,
            onTurnEnd: {
                ability: spotWeakness,
            },
        },
        {
            name: "Spot Weakness Effect 2",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onBattleStart: {
                ability: spotWeakness,
                removeEffect: true,
            },
        },
    ],
};

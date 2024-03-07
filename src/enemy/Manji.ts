import { ManjiImage, NamelessSwordImage } from "../images";
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

const perfectCounterEffect: Effect = {
    name: "Perfect Counter",
    description: "Countering for 3 damage when attacked.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: NamelessSwordImage,
    canBeSilenced: true,
    onReceiveAttack: {
        disableTriggerFromProcs: true,
        usableWhileStunned: false,
        targetType: TRIGGER_TARGET_TYPES.ACTOR,
        ability: {
            name: "Counter",
            image: NamelessSwordImage,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
    },
};

const perfectCounter: Ability = {
    name: "Perfect Counter",
    image: NamelessSwordImage,
    actions: [
        {
            icon: NamelessSwordImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [{ ...perfectCounterEffect, onTurnStart: { removeEffect: true } }],
        },
    ],
};

const spotWeaknessEffect: Effect = {
    name: "Spot Weakness",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: EyeIcon,
    description: "Gains ATT whenever an enemy plays a support ability.",
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
    maxHP: 14,
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
    effects: [{ ...perfectCounterEffect }],
};

export const manjiMirrorSpotWeakness: Minion = {
    name: "Mirror Image",
    isElite: true,
    image: ManjiImage,
    maxHP: 14,
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
    maxHP: 150,
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
                ability: perfectCounter,
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

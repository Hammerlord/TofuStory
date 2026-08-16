import { counterEffect } from "./effect";
import { GlitteringMirrorImage, ManjiImage, NamelessSwordImage, SwordImage, TeleportImage } from "../images";
import { EyeIcon } from "../images/icons";
import { attackPower, hardy } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { attack } from "./abilities";

const dissipate = {
    name: "Dissipate",
    image: GlitteringMirrorImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            retreat: true,
            animationOptions: {
                fadeOut: true, // TODO does nothing on combatant portraits
            },
        },
    ],
};

const disappear: Effect = {
    name: "Apparition",
    icon: GlitteringMirrorImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
    description: "Disappears if stunned, frozen, silenced, or if Manji is defeated.",
    onFriendlyDeath: {
        usableWhileStunned: true,
        usableWhileDead: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.TARGET,
                name: "Manji",
                comparator: "includes",
            },
        ],
        ability: dissipate,
    },
    onReceiveEffect: {
        usableWhileStunned: true,
        removeEffect: true, // onDeath removeEffect is insufficient for some reason
        ability: dissipate,
        conditions: [
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE, EFFECT_TYPES.SILENCE],
                comparator: "eq",
            },
        ],
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
    },
};

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
    armor: 45,
    maxHP: 5,
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
    effects: [disappear, { ...counterEffect }],
};

export const manjiMirrorSpotWeakness: Minion = {
    name: "Mirror Image",
    isElite: true,
    image: ManjiImage,
    armor: 45,
    maxHP: 5,
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
    effects: [disappear, { ...spotWeaknessEffect }],
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
        hardy,
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

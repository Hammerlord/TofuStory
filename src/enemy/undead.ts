import { eliteThorns, taunt } from "../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import {
    DragonSkullImage,
    KumbiImage,
    OfficerSkeletonImage,
    RicheImage,
    SkelegonImage,
    SkeletonOfHorrorImage,
    SkeletonSoldierImage,
    SkullStaffImage,
    SkullStrikerImage,
} from "../images";
import { ShieldIcon } from "../images/icons";
import { attackPower } from "./../ability/Effects";
import { attack, loaf } from "./abilities";

const clubSkeletonMinion: Minion = {
    name: "Skeleton Soldier",
    maxHP: 25,
    image: SkeletonSoldierImage,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        loaf,
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
    ],
};

export const swordSkeletonMinion: Minion = {
    name: "Officer Skeleton",
    maxHP: 5,
    armor: 50,
    image: OfficerSkeletonImage,
    effects: [taunt, eliteThorns],
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 1,
                },
            ],
        },
    ],
};

const skelegonMinion: Minion = {
    name: "Skelegon",
    image: SkelegonImage,
    maxHP: 20,
    effects: [],
    abilities: [
        {
            name: "Screech",
            image: DragonSkullImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.SHOUT,
                    area: 2,
                    effects: [
                        {
                            ...attackPower,
                            type: EFFECT_TYPES.RAGE,
                        },
                    ],
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 1,
                },
            ],
        },
    ],
};

const agonyCard: Ability = {
    name: "Agony",
    image: SkeletonOfHorrorImage,
    description:
        "While this is in your hand, self-inflict {{ onAbility.ability.actions.0.damage }} {{{ _damage_ }}} for every card you play.",
    unplayable: true,
    onAbility: {
        ability: {
            name: "Agony",
            image: SkeletonOfHorrorImage,
            actions: [
                {
                    type: ACTION_TYPES.HINDER,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.SPIN,
                    damage: 2,
                },
            ],
        },
    },
    actions: [
        {
            type: ACTION_TYPES.HINDER,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const undeadMage: Minion = {
    name: "Riche, the Undead Mage",
    maxHP: 300,
    mesos: 100,
    isBoss: true,
    image: RicheImage,
    abilities: [
        {
            name: "Curse Bolt",
            image: SkeletonOfHorrorImage,
            description: "Adds an Agony card to the player's deck.",
            actions: [
                {
                    damage: 7,
                    icon: SkullStrikerImage,
                    animation: ANIMATION_TYPES.BEAM,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    addCards: [agonyCard],
                },
            ],
        },
        {
            name: "Summon Skeletons",
            dialog: "Arise, minions!",
            image: SkullStaffImage,
            actions: [
                {
                    summon: [
                        {
                            minion: [clubSkeletonMinion, swordSkeletonMinion],
                            tributePossible: true,
                        },
                        {
                            minion: [clubSkeletonMinion, swordSkeletonMinion],
                            tributePossible: true,
                        },
                    ],
                },
            ],
        },
        {
            name: "Bolster Skeletons",
            image: ShieldIcon,
            description: "Grants Armor to allies.",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    area: 2,
                    excludePrimaryTarget: true,
                    armor: 15,
                },
            ],
        },
        {
            name: "Dark Bolt",
            image: KumbiImage,
            actions: [
                {
                    damage: 5,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.BEAM,
                    icon: KumbiImage,
                    playbackTime: 400,
                },
            ],
        },
        {
            name: "Arise, Minions!",
            image: SkullStaffImage,
            resourceCost: 3,
            castTime: 1,
            channelDuration: 3,
            dialog: "Arise, minions!!!",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    icon: SkullStaffImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    summon: [
                        {
                            minion: [clubSkeletonMinion, skelegonMinion],
                            tributePossible: true,
                        },
                        {
                            minion: [swordSkeletonMinion],
                            tributePossible: true,
                        },
                        {
                            minion: [clubSkeletonMinion, skelegonMinion],
                            tributePossible: true,
                        },
                        {
                            minion: [clubSkeletonMinion, swordSkeletonMinion],
                            tributePossible: true,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        {
            name: "",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onBattleStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                ability: {
                    name: "Summon Skeletons",
                    image: SkullStaffImage,
                    dialog: "Arise, minions!",
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            summon: [
                                {
                                    minion: [swordSkeletonMinion],
                                    tributePossible: true,
                                },
                                {
                                    minion: [clubSkeletonMinion],
                                    tributePossible: true,
                                },
                            ],
                            playbackTime: 1500,
                        },
                    ],
                },
                removeEffect: true,
            },
        },
        {
            name: "Reaper",
            icon: SkullStrikerImage,
            description: "Gains +1 attack power on kill.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onKill: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        ...attackPower,
                        duration: 5,
                    },
                ],
            },
        },
    ],
};

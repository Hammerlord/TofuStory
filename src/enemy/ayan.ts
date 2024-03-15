import { ACTION_TYPES, ANIMATION_TYPES, Minion, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../ability/types";
import { AvengersArrowImage, AyanImage, BattleStatueImage, BrandishImage, SpiritVikingFlagImage } from "../images";
import { CrossedSwordsIcon } from "../images/icons";
import { hardy } from "./../ability/Effects";
import { attack } from "./abilities";
import { battleTrance, counterEffect } from "./effect";

const phalanx: Minion = {
    name: "Phalanx",
    image: BattleStatueImage,
    maxHP: 1,
    armor: 50,
    abilities: [
        {
            name: "Shoot",
            image: AvengersArrowImage,
            resourceCost: 0,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    icon: AvengersArrowImage,
                    playbackTime: 400,
                    damage: 3,
                    animationOptions: {
                        rotate: -45,
                    },
                },
            ],
        },
    ],
    effects: [battleTrance],
};

export const ayanEnemy: Minion = {
    name: "Ayan",
    image: AyanImage,
    isElite: true,
    maxHP: 150,
    mesos: 50,
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
            name: "Brandish",
            image: BrandishImage,
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
            name: "Clash",
            description: "Ayan clashes with a chosen target for two blows, dealing 7 damage per hit.",
            resourceCost: 3,
            castTime: 1,
            image: SpiritVikingFlagImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.SHOUT,
                    effects: [
                        {
                            ...counterEffect,
                            name: "It's Time To Duel!",
                            icon: CrossedSwordsIcon,
                        },
                    ],
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 7,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 7,
                    removeEffects: ["It's Time To Duel!"],
                },
            ],
        },
        {
            name: "Call Phalanx",
            resourceCost: 3,
            castTime: 1,
            channelDuration: 2,
            image: BattleStatueImage,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    comparator: "lt",
                    numFriendly: 5,
                },
            ],
            actions: [
                {
                    type: ACTION_TYPES.NONE,
                    target: TARGET_TYPES.SELF,
                    summon: [
                        { minion: [phalanx], placement: "adjacent" },
                        { minion: [phalanx], placement: "adjacent" },
                    ],
                },
            ],
        },
    ],
    effects: [hardy, battleTrance],
};

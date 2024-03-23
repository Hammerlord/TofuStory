import { ACTION_TYPES, ANIMATION_TYPES, Minion, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../ability/types";
import { AyanImage, BattleStatueImage, BrandishImage, SpiritVikingFlagImage } from "../images";
import { CrossedSwordsIcon } from "../images/icons";
import { hardy } from "./../ability/Effects";
import { attack, shoot } from "./abilities";
import { battleTrance, counterEffect } from "./effect";

const phalanx: Minion = {
    name: "Phalanx",
    image: BattleStatueImage,
    maxHP: 1,
    armor: 50,
    abilities: [
        {
            ...shoot,
            actions: [
                {
                    ...shoot.actions[0],
                    damage: 3,
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
    maxHP: 200,
    mesos: 50,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 4,
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
                    damage: 3,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 4,
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
                },
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.SHOUT,
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

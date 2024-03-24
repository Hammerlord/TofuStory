import { hardy } from "../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { MushmomImage, MushmomJumpImage, OrangeMushroomImage } from "../images";
import { MountainIcon } from "../images/icons";
import { attack, doOtherWave, doWave, whomp } from "./abilities";
import { orangeMushroom } from "./enemy";

export const mushmom: Minion = {
    name: "Mushmom",
    image: MushmomImage,
    isBoss: true,
    maxHP: 300,
    abilities: [
        {
            name: "Call Mushroom",
            image: OrangeMushroomImage,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [
                        { minion: [orangeMushroom], placement: "adjacent" },
                        { minion: [orangeMushroom], placement: "adjacent" },
                    ],
                },
            ],
        },
        { ...whomp, resourceCost: 0, castTime: undefined },
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
        { ...whomp, resourceCost: 0, castTime: undefined },
        {
            name: "Do the Wave!",
            image: MushmomJumpImage,
            resourceCost: 3,
            castTime: 1,
            actions: [doWave.actions[0], doOtherWave.actions[0]],
        },
        {
            name: "Earthquake",
            resourceCost: 3,
            castTime: 1,
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
    effects: [hardy],
};

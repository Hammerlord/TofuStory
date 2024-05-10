import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import { CurseImage, DarkSightImage, JrBoogieImage } from "../images";
import { FireIcon, SpeechBubbleIcon } from "../images/icons";
import { burn, stealth } from "./../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, Ability, CONDITION_TARGETS, Minion, TARGET_TYPES } from "./../ability/types";
import { loaf } from "./abilities";
import { curseCard, sealCard } from "./curseCards";

export const jrBoogie: Minion = {
    name: "Jr. Boogie",
    image: JrBoogieImage,
    mesos: 50,
    maxHP: 125,
    isElite: true,
    abilities: [
        {
            name: "Seal",
            image: SpeechBubbleIcon,
            description: "Adds a Seal card to the player's deck.",
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: CurseImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    addCardsToDiscard: [sealCard],
                    damage: 3,
                },
            ],
        },
        {
            name: "Boogie Fire",
            image: FireIcon,
            actions: [
                {
                    icon: FireIcon,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animationOptions: {
                        sidewinder: true,
                    },
                    area: 2,
                    effects: [{ ...burn, stacks: 2 }],
                },
            ],
        },
        {
            name: "Stealth",
            image: DarkSightImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [
                        {
                            ...stealth,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
        {
            name: "Boogie Fire",
            image: FireIcon,
            actions: [
                {
                    icon: FireIcon,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animationOptions: {
                        sidewinder: true,
                    },
                    area: 2,
                    effects: [{ ...burn, stacks: 2 }],
                },
            ],
        },
        loaf,
        {
            name: "Curse",
            image: CurseImage,
            description: "Adds a Curse card to the player's deck.",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    icon: CurseImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    addCardsToDiscard: [curseCard],
                    damage: 3,
                },
            ],
        },
        {
            name: "Boogie Time",
            image: JrBoogieImage,
            description: "Casts Boogie Fire. Adds a Curse card to the player's deck.",
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    icon: FireIcon,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animationOptions: {
                        sidewinder: true,
                    },
                    area: 2,
                    effects: [{ ...burn, stacks: 2 }],
                    addCardsToDiscard: [curseCard],
                },
            ],
        },
    ],
    effects: [{ ...stealth, duration: 1 }],
};

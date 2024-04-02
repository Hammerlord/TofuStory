import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import { CurseImage, DarkSightImage, JrBoogieImage } from "../images";
import { FireIcon, SpeechBubbleIcon } from "../images/icons";
import { burn, stealth } from "./../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, Ability, CONDITION_TARGETS, Minion, TARGET_TYPES } from "./../ability/types";

export const sealCard: Ability = {
    name: "Seal",
    image: SpeechBubbleIcon,
    description: "Adjacent cards are unplayable.",
    depletedOnUse: true,
    resourceCost: 1,
    aura: {
        area: 1,
        effects: [
            {
                isLocked: true,
            },
        ],
    },
    actions: [
        {
            type: ACTION_TYPES.HINDER,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const curseCard: Ability = {
    name: "Curse",
    image: CurseImage,
    resourceCost: 2,
    description: "Reduce cost by 1 for every {{{ _support_ }}} {{{ _summon_ }}} card played this turn.",
    depletedOnUse: true,
    onAbilityUse: {
        abilityEffects: [
            {
                resourceCost: -1,
            },
        ],
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                isOffense: false,
                comparator: "eq",
            },
        ],
    },
    actions: [
        {
            type: ACTION_TYPES.HINDER,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const jrBoogie: Minion = {
    name: "Jr. Boogie",
    image: JrBoogieImage,
    mesos: 50,
    maxHP: 150,
    isElite: true,
    abilities: [
        {
            name: "Seal",
            image: SpeechBubbleIcon,
            description: "Adds a Seal card to the player's deck.",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    icon: CurseImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    addCardsToDeck: [sealCard],
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
                    effects: [{ ...burn, duration: 2 }],
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
                    effects: [{ ...burn, duration: 2 }],
                },
            ],
        },
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
                    addCardsToDeck: [curseCard],
                    damage: 3,
                },
            ],
        },
        {
            name: "Boogie Time",
            image: JrBoogieImage,
            description: "Casts Boogie Fire. Adds a Seal and Curse card to the player's deck.",
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
                    effects: [{ ...burn, duration: 2 }],
                    addCardsToDeck: [sealCard, curseCard],
                },
            ],
        },
    ],
    effects: [{ ...stealth, duration: 2 }],
};

import {
    darkimpaleImage,
    darkspearImage,
    darkThirstImage,
    evileyeminion,
    evileyeskill,
    Heart,
    piercingdriveImage,
    spearsweepImage,
} from "../../images";
import { silence, stealth, stun, wound } from "../Effects";
import { Ability, AbilityCondition, ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES } from "../types";

export const evilEye: Ability = {
    name: "Evil Eye",
    resourceCost: 1,
    image: evileyeskill,
    minion: {
        name: "Evil Eye",
        image: evileyeminion,
        damage: 0,
        maxHP: 1,
        effects: [
            stealth,
            {
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                description: "Heals a random ally for 1 each turn.",
                healTargetPerTurn: 1,
                duration: Infinity,
                icon: Heart,
            },
        ],
    },
    actions: [],
};

export const darkImpale: Ability = {
    name: "Dark Impale",
    resourceCost: 2,
    image: darkimpaleImage,
    actions: [
        {
            damage: 3,
            secondaryDamage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    ...wound,
                    duration: 2,
                },
            ],
            area: 2,
        },
    ],
};

export const darkThirst: Ability = {
    name: "Dark Thirst",
    resourceCost: 1,
    image: darkThirstImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Dark Thirst",
                    icon: darkThirstImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    damage: 1,
                    duration: 1,
                    leech: 0.5,
                },
            ],
        },
    ],
};

export const darkSpear: Ability = {
    name: "Dark Spear",
    resourceCost: 3,
    image: darkspearImage,
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            effects: [{ ...silence }],
            bonus: {
                damage: 5,
                conditions: [
                    {
                        calculationTarget: "target",
                        armor: 0,
                        comparator: "gt",
                    } as AbilityCondition,
                ],
            },
        },
    ],
};

export const piercingDrive: Ability = {
    name: "Piercing Drive",
    resourceCost: 1,
    image: piercingdriveImage,
    actions: [
        {
            area: 1,
            damage: 4,
            secondaryDamage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            bonus: {
                damage: 1,
                conditions: [
                    {
                        calculationTarget: "target",
                        hasEffectType: [EFFECT_TYPES.STUN],
                    },
                ],
            },
        },
    ],
};

export const spearSweep: Ability = {
    name: "Spear Sweep",
    resourceCost: 2,
    image: spearsweepImage,
    actions: [
        {
            area: 2,
            damage: 2,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [stun],
        },
    ],
};

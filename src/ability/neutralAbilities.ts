import { BlueSnailShellImage, RedSnailShellImage, SnailShellImage } from "../images";
import { Ability, ACTION_TYPES, ANIMATION_TYPES, TARGET_TYPES } from "./types";

export const shellThrowRed: Ability = {
    name: "Shell Throw",
    image: RedSnailShellImage,
    depletedOnUse: true,
    resourceCost: 1,
    actions: [
        {
            damage: 14,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
            icon: RedSnailShellImage,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

const shellThrowBlue: Ability = {
    name: "Shell Throw",
    image: BlueSnailShellImage,
    depletedOnUse: true,
    resourceCost: 1,
    actions: [
        {
            damage: 11,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
            icon: BlueSnailShellImage,
            addCardsToDeck: [shellThrowRed],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                    addCardsToDeckOptions: {
                        isUpgraded: true,
                    },
                },
            ],
        },
    ],
};

export const shellThrow: Ability = {
    name: "Shell Throw",
    image: SnailShellImage,
    depletedOnUse: true,
    resourceCost: 1,
    actions: [
        {
            damage: 8,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
            icon: SnailShellImage,
            addCardsToDeck: [shellThrowBlue],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                    addCardsToDeckOptions: {
                        isUpgraded: true,
                    },
                },
            ],
        },
    ],
};

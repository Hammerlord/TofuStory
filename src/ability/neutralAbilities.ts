import { BlueSnailShellImage, BounceImage, ComboSynergyImage, RedSnailShellImage, SnailShellImage } from "../images";
import { RARITIES } from "../item/types";
import { Ability, ACTION_TYPES, ANIMATION_TYPES, SELECT_CARD_TYPES, TARGET_TYPES } from "./types";

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
                        upgradeLevels: 1,
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
                        upgradeLevels: 1,
                    },
                },
            ],
        },
    ],
};

export const bounce: Ability = {
    name: "Bounce",
    image: BounceImage,
    resourceCost: 1,
    overrideBodyText: true,
    description: "Discard your hand. Then, draw {{ actions.1.drawCards.amount }}.",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            discardCardsFromHand: {
                amount: 10,
            },
        },
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.NONE,
            drawCards: {
                amount: 3,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {},
                {
                    drawCards: {
                        amount: 1,
                    },
                },
            ],
        },
    ],
};

export const reinforce: Ability = {
    name: "Reinforce",
    image: ComboSynergyImage,
    description:
        "Search for a {{{ _support_ }}} {{{ _summon_ }}} card from your deck. It costs {{ actions.0.selectCards.effects.0.resourceCost }} less until discarded.",
    resourceCost: 0,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.SEARCH_DECK,
                filters: [
                    {
                        primaryActionType: ACTION_TYPES.EFFECT,
                    },
                    {
                        hasMinion: true,
                    },
                ],
                effects: [
                    {
                        resourceCost: -1,
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    selectCards: {
                        effects: [
                            {
                                resourceCost: -1,
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

export const NEUTRAL_ABILITIES = [shellThrow, bounce, reinforce];

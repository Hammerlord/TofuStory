import { attack } from "./../enemy/abilities";
import {
    BlueSnailShellImage,
    BounceImage,
    ComboSynergyImage,
    CynicalOrangeMushroomJumpImage,
    EncroachingDarknessImage,
    RedSnailShellImage,
    SnailShellImage,
    ZakumArmLeft2Image,
    ZakumArmLeftImage,
    ZakumArmRight2Image,
    ZakumArmRightImage,
    ZakumImage,
} from "../images";
import { RARITIES } from "../item/types";
import {
    Ability,
    ACTION_TYPES,
    ANIMATION_TYPES,
    Effect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./types";
import { stealth, taunt } from "./Effects";
import { incorporeal } from "../enemy/effect";

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

const exiledOneArmEffect: Effect = {
    name: "Vestige of the Exiled One",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    untargetable: true,
    immunities: {
        type: "effect-class",
        value: [EFFECT_CLASSES.DEBUFF],
    },
    onSummoned: [
        {
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    comparator: "eq",
                    numFriendly: 4, // Including itself
                    filters: [
                        {
                            property: "name",
                            comparator: "includes",
                            value: "of the Exiled One",
                        },
                    ],
                },
            ],
            targetType: TRIGGER_TARGET_TYPES.PLAYER,
            induceCombatant: {
                action: [
                    {
                        type: ACTION_TYPES.EFFECT,
                        target: TARGET_TYPES.SELF,
                        animation: ANIMATION_TYPES.SHOUT,
                        resources: 1,
                        drawCards: {
                            amount: 2,
                        },
                        effects: [
                            {
                                name: "Avatar of the Exiled One",
                                icon: ZakumImage,
                                override: {
                                    portrait: ZakumImage,
                                    weapon: null,
                                },
                                attackPower: 5,
                                drawCardsPerTurn: 1,
                                resourcesPerTurn: 1,
                                type: EFFECT_TYPES.RAGE,
                                class: EFFECT_CLASSES.BUFF,
                                maxApplications: 1,
                            },
                        ],
                    },
                ],
            },
        },
        {
            targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            induceCombatantAttack: true,
        },
    ],
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        induceCombatantAttack: true,
    },
};

export const firstExiledArm: Ability = {
    name: "First Arm of the Exiled One",
    exclusive: "Arm of the Exiled One",
    resourceCost: 1,
    image: ZakumArmLeftImage,
    description: "<b>Uncontrollable. Can't be targeted.</b> <br/> Assemble the Four Arms to tap into the Exiled One's power.",
    overrideBodyText: true,
    isUnique: true,
    rarity: RARITIES.RARE,
    minion: {
        name: "First Arm of the Exiled One",
        uncontrollable: true,
        image: ZakumArmLeftImage,
        maxHP: 3,
        imageOptions: {
            animation: "float",
        },
        abilities: [
            {
                ...attack,
                actions: [
                    {
                        type: ACTION_TYPES.RANGE_ATTACK,
                        target: TARGET_TYPES.HOSTILE,
                        icon: EncroachingDarknessImage,
                        animationOptions: {
                            width: 100,
                            height: 100,
                        },
                        damage: 3,
                    },
                ],
            },
        ],
        effects: [exiledOneArmEffect, incorporeal],
    },
    actions: [],
};

export const secondExiledArm: Ability = {
    ...firstExiledArm,
    name: "Second Arm of the Exiled One",
    image: ZakumArmLeft2Image,
    rarity: RARITIES.RARE,
    minion: {
        ...firstExiledArm.minion,
        name: "Second Arm of the Exiled One",
        image: ZakumArmLeft2Image,
    },
};

export const thirdExiledArm: Ability = {
    ...firstExiledArm,
    name: "Third Arm of the Exiled One",
    image: ZakumArmRightImage,
    rarity: RARITIES.RARE,
    minion: {
        ...firstExiledArm.minion,
        name: "Third Arm of the Exiled One",
        image: ZakumArmRightImage,
    },
};

export const fourthExiledArm: Ability = {
    ...firstExiledArm,
    name: "Fourth Arm of the Exiled One",
    image: ZakumArmRight2Image,
    rarity: RARITIES.RARE,
    minion: {
        ...firstExiledArm.minion,
        name: "Fourth Arm of the Exiled One",
        image: ZakumArmRight2Image,
    },
};

export const provoke: Ability = {
    name: "Provoke",
    resourceCost: 1,
    image: CynicalOrangeMushroomJumpImage,
    description: "Grants Taunt for the next turn.",
    overrideBodyText: true,
    actions: [
        {
            target: TARGET_TYPES.FRIENDLY,
            type: ACTION_TYPES.EFFECT,
            effects: [{ ...taunt, duration: 2 }],
            armor: 7,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 2,
                },
            ],
        },
    ],
};

export const NEUTRAL_ABILITIES = [shellThrow, bounce, reinforce, firstExiledArm, secondExiledArm, thirdExiledArm, fourthExiledArm, provoke];

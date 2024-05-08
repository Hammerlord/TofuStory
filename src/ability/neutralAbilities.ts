import { attack } from "./../enemy/abilities";
import {
    BlueSnailShellImage,
    BounceImage,
    CombatOrdersImage,
    ComboSynergyImage,
    CynicalOrangeMushroomJumpImage,
    EncroachingDarknessImage,
    EvilCupImage,
    RedSnailShellImage,
    SkeletonOfHorrorImage,
    SnailShellImage,
    StompImage,
    ZakumArmLeft2Image,
    ZakumArmLeftImage,
    ZakumArmRight2Image,
    ZakumArmRightImage,
    ZakumHelmetImage,
    ZakumImage,
} from "../images";
import { RARITIES } from "../item/types";
import {
    Ability,
    ACTION_TYPES,
    ANIMATION_TYPES,
    CARD_PILE_TYPES,
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

export const stomp: Ability = {
    name: "Stomp",
    image: StompImage,
    resourceCost: 1,
    description: "Move the top card of your discard to your hand.",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 8,
            moveCards: {
                from: CARD_PILE_TYPES.DISCARD,
                to: CARD_PILE_TYPES.HAND,
                amount: 1,
                moveType: "append",
            },
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
    description: "<b>Incorporeal. Untargetable.</b> Immune to debuffs. <b>Auto:</b> Attack every turn.",
    tooltip: {
        title: "Arm of the Exiled One",
        icon: ZakumHelmetImage,
        description: "Assemble the Four Arms to tap into a forbidden power.",
    },
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
                            width: 150,
                            height: 150,
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
                    armor: 3,
                },
            ],
        },
    ],
};

export const berserkingRelic: Ability = {
    name: "Berserking Relic",
    resourceCost: 1,
    image: EvilCupImage,
    description:
        "Reduces the cost of adjacent cards by 1, but playing them damages you for <b>{{ aura.effects.0.onUse.ability.actions.0.damage }}</b> {{{ _damage_ }}}.",
    aura: {
        area: 1,
        effects: [
            {
                resourceCost: -1,
                onUse: {
                    ability: {
                        name: "Madness",
                        image: SkeletonOfHorrorImage,
                        actions: [
                            {
                                type: ACTION_TYPES.HINDER,
                                target: TARGET_TYPES.SELF,
                                animation: ANIMATION_TYPES.SPIN,
                                damage: 3,
                                playbackTime: 400,
                            },
                        ],
                    },
                },
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

export const combatOrders: Ability = {
    name: "Combat Orders",
    resourceCost: 1,
    image: CombatOrdersImage,
    description: "Commands targeted allies to attack.",
    actions: [
        {
            area: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            induceCombatantAttack: true,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    area: 1,
                },
            ],
        },
    ],
};

export const NEUTRAL_ABILITIES = [
    shellThrow,
    bounce,
    reinforce,
    firstExiledArm,
    secondExiledArm,
    thirdExiledArm,
    fourthExiledArm,
    provoke,
    stomp,
    berserkingRelic,
    combatOrders,
];

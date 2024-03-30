import { attackPower, bleed, pristineDefense } from "./../ability/Effects";
import { attack } from "./abilities";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import {
    AvengersArrowImage,
    BubbleFishImage,
    DyleIdleImage,
    GarbageImage,
    HarpoonGunImage,
    SurfingImage,
    TeleportImage,
    TwinklingOrbImage,
    WaterBombImage,
    WoodImage,
} from "../images";
import { BloodIcon } from "../images/icons";

const airBubbleCard: Ability = {
    name: "Air Bubble",
    resourceCost: 0,
    image: TwinklingOrbImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            resources: 1,
            drawCards: {
                amount: 1,
            },
        },
    ],
};

const dyleBubbleFish: Minion = {
    name: "Bubble Fish",
    image: BubbleFishImage,
    maxHP: 10,
    abilities: [
        {
            name: "Flee",
            image: TeleportImage,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.NONE,
                    retreat: true,
                    animationOptions: {
                        fadeOut: true, // TODO does nothing on combatant portraits
                    },
                },
            ],
        },
    ],
    effects: [
        {
            name: "Flopping",
            icon: BubbleFishImage,
            description: "Fleeing on the next turn. Drops a usable Air Bubble if it dies.",
            type: EFFECT_TYPES.FEAR,
            class: EFFECT_CLASSES.NONE,
            onDeath: {
                addCards: [airBubbleCard],
            },
        },
    ],
};

const garbageCard: Ability = {
    name: "Garbage",
    resourceCost: 0,
    description: "Nope.",
    image: GarbageImage,
    removeAfterTurn: true,
    actions: [
        {
            type: ACTION_TYPES.HINDER,
            target: TARGET_TYPES.SELF,
        },
    ],
};

const dyleRealGarbage: Minion = {
    name: "Flotsam",
    image: GarbageImage,
    maxHP: 5,
    effects: [
        {
            name: "Garbage",
            description: "It might contain something useful...",
            icon: GarbageImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onDeath: {
                addCardsToDeck: [garbageCard],
            },
        },
    ],
};

const harpoonCard: Ability = {
    name: "Harpoon",
    resourceCost: 0,
    image: HarpoonGunImage,
    actions: [
        {
            damage: 10,
            destroyArmor: 0.5,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            playbackTime: 400,
            animationOptions: {
                width: 75,
                height: 75,
            },
        },
    ],
};

const dyleUsefulGarbage: Minion = {
    name: "Flotsam",
    image: GarbageImage,
    maxHP: 5,
    effects: [
        {
            name: "Garbage",
            description: "It might contain something useful...",
            icon: GarbageImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onDeath: {
                addCardsToDeck: [harpoonCard],
            },
        },
    ],
};

const dyleGarbage2: Minion = {
    name: "Flotsam",
    image: GarbageImage,
    maxHP: 5,
    effects: [
        {
            name: "Garbage",
            description: "It might contain something useful...",
            icon: GarbageImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onDeath: {
                addCardsToDeck: [
                    {
                        name: "Plank",
                        image: WoodImage,
                        resourceCost: 0,
                        actions: [
                            {
                                armor: 10,
                                target: TARGET_TYPES.FRIENDLY,
                                type: ACTION_TYPES.EFFECT,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};

export const dyle: Minion = {
    name: "Dyle",
    maxHP: 200,
    image: DyleIdleImage,
    abilities: [
        {
            name: "Chomp",
            image: BloodIcon,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    effects: [
                        {
                            ...bleed,
                            duration: 1,
                        },
                    ],
                },
            ],
        },
        {
            ...attack,
            conditions: [
                {
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                    hasEffect: "Underwater",
                    comparator: "not",
                },
            ],
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Submerge",
            resourceCost: 3,
            image: WaterBombImage,
            conditions: [
                {
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                    armor: 0,
                    comparator: "eq",
                },
            ],
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 100,
                    effects: [
                        {
                            ...pristineDefense,
                            name: "Underwater",
                            icon: WaterBombImage,
                            onReceiveDamage: {
                                conditions: [
                                    {
                                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                        armor: 0,
                                        comparator: "eq",
                                    },
                                ],
                                removeEffect: true,
                            },
                        },
                    ],
                },
            ],
        },
        {
            name: "Surf",
            image: SurfingImage,
            description: "Hits up to 2 extra targets for 3 damage. Dredges up flotsam.",
            conditions: [
                {
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                    hasEffect: "Underwater",
                    comparator: "eq",
                },
            ],
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    icon: SurfingImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    secondaryDamage: 3,
                    animationOptions: {
                        ricochet: true,
                    },
                    numTargets: 2,
                    targetArea: 2,
                },
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [{ ...attackPower, duration: 3 }],
                    summon: [
                        { minion: [dyleRealGarbage, dyleUsefulGarbage, dyleGarbage2, dyleBubbleFish] },
                        { minion: [dyleRealGarbage, dyleGarbage2, dyleBubbleFish] },
                        { minion: [dyleRealGarbage, dyleGarbage2, dyleUsefulGarbage, dyleBubbleFish] },
                        { minion: [dyleRealGarbage, dyleGarbage2, dyleBubbleFish] },
                    ],
                },
            ],
        },
        {
            name: "Big Chomp",
            resourceCost: 3,
            image: BloodIcon,
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
                    effects: [
                        {
                            ...bleed,
                            duration: 3,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [],
};

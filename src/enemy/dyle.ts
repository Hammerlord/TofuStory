import { attackPower, bleed, hardy, pristineDefense, stun } from "./../ability/Effects";
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
    SeaweedImage,
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
    depletedOnUse: true,
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
    resources: 2,
    abilities: [
        {
            name: "Flee",
            image: TeleportImage,
            resourceCost: 3,
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
    image: GarbageImage,
    removeAfterTurn: true,
    unplayable: true,
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
            description: "It might contain something useful... or not.",
            icon: GarbageImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onDeath: {
                addCardsToDeck: [garbageCard],
            },
        },
    ],
};

const dyleRealGarbage2: Minion = {
    ...dyleRealGarbage,
    image: SeaweedImage,
};

export const harpoonCard: Ability = {
    name: "Harpoon",
    resourceCost: 0,
    image: HarpoonGunImage,
    depletedOnUse: true,
    actions: [
        {
            damage: 10,
            effects: [bleed, bleed],
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            playbackTime: 400,
            animationOptions: {
                width: 75,
                height: 75,
                rotate: 135,
                rotateToFaceTarget: true,
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
            description: "It might contain something useful... or not.",
            icon: GarbageImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onDeath: {
                addCards: [harpoonCard],
            },
        },
    ],
};

const dyleUsefulGarbage2: Minion = {
    ...dyleUsefulGarbage,
    image: SeaweedImage,
};

const dyleGarbage2: Minion = {
    name: "Flotsam",
    image: GarbageImage,
    maxHP: 5,
    effects: [
        {
            name: "Garbage",
            description: "It might contain something useful... or not.",
            icon: GarbageImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onDeath: {
                addCardsToDeck: [
                    {
                        name: "Plank",
                        image: WoodImage,
                        resourceCost: 0,
                        removeAfterTurn: true,
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

const flotsamWaveAttackAction = {
    type: ACTION_TYPES.EFFECT,
    target: TARGET_TYPES.SELF,
    icon: SurfingImage,
    animation: ANIMATION_TYPES.ACTION_EXPLODE,
    excludePrimaryTarget: true,
    area: 5,
    effects: [
        {
            name: "Surfing",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackPower: 3,
            duration: 0,
            onAttack: {
                removeEffect: true,
                damage: 10,
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            },
        },
    ],
    induceCombatantAttack: true,
};

const dyleDredgeSummons = [
    { minion: [dyleRealGarbage, dyleUsefulGarbage, dyleGarbage2, dyleBubbleFish] },
    { minion: [dyleRealGarbage, dyleGarbage2, dyleRealGarbage2, dyleUsefulGarbage2] },
    { minion: [dyleRealGarbage, dyleGarbage2, dyleUsefulGarbage, dyleBubbleFish] },
    { minion: [dyleRealGarbage, dyleGarbage2, dyleRealGarbage2, dyleBubbleFish] },
];

export const dyle: Minion = {
    name: "Dyle",
    maxHP: 200,
    image: DyleIdleImage,
    isBoss: true,
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
                            image: WaterBombImage,
                            onReceiveDamage: {
                                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                conditions: [
                                    {
                                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                        armor: 0,
                                        comparator: "eq",
                                    },
                                ],
                                removeEffect: true,
                                usableWhileStunned: true,
                                ability: {
                                    name: "Resurface",
                                    image: WaterBombImage,
                                    actions: [
                                        {
                                            type: ACTION_TYPES.EFFECT,
                                            target: TARGET_TYPES.SELF,
                                            icon: WaterBombImage,
                                            animation: ANIMATION_TYPES.ACTION_EXPLODE,
                                            effects: [{ ...stun, duration: 2, bypassImmunity: true }],
                                            summon: dyleDredgeSummons,
                                        },
                                    ],
                                },
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
                flotsamWaveAttackAction,
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
                    summon: dyleDredgeSummons,
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
        {
            name: "Tidal Wave",
            image: SurfingImage,
            resourceCost: 3,
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
                    summon: dyleDredgeSummons,
                },
                flotsamWaveAttackAction,
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    summon: dyleDredgeSummons,
                },
            ],
        },
    ],
    effects: [hardy],
};

import { defDown, defUp } from "./../ability/Effects";
import { attack } from "./abilities";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    MORPH_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import { BombImage, MasterDummyImage, PandaImage, PandaSpecialMoveImage, TeleportImage, UrsusPawDefaultImage } from "../images";
import { hardy } from "../ability/Effects";
import { CloudIcon, MuscleIcon, ShieldIcon } from "../images/icons";

const explode: Ability = {
    name: "Explode",
    image: BombImage,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            animation: ANIMATION_TYPES.EXPLODE,
            area: 5,
            damage: 10,
            secondaryAction: {
                damage: 100,
            },
            effects: [defDown],
        },
    ],
};

const bomb: Minion = {
    name: "Bomb",
    maxHP: 5,
    image: BombImage,
    uncontrollable: true,
    abilities: [explode],
    effects: [
        {
            name: "Explosive",
            description: "Explodes for 10 damage when destroyed or this effect ends.",
            duration: 1,
            icon: BombImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onEnd: {
                usableWhileStunned: true,
                ability: explode,
            },
            onDeath: {
                usableWhileStunned: true,
                ability: explode,
            },
        },
    ],
};

const singleShuffle = {
    name: "Shuffle",
    image: MasterDummyImage,
    actions: [
        {
            // Wait a moment before moving
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.MOVEMENT,
            playbackTime: 500,
        },
        {
            movement: 5,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.MOVEMENT,
        },
    ],
};

const shuffle: Ability = {
    name: "Shuffle",
    image: MasterDummyImage,
    actions: [
        {
            movement: 5,
            movementOptions: {
                //canSwapCharacterPlaces: true,
            },
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.MOVEMENT,
        },
        {
            movement: 5,
            movementOptions: {
                //canSwapCharacterPlaces: true,
            },
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.MOVEMENT,
        },
    ],
};

const misdirectionDummy: Minion = {
    name: "Dummy",
    maxHP: 30,
    image: MasterDummyImage,
    abilities: [shuffle],
    effects: [
        {
            name: "On Summon",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onSummoned: {
                ability: singleShuffle,
                removeEffect: true,
            },
        },
    ],
};

const realDummy: Minion = {
    name: "Dummy",
    maxHP: 30,
    image: MasterDummyImage,
    abilities: [shuffle],
    effects: [
        {
            name: "On Summon",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onSummoned: {
                ability: singleShuffle,
                removeEffect: true,
            },
        },
        {
            name: "Real",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onDeath: {
                ability: {
                    name: "Reveal",
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            induceCombatant: {
                                action: {
                                    conditions: [
                                        {
                                            name: misdirectionDummy.name,
                                            comparator: "eq",
                                            calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                                        },
                                    ],
                                    target: TARGET_TYPES.SELF,
                                    type: ACTION_TYPES.NONE,
                                    retreat: true,
                                    playbackTime: 1,
                                },
                            },
                            area: 5,
                            excludePrimaryTarget: true,
                        },
                    ],
                },
            },
        },
    ],
};

const wanderingFighterName = "Wandering Fighter";

const woodenDummyTechnique: Effect = {
    name: "Wooden Dummies",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
    conditions: [
        {
            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            healthPercentage: 0.7,
            comparator: "lt",
        },
    ],
    onReceiveDamage: {
        removeEffect: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        usableWhileStunned: true,
        ability: {
            name: "Wooden Dummy Technique",
            image: MasterDummyImage,
            resourceCost: 0,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [bomb] }, { minion: [bomb] }],
                },
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    icon: CloudIcon,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    area: 5,
                    morph: {
                        type: MORPH_TYPES.MAP,
                        minions: [
                            {
                                conditions: [
                                    {
                                        name: bomb.name,
                                        comparator: "eq",
                                        calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                                    },
                                ],
                                minion: misdirectionDummy,
                                storeTarget: true,
                            },
                            {
                                conditions: [
                                    {
                                        name: wanderingFighterName,
                                        comparator: "eq",
                                        calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                                    },
                                ],
                                minion: realDummy,
                                storeTarget: true,
                            },
                        ],
                    },
                    playbackTime: 1250,
                },
            ],
        },
    },
};

const woodenDummyTechnique2: Effect = {
    ...woodenDummyTechnique,
    conditions: [
        {
            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            healthPercentage: 0.3,
            comparator: "lt",
        },
    ],
    onReceiveDamage: {
        ...woodenDummyTechnique.onReceiveDamage,
        ability: {
            name: "Wooden Dummy Technique",
            image: MasterDummyImage,
            resourceCost: 0,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [bomb] }, { minion: [bomb] }, { minion: [bomb] }, { minion: [bomb] }],
                },
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    icon: CloudIcon,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    area: 5,
                    morph: {
                        type: MORPH_TYPES.MAP,
                        minions: [
                            {
                                conditions: [
                                    {
                                        name: bomb.name,
                                        comparator: "eq",
                                        calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                                    },
                                ],
                                minion: misdirectionDummy,
                                storeTarget: true,
                            },
                            {
                                conditions: [
                                    {
                                        name: wanderingFighterName,
                                        comparator: "eq",
                                        calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                                    },
                                ],
                                minion: realDummy,
                                storeTarget: true,
                            },
                        ],
                    },
                    playbackTime: 1250,
                },
            ],
        },
    },
};

export const martialArtist: Minion = {
    name: wanderingFighterName,
    maxHP: 250,
    isBoss: true,
    image: PandaImage,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 8,
                },
            ],
        },
        {
            name: "Karate Chop",
            image: UrsusPawDefaultImage,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 6,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 6,
                },
            ],
        },
        {
            name: "Submission",
            description: "Destroys the target's armor. If the target has no armor, deals 10 damage.",
            image: PandaSpecialMoveImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    animation: ANIMATION_TYPES.SHOUT,
                },
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    playbackTime: 400,
                    destroyArmor: 1,
                    bonus: {
                        damage: 10,
                        conditions: [
                            {
                                calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                                armor: 0,
                                comparator: "eq",
                            },
                        ],
                    },
                },
            ],
        },
        {
            name: "Bide",
            image: ShieldIcon,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    icon: ShieldIcon,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    armor: 25,
                },
            ],
        },
    ],
    effects: [
        hardy,
        {
            name: "Battle Flow",
            icon: MuscleIcon,
            description: "When attacked, character gains +1 damage reduction for the turn.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: true,
            onReceiveAttack: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        ...defUp,
                        duration: 1,
                    },
                ],
            },
        },
        woodenDummyTechnique,
        woodenDummyTechnique2,
    ],
};

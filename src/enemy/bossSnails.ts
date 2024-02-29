import {
    BlueSnailShellImage,
    ManoImage,
    MutantSnailImage,
    MutateImage,
    RedSnailImage,
    RedSnailShellImage,
    RedWhipImage,
    SnailImage,
    SnailShellImage,
    WeaponMasteryImage,
} from "../images";
import { JapaneseOgreIcon } from "../images/icons";
import { hardy, thorns, preventArmorDecay } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MORPH_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { attack } from "./abilities";
import { weightedShell } from "./effect";
import { blueSnail, redSnail, snail } from "./enemy";

export const minionSnail: Minion = {
    ...snail,
    effects: [
        {
            name: "Green Shell",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            image: SnailShellImage,
            icon: SnailShellImage,
            description: "Drops a throwable shell when it dies.",
            onDeath: {
                addCards: [
                    {
                        name: "Green Shell",
                        image: SnailShellImage,
                        resourceCost: 0,
                        depletedOnUse: true,
                        actions: [
                            {
                                damage: 5,
                                type: ACTION_TYPES.RANGE_ATTACK,
                                target: TARGET_TYPES.HOSTILE,
                                animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
                                icon: SnailShellImage,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};

const blueMinionSnail: Minion = {
    ...blueSnail,
    effects: [
        {
            name: "Blue Shell",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            image: BlueSnailShellImage,
            icon: SnailShellImage,
            description: "Drops a throwable shell when it dies.",
            onDeath: {
                addCards: [
                    {
                        name: "Blue Shell",
                        image: BlueSnailShellImage,
                        resourceCost: 0,
                        depletedOnUse: true,
                        actions: [
                            {
                                damage: 6,
                                type: ACTION_TYPES.RANGE_ATTACK,
                                target: TARGET_TYPES.HOSTILE,
                                animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
                                icon: BlueSnailShellImage,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};

const redMinionSnail: Minion = {
    ...redSnail,
    effects: [
        ...redSnail.effects,
        {
            name: "Red Shell",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            image: RedSnailShellImage,
            icon: SnailShellImage,
            description: "Drops a throwable shell when it dies.",
            onDeath: {
                addCards: [
                    {
                        name: "Red Shell",
                        image: RedSnailShellImage,
                        resourceCost: 0,
                        depletedOnUse: true,
                        actions: [
                            {
                                damage: 7,
                                type: ACTION_TYPES.RANGE_ATTACK,
                                target: TARGET_TYPES.HOSTILE,
                                animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
                                icon: RedSnailShellImage,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};

export const mutantSnailEnemy: Minion = {
    name: "Mutant Snail",
    image: MutantSnailImage,
    isBoss: true,
    maxHP: 75,
    armor: 75,
    mesos: 100,
    effects: [
        preventArmorDecay,
        {
            ...hardy,
            name: "Tyrant Shell",
            icon: SnailShellImage,
            description: "After being stunned or frozen, gains temporary immunity to those effects. \n Periodically summoning Snails.",
            canBeSilenced: false,
        },
    ],
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Call Snail",
            image: SnailImage,
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [minionSnail, blueMinionSnail] }, { minion: [minionSnail, blueMinionSnail] }],
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Call Snail",
            image: SnailImage,
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [minionSnail, blueMinionSnail] }, { minion: [minionSnail, blueMinionSnail] }],
                },
            ],
        },
        {
            name: "Whip",
            image: RedWhipImage,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    area: 2,
                    excludePrimaryTarget: true,
                    damage: 3,
                    icon: RedWhipImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    effects: [
                        {
                            name: "Whipped",
                            description: "Whipped into a frenzy!",
                            icon: WeaponMasteryImage,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.BUFF,
                            attackPower: 1,
                        },
                    ],
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Mutate",
            image: MutateImage,
            resourceCost: 3,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    excludePrimaryTarget: true,
                    area: 2,
                    morph: {
                        type: MORPH_TYPES.MAP,
                        minions: [
                            {
                                conditions: [
                                    {
                                        name: "Blue Snail",
                                        comparator: "eq",
                                        calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                                    },
                                ],
                                minion: redMinionSnail,
                            },
                            {
                                conditions: [
                                    {
                                        name: "Snail",
                                        comparator: "eq",
                                        calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                                    },
                                ],
                                minion: blueMinionSnail,
                            },
                        ],
                    },
                },
            ],
        },
        {
            name: "Frenzied Tantrum",
            image: JapaneseOgreIcon,
            description: "{{ caster }} will tantrum, dealing 3 hits per move.",
            resourceCost: 3,
            channelDuration: 2,
            castTime: 1,
            actions: [
                {
                    damage: 2,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
                {
                    damage: 2,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
                {
                    damage: 2,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    effects: [
                        {
                            name: "Frenzy",
                            description: "Entering a frenzy!",
                            icon: WeaponMasteryImage,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.BUFF,
                            attackPower: 1,
                            duration: 3,
                        },
                    ],
                },
            ],
        },
    ],
};

export const manoEnemy: Minion = {
    name: "Mano",
    image: ManoImage,
    isBoss: true,
    maxHP: 50,
    armor: 100,
    mesos: 100,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Call Snail",
            image: SnailImage,
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [minionSnail, blueMinionSnail] }, { minion: [minionSnail, blueMinionSnail] }],
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Call Snail",
            image: RedSnailImage,
            minion: redMinionSnail,
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Rollout",
            image: RedSnailShellImage,
            castTime: 1,
            channelDuration: 3,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.YOYO,
                    playbackTime: 600,
                    description: "Bounces to 2 other targets for 4 damage.",
                    damage: 7,
                    secondaryDamage: 4,
                    ricochet: true,
                    numTargets: 2,
                    targetArea: 2,
                },
            ],
        },
        {
            name: "Withdraw",
            image: BlueSnailShellImage,
            channelDuration: 2,
            resourceCost: 3,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    armor: 10,
                    effects: [
                        {
                            ...thorns,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        {
            ...hardy,
            name: "Senior Shell",
            icon: SnailShellImage,
            description: "After being stunned or frozen, gains temporary immunity to those effects. \n Periodically summoning Snails.",
            canBeSilenced: false,
        },
        preventArmorDecay,
        weightedShell,
    ],
};

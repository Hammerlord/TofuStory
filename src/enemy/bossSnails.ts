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
import { shuffle } from "../utils";
import { hardy, thorns, preventArmorDecay, attackPower } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
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
    abilities: [attack],
    effects: [
        {
            name: "Green Shell",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            portraitImage: SnailShellImage,
            icon: SnailShellImage,
            description: "Drops a throwable shell when it dies.",
            onDeath: {
                usableWhileStunned: true,
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
            portraitImage: BlueSnailShellImage,
            icon: BlueSnailShellImage,
            description: "Drops a throwable shell when it dies.",
            onDeath: {
                usableWhileStunned: true,
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
            portraitImage: RedSnailShellImage,
            icon: RedSnailShellImage,
            description: "Drops a throwable shell when it dies.",
            onDeath: {
                usableWhileStunned: true,
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

const whip = {
    name: "Whip",
    image: RedWhipImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            area: 2,
            excludePrimaryTarget: true,
            damage: 1,
            icon: RedWhipImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            effects: [
                {
                    name: "Whipped",
                    description: "Whipped into a frenzy!",
                    icon: WeaponMasteryImage,
                    type: EFFECT_TYPES.FEAR,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 1,
                    disableAbilities: [ACTION_TYPES.EFFECT, ACTION_TYPES.NONE],
                },
            ],
        },
    ],
};

const mutateAbility: Ability = {
    name: "Mutate",
    image: MutateImage,
    resourceCost: 3,
    description: "Transforms Snails into their stronger stage.",
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
                setOriginalHealthPercentage: true,
            },
        },
    ],
};

export const mutantSnailEnemy: Minion = {
    name: "Mutant Snail",
    image: MutantSnailImage,
    isBoss: true,
    maxHP: 50,
    armor: 150,
    mesos: 50,
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
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [minionSnail, blueMinionSnail] }, { minion: [minionSnail, blueMinionSnail] }],
                },
            ],
        },
        whip,
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
        ...shuffle([
            mutateAbility,
            {
                name: "Tantrum",
                image: JapaneseOgreIcon,
                description: "Hits 3 times.",
                resourceCost: 3,
                channelDuration: 2,
                castTime: 1,
                actions: [
                    {
                        damage: 3,
                        target: TARGET_TYPES.HOSTILE,
                        type: ACTION_TYPES.ATTACK,
                    },
                    {
                        damage: 3,
                        target: TARGET_TYPES.HOSTILE,
                        type: ACTION_TYPES.ATTACK,
                    },
                    {
                        damage: 3,
                        target: TARGET_TYPES.HOSTILE,
                        type: ACTION_TYPES.ATTACK,
                    },
                ],
            },
        ]),
    ],
};

export const manoEnemy: Minion = {
    name: "Mano",
    image: ManoImage,
    isBoss: true,
    maxHP: 50,
    armor: 150,
    mesos: 50,
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
                    damage: 4,
                },
            ],
        },
        {
            name: "Call Snail",
            image: RedSnailImage,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [redMinionSnail] }],
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
        ...shuffle([
            {
                name: "Rollout",
                image: RedSnailShellImage,
                description: "Bounces to another nearby target for 1 damage.",
                castTime: 1,
                channelDuration: 2,
                resourceCost: 3,
                actions: [
                    {
                        type: ACTION_TYPES.ATTACK,
                        target: TARGET_TYPES.HOSTILE,
                        animation: ANIMATION_TYPES.YOYO,
                        animationOptions: {
                            ricochet: true,
                        },
                        playbackTime: 750,
                        damage: 7,
                        secondaryDamage: 1,
                        numTargets: 1,
                        targetArea: 2,
                    },
                ],
            },
            {
                name: "Withdraw",
                image: BlueSnailShellImage,
                resourceCost: 3,
                description: "Gain 5 Armor. Allies gain 1 ATT.",
                actions: [
                    {
                        target: TARGET_TYPES.SELF,
                        type: ACTION_TYPES.EFFECT,
                        armor: 5,
                        secondaryAction: {
                            effects: [{ ...attackPower, stacks: 1 }],
                            area: 2,
                            excludePrimaryTarget: true,
                        },
                    },
                ],
            },
        ]),
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

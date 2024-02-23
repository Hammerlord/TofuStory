import { defUp } from "./../ability/Effects";
import { hardy, poison } from "../ability/Effects";
import {
    ACTION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MULTIPLIER_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import {
    AncientFairyImage,
    BatsEffectImage,
    FirewoodImage,
    GreenFairiesImage,
    OmokPigImage,
    PigsHeadImage,
    PigsRibbonImage,
    PurpleFairiesImage,
    RedSnailShellImage,
    RespawnTokenImage,
    SapOfNependeathImage,
    ShiningFairyImage,
    SnailShellImage,
    StumpyBatImage,
    TreeBranchImage,
} from "../images";
import { CloudyIcon, LinkIcon, SmilingImpIcon } from "../images/icons";
import { Effect } from "./../ability/types";

export const championsRibbon: Effect = {
    name: "Champion's Ribbon",
    description: "Counters when attacked, once per turn.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: PigsRibbonImage,
    canBeSilenced: true,
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                name: "Retaliation",
                description: "Countering on the next attack",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                icon: OmokPigImage,
                canBeSilenced: true,
                duration: 2,
                onReceiveAttack: {
                    disableTriggerFromProcs: true,
                    usableWhileStunned: false,
                    removeEffect: true,
                    targetType: TRIGGER_TARGET_TYPES.ACTOR,
                    ability: {
                        name: "Retaliate",
                        actions: [
                            {
                                type: ACTION_TYPES.ATTACK,
                                target: TARGET_TYPES.HOSTILE,
                                damage: 3,
                            },
                        ],
                    },
                },
            },
        ],
    },
};

export const pigHeaded: Effect = {
    name: "Pig-Headed",
    description: "While stunned or frozen:",
    icon: PigsHeadImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackDamageReceived: 2,
    conditions: [
        {
            hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        },
    ],
};

export const hardwood: Effect = {
    name: "Hardwood",
    description: "When attacked, this character gains +1 damage reduction for the turn. Effect is disabled by Burn.",
    icon: FirewoodImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    canBeSilenced: true,
    conditions: [
        {
            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            comparator: "not",
            hasEffectType: [EFFECT_TYPES.BURN],
        },
    ],
    onReceiveAttack: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                ...defUp,
                name: "Barricade",
                description: "Effect is disabled by Burn.",
                attackDamageReceived: -1,
                duration: 1,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        comparator: "not",
                        hasEffectType: [EFFECT_TYPES.BURN],
                    },
                ],
            },
        ],
    },
};

export const dryBranch: Effect = {
    name: "Dry Branch",
    description: "Receives extra damage from attacks if Burning.",
    icon: TreeBranchImage,
    attackDamageReceived: 3,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    conditions: [
        {
            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            hasEffectType: [EFFECT_TYPES.BURN],
            comparator: "eq",
        },
    ],
};

export const bats: Effect = {
    name: "Bats!",
    description: "Leeching HP to the applier of this effect.",
    icon: StumpyBatImage,
    image: BatsEffectImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 5,
    armorReceived: -1,
    healingReceived: -1,
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_APPLIER,
        healing: 2,
    },
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        damage: 2,
    },
};

export const fairySwarm: Effect = {
    name: "Fairy Swarm",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    canBeSilenced: true,
    attackDamageReceived: -15,
    duration: 2,
    icon: ShiningFairyImage,
    image: GreenFairiesImage,
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        usableWhileStunned: true,
        healing: 5,
    },
    onEnd: {
        usableWhileStunned: true,
        ability: {
            name: "Migrate",
            image: AncientFairyImage,
            actions: [
                {
                    type: ACTION_TYPES.NONE,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: PurpleFairiesImage,
                    effects: ["Fairy Frenzy"],
                },
            ],
        },
    },
    onDeath: {
        usableWhileStunned: true,
        removeEffect: true,
        ability: {
            name: "Migrate",
            image: AncientFairyImage,
            actions: [
                {
                    type: ACTION_TYPES.NONE,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: PurpleFairiesImage,
                    effects: ["Fairy Frenzy"],
                },
            ],
        },
    },
};

const frenziedFairies: Effect = {
    name: "Fairy Frenzy",
    description: "Vulnerable. Receiving 3 damage on turn end.",
    attackDamageReceived: 1,
    duration: 1,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.DEBUFF,
    icon: AncientFairyImage,
    image: PurpleFairiesImage,
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        damage: 3,
    },
    onEnd: {
        usableWhileStunned: true,
        ability: {
            name: "Migrate",
            image: ShiningFairyImage,
            actions: [
                {
                    type: ACTION_TYPES.NONE,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: GreenFairiesImage,
                    targetArea: 5,
                    effects: ["Fairy Swarm"],
                },
            ],
        },
    },
    onDeath: {
        usableWhileStunned: true,
        removeEffect: true,
        ability: {
            name: "Migrate",
            image: ShiningFairyImage,
            actions: [
                {
                    type: ACTION_TYPES.NONE,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: GreenFairiesImage,
                    targetArea: 5,
                    effects: ["Fairy Swarm"],
                },
            ],
        },
    },
};

export const agedShell: Effect = {
    ...hardy,
    name: "Aged Shell",
    icon: SnailShellImage,
    description: "After being stunned or frozen, gains temporary immunity to those effects.",
    canBeSilenced: false,
};

export const weightedShell: Effect = {
    name: "Weighted Shell",
    icon: RedSnailShellImage,
    canBeSilenced: false,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    description: "While this character has armor:",
    attackPower: 1,
    skillBonus: [
        {
            skill: "Rollout",
            damage: 3,
        },
    ],
    conditions: [
        {
            comparator: "gt",
            armor: 0,
            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        },
    ],
};

export const lifeLink: Effect = {
    name: "Life Link",
    canBeSilenced: false,
    type: EFFECT_TYPES.LIFE_LINK,
    class: EFFECT_CLASSES.BUFF,
    description: "When slain, this character will eventually revive if Life Linked allies still live.",
    icon: LinkIcon,
    onDeath: {
        usableWhileStunned: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                name: "Reviving...",
                type: EFFECT_TYPES.LIFE_LINK,
                class: EFFECT_CLASSES.BUFF,
                icon: RespawnTokenImage,
                canBeSilenced: false,
                description: "When this effect ends, the character will revive with half HP.",
                duration: 3,
                onEnd: {
                    usableWhileStunned: true,
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    healing: 1,
                    multiplier: {
                        type: MULTIPLIER_TYPES.MAX_HP,
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        value: 0.3,
                    },
                    resurrect: true,
                },
            },
        ],
    },
};

export const sneaky: Effect = {
    name: "Sneaky",
    description: "Periodically stealths. +1 ATT while stealthed.",
    canBeSilenced: true,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: SmilingImpIcon,
    turnsTriggerFrequency: 3,
    onWaveStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                type: EFFECT_TYPES.STEALTH,
                class: EFFECT_CLASSES.BUFF,
                name: "Stealth",
                icon: CloudyIcon,
                canBeSilenced: true,
                description: "Untargetable. Effect ends if character attacks or is hit by area damage.",
                onReceiveAttack: {
                    removeEffect: true,
                },
                onAttack: {
                    removeEffect: true,
                },
                attackPower: 1,
                duration: 2,
            },
        ],
    },
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        conditions: [
            {
                hasEffectType: [EFFECT_TYPES.STEALTH],
                comparator: "not",
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            },
        ],
        effects: [
            {
                type: EFFECT_TYPES.STEALTH,
                class: EFFECT_CLASSES.BUFF,
                name: "Stealth",
                icon: CloudyIcon,
                canBeSilenced: true,
                description: "Untargetable. Effect ends if character attacks or is hit by area damage.",
                onReceiveAttack: {
                    removeEffect: true,
                },
                onAttack: {
                    removeEffect: true,
                },
                attackPower: 1,
                duration: 2,
            },
        ],
    },
};

export const poisonous = {
    name: "Poisonous",
    description: "Attacks apply poison for 1 turn.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: SapOfNependeathImage,
    onAttack: {
        targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
        effects: [{ ...poison, duration: 1 }],
    },
};

export const enemyEffectNameMap = {
    [bats.name]: bats,
    [fairySwarm.name]: fairySwarm,
    [frenziedFairies.name]: frenziedFairies,
};

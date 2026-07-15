import { hardy, lupinCurse, poison, taunt } from "../ability/Effects";
import {
    ACTION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MULTIPLIER_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import {
    AncientFairyImage,
    BatsEffectImage,
    BrokenMirrorGlassImage,
    FirewoodImage,
    GreenFairiesImage,
    MarksmanshipImage,
    NamelessSwordImage,
    OmokPigImage,
    OrangeMushroomDefendImage,
    PigsHeadImage,
    PigsRibbonImage,
    PurpleFairiesImage,
    RespawnTokenImage,
    SapOfNependeathImage,
    ShiningFairyImage,
    SnailShellImage,
    StumpyBatImage,
    TreeBranchImage,
} from "../images";
import {
    CloudyIcon,
    CrossedSwordsIcon,
    LinkIcon,
    MountainIcon,
    MuscleIcon,
    PristineShieldIcon,
    RedShieldIcon,
    RockIcon,
    ShieldIcon,
    SmilingImpIcon,
} from "../images/icons";
import { defUp, attackPower, preventArmorDecay } from "./../ability/Effects";
import { Effect } from "./../ability/types";

export const pigHeaded: Effect = {
    name: "Pig-Headed",
    description: "While stunned or frozen:",
    icon: PigsHeadImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.DEBUFF,
    attackDamageReceived: 2,
    dispellable: false,
    conditions: [
        {
            hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        },
    ],
};

export const hardwood: Effect = {
    name: "Hardwood",
    description: "When attacked, character gains +1 damage reduction for the turn. Disabled by Burn.",
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
                maxApplications: 3,
                maxDuration: 1,
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
    class: EFFECT_CLASSES.DEBUFF,
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
    portraitImage: BatsEffectImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 5,
    armorReceived: -1,
    healingReceived: -1,
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_APPLIER,
        healing: 3,
    },
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        damage: 3,
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
    portraitImage: GreenFairiesImage,
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
    portraitImage: PurpleFairiesImage,
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
    icon: RedShieldIcon,
    canBeSilenced: false,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    description: "While this character has armor:",
    attackPower: 2,
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
        affectsDeadCharacters: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                name: "Reviving...",
                type: EFFECT_TYPES.LIFE_LINK,
                class: EFFECT_CLASSES.BUFF,
                icon: RespawnTokenImage,
                persistsWhenDead: true,
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

export const taunting: Effect = {
    name: "Taunting",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    description: "Periodically gaining Taunt. Attackers must target Taunting characters.",
    turnsTriggerFrequency: 3,
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [{ ...taunt, duration: 2 }],
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
    turnsTriggerFrequency: 2,
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
        effects: [{ ...poison, stacks: 1 }],
    },
};

export const resist: Effect = {
    name: "Resistance",
    description: "Immune to debuffs.",
    icon: RockIcon,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    immunities: {
        type: "effect-class",
        value: [EFFECT_CLASSES.DEBUFF],
    },
};

export const temporaryResist: Effect = {
    ...resist,
    description: "Immune to the next {{ stacks }} debuff applications.",
    stacks: 3,
    onFailedToReceiveEffect: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
                hasEffectClass: EFFECT_CLASSES.DEBUFF,
                comparator: "eq",
            },
        ],
        decrementStacks: 1,
    },
};

export const battleTrance: Effect = {
    name: "Battle Trance",
    icon: MuscleIcon,
    type: EFFECT_TYPES.RAGE,
    class: EFFECT_CLASSES.BUFF,
    description: "Gains +1 ATT for next turn when struck.",
    onReceiveAttack: {
        disableTriggerFromProcs: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                ...attackPower,
                duration: 2,
            },
        ],
    },
};

export const counterEffect: Effect = {
    name: "Counter",
    description: "Countering for 3 damage when attacked.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: NamelessSwordImage,
    portraitImage: NamelessSwordImage,
    portraitImageOptions: {
        displayMode: "pulse",
    },
    canBeSilenced: true,
    onReceiveAttack: {
        disableTriggerFromProcs: true,
        usableWhileStunned: false,
        targetType: TRIGGER_TARGET_TYPES.ACTOR,
        ability: {
            name: "Counter",
            image: NamelessSwordImage,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
    },
};

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
                ...counterEffect,
                description: "Countering for 3 damage when next attacked.",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                canBeSilenced: true,
                duration: 2,
                onReceiveAttack: {
                    disableTriggerFromProcs: true,
                    usableWhileStunned: false,
                    removeEffect: true,
                    targetType: TRIGGER_TARGET_TYPES.ACTOR,
                    ability: {
                        name: "Retaliate",
                        image: OmokPigImage,
                        actions: [
                            {
                                type: ACTION_TYPES.ATTACK,
                                target: TARGET_TYPES.HOSTILE,
                                damage: 3,
                            },
                        ],
                    },
                },
                onTurnStart: {
                    removeEffect: true,
                },
            },
        ],
    },
};

export const incorporeal: Effect = {
    name: "Incorporeal",
    description: "Can't take more than 1 damage in a single hit.",
    icon: BrokenMirrorGlassImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    maxDamageTaken: 1,
    portraitAnimationOptions: {
        fadeInOut: true,
    },
};

export const armorDown: Effect = {
    name: "Armor Down",
    icon: ShieldIcon,
    description: "Armor from Armor sources reduced by 1.",
    class: EFFECT_CLASSES.DEBUFF,
    type: EFFECT_TYPES.NONE,
    armorReceived: -1,
    duration: 5,
};

export const critical: Effect = {
    name: "Critical",
    portraitImage: MarksmanshipImage,
    description: "Gains +1 ATT against debuffed targets.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackPower: 1,
    conditions: [
        {
            hasEffectClass: EFFECT_CLASSES.DEBUFF,
            calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
        },
    ],
};

export const burrowing: Effect = {
    ...preventArmorDecay,
    name: "Burrow",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    description: "Heals 3 HP per turn while armor holds. After the full effect duration, this character gains +2 ATT.",
    icon: PristineShieldIcon,
    preventTurnAction: true,
    canBeSilenced: false,
    resourcesPerTurn: -1,
    duration: 4,
    override: {
        portrait: OrangeMushroomDefendImage,
    },
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        healing: 3,
    },
    onReceiveDamage: {
        usableWhileStunned: true,
        conditions: [
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 0,
                comparator: "eq",
            },
        ],
        removeEffect: true,
    },
    onEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        ability: {
            name: "Pop!",
            image: CrossedSwordsIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [
                        {
                            ...attackPower,
                        },
                        {
                            ...attackPower,
                        },
                    ],
                },
            ],
        },
    },
};

/**
 * Lookups used when there are circular references
 */
export const effectNameMap = {
    [bats.name]: bats,
    [fairySwarm.name]: fairySwarm,
    [frenziedFairies.name]: frenziedFairies,
    [lupinCurse.name]: lupinCurse,
};

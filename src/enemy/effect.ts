import { controlImmune, hardy } from "../ability/Effects";
import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../ability/types";
import {
    AncientFairyImage,
    BatsEffectImage,
    BlueSnailShellImage,
    FirewoodImage,
    GreenFairiesImage,
    OmokPigImage,
    PigsHeadImage,
    PigsRibbonImage,
    PurpleFairiesImage,
    RedSnailShellImage,
    ShiningFairyImage,
    SnailShellImage,
    StolenFenceImage,
    StumpyBatImage,
    TreeBranchImage,
} from "../images";
import { Effect } from "./../ability/types";

export const championsRibbon: Effect = {
    name: "Champion's Ribbon",
    description: "Once per turn, this character will counter when attacked.",
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
                duration: 1,
                onReceiveAttack: {
                    usableWhileStunned: false,
                    removeEffect: true,
                    targetType: TRIGGER_TARGET_TYPES.ACTOR,
                    ability: {
                        name: "Retaliate",
                        actions: [
                            {
                                type: ACTION_TYPES.ATTACK,
                                target: TARGET_TYPES.HOSTILE,
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
    description: "While stunned:",
    icon: PigsHeadImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackDamageReceived: 2,
    conditions: [
        {
            hasEffectType: [EFFECT_TYPES.STUN],
            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        },
    ],
};

export const hardwood: Effect = {
    name: "Hardwood",
    description:
        "When attacked, character receives -1 damage from additional attacks for the turn. Effect is disabled if the character is burning.",
    icon: FirewoodImage,
    attackDamageReceived: -1,
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
                name: "Hardwood Barricade",
                description: "Effect is disabled if the character is burning.",
                icon: StolenFenceImage,
                attackDamageReceived: -1,
                canBeSilenced: true,
                duration: 1,
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
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
    description: "While burning, this character receives extra damage from attacks.",
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
    description: "Leeching health to the character who applied this effect.",
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
    attackDamageReceived: -5,
    duration: 2,
    icon: ShiningFairyImage,
    image: GreenFairiesImage,
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        usableWhileStunned: true,
        healing: 3,
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
};

const frenziedFairies: Effect = {
    name: "Fairy Frenzy",
    description: "Receiving 3 damage on turn end.",
    armorReceived: -1,
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
};

export const agedShell: Effect = {
    ...hardy,
    name: "Aged Shell",
    icon: SnailShellImage,
    description: "After being stunned or frozen, gains temporary immunity to those effects.",
    canBeSilenced: false,
};

export const toughShell: Effect = {
    name: "Tough Shell",
    icon: BlueSnailShellImage,
    preventArmorDecay: true,
    canBeSilenced: true,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    description: "Prevents armor decay.",
};

export const weightedShell: Effect = {
    name: "Weighted Shell",
    icon: RedSnailShellImage,
    canBeSilenced: false,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    description: "While this character has armor, its damage is increased.",
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

export const enemyEffectNameMap = {
    [bats.name]: bats,
    [fairySwarm.name]: fairySwarm,
    [frenziedFairies.name]: frenziedFairies,
};

import { controlImmune } from "../ability/Effects";
import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../ability/types";
import {
    BatsEffectImage,
    FirewoodImage,
    OmokPigImage,
    PigsHeadImage,
    PigsRibbonImage,
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
        "When stunned, frozen, or silenced, gains temporary immunity to those effects. When this character is attacked, its damage received from attacks is reduced by 1.",
    icon: FirewoodImage,
    attackDamageReceived: -1,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    onReceiveAttack: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                name: "Hardwood Barricade",
                icon: StolenFenceImage,
                attackDamageReceived: -1,
                canBeSilenced: true,
                duration: 1,
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
            },
        ],
    },
    onReceiveEffect: {
        usableWhileStunned: true,
        conditions: [
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER, // This should be comparing the effect not its owner
                hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
                comparator: "eq",
            },
        ],
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [controlImmune],
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

const roostingBats = {
    name: "Roosting Bats",
    description: "Receiving 3 healing per turn.",
    icon: StumpyBatImage,
    duration: 3,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        usableWhileStunned: true,
        healing: 3,
    },
    onEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_APPLIER,
        usableWhileStunned: true,
        ability: {
            name: "",
            actions: [
                {
                    type: ACTION_TYPES.NONE,
                    target: TARGET_TYPES.HOSTILE,
                    icon: BatsEffectImage,
                    effects: ["Bats!"],
                },
            ],
        },
    },
};

export const bats: Effect = {
    name: "Bats!",
    description: "Receiving 3 damage per turn.",
    icon: StumpyBatImage,
    image: BatsEffectImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 3,
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        damage: 3,
    },
    onEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_APPLIER,
        usableWhileStunned: true,
        ability: {
            name: "Roosting Bats",
            actions: [
                {
                    type: ACTION_TYPES.NONE,
                    target: TARGET_TYPES.HOSTILE,
                    icon: BatsEffectImage,
                    effects: ["Roosting Bats"],
                },
            ],
        },
    },
};

export const enemyEffectNameMap = {
    [roostingBats.name]: roostingBats,
    [bats.name]: bats,
};

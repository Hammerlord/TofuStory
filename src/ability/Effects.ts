import { Anger, Blood, Cactus, Cloudy, Dizzy, Fire, Helmet, Medal, MilitaryMedal, NoStun, Snowflake, weaponbooster } from "../images";
import { Effect, EFFECT_CLASSES, EFFECT_TYPES } from "./types";

export const thorns: Effect = {
    name: "Thorns",
    icon: Cactus,
    description: "Reflects 1 damage to attackers",
    thorns: 1,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
};

export const controlImmune: Effect = {
    name: "Stun Immunity",
    description: "Target cannot be stunned or frozen.",
    icon: NoStun,
    immunities: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
    duration: 4,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
};

export const hardy: Effect = {
    name: "Hardy",
    description: "After being stunned or frozen, gains temporary immunity to those effects.",
    icon: Helmet,
    onReceiveEffect: {
        conditions: [
            {
                calculationTarget: "effectOwner",
                hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
                comparator: "eq",
            },
        ],
        effectOwner: {
            effects: [controlImmune],
        },
    },
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
};

export const stealth: Effect = {
    type: EFFECT_TYPES.STEALTH,
    class: EFFECT_CLASSES.BUFF,
    name: "Stealth",
    icon: Cloudy,
    description: "Untargetable by attacks. Effect ends if this character attacks or is hit by area damage.",
    duration: 3,
};

export const stun: Effect = {
    name: "Stun",
    type: EFFECT_TYPES.STUN,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 1,
    description: "Afflicted targets are unable to act during their turn.",
    icon: Dizzy,
};

export const wound: Effect = {
    name: "Wound",
    type: EFFECT_TYPES.BLEED,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 3,
    icon: Blood,
    description: "Wounded targets take 1 damage at the end of their turn.",
};

export const burn: Effect = {
    name: "Burn",
    type: EFFECT_TYPES.BURN,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 3,
    icon: Fire,
    description: "Burned targets take 2 damage at the end of their turn.",
};

export const chill: Effect = {
    name: "Chill",
    icon: Snowflake,
    type: EFFECT_TYPES.CHILL,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 5,
    damage: -1,
    description: "Chilled targets have their attack power reduced by 1.",
};

export const cleave: Effect = {
    name: "Cleave",
    basicAttackAreaIncrease: 1,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: weaponbooster,
    description: "Area of this character's basic attacks increased by 1.",
};

export const raging: Effect = {
    name: "Raging",
    duration: Infinity,
    type: EFFECT_TYPES.RAGE,
    class: EFFECT_CLASSES.BUFF,
    icon: Anger,
    description: "When this character drops below 40% HP, its damage increases by 2.",
    damage: 2,
    conditions: [
        {
            comparator: "lt",
            healthPercentage: 0.4,
            calculationTarget: "effectOwner",
        },
    ],
};

export const eliteSquad: Effect = {
    name: "Elite Squadmember",
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: Medal,
    description:
        "A member of an elite triad, tougher and stronger than most enemies. After being stunned or frozen, gains temporary immunity to those effects.",
    onReceiveEffect: {
        conditions: [
            {
                calculationTarget: "effectOwner",
                hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
                comparator: "eq",
            },
        ],
        effectOwner: {
            effects: [controlImmune],
        },
    },
};

export const elite: Effect = {
    name: "Elite",
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    damage: 1,
    description:
        "An elite champion, tougher and stronger than most enemies. After being stunned or frozen, gains temporary immunity to those effects.",
    icon: MilitaryMedal,
    onReceiveEffect: {
        conditions: [
            {
                calculationTarget: "effectOwner",
                hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
                comparator: "eq",
            },
        ],
        effectOwner: {
            effects: [controlImmune],
        },
    },
};

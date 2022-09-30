import {
    AlternateJapaneseOgre,
    Anger,
    Blood,
    bombImage,
    Cactus,
    Cloudy,
    Dizzy,
    Fire,
    Helmet,
    JapaneseOgre,
    Medal,
    MilitaryMedal,
    NoStun,
    orangegem as orangegemImage,
    Snowflake,
    SpeechBubble,
    upmattImage,
    VolcanoIcon,
    weaponbooster,
    weaponmasteryImage,
} from "../images";
import { Effect, EFFECT_CLASSES, EFFECT_TYPES, TRIGGER_TARGET_TYPES, TARGET_TYPES, ACTION_TYPES, Minion, ANIMATION_TYPES } from "./types";

export const thorns: Effect = {
    name: "Thorns",
    canBeSilenced: true,
    icon: Cactus,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    thorns: 1,
};

export const controlImmune: Effect = {
    name: "Stun Immunity",
    description: "Target cannot be stunned or frozen.",
    icon: NoStun,
    immunities: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
    duration: 5,
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
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER, // This should be comparing the effect not its owner
                hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
                comparator: "eq",
            },
        ],
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [controlImmune],
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
    canBeSilenced: true,
    description: "Untargetable by attacks. Effect ends if this character attacks or is hit by area damage.",
    onAttack: {
        removeEffect: true,
    },
    onReceiveAttack: {
        removeEffect: true,
    },
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
    attackDamageReceived: 1,
    onTurnEnd: {
        damage: 1,
    },
    icon: Blood,
    description: "Wounded targets take 1 damage at the end of their turn and receive 1 extra damage from attacks.",
};

export const burn: Effect = {
    name: "Burn",
    type: EFFECT_TYPES.BURN,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 3,
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        damage: 3,
    },
    icon: Fire,
    description: "Burned targets take 3 damage at the end of their turn.",
};

export const chill: Effect = {
    name: "Chill",
    icon: Snowflake,
    type: EFFECT_TYPES.CHILL,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 5,
    attackPower: -1,
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

export const immunity: Effect = {
    name: "Immunity",
    icon: upmattImage,
    type: EFFECT_TYPES.IMMUNITY,
    class: EFFECT_CLASSES.BUFF,
    duration: 1,
};

export const raging: Effect = {
    name: "Raging",
    canBeSilenced: true,
    duration: Infinity,
    type: EFFECT_TYPES.RAGE,
    class: EFFECT_CLASSES.BUFF,
    icon: Anger,
    description: "Periodically increasing the attack power of this character.",
    turnsTriggerFrequency: 2,
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                name: "Rage",
                type: EFFECT_TYPES.RAGE,
                class: EFFECT_CLASSES.BUFF,
                icon: weaponmasteryImage,
                description: "Growing angry. Effect is removed if the character is stunned.",
                attackPower: 1,
                onReceiveEffect: {
                    conditions: [
                        {
                            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER, // This should be comparing the effect not its owner
                            hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
                            comparator: "eq",
                        },
                    ],
                    removeEffect: true,
                },
            },
        ],
    },
};

const vengeful: Effect = {
    name: "Vengeful",
    canBeSilenced: true,
    duration: 2,
    attackPower: 3,
    icon: JapaneseOgre,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
};

export const avenger: Effect = {
    name: "Avenger",
    canBeSilenced: true,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: AlternateJapaneseOgre,
    description: "Grows powerful when one of its allies falls in combat.",
    onFriendlyDeath: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        armor: 5,
        effects: [vengeful],
    },
};

export const shielding: Effect = {
    name: "Shielding",
    canBeSilenced: true,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: orangegemImage,
    description: "Periodically gaining a shield that wards off a single attack.",
    turnsTriggerFrequency: 2,
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                name: "Attack Immunity",
                icon: upmattImage,
                type: EFFECT_TYPES.ATTACK_IMMUNITY,
                class: EFFECT_CLASSES.BUFF,
                duration: 2,
                onReceiveAttack: { removeEffect: true },
            },
        ],
    },
};

const volcano: Minion = {
    name: "Volcano",
    maxHP: 6,
    image: VolcanoIcon,
    effects: [
        {
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            name: "Erupting",
            icon: VolcanoIcon,
            description: "Erupting for 10 damage when this effect expires",
            duration: 2,
            onEnd: {
                ability: {
                    name: "Erupt",
                    image: VolcanoIcon,
                    actions: [
                        {
                            type: ACTION_TYPES.RANGE_ATTACK,
                            target: TARGET_TYPES.RANDOM_HOSTILE,
                            animation: ANIMATION_TYPES.CAST,
                            area: 2,
                            damage: 10,
                        },
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            damage: 100,
                        },
                    ],
                },
            },
        },
    ],
};

export const eruptive: Effect = {
    name: "Eruptive",
    canBeSilenced: true,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: VolcanoIcon,
    description: "Periodically summoning volcanoes that erupt, dealing area damage",
    turnsTriggerFrequency: 3,
    onTurnStart: {
        ability: {
            name: "Raise Volcano",
            image: VolcanoIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    summon: [
                        {
                            minion: [volcano],
                        },
                    ],
                },
            ],
        },
    },
};

export const explosive: Effect = {
    name: "Explosive",
    canBeSilenced: true,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: bombImage,
    description: "On death, explodes for 10 damage and applies a Burn that increases damage taken from explode by 10 for 3 turns.",
    onDeath: {
        ability: {
            name: "Explode",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    area: 3,
                    damage: 10,
                    effects: [
                        {
                            name: "Explosive Burn",
                            description: "Burning and taking increased damage from Explode.",
                            icon: Fire,
                            type: EFFECT_TYPES.BURN,
                            class: EFFECT_CLASSES.DEBUFF,
                            duration: 3,
                            onTurnEnd: {
                                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                damage: 3,
                            },
                            abilityDamageReceived: [
                                {
                                    abilityName: "Explode",
                                    damage: 10,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    },
};

export const eliteSquad: Effect = {
    name: "Elite Squadmember",
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackPower: 1,
    icon: Medal,
    description:
        "A member of an elite triad, tougher and stronger than most enemies. After being stunned or frozen, gains temporary immunity to those effects.",
    onReceiveEffect: {
        conditions: [
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
                comparator: "eq",
            },
        ],
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [controlImmune],
    },
};

export const elite: Effect = {
    name: "Elite",
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackPower: 2,
    description:
        "An elite champion, tougher and stronger than most enemies. After being stunned or frozen, gains temporary immunity to those effects.",
    icon: MilitaryMedal,
    onReceiveEffect: {
        conditions: [
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
                comparator: "eq",
            },
        ],
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [controlImmune],
    },
};

export const healingOverTime: Effect = {
    name: "Healing Over Time",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    canBeSilenced: true,
    duration: 5,
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        healing: 2,
    },
};

export const silence: Effect = {
    name: "Silence",
    duration: 2,
    description: "Disables certain buffs and prevents resource generation.",
    type: EFFECT_TYPES.SILENCE,
    class: EFFECT_CLASSES.DEBUFF,
    icon: SpeechBubble,
};

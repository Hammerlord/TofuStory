import { BombImage, GemHeartImage, PoisonImage, UpMATTImage, WeaponBoosterImage, WeaponMasteryImage } from "../images";
import {
    AngerIcon,
    BloodIcon,
    CactusIcon,
    CloudyIcon,
    DizzyIcon,
    FireIcon,
    HelmetIcon,
    JapaneseOgreAlternateIcon,
    JapaneseOgreIcon,
    MedalIcon,
    MilitaryMedalIcon,
    NoStunIcon,
    SnowflakeIcon,
    SpeechBubbleIcon,
    VolcanoIcon,
} from "../images/icons";
import {
    Effect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    TRIGGER_TARGET_TYPES,
    TARGET_TYPES,
    ACTION_TYPES,
    Minion,
    ANIMATION_TYPES,
    MULTIPLIER_TYPES,
    CONDITION_TARGETS,
    SCALING_VALUE_TYPES,
} from "./types";

export const thorns: Effect = {
    name: "Thorns",
    description: "Reflects 1 damage to attackers.",
    canBeSilenced: true,
    icon: CactusIcon,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    thorns: 1,
};

export const controlImmune: Effect = {
    name: "Control Immunity",
    description: "Target cannot be stunned, frozen, or silenced.",
    icon: NoStunIcon,
    immunities: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE, EFFECT_TYPES.SILENCE],
    duration: 5,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
};

export const hardy: Effect = {
    name: "Hardy",
    description: "After being stunned, frozen or silenced, this character gains temporary immunity to those effects.",
    icon: HelmetIcon,
    onReceiveEffect: {
        usableWhileStunned: true,
        conditions: [
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER, // This should be comparing the effect not its owner
                hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE, EFFECT_TYPES.SILENCE],
                comparator: "eq",
            },
        ],
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [controlImmune],
    },
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
};

export const stealth: Effect = {
    type: EFFECT_TYPES.STEALTH,
    class: EFFECT_CLASSES.BUFF,
    name: "Stealth",
    icon: CloudyIcon,
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
    icon: DizzyIcon,
};

export const wound: Effect = {
    name: "Wound",
    type: EFFECT_TYPES.BLEED,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 3,
    attackDamageReceived: 1,
    icon: BloodIcon,
    description: "Wounded targets take 1 damage at the end of their turn and receive 1 extra damage from attacks.",
};

export const burn: Effect = {
    name: "Burn",
    type: EFFECT_TYPES.BURN,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 3,
    icon: FireIcon,
    description: "Burned targets take 3 damage at the end of their turn.",
};

export const chill: Effect = {
    name: "Chill",
    icon: SnowflakeIcon,
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
    icon: WeaponBoosterImage,
    description: "Area of this character's basic attacks increased by 1.",
};

export const immunity: Effect = {
    name: "Immunity",
    icon: UpMATTImage,
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
    icon: AngerIcon,
    description: "Periodically increasing the attack power of this character.",
    turnsTriggerFrequency: 2,
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                name: "Rage",
                type: EFFECT_TYPES.RAGE,
                class: EFFECT_CLASSES.BUFF,
                icon: WeaponMasteryImage,
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
    icon: JapaneseOgreIcon,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
};

export const avenger: Effect = {
    name: "Avenger",
    canBeSilenced: true,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: JapaneseOgreAlternateIcon,
    description: "Grows powerful when one of its allies falls in combat.",
    onFriendlyDeath: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        usableWhileStunned: true,
        ability: {
            name: "Vengeful",
            image: JapaneseOgreIcon,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    armor: 3,
                    resources: 1,
                    bonus: {
                        armor: 1,
                        multiplier: {
                            type: MULTIPLIER_TYPES.MAX_HP,
                            value: 0.2,
                            calculationTarget: CONDITION_TARGETS.ACTOR,
                        },
                    },
                },
            ],
        },
        effects: [vengeful],
    },
};

export const shielding: Effect = {
    name: "Shielding",
    canBeSilenced: true,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: GemHeartImage,
    description: "Periodically gaining a shield that wards off a single attack.",
    turnsTriggerFrequency: 2,
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                name: "Attack Immunity",
                icon: UpMATTImage,
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
            description: "Erupting for damage equal to the character's max health when this effect expires",
            duration: 2,
            onEnd: {
                usableWhileStunned: true,
                ability: {
                    name: "Erupt",
                    image: VolcanoIcon,
                    actions: [
                        {
                            type: ACTION_TYPES.RANGE_ATTACK,
                            target: TARGET_TYPES.RANDOM_HOSTILE,
                            animation: ANIMATION_TYPES.CAST,
                            area: 2,
                            damage: 1,
                            multiplier: {
                                calculationTarget: CONDITION_TARGETS.ACTOR,
                                type: MULTIPLIER_TYPES.MAX_HP,
                                value: 1,
                            },
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
        usableWhileStunned: true,
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
    icon: BombImage,
    description: "On death, explodes and applies a Burn that increases damage taken from additional Explodes for 2 turns.",
    onDeath: {
        usableWhileStunned: true,
        ability: {
            name: "Explode",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    area: 3,
                    damage: 1,
                    bonus: {
                        damage: 1,
                        multiplier: {
                            type: MULTIPLIER_TYPES.MAX_HP,
                            calculationTarget: CONDITION_TARGETS.ACTOR,
                            value: 0.1,
                        },
                    },

                    effects: [
                        {
                            name: "Explosive - Burn",
                            description: "Burning and taking 50% increased damage from Explode.",
                            icon: FireIcon,
                            type: EFFECT_TYPES.BURN,
                            class: EFFECT_CLASSES.DEBUFF,
                            duration: 2,
                            onTurnEnd: {
                                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                damage: 3,
                            },
                            abilityDamageReceived: [
                                {
                                    abilityName: "Explode",
                                    damage: 1.5,
                                    type: SCALING_VALUE_TYPES.PERCENTAGE,
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
    ...hardy,
    name: "Elite Squadmember",
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackPower: 1,
    icon: MedalIcon,
    description:
        "A member of an elite triad, tougher and stronger than most enemies. After being stunned, frozen, or silenced, this character gains temporary immunity to those effects.",
};

export const elite: Effect = {
    ...hardy,
    name: "Elite",
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackPower: 2,
    icon: MilitaryMedalIcon,
    description:
        "An elite champion, tougher and stronger than most enemies. After being stunned, frozen, or silenced, this character gains temporary immunity to those effects.",
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
    icon: SpeechBubbleIcon,
};

export const poison: Effect = {
    name: "Poison",
    type: EFFECT_TYPES.POISON,
    class: EFFECT_CLASSES.DEBUFF,
    description: "Healing received reduced by 1. Taking 2 damage at the end of the turn.",
    icon: PoisonImage,
    duration: 3,
    healingReceived: -1,
};

export const attackPower: Effect = {
    name: "Attack Power",
    description: "Attack power increased.",
    icon: WeaponMasteryImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackPower: 1,
    duration: 1,
};

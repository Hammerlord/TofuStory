import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import {
    AttackDownImage,
    BackpackImage,
    BombImage,
    CursedDollImage,
    FireMarbleImage,
    GemHeartImage,
    GreyShieldImage,
    HumilityStoneImage,
    MushroomOmokImage,
    NimbleJewelCImage,
    PoisonImage,
    StoneShieldImage,
    UpMATTImage,
    WeaponBoosterImage,
    WeaponMasteryImage,
} from "../images";
import {
    AngerIcon,
    BlackShieldIcon,
    BloodIcon,
    CactusIcon,
    CloudyIcon,
    CrossedSwordsIcon,
    DizzyIcon,
    EyeIcon,
    FireIcon,
    HelmetIcon,
    JapaneseOgreAlternateIcon,
    JapaneseOgreIcon,
    MedalIcon,
    MilitaryMedalIcon,
    NoStunIcon,
    PristineBlackShieldIcon,
    PristineShieldIcon,
    ShieldIcon,
    SnowflakeIcon,
    SpeechBubbleIcon,
    VolcanoIcon,
} from "../images/icons";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    MULTIPLIER_TYPES,
    Minion,
    SCALING_VALUE_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./types";

export const thorns: Effect = {
    name: "Thorns",
    description: "Deals 1 damage to attackers.",
    canBeSilenced: true,
    icon: CactusIcon,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    thorns: 1,
};

export const eliteThorns: Effect = {
    ...thorns,
    description: "Deals 1 damage to attackers. Activates every 2 turns.",
    turnsTriggerFrequency: 2,
};

export const controlImmune: Effect = {
    name: "Stun Immune",
    description: "Target cannot be stunned or frozen.",
    icon: NoStunIcon,
    immunities: {
        type: "effect-type",
        value: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
    },
    duration: 6,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
};

export const hardy: Effect = {
    name: "Hardy",
    description: "After being stunned or frozen, this character gains temporary immunity to those effects.",
    icon: HelmetIcon,
    disableDisplayIcon: true,
    onReceiveEffect: {
        usableWhileStunned: true,
        conditionOperator: "and",
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
                hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
                comparator: "eq",
            },
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                hasEffect: controlImmune.name,
                comparator: "not",
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
    description: "Untargetable by single-target abilities. Effect ends if this character attacks or is hit by area damage.",
    onAttack: {
        removeEffect: true,
    },
    onReceiveAttack: {
        removeEffect: true,
    },
    onReceiveDamage: {
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                sourceType: TRIGGER_SOURCE_TYPES.ACTION,
                property: "area",
                comparator: "gt",
                value: 0,
                isOffense: true,
            },
        ],
        removeEffect: true,
    },
    duration: 3,
};

export const stun: Effect = {
    name: "Stun",
    type: EFFECT_TYPES.STUN,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 1,
    maxApplications: 1,
    maxDuration: 1,
    description: "Stunned targets are unable to act.",
    icon: DizzyIcon,
};

export const bleed: Effect = {
    name: "Bleed",
    type: EFFECT_TYPES.BLEED,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 3,
    attackDamageReceived: 1,
    maxApplications: 5,
    icon: BloodIcon,
    description: "Target takes 1 damage at turn end and receives +1 damage from attacks. Max 5.",
};

export const burn: Effect = {
    name: "Burn",
    type: EFFECT_TYPES.BURN,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 3,
    icon: FireIcon,
    description: "Target takes 3 damage at turn end.",
};

export const chill: Effect = {
    name: "Chill",
    icon: SnowflakeIcon,
    type: EFFECT_TYPES.CHILL,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 3,
    attackPower: -1,
    maxApplications: 3,
    maxDuration: 10,
    description: "Reduces ATT by 1, up to {{ maxApplications }} stacks. Can't bring enemy damage below 1.",
};

export const freeze: Effect = {
    name: "Freeze",
    icon: NimbleJewelCImage,
    type: EFFECT_TYPES.FREEZE,
    class: EFFECT_CLASSES.DEBUFF,
    maxApplications: 1,
    maxDuration: 1,
    description: "Frozen targets are unable to act.",
    duration: 1,
};

export const immunity: Effect = {
    name: "Immunity",
    description: "Impervious to harm.",
    icon: UpMATTImage,
    type: EFFECT_TYPES.IMMUNITY,
    class: EFFECT_CLASSES.BUFF,
    duration: 1,
};

export const ward: Effect = {
    ...immunity,
    type: EFFECT_TYPES.ATTACK_IMMUNITY,
    name: "Ward",
    description: "Wards off the next attack.",
    duration: Infinity,
    onReceiveAttack: { removeEffect: true },
};

export const raging: Effect = {
    name: "Raging",
    canBeSilenced: true,
    duration: Infinity,
    type: EFFECT_TYPES.RAGE,
    class: EFFECT_CLASSES.BUFF,
    icon: AngerIcon,
    description: "Ramping attack power. Attack power stacks are removed if stunned or frozen.",
    turnsTriggerFrequency: 2,
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        ability: {
            name: "Raging",
            image: AngerIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    icon: AngerIcon,
                    effects: [
                        {
                            name: "Rage",
                            type: EFFECT_TYPES.RAGE,
                            class: EFFECT_CLASSES.BUFF,
                            icon: WeaponMasteryImage,
                            disableDisplayIcon: true,
                            description: "Effect is removed if the character is stunned.",
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
            ],
        },
    },
};

export const vengeful: Effect = {
    name: "Vengeful",
    canBeSilenced: true,
    duration: 4,
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
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    icon: JapaneseOgreIcon,
                    armor: 3,
                    resources: 1,
                    bonus: {
                        armor: 1,
                        multiplier: {
                            type: MULTIPLIER_TYPES.MAX_HP,
                            value: 0.1,
                            calculationTarget: CONDITION_TARGETS.ACTOR,
                        },
                    },
                },
            ],
        },
        effects: [vengeful],
    },
};

export const warding: Effect = {
    name: "Warding",
    canBeSilenced: true,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: GemHeartImage,
    description: "Periodically gaining a shield that wards off a single attack.",
    turnsTriggerFrequency: 2,
    onWaveStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                ...ward,
                duration: 1,
            },
        ],
    },
    onTurnStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                ...ward,
                duration: 2,
            },
        ],
    },
};

export const stoneSkin: Effect = {
    name: "Stoneskin",
    canBeSilenced: true,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    description: "Gaining Armor every turn.",
    icon: StoneShieldImage,
    onBattleStart: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        armor: 1,
        multiplier: {
            calculationTarget: CONDITION_TARGETS.ACTOR,
            type: MULTIPLIER_TYPES.MAX_HP,
            value: 0.05,
        },
    },
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        armor: 1,
        multiplier: {
            calculationTarget: CONDITION_TARGETS.ACTOR,
            type: MULTIPLIER_TYPES.MAX_HP,
            value: 0.05,
        },
    },
};

export const volcano: Minion = {
    name: "Volcano",
    maxHP: 7,
    image: VolcanoIcon,
    abilities: [],
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
    description: "Periodically summoning volcanoes that erupt, dealing area damage.",
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
    description: "On death, Explodes and applies a Burn that increases Explode damage taken.",
    onDeath: {
        ability: {
            name: "Explode",
            image: BombImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.EXPLODE,
                    area: 3,
                    damage: 1,
                    bonus: {
                        damage: 1,
                        multiplier: {
                            type: MULTIPLIER_TYPES.MAX_HP,
                            calculationTarget: CONDITION_TARGETS.ACTOR,
                            value: 0.05,
                        },
                    },

                    effects: [
                        {
                            name: "Explosive - Burn",
                            description: "Burning and taking 30% increased damage from Explode.",
                            icon: FireIcon,
                            type: EFFECT_TYPES.BURN,
                            class: EFFECT_CLASSES.DEBUFF,
                            duration: 1,
                            abilityDamageReceived: [
                                {
                                    abilityName: "Explode",
                                    damage: 1.3,
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
    icon: MedalIcon,
    description:
        "A member of an elite squad, tougher and stronger than most enemies. After being stunned, frozen, or silenced, this character gains temporary immunity to those effects.",
};

export const eliteTrio: Effect = {
    ...hardy,
    name: "Elite Squadmember",
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
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
    attackPower: 1,
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
    duration: 3,
    description: "Disables certain buffs.",
    type: EFFECT_TYPES.SILENCE,
    class: EFFECT_CLASSES.DEBUFF,
    icon: SpeechBubbleIcon,
    persistsWhenDead: true,
};

export const poison: Effect = {
    name: "Poison",
    type: EFFECT_TYPES.POISON,
    class: EFFECT_CLASSES.DEBUFF,
    description: "Healing received reduced by 1. Taking 2 damage at turn end.",
    icon: PoisonImage,
    duration: 3,
    healingReceived: -1,
};

export const attackPower: Effect = {
    name: "ATT Up",
    icon: CrossedSwordsIcon,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackPower: 1,
    canBeSilenced: true,
};

export const armorUp: Effect = {
    name: "Armor Up",
    icon: ShieldIcon,
    class: EFFECT_CLASSES.BUFF,
    type: EFFECT_TYPES.NONE,
    armorReceived: 1,
};

export const preventArmorDecay: Effect = {
    name: "Pristine Armor",
    icon: PristineShieldIcon,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    preventArmorDecay: true,
    canBeSilenced: true,
    maxApplications: 1,
};

// Player typically gets a limit on their armor decay prevention, as opposed to enemies
export const preventArmorDecayPlayer: Effect = {
    ...preventArmorDecay,
    stacks: 1,
    alwaysDisplayStacks: true,
    onArmorDecay: {
        decrementStacks: 1,
    },
};

export const defUp: Effect = {
    name: "DEF Up",
    icon: BlackShieldIcon,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    canBeSilenced: true,
    attackDamageReceived: -1,
};

export const defDown: Effect = {
    name: "DEF Down",
    icon: BlackShieldIcon,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.DEBUFF,
    canBeSilenced: true,
    attackDamageReceived: 1,
};

export const pristineDefense: Effect = {
    name: "Pristine DEF Up",
    icon: PristineBlackShieldIcon,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    canBeSilenced: true,
    preventArmorDecay: true,
    attackDamageReceived: -1,
};

export const sentry: Effect = {
    name: "Sentry",
    description: "Fires a 2-damage laser whenever an enemy uses an ability.",
    icon: EyeIcon,
    portraitImage: EyeIcon,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    canBeSilenced: true,
    onHostileAbility: {
        targetType: TRIGGER_TARGET_TYPES.ACTOR,
        disableTriggerFromProcs: true,
        ability: {
            name: "Sentry Laser",
            image: FireMarbleImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.BEAM,
                    icon: FireMarbleImage,
                    animationOptions: {
                        width: 25,
                        height: 25,
                    },
                    damage: 2,
                },
            ],
        },
    },
};

export const stashCardEffect: Effect = {
    name: "Stash Card",
    description: "You may move one card from your hand to the top of your deck.",
    icon: BackpackImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
    allowMoveCardFromHandToDeck: true,
    maxApplications: 1,
    stacks: 1,
    onMoveCardFromHandToDeck: {
        decrementStacks: 1,
    },
    disableDisplayIcon: true,
};

export const infuriateEffect: Effect = {
    name: "Infuriate",
    type: EFFECT_TYPES.RAGE,
    class: EFFECT_CLASSES.BUFF,
    icon: HumilityStoneImage,
    resourcesPerTurn: 1,
    onTurnInProgress: {
        removeEffect: true,
    },
};

export const taunt: Effect = {
    name: "Taunt",
    type: EFFECT_TYPES.TAUNT,
    class: EFFECT_CLASSES.BUFF,
    portraitImage: BlackShieldIcon,
    portraitImageOptions: {
        displayMode: "pulse",
    },
    icon: GreyShieldImage,
    canBeSilenced: true,
    description: "Attackers must target this character.",
};

export const attackDown: Effect = {
    name: "ATT Down",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.DEBUFF,
    icon: CrossedSwordsIcon,
    attackPower: -1,
    duration: 3,
    maxApplications: 3,
    maxDuration: 10,
    description: "Reduces ATT by 1, up to {{ maxApplications }} stacks. Can't bring enemy damage below 1.",
};

export const directDamageTaken: Effect = {
    name: "Direct Damage Taken",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
    duration: 1,
};

export const directDamageTakenTrigger: Effect = {
    name: "Direct Damage Taken Trigger",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
    onReceiveDamage: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        conditionOperator: "and",
        conditions: [
            {
                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 0,
                comparator: "eq",
            },
            {
                calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                property: "isPlayer",
                comparator: "not",
                value: true,
            },
        ],
        effects: [directDamageTaken],
    },
};

export const tributeSummonBuff: Effect = {
    name: "Tribute Summoned",
    description: "Bonus from replacing a summon.",
    icon: MushroomOmokImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackPower: 1,
    maxHP: 1,
};

export const lupinCurse: Effect = {
    name: "Lupin Curse",
    icon: CursedDollImage,
    description: "Receiving damage whenever its allies are attacked.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.DEBUFF,
    onFriendlyReceiveAttack: {
        excludeEffectOwner: true,
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        damage: 1,
    },
    onDeath: {
        usableWhileStunned: true,
        removeEffect: true,
        ability: {
            name: "Cursed Doll",
            image: CursedDollImage,
            actions: [
                {
                    type: ACTION_TYPES.NONE,
                    target: TARGET_TYPES.RANDOM_FRIENDLY,
                    icon: CursedDollImage,
                    effects: ["Lupin Curse"],
                },
            ],
        },
    },
};

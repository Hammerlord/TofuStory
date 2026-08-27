import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import {
    BackpackImage,
    BombImage,
    CursedDollImage,
    FireMarbleImage,
    GemHeartImage,
    GreyShieldImage,
    LeafImage,
    MushroomOmokImage,
    NimbleJewelCImage,
    PoisonImage,
    StoneShieldImage,
    UpMATTImage,
    WeaponMasteryImage,
} from "../images";
import {
    AngerIcon,
    ArmorUpIcon,
    AttDownIcon,
    AttUpIcon,
    BlackShieldIcon,
    BloodIcon,
    CactusIcon,
    CloudyIcon,
    DefDownIcon,
    DefUpIcon,
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
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./types";

export const thorns: Effect = {
    name: "Thorns",
    description: "Attackers take 1 damage per stack.",
    canBeSilenced: true,
    icon: CactusIcon,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    thorns: 1,
};

export const eliteThorns: Effect = {
    ...thorns,
    description: "Attackers take 1 damage per stack. Activates every {{ turnsTriggerFequency }} turns.",
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
    description:
        "After being stunned or frozen, gains immunity to those effects for <b>{{{ onReceiveEffect.effects.0.duration }}} {{{ _duration_ }}}.</b>",
    icon: HelmetIcon,
    disableDisplayIcon: true,
    onEffectEnded: {
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
    description: "Untargetable by most single-target abilities. Effect ends if this character attacks or is hit by area damage.",
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
    persistsWhenDead: true,
    description: "Stunned targets are unable to act and take <b>30%</b> more damage from attacks, rounded up.",
    defenseDown: 3,
    icon: DizzyIcon,
};

export const bleed: Effect = {
    name: "Bleed",
    type: EFFECT_TYPES.BLEED,
    class: EFFECT_CLASSES.DEBUFF,
    duration: Infinity,
    stacks: 3,
    maxApplications: 1,
    icon: BloodIcon,
    description:
        "On turn start, take 1 damage per stack (bypassing armor), and reduce stacks by 1. While active, take 10% increased damage from attacks, rounded up.",
    onTurnStart: {
        decrementStacks: 1,
    },
};

export const burn: Effect = {
    name: "Burn",
    type: EFFECT_TYPES.BURN,
    class: EFFECT_CLASSES.DEBUFF,
    duration: Infinity,
    icon: FireIcon,
    description: "On turn start, take 1 damage per stack (bypassing armor), and reduce stacks by 1.",
    maxApplications: 1,
    stacks: 2,
    onTurnStart: {
        decrementStacks: 1,
    },
};

export const chill: Effect = {
    name: "Chill",
    icon: SnowflakeIcon,
    type: EFFECT_TYPES.CHILL,
    class: EFFECT_CLASSES.DEBUFF,
    duration: 2,
    attackPower: -1,
    defenseDown: 1,
    maxApplications: 3,
    maxDuration: 10,
    description: "Applies <b>1 {{{ _attDown_ }}} ATT Down</b> and <b>{{{ _defDown_ }}} DEF Down,</b> up to {{ maxApplications }}.",
};

export const freeze: Effect = {
    name: "Freeze",
    icon: NimbleJewelCImage,
    type: EFFECT_TYPES.FREEZE,
    class: EFFECT_CLASSES.DEBUFF,
    maxApplications: 1,
    maxDuration: 1,
    description: "Frozen targets are unable to act and take <b>30%</b> more damage from attacks, rounded up.",
    defenseDown: 3,
    duration: 1,
    persistsWhenDead: true,
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
    type: EFFECT_TYPES.IMMUNITY,
    name: "Ward",
    description: "Deflects the next non-auto attack.",
    duration: Infinity,
    onReceiveAttack: {
        disableTriggerFromProcs: true,
        removeEffect: true,
    },
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
        disableTriggerFromProcs: true,
        removeEffect: true,
    },
};

export const raging: Effect = {
    name: "Raging",
    canBeSilenced: true,
    duration: Infinity,
    type: EFFECT_TYPES.RAGE,
    class: EFFECT_CLASSES.BUFF,
    icon: AngerIcon,
    description: "Ramping <b>{{{ _attUp_ }}} ATT Up.</b> Stacks are removed if stunned or frozen.",
    onTurnEnd: {
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
    description:
        "Gains Armor and <b>{{ onFriendlyDeath.effects.0.attackPower }} {{{ _attUp_ }}} ATT Up</b> when one of its allies falls in combat. Lasts <b>{{ onFriendlyDeath.effects.0.duration }} {{{ _duration_ }}}.</b>",
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
                    bonus: {
                        armor: 1,
                        multiplier: {
                            type: MULTIPLIER_TYPES.MAX_HP,
                            value: 0.05,
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
    description:
        "Every <b>{{{ turnsTriggerFrequency }}} turns,</b> gains a shield that negates the next direct attack. (Not broken by auto-attacks triggered from effects.)",
    turnsTriggerFrequency: 3,
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

export const attackPower: Effect = {
    name: "ATT Up",
    description: "Increases attack damage by 10% (rounded up).",
    icon: AttUpIcon,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackPower: 1,
    canBeSilenced: true,
};

export const stoneSkin: Effect = {
    name: "Stoneskin",
    canBeSilenced: true,
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    description:
        "Gaining Armor every {{ turnsTriggerFrequency }} turns. While it has Armor, gains <b>+{{ onBattleStart.1.effects.0.attackPower }} {{{ _attUp_ }}} ATT Up.</b>",
    turnsTriggerFrequency: 3,
    icon: StoneShieldImage,
    onBattleStart: [
        {
            targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            armor: 1,
            maxArmor: 5,
            multiplier: {
                calculationTarget: CONDITION_TARGETS.ACTOR,
                type: MULTIPLIER_TYPES.MAX_HP,
                value: 0.05,
            },
        },
        {
            targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            effects: [
                {
                    ...attackPower,
                    onlyVisibleWhenProcced: true,
                    conditions: [
                        {
                            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                            armor: 0,
                            comparator: "gt",
                        },
                    ],
                },
            ],
        },
    ],
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        armor: 1,
        maxArmor: 5,
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
            duration: 3,
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
    description: "Every {{ turnsTriggerFrequency }} turns, summons volcanoes that erupt for area damage.",
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
    description:
        "Explodes for its max HP when it dies, up to <b>{{ onDeath.ability.actions.0.maxDamage }}.</b> Damage split between targets.",
    onDeath: {
        ability: {
            name: "Explode",
            image: BombImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.EXPLODE,
                    area: 5,
                    damage: 1,
                    maxDamage: 10,
                    damageDividedByTargets: true,
                    bonus: {
                        damage: 1,
                        multiplier: {
                            type: MULTIPLIER_TYPES.MAX_HP,
                            calculationTarget: CONDITION_TARGETS.ACTOR,
                            value: 0.1,
                        },
                    },
                },
            ],
        },
    },
};

const eliteDescription =
    "An elite enemy with <b>+{{ attackPower }} {{{ _attUp_ }}} ATT Up</b>. After being stunned or frozen, gains temporary immunity to those effects.";

export const eliteSquad: Effect = {
    ...hardy,
    name: "Elite Squadmember",
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: MedalIcon,
    attackPower: 1,
    description: eliteDescription,
};

export const eliteTrio: Effect = {
    ...hardy,
    name: "Elite Squadmember",
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: MedalIcon,
    attackPower: 1,
    description: eliteDescription,
};

export const elite: Effect = {
    ...hardy,
    name: "Elite",
    duration: Infinity,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackPower: 2,
    icon: MilitaryMedalIcon,
    description: eliteDescription,
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
    description: "On turn start, take 1 damage per stack (bypassing armor), and reduce stacks by 1.",
    icon: PoisonImage,
    duration: Infinity,
    maxApplications: 1,
    stacks: 2,
    onTurnStart: {
        decrementStacks: 1,
    },
};

export const armorUp: Effect = {
    name: "Armor Up",
    description: "Gaining <b>+1 {{{ _armor_ }}}</b> from Armor sources per stack.",
    icon: ArmorUpIcon,
    class: EFFECT_CLASSES.BUFF,
    type: EFFECT_TYPES.NONE,
    armorReceived: 1,
};

export const preventArmorDecay: Effect = {
    name: "Pristine Armor",
    description: "Armor doesn't decay on turn start.",
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
    description: "Reduces damage from attacks by 10% per stack, rounded up.",
    icon: DefUpIcon,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    canBeSilenced: true,
    defenseDown: -1,
};

export const defDown: Effect = {
    name: "DEF Down",
    description: "Increases damage from attacks by 10% per stack, rounded up.",
    icon: DefDownIcon,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.DEBUFF,
    canBeSilenced: true,
    defenseDown: 1,
};

export const pristineDefense: Effect = {
    name: "Pristine DEF Up",
    description: "Prevents Armor decay and reduces damage from attacks by 10% per stack, rounded up.",
    icon: PristineBlackShieldIcon,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    canBeSilenced: true,
    preventArmorDecay: true,
    defenseDown: -1,
};

export const sentry: Effect = {
    name: "Sentry",
    description: "Deals <b>{{ onHostileAbility.ability.actions.0.damage }} {{{ _damage_ }}}</b> to any enemy who uses an ability.",
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
    onTurnEnd: {
        removeEffect: true,
    },
};

export const bideEffect: Effect = {
    name: "Bide",
    description: "Gain <b>1 {{{ _resource_ }}}</b> per stack next turn.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: LeafImage,
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
    maxApplications: 1,
    maxDuration: 5,
};

export const attackDown: Effect = {
    name: "ATT Down",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.DEBUFF,
    icon: AttDownIcon,
    attackPower: -1,
    duration: 3,
    maxApplications: 3,
    maxDuration: 10,
    description: "Reduces damage dealt by 10% per stack, up to <b>{{ maxApplications }}</b> stacks. Can't bring enemy damage below 1.",
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
    maxApplications: 1,
    maxStacks: 1,
    onReceiveHealthDamage: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
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
    description: "Receiving <b>{{ onFriendlyReceiveAttack.damage }} {{{ _damage_ }}}</b> whenever its allies are attacked.",
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

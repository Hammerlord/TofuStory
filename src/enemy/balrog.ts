import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, Effect, Minion, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../ability/types";
import {
    BrutalClawImage,
    DarkThunderBoltProjectileImage,
    FireMarbleImage,
    FlameImage,
    GemHeartImage,
    JrBalrogImage,
    SapOfNependeathImage,
    ThunderBoltImage,
    UpMATTImage,
    WeaponMasteryImage,
} from "../images";
import { AngerIcon, BloodIcon } from "../images/icons";
import { bleed, burn, explosive, hardy, poison, raging, sentry, shielding } from "./../ability/Effects";
import { attack } from "./abilities";
import { poisonous } from "./effect";

const balrogName = "Avatar of Balrog";

const flameShield: Effect = {
    ...shielding,
    icon: GemHeartImage,
    image: GemHeartImage,
    description: "Periodically granting Balrog a shield that wards off a single attack.",
    onTurnStart: {
        ability: {
            name: "Shielding Flame",
            image: GemHeartImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.FRIENDLY_CHARACTER,
                    targetName: balrogName,
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
            ],
        },
    },
};

const flameRaging: Effect = {
    ...raging,
    description: "Periodically increasing Balrog's attack power.",
    icon: AngerIcon,
    image: AngerIcon,
    onTurnStart: {
        ability: {
            name: "Raging Flame",
            image: AngerIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.FRIENDLY_CHARACTER,
                    targetName: balrogName,
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
            ],
        },
    },
};

const flamePoison: Effect = {
    ...poisonous,
    description: "Balrog's attacks inflict poison.",
    icon: SapOfNependeathImage,
    image: SapOfNependeathImage,
    onTurnStart: {
        ability: {
            name: "Poisonous Flame",
            image: SapOfNependeathImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.FRIENDLY_CHARACTER,
                    targetName: balrogName,
                    effects: [{ ...poisonous, duration: 1 }],
                },
            ],
        },
    },
};

// Grants shielding to Balrog
const shieldingFlame: Minion = {
    name: "Shielding Flame",
    maxHP: 50,
    image: FlameImage,
    effects: [{ ...explosive }, flameShield],
};

// Grants Raging to Balrog
const ragingFlame: Minion = {
    name: "Raging Flame",
    maxHP: 50,
    image: FlameImage,
    effects: [{ ...explosive }, flameRaging],
};

// Grants Poisonous to Balrog
const poisonousFlame: Minion = {
    name: "Pulsing Flame",
    maxHP: 50,
    image: FlameImage,
    effects: [{ ...explosive }, flamePoison],
};

// Shoots at anything that moves
const sentryFlame: Minion = {
    name: "Sentry Flame",
    maxHP: 50,
    image: FlameImage,
    effects: [{ ...explosive }, sentry],
};

const balrogAttack = {
    ...attack,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 7,
        },
    ],
};

export const balrog: Minion = {
    name: balrogName,
    maxHP: 666,
    image: JrBalrogImage,
    isBoss: true,
    effects: [
        hardy,
        {
            name: "Summon Flames",
            icon: FlameImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            disableDisplayIcon: true,
            onBattleStart: {
                ability: {
                    name: "Summon Flames",
                    image: FlameImage,
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.EFFECT,
                            summon: [
                                { minion: [shieldingFlame, ragingFlame, poisonousFlame, sentryFlame], noDuplicateMinions: true },
                                { minion: [shieldingFlame, ragingFlame, poisonousFlame, sentryFlame], noDuplicateMinions: true },
                            ],
                        },
                    ],
                },
                removeEffect: true,
            },
        },
        {
            name: "Summon Flames - Turn Start",
            icon: FlameImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 5,
            disableDisplayIcon: true,
            onTurnStart: {
                ability: {
                    name: "Summon Flames",
                    image: FlameImage,
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.EFFECT,
                            summon: [
                                { minion: [shieldingFlame, ragingFlame, poisonousFlame, sentryFlame], noDuplicateMinions: true },
                                { minion: [shieldingFlame, ragingFlame, poisonousFlame, sentryFlame], noDuplicateMinions: true },
                            ],
                        },
                    ],
                },
            },
        },
    ],
    abilities: [
        balrogAttack,
        {
            name: "Meteor",
            image: FireMarbleImage,
            actions: [
                {
                    damage: 5,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    icon: FireMarbleImage,
                    area: 1,
                    effects: [
                        {
                            ...burn,
                            duration: 3,
                        },
                    ],
                },
            ],
        },
        balrogAttack,
        {
            name: "Dark Lightning",
            image: ThunderBoltImage,
            actions: [
                {
                    damage: 10,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    icon: DarkThunderBoltProjectileImage,
                    animationOptions: {
                        height: 250,
                        width: 60,
                        flash: 200,
                        brightness: 0,
                    },
                    area: 3,
                    effects: [
                        {
                            ...poison,
                            duration: 1,
                        },
                    ],
                },
            ],
        },
        balrogAttack,
        {
            name: "Wicked Slash",
            image: BloodIcon,
            actions: [
                {
                    damage: 5,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    effects: [{ ...bleed }],
                },
                {
                    damage: 5,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    effects: [{ ...bleed }],
                },
            ],
        },
        balrogAttack,
        {
            name: "Pulverize",
            resourceCost: 3,
            image: BrutalClawImage,
            actions: [
                {
                    damage: 7,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    destroyArmor: 1,
                    moveCards: {
                        from: "deck",
                        to: "discard",
                        amount: 1,
                    },
                },
            ],
        },
    ],
};

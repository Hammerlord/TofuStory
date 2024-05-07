import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    CARD_PILE_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import {
    AshesImage,
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
import { bleed, burn, explosive, hardy, poison, raging, sentry, warding } from "./../ability/Effects";
import { attack } from "./abilities";
import { poisonous } from "./effect";

const balrogName = "Avatar of Balrog";

const flameShield: Effect = {
    ...warding,
    icon: GemHeartImage,
    portraitImage: GemHeartImage,
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
    description: "Periodically giving +ATT to Balrog.",
    icon: AngerIcon,
    portraitImage: AngerIcon,
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
    portraitImage: SapOfNependeathImage,
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
    maxHP: 30,
    image: FlameImage,
    effects: [{ ...explosive }, flameShield],
};

// Grants Raging to Balrog
const ragingFlame: Minion = {
    name: "Raging Flame",
    maxHP: 30,
    image: FlameImage,
    effects: [{ ...explosive }, flameRaging],
};

// Grants Poisonous to Balrog
const poisonousFlame: Minion = {
    name: "Pulsing Flame",
    maxHP: 30,
    image: FlameImage,
    effects: [{ ...explosive }, flamePoison],
};

// Shoots at anything that moves
const sentryFlame: Minion = {
    name: "Sentry Flame",
    maxHP: 30,
    image: FlameImage,
    effects: [{ ...explosive }, sentry],
};

const balrogAttack = {
    ...attack,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 6,
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
            name: "Brutal Claw",
            icon: BrutalClawImage,
            description: "Every 6 cards played, Balrog will attack for 6 damage and discard a card from the player's hand.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            disableDisplayIcon: true, // It is displayed above the attack power instead
            extraDisplayOptions: {
                container: "right",
                property: "onPlayCard.eventTriggeredTimes",
                modulo: "onPlayCard.eventTriggerFrequency",
            },
            onPlayCard: {
                disableTriggerFromProcs: true,
                eventTriggerFrequency: 6,
                ability: {
                    name: "Brutal Claw",
                    image: BrutalClawImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            icon: BrutalClawImage,
                            animation: ANIMATION_TYPES.ACTION_EXPLODE,
                        },
                        {
                            damage: 6,
                            type: ACTION_TYPES.ATTACK,
                            target: TARGET_TYPES.PLAYER,
                            moveCards: {
                                from: CARD_PILE_TYPES.HAND,
                                to: CARD_PILE_TYPES.DISCARD,
                                amount: 1,
                            },
                        },
                    ],
                },
            },
        },
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
            turnsTriggerFrequency: 6,
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
        {
            name: "",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onDeath: {
                ability: {
                    name: "",
                    dialog: "Argh! Impossible! Nobody's ever been able to build this deck!",
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.EFFECT,
                            playbackTime: 2000,
                            resurrect: true, // Hack: this is to allow Balrog to cast the action on itself when it's dead
                        },
                    ],
                },
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.BATTLE,
                        property: "round",
                        value: 4,
                        comparator: "lt",
                    },
                ],
                removeEffect: true,
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
                    damage: 10,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    icon: FireMarbleImage,
                    area: 1,
                    effects: [
                        {
                            ...burn,
                            stacks: 2,
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
                    damage: 6,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    effects: [{ ...bleed }],
                },
                {
                    damage: 6,
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
            castTime: 1,
            image: AshesImage,
            description: "Halves player armor and depletes the top card of the deck.",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.SHOUT,
                },
                {
                    damage: 10,
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.PLAYER,
                    decayArmor: true,
                    moveCards: {
                        from: CARD_PILE_TYPES.DECK,
                        to: CARD_PILE_TYPES.DEPLETED,
                        amount: 1,
                    },
                },
            ],
        },
    ],
};

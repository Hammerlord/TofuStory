import { attack } from "./abilities";
import {
    CursedDollImage,
    FaustImage,
    HomecomingVictoryGlovesImage,
    HomecomingVictoryGlovesRImage,
    MonkeyBananaImage,
    PoisonImage,
    RespawnTokenImage,
    ShackledHandImage,
} from "../images";
import { CloudyIcon, HeartIcon, SmilingImpIcon } from "../images/icons";
import { hardy, poison, preventArmorDecay, stun } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    EffectEventTrigger,
    MULTIPLIER_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { lifeLink } from "./effect";
import { bananaPeelCard } from "./enemy";

export const faust: Minion = {
    name: "Faust",
    maxHP: 400,
    image: FaustImage,
    isBoss: true,
    mesos: 50,
    abilities: [
        {
            name: "Throw Banana",
            image: MonkeyBananaImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: MonkeyBananaImage,
                    damage: 5,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    addCardsToDiscard: [bananaPeelCard],
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 7,
                },
            ],
        },
        {
            name: "Infected Bite",
            image: PoisonImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 10,
                    animationOptions: {
                        sidewinder: true,
                    },
                    effects: [{ ...poison, stacks: 2 }],
                },
            ],
        },
        {
            name: "Going Bananas",
            image: MonkeyBananaImage,
            resourceCost: 3,
            castTime: 1,
            channelDuration: 3,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: MonkeyBananaImage,
                    area: 2,
                    animationOptions: {
                        width: 100,
                        height: 100,
                    },
                    damage: 7,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    addCardsToDeck: [bananaPeelCard],
                },
            ],
        },
    ],
    effects: [
        hardy,
        {
            name: "Puppet Link",
            icon: ShackledHandImage,
            description: "Becomes vulnerable if both Puppeteers die.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            canBeSilenced: false,
            onFriendlyDeath: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                damage: 50,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        comparator: "eq",
                        numFriendly: 1, // This is assuming Faust is the only one alive
                    },
                ],
                effects: [
                    {
                        ...stun,
                        bypassImmunity: true,
                        duration: 3,
                        attackDamageReceived: 3,
                    },
                ],
            },
        },
    ],
};

const puppeteerRevive: EffectEventTrigger = {
    usableWhileStunned: true,
    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
    conditions: [
        {
            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            comparator: "eq",
            numFriendly: 1, // This is assuming Faust is the only one alive
        },
    ],
    effects: [
        {
            name: "Reviving...",
            type: EFFECT_TYPES.LIFE_LINK,
            class: EFFECT_CLASSES.BUFF,
            icon: RespawnTokenImage,
            canBeSilenced: false,
            persistsWhenDead: true,
            description: "When this effect ends, Ghostly Puppeteers will revive.",
            duration: 3,
            onEnd: {
                usableWhileStunned: true,
                usableWhileDead: true,
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                ability: {
                    name: "Revive",
                    image: RespawnTokenImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.FRIENDLY,
                            healing: 1,
                            multiplier: {
                                type: MULTIPLIER_TYPES.MAX_HP,
                                calculationTarget: CONDITION_TARGETS.ACTOR,
                                value: 1,
                            },
                            secondaryAction: {
                                armor: 50,
                            },
                            resurrect: true,
                        },
                    ],
                },
            },
        },
    ],
};

export const ghostlyPuppeteerL: Minion = {
    name: "Ghostly Puppeteer",
    image: HomecomingVictoryGlovesImage,
    imageOptions: {
        animation: "float",
    },
    maxHP: 15,
    armor: 60,
    abilities: [
        {
            name: "Ghostly Mending",
            resourceCost: 0,
            image: HeartIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.FRIENDLY_CHARACTER,
                    targetName: faust.name,
                    healing: 5,
                },
            ],
        },
    ],
    effects: [
        {
            type: EFFECT_TYPES.STEALTH,
            class: EFFECT_CLASSES.BUFF,
            name: "Stealth",
            icon: CloudyIcon,
            canBeSilenced: true,
            description: "Untargetable by attacks. Effect ends if hit by area damage.",
            onReceiveAttack: {
                removeEffect: true,
            },
            duration: 1,
        },
        {
            name: "Ghostly",
            description: "Occasionally stealths, becoming untargetable.",
            canBeSilenced: true,
            duration: Infinity,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: SmilingImpIcon,
            turnsTriggerFrequency: 2,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        type: EFFECT_TYPES.STEALTH,
                        class: EFFECT_CLASSES.BUFF,
                        name: "Stealth",
                        icon: CloudyIcon,
                        canBeSilenced: true,
                        description: "Untargetable by attacks. Effect ends if hit by area damage.",
                        onReceiveAttack: {
                            removeEffect: true,
                        },
                        duration: 2,
                    },
                ],
            },
        },
        {
            ...lifeLink,
            disableDisplayIcon: true,
            canBeSilenced: false,
            type: EFFECT_TYPES.LIFE_LINK,
            class: EFFECT_CLASSES.BUFF,
            onDeath: {
                ...puppeteerRevive,
            },
            onFriendlyDeath: {
                ...puppeteerRevive,
                usableWhileDead: true,
            },
        },
        preventArmorDecay,
    ],
};

export const ghostlyPuppeteerR: Minion = {
    ...ghostlyPuppeteerL,
    image: HomecomingVictoryGlovesRImage,
};

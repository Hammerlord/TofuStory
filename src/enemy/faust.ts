import { lifeLink } from "./effect";
import {
    CursedDollImage,
    FaustImage,
    HomecomingVictoryGlovesImage,
    HomecomingVictoryGlovesRImage,
    MonkeyBananaImage,
    PoisonImage,
    RespawnTokenImage,
    WorkGlovesImage,
    ZombieMushroomTicketImage,
} from "../images";
import { CloudyIcon, SmilingImpIcon } from "../images/icons";
import { hardy, poison, stun } from "./../ability/Effects";
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
import { bananaPeelCard } from "./enemy";

export const faust: Minion = {
    name: "Faust",
    maxHP: 350,
    image: FaustImage,
    isBoss: true,
    damage: 5,
    attack: {
        name: "Throw Banana",
        image: MonkeyBananaImage,
        actions: [
            {
                type: ACTION_TYPES.RANGE_ATTACK,
                target: TARGET_TYPES.HOSTILE,
                icon: MonkeyBananaImage,
                damage: 5,
                animation: ANIMATION_TYPES.CAST,
                addCardsToDeck: [bananaPeelCard],
            },
        ],
    },
    abilities: [
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
                    animation: ANIMATION_TYPES.ONE_WAY_SIDEWINDER,
                    effects: [poison],
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
            icon: CursedDollImage,
            description: "Takes damage 3 when Ghostly Puppeteers are struck by an attack. Takes massive damage if both Puppeteers die.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            canBeSilenced: false,
            onFriendlyReceiveAttack: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                damage: 3,
            },
            onFriendlyDeath: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                damage: 100,
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
                    },
                ],
            },
        },
        {
            name: "Unnatural Regeneration",
            icon: ZombieMushroomTicketImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: true,
            onTurnStart: {
                healing: 5,
            },
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    comparator: "not",
                    hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE],
                },
            ],
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
            description: "When this effect ends, Ghostly Puppeteers will revive.",
            duration: 3,
            onEnd: {
                usableWhileStunned: true,
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
    maxHP: 100,
    effects: [
        {
            name: "Ghostly",
            description: "This character replenishes stealth every turn.",
            canBeSilenced: true,
            duration: Infinity,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: SmilingImpIcon,
            turnsTriggerFrequency: 1,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        type: EFFECT_TYPES.STEALTH,
                        class: EFFECT_CLASSES.BUFF,
                        name: "Stealth",
                        icon: CloudyIcon,
                        canBeSilenced: true,
                        description: "Untargetable by attacks. Effect ends if this character attacks or is hit by area damage.",
                        onReceiveAttack: {
                            removeEffect: true,
                        },
                        duration: 1,
                    },
                ],
            },
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                conditions: [
                    {
                        hasEffectType: [EFFECT_TYPES.STEALTH],
                        comparator: "not",
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    },
                ],
                effects: [
                    {
                        type: EFFECT_TYPES.STEALTH,
                        class: EFFECT_CLASSES.BUFF,
                        name: "Stealth",
                        icon: CloudyIcon,
                        canBeSilenced: true,
                        description: "Untargetable by attacks. Effect ends if this character attacks or is hit by area damage.",
                        onReceiveAttack: {
                            removeEffect: true,
                        },
                        duration: 1,
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
    ],
};

export const ghostlyPuppeteerR: Minion = {
    ...ghostlyPuppeteerL,
    image: HomecomingVictoryGlovesRImage,
};

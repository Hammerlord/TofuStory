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
    WeaponMasteryImage,
} from "../images";
import { CloudyIcon, HeartIcon, SmilingImpIcon } from "../images/icons";
import { attackPower, hardy, poison, preventArmorDecay, stun } from "./../ability/Effects";
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
    maxHP: 500,
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
    affectsDeadCharacters: true,
    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
    effects: [
        {
            name: "Reviving...",
            type: EFFECT_TYPES.LIFE_LINK,
            class: EFFECT_CLASSES.BUFF,
            icon: RespawnTokenImage,
            canBeSilenced: false,
            persistsWhenDead: true,
            description: "Revives when this effect ends.",
            duration: 3,
            maxApplications: 1,
            onEnd: {
                usableWhileStunned: true,
                usableWhileDead: true,
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                removeDebuffs: true,
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
                                armor: 60,
                            },
                            resurrect: true,
                        },
                    ],
                },
            },
            onFriendlyDeath: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                resetDuration: true,
                usableWhileStunned: true,
                usableWhileDead: true,
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
            description: "Heals Faust for 10 HP.",
            image: HeartIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.FRIENDLY_CHARACTER,
                    targetName: faust.name,
                    healing: 10,
                },
            ],
        },
        {
            name: "Ghostly Bolstering",
            description: "Grants +1 ATT to Faust.",
            image: WeaponMasteryImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.FRIENDLY_CHARACTER,
                    targetName: faust.name,
                    effects: [attackPower],
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
        },
        preventArmorDecay,
    ],
};

export const ghostlyPuppeteerR: Minion = {
    ...ghostlyPuppeteerL,
    image: HomecomingVictoryGlovesRImage,
    abilities: [
        {
            name: "Ghostly Bolstering",
            image: WeaponMasteryImage,
            description: "Grants +1 ATT to Faust.",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.FRIENDLY_CHARACTER,
                    targetName: faust.name,
                    effects: [attackPower],
                },
            ],
        },
        {
            name: "Ghostly Mending",
            image: HeartIcon,
            description: "Heals Faust for 10 HP.",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.FRIENDLY_CHARACTER,
                    targetName: faust.name,
                    healing: 10,
                },
            ],
        },
    ],
};

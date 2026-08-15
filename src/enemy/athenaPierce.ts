import { avenger, bleed, hardy } from "../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, Minion, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../ability/types";
import {
    AthenaAttackStanceImage,
    AvengersArrowImage,
    CoveringFireImage,
    FelineBerserkImage,
    GreyShieldImage,
    MortalBlowImage,
    SoaringHawkImage,
    StrafeImage,
    WolfImage,
} from "../images";
import { TornadoIcon } from "../images/icons";
import { taunt, vengeful } from "./../ability/Effects";
import { attack, shoot } from "./abilities";

const weakerAvenger = {
    ...avenger,
    onFriendlyDeath: {
        ...avenger.onFriendlyDeath,
        effects: [
            {
                ...vengeful,
                attackPower: 2,
            },
        ],
    },
};

export const guardWolf: Minion = {
    name: "Wolf",
    isBoss: true,
    maxHP: 100,
    mesos: 10,
    image: WolfImage,
    abilities: [
        attack,
        {
            name: "Protective Howl",
            description: "Dispels debuffs.",
            castTime: 1,
            resourceCost: 3,
            image: WolfImage,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    animation: ANIMATION_TYPES.SHOUT,
                    area: 2,
                    removeDebuffs: true,
                },
            ],
        },
        {
            name: "Taunting Howl",
            description: "Taunts for the next turn.",
            resourceCost: 3,
            image: GreyShieldImage,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    animation: ANIMATION_TYPES.SHOUT,
                    effects: [{ ...taunt, duration: 1 }],
                },
            ],
        },
    ],
    effects: [weakerAvenger],
};

export const athena: Minion = {
    name: "Athena Pierce",
    isBoss: true,
    maxHP: 250,
    mesos: 40,
    image: AthenaAttackStanceImage,
    resources: 0,
    abilities: [
        shoot,
        {
            name: "Multishot",
            description: "Damage dealt is split among targets.",
            image: CoveringFireImage,
            resourceCost: 0,
            actions: [
                {
                    damage: 5,
                    damageDividedByTargets: true,
                    area: 2,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    icon: AvengersArrowImage,
                    animationOptions: {
                        rotate: -45,
                        rotateToFaceTarget: true,
                    },
                },
            ],
        },
        {
            name: "Combined Assault",
            image: FelineBerserkImage,
            description: "Commands all allies to attack.",
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                    comparator: "gt",
                    numFriendly: 1,
                },
            ],
            actions: [
                {
                    area: 1,
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    induceCombatantAttack: true,
                    animation: ANIMATION_TYPES.SHOUT,
                },
            ],
        },
        {
            name: "Pierce",
            description: "Destroys the target's armor. If the target has no armor, deals 5 damage.",
            image: MortalBlowImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    icon: AvengersArrowImage,
                    destroyArmor: 1,
                    bonus: {
                        damage: 5,
                        conditions: [
                            {
                                calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                                armor: 0,
                                comparator: "eq",
                            },
                        ],
                    },
                    animationOptions: {
                        rotate: -45,
                        rotateToFaceTarget: true,
                    },
                },
            ],
        },
        {
            name: "Strafe",
            description: "Fire consecutive arrows x4.",
            image: StrafeImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.BEAM,
                    icon: AvengersArrowImage,
                    targetArea: 3,
                    animationOptions: {
                        rotate: -45,
                        rotateToFaceTarget: true,
                    },
                    damage: 2,
                },
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.BEAM,
                    icon: AvengersArrowImage,
                    targetArea: 3,
                    animationOptions: {
                        rotate: -45,
                        rotateToFaceTarget: true,
                    },
                    damage: 2,
                },
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.BEAM,
                    icon: AvengersArrowImage,
                    targetArea: 3,
                    animationOptions: {
                        rotate: -45,
                        rotateToFaceTarget: true,
                    },
                    damage: 2,
                },
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.BEAM,
                    icon: AvengersArrowImage,
                    targetArea: 3,
                    animationOptions: {
                        rotate: -45,
                        rotateToFaceTarget: true,
                    },
                    damage: 2,
                },
            ],
        },
    ],
    effects: [hardy],
};

export const guardHawk: Minion = {
    name: "Hawk",
    isBoss: true,
    maxHP: 100,
    mesos: 10,
    image: SoaringHawkImage,
    abilities: [
        attack,
        {
            name: "Cyclone",
            image: TornadoIcon,
            description: "Applies Bleed.",
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    area: 4,
                    icon: TornadoIcon,
                    animationOptions: {
                        width: 75,
                        height: 100,
                    },
                    effects: [
                        {
                            ...bleed,
                            stacks: 2,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [weakerAvenger],
};

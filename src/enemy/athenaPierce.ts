import { avenger, bleed, hardy } from "../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../ability/types";
import {
    AthenaAttackStanceImage,
    AvengersArrowImage,
    CallOfTheWildImage,
    CoveringFireImage,
    FelineBerserkImage,
    HurricaneImage,
    MortalBlowImage,
    SoaringHawkImage,
    VitalHunterImage,
    WolfImage,
} from "../images";
import { TornadoIcon } from "../images/icons";
import { attack, shoot } from "./abilities";

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
            description: "Grants 10 armor to allies and dispels negative status effects.",
            castTime: 1,
            resourceCost: 3,
            image: WolfImage,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    animation: ANIMATION_TYPES.SHOUT,
                    area: 2,
                    armor: 10,
                    removeDebuffs: true,
                },
            ],
        },
    ],
    effects: [
        {
            name: "Vital Hunter",
            description: "Immediately attacks summoned enemy minions.",
            icon: VitalHunterImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: true,
            lifeOnHit: 1,
            onHostileSummon: {
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                ability: {
                    name: "Bite",
                    actions: [
                        {
                            target: TARGET_TYPES.HOSTILE,
                            type: ACTION_TYPES.ATTACK,
                            damage: 3,
                        },
                    ],
                },
            },
        },
        avenger,
    ],
};

export const athena: Minion = {
    name: "Athena Pierce",
    isBoss: true,
    maxHP: 200,
    mesos: 40,
    image: AthenaAttackStanceImage,
    resources: 0,
    abilities: [
        shoot,
        {
            name: "Covering Fire",
            image: CoveringFireImage,
            resourceCost: 0,
            actions: [
                {
                    damage: 2,
                    area: 1,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    icon: AvengersArrowImage,
                    playbackTime: 400,
                    animationOptions: {
                        rotate: -45,
                    },
                },
                {
                    armor: 5,
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                },
            ],
        },
        {
            name: "Combined Assault",
            image: FelineBerserkImage,
            description: "Commands all targeted allies to attack",
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
            description: "Destroys the target's armor. If the target has no armor, deals 3 damage.",
            image: MortalBlowImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    playbackTime: 400,
                    icon: AvengersArrowImage,
                    destroyArmor: 1,
                    bonus: {
                        damage: 3,
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
                    },
                },
            ],
        },
        {
            name: "Hurricane",
            description: "Fire consecutive arrows x4.",
            image: HurricaneImage,
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
                    },
                    damage: 2,
                },
            ],
        },
    ],
    effects: [
        hardy,
        avenger,
        {
            name: "Companion Bond",
            duration: Infinity,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: CallOfTheWildImage,
            disableDisplayIcon: true,
            description: "Retaliating if an animal companion falls in combat.",
            onFriendlyDeath: {
                targetType: TRIGGER_TARGET_TYPES.ACTOR,
                ability: {
                    name: "Revenge",
                    image: AvengersArrowImage,
                    actions: [
                        {
                            type: ACTION_TYPES.RANGE_ATTACK,
                            target: TARGET_TYPES.HOSTILE,
                            icon: AvengersArrowImage,
                            playbackTime: 400,
                            damage: 1,
                            animationOptions: {
                                rotate: -45,
                            },
                        },
                    ],
                },
            },
        },
    ],
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
            description: "Blasts targets with a cyclone that deals 3 damage and applies a Bleed for 3 turns.",
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    damage: 3,
                    area: 4,
                    icon: TornadoIcon,
                    animationOptions: {
                        width: 75,
                        height: 100,
                    },
                    effects: [
                        {
                            ...bleed,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        avenger,
        /*{
            name: "Sharp Eyes",
            description: "This character can see through stealth.",
            icon: SharpEyesImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            truesight: true,
            canBeSilenced: true,
        },*/
    ],
};

import {
    DarkImpaleImage,
    DarkSpearImage,
    DarkThirstImage,
    EvilEyeMinionImage,
    EvilEyeShockImage,
    EvilEyeImage,
    GungnirImage,
    LordOfDarknessImage,
    NightShadeExplosionImage,
    PiercingDriveImage,
    SpearSweepImage,
} from "../../images";
import { HeartIcon } from "../../images/icons";
import { attackPower, silence, stealth, stun, wound } from "../Effects";
import {
    Ability,
    ACTION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MULTIPLIER_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../types";

export const evilEye: Ability = {
    name: "Evil Eye",
    resourceCost: 1,
    image: EvilEyeImage,
    description: "Heals a random ally for 2 each turn.",

    minion: {
        name: "Evil Eye",
        image: EvilEyeMinionImage,
        damage: 0,
        maxHP: 1,
        effects: [
            stealth,
            {
                name: "Evil Eye Heal",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                description: "Heals a random ally for 2 each turn.",
                onTurnStart: {
                    ability: {
                        name: "Heal",
                        actions: [
                            {
                                type: ACTION_TYPES.EFFECT,
                                target: TARGET_TYPES.RANDOM_FRIENDLY,
                                healing: 3,
                            },
                        ],
                    },
                },
                duration: Infinity,
                icon: HeartIcon,
            },
        ],
    },
    actions: [],
};

export const darkImpale: Ability = {
    name: "Dark Impale",
    resourceCost: 2,
    image: DarkImpaleImage,
    actions: [
        {
            damage: 5,
            secondaryDamage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    ...wound,
                    duration: 3,
                },
            ],
            area: 2,
        },
    ],
};

export const darkThirst: Ability = {
    name: "Dark Thirst",
    resourceCost: 1,
    image: DarkThirstImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Dark Thirst",
                    icon: DarkThirstImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 1,
                    lifeOnHit: 1,
                    lifeOnKill: 3,
                    duration: 2,
                },
                {
                    ...wound,
                    duration: 3,
                },
            ],
        },
    ],
};

export const darkSpear: Ability = {
    name: "Dark Spear",
    resourceCost: 3,
    image: DarkSpearImage,
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            effects: [{ ...silence }],
            bonus: {
                damage: 5,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        armor: 0,
                        comparator: "gt",
                    },
                ],
            },
        },
    ],
};

export const piercingDrive: Ability = {
    name: "Piercing Drive",
    resourceCost: 1,
    image: PiercingDriveImage,
    actions: [
        {
            area: 1,
            damage: 7,
            secondaryDamage: 5,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            bonus: {
                damage: 3,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        hasEffectType: [EFFECT_TYPES.STUN],
                    },
                ],
            },
        },
    ],
};

export const spearSweep: Ability = {
    name: "Spear Sweep",
    resourceCost: 2,
    image: SpearSweepImage,
    actions: [
        {
            area: 2,
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [stun],
        },
    ],
};

export const evilEyeShock: Ability = {
    name: "Evil Eye Shock",
    resourceCost: 0,
    image: EvilEyeShockImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            radiate: {
                area: 1,
                damage: 2,
                effects: [stun],
            },
            conditions: [
                {
                    calculationTarget: CONDITION_TARGETS.TARGET,
                    characterName: "Evil Eye",
                    comparator: "eq",
                },
            ],
        },
    ],
};

export const lordOfDarkness: Ability = {
    name: "Lord of Darkness",
    resourceCost: 2,
    image: LordOfDarknessImage,
    depletedOnUse: true,
    description: "Retaliation: gain +1 attack power for 5 turns",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Lord of Darkness",
                    icon: LordOfDarknessImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 1,
                    duration: 5,
                    lifeOnHit: 1,
                    onReceiveDamage: {
                        effects: [{ ...attackPower, duration: 5 }],
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    },
                },
            ],
        },
    ],
};

export const gungnir: Ability = {
    name: "Gungnir",
    resourceCost: 3,
    depletedOnUse: true,
    image: GungnirImage,
    description: "(Damage equal to 50% of your max HP)",
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            destroyArmor: 1,
            damage: 1,
            multiplier: {
                type: MULTIPLIER_TYPES.MAX_HP,
                value: 0.5,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
};

export const nightshadeExplosion: Ability = {
    name: "Nightshade Explosion",
    resourceCost: 1,
    image: NightShadeExplosionImage,
    actions: [
        {
            damage: 5,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            resources: 2,
            radiate: {
                area: 2,
                damage: 5,
            },
        },
    ],
};

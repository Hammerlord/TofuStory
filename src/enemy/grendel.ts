import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    Action,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import {
    ElquinesImage,
    EncroachingDarknessImage,
    EnergyBoltProjectileImage,
    FireMarbleImage,
    GrendelIdleImage,
    IfritImage,
    MagicArmorImage,
    MagicClawImage,
    MagicClawProjectileImage,
    NimbleJewelCImage,
    NimbleJewelImage,
    OldEnergyBoltImage,
    TeleportImage,
    TriboltImage,
    WeaponBoosterImage,
} from "../images";
import { VolcanoIcon } from "../images/icons";
import { burn, hardy, raging } from "./../ability/Effects";
import { tribolt } from "./../ability/magician/magicianAbilities";
import { lifeLink } from "./effect";

export const grendelIfrit: Minion = {
    name: "Ifrit",
    image: IfritImage,
    HP: 100,
    maxHP: 100,
    abilities: [
        {
            name: "Ember",
            image: FireMarbleImage,
            actions: [
                {
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.EFFECT,
                    icon: FireMarbleImage,
                    effects: [
                        {
                            ...burn,
                            duration: 1,
                        },
                    ],
                },
            ],
        },
        {
            name: "Fiery Slam",
            image: IfritImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                    damage: 3,
                    animationOptions: {
                        flash: 200,
                    },
                    effects: [
                        {
                            ...burn,
                            duration: 1,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [lifeLink, raging],
};

export const grendelElquines: Minion = {
    name: "Elquines",
    image: ElquinesImage,
    HP: 100,
    maxHP: 100,
    abilities: [
        {
            name: "Ice Bolt",
            image: NimbleJewelImage,
            actions: [
                {
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    icon: NimbleJewelImage,
                    damage: 3,
                },
            ],
        },
    ],
    effects: [lifeLink, raging],
};

const iceAge: Ability = {
    name: "Ice Age",
    resourceCost: 3,
    castTime: 1,
    image: NimbleJewelCImage,
    actions: [
        {
            damage: 25,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            icon: NimbleJewelCImage,
            animationOptions: {
                rotateToFaceTarget: true,
                width: 208,
                height: 216,
            },
        },
    ],
};

export const grendelVolcano: Minion = {
    name: "Volcano",
    maxHP: 30,
    image: VolcanoIcon,
    abilities: [],
    effects: [
        {
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            name: "Erupting",
            icon: VolcanoIcon,
            description: "Erupting for 5 damage when this effect expires. Stunning, freezing or silencing the Volcano will destroy it.",
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
                            damage: 5,
                        },
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            damage: 100,
                        },
                    ],
                },
            },
            onReceiveEffect: {
                usableWhileStunned: true,
                damage: 100,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE, EFFECT_TYPES.SILENCE],
                        comparator: "eq",
                    },
                ],
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            },
            onDeath: {
                usableWhileStunned: true,
                removeEffect: true,
            },
        },
    ],
};

const volcanicBurst: Ability = {
    name: "Raise Volcano",
    image: VolcanoIcon,
    resourceCost: 3,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            summon: [
                {
                    minion: [grendelVolcano],
                },
                {
                    minion: [grendelVolcano],
                },
                {
                    minion: [grendelVolcano],
                },
                {
                    minion: [grendelVolcano],
                },
            ],
        },
    ],
};

const stormBarrier: Ability = {
    name: "Storm Barrier",
    resourceCost: 3,
    image: MagicArmorImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            icon: MagicArmorImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            armor: 100,
            effects: [
                {
                    name: "Storm Barrier",
                    description: "Pulsating increasing damage until armor is broken.",
                    icon: MagicArmorImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    canBeSilenced: false,
                    preventArmorDecay: true,
                    preventTurnAction: true,
                    resourcesPerTurn: -3,
                    onTurnStart: {
                        ability: {
                            name: "Storm Pulse",
                            image: MagicArmorImage,
                            actions: [
                                {
                                    target: TARGET_TYPES.HOSTILE,
                                    type: ACTION_TYPES.RANGE_ATTACK,
                                    damage: 3,
                                    area: 5,
                                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                                    icon: EncroachingDarknessImage,
                                },
                                {
                                    target: TARGET_TYPES.SELF,
                                    type: ACTION_TYPES.EFFECT,
                                    effects: [
                                        {
                                            name: "Electrified",
                                            icon: WeaponBoosterImage,
                                            type: EFFECT_TYPES.NONE,
                                            class: EFFECT_CLASSES.BUFF,
                                            attackPower: 2,
                                            onReceiveDamage: {
                                                conditions: [
                                                    {
                                                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                                        armor: 0,
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
                    onReceiveDamage: {
                        conditions: [
                            {
                                calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                armor: 0,
                                comparator: "eq",
                            },
                        ],
                        removeEffect: true,
                    },
                },
            ],
        },
    ],
};

const grendelMagicClaw: Ability = {
    name: "Magic Claw",
    resourceCost: 0,
    image: MagicClawImage,
    description: "Hits twice",
    level: 2,
    actions: [
        {
            damage: 3,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            animationOptions: {
                rotateToFaceTarget: false,
                width: 100,
                height: 100,
            },
            icon: MagicClawProjectileImage,
            playbackTime: 400,
            bonus: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
                damage: 2,
            },
        },
        {
            damage: 3,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            animationOptions: {
                rotateToFaceTarget: false,
                width: 100,
                height: 100,
                mirrorX: true,
            },
            icon: MagicClawProjectileImage,
            playbackTime: 400,
            bonus: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: "Charged",
                    },
                ],
                damage: 2,
            },
        },
    ],
};

export const introGrendel: Minion = {
    HP: 350,
    maxHP: 350,
    name: "Grendel the Really Old",
    image: GrendelIdleImage,
    abilities: [
        {
            name: "Energy Bolt",
            image: OldEnergyBoltImage,
            resourceCost: 0,
            actions: [
                {
                    damage: 3,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    icon: EnergyBoltProjectileImage,
                    playbackTime: 400,
                    animationOptions: {
                        rotate: 135,
                        rotateToFaceTarget: true,
                    },
                },
            ],
        },
    ],
    effects: [
        {
            name: "Immunity",
            type: EFFECT_TYPES.IMMUNITY,
            class: EFFECT_CLASSES.BUFF,
        },
        {
            name: "Summon Elementals",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                ability: {
                    name: "Elemental Summon: Ifrit",
                    image: IfritImage,
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.EFFECT,
                            summon: [{ minion: [grendelIfrit], positionIndex: 1 }],
                        },
                    ],
                },
                removeEffect: true,
            },
        },
        {
            name: "Summon Elementals",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                ability: {
                    name: "Elemental Summon: Elquines",
                    image: ElquinesImage,
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.EFFECT,
                            summon: [{ minion: [grendelElquines], positionIndex: 3 }],
                        },
                    ],
                },
                removeEffect: true,
            },
        },
        {
            name: "Retreat",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                ability: {
                    name: "Retreat",
                    image: TeleportImage,
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.NONE,
                            retreat: true,
                            animationOptions: {
                                fadeOut: true, // TODO does nothing on combatant portraits
                            },
                        },
                    ],
                },
                removeEffect: true,
            },
        },
    ],
};

const triboltAction: Action = {
    damage: 3,
    target: TARGET_TYPES.RANDOM_HOSTILE,
    type: ACTION_TYPES.RANGE_ATTACK,
    animation: ANIMATION_TYPES.ONE_WAY,
    icon: EnergyBoltProjectileImage,
    playbackTime: 400,
    animationOptions: {
        rotate: 135,
        rotateToFaceTarget: true,
    },
    targetArea: 1,
};

const grendelTribolt = {
    name: "Tribolt",
    image: TriboltImage,
    description: "Randomly hits the target or its neighbors, x3",
    actions: [triboltAction, triboltAction, triboltAction],
};

export const grendel: Minion = {
    HP: 350,
    maxHP: 350,
    name: "Grendel the Really Old",
    image: GrendelIdleImage,
    abilities: [
        {
            name: "Energy Bolt",
            image: OldEnergyBoltImage,
            resourceCost: 0,
            actions: [
                {
                    damage: 5,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    icon: EnergyBoltProjectileImage,
                    playbackTime: 400,
                    animationOptions: {
                        rotate: 135,
                        rotateToFaceTarget: true,
                    },
                },
            ],
        },
        grendelMagicClaw,
        grendelTribolt,
        volcanicBurst,
        stormBarrier,
        iceAge,
    ],
    effects: [
        hardy,
        {
            name: "",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onWaveStart: {
                ability: {
                    name: "",
                    dialog: "Disappointing.",
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.NONE,
                        },
                    ],
                },
                removeEffect: true,
            },
        },
    ],
};

import {
    AxeStumpImage,
    BlueSnailImage,
    BlueSnailShellImage,
    FireBoarImage,
    FirewoodImage,
    GreenMushroomImage,
    HornyMushroomImage,
    LeetSinImage,
    LigatorImage,
    ManoImage,
    MushroomOmokImage,
    MushroomSporeImage,
    MutantSnailImage,
    NoobClubAImage,
    NoobClubBImage,
    NoobWarriorAImage,
    NoobWarriorBImage,
    OctopusImage,
    OctopusLegImage,
    OlafImage,
    OrangeMushroomImage,
    PigIdleImage,
    PigsHeadImage,
    RedSnailImage,
    RedSnailShellImage,
    ShroomImage,
    SnailImage,
    SnailShellImage,
    StolenFenceImage,
    StumpImage,
    SubiImage,
    WeaponMasteryImage,
    WildBoarImage,
} from "../images";
import { AngerIcon } from "../images/icons";
import { burn, elite, hardy, poison, raging, stealth, stun, thorns, wound } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    SCALING_VALUE_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { block, slashBlast } from "./../ability/warrior/warriorAbilities";
import { enemyHaste, loaf } from "./abilities";

export const snail: Minion = {
    name: "Snail",
    maxHP: 13,
    abilities: [loaf],
    image: SnailImage,
    damage: 1,
    mesos: 3,
};

export const blueSnail: Minion = {
    name: "Blue Snail",
    maxHP: 7,
    armor: 20,
    image: BlueSnailImage,
    damage: 2,
    mesos: 5,
    effects: [
        {
            name: "Tough Shell",
            icon: BlueSnailShellImage,
            preventArmorDecay: true,
            canBeSilenced: true,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            description: "Prevents armor decay.",
            duration: 5,
        },
    ],
};

export const shroom: Minion = {
    name: "Shroom",
    maxHP: 21,
    image: ShroomImage,
    damage: 2,
    mesos: 5,
    abilities: [
        {
            name: "Poison Spore",
            image: MushroomSporeImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: MushroomSporeImage,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    damage: 1,
                    effects: [
                        {
                            ...poison,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
};

export const redSnail: Minion = {
    name: "Red Snail",
    maxHP: 17,
    armor: 32,
    image: RedSnailImage,
    damage: 2,
    mesos: 15,
    abilities: [
        {
            name: "Rollout",
            channelDuration: 2,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                    animation: ANIMATION_TYPES.YOYO,
                    playbackTime: 600,
                },
            ],
        },
    ],
    effects: [
        {
            name: "Weighted Shell",
            icon: RedSnailShellImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            duration: 5,
            preventArmorDecay: true,
            canBeSilenced: true,
            description: "Prevents armor decay. While this character has armor, its damage is increased.",
            attackPower: 1,
            conditions: [
                {
                    comparator: "gt",
                    armor: 0,
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                },
            ],
        },
    ],
};

export const pig: Minion = {
    name: "Pig",
    maxHP: 55,
    image: PigIdleImage,
    mesos: 15,
    damage: 2,
    abilities: [
        {
            name: "Headlong Rush",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                },
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [
                        {
                            ...stun,
                            name: "Dazed",
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        {
            name: "Pig-Headed",
            description: "While stunned:",
            icon: PigsHeadImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackDamageReceived: 2,
            conditions: [
                {
                    hasEffectType: [EFFECT_TYPES.STUN],
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                },
            ],
        },
    ],
};

export const orangeMushroom: Minion = {
    name: "Orange Mushroom",
    maxHP: 65,
    image: OrangeMushroomImage,
    damage: 3,
    mesos: 25,
    effects: [hardy],
    abilities: [
        {
            name: "Whomp",
            image: MushroomOmokImage,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    area: 1,
                    secondaryDamage: 3,
                    effects: [
                        {
                            name: "Flattened",
                            description: "Receiving increased damage from Whomp.",
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.DEBUFF,
                            abilityDamageReceived: [
                                {
                                    abilityName: "Whomp",
                                    damage: 2,
                                    type: SCALING_VALUE_TYPES.FLAT,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

export const noobA: Minion = {
    name: "Beginner A",
    maxHP: 50,
    image: NoobClubAImage,
    damage: 2,
    mesos: 1,
    abilities: [
        {
            name: "Club!",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                },
            ],
        },
        {
            name: "Block",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 5,
                },
            ],
        },
    ],
};

export const noobB: Minion = {
    name: "Beginner B",
    maxHP: 50,
    image: NoobClubBImage,
    damage: 2,
    mesos: 1,
    abilities: [
        {
            name: "Flurry",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
            ],
        },
        {
            name: "Potion",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    healing: 5,
                },
            ],
        },
    ],
};

export const noobAWarrior = {
    name: "Beginner A",
    maxHP: 40,
    image: NoobWarriorAImage,
    damage: 3,
    mesos: 1,
    abilities: [
        {
            ...slashBlast,
            resourceCost: 0,
        },
        {
            ...block,
            resourceCost: 0,
        },
    ],
};

export const noobBWarrior = {
    name: "Beginner B",
    maxHP: 40,
    image: NoobWarriorBImage,
    damage: 3,
    mesos: 1,
    abilities: [
        {
            ...slashBlast,
            resourceCost: 0,
        },
        {
            ...block,
            resourceCost: 0,
        },
    ],
};

export const thiefAssassin: Minion = {
    name: "XxLeetSinxX",
    maxHP: 40,
    image: LeetSinImage,
    damage: 2,
    attack: {
        name: "Attack",
        actions: [
            {
                type: ACTION_TYPES.RANGE_ATTACK,
                target: TARGET_TYPES.HOSTILE,
                animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                damage: 2,
                icon: SubiImage,
            },
        ],
    },
    abilities: [
        {
            name: "Dark Sight",
            resourceCost: 2,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [
                        {
                            ...stealth,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
        {
            name: "Lucky Seven",
            resourceCost: 2,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    damage: 0,
                    icon: SubiImage,
                },
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    damage: 0,
                    icon: SubiImage,
                },
            ],
        },
        enemyHaste,
        {
            name: "Potion",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    healing: 5,
                },
            ],
        },
    ],
};

export const olaf = {
    name: "Olaf",
    maxHP: 55,
    effects: [elite],
    mesos: 10,
    abilities: [
        {
            name: "Double Punch",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
            ],
        },
    ],
    damage: 2,
    image: OlafImage,
};

export const octopus: Minion = {
    name: "Octopus",
    image: OctopusImage,
    maxHP: 40,
    mesos: 10,
    damage: 3,
    abilities: [
        {
            name: "Constrict",
            resourceCost: 3,
            image: OctopusLegImage,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                    effects: [
                        {
                            name: "Constricted!",
                            description: "Resources per turn reduced by 1.",
                            icon: OctopusLegImage,
                            resourcesPerTurn: -1,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.DEBUFF,
                            duration: 1,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        {
            name: "Tentacular",
            description: "Recovering 1 life on hit.",
            icon: OctopusLegImage,
            lifeOnHit: 1,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
        },
    ],
};

export const wildBoar: Minion = {
    name: "Wild Boar",
    image: WildBoarImage,
    maxHP: 50,
    mesos: 10,
    damage: 3,
    abilities: [
        {
            name: "Wild Charge",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 7,
                },
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [
                        {
                            ...stun,
                            name: "Dazed",
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        {
            name: "Pig-Headed",
            description: "While stunned:",
            icon: PigsHeadImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackDamageReceived: 2,
            conditions: [
                {
                    hasEffectType: [EFFECT_TYPES.STUN],
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                },
            ],
        },
    ],
};

export const stump: Minion = {
    name: "Stump",
    image: StumpImage,
    maxHP: 30,
    mesos: 5,
    damage: 2,
    effects: [
        {
            name: "Hardwood",
            description: "When this character is attacked, its damage received from attacks is reduced by 1.",
            icon: FirewoodImage,
            attackDamageReceived: -1,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveAttack: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Hardwood Barricade",
                        icon: StolenFenceImage,
                        attackDamageReceived: -1,
                        duration: 1,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                    },
                ],
            },
        },
    ],
};

export const axeStump: Minion = {
    name: "Axe Stump",
    image: AxeStumpImage,
    maxHP: 45,
    armor: 15,
    damage: 2,
    mesos: 25,
    abilities: [
        {
            name: "Barbs",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 15,
                    effects: [
                        {
                            ...thorns,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        {
            name: "Hardwood",
            description: "When this character is attacked, its damage received from attacks is reduced by 1.",
            icon: FirewoodImage,
            attackDamageReceived: -1,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveAttack: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Hardwood Barricade",
                        icon: StolenFenceImage,
                        attackDamageReceived: -1,
                        duration: 1,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                    },
                ],
            },
        },
    ],
};

export const fireBoar: Minion = {
    name: "Fire Boar",
    image: FireBoarImage,
    maxHP: 80,
    mesos: 25,
    damage: 4,
    abilities: [
        {
            name: "Blazing Charge",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 7,
                    effects: [{ ...burn, duration: 1 }],
                },
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [
                        {
                            ...stun,
                            name: "Dazed",
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        hardy,
        {
            name: "Pig-Headed",
            description: "While stunned:",
            icon: PigsHeadImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackDamageReceived: 2,
            conditions: [
                {
                    hasEffectType: [EFFECT_TYPES.STUN],
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                },
            ],
        },
    ],
};

export const ligator: Minion = {
    name: "Ligator",
    image: LigatorImage,
    maxHP: 30,
    damage: 2,
    mesos: 10,
    abilities: [
        {
            name: "Chomp",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 1,
                    effects: [
                        {
                            ...wound,
                            duration: 1,
                        },
                    ],
                },
            ],
        },
    ],
};

export const eliteLigator: Minion = {
    name: "Ligator",
    image: LigatorImage,
    maxHP: 60,
    mesos: 25,
    damage: 2,
    effects: [elite, raging],
    abilities: [
        {
            name: "Chomp",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 1,
                    effects: [
                        {
                            ...wound,
                            duration: 1,
                        },
                    ],
                },
            ],
        },
    ],
};

export const greenMushroom: Minion = {
    name: "Green Mushroom",
    image: GreenMushroomImage,
    maxHP: 25,
    damage: 1,
    mesos: 5,
    abilities: [
        {
            name: "Poison Spore",
            image: MushroomSporeImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: MushroomSporeImage,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    damage: 1,
                    effects: [
                        {
                            ...poison,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
};

export const hornyMushroom: Minion = {
    name: "Horny Mushroom",
    image: HornyMushroomImage,
    maxHP: 30,
    damage: 2,
    effects: [thorns],
    mesos: 7,
};

export const mutantSnailEnemy: Minion = {
    name: "Mutant Snail",
    image: MutantSnailImage,
    isBoss: true,
    maxHP: 100,
    armor: 75,
    resources: 0,
    damage: 5,
    mesos: 100,
    effects: [
        {
            name: "Tough Shell",
            icon: BlueSnailShellImage,
            preventArmorDecay: true,
            canBeSilenced: true,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            description: "Prevents armor decay.",
            duration: 5,
        },
        {
            ...hardy,
            name: "Tyrant Shell",
            icon: SnailShellImage,
            description: "After being stunned or frozen, gains temporary immunity to those effects. \n Periodically summoning Snails.",
            canBeSilenced: false,
        },
    ],
    abilities: [
        {
            name: "Call Snail",
            image: SnailImage,
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [snail] }, { minion: [snail] }],
                },
            ],
        },
        {
            name: "Call Snail",
            image: BlueSnailImage,
            minion: blueSnail,
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                },
            ],
        },
        {
            name: "Whip",
            resourceCost: 1,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    area: 2,
                    excludePrimaryTarget: true,
                    damage: 3,
                    effects: [
                        {
                            name: "Whipped",
                            description: "Whipped into a frenzy!",
                            icon: WeaponMasteryImage,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.BUFF,
                            attackPower: 1,
                        },
                    ],
                },
            ],
        },
        {
            name: "Frenzied Tantrum",
            description: "{{ caster }} will tantrum, dealing 3 hits per move.",
            resourceCost: 3,
            channelDuration: 2,
            castTime: 1,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    effects: [
                        {
                            name: "Frenzy",
                            description: "Entering a frenzy!",
                            icon: WeaponMasteryImage,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.BUFF,
                            attackPower: 1,
                            duration: 2,
                        },
                    ],
                },
                {
                    damage: 2,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
                {
                    damage: 2,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
                {
                    damage: 2,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
            ],
        },
    ],
};

export const manoEnemy: Minion = {
    name: "Mano",
    image: ManoImage,
    isBoss: true,
    maxHP: 75,
    armor: 100,
    resources: 0,
    damage: 3,
    mesos: 100,
    abilities: [
        {
            name: "Call Snail",
            image: SnailImage,
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [snail] }, { minion: [snail] }],
                },
            ],
        },
        {
            name: "Call Snail",
            image: BlueSnailImage,
            minion: blueSnail,
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                },
            ],
        },
        {
            name: "Withdraw",
            channelDuration: 2,
            resourceCost: 3,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    armor: 10,
                    effects: [
                        {
                            ...thorns,
                            duration: 1,
                        },
                    ],
                },
            ],
        },
        {
            name: "Rollout",
            castTime: 1,
            channelDuration: 3,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.YOYO,
                    playbackTime: 600,
                    damage: 7,
                },
            ],
        },
    ],
    effects: [
        {
            ...hardy,
            name: "Senior Shell",
            icon: SnailShellImage,
            description: "After being stunned or frozen, gains temporary immunity to those effects. \n Periodically summoning Snails.",
            canBeSilenced: false,
        },
        {
            name: "Tough Shell",
            icon: BlueSnailShellImage,
            preventArmorDecay: true,
            canBeSilenced: true,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            description: "Prevents armor decay.",
            duration: 10,
        },
        {
            name: "Weighted Shell",
            icon: RedSnailShellImage,
            canBeSilenced: false,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            description: "While this character has armor, its damage is increased.",
            attackPower: 1,
            skillBonus: [
                {
                    skill: "Rollout",
                    damage: 3,
                },
            ],
            conditions: [
                {
                    comparator: "gt",
                    armor: 0,
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                },
            ],
        },
    ],
};

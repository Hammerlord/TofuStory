import {
    AxeStumpImage,
    BananaPeelImage,
    BlueSnailImage,
    BlueSnailShellImage,
    CurseEyeImage,
    FireBoarImage,
    GreenMushroomImage,
    HornyMushroomImage,
    LeetSinImage,
    LigatorImage,
    LupinImage,
    ManoImage,
    MonkeyBananaImage,
    MushroomOmokImage,
    MushroomSporeImage,
    MutantSnailImage,
    NoobClubAImage,
    NoobClubBImage,
    NoobWarriorAImage,
    NoobWarriorBImage,
    OctopusIdleImage,
    OctopusLegImage,
    OlafImage,
    OmokPigImage,
    OrangeMushroomIdleImage,
    PigIdleImage,
    PigsHeadImage,
    RedFistOfFuryImage,
    RedSnailImage,
    RedSnailShellImage,
    RedWhipImage,
    RibbonPigIdleImage,
    ShroomImage,
    SlimeIdleImage,
    SnailImage,
    SnailShellImage,
    SquishyLiquidImage,
    StumpImage,
    SubiImage,
    WeaponMasteryImage,
    WildBoarImage,
    WoodenClubImage,
} from "../images";
import { CrossedSwordsIcon, DizzyIcon, EyeIcon, MuscleIcon, ZzzIcon } from "../images/icons";
import { redPotion } from "../item/items";
import { burn, elite, hardy, poison, raging, stealth, stun, thorns, wound } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MORPH_TYPES,
    MULTIPLIER_TYPES,
    Minion,
    SCALING_VALUE_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { block, slashBlast } from "./../ability/warrior/warriorAbilities";
import { enemyHaste, loaf } from "./abilities";
import { championsRibbon, hardwood } from "./effect";

export const snail: Minion = {
    name: "Snail",
    maxHP: 10,
    abilities: [loaf],
    image: SnailImage,
    damage: 1,
    mesos: 3,
};

export const blueSnail: Minion = {
    name: "Blue Snail",
    maxHP: 3,
    armor: 9,
    image: BlueSnailImage,
    abilities: [loaf],
    damage: 1,
    mesos: 4,
    effects: [
        {
            name: "Tough Shell",
            icon: BlueSnailShellImage,
            preventArmorDecay: true,
            canBeSilenced: true,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            description: "Prevents armor decay.",
        },
    ],
};

export const shroom: Minion = {
    name: "Shroom",
    maxHP: 12,
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
                    damage: 0,
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
    maxHP: 5,
    armor: 14,
    image: RedSnailImage,
    damage: 1,
    mesos: 5,
    abilities: [
        {
            name: "Rollout",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                    animation: ANIMATION_TYPES.YOYO,
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

export const slime: Minion = {
    name: "Slime",
    maxHP: 16,
    armor: 12,
    image: SlimeIdleImage,
    damage: 3,
    mesos: 15,
    effects: [
        {
            name: "Thick Slime",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackDamageReceived: -2,
            icon: SquishyLiquidImage,
            description: "Prevents armor decay. While this character has armor:",
            preventArmorDecay: true,
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
    maxHP: 40,
    image: PigIdleImage,
    mesos: 15,
    damage: 2,
    abilities: [
        {
            name: "Headlong Rush",
            image: OmokPigImage,
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

export const ribbonPig: Minion = {
    maxHP: 60,
    name: "Ribbon Pig",
    image: RibbonPigIdleImage,
    damage: 3,
    mesos: 25,
    abilities: [
        {
            name: "Headlong Rush",
            image: OmokPigImage,
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
        championsRibbon,
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
    maxHP: 55,
    image: OrangeMushroomIdleImage,
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
                            icon: MushroomOmokImage,
                            duration: 6,
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
    maxHP: 40,
    image: NoobClubAImage,
    damage: 2,
    mesos: 1,
    items: [{ ...redPotion, healing: 10 }],
    abilities: [
        {
            name: "Club!",
            image: WoodenClubImage,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 4,
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
    maxHP: 40,
    image: NoobClubBImage,
    damage: 2,
    mesos: 1,
    items: [{ ...redPotion, healing: 10 }],
    abilities: [
        {
            name: "Flurry",
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
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
    maxHP: 75,
    image: LeetSinImage,
    damage: 2,
    items: [
        { ...redPotion, healing: 10 },
        { ...redPotion, healing: 10 },
    ],
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
                    damage: 3,
                    icon: SubiImage,
                },
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    damage: 3,
                    icon: SubiImage,
                },
            ],
        },
        {
            ...enemyHaste,
            dialog: "I am speed.",
        },
    ],
};

export const olaf: Minion = {
    name: "Olaf",
    maxHP: 50,
    isElite: true,
    effects: [elite],
    mesos: 10,
    abilities: [
        {
            name: "Flexin'",
            image: MuscleIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    icon: MuscleIcon,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    effects: [
                        {
                            name: "Flex",
                            type: EFFECT_TYPES.RAGE,
                            class: EFFECT_CLASSES.BUFF,
                            icon: WeaponMasteryImage,
                            attackPower: 1,
                        },
                    ],
                },
            ],
        },
        {
            name: "Double Punch",
            image: RedFistOfFuryImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 1,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 1,
                },
            ],
        },
    ],
    damage: 1,
    image: OlafImage,
};

export const octopus: Minion = {
    name: "Octopus",
    image: OctopusIdleImage,
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
            description: "Recovering 3 life on hit.",
            icon: OctopusLegImage,
            lifeOnHit: 3,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: true,
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
    effects: [hardwood],
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
    effects: [hardwood],
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
    maxHP: 25,
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
                    damage: 2,
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
    maxHP: 45,
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
                    damage: 2,
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
    maxHP: 20,
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
    maxHP: 25,
    damage: 2,
    effects: [thorns],
    mesos: 7,
};

export const elliniaGreenMushroom: Minion = {
    name: "Green Mushroom",
    image: GreenMushroomImage,
    maxHP: 40,
    damage: 2,
    mesos: 10,
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

export const elliniaHornyMushroom: Minion = {
    name: "Horny Mushroom",
    image: HornyMushroomImage,
    maxHP: 45,
    damage: 3,
    effects: [thorns],
    mesos: 10,
};

export const mutantSnailEnemy: Minion = {
    name: "Mutant Snail",
    image: MutantSnailImage,
    isBoss: true,
    maxHP: 75,
    armor: 75,
    damage: 3,
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
                    summon: [{ minion: [snail, blueSnail] }, { minion: [snail, blueSnail] }],
                },
            ],
        },
        {
            name: "Whip",
            resourceCost: 1,
            image: RedWhipImage,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    area: 2,
                    excludePrimaryTarget: true,
                    damage: 3,
                    icon: RedWhipImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
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
        {
            name: "Mutate",
            resourceCost: 3,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    excludePrimaryTarget: true,
                    area: 2,
                    morph: {
                        type: MORPH_TYPES.MAP,
                        minions: [
                            {
                                conditions: [
                                    {
                                        name: "Blue Snail",
                                        comparator: "eq",
                                        calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                                    },
                                ],
                                minion: redSnail,
                            },
                            {
                                conditions: [
                                    {
                                        name: "Snail",
                                        comparator: "eq",
                                        calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                                    },
                                ],
                                minion: blueSnail,
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

export const manoEnemy: Minion = {
    name: "Mano",
    image: ManoImage,
    isBoss: true,
    maxHP: 50,
    armor: 100,
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
                    summon: [{ minion: [snail, blueSnail] }, { minion: [snail, blueSnail] }],
                },
            ],
        },
        {
            name: "Call Snail",
            image: RedSnailImage,
            minion: redSnail,
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

export const curseEye: Minion = {
    name: "Curse Eye",
    maxHP: 80,
    image: CurseEyeImage,
    damage: 2,
    attack: {
        name: "Attack",
        image: CrossedSwordsIcon,
        actions: [
            {
                type: ACTION_TYPES.ATTACK,
                target: TARGET_TYPES.HOSTILE,
                damage: 2,
                bonus: {
                    damage: 1,
                    conditions: [
                        {
                            calculationTarget: CONDITION_TARGETS.TARGET,
                            hasEffectClass: EFFECT_CLASSES.DEBUFF,
                        },
                    ],
                    multiplier: {
                        type: MULTIPLIER_TYPES.DEBUFFS,
                        calculationTarget: CONDITION_TARGETS.TARGET,
                    },
                },
            },
        ],
    },
    abilities: [
        {
            name: "Eye Beam",
            resourceCost: 3,
            castTime: 1,
            image: EyeIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    icon: EyeIcon,
                    animation: ANIMATION_TYPES.BEAM,
                    effects: [
                        {
                            name: "Dazed",
                            icon: DizzyIcon,
                            image: DizzyIcon,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.DEBUFF,
                            drawCardsPerTurn: -1,
                            duration: 1,
                        },
                        {
                            name: "Weakened",
                            icon: ZzzIcon,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.DEBUFF,
                            attackPower: -1,
                            duration: 2,
                        },
                        {
                            name: "Vulnerable",
                            icon: EyeIcon,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.DEBUFF,
                            armorReceived: -1,
                            duration: 3,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        {
            name: "Predatory",
            icon: EyeIcon,
            description: "Deals extra damage against targets suffering from status ailments.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
        },
    ],
};

export const snailFriend: Minion = {
    name: "Snail Friend",
    maxHP: 10,
    image: SnailImage,
    damage: 1,
    effects: [
        {
            name: "Summon Friend",
            description: "The first time this character survives damage, it summons a snail.",
            icon: SnailShellImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveDamage: {
                removeEffect: true,
                ability: {
                    name: "Get in here!",
                    image: SnailImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            summon: [{ minion: ["Snail Friend"] }],
                        },
                    ],
                },
            },
        },
    ],
};

export const bob: Minion = {
    name: "Bob",
    maxHP: 30,
    image: SnailImage,
    damage: 3,
    effects: [
        {
            name: "Summon Friend",
            description: "When this character survives damage, it summons a snail.",
            icon: SnailShellImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveDamage: {
                ability: {
                    name: "Get in here!",
                    image: SnailImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            summon: [{ minion: ["Snail Friend"] }],
                        },
                    ],
                },
            },
        },
    ],
};

export const bananaPeelCard = {
    name: "Banana Peel",
    image: BananaPeelImage,
    depletedOnUse: true,
    resourceCost: 0,
    actions: [
        {
            type: ACTION_TYPES.HINDER,
            target: TARGET_TYPES.SELF,
            damage: 1,
            animation: ANIMATION_TYPES.SPIN,
        },
    ],
};

export const lupin: Minion = {
    name: "Lupin",
    maxHP: 70,
    image: LupinImage,
    damage: 3,
    abilities: [
        {
            name: "Throw Banana",
            image: MonkeyBananaImage,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: MonkeyBananaImage,
                    damage: 3,
                    animation: ANIMATION_TYPES.CAST,
                    addCardsToDeck: [bananaPeelCard],
                },
            ],
        },
    ],
};

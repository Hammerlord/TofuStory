import {
    AxeStumpImage,
    BananaPeelImage,
    BlackManualImage,
    BlueSnailImage,
    BombImage,
    CurseEyeImage,
    DarkSightImage,
    DarkStoneGolemImage,
    DarkStoneGolemRubbleImage,
    FireBoarImage,
    GreenMushroomImage,
    HornyMushroomImage,
    InkSackImage,
    KumbiImage,
    LeetSinImage,
    LigatorImage,
    LupinImage,
    MaladyImage,
    MonkeyBananaImage,
    MushroomOmokImage,
    MushroomSporeImage,
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
    RibbonPigIdleImage,
    ShroomImage,
    SlimeIdleImage,
    SnailImage,
    SnailShellImage,
    StumpImage,
    SubiImage,
    WeaponMasteryImage,
    WildBoarImage,
    WoodenClubImage,
    ZombieLupinJumpImage,
} from "../images";
import {
    BloodIcon,
    CactusIcon,
    CrossedSwordsIcon,
    DizzyIcon,
    EyeIcon,
    MountainIcon,
    MuscleIcon,
    ShieldIcon,
    ZzzIcon,
} from "../images/icons";
import { redPotion } from "../item/items";
import { bleed, burn, elite, hardy, poison, raging, stealth, stun, thorns, pristineDefense } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MULTIPLIER_TYPES,
    Minion,
    SCALING_VALUE_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { bash, block, slashBlast } from "./../ability/warrior/warriorAbilities";
import { attack, enemyHaste, loaf } from "./abilities";
import { championsRibbon, hardwood, pigHeaded, poisonous } from "./effect";

export const snail: Minion = {
    name: "Snail",
    maxHP: 10,
    abilities: [loaf, attack, attack],
    image: SnailImage,
    mesos: 2,
};

export const blueSnail: Minion = {
    name: "Blue Snail",
    maxHP: 12,
    image: BlueSnailImage,
    abilities: [attack, loaf, attack],
    mesos: 3,
};

export const shroom: Minion = {
    name: "Shroom",
    maxHP: 12,
    image: ShroomImage,
    mesos: 4,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
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
                            duration: 1,
                        },
                    ],
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
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
    mesos: 5,
    abilities: [
        attack,
        loaf,
        attack,
        {
            name: "Rollout",
            image: RedSnailShellImage,
            resourceCost: 3,
            castTime: 1,
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
    mesos: 10,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
    ],
    effects: [
        {
            ...pristineDefense,
            description: "While this character has armor:",
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
    mesos: 10,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
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
                            bypassImmunity: true,
                            name: "Dazed",
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [pigHeaded],
};

export const ribbonPig: Minion = {
    maxHP: 60,
    name: "Ribbon Pig",
    image: RibbonPigIdleImage,
    mesos: 15,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
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
    effects: [championsRibbon, pigHeaded],
};

export const orangeMushroom: Minion = {
    name: "Orange Mushroom",
    maxHP: 55,
    image: OrangeMushroomIdleImage,
    mesos: 15,
    effects: [hardy],
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Whomp",
            image: MushroomOmokImage,
            resourceCost: 3,
            castTime: 1,
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
    maxHP: 35,
    image: NoobClubAImage,
    mesos: 10,
    items: [{ ...redPotion, healing: 10 }],
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
        {
            name: "Block",
            image: ShieldIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 5,
                },
            ],
        },
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
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
    ],
};

export const noobB: Minion = {
    name: "Beginner B",
    maxHP: 35,
    image: NoobClubBImage,
    mesos: 10,
    items: [{ ...redPotion, healing: 10 }],
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
        {
            name: "Block",
            image: ShieldIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 5,
                },
            ],
        },
        {
            name: "Flurry",
            image: WoodenClubImage,
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
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
    ],
};

export const noobAWarrior = {
    name: "Beginner A",
    maxHP: 60,
    image: NoobWarriorAImage,
    mesos: 30,
    abilities: [
        bash,
        {
            ...slashBlast,
            resourceCost: 0,
        },
        bash,
        {
            ...block,
            resourceCost: 0,
        },
    ],
};

export const noobBWarrior = {
    name: "Beginner B",
    maxHP: 60,
    image: NoobWarriorBImage,
    mesos: 30,
    abilities: [
        bash,
        {
            ...slashBlast,
            resourceCost: 0,
        },
        bash,
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
    mesos: 15,
    items: [
        { ...redPotion, healing: 10 },
        { ...redPotion, healing: 10 },
    ],
    abilities: [
        {
            name: "Attack",
            image: SubiImage,
            resourceCost: 0,
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
        {
            ...enemyHaste,
            dialog: "I am speed.",
        },
        {
            name: "Dark Sight",
            resourceCost: 3,
            image: DarkSightImage,
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
            resourceCost: 3,
            image: KumbiImage,
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
    ],
};

export const olaf: Minion = {
    name: "Olaf",
    maxHP: 50,
    isElite: true,
    effects: [elite],
    mesos: 10,
    abilities: [
        attack,
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
        attack,
    ],
    image: OlafImage,
};

export const octopus: Minion = {
    name: "Octopus",
    image: OctopusIdleImage,
    maxHP: 50,
    mesos: 10,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
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
    maxHP: 70,
    mesos: 10,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Wild Charge",
            resourceCost: 3,
            image: WildBoarImage,
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
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
    ],
    effects: [hardwood],
};

export const axeStump: Minion = {
    name: "Axe Stump",
    image: AxeStumpImage,
    maxHP: 45,
    armor: 15,
    mesos: 25,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Barbs",
            image: CactusIcon,
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
    maxHP: 90,
    mesos: 25,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Blazing Charge",
            image: FireBoarImage,
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
    mesos: 10,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
        {
            name: "Chomp",
            resourceCost: 3,
            image: BloodIcon,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                    effects: [
                        {
                            ...bleed,
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
    resources: 1,
    effects: [elite, raging],
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
        {
            name: "Chomp",
            image: BloodIcon,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                    effects: [
                        {
                            ...bleed,
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
    mesos: 5,
    abilities: [
        attack,
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
                            duration: 1,
                        },
                    ],
                },
            ],
        },
        attack,
    ],
};

export const hornyMushroom: Minion = {
    name: "Horny Mushroom",
    image: HornyMushroomImage,
    maxHP: 25,
    abilities: [
        {
            name: "Attack",
            image: CrossedSwordsIcon,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
    ],
    effects: [thorns],
    mesos: 7,
};

export const elliniaGreenMushroom: Minion = {
    name: "Green Mushroom",
    image: GreenMushroomImage,
    maxHP: 45,
    mesos: 10,
    abilities: [
        {
            name: "Attack",
            image: CrossedSwordsIcon,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
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
                            duration: 1,
                        },
                    ],
                },
            ],
        },
        {
            name: "Attack",
            image: CrossedSwordsIcon,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
    ],
};

export const elliniaHornyMushroom: Minion = {
    name: "Horny Mushroom",
    image: HornyMushroomImage,
    maxHP: 50,
    abilities: [
        {
            name: "Attack",
            image: CrossedSwordsIcon,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
    ],
    effects: [thorns],
    mesos: 10,
};

export const curseEye: Minion = {
    name: "Curse Eye",
    maxHP: 100,
    image: CurseEyeImage,
    abilities: [
        {
            name: "Attack",
            image: CrossedSwordsIcon,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
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
    abilities: [attack],
    effects: [
        {
            name: "Summon Friend",
            description: "The first time this character survives damage, it summons a snail.",
            icon: SnailShellImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveDamage: {
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        numFriendly: 5,
                        comparator: "lt",
                    },
                ],
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
    isElite: true,
    abilities: [
        {
            name: "Attack",
            image: CrossedSwordsIcon,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
    ],
    effects: [
        {
            name: "Summon Friend",
            description: "When this character survives damage, it summons a snail.",
            icon: SnailShellImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveDamage: {
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        numFriendly: 5,
                        comparator: "lt",
                    },
                ],
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
    abilities: [
        {
            name: "Attack",
            image: CrossedSwordsIcon,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
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

export const zombieLupin: Minion = {
    name: "Zombie Lupin",
    maxHP: 100,
    image: ZombieLupinJumpImage,
    abilities: [
        {
            name: "Attack",
            image: CrossedSwordsIcon,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
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
    effects: [
        {
            ...poisonous,
        },
    ],
};

export const malady: Minion = {
    name: "Malady",
    maxHP: 150,
    image: MaladyImage,
    isElite: true,
    abilities: [
        {
            name: "Dark Bolt",
            image: KumbiImage,
            resourceCost: 0,
            actions: [
                {
                    damage: 3,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.BEAM,
                    icon: KumbiImage,
                    playbackTime: 400,
                },
            ],
        },
        {
            name: "Fly",
            image: MaladyImage,
            dialog: "Ohohoho!",
            resourceCost: 3,
            actions: [
                {
                    movement: 3,
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.MOVEMENT,
                    effects: [
                        {
                            ...stealth,
                            duration: 3,
                            onAttack: undefined,
                        },
                    ],
                },
            ],
        },
        {
            name: "Throw Concoction",
            image: InkSackImage,
            resourceCost: 3,
            dialog: "Have a taste of my medicine!",
            actions: [
                {
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.EFFECT,
                    effects: [
                        { ...poison, duration: 1 },
                        { ...burn, duration: 1 },
                    ],
                },
            ],
        },
        {
            name: "Wild Bombing",
            image: BombImage,
            dialog: "Ehee hee hee!",
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    movement: 2,
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.MOVEMENT,
                },
                {
                    damage: 3,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.BEAM,
                    icon: KumbiImage,
                    playbackTime: 400,
                },
                {
                    movement: 2,
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.MOVEMENT,
                },
                {
                    damage: 3,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.BEAM,
                    icon: KumbiImage,
                    playbackTime: 400,
                },
                {
                    movement: 2,
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.MOVEMENT,
                },
                {
                    damage: 3,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.BEAM,
                    icon: KumbiImage,
                    playbackTime: 400,
                },
            ],
        },
    ],
    effects: [
        hardy,
        {
            name: "Dark Knowledge",
            description: "While this character has Stealth, its attack power is increased.",
            icon: BlackManualImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackPower: 2,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    hasEffectType: [EFFECT_TYPES.STEALTH],
                },
            ],
        },
    ],
};

export const darkStoneGolem: Minion = {
    name: "Dark Stone Golem",
    maxHP: 100,
    image: DarkStoneGolemImage,
    abilities: [
        {
            name: "Stone Skin",
            image: MountainIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 5,
                },
            ],
        },
        {
            name: "Crushing Blow",
            resourceCost: 3,
            castTime: 1,
            image: DarkStoneGolemRubbleImage,
            actions: [
                {
                    damage: 15,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
            ],
        },
    ],
    effects: [hardy],
};

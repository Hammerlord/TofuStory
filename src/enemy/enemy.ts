import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import {
    AxeStumpImage,
    BananaPeelImage,
    BlackManualImage,
    BlueMushroomImage,
    BlueMushroomJumpImage,
    BlueMushroomJumpRightImage,
    BlueSnailImage,
    BlueSnailShellImage,
    BombImage,
    BubblingImage,
    CaseyImage,
    CopperDrakeImage,
    CopperScreechImage,
    CurseEyeImage,
    CurseImage,
    DarkSightImage,
    DarkStoneGolemImage,
    DarkStoneGolemRubbleImage,
    DoubleStabImage,
    DragonEggImage,
    EggImage,
    EvilCupImage,
    FangImage,
    FireBoarImage,
    FireMarbleImage,
    FrownyMaskImage,
    GiantCentipedeMarbleImage,
    GreenMushroomImage,
    GuardBanditImage,
    HornyMushroomImage,
    InkSackImage,
    IronHogHitImage,
    IronHogImage,
    KumbiImage,
    LeetSinImage,
    LigatorImage,
    LupinImage,
    MaladyImage,
    MesoImage,
    MiniKargoImage,
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
    OwlTowerImage,
    PigIdleImage,
    PoisonImage,
    RedFistOfFuryImage,
    RedMeatImage,
    RedSnailImage,
    RedSnailShellImage,
    RibbonPigIdleImage,
    RockyMaskImage,
    RockyWallopImage,
    SavageBlowImage,
    ShroomImage,
    SlimeIdleImage,
    SnailImage,
    SnailShellImage,
    SquishyLiquidImage,
    StoneGolemImage,
    StoneGolemRubbleImage,
    StumpImage,
    SubiImage,
    TeleportImage,
    TreasureChestImage,
    WeaponMasteryImage,
    WildBoarImage,
    WildKargoImage,
    WoodenClubImage,
    ZombieLupinJumpImage,
} from "../images";
import {
    BloodIcon,
    CactusIcon,
    CloudyIcon,
    CrossedSwordsIcon,
    DizzyIcon,
    EyeIcon,
    FireIcon,
    MuscleIcon,
    PristineRedShieldIcon,
    RedShieldIcon,
    ShieldIcon,
    SpeechBubbleIcon,
} from "../images/icons";
import { redPotion } from "../item/items";
import {
    attackPower,
    avenger,
    bleed,
    burn,
    elite,
    hardy,
    poison,
    preventArmorDecay,
    pristineDefense,
    sentry,
    stealth,
    stun,
    thorns,
} from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MORPH_MINION_MODIFIERS,
    MORPH_TYPES,
    MULTIPLIER_TYPES,
    Minion,
    SCALING_VALUE_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { bash, block, cleave } from "./../ability/warrior/warriorAbilities";
import { attack, doOtherWave, doWave, enemyHaste, loaf, whomp } from "./abilities";
import {
    armorDown,
    championsRibbon,
    critical,
    earthen,
    hardwood,
    incorporeal,
    pigHeaded,
    poisonous,
    sneaky,
    temporaryEarthen,
} from "./effect";

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
    abilities: [
        attack,
        loaf,
        {
            name: "Tackle",
            image: BlueSnailShellImage,
            description: "Deal damage and gain 3 Armor.",
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                    animation: ANIMATION_TYPES.YOYO,
                    animationOptions: {
                        ricochet: true,
                    },
                    secondaryAction: {
                        armor: 3,
                    },
                },
            ],
        },
    ],
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
            description: "Bounces to 2 other targets for 2 damage.",
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                    secondaryDamage: 2,
                    animation: ANIMATION_TYPES.YOYO,
                    animationOptions: {
                        ricochet: true,
                    },
                    numTargets: 2,
                    targetArea: 2,
                },
            ],
        },
    ],
    effects: [
        {
            name: "Weighted Shell",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: true,
            description: "While this character has armor:",
            conditions: [
                {
                    comparator: "gt",
                    armor: 0,
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                },
            ],
            attackPower: 1,
            preventArmorDecay: true,
            icon: PristineRedShieldIcon,
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
        whomp,
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
            ...cleave,
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
            ...cleave,
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
                    damage: 3,
                },
            ],
        },
        {
            name: "Lash And Thrash",
            ...attack,
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
                    damage: 5,
                    addCardsToDiscard: [
                        {
                            name: "Constrict",
                            image: OctopusLegImage,
                            removeAfterTurn: true,
                            unplayable: true,
                            resourceCost: 0,
                            actions: [
                                {
                                    type: ACTION_TYPES.HINDER,
                                    target: TARGET_TYPES.SELF,
                                    animation: ANIMATION_TYPES.SPIN,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
    effects: [
        {
            name: "Tentacular",
            icon: OctopusLegImage,
            lifeOnHit: 1,
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
    effects: [pigHeaded],
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
    effects: [hardy, pigHeaded],
};

export const ligator: Minion = {
    name: "Ligator",
    image: LigatorImage,
    maxHP: 30,
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
    isElite: true,
    maxHP: 80,
    mesos: 25,
    resources: 1,
    effects: [],
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
            name: "Chomp",
            image: BloodIcon,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
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

export const mimic: Minion = {
    name: "Mimic",
    image: TreasureChestImage,
    imageOptions: {
        filter: "brightness(0.4) drop-shadow(0 0 5px purple) drop-shadow(0 0 3px purple)",
    },
    isElite: true,
    maxHP: 150,
    mesos: 50,
    effects: [thorns],
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
            name: "Cursed Artifact",
            image: GiantCentipedeMarbleImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: GiantCentipedeMarbleImage,
                    damage: 3,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    addCardsToDeck: [
                        {
                            name: "Cursed Artifact",
                            description: "When drawn, Burns you for 1 turn.",
                            image: GiantCentipedeMarbleImage,
                            resourceCost: 1,
                            depletedOnUse: true,
                            onDraw: {
                                ability: {
                                    name: "Burn",
                                    image: FireIcon,
                                    actions: [
                                        {
                                            type: ACTION_TYPES.EFFECT,
                                            target: TARGET_TYPES.SELF,
                                            effects: [
                                                {
                                                    ...burn,
                                                    duration: 1,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                            actions: [
                                {
                                    type: ACTION_TYPES.HINDER,
                                    target: TARGET_TYPES.SELF,
                                },
                            ],
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
                    damage: 3,
                },
            ],
        },
        {
            name: "Cursed Chalice",
            image: EvilCupImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: EvilCupImage,
                    damage: 3,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    addCardsToDeck: [
                        {
                            name: "Cursed Chalice",
                            description: "When drawn, Poisons you for 1 turn.",
                            image: EvilCupImage,
                            depletedOnUse: true,
                            resourceCost: 1,
                            onDraw: {
                                ability: {
                                    name: "Poison",
                                    image: PoisonImage,
                                    actions: [
                                        {
                                            type: ACTION_TYPES.EFFECT,
                                            target: TARGET_TYPES.SELF,
                                            effects: [
                                                {
                                                    ...poison,
                                                    duration: 1,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                            actions: [
                                {
                                    type: ACTION_TYPES.HINDER,
                                    target: TARGET_TYPES.SELF,
                                },
                            ],
                        },
                    ],
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
                    damage: 8,
                    effects: [
                        {
                            ...bleed,
                        },
                    ],
                },
            ],
        },
        {
            name: "Meso Shot",
            image: MesoImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    icon: MesoImage,
                    animationOptions: { sidewinder: true },
                    damage: 4,
                },
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    icon: MesoImage,
                    animationOptions: { sidewinder: true },
                    damage: 4,
                },
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    icon: MesoImage,
                    animationOptions: { sidewinder: true },
                    damage: 4,
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
        loaf,
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
    mesos: 13,
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
        loaf,
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
};

const curseEyeDouble: Minion = {
    name: "Mirage",
    image: CurseEyeImage,
    maxHP: 3,
    mesos: 0,
    abilities: [],
    effects: [
        {
            ...incorporeal,
            description: "Cannot take more than 1 damage per hit. Vanishes when crowd controlled or this effect ends.",
            duration: 3,
            canBeSilenced: false,
            onEnd: {
                usableWhileStunned: true,
                removeEffect: true, // onDeath removeEffect is insufficient for some reason
                ability: {
                    name: "Vanish",
                    image: TeleportImage,
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.NONE,
                            retreat: true,
                        },
                    ],
                },
            },
            onReceiveEffect: {
                usableWhileStunned: true,
                removeEffect: true, // onDeath removeEffect is insufficient for some reason
                ability: {
                    name: "Vanish",
                    image: TeleportImage,
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.NONE,
                            retreat: true,
                        },
                    ],
                },
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE, EFFECT_TYPES.SILENCE],
                        comparator: "eq",
                    },
                ],
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
            },
        },
    ],
};

export const curseEye: Minion = {
    name: "Curse Eye",
    maxHP: 100,
    image: CurseEyeImage,
    mesos: 20,
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
                        damage: 2,
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
                            name: "Dizzy",
                            description: "Your attacks may randomly hit other targets instead.",
                            icon: DizzyIcon,
                            image: DizzyIcon,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.DEBUFF,
                            duration: 2,
                            hitRandomTarget: true,
                        },
                    ],
                },
                {
                    type: ACTION_TYPES.NONE,
                    target: TARGET_TYPES.SELF,
                    summon: [
                        { minion: [curseEyeDouble], placement: "adjacent" },
                        { minion: [curseEyeDouble], placement: "adjacent" },
                    ],
                },
            ],
        },
    ],
    effects: [
        {
            name: "Predatory",
            icon: EyeIcon,
            description: "Deals +2 damage against debuffed targets.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
        },
    ],
};

export const snailFriend: Minion = {
    name: "Snail Friend",
    maxHP: 10,
    mesos: 0,
    image: SnailImage,
    abilities: [attack],
    effects: [
        {
            name: "Summon Friend",
            description: "The first time this character survives damage, it summons a snail.",
            icon: SnailShellImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: true,
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
                            summon: [{ minion: [snail] }],
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
    mesos: 30,
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
            canBeSilenced: true,
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
    mesos: 15,
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
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    addCardsToDiscard: [bananaPeelCard],
                },
            ],
        },
    ],
};

export const zombieLupin: Minion = {
    name: "Zombie Lupin",
    maxHP: 100,
    mesos: 20,
    image: ZombieLupinJumpImage,
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
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    addCardsToDiscard: [bananaPeelCard],
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
    mesos: 30,
    abilities: [
        {
            name: "Dark Bolt",
            image: KumbiImage,
            resourceCost: 0,
            actions: [
                {
                    damage: 4,
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
                },
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
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
            dialog: "Have a taste of our medicine!",
            actions: [
                {
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.EFFECT,
                    effects: [
                        { ...poison, duration: 2 },
                        { ...burn, duration: 2 },
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
                    damage: 4,
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
                    damage: 4,
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
                    damage: 4,
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
    mesos: 25,
    armor: 50,
    isElite: true,
    image: DarkStoneGolemImage,
    abilities: [
        {
            name: "Stone Skin",
            image: ShieldIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 3,
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
                    damage: 20,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
            ],
        },
    ],
    effects: [temporaryEarthen, hardy, preventArmorDecay],
};

export const eventBandit: Minion = {
    name: "XSasukeX",
    image: GuardBanditImage,
    HP: 100,
    maxHP: 100,
    mesos: 100,
    abilities: [
        {
            name: "Double Stab",
            image: DoubleStabImage,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 4,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 4,
                },
            ],
        },
        {
            name: "Dark Sight",
            image: DarkSightImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    icon: DarkSightImage,
                    effects: [
                        {
                            type: EFFECT_TYPES.STEALTH,
                            class: EFFECT_CLASSES.BUFF,
                            name: "Stealth",
                            icon: CloudyIcon,
                            canBeSilenced: true,
                            duration: 3,
                            onReceiveAttack: {
                                removeEffect: true,
                            },
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
                    damage: 6,
                },
            ],
        },
        enemyHaste,
        {
            name: "Savage Blow",
            image: SavageBlowImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                    icon: SavageBlowImage,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    effects: [bleed],
                },
            ],
        },
    ],
    effects: [
        sneaky,
        {
            name: "",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onWaveStart: {
                ability: {
                    name: "",
                    dialog: "Are you serious? Outta my way!",
                    image: DarkSightImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            animation: ANIMATION_TYPES.ACTION_EXPLODE,
                            icon: DarkSightImage,
                            effects: [
                                {
                                    type: EFFECT_TYPES.STEALTH,
                                    class: EFFECT_CLASSES.BUFF,
                                    name: "Stealth",
                                    icon: CloudyIcon,
                                    canBeSilenced: true,
                                    duration: 3,
                                    onReceiveAttack: {
                                        removeEffect: true,
                                    },
                                },
                            ],
                        },
                    ],
                },
                removeEffect: true,
            },
        },
        {
            name: "About To Flee",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    healthPercentage: 0.2,
                    comparator: "lt",
                },
            ],
            onReceiveDamage: {
                removeEffect: true,
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                usableWhileStunned: true,
                ability: {
                    name: "Dark Sight",
                    image: DarkSightImage,
                    dialog: "Screw this! I ain't dying here!",
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            animation: ANIMATION_TYPES.ACTION_EXPLODE,
                            icon: DarkSightImage,
                            effects: [
                                {
                                    ...stealth,
                                    description:
                                        "Stealth and cannot be targeted directly. When this effect ends, the character will retreat.",
                                    preventTurnAction: true,
                                    duration: 2,
                                    onEnd: {
                                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                        ability: {
                                            name: "Retreat",
                                            actions: [
                                                {
                                                    type: ACTION_TYPES.EFFECT,
                                                    target: TARGET_TYPES.SELF,
                                                    retreat: true,
                                                },
                                            ],
                                        },
                                    },
                                    onRemoved: {
                                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                        ability: {
                                            name: "",
                                            dialog: "WTF?",
                                            actions: [
                                                {
                                                    type: ACTION_TYPES.NONE,
                                                    target: TARGET_TYPES.SELF,
                                                },
                                            ],
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        },
    ],
};

export const owlTower: Minion = {
    name: "Owl Tower",
    image: OwlTowerImage,
    maxHP: 100,
    isElite: true,
    effects: [sentry],
    mesos: 40,
    abilities: [
        {
            ...loaf,
            name: "Inert",
        },
        {
            name: "Owl Laser",
            image: FireMarbleImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.BEAM,
                    icon: FireMarbleImage,
                    animationOptions: {
                        width: 40,
                        height: 40,
                    },
                    damage: 3,
                },
            ],
        },
    ],
};

export const miniKargo: Minion = {
    name: "Mini Kargo",
    image: MiniKargoImage,
    maxHP: 30,
    mesos: 20,
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
            name: "Mini Kargo",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onFriendlyDeath: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                        comparator: "eq",
                        name: "Wild Kargo",
                        //numFriendly: 1, // This is assuming Mini Kargo is the only one alive
                    },
                ],
                effects: [
                    {
                        name: "Panic",
                        description: "About to flee!",
                        icon: FrownyMaskImage,
                        type: EFFECT_TYPES.FEAR,
                        class: EFFECT_CLASSES.DEBUFF,
                        preventTurnAction: true,
                        onTurnStart: {
                            ability: {
                                name: "Retreat",
                                image: TeleportImage,
                                actions: [
                                    {
                                        target: TARGET_TYPES.SELF,
                                        type: ACTION_TYPES.EFFECT,
                                        playbackTime: 1500,
                                        retreat: true,
                                        animationOptions: {
                                            fadeOut: true, // TODO does nothing on combatant portraits
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
        },
    ],
};

export const wildKargo: Minion = {
    name: "Wild Kargo",
    image: WildKargoImage,
    maxHP: 200,
    mesos: 30,
    isElite: true,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                },
            ],
        },
        {
            name: "Shred",
            image: BloodIcon,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    effects: [
                        {
                            ...bleed,
                        },
                    ],
                },
            ],
        },
        {
            name: "Call Family",
            image: MiniKargoImage,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [miniKargo] }],
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                },
            ],
        },
        {
            name: "Rip And Tear",
            image: FangImage,
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.SHOUT,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    effects: [
                        {
                            ...bleed,
                        },
                    ],
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    effects: [
                        {
                            ...bleed,
                        },
                    ],
                },
            ],
        },
        {
            name: "Feed",
            image: RedMeatImage,
            resourceCost: 3,
            actions: [
                {
                    induceCombatantAttack: true,
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.SHOUT,
                    area: 2,
                    excludePrimaryTarget: true,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 10,
                    secondaryAction: {
                        healing: 15,
                        resources: 1,
                    },
                },
            ],
        },
    ],
    effects: [critical, avenger],
};

const vulnerablePig: Minion = {
    name: "Ironless Hog",
    maxHP: 80,
    image: PigIdleImage,
    mesos: 20,
    abilities: [
        {
            name: "Panic",
            image: IronHogHitImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    movement: 2,
                },
            ],
        },
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
            resourceCost: 3,
            name: "Armor Up!",
            image: ShieldIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    morph: {
                        type: MORPH_TYPES.MERGE,
                        modifiers: {
                            HP: MORPH_MINION_MODIFIERS.SUM,
                        },
                        minions: [
                            {
                                minion: "Iron Hog",
                            },
                        ],
                    },
                },
            ],
        },
    ],
    effects: [
        {
            name: "Vulnerable",
            icon: IronHogHitImage,
            type: EFFECT_TYPES.FEAR,
            class: EFFECT_CLASSES.DEBUFF,
            attackDamageReceived: 3,
        },
    ],
};

export const ironHog: Minion = {
    name: "Iron Hog",
    maxHP: 80,
    armor: 40,
    image: IronHogImage,
    mesos: 20,
    abilities: [
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
            name: "Armored Charge",
            resourceCost: 3,
            image: IronHogImage,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 10,
                    secondaryAction: {
                        armor: 5,
                    },
                },
            ],
        },
    ],
    effects: [
        preventArmorDecay,
        {
            name: "Armored",
            description: "When this character receives direct damage, it will become vulnerable.",
            canBeSilenced: false,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onReceiveDamage: {
                usableWhileStunned: true,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        armor: 0,
                        comparator: "eq",
                    },
                ],
                ability: {
                    name: "Armor Broken",
                    image: IronHogHitImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            morph: {
                                type: MORPH_TYPES.MERGE,
                                modifiers: {
                                    HP: MORPH_MINION_MODIFIERS.SUM,
                                },
                                minions: [
                                    {
                                        minion: { ...vulnerablePig },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
        {
            ...championsRibbon,
        },
    ],
};

export const blueMushroom: Minion = {
    name: "Blue Mushroom",
    image: BlueMushroomImage,
    maxHP: 60,
    mesos: 12,
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
        doWave,
        doOtherWave,
    ],
    effects: [hardy],
};

export const copperDrake: Minion = {
    name: "Copper Drake",
    image: CopperDrakeImage,
    isElite: true,
    maxHP: 100,
    mesos: 20,
    abilities: [
        {
            name: "Screech",
            image: CopperScreechImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.SHOUT,
                    area: 2,
                    effects: [
                        {
                            ...attackPower,
                            type: EFFECT_TYPES.RAGE,
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
                    damage: 1,
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 1,
                },
            ],
        },
    ],
    effects: [hardy],
};

export const egg: Minion = {
    name: "Mysterious Egg",
    maxHP: 15,
    mesos: 20,
    image: EggImage,
    isElite: true,
    abilities: [{ ...loaf, name: "Zzz" }],
    effects: [
        {
            name: "Hatching...",
            icon: DragonEggImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            duration: 3,
            onEnd: {
                target: TARGET_TYPES.SELF,
                ability: {
                    name: "Hatch",
                    image: DragonEggImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            morph: {
                                type: MORPH_TYPES.MERGE,
                                minions: [
                                    {
                                        minion: { ...copperDrake },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
            onDeath: {
                target: TARGET_TYPES.SELF,
                ability: {
                    name: "Hatch",
                    image: DragonEggImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            resurrect: true,
                            morph: {
                                type: MORPH_TYPES.MERGE,
                                resurrect: true,
                                minions: [
                                    {
                                        minion: { ...copperDrake, effects: [...copperDrake.effects, stun] },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
    ],
};

export const rockyMask: Minion = {
    name: "Rocky Mask",
    image: RockyMaskImage,
    maxHP: 10,
    armor: 100,
    mesos: 15,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 1,
                },
            ],
        },
        {
            name: "Rocky Wallop",
            image: RockyWallopImage,
            resourceCost: 3,
            castTime: 1,
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
            name: "Rock Mask",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: true,
            description: "While this character has armor:",
            conditions: [
                {
                    comparator: "gt",
                    armor: 0,
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                },
            ],
            attackPower: 4,
            skillBonus: [
                {
                    skill: "Rocky Wallop",
                    damage: 3,
                },
            ],
            icon: RedShieldIcon,
        },
    ],
};

export const golem: Minion = {
    name: "Stone Golem",
    image: StoneGolemImage,
    maxHP: 100,
    armor: 50,
    mesos: 25,
    isElite: true,
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
            name: "Crushing Blow",
            resourceCost: 3,
            castTime: 1,
            image: StoneGolemRubbleImage,
            actions: [
                {
                    damage: 10,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
            ],
        },
    ],
    effects: [
        temporaryEarthen,
        hardy,
        preventArmorDecay,
        {
            name: "Strength",
            description: "Attacks apply Armor Down.",
            icon: StoneGolemRubbleImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: false,
            onAttack: {
                targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
                effects: [armorDown],
            },
        },
    ],
};

export const bubbling: Minion = {
    name: "Bubbling",
    maxHP: 10,
    mesos: 15,
    armor: 40,
    image: BubblingImage,
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
        loaf,
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                },
            ],
        },
        {
            name: "Goo",
            image: SquishyLiquidImage,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    icon: SquishyLiquidImage,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                    addCardsToDiscard: [
                        {
                            name: "Goo",
                            image: SquishyLiquidImage,
                            resourceCost: 2,
                            description: "Reduce cost by 1 for every attack played this turn.",
                            depletedOnUse: true,
                            onAbilityUse: {
                                abilityEffects: [
                                    {
                                        resourceCost: -1,
                                    },
                                ],
                                conditions: [
                                    {
                                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                                        isOffense: true,
                                        comparator: "eq",
                                    },
                                ],
                            },
                            actions: [
                                {
                                    type: ACTION_TYPES.HINDER,
                                    target: TARGET_TYPES.SELF,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
    effects: [pristineDefense],
};

export const casey: Minion = {
    name: "Casey",
    mesos: 0,
    image: CaseyImage,
    maxHP: 300,
    abilities: [],
};

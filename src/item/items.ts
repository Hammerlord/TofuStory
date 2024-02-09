import { burn } from "./../ability/Effects";
import { JOB_CARD_MAP } from "../ability";
import { chill, poison, thorns, bleed } from "../ability/Effects";
import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import {
    AdamantiumPlateImage,
    AlchemistStoneImage,
    AlligatorTubeImage,
    AmethystImage,
    AncientTreeSapImage,
    AquamarineImage,
    ArwensGlassShoeImage,
    ASetOfMemoryCardsImage,
    BallerCaneImage,
    BattleShieldImage,
    BlueJeanShortsImage,
    BluePotionImage,
    BlueSaunaRobeImage,
    BoneHelmImage,
    BouquetImage,
    BrickImage,
    BronzeIncenseBurnerImage,
    CactusImage,
    CoffeePotImage,
    CouponImage,
    CursedDollImage,
    DiamondImage,
    DiamondOreImage,
    DrakeBloodImage,
    EnergyBoltImage,
    EnergyBoltProjectileImage,
    EstherShieldImage,
    FairyWingImage,
    FishSpearImage,
    FlamingFeatherImage,
    GarnetImage,
    GoldenHammerImage,
    GreenBambooHatImage,
    GuidebookImage,
    HotdogImage,
    HumilityStoneImage,
    IronMaceImage,
    KoreanFanImage,
    LeatherSandalsImage,
    LetterImage,
    LuckSackImage,
    NewspaperImage,
    PanlidImage,
    PieceOfIceImage,
    PigIllustratedImage,
    PigsRibbonImage,
    PlungerImage,
    RabbitFootImage,
    RedHeadbandImage,
    RedHeartedEarringsImage,
    RedPotionImage,
    RedWhipImage,
    RespawnTokenImage,
    RisingStarImage,
    SafetyCharmImage,
    SapOfNependeathImage,
    SnowshoesImage,
    SpectrumGogglesImage,
    StarEarringsImage,
    StarfallMagicSquareImage,
    SteelyImage,
    StolenFenceImage,
    SunshinePanImage,
    SwordImage,
    TauromacisHornImage,
    TaurospearHornImage,
    TopazImage,
    TortieShellImage,
    WeaponMasteryImage,
    WildKargoEyeImage,
    WorkGlovesImage,
} from "../images";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    CONDITION_TARGETS,
    Effect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MULTIPLIER_TYPES,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";

import { Item, ITEM_TYPES, RARITIES } from "./types";

export const halfEatenHotdog: Item = {
    name: "Half-eaten Hot Dog",
    healing: 10,
    image: HotdogImage,
    type: ITEM_TYPES.CONSUMABLE,
};

export const stolenFence: Item = {
    name: "Stolen Fence",
    description: "On wave start, gain 5 armor.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: StolenFenceImage,
    effects: [
        {
            name: "Stolen Fence",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: StolenFenceImage,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 5,
            },
        },
    ],
};

export const battleShield: Item = {
    name: "Battle Shield",
    description: "Block 1 damage from attacks when your health is less than half.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: BattleShieldImage,
    effects: [
        {
            name: "Battle Shield",
            description: "Reducing damage taken from attacks by 1.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: BattleShieldImage,
            attackDamageReceived: -1,
            onlyVisibleWhenProcced: true,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    healthPercentage: 0.5,
                    comparator: "lt",
                },
            ],
        },
    ],
};

export const safetyCharm: Item = {
    name: "Safety Charm",
    description: "Heal 3 HP on wave clear.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: SafetyCharmImage,
    effects: [
        {
            name: "Safety Charm",
            description: "Healing 3 HP on wave clear.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: SafetyCharmImage,
            disableDisplayIcon: true,
            onWaveClear: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                healing: 3,
            },
        },
    ],
};

export const drakeBlood: Item = {
    name: "Drake Blood",
    description: "Gain 1 attack power, but you take 1 damage per turn.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: DrakeBloodImage,
    effects: [
        {
            name: "Drake Blood",
            description: "Gaining 1 attack power and taking 1 damage per turn.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: DrakeBloodImage,
            disableDisplayIcon: true,
            attackPower: 1,
            onTurnEnd: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                damage: 1,
            },
        },
    ],
};

export const luckSack: Item = {
    name: "Luck Sack",
    description: "Gain 20% more mesos.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: LuckSackImage,
    effects: [
        {
            name: "Luck Sack",
            description: "Gaining 20% more mesos.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            mesosGained: 0.2,
        },
    ],
};

export const amethyst: Item = {
    name: "Amethyst",
    description: "Heal 1 HP every 5 turns. Overhealing turns into armor for the overhealed amount.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: AmethystImage,
    effects: [
        {
            name: "Amethyst",
            description: "Healing 1 HP every 5 turns.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 5,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                healing: 1,
            },
            onReceiveOverhealing: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.OVERHEALING,
                    value: 1,
                },
            },
        },
    ],
};

export const redWhip: Item = {
    name: "Red Whip",
    description: "Every 3 turns, draw an extra card.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: RedWhipImage,
    effects: [
        {
            name: "Red Whip",
            description: "Draw an extra card every 3 turns.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 3,
            drawCardsPerTurn: 1,
        },
    ],
};

export const topaz: Item = {
    name: "Topaz",
    description: "Every 5 effect abilities you use, gain Thorns.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: TopazImage,
    effects: [
        {
            name: "Topaz",
            description: "Gaining thorns after using 5 effect abilities.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAbility: {
                effects: [thorns],
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        numAbilitiesUsed: {
                            amount: 5,
                            type: ACTION_TYPES.EFFECT,
                        },
                        comparator: "modulo",
                    },
                ],
            },
        },
    ],
};

const sandalsEffect: Effect = {
    name: "Leather Sandals",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: LeatherSandalsImage,
    drawCardsPerTurn: 1,
    duration: 1,
};

export const leatherSandals: Item = {
    name: "Leather Sandals",
    description: "On wave start, draw an extra card.",
    flavourText: "The quintessential footwear of aspiring adventurers.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: LeatherSandalsImage,
    sellPrice: 10,
    effects: [
        {
            name: "Leather Sandals",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [sandalsEffect],
            },
        },
    ],
};

export const engravedStone: Item = {
    name: "Engraved Stone",
    description: "When you are attacked, gain 1 resource. This may occur once per turn.",
    flavourText: "A mysterious keepsake you found on your person.",
    image: HumilityStoneImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    effects: [
        {
            name: "Engraved Stone",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onTurnEnd: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Vigour",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: HumilityStoneImage,
                        duration: 1,
                        onReceiveAttack: {
                            targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                            removeEffect: true,
                            resources: 1,
                        },
                    },
                ],
            },
        },
    ],
};

export const guideBook: Item = {
    name: "Guide Book",
    description: "Card reward selections now offer another card to choose from.",
    image: GuidebookImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    abilityChoices: 1,
    effects: [
        {
            name: "Guide Book",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
        },
    ],
};

export const panlid: Item = {
    name: "Pan Lid",
    description: "On wave start, gain 10 armor and prevent armor decay for 2 turns.",
    image: PanlidImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    effects: [
        {
            name: "Pan Lid Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 10,
                effects: [
                    {
                        name: "Pan Lid",
                        description: "Preventing armor decay.",
                        icon: PanlidImage,
                        class: EFFECT_CLASSES.BUFF,
                        type: EFFECT_TYPES.NONE,
                        preventArmorDecay: true,
                        duration: 2,
                    },
                ],
            },
        },
    ],
};

export const alligatorTube: Item = {
    name: "Alligator Tube",
    description: "When you summon a minion, it gains 1 attack power.",
    image: AlligatorTubeImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Alligator Tube",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
        },
        {
            name: "Alligator Tube",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onFriendlySummon: {
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                effects: [
                    {
                        name: "Attack Power Increase",
                        icon: WeaponMasteryImage,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        attackPower: 1,
                    },
                ],
            },
        },
    ],
};

export const cactus: Item = {
    name: "Cactus",
    description: "Gain 1 Thorns.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: CactusImage,
    effects: [
        {
            ...thorns,
        },
    ],
};

export const nependeathSap: Item = {
    name: "Nependeath Sap",
    description: "Every 3 turns, your first attack inflicts poison.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: SapOfNependeathImage,
    effects: [
        {
            name: "Nependeath Sap",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 3,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Poisonous",
                        description: "Next attack applying poison.",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: SapOfNependeathImage,
                        onAttack: {
                            removeEffect: true,
                            targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
                            effects: [{ ...poison, duration: 1 }],
                        },
                    },
                ],
            },
        },
    ],
};

export const coffeePot: Item = {
    name: "Coffee Pot",
    description: "You can perform an extra activity while camping.",
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: CoffeePotImage,
    camp: {
        extraActivities: 1,
    },
};

export const respawnToken: Item = {
    name: "Respawn Token",
    description: "If you die, you restore 30 HP and this item is consumed.",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: RespawnTokenImage,
    effects: [
        {
            name: "Respawn Token",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeath: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                resurrect: true,
                healing: 30,
            },
        },
    ],
};

export const sunshinePan: Item = {
    name: "Sunshine Pan",
    description: "Restore an additional 10 HP when camping.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: SunshinePanImage,
    camp: {
        healing: 10,
    },
};

export const goldenHammer: Item = {
    name: "Golden Hammer",
    description: "Use this item to upgrade an ability.",
    type: ITEM_TYPES.MATERIAL,
    image: GoldenHammerImage,
    upgradeCard: true,
};

export const pieceOfIce: Item = {
    name: "Piece of Ice",
    description: "Every 3 turns, characters who attack you are chilled.",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: PieceOfIceImage,
    effects: [
        {
            name: "Piece of Ice",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 3,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Icy",
                        description: "Attackers are chilled.",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: PieceOfIceImage,
                        duration: 2,
                        onReceiveAttack: {
                            targetType: TRIGGER_TARGET_TYPES.ACTOR,
                            effects: [{ ...chill, duration: 2 }],
                        },
                    },
                ],
            },
        },
    ],
};

export const aquamarine: Item = {
    name: "Aquamarine",
    description: "+1 armor from armor sources.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: AquamarineImage,
    effects: [
        {
            name: "Aquamarine",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            armorReceived: 1,
        },
    ],
};

export const boneHelm: Item = {
    name: "Bone Helm",
    description: "Receive 1 less damage when attacked by the enemy directly in front of you.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: BoneHelmImage,
    effects: [
        {
            name: "Bone Helm",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackDamageReceived: -1,
            conditions: [
                {
                    comparator: "eq",
                    proximity: 0,
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                },
            ],
        },
    ],
};

export const incense: Item = {
    name: "Incense",
    image: BronzeIncenseBurnerImage,
    description: "Use this item to remove an ability from your deck.",
    type: ITEM_TYPES.CONSUMABLE,
    removeCard: true,
};

export const garnet: Item = {
    name: "Garnet",
    image: GarnetImage,
    description: "+3 attack power while your resources are at least 80% full.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Garnet",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: GarnetImage,
            disableDisplayIcon: true,
            attackPower: 3,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    resourcePercentage: 0.7,
                    comparator: "gt",
                },
            ],
        },
    ],
};

export const ironMace: Item = {
    name: "Iron Mace",
    image: IronMaceImage,
    description: "Gain +1 attack power against elite enemies and bosses.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Iron Mace",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackPower: 1,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                    isElite: true,
                },
            ],
        },
    ],
};

export const fishSpear: Item = {
    name: "Fish Spear",
    image: FishSpearImage,
    description: "Gain +1 attack power against common enemies.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Fish Spear",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackPower: 1,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                    isElite: false,
                },
            ],
        },
    ],
};

export const pigsRibbonItem: Item = {
    name: "Pig's Ribbon",
    image: PigsRibbonImage,
    description: "Once per turn, counter for 1 base damage when attacked.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Pig's Ribbon",
            description: "Once per turn, this character will counter when attacked.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: true,
            onTurnEnd: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Retaliation",
                        description: "Countering on the next attack",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: PigsRibbonImage,
                        canBeSilenced: true,
                        duration: 1,
                        onReceiveAttack: {
                            usableWhileStunned: false,
                            removeEffect: true,
                            targetType: TRIGGER_TARGET_TYPES.ACTOR,
                            ability: {
                                name: "Retaliate",
                                actions: [
                                    {
                                        type: ACTION_TYPES.ATTACK,
                                        target: TARGET_TYPES.HOSTILE,
                                        damage: 1,
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

export const ballerCane: Item = {
    name: "Baller Cane",
    image: BallerCaneImage,
    description: "Whenever you use an ability, gain 1 meso.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Baller Cane",
            description: "Gaining 1 meso for every ability used.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAbility: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                mesos: 1,
            },
        },
    ],
};

export const greenBambooHat: Item = {
    name: "Green Bamboo Hat",
    image: GreenBambooHatImage,
    description: "When you receive a status effect from an ability, gain 1 armor.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Green Bamboo Hat",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveEffect: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 1,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        comparator: "eq",
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                    },
                ],
            },
        },
    ],
};

export const koreanFan: Item = {
    name: "Korean Fan",
    image: KoreanFanImage,
    description: "Every 3 turns, hurl a fan that inflicts a 1-turn Bleed.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Korean Fan",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 3,
            onTurnStart: {
                ability: {
                    name: "Hidden Fan",
                    image: KoreanFanImage,
                    actions: [
                        {
                            type: ACTION_TYPES.RANGE_ATTACK,
                            animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
                            target: TARGET_TYPES.RANDOM_HOSTILE,
                            icon: KoreanFanImage,
                            playbackTime: 600,
                            effects: [{ ...bleed, duration: 1 }],
                        },
                    ],
                },
            },
        },
    ],
};

export const risingStar: Item = {
    name: "Rising Star",
    image: RisingStarImage,
    description: "Once per battle, after attacking 7 times, gain 1 attack power.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    effects: [
        {
            name: "Rising Star Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAbility: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                removeEffect: true,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        numAbilitiesUsed: {
                            type: ACTION_TYPES.ATTACK,
                            amount: 7,
                        },
                        comparator: "modulo",
                    },
                ],
                effects: [
                    {
                        name: "Rising Star",
                        icon: RisingStarImage,
                        disableDisplayIcon: true,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        attackPower: 1,
                    },
                ],
            },
        },
    ],
};

export const bouquet: Item = {
    name: "Bouquet",
    image: BouquetImage,
    description: "+1 healing from healing sources in battle.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Bouquet - +Healing Received",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            healingReceived: 1,
        },
    ],
};

export const starfallMagicSquare: Item = {
    name: "Starfall Magic Square",
    image: StarfallMagicSquareImage,
    description: "When you Deplete a card, you Radiate 2 damage to enemies.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Starfall Magic Square Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDepleteAbility: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                ability: {
                    name: "Starfall",
                    image: StarfallMagicSquareImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            icon: StarfallMagicSquareImage,
                            animation: ANIMATION_TYPES.ACTION_EXPLODE,
                            radiate: {
                                area: 2,
                                damage: 2,
                                icon: StarfallMagicSquareImage,
                                animation: ANIMATION_TYPES.BEAM,
                                playbackTime: 400,
                            },
                        },
                    ],
                },
            },
        },
    ],
};

export const cursedDoll: Item = {
    name: "Cursed Doll",
    image: CursedDollImage,
    description: "On wave start, randomly curse an enemy to take damage when you attack other targets.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Cursed Doll Holder",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                ability: {
                    name: "Curse",
                    image: CursedDollImage,
                    actions: [
                        {
                            type: ACTION_TYPES.NONE,
                            target: TARGET_TYPES.RANDOM_HOSTILE,
                            icon: CursedDollImage,
                            animation: ANIMATION_TYPES.ACTION_EXPLODE,
                            effects: [
                                {
                                    name: "Lupin Curse",
                                    icon: CursedDollImage,
                                    description: "Receiving 1 damage for every attack against a target friendly to this character.",
                                    type: EFFECT_TYPES.NONE,
                                    class: EFFECT_CLASSES.DEBUFF,
                                    onFriendlyReceiveAttack: {
                                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                        damage: 1,
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

export const redHeadband: Item = {
    name: "Red Headband",
    image: RedHeadbandImage,
    description: "On wave start, gain an extra resource.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    effects: [
        {
            name: "Red Headband",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Red Headband - Extra Resource",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: RedHeadbandImage,
                        resourcesPerTurn: 1,
                        duration: 1,
                    },
                ],
            },
        },
    ],
};

export const workGloves: Item = {
    name: "Work Gloves",
    image: WorkGlovesImage,
    description: "Every 12 abilities you use, gain 1 attack power.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    effects: [
        {
            name: "Work Gloves Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAbility: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        numAbilitiesUsed: 12,
                        comparator: "modulo",
                    },
                ],
                effects: [
                    {
                        name: "Work Gloves",
                        icon: WorkGlovesImage,
                        disableDisplayIcon: true,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        attackPower: 1,
                    },
                ],
            },
        },
    ],
};

export const redPotion: Item = {
    name: "Red Potion",
    image: RedPotionImage,
    type: ITEM_TYPES.CONSUMABLE,
    healing: 15,
};

export const bluePotion: Item = {
    name: "Blue Potion",
    image: BluePotionImage,
    description: "Gain 2 resources.",
    type: ITEM_TYPES.CONSUMABLE,
    resources: 2,
};

export const unsignedLetter: Item = {
    name: "Unsigned Letter",
    description: "+5 max HP.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: LetterImage,
    effects: [
        {
            name: "Unsigned Letter",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 5,
        },
    ],
};

// Bit of grease to check charged abilities to avoid doing it manually anymore
const chargedAbilityNames = JOB_CARD_MAP.Magician.all
    .filter((ability) => {
        if (JSON.stringify(ability.actions).includes('"hasEffect":"Charged"')) {
            return true;
        }
    })
    .map(({ name }) => name);

export const chargingStone: Item = {
    name: "Charging Stone",
    description: "When you use an ability, certain spells become Charged. If left unused at the end of your turn, unleash an Energy Bolt.",
    flavourText: "A mysterious keepsake you found on your person.",
    image: AlchemistStoneImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    effects: [
        {
            name: "Charging Stone",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAbility: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        comparator: "not",
                        hasEffect: "Charged",
                    },
                ],
                effects: [
                    {
                        name: "Charged",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: AlchemistStoneImage,
                        description:
                            "Empowering the next cast of a Charged spell. If left unused at the end of your turn, unleash an Energy Bolt.",
                        duration: 0,
                        weaponAnimation: "glow",
                        onAbility: {
                            conditions: [
                                {
                                    calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                    comparator: "eq",
                                    name: chargedAbilityNames,
                                },
                            ],
                            removeEffect: true,
                        },
                        onTurnEnd: {
                            ability: {
                                name: "Energy Bolt",
                                image: EnergyBoltImage,
                                resourceCost: 0,
                                actions: [
                                    {
                                        damage: 2,
                                        target: TARGET_TYPES.RANDOM_HOSTILE,
                                        type: ACTION_TYPES.RANGE_ATTACK,
                                        animation: ANIMATION_TYPES.ONE_WAY,
                                        icon: EnergyBoltProjectileImage,
                                        playbackTime: 400,
                                        animationOptions: {
                                            rotate: -45,
                                            rotateToFaceTarget: true,
                                        },
                                    },
                                ],
                                upgrades: [],
                            },
                        },
                    },
                ],
            },
        },
    ],
};

export const snailStompers: Item = {
    name: "Snail Stompers",
    image: SnowshoesImage,
    description: "+3 attack power against enemies with 10 or less HP.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    effects: [
        {
            name: "Snail Stompers",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackPower: 3,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                    HP: 11,
                    comparator: "lt",
                },
            ],
        },
    ],
};

export const clubMembership: Item = {
    name: "Shopper's Club Membership",
    image: CouponImage,
    description: "You can now refresh a shop once per visit. 20% discount on shop items.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    merchant: {
        discount: 0.2,
        refreshTimes: 1,
    },
};

export const diamond: Item = {
    name: "Diamond",
    image: DiamondImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    description: "+10 max HP.",
    effects: [
        {
            name: "Diamond",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 10,
        },
    ],
};

export const glassShoe: Item = {
    name: "Glass Shoe",
    image: ArwensGlassShoeImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    description: "It's pretty.",
    effects: [],
};

export const tortieShell: Item = {
    name: "Tortie Shell",
    image: TortieShellImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    description: "When you end your turn without armor, gain 3 armor.",
    effects: [
        {
            name: "Tortie Shell",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onTurnEnd: {
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        armor: 0,
                        comparator: "eq",
                    },
                ],
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 3,
            },
        },
    ],
};

export const estherShield: Item = {
    name: "Esther Shield",
    image: EstherShieldImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    description: "When your deck cycles, gain 7 armor.",
    effects: [
        {
            name: "Esther Shield",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeckCycle: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 7,
            },
        },
    ],
};

export const spectrumGoggles: Item = {
    name: "Spectrum Goggles",
    image: SpectrumGogglesImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    description: "When viewing your deck in battle, the cards display in order.",
    effects: [
        {
            name: "Spectrum Goggles",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            viewDeckInOrder: true,
        },
    ],
};

export const redHeartedEarrings: Item = {
    name: "Red-Hearted Earrings",
    image: RedHeartedEarringsImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    description: "When you deplete a card, heal 1 HP.",
    effects: [
        {
            name: "Red-Hearted Earrings",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDepleteAbility: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                healing: 1,
            },
        },
    ],
};

export const fairyWing: Item = {
    name: "Fairy Wing",
    image: FairyWingImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    description: "On wave start, you are immune to Bleed, Burn, and Poison for 4 turns.",
    effects: [
        {
            name: "Fairy Wing Item",
            description: "Immune to Bleed, Burn, and Poison.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Fairy Wing",
                        icon: FairyWingImage,
                        duration: 5,
                        immunities: {
                            type: "effect-type",
                            value: [EFFECT_TYPES.BLEED, EFFECT_TYPES.BURN, EFFECT_TYPES.POISON],
                        },
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                    },
                ],
            },
        },
    ],
};

export const ancientTreeSap: Item = {
    name: "Ancient Tree Sap",
    image: AncientTreeSapImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    description: "Every 3 turns, gain 1 extra resource.",
    effects: [
        {
            name: "Ancient Tree Sap",
            description: "Gaining 1 extra resource every 3 turns.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 3,
            resourcesPerTurn: 1,
        },
    ],
};

export const blueSaunaRobe: Item = {
    name: "Blue Sauna Robe",
    image: BlueSaunaRobeImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    description: "Every 5 turns, gain 1 armor from armor sources.",
    effects: [
        {
            name: "Blue Sauna Robe Item",
            description: "Every 5 turns, gain 1 armor from armor sources.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 5,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Blue Sauna Robe",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        armorReceived: 1,
                    },
                ],
            },
        },
    ],
};

export const steely: Item = {
    name: "Steely",
    image: SteelyImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    description: "When your deck cycles, fling knives that deal 3 damage and apply Bleed to all targets.",
    effects: [
        {
            name: "Steely",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeckCycle: {
                ability: {
                    name: "Steely",
                    image: SteelyImage,
                    actions: [
                        {
                            area: 5,
                            damage: 3,
                            type: ACTION_TYPES.RANGE_ATTACK,
                            target: TARGET_TYPES.RANDOM_HOSTILE,
                            icon: SteelyImage,
                            playbackTime: 500,
                            animationOptions: {
                                rotate: 135,
                                rotateToFaceTarget: true,
                            },
                            effects: [
                                {
                                    ...bleed,
                                    duration: 3,
                                },
                            ],
                        },
                    ],
                },
            },
        },
    ],
};

export const taurospearHorn: Item = {
    name: "Taurospear Horn",
    image: TaurospearHornImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    description: "When an enemy dies, gain 1 resource and draw a card.",
    effects: [
        {
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            name: "Taurospear Horn",
            onHostileDeath: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                resources: 1,
                drawCards: {
                    amount: 1,
                },
            },
        },
    ],
};

export const tauromacisHorn: Item = {
    name: "Tauromacis Horn",
    image: TauromacisHornImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    description: "+2 HP on kill.",
    effects: [
        {
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            name: "Tauromacis Horn",
            lifeOnKill: 2,
        },
    ],
};

export const starEarrings: Item = {
    name: "Star Earrings",
    image: StarEarringsImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    description: "Once per turn, when you Stun, Freeze or Silence an enemy, draw a card.",
    effects: [
        {
            name: "Star Earrings Item",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Star Earrings",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: StarEarringsImage,
                        description: "When you Stun, Freeze or Silence an enemy, draw a card.",
                        duration: 2, // Ticks down immediately
                        onApplyEffect: {
                            conditions: [
                                {
                                    calculationTarget: TRIGGER_TARGET_TYPES.TARGET, // This should be comparing the effect
                                    hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE, EFFECT_TYPES.SILENCE],
                                    comparator: "eq",
                                },
                            ],
                            targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                            drawCards: {
                                amount: 1,
                            },
                            removeEffect: true,
                        },
                    },
                ],
            },
        },
    ],
};

export const brick: Item = {
    name: "Brick",
    image: BrickImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    description: "When your attack would deal less than 5 damage, it deals 5 damage.",
    effects: [
        {
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            name: "Brick",
            minimumAttackDamage: 5,
        },
    ],
};

export const adamantiumPlate: Item = {
    name: "Adamantium Plate",
    description: "Receive 1 less damage when attacked by enemies *not* directly in front of you.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: AdamantiumPlateImage,
    effects: [
        {
            name: "Adamantium Plate",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackDamageReceived: -1,
            conditions: [
                {
                    comparator: "not",
                    proximity: 0,
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                },
            ],
        },
    ],
};

export const wildKargoEye: Item = {
    name: "Wild Kargo Eye",
    description: "Gain 1 attack power against unarmored targets.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: WildKargoEyeImage,
    effects: [
        {
            name: "Wild Kargo Eye",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackPower: 1,
            conditions: [
                {
                    comparator: "eq",
                    armor: 0,
                    calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                },
            ],
        },
    ],
};

export const pigIllustrated: Item = {
    name: "Pig Illustrated",
    description: "When you use an offense ability that costs 2 or more, it has a 50% chance to refund 1 resource.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: PigIllustratedImage,
    effects: [
        {
            name: "Pig Illustrated",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onOffensiveAbility: {
                conditions: [
                    {
                        comparator: "gt",
                        resourceCost: 1,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                    },
                ],
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                chance: 0.5,
                resources: 1,
            },
        },
    ],
};

export const deckOfCards: Item = {
    name: "Deck of Playing Cards",
    description: "On your first turn in battle, you may choose cards to discard, then draw that many.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: ASetOfMemoryCardsImage,
    effects: [
        {
            name: "Deck of Playing Cards",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onBattleStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Mulligan",
                        icon: ASetOfMemoryCardsImage,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        onTurnInProgress: {
                            ability: {
                                name: "Deck of Playing Cards",
                                image: ASetOfMemoryCardsImage,
                                resourceCost: 0,
                                actions: [
                                    {
                                        type: ACTION_TYPES.EFFECT,
                                        target: TARGET_TYPES.SELF,
                                        selectCards: {
                                            type: SELECT_CARD_TYPES.DISCARD_TO_DRAW,
                                        },
                                    },
                                ],
                            },
                            removeEffect: true,
                        },
                    },
                ],
            },
        },
    ],
};

export const flamingFeather: Item = {
    name: "Flaming Feather",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: FlamingFeatherImage,
    description: "When you use an offense card, you have a 33% chance for each resource to Burn an enemy.",
    effects: [
        {
            name: "Flaming Feather",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onOffensiveAbility: {
                conditions: [
                    {
                        comparator: "gt",
                        resourceCost: 1,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                    },
                ],
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                chance: 0.334,
                multiplier: {
                    calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                    type: MULTIPLIER_TYPES.RESOURCES_SPENT,
                },
                ability: {
                    name: "Fire Feather",
                    image: FlamingFeatherImage,
                    actions: [
                        {
                            type: ACTION_TYPES.RANGE_ATTACK,
                            target: TARGET_TYPES.RANDOM_HOSTILE,
                            animation: ANIMATION_TYPES.ONE_WAY,
                            icon: FlamingFeatherImage,
                            animationOptions: {
                                rotate: 135,
                                rotateToFaceTarget: true,
                                flash: 600,
                            },
                            playbackTime: 750,
                            effects: [
                                {
                                    ...burn,
                                    duration: 3,
                                },
                            ],
                        },
                    ],
                },
            },
        },
    ],
};

export const diamondOre: Item = {
    name: "Diamond Ore",
    description: "+7 max HP.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: DiamondOreImage,
    effects: [
        {
            name: "Diamond Ore",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 7,
        },
    ],
};

export const plunger: Item = {
    name: "Plunger",
    description: "When your deck cycles, gain 1 resource and draw a card.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: PlungerImage,
    effects: [
        {
            name: "Plunger",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeckCycle: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                resources: 1,
                drawCards: {
                    amount: 1,
                },
            },
        },
    ],
};

export const tofuSpecial: Item = {
    name: "Tofu Special",
    description: "The first Tofu OR Tofu Soup you purchase at a merchant shop is free.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: NewspaperImage,
    merchant: {
        freeFood: true,
    },
};

export const sword: Item = {
    name: "Sword",
    description: "On wave start, gain +1 attack power for one turn.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: SwordImage,
    effects: [
        {
            name: "Sword Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Sword",
                        icon: WeaponMasteryImage,
                        disableDisplayIcon: true,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        attackPower: 1,
                        duration: 2,
                    },
                ],
            },
        },
    ],
};

export const rabbitFoot: Item = {
    name: "Rabbit Foot",
    description: "Improves your luck at finding higher rarity equipment.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: RabbitFootImage,
    equipment: {
        rareRateIncrease: 0.075,
        uncommonRateIncrease: 0.15,
    },
};

export const blueJeanShorts: Item = {
    name: "Blue Jean Shorts",
    description: "When you play 10 support abilities, gain 1 resource.",
    type: ITEM_TYPES.EQUIPMENT,
    image: BlueJeanShortsImage,
    effects: [
        {
            name: "Blue Jean Shorts",
            description: "When you play 10 support abilities, gain 1 resource.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAbility: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                resources: 1,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        numAbilitiesUsed: {
                            amount: 10,
                            type: ACTION_TYPES.EFFECT,
                        },
                        comparator: "modulo",
                    },
                ],
            },
        },
    ],
};

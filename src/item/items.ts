import { counterEffect } from "./../enemy/effect";
import { bleed, chill, poison, stashCardEffect, thorns } from "../ability/Effects";
import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import {
    AdamantiumPlateImage,
    AdventurerCapeImage,
    AlligatorTubeImage,
    AmethystImage,
    AncientTreeSapImage,
    AquamarineImage,
    ArwensGlassShoeImage,
    ASetOfMemoryCardsImage,
    BackpackImage,
    BallerCaneImage,
    BattleShieldImage,
    BloodMaskImage,
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
    EstherShieldImage,
    FairyWingImage,
    FishSpearImage,
    FlamingFeatherImage,
    GarnetImage,
    GoldenHammerImage,
    GreenBambooHatImage,
    GuidebookImage,
    HerbsImage,
    HotdogImage,
    IcarusCapeImage,
    IronBallImage,
    IronMaceImage,
    KoreanFanImage,
    LeatherSandalsImage,
    LetterImage,
    LuckSackImage,
    MesoCoinImage,
    MesoImage,
    MesoStackImage,
    NewspaperImage,
    OpalImage,
    PanlidImage,
    PawnChessPieceImage,
    PeachImage,
    PicoPicoHammerImage,
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
    ScrollImage,
    SnowshoesImage,
    SpectrumGogglesImage,
    SpikyCollarImage,
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
    ToyHammerImage,
    WeaponMasteryImage,
    WhiteUndershirtImage,
    WildKargoEyeImage,
    WorkGlovesImage,
    YellowHatImage,
} from "../images";
import { armorUp, burn, preventArmorDecayPlayer } from "./../ability/Effects";
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
    description: "On wave start, gain 7 armor.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: StolenFenceImage,
    effects: [
        {
            name: "Stolen Fence",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: StolenFenceImage,
            disableDisplayIcon: true,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 7,
                effects: [{ ...preventArmorDecayPlayer, stacks: 1 }], // Don't want to lose the armor immediately. This does stack with Battle Shield though
            },
        },
    ],
};

export const battleShield: Item = {
    name: "Battle Shield",
    description: "On wave start, gain 10 armor and prevent the next time your armor decays.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: BattleShieldImage,
    effects: [
        {
            name: "Battle Shield",
            description: "On wave start, gain 10 armor and prevent the next time your armor decays.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 10,
                effects: [{ ...preventArmorDecayPlayer, stacks: 2 }], // Ticks down immediately
            },
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
    description: "Overhealing turns into armor for the overhealed amount.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: AmethystImage,
    effects: [
        {
            name: "Amethyst Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveOverhealing: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.OVERHEALING,
                    value: 1,
                },
            },
            onFriendlySummon: {
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                effects: [
                    {
                        name: "Amethyst",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
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
            },
        },
    ],
};

export const redWhip: Item = {
    name: "Red Whip",
    description: "Every turn, draw an extra card.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: RedWhipImage,
    effects: [
        {
            name: "Red Whip",
            description: "Every turn, draw an extra card.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            drawCardsPerTurn: 1,
        },
    ],
};

export const topaz: Item = {
    name: "Topaz",
    description: "Every 7 times you receive damage, gain Thorns.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: TopazImage,
    effects: [
        {
            name: "Topaz",
            description: "Gaining thorns after receiving damage 7 times.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveDamage: {
                effects: [thorns],
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                eventTriggerFrequency: 7,
            },
        },
    ],
};

const sandalsEffect: Effect = {
    name: "Leather Sandals",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: LeatherSandalsImage,
    drawCardsPerTurn: 2,
    duration: 1,
};

export const leatherSandals: Item = {
    name: "Leather Sandals",
    description: "On wave start, draw 2 extra cards.",
    flavourText: "The quintessential footwear of aspiring adventurers.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: LeatherSandalsImage,
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

export const adventurerCape: Item = {
    name: "Adventurer Cape",
    description: "Every 5 times you or an ally are attacked, gain 1 resource.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: AdventurerCapeImage,
    effects: [
        {
            name: "Adventurer Cape Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onFriendlyReceiveAttack: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                eventTriggerFrequency: 5,
                resources: 1,
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
    description: "+2 armor from armor sources.",
    image: PanlidImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    effects: [armorUp, armorUp],
};

export const alligatorTube: Item = {
    name: "Alligator Tube",
    description: "Your summoned minions gain 1 attack power.",
    image: AlligatorTubeImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    effects: [
        {
            name: "Alligator Tube",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onFriendlySummon: {
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                effects: [
                    {
                        name: "Attack Power Increase",
                        disableDisplayIcon: true,
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
    description: "Every turn, your first attack inflicts poison.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: SapOfNependeathImage,
    effects: [
        {
            name: "Nependeath Sap",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
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
                            disableTriggerFromProcs: true,
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
    rarity: RARITIES.UNCOMMON,
    image: AquamarineImage,
    effects: [armorUp],
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
            name: "Garnet Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: GarnetImage,
            disableDisplayIcon: true,
            // Resources are spent right before using an ability, and we want to retain the attack power that ability even if it brings you below the threshold
            onResourcesGained: {
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        resourcePercentage: 0.7,
                        comparator: "gt",
                    },
                ],
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Garnet",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: GarnetImage,
                        disableDisplayIcon: true,
                        attackPower: 3,
                        maxApplications: 1,
                        onAbility: {
                            conditions: [
                                {
                                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                    resourcePercentage: 0.8,
                                    comparator: "lt",
                                },
                            ],
                            removeEffect: true,
                        },
                    },
                ],
            },
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
    description: "Once per turn, counter for 1 damage when attacked.",
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
                        ...counterEffect,
                        name: "Retaliation",
                        description: "Countering on the next attack",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: PigsRibbonImage,
                        canBeSilenced: true,
                        duration: 2,
                        onReceiveAttack: {
                            disableTriggerFromProcs: true,
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
                        onTurnStart: {
                            removeEffect: true,
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
    description: "When you receive a status effect from an ability, gain 2 armor.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Green Bamboo Hat",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveEffect: {
                disableTriggerFromProcs: true,
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 2,
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
                            type: [ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK],
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
    description: "When you Deplete a card, you Radiate 3 damage to enemies.",
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
                                damage: 3,
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
                                        excludeEffectOwner: true,
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
                        duration: 0,
                        onTurnInProgress: {
                            removeEffect: true,
                        },
                    },
                ],
            },
        },
    ],
};

export const workGloves: Item = {
    name: "Work Gloves",
    image: WorkGlovesImage,
    description: "Every 10 abilities you use, gain 1 attack power. Max 3.",
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
                        numAbilitiesUsed: 10,
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
                        maxApplications: 3,
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

export const snailStompers: Item = {
    name: "Snail Stompers",
    image: SnowshoesImage,
    description: "+3 attack power against enemies with 15 or less HP.",
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
                    HP: 16,
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
    description: "When your deck cycles, gain 9 armor.",
    effects: [
        {
            name: "Esther Shield",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeckCycle: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 9,
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
    rarity: RARITIES.COMMON,
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
    description: "On wave start, you are immune to Bleed, Burn, and Poison for 5 turns.",
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
    description: "Every 3 turns, gain +1 armor from armor sources.",
    effects: [
        {
            name: "Blue Sauna Robe Item",
            description: "Every 3 turns, gain +1 armor from armor sources.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 3,
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
    description: "Every 12 cards you draw, fling knives that deal 3 damage and apply Bleed to all targets.",
    effects: [
        {
            name: "Steely",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDrawCard: {
                triggerFrequencyFromSum: 12,
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
    description: "When you kill an enemy, gain 1 resource.",
    effects: [
        {
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            name: "Taurospear Horn",
            onFriendlyKill: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                resources: 1,
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
                        disableDisplayIcon: true,
                        duration: 1,
                        onApplyEffect: {
                            conditions: [
                                {
                                    calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                    hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE, EFFECT_TYPES.SILENCE],
                                    comparator: "includes",
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
    description: "Take 1 less damage when attacked by enemies 1 space away.",
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
                    comparator: "eq",
                    proximity: 1,
                    calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
                },
            ],
        },
    ],
};

export const wildKargoEye: Item = {
    name: "Wild Kargo Eye",
    description: "Gain 1 attack power against debuffed targets.",
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
                    hasEffectClass: EFFECT_CLASSES.DEBUFF,
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
                removeEffect: true,
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
    description: "When you use an offense card, you have a 50% chance for each resource to Burn an enemy.",
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
                chance: 0.5,
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
    description: "When you play 7 support abilities, gain 1 resource.",
    type: ITEM_TYPES.EQUIPMENT,
    image: BlueJeanShortsImage,
    effects: [
        {
            name: "Blue Jean Shorts",
            description: "When you play 7 support abilities, gain 1 resource.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAbility: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                resources: 1,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        numAbilitiesUsed: {
                            amount: 7,
                            type: [ACTION_TYPES.EFFECT],
                        },
                        comparator: "modulo",
                    },
                ],
            },
        },
    ],
};

export const tShirt: Item = {
    name: "White T-Shirt",
    description: "If you spend a turn without attacking, gain a resource next turn.",
    type: ITEM_TYPES.EQUIPMENT,
    image: WhiteUndershirtImage,
    effects: [
        {
            name: "White T-Shirt Effect",
            description: "If you spend a turn without attacking, gain a resource next turn.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "White T-Shirt",
                        description: "If you spend a turn without attacking, gain a resource next turn.",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        onOffensiveAbility: {
                            removeEffect: true,
                        },
                        onTurnEnd: {
                            targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                            effects: [
                                {
                                    name: "White T-Shirt",
                                    icon: WhiteUndershirtImage,
                                    type: EFFECT_TYPES.NONE,
                                    class: EFFECT_CLASSES.BUFF,
                                    resourcesPerTurn: 1,
                                    onTurnInProgress: {
                                        removeEffect: true,
                                    },
                                },
                            ],
                        },
                        duration: 1,
                    },
                ],
            },
        },
    ],
};

export const mesoItem: Item = {
    name: "Mesos",
    description: "Grants 100 mesos when you pick this up.",
    type: ITEM_TYPES.CONSUMABLE,
    image: MesoImage,
    pickUp: {
        mesos: 100,
    },
};

export const bigMesoItem: Item = {
    name: "More Mesos",
    description: "Grants 200 mesos when you pick this up.",
    type: ITEM_TYPES.CONSUMABLE,
    rarity: RARITIES.UNCOMMON,
    image: MesoCoinImage,
    pickUp: {
        mesos: 200,
    },
};

export const hugeMesoItem: Item = {
    name: "Many Mesos",
    description: "Grants 300 mesos when you pick this up.",
    type: ITEM_TYPES.CONSUMABLE,
    rarity: RARITIES.RARE,
    image: MesoStackImage,
    pickUp: {
        mesos: 300,
    },
};

export const theBackpack: Item = {
    name: "The Backpack",
    description: "Once per turn, when you select a card in your hand, you may move it to the top of your deck.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: BackpackImage,
    effects: [
        {
            name: "The Backpack Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        hasEffect: stashCardEffect.name,
                        comparator: "not",
                    },
                ],
                effects: [stashCardEffect],
            },
        },
    ],
};

export const icarusCape: Item = {
    name: "Icarus Cape",
    description: "Every 2 turns, draw an extra card.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: IcarusCapeImage,
    effects: [
        {
            name: "Icarus Cape",
            description: "Every 2 turns, draw an extra card.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 2,
            drawCardsPerTurn: 1,
        },
    ],
};

export const bloodMask: Item = {
    name: "Blood Mask",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: BloodMaskImage,
    description: "Once per turn, when you apply a Bleed, Silence, or Stun, draw a card.",
    effects: [
        {
            name: "Blood Mask Item",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Blood Mask",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: BloodMaskImage,
                        disableDisplayIcon: true,
                        description: "When you apply a Bleed, Silence, or Stun, draw a card.",
                        duration: 1,
                        onApplyEffect: {
                            conditions: [
                                {
                                    calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                    hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.BLEED, EFFECT_TYPES.SILENCE],
                                    comparator: "includes",
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

export const peach: Item = {
    name: "Peach",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: PeachImage,
    description: "+15 max HP.",
    effects: [
        {
            name: "Peach",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 15,
        },
    ],
};

export const incenseLeaves: Item = {
    name: "Incense Leaves",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: HerbsImage,
    description: "You can remove an ability from your deck when camping.",
    camp: {
        allowAbilityRemoval: true,
    },
};

export const toyHammer: Item = {
    name: "Toy Hammer",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: PicoPicoHammerImage,
    description: "Every turn, a random card in your hand is Upgraded until discarded.",
    effects: [
        {
            name: "Toy Hammer",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onTurnInProgress: {
                applyAbilityEffects: {
                    pile: "hand",
                    amount: 1,
                    abilityEffects: [
                        {
                            upgradedByLevels: 1,
                        },
                    ],
                },
            },
        },
    ],
};

export const chessPiece: Item = {
    name: "Chess Piece",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: PawnChessPieceImage,
    description: "Once per turn, you may change the position of a character you control.",
    effects: [
        {
            name: "Chess Piece Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Chess Piece",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.NONE,
                        allowFriendlyMovement: true,
                        onFriendlyMove: {
                            decrementStacks: 1,
                        },
                    },
                ],
            },
        },
    ],
};

export const ironBall: Item = {
    name: "Iron Ball",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: IronBallImage,
    description: "Gain 1 attack power against Armored targets.",
    effects: [
        {
            name: "Iron Ball",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackPower: 1,
            conditions: [
                {
                    armor: 0,
                    comparator: "gt",
                    calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                },
            ],
        },
    ],
};

export const scrollForClawForAtt: Item = {
    name: "Scroll for Claw for ATT 60%",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: ScrollImage,
    description: "Cards may be upgraded to level 3 on the Upgrade screen.",
    upgradeScreen: {
        maxUpgradeLevel: 1,
    },
};

export const opal: Item = {
    name: "Opal",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: OpalImage,
    description: "Your buffs are extended by 1 turn.",
    effects: [
        {
            name: "Opal Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            extendEffectDuration: {
                amount: 1,
                filters: [
                    {
                        property: "class",
                        comparator: "eq",
                        value: EFFECT_CLASSES.BUFF,
                    },
                ],
            },
        },
    ],
};

export const yellowHat: Item = {
    name: "Yellow Hat",
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: YellowHatImage,
    description: "Every 5 times your summoned minions use an ability, gain 1 resource and draw a card.",
    effects: [
        {
            name: "Yellow Hat Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onFriendlyAbility: {
                excludeEffectOwner: true,
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                eventTriggerFrequency: 5,
                resources: 1,
                drawCards: {
                    amount: 1,
                },
            },
        },
    ],
};

export const spikyCollar: Item = {
    name: "Bain's Spiky Collar",
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: SpikyCollarImage,
    description: "When one of your summoned minions is attacked, it will Counter that enemy for 3 damage.",
    effects: [
        {
            name: "Bain's Spiky Collar Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onFriendlySummon: {
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                effects: [
                    {
                        ...counterEffect,
                        image: undefined,
                        disableDisplayIcon: true,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                    },
                ],
            },
        },
    ],
};

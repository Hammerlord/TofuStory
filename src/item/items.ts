import {
    attackDown,
    attackPower,
    bleed,
    chill,
    directDamageTakenTrigger,
    infuriateEffect,
    lupinCurse,
    poison,
    stashCardEffect,
    stun,
    taunt,
    thorns,
} from "../ability/Effects";
import { firstExiledArm, fourthExiledArm, secondExiledArm, thirdExiledArm } from "../ability/neutralAbilities";
import { dustDevilsActiveAbility } from "../ability/warrior/warriorAbilities";
import { BATTLE_TYPES, TRIGGER_SOURCE_TYPES } from "../battle/types";
import {
    AdamantiumPlateImage,
    AdventurerCapeImage,
    AlligatorTubeImage,
    AmethystImage,
    AncientTreeSapImage,
    AquamarineImage,
    ArcStaffImage,
    ArwensGlassShoeImage,
    ASetOfMemoryCardsImage,
    BackpackImage,
    BallerCaneImage,
    BattleShieldImage,
    BlackCrystalImage,
    BloodMaskImage,
    BlueJeanShortsImage,
    BluePotionImage,
    BlueSaunaRobeImage,
    BoneHelmImage,
    BouquetImage,
    BrickImage,
    BronzeIncenseBurnerImage,
    BroomImage,
    CactusImage,
    CoffeePotImage,
    CouponImage,
    CursedDollImage,
    DiamondImage,
    DiamondOreImage,
    DrakeBloodImage,
    EmeraldImage,
    EstherShieldImage,
    FairyWingImage,
    FishSpearImage,
    FlamingFeatherImage,
    GarnetImage,
    GoldenHammerImage,
    GoldenPrideImage,
    GreenBambooHatImage,
    GuidebookImage,
    HardwoodWandImage,
    HerbsImage,
    IcarusCapeImage,
    IronBallImage,
    IronMaceImage,
    KoreanFanImage,
    LeatherSandalsImage,
    LetterImage,
    LuckSackImage,
    MedicineWithWeirdVibesImage,
    MesoCoinImage,
    MesoImage,
    MesoStackImage,
    NamelessSwordImage,
    NewspaperImage,
    NewYearRiceSoupImage,
    OpalImage,
    PanlidImage,
    PawnChessPieceImage,
    PeachImage,
    PersonalAnvilImage,
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
    StarEarringsImage,
    StarfallMagicSquareImage,
    SteelyImage,
    StolenFenceImage,
    SunflowerImage,
    SunshinePanImage,
    SwordImage,
    TauromacisHornImage,
    TaurospearHornImage,
    ThunderSparkImage,
    TofuImage,
    TopazImage,
    TortieShellImage,
    VikingHelmImage,
    WeaponMasteryImage,
    WhiteUndershirtImage,
    WildKargoEyeImage,
    WorkGlovesImage,
    YellowHatImage,
    YellowStarryBandanaImage,
    ZakumHelmetImage,
} from "../images";
import { armorUp, burn, preventArmorDecayPlayer } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    CARD_PILE_TYPES,
    CONDITION_TARGETS,
    Effect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MULTIPLIER_TYPES,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { counterEffect } from "./../enemy/effect";

import { Item, ITEM_TYPES, RARITIES } from "./types";

export const stolenFence: Item = {
    name: "Stolen Fence",
    description: "Wave start: gain {{ effects.0.onWaveStart.armor }} Armor.",
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
            },
        },
    ],
};

export const battleShield: Item = {
    name: "Battle Shield",
    description: "Wave start: gain {{ effects.0.onWaveStart.armor }} Armor and 1 Pristine Armor.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: BattleShieldImage,
    effects: [
        {
            name: "Battle Shield",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 5,
                effects: [{ ...preventArmorDecayPlayer }],
            },
        },
    ],
};

export const safetyCharm: Item = {
    name: "Safety Charm",
    description: "Heal {{ effects.0.onWaveClear.healing }} HP on wave clear.",
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
    description: "+1 ATT.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: DrakeBloodImage,
    applyEffectsToSummons: true,
    effects: [
        {
            name: "Drake Blood",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: DrakeBloodImage,
            disableDisplayIcon: true,
            attackPower: 1,
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
    description: "Overhealing grants Armor for that amount. Not affected by Armor Up.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: AmethystImage,
    applyEffectsToSummons: true,
    effects: [
        {
            name: "Amethyst Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveOverhealing: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                flatArmor: 1,
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
    description: "Every {{ effects.0.onReceiveDamage.eventTriggerFrequency }} times you take damage, gain Thorns.",
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

export const leatherSandals: Item = {
    name: "Leather Sandals",
    description: "Draw {{ effects.0.onWaveStart.effects.0.drawCardsPerTurn }} extra cards at the start of a wave.",
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
                effects: [
                    {
                        name: "Leather Sandals",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: LeatherSandalsImage,
                        drawCardsPerTurn: 2,
                        duration: 1,
                        onTurnInProgress: {
                            removeEffect: true,
                        },
                    },
                ],
            },
        },
    ],
};

export const adventurerCape: Item = {
    name: "Adventurer Cape",
    description:
        "Every {{ effects.0.onFriendlyReceiveAttack.eventTriggerFrequency }} times you or an ally are attacked, gain 1 {{ resources }} next turn.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: AdventurerCapeImage,
    effects: [
        {
            name: "Adventurer Cape Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onFriendlyReceiveAttack: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                eventTriggerFrequency: 7,
                effects: [
                    {
                        name: "Adventurer Cape",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        resourcesPerTurn: 1,
                        onTurnInProgress: {
                            removeEffect: true,
                        },
                    },
                ],
            },
        },
    ],
};

export const guideBook: Item = {
    name: "Guide Book",
    description: "Card reward selections offer an extra card choice.",
    image: GuidebookImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    abilityChoices: {
        amount: 1,
    },
};

export const panlid: Item = {
    name: "Pan Lid",
    description: "+1 Armor Up.",
    image: PanlidImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    applyEffectsToSummons: true,
    effects: [armorUp],
};

export const alligatorTube: Item = {
    name: "Alligator Tube",
    description: "Your summons gain +1 ATT.",
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
                effects: [attackPower],
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
                            effects: [{ ...poison, stacks: 1 }],
                        },
                    },
                ],
            },
        },
    ],
};

export const coffeePot: Item = {
    name: "Coffee Pot",
    description: "You can perform an extra activity at campsites.",
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
    description: "Restore an additional 10 HP at campsites.",
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

export const tofu: Item = {
    name: "Tofu",
    image: TofuImage,
    type: ITEM_TYPES.OTHER, // Equips are unique, and this can stack
    description: "+3 max HP.",
    isStackable: true,
    effects: [
        {
            name: "Tofu",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            maxHP: 3,
        },
    ],
};

export const tofuSoup: Item = {
    name: "Tofu Soup",
    image: NewYearRiceSoupImage,
    description: "Restore 15 HP.",
    type: ITEM_TYPES.CONSUMABLE,
};

export const pieceOfIce: Item = {
    name: "Piece of Ice",
    description: "Every {{ effects.0.turnsTriggerFrequency }} turns, characters who attack you are chilled.",
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
    description: "Gain 2 Pristine Armor at the start of a wave.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: AquamarineImage,
    effects: [
        {
            name: "Aquamarine",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [{ ...preventArmorDecayPlayer, stacks: 2 }],
            },
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
    description: "+{{ effects.0.onResourcesGained.effects.0.attackPower }} ATT while you have at least 3 {{ resources }}.",
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
                        property: "resources",
                        value: 2,
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
                        attackPower: 1,
                        maxApplications: 1,
                        onAbility: {
                            conditions: [
                                {
                                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                    property: "resources",
                                    value: 3,
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
    description: "+1 ATT against elite enemies and bosses.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    applyEffectsToSummons: true,
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
    description: "+1 ATT against common enemies.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    applyEffectsToSummons: true,
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

const pigsRibbonCounter: Effect = {
    ...counterEffect,
    name: "Counter",
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
            name: "Counter",
            image: NamelessSwordImage,
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
};

export const pigsRibbonItem: Item = {
    name: "Pig's Ribbon",
    image: PigsRibbonImage,
    description: "Once per turn, gain Counter for 1 damage.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    applyEffectsToSummons: true,
    effects: [
        {
            name: "Pig's Ribbon Effect",
            description: "Once per turn, this character will counter when attacked.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: true,
            onTurnEnd: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [pigsRibbonCounter],
            },
        },
    ],
};

export const ballerCane: Item = {
    name: "Baller Cane",
    image: BallerCaneImage,
    description: "Whenever you play a card, gain 1 meso.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Baller Cane",
            description: "Gaining 1 meso for every card played.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onPlayCard: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                mesos: 1,
            },
        },
    ],
};

export const greenBambooHat: Item = {
    name: "Green Bamboo Hat",
    image: GreenBambooHatImage,
    description: "When you receive a status effect from an ability, gain {{ effects.0.onReceiveEffect.armor }} Armor.",
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
                armor: 1,
            },
        },
    ],
};

export const koreanFan: Item = {
    name: "Korean Fan",
    image: KoreanFanImage,
    description: "Every 3 turns, hurl a fan that inflicts 1 Bleed.",
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
                            effects: [{ ...bleed, stacks: 1 }],
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
    description: "Once per battle, when your deck cycles, gain 1 ATT.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    effects: [
        {
            name: "Rising Star Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeckCycle: {
                removeEffect: true,
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
    applyEffectsToSummons: true,
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
    description: "Curse a random enemy to take damage when its allies are attacked.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Cursed Doll Holder",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                ability: {
                    name: "Cursed Doll",
                    image: CursedDollImage,
                    actions: [
                        {
                            type: ACTION_TYPES.NONE,
                            target: TARGET_TYPES.RANDOM_HOSTILE,
                            icon: CursedDollImage,
                            animation: ANIMATION_TYPES.ACTION_EXPLODE,
                            effects: [lupinCurse],
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
    description: "Gain an extra {{ resources }} at the start of a wave.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    effects: [
        {
            name: "Red Headband Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Red Headband",
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
    description: "Every {{ effects.0.onAbility.triggerFrequencyFromSum }} cards played, gain +1 ATT. Max 3.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    effects: [
        {
            name: "Work Gloves Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onPlayCard: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                triggerFrequencyFromSum: 10,
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
    description: "+3 ATT against enemies with 15 or less HP.",
    applyEffectsToSummons: true,
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
    description: "20% discount on shop items. Each shop visit, the first refresh is free.",
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
    description: "When you end your turn without Armor, gain {{ effects.0.onTurnEnd.armor }} Armor.",
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
    description: "When your deck cycles, gain {{ effects.0.onDeckCycle.armor }} Armor.",
    applyEffectsToSummons: true,
    effects: [
        {
            name: "Esther Shield",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeckCycle: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 5,
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
    description: "When you Deplete a card, heal 1 HP.",
    applyEffectsToSummons: true,
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
    description: "You are immune to Bleed, Burn, and Poison for 5 turns on wave start.",
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
    description: "Every {{ effects.0.turnsTriggerFrequency }} turns, gain {{ effects.0.resourcesPerTurn }} extra {{ resources }}.",
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
    description: "+2 Armor Up.",
    effects: [armorUp, armorUp],
};

export const steely: Item = {
    name: "Steely",
    image: SteelyImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    description: "Every {{ effects.0.onDrawCard.triggerFrequencyFromSum }} cards drawn, fling knives that apply 1 Bleed to all targets.",
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
                            type: ACTION_TYPES.RANGE_ATTACK,
                            target: TARGET_TYPES.RANDOM_HOSTILE,
                            icon: SteelyImage,
                            animationOptions: {
                                rotate: 135,
                                rotateToFaceTarget: true,
                            },
                            effects: [
                                {
                                    ...bleed,
                                    stacks: 1,
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
    description: "When you kill a threatening enemy, gain 1 {{ resources }}.",
    effects: [
        {
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            name: "Taurospear Horn",
            onFriendlyKill: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                resources: 1,
                conditions: [
                    {
                        property: "abilities.0",
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        value: undefined,
                        comparator: "not",
                    },
                ],
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
    applyEffectsToSummons: true,
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
    rarity: RARITIES.UNCOMMON,
    description:
        "When an attack would deal less than {{ effects.0.minimumAttackDamage }} damage, it deals {{ effects.0.minimumAttackDamage }} damage.",
    applyEffectsToSummons: true,
    effects: [
        {
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            name: "Brick",
            minimumAttackDamage: 3,
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
    description: "+1 ATT against debuffed targets.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: WildKargoEyeImage,
    applyEffectsToSummons: true,
    effects: [
        {
            name: "Wild Kargo Eye",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
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
    description: "When you use a 2+ cost card, it has a 50% chance to refund 1 {{ resources }}.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: PigIllustratedImage,
    effects: [
        {
            name: "Pig Illustrated",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAbility: {
                conditions: [
                    {
                        comparator: "gt",
                        resourceCost: 1,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
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
    description: "On battle start, you may choose cards to discard, then draw that many.",
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
    description: "When you use an offense card, you have a 50% chance for each {{ resources }} to cast 1 Burn.",
    effects: [
        {
            name: "Flaming Feather",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onOffensiveAbility: {
                disableTriggerFromProcs: true,
                conditions: [
                    {
                        comparator: "gt",
                        resourceCost: 0,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
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
                            type: ACTION_TYPES.EFFECT,
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
                                    stacks: 1,
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
    description: "When your deck cycles, gain 1 {{ resources }} and draw a card.",
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
    description: "The first Tofu OR Tofu Soup you buy at a shop is free.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: NewspaperImage,
    merchant: {
        freeFood: true,
    },
};

export const sword: Item = {
    name: "Sword",
    description:
        "+{{ effects.0.onWaveStart.effects.0.attackPower }} ATT for the first {{ effects.0.onWaveStart.effects.0.duration }} turns of a wave.",
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
                        duration: 3,
                    },
                ],
            },
        },
    ],
};

export const rabbitFoot: Item = {
    name: "Rabbit Foot",
    description: "Improves your luck at finding rarer equipment.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: RabbitFootImage,
    equipment: {
        rareRateIncrease: 0.05,
        uncommonRateIncrease: 0.1,
    },
};

export const blueJeanShorts: Item = {
    name: "Blue Jean Shorts",
    description: "When you play {{ effects.0.onSupportAbility.triggerFrequencyFromSum }} support cards, gain 1 {{ resources }}.",
    type: ITEM_TYPES.EQUIPMENT,
    image: BlueJeanShortsImage,
    effects: [
        {
            name: "Blue Jean Shorts",
            description: "When you play 9 support abilities, gain 1 resource.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onSupportAbility: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                resources: 1,
                triggerFrequencyFromSum: 9,
                disableTriggerFromProcs: true,
            },
        },
    ],
};

export const sunflower: Item = {
    name: "Sunflower",
    description: "+2 max HP.",
    applyEffectsToSummons: true,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: SunflowerImage,
    effects: [
        {
            name: "Sunflower",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 2,
        },
    ],
};

export const personalAnvil: Item = {
    name: "Personal Anvil",
    description: "You can Transmute an ability at campsites.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: PersonalAnvilImage,
    camp: {
        allowTransmute: true,
    },
};

export const tShirt: Item = {
    name: "White T-Shirt",
    description: "If you spend a turn without attacking, gain 1 {{ resources }} next turn.",
    type: ITEM_TYPES.EQUIPMENT,
    image: WhiteUndershirtImage,
    effects: [
        {
            name: "White T-Shirt Effect",
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
    description: "Once per turn, you may move a selected card to the top of your deck.",
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
                effects: [stashCardEffect],
            },
        },
    ],
};

export const icarusCape: Item = {
    name: "Icarus Cape",
    description: "Every {{ effects.0.turnsTriggerFrequency }} turns, draw an extra card.",
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
                                    sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
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
    description: "You can remove an ability from your deck at campsites.",
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
                    pile: CARD_PILE_TYPES.HAND,
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
    description: "+1 ATT against Armored targets.",
    applyEffectsToSummons: true,
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

export const starryBandana: Item = {
    name: "Yellow Starry Bandana",
    image: YellowStarryBandanaImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    description: "When a minion dies, draw a card.",
    effects: [
        {
            name: "Yellow Starry Bandana Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onFriendlyDeath: {
                drawCards: {
                    amount: 1,
                },
            },
        },
    ],
};

export const scrollForClawForAtt: Item = {
    name: "Scroll for Claw for ATT 60%",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: ScrollImage,
    description: "Offense cards may be upgraded to level 3.",
    upgradeScreen: {
        maxUpgradeLevel: 1,
        filters: [{ isOffense: true }],
    },
};

/* Old opal: way too strong! consider only extending non-proc buffs if we want to restore this
export const opal: Item = {
    name: "Opal",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: OpalImage,
    description: "Your non-Immunity buffs are extended by 1 turn.",
    applyEffectsToSummons: true,
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
                    {
                        property: "type",
                        comparator: "not",
                        value: EFFECT_TYPES.IMMUNITY,
                    },
                ],
            },
        },
    ],
};
*/

export const opal: Item = {
    name: "Opal",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: OpalImage,
    description: "Gain +1 ATT on one turn, then +1 Armor Up on the next, alternating turns.",
    effects: [
        {
            name: "Opal - Attack Power",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            turnsTriggerFrequency: 2,
            uptime: 2,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        ...attackPower,
                        duration: 1,
                    },
                ],
            },
        },
        {
            name: "Opal - Armor Up",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            turnsTriggerFrequency: 2,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        ...armorUp,
                        duration: 1,
                    },
                ],
            },
        },
    ],
};

export const emerald: Item = {
    name: "Emerald",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: EmeraldImage,
    description: "+1 max {{ resources }}.",
    effects: [
        {
            name: "Emerald Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            maxResources: 1,
        },
    ],
};

export const yellowHat: Item = {
    name: "Yellow Hat",
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: YellowHatImage,
    description: "On battle start, play a random minion from your deck.",
    effects: [
        {
            name: "Yellow Hat Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onBattleStart: {
                playCards: {
                    amount: 1,
                    filters: [
                        {
                            property: "minion",
                            value: undefined,
                            comparator: "not",
                        },
                    ],
                },
            },
        },
    ],
};

export const arcStaff: Item = {
    name: "Arc Staff",
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: ArcStaffImage,
    description:
        "Every {{ effects.0.onFriendlyReceiveAttack.eventTriggerFrequency }} attacks received by you and your allies, Stun the last attacker.",
    effects: [
        {
            name: "Arc Staff Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onFriendlyReceiveAttack: {
                targetType: TRIGGER_TARGET_TYPES.ACTOR,
                eventTriggerFrequency: 8,
                ability: {
                    name: "Enough!",
                    image: ArcStaffImage,
                    actions: [
                        {
                            type: ACTION_TYPES.RANGE_ATTACK,
                            target: TARGET_TYPES.RANDOM_HOSTILE,
                            animation: ANIMATION_TYPES.ONE_WAY,
                            icon: ThunderSparkImage,
                            animationOptions: {
                                rotateToFaceTarget: true,
                                rotate: 135,
                                flash: 500,
                            },
                            effects: [{ ...stun, duration: 2 }],
                        },
                    ],
                },
            },
        },
    ],
};

/**
 * Ever since the change with DoTs to use stacks instead of duration, this version of Black Crystalhas become very weak/niche
 *
export const blackCrystal: Item = {
    name: "Black Crystal",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: BlackCrystalImage,
    description: "The non-Stun debuffs you apply are extended by 1 turn.",
    overrideTooltip: true,
    tooltip: {
        title: "Debuff",
        description: "A negative status effect, such as Stun or Bleed.",
    },
    applyEffectsToSummons: true,
    effects: [
        {
            name: "Black Crystal Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            extendEffectDuration: {
                amount: 1,
                filters: [
                    {
                        property: "class",
                        comparator: "eq",
                        value: EFFECT_CLASSES.DEBUFF,
                    },
                    {
                        property: "type",
                        comparator: "not",
                        value: EFFECT_TYPES.FREEZE,
                    },
                    {
                        property: "type",
                        comparator: "not",
                        value: EFFECT_TYPES.STUN,
                    },
                ],
            },
        },
    ],
};
*/

export const blackCrystal: Item = {
    name: "Black Crystal",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: BlackCrystalImage,
    description: "The first time a target is hit by you, it is afflicted with 1 Bleed and 1 ATT Down.",
    effects: [
        {
            name: "Black Crystal Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onAttack: {
                targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
                effects: [
                    { ...bleed, stacks: 1 },
                    { ...attackDown, duration: 1 },
                    { name: "Black Crystal Triggered", type: EFFECT_TYPES.NONE, class: EFFECT_CLASSES.NONE },
                ],
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.ALL_TARGETS,
                        hasEffect: "Black Crystal Triggered",
                        comparator: "not",
                    },
                ],
            },
        },
    ],
};

export const hardwoodWand: Item = {
    name: "Hardwood Wand",
    rarity: RARITIES.COMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: HardwoodWandImage,
    description: "Your 0-cost attacks deal +3 damage.",
    effects: [
        {
            name: "Hardwood Wand Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            attackPower: 3,
            conditions: [
                {
                    calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                    sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                    comparator: "eq",
                    resourceCost: 0,
                    isOffense: true,
                    // Tricky: proc abilities in actuality have sourceType TRIGGER_SOURCE_TYPES.EFFECT because procs so often come from effects.
                    // Hence the above configured sourceType isn't read by the condition calculator for abilities that come from procs.
                    notProc: true,
                },
            ],
        },
    ],
};

export const broom: Item = {
    name: "Broom",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: BroomImage,
    description: "Each card played has a 33% chance per {{ resources }} spent to cast Dust Devils.",
    effects: [
        {
            name: "Broom",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onPlayCard: {
                disableTriggerFromProcs: true,
                conditions: [
                    {
                        comparator: "gt",
                        resourceCost: 0,
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                    },
                ],
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                chance: 0.334,
                multiplier: {
                    calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                    type: MULTIPLIER_TYPES.RESOURCES_SPENT,
                },
                ability: dustDevilsActiveAbility,
            },
        },
    ],
};

export const zakumHelmet: Item = {
    name: "Zakum Helmet",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: ZakumHelmetImage,
    tooltip: {
        title: "Arm of the Exiled One",
        icon: ZakumHelmetImage,
        description: "Assemble the Four Arms to tap into a forbidden power.",
    },
    overrideTooltip: true,
    description: "Wave start: gain +1 {{ resources }} and card draw. Elites always offer an Arm of the Exiled One.",
    abilityChoices: {
        battleTypes: [BATTLE_TYPES.BOSS, BATTLE_TYPES.ELITE_ENCOUNTER],
        amount: 1,
        abilities: [firstExiledArm, secondExiledArm, thirdExiledArm, fourthExiledArm],
    },
    effects: [
        {
            name: "Zakum Helmet Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Zakum Helmet",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: ZakumHelmetImage,
                        resourcesPerTurn: 1,
                        drawCardsPerTurn: 1,
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

export const goldenPride: Item = {
    name: "Golden Pride",
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    description: "When you Taunt, gain Thorns. When you gain Thorns, Taunt.",
    image: GoldenPrideImage,
    effects: [
        {
            name: "Golden Pride Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onReceiveEffect: [
                {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    conditions: [
                        {
                            calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
                            hasEffectType: [EFFECT_TYPES.TAUNT],
                            comparator: "eq",
                        },
                    ],
                    effects: [{ ...thorns, duration: 2 }],
                },
                {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    conditions: [
                        {
                            calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
                            property: "name",
                            comparator: "eq",
                            value: thorns.name,
                        },
                    ],
                    effects: [{ ...taunt, duration: 2 }],
                },
            ],
        },
    ],
};

export const medicineWithWeirdVibes: Item = {
    name: "Medicine with Weird Vibes",
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    description: "If you take unblocked damage, heal 1 HP next turn.",
    image: MedicineWithWeirdVibesImage,
    effects: [
        {
            name: "Medicine with Weird Vibes",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                healing: 1,
                conditions: [
                    {
                        hasEffect: directDamageTakenTrigger.name,
                        comparator: "eq",
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    },
                ],
            },
        },
    ],
};

import { CRITICAL_KEYWORD } from "../ability/AbilityView/constants";
import { aimEffect } from "../ability/bowman/bowmanAbilities";
import {
    attackDown,
    attackPower,
    bideEffect,
    bleed,
    chill,
    defDown,
    directDamageTaken,
    lupinCurse,
    poison,
    stashCardEffect,
    stun,
    taunt,
    thorns,
} from "../ability/Effects";
import { lesserBolt } from "../ability/magician/defaultAttacks";
import { firstExiledArm, fourthExiledArm, secondExiledArm, thirdExiledArm } from "../ability/neutralAbilities";
import { bide, dustDevilsActiveAbility, furiousStrikeCard } from "../ability/warrior/warriorAbilities";
import { BATTLE_TYPES, TRIGGER_SOURCE_TYPES } from "../battle/types";
import { attack } from "../enemy/abilities";
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
    AvengersArrowImage,
    BackpackImage,
    BainsSpikyCollarImage,
    BallerCaneImage,
    BattleShieldImage,
    BlackCrystalImage,
    BlackDragonRobeImage,
    BloodMaskImage,
    BlueChaosRobeImage,
    BlueJeanShortsImage,
    BluePotionImage,
    BlueSaunaRobeImage,
    BoneHelmImage,
    BouquetImage,
    BrickImage,
    BrokenSpearImage,
    BronzeIncenseBurnerImage,
    BroomImage,
    CactusImage,
    CoffeePotImage,
    CouponImage,
    CursedDollImage,
    CutlassImage,
    DarkPoleFeatherHatImage,
    DiamondImage,
    DiamondOreImage,
    DioramaImage,
    DragonLordPendantImage,
    DrakeBloodImage,
    DrakeSkullImage,
    EmeraldImage,
    EstherShieldImage,
    FairyWingImage,
    FishSpearImage,
    FlamingFeatherImage,
    ForkOnAStickImage,
    FruitKnifeImage,
    GarnetImage,
    GladiusImage,
    GoldenHammerImage,
    GoldenPrideImage,
    GreenBambooHatImage,
    GreenJesterImage,
    GreenMaskImage,
    GuidebookImage,
    HardwoodWandImage,
    HerbsImage,
    IcarusCapeImage,
    IronBallImage,
    IronMaceImage,
    KoreanFanImage,
    LeatherSandalsImage,
    LetterImage,
    LucidaTailImage,
    LuckSackImage,
    MapleDoomSingerImage,
    MedicineWithWeirdVibesImage,
    MesoCoinImage,
    MesoImage,
    MesoStackImage,
    NamelessSwordImage,
    NewspaperImage,
    NewYearRiceSoupImage,
    OlympusImage,
    OpalImage,
    PanlidImage,
    PawnChessPieceImage,
    PeachImage,
    PersonalAnvilImage,
    PhoenixWandImage,
    PicoPicoHammerImage,
    PieceOfIceImage,
    PigIllustratedImage,
    PigsRibbonImage,
    PlungerImage,
    PolearmImage,
    PrettyPinkBeanBalloonImage,
    RabbitFootImage,
    RedDukeImage,
    RedHeadbandImage,
    RedHeartedEarringsImage,
    RedPotionImage,
    RedWhipImage,
    RespawnTokenImage,
    RisingStarImage,
    SafetyCharmImage,
    SapOfNependeathImage,
    ScimitarImage,
    ScrollImage,
    SilverSnowboardImage,
    SnowshoesImage,
    SpectrumGogglesImage,
    StarEarringsImage,
    StarfallMagicSquareImage,
    StarRockImage,
    SteelMisselImage,
    SteelOreImage,
    SteelyImage,
    StiffFeatherImage,
    StolenFenceImage,
    StrawImage,
    SummoningRockImage,
    SunflowerImage,
    SunshinePanImage,
    SwordImage,
    TauromacisHornImage,
    TaurospearHornImage,
    TelescopeImage,
    ThunderSparkImage,
    TofuImage,
    TopazImage,
    TortieShellImage,
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
import { counterEffect, doomEffect } from "./../enemy/effect";
import { abilityHasChargedCondition, chargedEffect } from "./starterItemEffects";

import { Item, ITEM_TYPES, RARITIES } from "./types";

export const stolenFence: Item = {
    name: "Stolen Fence",
    description: "Battle start: gain {{ effects.0.onBattleStart.armor }} {{{ _armor_ }}}.",
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
            onBattleStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 5,
            },
        },
    ],
};

export const battleShield: Item = {
    name: "Battle Shield",
    description: "Battle start: gain {{ effects.0.onBattleStart.armor }} {{{ _armor_ }}} and 1 {{{ _pristine_ }}} Pristine.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: BattleShieldImage,
    effects: [
        {
            name: "Battle Shield",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onBattleStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 5,
                effects: [{ ...preventArmorDecayPlayer }],
            },
        },
    ],
};

export const safetyCharm: Item = {
    name: "Safety Charm",
    description: "Battle end: Heal {{ effects.0.onBattleEnd.healing }} {{{ _healing_ }}}.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: SafetyCharmImage,
    effects: [
        {
            name: "Safety Charm",
            description: "Healing 3 HP on battle end.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: SafetyCharmImage,
            disableDisplayIcon: true,
            onBattleEnd: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                healing: 3,
            },
        },
    ],
};

export const drakeBlood: Item = {
    name: "Drake Blood",
    description: "+1 {{{ _attUp_ }}} ATT.",
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
    description: "Healing grants flat {{{ _armor_ }}} for that amount.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: AmethystImage,
    applyEffectsToSummons: true,
    effects: [
        {
            name: "Amethyst Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveHealing: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                flatArmor: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.HEALING,
                    value: 1,
                },
            },
            onReceiveOverhealing: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                flatArmor: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.HEALING,
                    value: 1,
                },
            },
        },
    ],
};

export const redWhip: Item = {
    name: "Red Whip",
    description: "Every turn, draw +1 card.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: RedWhipImage,
    effects: [
        {
            name: "Red Whip",
            description: "Every turn, draw +1 card.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            drawCardsPerTurn: 1,
        },
    ],
};

export const topaz: Item = {
    name: "Topaz",
    description: "Gain {{ effects.0.stacks }} {{{ _thorns_ }}}.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: TopazImage,
    effects: [
        {
            ...thorns,
            stacks: 2,
        },
    ],
};

export const leatherSandals: Item = {
    name: "Leather Sandals",
    description: "Battle start: Draw +{{ effects.0.onBattleStart.effects.0.drawCardsPerTurn }} cards.",
    flavourText: "The quintessential footwear of aspiring adventurers.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: LeatherSandalsImage,
    effects: [
        {
            name: "Leather Sandals",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onBattleStart: {
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
    description: "When you Deplete a card, a random card in hand costs 2 {{{ _resource_ }}} less until discarded.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: AdventurerCapeImage,
    effects: [
        {
            name: "Adventurer Cape Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onDepleteAbility: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                applyAbilityEffects: {
                    pile: CARD_PILE_TYPES.HAND,
                    amount: 1,
                    abilityEffects: [
                        {
                            resourceCost: -2,
                        },
                    ],
                },
            },
        },
    ],
};

export const guideBook: Item = {
    name: "Guide Book",
    description: "Card reward selections offer +1 card choice.",
    image: GuidebookImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    abilityChoices: {
        amount: 1,
    },
};

export const panlid: Item = {
    name: "Pan Lid",
    description: "+1 {{{ _armorUp_ }}} Armor Up.",
    image: PanlidImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    applyEffectsToSummons: true,
    effects: [armorUp],
};

export const alligatorTube: Item = {
    name: "Alligator Tube",
    description: "Your summons gain +1 {{{ _attUp_ }}}.",
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
    description: "Gain 1 {{{ _thorns_ }}}.",
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
    description: "Restore +10 {{{ _healing_ }}} at campsites.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: SunshinePanImage,
    camp: {
        healing: 10,
    },
};

export const goldenHammer: Item = {
    name: "Golden Hammer",
    description: "Use this item to upgrade a card.",
    type: ITEM_TYPES.MATERIAL,
    image: GoldenHammerImage,
    upgradeCard: true,
};

export const tofu: Item = {
    name: "Tofu",
    image: TofuImage,
    type: ITEM_TYPES.OTHER, // Equips are unique, and this can stack
    description: "+3 max {{{ _healing_ }}}.",
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
    description: "Every {{ effects.0.turnsTriggerFrequency }} turns, attackers are {{{ _chill_ }}} Chilled.",
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
    description: "Battle start: Gain {{ effects.0.onBattleStart.effects.0.stacks }} {{{ _pristine_ }}} Pristine.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: AquamarineImage,
    effects: [
        {
            name: "Aquamarine",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onBattleStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [{ ...preventArmorDecayPlayer, stacks: 2 }],
            },
        },
    ],
};

export const boneHelm: Item = {
    name: "Bone Helm",
    description: "Gain 1 {{{ _defUp_ }}} DEF vs. the enemy directly in front of you.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: BoneHelmImage,
    effects: [
        {
            name: "Bone Helm",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            defenseDown: -1,
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
    description: "Use this item to remove a card from your deck.",
    type: ITEM_TYPES.CONSUMABLE,
    removeCard: true,
};

export const garnet: Item = {
    name: "Garnet",
    image: GarnetImage,
    description:
        "Gain +{{ effects.0.onResourcesGained.effects.0.attackPower }} {{{ _attUp_ }}} while you have at least 2 {{{ _resource_ }}}.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    effects: [
        {
            name: "Garnet Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: GarnetImage,
            disableDisplayIcon: true,
            // Resources are spent right before using a card, and we want to retain the attack power that ability even if it brings you below the threshold
            onResourcesGained: {
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        property: "resources",
                        value: 1,
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
                                    value: 2,
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
    description: "+1 {{{ _attUp_ }}} ATT vs. elites and bosses.",
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
    description: "+1 {{{ _attUp_ }}} ATT vs. common enemies.",
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
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
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
    description:
        "Once per turn, gain Counter for {{ effects.0.onTurnEnd.effects.0.onReceiveAttack.ability.actions.0.damage }} {{{ _damage_ }}}.",
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
    description: "When you receive a status effect, gain {{ effects.0.onReceiveEffect.flatArmor }} flat {{{ _armor_ }}}.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    effects: [
        {
            name: "Green Bamboo Hat",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveEffect: {
                disableTriggerFromProcs: true,
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                flatArmor: 1,
            },
        },
    ],
};

export const koreanFan: Item = {
    name: "Korean Fan",
    image: KoreanFanImage,
    description:
        "Every {{ effects.0.turnsTriggerFrequency }} turns, hurl a fan that inflicts {{ effects.0.onTurnStart.ability.actions.0.effects.0.stacks }} {{{ _bleed_ }}}.",
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
                            effects: [{ ...bleed, stacks: 2 }],
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
    description: "Once per battle, when your deck cycles, gain 1 {{{ _resource_ }}} and draw a card.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    effects: [
        {
            name: "Rising Star Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeckCycle: {
                removeEffect: true,
                resources: 1,
                drawCards: {
                    amount: 1,
                },
            },
        },
    ],
};

export const bouquet: Item = {
    name: "Bouquet",
    image: BouquetImage,
    description: "+1 {{{ _healing_ }}} from healing sources in battle.",
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
    description: "When you Deplete a card, Radiate 3 {{{ _damage_ }}} to all foes.",
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
                                playbackTime: 500,
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
    description: "Curse a random enemy to take 1 {{{ _damage_ }}} whenever its allies are attacked.",
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
    description: "Battle start: Gain +1 {{{ _resource_ }}}.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    effects: [
        {
            name: "Red Headband Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onBattleStart: {
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
    description: "Every {{ effects.0.onPlayCard.triggerFrequencyFromSum }} cards played, gain +1 {{{ _attUp_ }}} ATT. Max 2.",
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
                        maxApplications: 2,
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
    description: "+{{ effects.0.maxHP }} max {{{ _healing_ }}}.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: LetterImage,
    effects: [
        {
            name: "Unsigned Letter",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 7,
        },
    ],
};

export const snailStompers: Item = {
    name: "Snail Stompers",
    image: SnowshoesImage,
    description: "+3 {{{ _attUp_ }}} ATT vs. enemies with 20 or less HP.",
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
                    HP: 21,
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
    description: "+10 max {{{ _healing_ }}}.",
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
    description: "When you end your turn without {{{ _armor_ }}}, gain {{ effects.0.onTurnEnd.armor }} {{{ _armor_ }}}.",
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
    description: "When your deck cycles, gain {{ effects.0.onDeckCycle.armor }} {{{ _armor_ }}}.",
    effects: [
        {
            name: "Esther Shield",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeckCycle: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 3,
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
    description: "When you Deplete a card, heal 1 {{{ _healing_ }}}.",
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
    applyEffectsToSummons: true,
    description:
        "Battle start: Gain immunity to {{{ _bleed_ }}} {{{ _burn_ }}} {{{ _poison_ }}} for {{ effects.0.onBattleStart.effects.0.duration }} turns.",
    effects: [
        {
            name: "Fairy Wing Item",
            description: "Immune to Bleed, Burn, and Poison.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onBattleStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Fairy Wing",
                        icon: FairyWingImage,
                        duration: 4,
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
    description: "Every {{ effects.0.turnsTriggerFrequency }} turns, gain +{{ effects.0.resourcesPerTurn }} {{{ _resource_ }}}.",
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
    description:
        "Every {{ effects.0.onOffensiveAbility.triggerFrequencyFromSum }} {{{ _offense_ }}} offense cards you play, gain {{ effects.0.onOffensiveAbility.armor }} {{{ _armor_ }}}.",
    effects: [
        {
            name: "Blue Sauna Robe",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onOffensiveAbility: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                triggerFrequencyFromSum: 3,
                armor: 2,
                disableTriggerFromProcs: true,
            },
        },
    ],
};

export const steely: Item = {
    name: "Steely",
    image: SteelyImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    description: "Every {{ effects.0.onDrawCard.triggerFrequencyFromSum }} cards drawn, apply 2 {{{ _bleed_ }}} to all enemies.",
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
                                    stacks: 2,
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
    description: "+1 {{{ _resource_ }}} on kill.",
    effects: [
        {
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            name: "Taurospear Horn",
            onFriendlyKill: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                resources: 1,
                conditionOperator: "and",
                conditions: [
                    {
                        property: "abilities.0",
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        value: undefined,
                        comparator: "not",
                    },
                    {
                        property: "cantMove",
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        value: true,
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
    description: "+{{ effects.0.lifeOnKill }} {{{ _healing_ }}} on kill.",
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
    description: "Once per turn, when you apply {{{ _freeze_ }}} {{{ _stun_ }}} or {{{ _silence_ }}}, draw a card.",
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
                                    sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
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
        "When an attack would deal less than {{ effects.0.minimumAttackDamage }} {{{ _damage_ }}}, it deals {{ effects.0.minimumAttackDamage }} {{{ _damage_ }}}.",
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
    description: "Gain +1 {{{ _defUp_ }}} DEF vs. enemies 1 space away.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: AdamantiumPlateImage,
    effects: [
        {
            name: "Adamantium Plate",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            defenseDown: -1,
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
    description: "+1 {{{ _attUp_ }}} ATT vs. targets with 2 or more different Debuffs.",
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
                    numDebuffs: 1,
                    comparator: "gt",
                    calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                },
            ],
        },
    ],
};

export const pigIllustrated: Item = {
    name: "Pig Illustrated",
    description: "When you use a 2+ cost card, it has a 33% chance to refund 1 {{{ _resource_ }}}.",
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
                chance: 0.3334,
                resources: 1,
            },
        },
    ],
};

export const deckOfCards: Item = {
    name: "Deck of Playing Cards",
    description: "Battle start: you may choose cards to discard, then draw that many.",
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
    description: "Using an {{{ _offense_ }}} offense card has a 33% chance per {{{ _resource_ }}} to cast 3 {{{ _burn_ }}}.",
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
                chance: 0.3334,
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
                                    stacks: 3,
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
    description: "+7 max {{{ _healing_ }}}.",
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
    description: "When your deck cycles, draw a card.",
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
        "When your deck cycles, gain +{{ effects.0.onDeckCycle.effects.0.attackPower }} {{{ _attUp_ }}} ATT for {{ effects.0.onDeckCycle.effects.0.duration }} turn.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: SwordImage,
    effects: [
        {
            name: "Sword Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onDeckCycle: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Sword",
                        icon: WeaponMasteryImage,
                        disableDisplayIcon: true,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        attackPower: 1,
                        duration: 1,
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

const blueJeanShortsEffect: Effect = {
    name: "Blue Jean Shorts",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
    onSupportAbility: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        resources: 1,
        triggerFrequencyFromSum: 3,
        disableTriggerFromProcs: true,
        removeEffect: true,
    },
    onTurnEnd: {
        removeEffect: true,
    },
};

export const blueJeanShorts: Item = {
    name: "Blue Jean Shorts",
    description:
        "When you play {{ effects.0.onTurnStart.effects.0.onSupportAbility.triggerFrequencyFromSum }} support cards in one turn, gain 1 {{{ _resource_ }}}.",
    type: ITEM_TYPES.EQUIPMENT,
    image: BlueJeanShortsImage,
    effects: [
        {
            name: "Blue Jean Shorts",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onTurnStart: {
                effects: [blueJeanShortsEffect],
            },
        },
    ],
};

export const sunflower: Item = {
    name: "Sunflower",
    description: "+2 max {{{ _healing_ }}}.",
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
    description: "You can Transmute a card at campsites.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: PersonalAnvilImage,
    camp: {
        allowTransmute: true,
    },
};

/** Too powerful for a noob item
 * 
export const tShirt: Item = {
    name: "White T-Shirt",
    description: "If you spend a turn without attacking, gain 1 {{{ _resource_ }}} next turn.",
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
*/

export const tShirt: Item = {
    name: "White T-Shirt",
    description:
        "Battle start: Gain {{ effects.0.onBattleStart.armor }} {{{ _armor_ }}}. Every {{ effects.0.onTurnStart.triggerFrequencyFromSum }} turns, gain {{ effects.0.onTurnStart.armor }} {{{ _armor_ }}}.",
    type: ITEM_TYPES.EQUIPMENT,
    applyEffectsToSummons: true,
    image: WhiteUndershirtImage,
    effects: [
        {
            name: "White T-Shirt Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                triggerFrequencyFromSum: 3,
                armor: 1,
            },
            onBattleStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 1,
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
    description: "Every {{ effects.0.turnsTriggerFrequency }} turns, draw +1 card.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: IcarusCapeImage,
    effects: [
        {
            name: "Icarus Cape",
            description: "Every 2 turns, draw +1 card.",
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
    description: "Once per turn, when you apply {{{ _bleed_ }}} {{{ _silence_ }}} or {{{ _stun_ }}}, draw a card.",
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
    description: "+15 max {{{ _healing_ }}}.",
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
    description: "You can remove a card from your deck at campsites.",
    camp: {
        allowAbilityRemoval: true,
    },
};

export const toyHammer: Item = {
    name: "Toy Hammer",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    image: PicoPicoHammerImage,
    description: "Battle start: {{ effects.0.onBattleStart.applyAbilityEffects.amount }} cards in your hand are Upgraded.",
    effects: [
        {
            name: "Toy Hammer",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onBattleStart: {
                applyAbilityEffects: {
                    pile: CARD_PILE_TYPES.HAND,
                    amount: 3,
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
    rarity: RARITIES.UNCOMMON,
    image: IronBallImage,
    description: "+{{ effects.0.attackPower }} {{{ _attUp_ }}} ATT vs. {{{ _armor_ }}} targets.",
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
    description: "Gain +1 {{{ _attUp_ }}} on one turn, then +1 {{{ _armorUp_ }}} on the next, alternating turns.",
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
    description: "+1 max {{{ _resource_ }}}.",
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
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: YellowHatImage,
    description: "Battle start: play a random minion from your deck.",
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
        "Every {{ effects.0.onFriendlyReceiveAttack.eventTriggerFrequency }} attacks received by friendly units, zap the last attacker for {{ effects.0.onFriendlyReceiveAttack.ability.actions.0.damage }} {{{ _damage_ }}} + {{{ _stun_ }}}.",
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
                            damage: 3,
                            effects: [{ ...stun, duration: 2 }],
                        },
                    ],
                },
            },
        },
    ],
};

export const blackCrystal: Item = {
    name: "Black Crystal",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: BlackCrystalImage,
    description:
        "When you first hit each enemy, apply 1 {{{ _attDown_ }}} ATT Down {{{ _defDown_ }}} DEF Down for {{ effects.0.onAttack.effects.0.duration }} turns.",
    effects: [
        {
            name: "Black Crystal Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onAttack: {
                targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
                effects: [
                    { ...attackDown, duration: 3 },
                    { ...defDown, duration: 3 },
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

export const fruitKnife: Item = {
    name: "Fruit Knife",
    rarity: RARITIES.COMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: FruitKnifeImage,
    description: "0-cost cards gain +{{ effects.0.attackPower }} {{{ _attUp_ }}} ATT.",
    effects: [
        {
            name: "Fruit Knife Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            attackPower: 1,
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

export const hardwoodWand: Item = {
    name: "Hardwood Wand",
    rarity: RARITIES.COMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: HardwoodWandImage,
    description: "On turn start, gain Charged.",
    effects: [
        {
            name: "Hardwood Wand Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onTurnStart: {
                effects: [chargedEffect],
            },
        },
    ],
};

export const broom: Item = {
    name: "Broom",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: BroomImage,
    description: "Each card played has a 33% chance per {{{ _resource_ }}} spent to cast Dust Devils.",
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
                chance: 0.3334,
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
    description: "Battle start: +1 {{{ _resource_ }}} / +1 card draw. Elites always offer an Arm of the Exiled One.",
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
            onBattleStart: {
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
    exclusive: ["Holy Relic"],
};

export const goldenPride: Item = {
    name: "Golden Pride",
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    description: "When you Taunt, gain {{{ _thorns_ }}}. When you gain {{{ _thorns_ }}}, Taunt.",
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
                    effects: [thorns],
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
    rarity: RARITIES.COMMON,
    type: ITEM_TYPES.EQUIPMENT,
    description: "If you take unblocked damage, heal 1 {{{ _healing_ }}} next turn.",
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
                        hasEffect: directDamageTaken.name,
                        comparator: "eq",
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    },
                ],
            },
        },
    ],
};

export const polearm: Item = {
    name: "Polearm",
    image: PolearmImage,
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    description: "When your {{{ _armor_ }}} breaks, deal 3 {{{ _damage_ }}} to up to 3 enemies.",
    effects: [
        {
            name: "Polearm Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onArmorBreak: {
                ability: {
                    name: "Sidearm",
                    image: PolearmImage,
                    actions: [
                        {
                            target: TARGET_TYPES.RANDOM_HOSTILE,
                            type: ACTION_TYPES.RANGE_ATTACK,
                            animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
                            damage: 3,
                            icon: PolearmImage,
                            numTargets: 2,
                            targetArea: 5,
                        },
                    ],
                },
            },
        },
    ],
};

export const starRock: Item = {
    name: "Star Rock",
    description: "Every {{ effects.0.onPlayCard.triggerFrequencyFromSum }} cards you play, draw a card.",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: StarRockImage,
    effects: [
        {
            name: "Star Rock Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onPlayCard: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                drawCards: {
                    amount: 1,
                },
                triggerFrequencyFromSum: 4,
                disableTriggerFromProcs: true,
            },
        },
    ],
};

export const greenJester: Item = {
    name: "Green Jester",
    description: "All 'Bolt' abilities gain +1 {{{ _damage_ }}}.",
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: GreenJesterImage,
    effects: [
        {
            name: "Green Jester",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            skillBonus: [
                {
                    comparator: "includes",
                    skill: "bolt",
                    damage: 1,
                },
            ],
        },
    ],
};

export const monsterParadeBalloon: Item = {
    name: "Monster Parade Balloon",
    description: "Your summoned minions gain +1 {{{ _attUp_ }}} ATT, +1 more with each summon.",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: PrettyPinkBeanBalloonImage,
    effects: [
        {
            name: "Monster Parade Balloon",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            stacks: 1,
            onFriendlySummon: {
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                effects: [attackPower],
                incrementStacks: 1,
            },
        },
    ],
};

export const barrenDiorama: Item = {
    name: "Barren Diorama",
    description: "While you have no allies, gain +1 {{{ _attUp_ }}} ATT {{{ _armorUp_ }}} Armor Up.",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: DioramaImage,
    effects: [
        {
            name: "Barren Diorama",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: DioramaImage,
            attackPower: 1,
            armorReceived: 1,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    comparator: "lt",
                    numFriendly: 2, // Includes itself
                },
            ],
        },
    ],
};

export const telescope: Item = {
    name: "Telescope",
    description: "All 'Shot' + 'Shoot' abilities gain +1 {{{ _damage_ }}}.",
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: TelescopeImage,
    effects: [
        {
            name: "Telescope",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            skillBonus: [
                {
                    comparator: "includes",
                    skill: "shot",
                    damage: 1,
                },
                {
                    comparator: "includes",
                    skill: "shoot",
                    damage: 1,
                },
            ],
        },
    ],
};

export const greenMask: Item = {
    name: "Green Mask",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: GreenMaskImage,
    description: "Once per turn, when you apply {{{ _bleed_ }}} {{{ _freeze_ }}} or {{{ _stun_ }}}, draw a card.",
    effects: [
        {
            name: "Green Mask Item",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onTurnStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Green Mask",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: GreenMaskImage,
                        disableDisplayIcon: true,
                        description: "When you apply a Bleed, Freeze, or Stun, draw a card.",
                        duration: 1,
                        onApplyEffect: {
                            conditions: [
                                {
                                    calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                    sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
                                    hasEffectType: [EFFECT_TYPES.STUN, EFFECT_TYPES.BLEED, EFFECT_TYPES.FREEZE],
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

export const holyRelic: Item = {
    name: "Holy Relic",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: DragonLordPendantImage,
    description: "Battle start: +1 {{{ _resource_ }}} / +1 card draw. Repel the Exiled One's influences.",
    effects: [
        {
            name: "Holy Relic Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onBattleStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Holy Relic",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: DragonLordPendantImage,
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
    disableCardsFromBeingFound: [firstExiledArm.name, secondExiledArm.name, thirdExiledArm.name, fourthExiledArm.name],
    exclusive: [zakumHelmet.name],
};

export const drakeSkull: Item = {
    name: "Drake Skull",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    image: DrakeSkullImage,
    description: "Battle start: Shoot a target for {{ effects.0.onBattleStart.ability.actions.0.damage }} {{{ _damage_ }}}.",
    effects: [
        {
            name: "Drake Skull",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            icon: DrakeSkullImage,
            onBattleStart: {
                ability: {
                    name: "Shoot",
                    resourceCost: 0,
                    image: DrakeSkullImage,
                    actions: [
                        {
                            type: ACTION_TYPES.RANGE_ATTACK,
                            target: TARGET_TYPES.HOSTILE,
                            animation: ANIMATION_TYPES.ONE_WAY,
                            icon: AvengersArrowImage,
                            damage: 7,
                            animationOptions: {
                                rotateToFaceTarget: true,
                                rotate: 135,
                                weapon: {
                                    rotateToFaceTarget: true,
                                },
                            },
                        },
                    ],
                },
            },
            onTurnInProgress: {
                removeEffect: true,
            },
        },
    ],
};

export const brokenArrow: Item = {
    name: "Broken Arrow",
    image: BrokenSpearImage,
    description: "+5% {{{ _critical_ }}} Critical",
    rarity: RARITIES.COMMON,
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Broken Arrow",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            criticalChance: 0.05,
        },
    ],
};

export const darkPoleFeatherHat: Item = {
    name: "Dark Pole-Feather Hat",
    description: "While you do not have Aim, gain +20% {{{ _critical_ }}} Critical.",
    image: DarkPoleFeatherHatImage,
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Dark Pole-Feather Hat",
            description: "+20% Critical if Aim is inactive.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: DarkPoleFeatherHatImage,
            criticalChance: 0.2,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    hasEffect: aimEffect.name,
                    comparator: "not",
                },
            ],
        },
    ],
};

export const bundleOfStraw: Item = {
    name: "Bundle Of Straw",
    description: "While an ally is active, you gain 1 {{{ _defUp_ }}} DEF Up.",
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: StrawImage,
    effects: [
        {
            name: "Bundle Of Straw",
            icon: StrawImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            defenseDown: -1,
            conditions: [
                {
                    comparator: "gt",
                    numFriendly: 1, // Includes the player
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                },
            ],
        },
    ],
};

export const steelOre: Item = {
    name: "Steel Ore",
    image: SteelOreImage,
    rarity: RARITIES.COMMON,
    type: ITEM_TYPES.EQUIPMENT,
    applyEffectsToSummons: true,
    description: "You cannot take more than {{ effects.0.maxDamageTaken }} damage in one hit.",
    effects: [
        {
            name: "Steel Ore",
            icon: SteelOreImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            description: "Cannot take more than {{ maxDamageTaken }} damage in one hit.",
            maxDamageTaken: 12,
        },
    ],
};

export const scimitar: Item = {
    name: "Scimitar",
    image: ScimitarImage,
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    description: "Furious Strike applies 2 {{{ _bleed_ }}}.",
    effects: [
        {
            name: "Scimitar",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAttack: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                        property: "name",
                        comparator: "eq",
                        value: furiousStrikeCard.name,
                    },
                ],
                targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
                effects: [{ ...bleed, stacks: 2 }],
            },
        },
    ],
};

export const blackDragonRobe: Item = {
    name: "Black Dragon Robe",
    image: BlackDragonRobeImage,
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    description: "While you have Taunt, gain +1 {{{ _armorUp_ }}} Armor Up.",
    effects: [
        {
            name: "Black Dragon Robe",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            armorReceived: 1,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    hasEffectType: [EFFECT_TYPES.TAUNT],
                },
            ],
        },
    ],
};

export const gladius: Item = {
    name: "Gladius",
    image: GladiusImage,
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    description: "If you end turn your turn with 2+ {{{ _resource_ }}}, activate Furious Strike.",
    effects: [
        {
            name: "Gladius",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onTurnEnd: [
                {
                    conditions: [
                        {
                            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                            property: "resources",
                            value: 1,
                            comparator: "gt",
                        },
                    ],
                    applyAbilityEffects: {
                        pile: CARD_PILE_TYPES.HAND,
                        filters: [
                            {
                                property: "name",
                                value: "Furious Strike",
                                comparator: "eq",
                            },
                        ],
                        abilityEffects: [
                            {
                                upgradedByLevels: 1,
                            },
                        ],
                    },
                },
                {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    conditions: [
                        {
                            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                            property: "resources",
                            value: 1,
                            comparator: "gt",
                        },
                    ],
                    addCards: [furiousStrikeCard],
                },
            ],
        },
    ],
};

export const phoenixWand: Item = {
    name: "Phoenix Wand",
    image: PhoenixWandImage,
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    description: "When you play a card that applies {{{ _burn_ }}}, apply +1 {{{ _burn_ }}}.",
    effects: [
        {
            name: "Phoenix Wand",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onApplyEffect: {
                disableTriggerFromProcs: true,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
                        hasEffectType: [EFFECT_TYPES.BURN],
                        comparator: "includes",
                    },
                ],
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                effects: [
                    {
                        ...burn,
                        stacks: 1,
                    },
                ],
            },
        },
    ],
};

export const blueChaosRobe: Item = {
    name: "Blue Chaos Robe",
    image: BlueChaosRobeImage,
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    description: "When you play an activated Charged card, gain 1 flat {{{ _armor_ }}}.",
    effects: [
        {
            name: "Blue Chaos Robe",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onRemoveEffect: {
                conditions: [
                    abilityHasChargedCondition,
                    // Can't use disableTriggerFromProc because the effect removal in itself is a proc, so it won't trigger this if the flag is up
                    {
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        comparator: "not",
                        name: lesserBolt.name,
                        sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                    },
                    {
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        comparator: "eq",
                        name: "Charged",
                        sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
                    },
                ],
                conditionOperator: "and",
                armor: 1,
            },
        },
    ],
};

export const doomSinger: Item = {
    name: "Maple Doom Singer",
    description: "On the start of turn {{ effects.0.turnsTriggerFrequency }}, Radiate Doom to all enemies.",
    image: MapleDoomSingerImage,
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Maple Doom Singer",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 3,
            onTurnStart: {
                ability: {
                    name: "Doom Song",
                    image: MapleDoomSingerImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            icon: MapleDoomSingerImage,
                            animation: ANIMATION_TYPES.ACTION_EXPLODE,
                            radiate: {
                                area: 2,
                                effects: [{ ...doomEffect }],
                            },
                        },
                    ],
                },
                removeEffect: true,
            },
        },
    ],
};

export const forkOnAStick: Item = {
    name: "Fork On A Stick",
    description: "2+ area cards gain +1 {{{ _attUp_ }}} ATT.",
    rarity: RARITIES.COMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: ForkOnAStickImage,
    effects: [
        {
            name: "Fork On A Stick Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            attackPower: 1,
            conditions: [
                {
                    calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                    sourceType: TRIGGER_SOURCE_TYPES.ACTION,
                    comparator: "gt",
                    area: 1,
                    isOffense: true,
                    // Do we need to do this similar to how Fruit Knife does it?
                    notProc: true,
                },
            ],
        },
    ],
};

export const spikyCollar: Item = {
    name: "Bain's Spiky Collar",
    description:
        "Your first summoned minion in battle gains <br/> {{ effects.0.onFriendlySummon.armor }} {{{ _armor_ }}}, 1 {{{ _pristine_ }}}, {{ effects.0.onFriendlySummon.effects.0.stacks }} {{{ _thorns_ }}} + Taunt.",
    image: BainsSpikyCollarImage,
    rarity: RARITIES.UNCOMMON,
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Spiky Collar Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onFriendlySummon: {
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                armor: 10,
                effects: [{ ...thorns, stacks: 3 }, { ...preventArmorDecayPlayer }, { ...taunt }],
                removeEffect: true,
            },
        },
    ],
};

export const olympus: Item = {
    name: "Olympus",
    description: "When you gain Aim, gain +1 more Aim.",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: OlympusImage,
    effects: [
        {
            name: "Olympus",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onApplyEffect: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
                        name: "Aim",
                        comparator: "eq",
                    },
                ],
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        ...aimEffect,
                        stacks: 1,
                    },
                ],
            },
        },
    ],
};

export const stiffFeather: Item = {
    name: "Stiff Feather",
    description: "Battle start: Gain {{ effects.0.onBattleStart.effects.0.stacks }} Aim.",
    rarity: RARITIES.COMMON,
    type: ITEM_TYPES.EQUIPMENT,
    image: StiffFeatherImage,
    effects: [
        {
            name: "Stiff Feather",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onBattleStart: {
                effects: [
                    {
                        ...aimEffect,
                        stacks: 4,
                    },
                ],
            },
        },
    ],
};

export const lucidaTail: Item = {
    name: "Lucida Tail",
    description:
        "Your attacks have a {{ effects.0.onAttack.chance }} chance to apply {{{ _defDown_ }}} for {{ effects.0.onAttack.effects.0.duration }}{{{ _duration_ }}}. +10% for active Criticals.",
    rarity: RARITIES.RARE,
    type: ITEM_TYPES.EQUIPMENT,
    image: LucidaTailImage,
    effects: [
        {
            name: "Lucida Tail",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onAttack: {
                chance: 0.1,
                bonus: {
                    bonusChance: 0.1,
                    conditions: [
                        {
                            calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                            hasAbilityEffectName: CRITICAL_KEYWORD,
                        },
                    ],
                },
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                effects: [
                    {
                        ...defDown,
                        duration: 2,
                    },
                ],
            },
        },
    ],
};

export const silverSnowboard: Item = {
    name: "Silver Snowboard",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: SilverSnowboardImage,
    applyEffectsToSummons: true,
    description: "Gain an additional +{{ effects.0.attackPower }} {{{ _attUp_ }}} against {{{ _stun_ }}} or {{{ _freeze_ }}} targets.",
    effects: [
        {
            name: "Silver Snowboard",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            attackPower: 2,
            conditions: [
                {
                    hasEffectType: [EFFECT_TYPES.FREEZE, EFFECT_TYPES.STUN],
                    calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                },
            ],
        },
    ],
};

export const cutlass: Item = {
    name: "Cutlass",
    description: "Battle start: Gain Furious Strike.",
    image: CutlassImage,
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    effects: [
        {
            name: "Cutlass",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onBattleStart: {
                addCards: [furiousStrikeCard],
                removeEffect: true,
            },
        },
    ],
};

export const rock: Item = {
    name: "Rock",
    image: SummoningRockImage,
    description:
        "Battle start: Inflict 1 {{{ _damage_ }}} and 1 {{{ _defDown_ }}} to an enemy for {{ effects.0.onBattleStart.ability.actions.0.effects.0.duration }}{{{ _duration_ }}}.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.COMMON,
    effects: [
        {
            name: "Rock",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onBattleStart: {
                ability: {
                    name: "Throw Rock",
                    image: SummoningRockImage,
                    actions: [
                        {
                            target: TARGET_TYPES.RANDOM_HOSTILE,
                            type: ACTION_TYPES.RANGE_ATTACK,
                            animations: [
                                {
                                    image: SummoningRockImage,
                                    type: ANIMATION_TYPES.ONE_WAY,
                                },
                            ],
                            damage: 1,
                            effects: [
                                {
                                    ...defDown,
                                    duration: 3,
                                },
                            ],
                        },
                    ],
                },
                removeEffect: true,
            },
        },
    ],
};

export const battleGauntlets: Item = {
    name: "Battle Gauntlets",
    description: "When you would apply {{{ _defDown_ }}} or {{{ _stun_ }}}, also apply {{{ _bleed_ }}}.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.UNCOMMON,
    image: SteelMisselImage,
    effects: [
        {
            name: "Battle Gauntlets",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onApplyEffect: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
                        hasEffect: defDown.name,
                    },
                    {
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
                        hasEffect: stun.name,
                    },
                ],
                conditionOperator: "or",
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                effects: [
                    {
                        ...bleed,
                        stacks: 1,
                    },
                ],
            },
            onFailedToApplyEffect: {
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
                        hasEffect: defDown.name,
                    },
                    {
                        calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                        sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
                        hasEffect: stun.name,
                    },
                ],
                conditionOperator: "or",
                targetType: TRIGGER_TARGET_TYPES.TARGET,
                effects: [
                    {
                        ...bleed,
                        stacks: 1,
                    },
                ],
            },
        },
    ],
};

const redDukeEffect: Effect = {
    name: "Red Duke",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
    maxApplications: 1,
    maxStacks: 1,
    onReceiveHealthDamage: {
        effects: [bideEffect],
        removeEffect: true,
    },
    onTurnStart: {
        removeEffect: true,
    },
};

export const redDuke: Item = {
    name: "Red Duke",
    image: RedDukeImage,
    description: "Once per turn, if you take HP damage, gain Bide.",
    type: ITEM_TYPES.EQUIPMENT,
    rarity: RARITIES.RARE,
    effects: [
        {
            name: "Red Duke",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onTurnInProgress: {
                effects: [
                    {
                        ...redDukeEffect,
                    },
                ],
            },
        },
    ],
};

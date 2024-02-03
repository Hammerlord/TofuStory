import { JOB_CARD_MAP } from "../ability";
import { chill, poison, thorns, wound } from "../ability/Effects";
import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import {
    AlchemistStoneImage,
    AlligatorTubeImage,
    AmethystImage,
    AncientTreeSapImage,
    AquamarineImage,
    ArwensGlassShoeImage,
    BallerCaneImage,
    BluePotionImage,
    BlueSaunaRobeImage,
    BoneHelmImage,
    BouquetImage,
    BronzeIncenseBurnerImage,
    CactusImage,
    CoffeePotImage,
    CouponImage,
    CursedDollImage,
    DiamondImage,
    DrakeBloodImage,
    EnergyBoltImage,
    EnergyBoltProjectileImage,
    EstherShieldImage,
    FairyWingImage,
    FishSpearImage,
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
    PanlidImage,
    PieceOfIceImage,
    PigsRibbonImage,
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
    TauromacisHornImage,
    TaurospearHornImage,
    TopazImage,
    TortieShellImage,
    WeaponMasteryImage,
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
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";

import { Item, ITEM_TYPES } from "./types";

export const halfEatenHotdog: Item = {
    name: "Half-eaten Hot Dog",
    healing: 10,
    image: HotdogImage,
    type: ITEM_TYPES.CONSUMABLE,
};

export const stolenFence: Item = {
    name: "Stolen Fence",
    description: "Reduce damage received by 1 when your health is less than half.",
    type: ITEM_TYPES.EQUIPMENT,
    image: StolenFenceImage,
    sellPrice: 10,
    effects: [
        {
            name: "Stolen Fence",
            description: "Reducing damage taken by 1.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: StolenFenceImage,
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
    description: "Restore 3 HP on wave clear.",
    type: ITEM_TYPES.EQUIPMENT,
    image: SafetyCharmImage,
    sellPrice: 10,
    effects: [
        {
            name: "Safety Charm",
            description: "Restoring 3 HP on wave clear.",
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
    image: DrakeBloodImage,
    sellPrice: 10,
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
    image: LuckSackImage,
    sellPrice: 10,
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
    description: "Heal for 1 HP every 5 turns. Overhealing causes you to gain armor for the overhealed amount.",
    type: ITEM_TYPES.EQUIPMENT,
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
    description: "Draw an extra card every 3 turns.",
    type: ITEM_TYPES.EQUIPMENT,
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
    description: "Gain thorns after every 5 effect abilities you use.",
    type: ITEM_TYPES.EQUIPMENT,
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
    description: "+5 max HP. Ability acquisition screens now offer another card to choose from.",
    image: GuidebookImage,
    type: ITEM_TYPES.EQUIPMENT,
    abilityChoices: 1,
    effects: [
        {
            name: "Guide Book",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 5,
        },
    ],
};

export const panlid: Item = {
    name: "Pan Lid",
    description: "On wave start, gain 5 armor and prevent armor decay for 1 turn.",
    image: PanlidImage,
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Pan Lid Effect",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onWaveStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 5,
                effects: [
                    {
                        name: "Pan Lid",
                        description: "Preventing armor decay.",
                        icon: PanlidImage,
                        class: EFFECT_CLASSES.BUFF,
                        type: EFFECT_TYPES.NONE,
                        preventArmorDecay: true,
                        duration: 1,
                    },
                ],
            },
        },
    ],
};

export const alligatorTube: Item = {
    name: "Alligator Tube",
    description: "+5 max HP. When you summon a minion, its attack power is increased by 1.",
    image: AlligatorTubeImage,
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Alligator Tube",
            description: "Increasing maximum HP by 5.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 5,
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
    description: "Gain 1 thorns. Thorns deals 1 damage to attackers.",
    type: ITEM_TYPES.EQUIPMENT,
    image: CactusImage,
    effects: [
        {
            ...thorns,
            name: "Cactus",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
        },
    ],
};

export const nependeathSap: Item = {
    name: "Nependeath Sap",
    description: "Every 3 turns, your first attack inflicts poison.",
    type: ITEM_TYPES.EQUIPMENT,
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
    description: "You can now perform an extra activity while camping.",
    type: ITEM_TYPES.EQUIPMENT,
    image: CoffeePotImage,
    camp: {
        extraActivities: 1,
    },
};

export const respawnToken: Item = {
    name: "Respawn Token",
    description: "If you die, you restore 20 HP and this item is consumed.",
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
                healing: 20,
            },
        },
    ],
};

export const sunshinePan: Item = {
    name: "Sunshine Pan",
    description: "Restore an additional 10 HP when camping.",
    type: ITEM_TYPES.EQUIPMENT,
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
    description: "+1 armor power.",
    type: ITEM_TYPES.EQUIPMENT,
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
    description: "When your resources are at least 80% full, gain +3 attack power.",
    type: ITEM_TYPES.EQUIPMENT,
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
    description: "Once per turn, you counter for 1 base damage when attacked.",
    type: ITEM_TYPES.EQUIPMENT,
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
    description: "+5 max HP. Whenever you use an ability, gain 1 meso.",
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Baller Cane",
            description: "Gaining 1 meso for every ability used.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 5,
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
    description: "Every 3 turns, hurl a fan that inflicts a wound. The effect lasts 1 turn.",
    type: ITEM_TYPES.EQUIPMENT,
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
                            effects: [{ ...wound, duration: 1 }],
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
    description: "When you use 7 abilities, gain 1 attack power. Occurs once per battle.",
    type: ITEM_TYPES.EQUIPMENT,
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
                        numAbilitiesUsed: 7,
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
    description: "When you use a Deplete ability, you Radiate 2 damage to enemies.",
    type: ITEM_TYPES.EQUIPMENT,
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
    description: "On wave start, a random enemy becomes cursed, taking 1 damage for each other target you attack.",
    type: ITEM_TYPES.EQUIPMENT,
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
    description: "Every 10 abilities you use, gain 1 attack power.",
    type: ITEM_TYPES.EQUIPMENT,
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
                        duration: 1,
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
                            removeEffect: true,
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
    description: "Gain 3 attack power against enemies with 10 or less HP.",
    type: ITEM_TYPES.EQUIPMENT,
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
    merchant: {
        discount: 0.2,
        refreshTimes: 1,
    },
};

export const diamond: Item = {
    name: "Diamond",
    image: DiamondImage,
    type: ITEM_TYPES.EQUIPMENT,
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
    description: "+5 max HP.",
    effects: [
        {
            name: "Glass Shoe",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 5,
        },
    ],
};

export const tortieShell: Item = {
    name: "Tortie Shell",
    image: TortieShellImage,
    type: ITEM_TYPES.EQUIPMENT,
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
    description: "When your deck cycles, gain 5 armor.",
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
    description: "+5 max HP. When viewing your deck in battle, the cards display in order.",
    effects: [
        {
            name: "Spectrum Goggles",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            maxHP: 5,
            viewDeckInOrder: true,
        },
    ],
};

export const redHeartedEarrings: Item = {
    name: "Red-Hearted Earrings",
    image: RedHeartedEarringsImage,
    type: ITEM_TYPES.EQUIPMENT,
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
                        immunities: [EFFECT_TYPES.BLEED, EFFECT_TYPES.BURN, EFFECT_TYPES.POISON],
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
    description: "Gain 1 extra resource every 3 turns.",
    effects: [
        {
            name: "Ancient Tree Sap",
            description: "Gain 1 extra resource every 3 turns.",
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
    description: "Every 5 turns, gain 1 armor power.",
    effects: [
        {
            name: "Blue Sauna Robe Item",
            description: "Every 5 turns, gain 1 armor power.",
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
    description: "When your deck cycles, fling a knife that deals 1 damage and applys Bleed to all targets.",
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
                            damage: 1,
                            type: ACTION_TYPES.RANGE_ATTACK,
                            target: TARGET_TYPES.HOSTILE,
                            icon: SteelyImage,
                            animationOptions: {
                                rotate: -45,
                                rotateToFaceTarget: true,
                            },
                            effects: [
                                {
                                    ...wound,
                                    duration: 1,
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

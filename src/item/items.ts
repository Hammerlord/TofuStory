import { chill, poison, thorns, wound } from "../ability/Effects";
import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import {
    AlligatorTubeImage,
    AmethystImage,
    AquamarineImage,
    BallerCaneImage,
    BlackManualImage,
    BoneHelmImage,
    BouquetImage,
    BronzeIncenseBurnerImage,
    CactusImage,
    CoffeePotImage,
    CursedDollImage,
    DrakeBloodImage,
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
    LuckSackImage,
    PanlidImage,
    PieceOfIceImage,
    PigsRibbonImage,
    RedHeadbandImage,
    RespawnTokenImage,
    RisingStarImage,
    SafetyCharmImage,
    SapOfNependeathImage,
    StarfallMagicSquareImage,
    StolenFenceImage,
    SunshinePanImage,
    WeaponMasteryImage,
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
    description: "Heal for 1 HP per turn. Overhealing causes you to gain armor for the overhealed amount.",
    type: ITEM_TYPES.EQUIPMENT,
    image: AmethystImage,
    sellPrice: 10,
    effects: [
        {
            name: "Amethyst",
            description: "Healing for 1 HP per turn. Gaining armor when overhealed.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
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

export const blackScroll: Item = {
    name: "Black Scroll",
    description: "Combine 3 scrolls to attain a non-deplete ability of your choice for your class.",
    image: BlackManualImage,
    type: ITEM_TYPES.MATERIAL,
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
    description: "You reflect 1 damage to attackers.",
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
    description: "Receive +1 armor from armor sources.",
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
    description: "When you cap resources, gain +1 attack power for the rest of the turn.",
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Garnet",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onResourcesGained: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                conditions: [
                    {
                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        resourcePercentage: 1,
                        comparator: "eq",
                    },
                ],
                effects: [
                    {
                        name: "Attack Power",
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.BUFF,
                        icon: WeaponMasteryImage,
                        duration: 1,
                        attackPower: 1,
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
    description: "When you receive a status effect from an ability, you gain 2 armor.",
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Green Bamboo Hat",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            onReceiveEffect: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                armor: 2,
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
    description: "When you use 7 abilities, gain 1 attack power. This effect may occur once per battle.",
    type: ITEM_TYPES.EQUIPMENT,
    effects: [
        {
            name: "Rising Star",
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
                        name: "Rising Star - Attack Power",
                        icon: RisingStarImage,
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
    description: "You receive +1 healing from healing sources in battle.",
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
    description: "On wave start, apply a curse on a random enemy. That enemy receives 1 damage for each different target you attack.",
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

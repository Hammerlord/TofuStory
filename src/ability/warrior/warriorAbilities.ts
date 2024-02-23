import {
    AdvancedWeaponMasteryImage,
    BladestormImage,
    BlastExtraStrikeImage,
    BlockImage,
    BlueFistOfFuryImage,
    BrandishImage,
    BrickImage,
    BricksImage,
    BundleOfNailsImage,
    BurningSoulBladeImage,
    BurningSoulBladeMinionImage,
    ChanceAttackImage,
    CloseCombatImage,
    CombatOrdersImage,
    ComboFuryImage,
    DarkThirstImage,
    DivineChargeImage,
    DoubleTimeImage,
    EndureImage,
    EnrageImage,
    FlagImage,
    GiganticSledgeImage,
    GungnirImage,
    HammerImage,
    HighPaladinImage,
    HyperBodyImage,
    InstinctualComboImage,
    IntrepidSlashImage,
    IronBodyImage,
    IronWillImage,
    LordOfDarknessImage,
    MagicCrashImage,
    MetalAxeImage,
    NamelessSwordImage,
    NightShadeExplosionImage,
    PanicImage,
    ParashockGuardImage,
    PowerStanceImage,
    PunctureImage,
    RageImage,
    RagingBlowImage,
    RedFistOfFuryImage,
    RisingRageImage,
    RushImage,
    SelfRecoveryImage,
    ShieldMasteryImage,
    ShieldRedImage,
    ShoutImage,
    SlashBlastImage,
    SpikeBallImage,
    SpikedMaceImage,
    WarLeapImage,
    WarMushImage,
    WarriorMasteryImage,
    WeaponBoosterImage,
    WeaponMasteryImage,
    WorldReaverImage,
} from "../../images";
import { TornadoIcon } from "../../images/icons";
import { RARITIES } from "../../item/types";
import { bleed, immunity, silence, stealth, stun, thorns, attackPower } from "../Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    Action,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../types";
import { preventArmorDecay } from "./../Effects";
import { MULTIPLIER_TYPES } from "./../types";

import { attack } from "../../enemy/abilities";

export const bash: Ability = {
    name: "Bash",
    resourceCost: 0,
    image: BrickImage,
    actions: [
        {
            damage: 3,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const warLeap: Ability = {
    name: "War Leap",
    resourceCost: 0,
    image: WarLeapImage,
    actions: [
        {
            damage: 0,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            effects: [bleed],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const slashBlast: Ability = {
    name: "Slash Blast",
    resourceCost: 1,
    image: SlashBlastImage,
    actions: [
        {
            damage: 5,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            area: 1,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const slam: Ability = {
    name: "Slam",
    resourceCost: 1,
    image: SpikedMaceImage,
    actions: [
        {
            damage: 7,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const anger: Ability = {
    name: "Anger",
    resourceCost: 0,
    image: EnrageImage,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            damage: 7,
            resources: 2,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: -3,
                },
            ],
        },
    ],
};

export const shieldStrike: Ability = {
    name: "Shield Strike",
    rarity: RARITIES.COMMON,
    resourceCost: 2,
    image: ShieldRedImage,
    actions: [
        {
            damage: 8,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
        {
            armor: 8,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
                {
                    armor: 2,
                },
            ],
        },
    ],
};

export const block: Ability = {
    name: "Block",
    resourceCost: 1,
    image: BlockImage,
    actions: [
        {
            armor: 7,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 3,
                },
            ],
        },
    ],
};

export const shout: Ability = {
    name: "Shout",
    resourceCost: 0,
    image: ShoutImage,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            resources: 1,
            drawCards: {
                amount: 2,
            },
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.SHOUT,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    resources: 1,
                },
            ],
        },
    ],
};

export const spikes: Ability = {
    name: "Spikes",
    resourceCost: 1,
    image: SpikeBallImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            target: TARGET_TYPES.FRIENDLY,
            effects: [thorns],
            type: ACTION_TYPES.EFFECT,
            armor: 5,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 3,
                },
            ],
        },
    ],
};

const drumOfWarAttackPower: Effect = {
    name: "Drums of War",
    description: "Attack power increased.",
    icon: WeaponMasteryImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackPower: 1,
    duration: 1,
    disableDisplayIcon: true,
};

const drumOfWar: Action = {
    type: ACTION_TYPES.EFFECT,
    target: TARGET_TYPES.SELF,
    excludePrimaryTarget: true,
    armor: 2,
    area: 1,
    effects: [drumOfWarAttackPower],
};

export const warBanner: Ability = {
    name: "War Banner",
    resourceCost: 2,
    description: "Every turn, grants 2 armor and +1 attack to nearby allies.",
    rarity: RARITIES.UNCOMMON,
    minion: {
        name: "War Banner",
        image: FlagImage,
        maxHP: 5,
        abilities: [],
        effects: [
            {
                ...stealth,
                duration: 3,
            },
            {
                name: "War Banner - Drumbeat of War",
                description: "Granting 2 armor and +1 attack to nearby allies every turn.",
                icon: FlagImage,
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                excludeEffectOwner: true,
                onTurnStart: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    ability: {
                        name: "Drumbeat of War",
                        actions: [
                            {
                                ...drumOfWar,
                                effects: [
                                    {
                                        ...drumOfWarAttackPower,
                                        duration: 1,
                                    },
                                ],
                            },
                        ],
                    },
                },
                onSummoned: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    ability: {
                        name: "Drumbeat of War",
                        actions: [drumOfWar],
                    },
                },
            },
        ],
    },
    actions: [],
    upgrades: [],
};

export const yell: Ability = {
    name: "Yell",
    resourceCost: 1,
    image: WarMushImage,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            area: 2,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.SHOUT,
            effects: [
                {
                    name: "Admonished",
                    attackPower: -2,
                    duration: 2,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.DEBUFF,
                    icon: WarMushImage,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            attackPower: -1,
                        },
                    ],
                },
            ],
        },
    ],
};

export const bunchOBricks: Ability = {
    name: "Bunch o' Bricks",
    resourceCost: 1,
    image: BricksImage,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            addCards: [bash, bash, bash].map((card) => ({ ...card, removeAfterTurn: true })),
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.CONSUMABLE,
            icon: BrickImage,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    addCardOptions: {
                        appendCards: 1,
                    },
                },
            ],
        },
    ],
};

export const hammerang: Ability = {
    name: "Hammerang",
    resourceCost: 1,
    reusable: true, // Hmm... beware of any ability that reduces resource cost
    image: HammerImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            damage: 7,
            secondaryDamage: 5,
            targetArea: 2,
            numTargets: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            ricochet: true,
            animation: ANIMATION_TYPES.YOYO,
            icon: HammerImage,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                    secondaryDamage: 2,
                },
            ],
        },
    ],
};

export const ironWill: Ability = {
    name: "Iron Will",
    resourceCost: 1,
    image: IronWillImage,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            effects: [
                {
                    name: "Iron Will",
                    icon: IronWillImage,
                    description: "Receiving +2 armor from armor sources",
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    armorReceived: 2,
                },
            ],
        },
    ],
    upgrades: [
        {
            preemptive: true,
        },
    ],
};

export const hyperBody: Ability = {
    name: "Hyper Body",
    resourceCost: 1,
    image: HyperBodyImage,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    description: "+1 healing received",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Hyper Body",
                    description: "+1 healing received",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    healingReceived: 1,
                },
            ],
        },
    ],
    upgrades: [
        {
            preemptive: true,
        },
    ],
};

export const sweepingReach: Ability = {
    name: "Sweeping Reach",
    resourceCost: 1,
    image: WeaponBoosterImage,
    description: "+1 area for your next offensive ability",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Sweeping Reach",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: WeaponBoosterImage,
                    description: "Increases the area of your next offensive ability",
                    attackAreaIncrease: 1,
                    stacks: 1,
                    maxApplications: 1,
                    onOffensiveAbility: {
                        decrementStacks: 1,
                    },
                },
            ],
        },
    ],
    upgrades: [
        {
            description: "+1 area for your next 2 offensive abilities",
            actions: [
                {
                    effects: [
                        {
                            stacks: 1,
                        },
                    ],
                },
            ],
        },
    ],
};

export const sharpen: Ability = {
    name: "Sharpen",
    resourceCost: 1,
    image: WeaponMasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Sharpen",
                    disableDisplayIcon: true,
                    icon: WeaponMasteryImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 1,
                    duration: 5,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            duration: Infinity,
                        },
                    ],
                },
            ],
        },
    ],
};

export const rush: Ability = {
    name: "Rush",
    resourceCost: 1,
    image: RushImage,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 1,
                effects: {
                    resourceCost: -1,
                },
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const berserk2: Ability = {
    name: "Berserk",
    level: 2,
    resourceCost: 0,
    image: PowerStanceImage,
    depletedOnUse: true,
    description: "Reduces the cost of cards in your current hand by 3 until they are used or discarded",
    rarity: RARITIES.RARE,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 1,
            },
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            currentHandEffects: {
                resourceCost: -3,
            },
        },
    ],
};

export const berserk: Ability = {
    name: "Berserk",
    resourceCost: 0,
    image: PowerStanceImage,
    depletedOnUse: true,
    description: "Reduces the cost of cards in your current hand by 3 until they are used or discarded",
    rarity: RARITIES.RARE,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            currentHandEffects: {
                resourceCost: -3,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    drawCards: {
                        amount: 1,
                    },
                },
            ],
        },
    ],
};

export const closeCombat: Ability = {
    name: "Close Combat",
    resourceCost: 1,
    image: CloseCombatImage,
    description: "Pulls enemies toward the selected target",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            vacuum: 2,
            area: 2,
            effects: [stun],
            damage: 1,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 1,
                },
            ],
        },
    ],
};

export const recovery: Ability = {
    name: "Recovery",
    resourceCost: 1,
    image: SelfRecoveryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Recovery",
                    icon: SelfRecoveryImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    canBeSilenced: true,
                    duration: 3,
                    onTurnEnd: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        healing: 2,
                    },
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            onTurnEnd: {
                                healing: 1,
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export const magicCrash: Ability = {
    name: "Magic Crash",
    resourceCost: 1,
    image: MagicCrashImage,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            effects: [{ ...silence }],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const dash: Ability = {
    name: "Dash",
    resourceCost: 1,
    image: WarriorMasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 2,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    drawCards: {
                        amount: 1,
                    },
                },
            ],
        },
    ],
};

export const ironBody: Ability = {
    name: "Iron Body",
    resourceCost: 1,
    image: IronBodyImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            armor: 7,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    ...preventArmorDecay,
                    duration: 2,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 3,
                },
            ],
        },
    ],
};

export const rendingStrike: Ability = {
    name: "Rend",
    resourceCost: 1,
    image: BlastExtraStrikeImage,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 3,
            effects: [
                {
                    ...bleed,
                    duration: 3,
                },
                {
                    ...bleed,
                    duration: 3,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const whirlwind: Ability = {
    name: "Whirlwind",
    image: PanicImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 2,
            damage: 3,
            effects: [
                {
                    ...bleed,
                    duration: 3,
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const rupture: Ability = {
    name: "Right In The Kisser",
    resourceCost: 1,
    image: RedFistOfFuryImage,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 8,
            effects: [stun],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const cross: Ability = {
    name: "Cross",
    resourceCost: 0,
    image: BlueFistOfFuryImage,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    description: "Discover an attack from your deck. It costs 1 less until used or discarded.",
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 5,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.DISCOVER_FROM_DECK,
                filters: [ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK],
                effects: {
                    resourceCost: -1,
                },
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const bladestorm: Ability = {
    name: "Bladestorm",
    resourceCost: 0,
    image: BladestormImage,
    depletedOnUse: true,
    rarity: RARITIES.RARE,
    actions: [
        {
            addCards: [whirlwind, whirlwind, whirlwind].map((card) => ({ ...card, removeAfterTurn: true })),
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    addCardOptions: {
                        isUpgraded: true,
                    },
                },
            ],
        },
    ],
};

export const combatOrders: Ability = {
    name: "Combat Orders",
    resourceCost: 0,
    image: CombatOrdersImage,
    description: "Commands all targeted allies to attack",
    actions: [
        {
            area: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            effects: [
                {
                    name: "Inspired",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 1,
                    duration: 0,
                    icon: CombatOrdersImage,
                },
            ],
            induceCombatantAttack: true,
            playbackTime: 1200,
        },
    ],
    upgrades: [],
};

export const dustDevils: Ability = {
    name: "Dust Devils",
    resourceCost: 1,
    image: TornadoIcon,
    description: "When you attack, summon tornadoes that deal 1 damage and hit up to 3 enemies",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Dust Devils",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 5,
                    icon: TornadoIcon,
                    description: "When you attack, summon tornadoes that deal 1 damage and hit up to 3 enemies",
                    onAttack: {
                        ability: {
                            name: "Dust Devils",
                            image: TornadoIcon,
                            actions: [
                                {
                                    target: TARGET_TYPES.RANDOM_HOSTILE,
                                    type: ACTION_TYPES.RANGE_ATTACK,
                                    animationOptions: {
                                        sidewinder: true,
                                    },
                                    damage: 1,
                                    icon: TornadoIcon,
                                    playbackTime: 350,
                                    numTargets: 2, // Bug: 1 more target is hit than stated in this property
                                    targetArea: 5,
                                },
                            ],
                        },
                    },
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            description: "When you attack, summon tornadoes that deal 1-2 damage and hit up to 3 enemies",
                            onAttack: {
                                ability: {
                                    actions: [
                                        {
                                            secondaryDamage: 2,
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export const doubleTime: Ability = {
    name: "Double Time",
    image: DoubleTimeImage,
    resourceCost: 0,
    description: "Create a copy of a card in your hand. It costs 1 less and is Ephemeral",
    depletedOnUse: true,
    rarity: RARITIES.RARE,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.COPY_FROM_HAND,
                effects: {
                    resourceCost: -1,
                    removeAfterTurn: true,
                },
            },
        },
    ],
    upgrades: [
        {
            description: "Create a copy of a card in your hand. It costs 2 less and is Ephemeral",
            actions: [
                {
                    selectCards: {
                        effects: {
                            resourceCost: -2,
                        },
                    },
                },
            ],
        },
    ],
};

export const arsenal: Ability = {
    name: "Arsenal",
    resourceCost: 1,
    image: AdvancedWeaponMasteryImage,
    description: "Discover an offensive ability available to your class. It costs 1 less and is Ephemeral",
    rarity: RARITIES.RARE,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.DISCOVER_FROM_CLASS,
                filters: [ACTION_TYPES.ATTACK],
                effects: {
                    resourceCost: -1,
                    removeAfterTurn: true,
                },
            },
        },
    ],
    upgrades: [
        {
            description: "Discover an offensive ability available to your class. It costs 2 less and is Ephemeral",
            actions: [
                {
                    selectCards: {
                        effects: {
                            resourceCost: -1,
                        },
                    },
                },
            ],
        },
    ],
};

export const sledge: Ability = {
    name: "Sledge",
    resourceCost: 2,
    image: GiganticSledgeImage,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    description: "Deplete another card in your hand to use this ability",
    selectCards: {
        type: SELECT_CARD_TYPES.DEPLETE_FROM_HAND,
    },
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 15,
            destroyArmor: 1,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 5,
                },
            ],
        },
    ],
};

export const bladedArmor: Ability = {
    name: "Bladed Armor",
    resourceCost: 1,
    image: MetalAxeImage,
    description: "When you lose armor, hurl a sidearm at a random enemy for 2 damage",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Bladed Armor",
                    icon: MetalAxeImage,
                    duration: 5,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    onArmorLoss: {
                        ability: {
                            name: "Sidearm",
                            image: MetalAxeImage,
                            actions: [
                                {
                                    type: ACTION_TYPES.RANGE_ATTACK,
                                    animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
                                    target: TARGET_TYPES.RANDOM_HOSTILE,
                                    icon: MetalAxeImage,
                                    damage: 2,
                                    playbackTime: 400,
                                },
                            ],
                        },
                    },
                },
            ],
        },
    ],
};

export const guillotine: Ability = {
    name: "Guillotine",
    resourceCost: 1,
    image: InstinctualComboImage,
    description: "On kill: Refund cost and return to hand",
    rarity: RARITIES.RARE,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 10,
            secondaryAction: {
                target: "actor",
                returnParentCardToHand: true,
                resources: 1,
                conditions: [
                    {
                        healthPercentage: 0,
                        comparator: "eq",
                        calculationTarget: CONDITION_TARGETS.TARGET,
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                },
            ],
        },
    ],
};

export const counterattack: Ability = {
    name: "Counter",
    image: NamelessSwordImage,
    resourceCost: 1,
    rarity: RARITIES.RARE,
    overrideBodyText: true,
    description: "Next turn, when you are attacked, counter for 5 damage and inflict Bleed.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Counter",
                    type: EFFECT_TYPES.RAGE,
                    class: EFFECT_CLASSES.BUFF,
                    image: NamelessSwordImage,
                    icon: NamelessSwordImage,
                    duration: 2,
                    onReceiveAttack: {
                        targetType: TRIGGER_TARGET_TYPES.ACTOR,
                        ability: {
                            name: "Counter",
                            image: NamelessSwordImage,
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
                    },
                    onTurnStart: {
                        removeEffect: true,
                    },
                },
            ],
        },
    ],
    upgrades: [
        {
            description: "Next turn, when you are attacked, counter for 7 damage and inflict Bleed.",
            actions: [
                {
                    effects: [
                        {
                            onReceiveAttack: {
                                ability: {
                                    actions: [
                                        {
                                            damage: 2,
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export const poundOfNails: Ability = {
    name: "Pound Of Nails",
    resourceCost: 2,
    image: BundleOfNailsImage,
    rarity: RARITIES.UNCOMMON,
    depletedOnUse: true,
    actions: [
        {
            target: TARGET_TYPES.FRIENDLY,
            effects: [thorns, thorns, thorns],
            type: ACTION_TYPES.EFFECT,
        },
    ],
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const overpower: Ability = {
    name: "Overpower",
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    image: RageImage,
    description: "+3 damage to targets with less HP than you",
    overrideBodyText: true,
    actions: [
        {
            damage: 5,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            area: 1,
            bonus: {
                damage: 3,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        comparator: "gt",
                        otherCalculationTarget: {
                            targetType: CONDITION_TARGETS.TARGET,
                            property: "HP",
                        },
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            description: "+4 damage to targets with less HP than you",
            actions: [
                {
                    damage: 2,
                    bonus: {
                        damage: 1,
                    },
                },
            ],
        },
    ],
};

export const braveSlash: Ability = {
    name: "Brave Slash",
    resourceCost: 1,
    depletedOnUse: true,
    image: IntrepidSlashImage,
    rarity: RARITIES.UNCOMMON,
    description: "Randomly hits the target or its neighbors, x3",
    actions: [
        {
            damage: 5,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
            targetArea: 1,
        },
        {
            damage: 5,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
            targetArea: 1,
        },
        {
            damage: 5,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
            targetArea: 1,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
                {
                    damage: 2,
                },
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const puncture: Ability = {
    name: "Puncture",
    resourceCost: 1,
    image: PunctureImage,
    actions: [
        {
            damage: 5,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    ...bleed,
                    duration: 3,
                },
            ],
            area: 1,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const brandish: Ability = {
    name: "Brandish",
    resourceCost: 1,
    image: BrandishImage,
    description: "Hits twice",
    actions: [
        {
            damage: 5,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            damage: 5,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const comboFury: Ability = {
    name: "Combo Fury",
    resourceCost: 0,
    image: ComboFuryImage,
    description: "Deals 1 damage for every attack you made this turn, hitting twice",
    actions: [
        {
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
        {
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
};

export const parry: Ability = {
    name: "Parry",
    resourceCost: 0,
    image: EndureImage,
    description: "(Armor multiplied by the number of attacks made this turn)",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            armor: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
};

export const ragingBlow: Ability = {
    name: "Raging Blow",
    resourceCost: 1,
    image: RagingBlowImage,
    rarity: RARITIES.UNCOMMON,
    description: "Hits twice",
    actions: [
        {
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Rage",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    icon: RagingBlowImage,
                    disableDisplayIcon: true,
                    skillBonus: [{ skill: "Raging Blow", damage: 2 }],
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [{ damage: 2 }, { damage: 2 }],
        },
    ],
};

export const worldReaver: Ability = {
    name: "World Reaver",
    resourceCost: 2,
    depletedOnUse: true,
    image: WorldReaverImage,
    rarity: RARITIES.RARE,
    actions: [
        {
            area: 1,
            damage: 13,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    ...immunity,
                    duration: 2, // Ticks down on turn end
                },
            ],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const risingRage: Ability = {
    name: "Rising Rage",
    resourceCost: "x",
    image: RisingRageImage,
    description: "Expend the rest of your Fury to deal {{ damage }} damage for each Fury spent.",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            area: 1,
            damage: 6,
            multiplier: {
                calculationTarget: CONDITION_TARGETS.ACTOR,
                type: MULTIPLIER_TYPES.RESOURCES_SPENT,
            },
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: RisingRageImage,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const burningSoulBlade: Ability = {
    name: "Burning Soul Blade",
    resourceCost: 1,
    image: BurningSoulBladeImage,
    description: "When this character attacks, it gains +1 ATT.",
    rarity: RARITIES.RARE,
    actions: [],
    minion: {
        name: "Burning Soul Blade",
        image: BurningSoulBladeMinionImage,
        maxHP: 1,
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
        ],
        effects: [
            { ...immunity, duration: 3 },
            {
                name: "Burning Soul Blade",
                icon: BurningSoulBladeMinionImage,
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                description: "When this character attacks, it gains +1 ATT.",
                onAttack: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    effects: [attackPower],
                },
            },
        ],
    },
};

export const divineCharge: Ability = {
    name: "Fierce Charge",
    resourceCost: 1,
    image: DivineChargeImage,
    description: "Heal 1 for every enemy hit.",
    actions: [
        {
            damage: 5,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            secondaryAction: {
                target: "actor",
                healing: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.NUM_AFFECTED_TARGETS,
                },
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const shieldMastery: Ability = {
    name: "Shield Mastery",
    resourceCost: 0,
    image: ShieldMasteryImage,
    rarity: RARITIES.UNCOMMON,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Shield Mastery",
                    icon: ShieldMasteryImage,
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    armorReceived: 2,
                    duration: 2,
                },
            ],
            addCards: [block, block, block].map((card) => ({ ...card, removeAfterTurn: true })),
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    addCardOptions: {
                        isUpgraded: true,
                    },
                },
            ],
        },
    ],
};

export const judgment: Ability = {
    name: "Judgment",
    resourceCost: 2,
    image: HighPaladinImage,
    rarity: RARITIES.UNCOMMON,
    description: "Deals damage equal to your armor",
    actions: [
        {
            damage: 1,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: {
                type: MULTIPLIER_TYPES.ARMOR,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
    upgrades: [
        {
            addActions: {
                prepend: true,
                actions: [
                    {
                        armor: 3,
                        target: TARGET_TYPES.SELF,
                        type: ACTION_TYPES.EFFECT,
                    },
                ],
            },
        },
    ],
};

export const parashockGuard: Ability = {
    name: "Parashock Guard",
    resourceCost: 1,
    image: ParashockGuardImage,
    description: "Double your current armor",
    rarity: RARITIES.UNCOMMON,
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            bonus: {
                armor: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.ARMOR,
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                },
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        armor: 0,
                        comparator: "gt",
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            addActions: {
                prepend: true,
                actions: [
                    {
                        armor: 2,
                        target: TARGET_TYPES.SELF,
                        type: ACTION_TYPES.EFFECT,
                    },
                ],
            },
        },
    ],
};

export const bloodthirst: Ability = {
    name: "Bloodthirst",
    resourceCost: 1,
    image: DarkThirstImage,
    rarity: RARITIES.RARE,
    description: "Gain +1 Leech, +3 life on kill, and +1 ATT, but self-inflict Bleed. 3 turns.",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Bloodthirst",
                    icon: DarkThirstImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 1,
                    lifeOnHit: 1,
                    lifeOnKill: 3,
                    duration: 3,
                    maxApplications: 1,
                },
                {
                    ...bleed,
                    duration: 3,
                },
            ],
        },
    ],
};

export const battlelord: Ability = {
    name: "Battle Lord",
    resourceCost: 2,
    image: LordOfDarknessImage,
    depletedOnUse: true,
    rarity: RARITIES.RARE,
    description: "Gain +1 life on hit and +1 ATT. Counter: gain +1 ATT. 3 turns.",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Battle Lord",
                    icon: LordOfDarknessImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 1,
                    duration: 3,
                    lifeOnHit: 1,
                    onReceiveAttack: {
                        effects: [{ ...attackPower, duration: 3, disableDisplayIcon: true }],
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    },
                    maxApplications: 1,
                },
            ],
        },
    ],
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const gungnir: Ability = {
    name: "Gungnir",
    resourceCost: 3,
    depletedOnUse: true,
    image: GungnirImage,
    rarity: RARITIES.RARE,
    description: "Deal 30% of your HP in damage",
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            damage: 1,
            multiplier: {
                type: MULTIPLIER_TYPES.HP,
                value: 0.3,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
    upgrades: [
        {
            description: "Deal 40% of your HP in damage",
            actions: [
                {
                    multiplier: {
                        value: 0.1,
                    },
                },
            ],
        },
    ],
};

export const nightshadeExplosion: Ability = {
    name: "Nightshade Explosion",
    resourceCost: 1,
    image: NightShadeExplosionImage,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            damage: 5,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: NightShadeExplosionImage,
            resources: 2,
            radiate: {
                area: 2,
                damage: 5,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    radiate: {
                        damage: 2,
                    },
                },
            ],
        },
    ],
};

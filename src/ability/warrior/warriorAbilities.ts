import { getUpgradeCard } from "./../../Menu/utils";
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
    ComboSynergyImage,
    DarkThirstImage,
    DivineChargeImage,
    DoubleTimeImage,
    EndureImage,
    EnrageImage,
    FlagImage,
    GiganticSledgeImage,
    GoldBarImage,
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
    PinkBeanStatueImage,
    PowerStanceImage,
    PunctureImage,
    RageImage,
    RagingBlowImage,
    RedFistOfFuryImage,
    RisingRageImage,
    RockImage,
    RushImage,
    SelfRecoveryImage,
    ShieldMasteryImage,
    ShieldRedImage,
    ShoutImage,
    SlashBlastImage,
    SpikeBallImage,
    SpikedMaceImage,
    SquareHammerImage,
    WarLeapImage,
    WarMushBattleLordImage,
    WarMushImage,
    WarriorMasteryImage,
    WarriorThroneImage,
    WeaponBoosterImage,
    WeaponMasteryImage,
    WorldReaverImage,
} from "../../images";
import { TornadoIcon } from "../../images/icons";
import { RARITIES } from "../../item/types";
import { bleed, immunity, silence, stealth, stun, thorns, attackPower, armorUp, infuriateEffect } from "../Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    AbilityEffect,
    Action,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../types";
import { preventArmorDecayPlayer } from "./../Effects";
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

export const charge: Ability = {
    name: "Charge",
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

export const cleave: Ability = {
    name: "Cleave",
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
            damage: 4,
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
            armor: 3,
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
    name: "War Banner - Attack Power",
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
    image: FlagImage,
    resourceCost: 1,
    description: "Summon and Turn Start: 2 Armor and +1 ATT to nearby allies.",
    rarity: RARITIES.UNCOMMON,
    minion: {
        name: "War Banner",
        image: FlagImage,
        maxHP: 3,
        abilities: [
            {
                ...attack,
                actions: [
                    {
                        type: ACTION_TYPES.ATTACK,
                        target: TARGET_TYPES.HOSTILE,
                        damage: 0,
                    },
                ],
            },
        ],
        effects: [
            {
                ...stealth,
                duration: 3,
            },
            {
                name: "War Banner - Drumbeat of War",
                description: "Granting 2 Armor and +1 ATT to nearby allies every turn.",
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
    upgrades: [
        {
            minion: {
                effects: [
                    {
                        duration: 2,
                    },
                    {
                        onTurnStart: {
                            ability: {
                                actions: [
                                    {
                                        armor: 1,
                                    },
                                ],
                            },
                        },
                        onSummoned: {
                            ability: {
                                actions: [
                                    {
                                        armor: 1,
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
                    attackPower: -1,
                    duration: 3,
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
                            duration: 1,
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
            animationOptions: {
                ricochet: true,
            },
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
    description: "+2 armor from armor sources",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            effects: [armorUp, armorUp],
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
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            armor: 7,
            drawCards: {
                amount: 1,
            },
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

export const sweepingReach: Ability = {
    name: "Sweeping Reach",
    resourceCost: 1,
    image: WeaponBoosterImage,
    description: "Your next {{{ _offense_ }}} ability gains +1 Area",
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
            description: "Your next {{ actions.0.effects.0.stacks }} {{{ _offense_ }}} abilities gain +1 Area",
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
                effects: [
                    {
                        resourceCost: -1,
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

export const berserk: Ability = {
    name: "Berserk",
    resourceCost: 0,
    image: PowerStanceImage,
    depletedOnUse: true,
    description: "5 random cards in your hand cost 3 less, until they are discarded.",
    rarity: RARITIES.RARE,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            applyAbilityEffects: {
                pile: "hand",
                amount: 5,
                abilityEffects: [
                    {
                        resourceCost: -3,
                    },
                ],
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
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            vacuum: 2,
            area: 2,
            effects: [stun],
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
                        healing: 3,
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

export const disrupt: Ability = {
    name: "Disrupt",
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
    overrideBodyText: true,
    description: "Prevent the next time your armor decays",
    actions: [
        {
            armor: 7,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    ...preventArmorDecayPlayer,
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

export const rend: Ability = {
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

export const rightInTheKisser: Ability = {
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
    description: "Search for an attack from your deck. It costs 1 less until discarded.",
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
                type: SELECT_CARD_TYPES.SEARCH_DECK,
                filters: [ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK],
                effects: [
                    {
                        resourceCost: -1,
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
                        upgradeLevels: 1,
                    },
                },
            ],
        },
    ],
};

export const combatOrders: Ability = {
    name: "Combat Orders",
    resourceCost: 1,
    image: CombatOrdersImage,
    description: "Grants targeted allies +1 ATT for the rest of the turn and commands them to attack",
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
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            attackPower: 1,
                        },
                    ],
                },
            ],
        },
    ],
};

export const dustDevils: Ability = {
    name: "Dust Devils",
    resourceCost: 1,
    image: TornadoIcon,
    description: "When you attack, cast tornadoes that deal {{ nestedAbility.actions.0.damage }} damage and hit up to 3 enemies",
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
                    description: "When you attack, cast tornadoes that hit up to 3 enemies",
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
                                    numTargets: 2, // 1 more target is hit than stated in this property due to the initial auto target
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
                            onAttack: {
                                ability: {
                                    actions: [
                                        {
                                            damage: 1,
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
    resourceCost: 1,
    description: "Copy a card in your hand. It is Ephemeral.",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.COPY_FROM_HAND,
                effects: [
                    {
                        removeParentCardAfterTurn: true,
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            description: "Copy a card in your hand. It is Ephemeral and costs {{ actions.0.selectCards.effects.resourceCost }} less.",
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

export const arsenal: Ability = {
    name: "Arsenal",
    resourceCost: 1,
    image: AdvancedWeaponMasteryImage,
    description: "Discover a {{{ _offense_ }}} card for your class. It costs 1 less and is Ephemeral",
    rarity: RARITIES.RARE,
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.DISCOVER_FROM_CLASS,
                filters: [ACTION_TYPES.ATTACK],
                effects: [
                    {
                        resourceCost: -1,
                        removeParentCardAfterTurn: true,
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            description: "Discover an Upgraded {{{ _offense_ }}} card for your class. It costs 1 less and is Ephemeral",
            actions: [
                {
                    selectCards: {
                        effects: [
                            {
                                upgradedByLevels: 1,
                            },
                        ],
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
    description: "When you lose armor, hurl a sidearm at a random enemy for {{ nestedAbility.actions.0.damage }} damage",
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
    upgrades: [
        {
            actions: [
                {
                    effects: [
                        {
                            onArmorLoss: {
                                ability: {
                                    actions: [
                                        {
                                            damage: 1,
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

export const guillotine: Ability = {
    name: "Guillotine",
    resourceCost: 1,
    image: InstinctualComboImage,
    description: "On kill: Refund cost and return to hand.",
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
    description: "Until your next turn, you counter attackers for {{ nestedAbility.actions.0.damage }} damage and inflict Bleed.",
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
    description: "+{{ actions.0.bonus.damage }} damage to targets with less HP than you",
    overrideBodyText: true,
    actions: [
        {
            damage: 5,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            area: 1,
            bonus: {
                damage: 4,
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
            damage: 4,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            damage: 4,
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
    description: "Deals 1 damage for every attack you made this turn. Hits twice.",
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
    description: "Gain Armor equal to the number of attacks made this turn.",
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
    description: "Gain immunity for the rest of your turn. Hits twice.",
    overrideBodyText: true,
    actions: [
        {
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            secondaryAction: {
                target: "actor",
                effects: [
                    {
                        ...immunity,
                        duration: 1,
                    },
                ],
            },
        },
        {
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
    ],
    upgrades: [
        {
            actions: [{ damage: 2 }, { damage: 2 }],
        },
    ],
};

export const worldReaver: Ability = {
    name: "Reaver",
    resourceCost: 2,
    depletedOnUse: true,
    image: WorldReaverImage,
    rarity: RARITIES.RARE,
    description: "You become Immune until your next turn.",
    overrideBodyText: true,
    actions: [
        {
            area: 1,
            damage: 12,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            secondaryAction: {
                target: "actor",
                isPriority: true,
                effects: [
                    {
                        ...immunity,
                        duration: undefined,
                        stacks: 1,
                        onTurnStart: {
                            removeEffect: true,
                        },
                    },
                ],
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

export const risingRage: Ability = {
    name: "Rising Rage",
    resourceCost: "x",
    image: RisingRageImage,
    description: "Expend the rest of your Fury to deal {{ actions.0.damage }} damage for each Fury spent.",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            area: 1,
            damage: 7,
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
    name: "Soul Blade",
    resourceCost: 1,
    image: BurningSoulBladeImage,
    description: "When this character attacks, it gains +1 ATT.",
    rarity: RARITIES.RARE,
    actions: [],
    minion: {
        name: "Soul Blade",
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
            { ...immunity, duration: 2 },
            {
                name: "Soul Blade",
                icon: BurningSoulBladeMinionImage,
                disableDisplayIcon: true,
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
    upgrades: [
        {
            minion: {
                abilities: [
                    {
                        actions: [
                            {
                                damage: 2,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};

export const divineCharge: Ability = {
    name: "Fierce Charge",
    resourceCost: 1,
    image: DivineChargeImage,
    description: "Heal 1 for every enemy hit.",
    actions: [
        {
            damage: 6,
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
            addCards: [block, block, block].map((card) => ({ ...getUpgradeCard(card), removeAfterTurn: true })),
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    addCardOptions: {
                        upgradeLevels: 1,
                    },
                },
            ],
        },
    ],
};

export const judgment: Ability = {
    name: "Judgment",
    resourceCost: 1,
    image: HighPaladinImage,
    rarity: RARITIES.UNCOMMON,
    description: "Deals damage equal to your Armor.",
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
            description: "Gain {{ actions.0.secondaryAction.armor }} Armor. Deals damage equal to your Armor.",
            actions: [
                {
                    secondaryAction: {
                        armor: 2,
                        target: TARGET_TYPES.SELF,
                        type: ACTION_TYPES.EFFECT,
                        isPriority: true,
                    },
                },
            ],
        },
    ],
};

export const shockGuard: Ability = {
    name: "Shock Guard",
    resourceCost: 1,
    image: ParashockGuardImage,
    description: "Double your current Armor.",
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
    description: "Gain {{ actions.0.effects.0.lifeOnHit }} Leech for {{ actions.0.effects.0.duration }} turns.",
    depletedOnUse: true,
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
                    lifeOnHit: 1,
                    duration: 2,
                    maxApplications: 1,
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
                            duration: 1,
                        },
                    ],
                },
            ],
        },
    ],
};

const battlelordAbilityEffect: AbilityEffect = {
    name: "Battle Lord",
    upgradedByLevels: 1,
    maxApplications: 1,
};

export const battlelord: Ability = {
    name: "Battle Lord",
    resourceCost: 2,
    image: LordOfDarknessImage,
    depletedOnUse: true,
    rarity: RARITIES.RARE,
    description: "For 3 turns, cards in your hand are Upgraded.",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.STOMP,
            applyAbilityEffects: {
                pile: "hand",
                abilityEffects: [battlelordAbilityEffect],
            },
            effects: [
                {
                    name: "Battle Lord",
                    icon: LordOfDarknessImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    override: {
                        portrait: WarMushBattleLordImage,
                    },
                    duration: 3,
                    maxApplications: 1,
                    onTurnInProgress: {
                        applyAbilityEffects: {
                            pile: "hand",
                            abilityEffects: [battlelordAbilityEffect],
                        },
                    },
                    onAddCardToHand: {
                        applyAbilityEffects: {
                            pile: "hand",
                            abilityEffects: [battlelordAbilityEffect],
                        },
                    },
                    onDrawCard: {
                        applyAbilityEffects: {
                            pile: "hand",
                            abilityEffects: [battlelordAbilityEffect],
                        },
                    },
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
    resourceCost: 2,
    image: GungnirImage,
    rarity: RARITIES.RARE,
    description: "Deal damage equal to {{ actions.0.multiplier.value }}x your current HP.",
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            damage: 1,
            multiplier: {
                type: MULTIPLIER_TYPES.HP,
                value: 0.25,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    multiplier: {
                        value: 0.05,
                    },
                },
            ],
        },
    ],
};

export const ironMaiden: Ability = {
    name: "Iron Maiden",
    resourceCost: 2,
    image: NightShadeExplosionImage,
    rarity: RARITIES.UNCOMMON,
    description: "(Damage increased by Thorns.)",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            effects: [{ ...thorns }],
            type: ACTION_TYPES.EFFECT,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: SpikeBallImage,
            animationOptions: {
                width: 100,
                height: 100,
            },
            radiate: {
                area: 2,
                damage: 3,
                bonus: {
                    damage: 1,
                    multiplier: {
                        type: MULTIPLIER_TYPES.BUFFS,
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        filters: [
                            {
                                property: "name",
                                comparator: "eq",
                                value: thorns.name,
                            },
                        ],
                    },
                    conditions: [
                        {
                            hasEffect: "Thorns",
                            calculationTarget: CONDITION_TARGETS.ACTOR,
                        },
                    ],
                },
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {},
                {
                    radiate: {
                        damage: 2,
                    },
                },
            ],
        },
    ],
};

export const hurlBoulder: Ability = {
    name: "Hurl Boulder",
    image: RockImage,
    resourceCost: 5,
    description: "Whenever this card leaves your hand, reduce its cost by 1.",
    onLeaveHand: {
        abilityEffects: [
            {
                removeOnDiscard: false,
                resourceCost: -1,
            },
        ],
    },
    actions: [
        {
            damage: 25,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
            icon: RockImage,
            animationOptions: {
                width: 150,
                height: 150,
            },
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

export const reinforce: Ability = {
    name: "Reinforce",
    image: ComboSynergyImage,
    description: "Search for a {{{ _support_ }}} card from your deck. It is Upgraded until discarded.",
    resourceCost: 0,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.SEARCH_DECK,
                filters: [ACTION_TYPES.EFFECT],
                effects: [
                    {
                        upgradedByLevels: 1,
                    },
                ],
            },
        },
    ],
    upgrades: [
        {
            description: "Search for a {{{ _support_ }}} card from your deck. It is Upgraded for the rest of battle.",
            actions: [
                {
                    selectCards: {
                        effects: [
                            {
                                removeOnDiscard: false,
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

export const forgehammer: Ability = {
    name: "Forge Hammer",
    image: SquareHammerImage,
    description: "Upgrade a random card in hand for the rest of battle.",
    rarity: RARITIES.UNCOMMON,
    resourceCost: 1,
    actions: [
        {
            damage: 5,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: SquareHammerImage,
            applyAbilityEffects: {
                pile: "hand",
                amount: 1,
                abilityEffects: [
                    {
                        upgradedByLevels: 1,
                        removeOnDiscard: false,
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

export const guardian: Ability = {
    name: "Guardian Statue",
    image: PinkBeanStatueImage,
    overrideBodyText: true,
    description:
        "Every turn, Radiates {{ nestedAbility.actions.0.radiate.damage }} damage to enemies / {{ nestedAbility.actions.0.secondaryAction.healing }} healing to allies within 2 spaces.",
    rarity: RARITIES.RARE,
    resourceCost: 2,
    minion: {
        name: "Guardian Statue",
        image: PinkBeanStatueImage,
        maxHP: 9,
        abilities: [
            {
                ...attack,
                actions: [
                    {
                        type: ACTION_TYPES.ATTACK,
                        target: TARGET_TYPES.HOSTILE,
                        damage: 0,
                    },
                ],
            },
        ],
        effects: [
            {
                name: "Golden",
                description: "Character cannot take more than 3 damage in a single hit.",
                icon: GoldBarImage,
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                maxDamageTaken: 3,
                onTurnStart: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    ability: {
                        name: "Guardian",
                        image: PinkBeanStatueImage,
                        actions: [
                            {
                                type: ACTION_TYPES.EFFECT,
                                target: TARGET_TYPES.SELF,
                                animation: ANIMATION_TYPES.SHOUT,
                                radiate: {
                                    area: 2,
                                    damage: 5,
                                },
                                secondaryAction: {
                                    target: "actor",
                                    area: 2,
                                    healing: 2,
                                },
                            },
                        ],
                    },
                },
                onSummoned: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    ability: {
                        name: "Guardian",
                        image: PinkBeanStatueImage,
                        actions: [
                            {
                                type: ACTION_TYPES.EFFECT,
                                target: TARGET_TYPES.SELF,
                                animation: ANIMATION_TYPES.SHOUT,
                                radiate: {
                                    area: 2,
                                    damage: 5,
                                },
                                secondaryAction: {
                                    target: "actor",
                                    area: 2,
                                    healing: 2,
                                },
                            },
                        ],
                    },
                },
            },
        ],
    },
    actions: [],
    upgrades: [
        {
            minion: {
                effects: [
                    {},
                    {
                        onTurnStart: {
                            ability: {
                                actions: [
                                    {
                                        radiate: {
                                            damage: 2,
                                        },
                                        secondaryAction: {
                                            healing: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        onSummoned: {
                            ability: {
                                actions: [
                                    {
                                        radiate: {
                                            damage: 2,
                                        },
                                        secondaryAction: {
                                            healing: 1,
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

export const pursuit: Ability = {
    name: "Pursuit",
    image: ChanceAttackImage,
    description: "When you apply a debuff, attack the target for {{ nestedAbility.actions.0.damage }} damage.",
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Pursuit Effect",
                    icon: ChanceAttackImage,
                    duration: 5,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    onApplyEffect: {
                        targetType: TRIGGER_TARGET_TYPES.TARGET,
                        ability: {
                            name: "Pursuit",
                            image: ChanceAttackImage,
                            actions: [
                                {
                                    // On AOEs, this hits the same target multiple times.
                                    type: ACTION_TYPES.ATTACK,
                                    target: TARGET_TYPES.HOSTILE,
                                    damage: 3,
                                    playbackTime: 500,
                                },
                            ],
                        },
                        conditions: [
                            {
                                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                hasEffectClass: EFFECT_CLASSES.DEBUFF,
                                comparator: "eq",
                            },
                        ],
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
                            onApplyEffect: [
                                {
                                    ability: {
                                        actions: [
                                            {
                                                damage: 1,
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

export const bide: Ability = {
    name: "Bide",
    resourceCost: 1,
    overrideBodyText: true,
    description: "Place up to {{ actions.0.selectCards.maxAmount }} cards from your hand on top of your deck. Gain Infuriate.",
    image: WarriorThroneImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            icon: WarriorThroneImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            selectCards: {
                type: SELECT_CARD_TYPES.HAND_TO_TOP_DECK,
                maxAmount: 2,
            },
            effects: [infuriateEffect],
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    selectCards: {
                        maxAmount: 1,
                    },
                },
            ],
        },
    ],
};

import { shoot } from "./../../enemy/abilities";
import { cloneDeep } from "lodash";
import {
    AdvancedWeaponMasteryImage,
    AvengersArrowImage,
    BallistaImage,
    BladestormImage,
    BladeworksImage,
    BlastExtraStrikeImage,
    BlastImage,
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
    DarkImpaleImage,
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
    LightningChargeImage,
    LordOfDarknessImage,
    MagicCrashImage,
    MetalAxeImage,
    MushmomAngryImage,
    NamelessSwordImage,
    NightShadeExplosionImage,
    PanicImage,
    ParashockGuardImage,
    PinkBeanStatueImage,
    PowerStanceImage,
    PunctureImage,
    RageImage,
    RagingBlowImage,
    RedBoxingGloveImage,
    RedFistOfFuryImage,
    RisingRageImage,
    RockImage,
    RushImage,
    SelfRecoveryImage,
    ShieldMasteryImage,
    ShieldRedImage,
    ShoutImage,
    SilverAquilaImage,
    SlashBlastImage,
    SpearSweepImage,
    SpikeBallImage,
    SpikedMaceImage,
    SquareHammerImage,
    TornadoImage,
    WarLeapImage,
    WarMushBattleLordImage,
    WarMushImage,
    WarriorMasteryImage,
    WarriorThroneImage,
    WeaponBoosterImage,
    WeaponMasteryImage,
    WeaponMasteryLGImage,
    WorldReaverImage,
} from "../../images";
import { RARITIES } from "../../item/types";
import {
    armorUp,
    attackDown,
    attackPower,
    bleed,
    directDamageTaken,
    immunity,
    infuriateEffect,
    silence,
    stealth,
    stun,
    taunt,
    thorns,
    ward,
} from "../Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    AbilityEffect,
    Action,
    CARD_PILE_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../types";
import { getUpgradeCard } from "./../../Menu/utils";
import { preventArmorDecayPlayer } from "./../Effects";
import { MULTIPLIER_TYPES } from "./../types";

import { attack } from "../../enemy/abilities";
import { TRIGGER_SOURCE_TYPES } from "../../battle/types";

export const bash: Ability = {
    name: "Bash",
    resourceCost: 0,
    image: BrickImage,
    actions: [
        {
            damage: 4,
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
    resourceCost: 1,
    image: WarLeapImage,
    description: "Apply <b>{{ actions.0.effects.0.stacks }}</b>{{{ _bleed_ }}}",
    overrideBodyText: true,
    actions: [
        {
            damage: 0,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            effects: [{ ...bleed, stacks: 3 }],
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
            secondaryAction: {
                armor: 8,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 3,
                    secondaryAction: {
                        armor: 3,
                    },
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
            armor: 5,
            target: TARGET_TYPES.FRIENDLY,
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
            armor: 3,
            target: TARGET_TYPES.FRIENDLY,
            effects: [thorns],
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

const drumOfWar: Action = {
    type: ACTION_TYPES.EFFECT,
    target: TARGET_TYPES.SELF,
    excludePrimaryTarget: true,
    armor: 2,
    area: 1,
    effects: [{ ...attackPower, duration: 1 }],
};

export const warBanner: Ability = {
    name: "War Banner",
    image: FlagImage,
    resourceCost: 1,
    description:
        "<b>Stealth.</b> Grants <b>{{ minion.effects.1.onTurnStart.ability.actions.0.armor }}</b> {{{ _armor_ }}} / <b>+1</b> {{{ _damage_ }}} to nearby allies every turn.",
    overrideBodyText: true,
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
                description: "Granting Armor and ATT to nearby allies every turn.",
                icon: FlagImage,
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                excludeEffectOwner: true,
                onTurnStart: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    ability: {
                        name: "Drumbeat of War",
                        image: FlagImage,
                        actions: [
                            {
                                ...cloneDeep(drumOfWar),
                            },
                        ],
                    },
                },
                onSummoned: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    ability: {
                        name: "Drumbeat of War",
                        image: FlagImage,
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
                    {},
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
    overrideBodyText: true,
    description: "Radiate ATT Down. Gain Taunt. <br/> </br> <b>{{ actions.0.effects.0.duration }}<b/>{{{ _duration_ }}}",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.SHOUT,
            effects: [{ ...taunt, duration: 3, maxApplications: 1 }],
            radiate: {
                area: 2,
                effects: [{ ...attackDown, duration: 3 }],
            },
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
                    radiate: [
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
        },
    ],
};

export const bunchOBricks: Ability = {
    name: "Bunch o' Bricks",
    resourceCost: 1,
    image: BricksImage,
    depletedOnUse: true,
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
    description: "<b>+2 {{{ _armor_ }}} Armor Up</b>",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            effects: [{ ...armorUp, stacks: 2 }],
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
            target: TARGET_TYPES.FRIENDLY,
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
                    description: "Increases the area of your next offensive ability.",
                    conditions: [
                        {
                            calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                            notProc: true,
                        },
                    ],
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
    resourceCost: 0,
    image: WeaponMasteryLGImage,
    description: "Gain <b>+1 {{{ _damage_ }}} {{ actions.0.effects.0.duration }}{{{ _duration_ }}}</b>",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            area: 1,
            effects: [
                {
                    ...attackPower,
                    duration: 3,
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
                            attackPower: 1,
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
            damage: 5,
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
    resourceCost: 1,
    image: PowerStanceImage,
    depletedOnUse: true,
    description: "{{ actions.1.applyAbilityEffects.amount }} random cards in your hand cost 3 less until discarded.",
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
                pile: CARD_PILE_TYPES.HAND,
                amount: 4,
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
    description: "Apply {{{ _stun_ }}} and pull enemies toward the target.",
    overrideBodyText: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 0,
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
    description: "Gain {{ actions.0.effects.0.lifeOnKill }} {{{ _healing_ }}} on kill.",
    depletedOnUse: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            effects: [
                {
                    name: "Recovery",
                    icon: SelfRecoveryImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    canBeSilenced: true,
                    lifeOnKill: 2,
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
                            lifeOnKill: 1,
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
    description: "Apply {{{ _silence_ }}} <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}} + {{{ _stun_ }}}",
    overrideBodyText: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            effects: [{ ...silence }, stun],
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
    description: "Gain <b>1 Pristine.</b>",
    actions: [
        {
            armor: 7,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
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
    description: "Apply <b>{{ actions.0.effects.0.stacks }}</b>{{{ _bleed_ }}}",
    overrideBodyText: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 0,
            effects: [
                {
                    ...bleed,
                    stacks: 4,
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
    description: "Apply <b>{{ actions.0.effects.0.stacks }}</b>{{{ _bleed_ }}}",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 2,
            damage: 3,
            effects: [
                {
                    ...bleed,
                    stacks: 2,
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
    overrideBodyText: true,
    description: "Apply {{{ _stun_ }}}",
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
                filters: [
                    {
                        actionTypes: [ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK],
                    },
                ],
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
    description: "Commands targeted allies to attack.",
    actions: [
        {
            area: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            induceCombatantAttack: true,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    area: 1,
                },
            ],
        },
    ],
};

export const dustDevilsActiveAbility = {
    name: "Dust Devils",
    image: TornadoImage,
    actions: [
        {
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animationOptions: {
                sidewinder: true,
            },
            damage: 1,
            icon: TornadoImage,
            numTargets: 2, // 1 more target is hit than stated in this property due to the initial auto target
            targetArea: 5,
        },
    ],
};

export const dustDevils: Ability = {
    name: "Dust Devils",
    resourceCost: 1,
    image: TornadoImage,
    description:
        "On attack, cast <b>{{ nestedAbility.actions.0.damage }}</b> {{{ _damage_ }}} tornadoes at up to 3 enemies. <br/> <br/> <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
    overrideBodyText: true,
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
                    icon: TornadoImage,
                    description: "Casting tornadoes on attack.",
                    onAttack: {
                        disableTriggerFromProcs: true,
                        ability: dustDevilsActiveAbility,
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
            description: "Copy a card in your hand. It is Ephemeral and costs {{ actions.0.selectCards.effects.0.resourceCost }} less.",
            actions: [
                {
                    selectCards: {
                        effects: [
                            {
                                resourceCost: -1,
                            },
                        ],
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
                filters: [
                    {
                        actionTypes: [ACTION_TYPES.EFFECT],
                    },
                ],
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
                    damage: 7,
                },
            ],
        },
    ],
};

export const bladedArmor: Ability = {
    name: "Bladed Armor",
    resourceCost: 1,
    image: MetalAxeImage,
    description:
        "When you lose armor, hurl a <b>{{ nestedAbility.actions.0.damage }}</b> {{{ _damage_ }}} axe at a random enemy. <br/> <br/> <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
    overrideBodyText: true,
    rarity: RARITIES.COMMON,
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
    description:
        "Until next turn, <b>Taunt</b> and <b>Counter</b> for <b>{{ nestedAbility.actions.0.damage }}</b> {{{ _damage_ }}} + <b>{{ actions.0.effects.0.onReceiveAttack.ability.actions.0.effects.0.stacks }}</b>{{{ _bleed_ }}}.",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Counter",
                    type: EFFECT_TYPES.TAUNT,
                    class: EFFECT_CLASSES.BUFF,
                    portraitImage: NamelessSwordImage,
                    portraitImageOptions: {
                        displayMode: "pulse",
                    },
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
                                            stacks: 2,
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
    resourceCost: 1,
    image: BundleOfNailsImage,
    rarity: RARITIES.UNCOMMON,
    depletedOnUse: true,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            effects: [{ ...thorns, stacks: 3 }],
            type: ACTION_TYPES.EFFECT,
        },
    ],
    upgrades: [
        {
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

export const overpower: Ability = {
    name: "Overpower",
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    image: RageImage,
    description: "+{{ actions.0.bonus.damage }} {{{ _damage_ }}} to targets with less HP than you.",
    overrideBodyText: true,
    actions: [
        {
            damage: 6,
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
            damage: 6,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
            targetArea: 1,
        },
        {
            damage: 6,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
            targetArea: 1,
        },
        {
            damage: 6,
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
    description: "Apply <b>{{ actions.0.effects.0.stacks }}</b>{{{ _bleed_ }}}",
    overrideBodyText: true,
    actions: [
        {
            damage: 5,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    ...bleed,
                    stacks: 2,
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
    description:
        "Deals {{ actions.0.damage }} {{{ _damage_ }}} for each attack you made this turn, up to {{ actions.0.maxDamage }} {{{ _damage_ }}}.",
    actions: [
        {
            damage: 2,
            maxDamage: 10,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: CONDITION_TARGETS.ACTOR,
                filterOutProcs: true,
            },
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

export const parry: Ability = {
    name: "Parry",
    resourceCost: 0,
    image: EndureImage,
    description:
        "Gain {{ actions.0.armor }} {{{ _armor_ }}} for each attack you made this turn, up to {{ actions.0.maxArmor }} {{{ _armor_ }}}.",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            armor: 2,
            maxArmor: 10,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: CONDITION_TARGETS.ACTOR,
                filterOutProcs: true,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    armor: 1,
                },
            ],
        },
    ],
};

export const ragingBlow: Ability = {
    name: "Raging Blow",
    resourceCost: 2,
    image: RagingBlowImage,
    rarity: RARITIES.UNCOMMON,
    description: "Hit twice. <b>Infuriate.</b>",
    overrideBodyText: true,
    actions: [
        {
            damage: 8,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            secondaryAction: {
                effects: [infuriateEffect],
            },
        },
        {
            damage: 8,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
    ],
    upgrades: [
        {
            actions: [{ damage: 3 }, { damage: 3 }],
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
                    damage: 5,
                },
            ],
        },
    ],
};

export const risingRage: Ability = {
    name: "Rising Rage",
    resourceCost: "x",
    image: RisingRageImage,
    description: "Expend the rest of your Fury to deal {{ actions.0.damage }} {{{ _damage_ }}} X times.",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            area: 1,
            damage: 7,
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

export const soulBlade: Ability = {
    name: "Soul Blade",
    resourceCost: 1,
    image: BurningSoulBladeImage,
    overrideBodyText: true,
    description: "<b>Ward.</b> <br/> <b>Summon:</b> Attack. <b>Auto:</b> 50% chance to attack whenever you play a {{{ _offense_ }}} card.",
    rarity: RARITIES.UNCOMMON,
    actions: [],
    minion: {
        name: "Soul Blade",
        image: BurningSoulBladeMinionImage,
        maxHP: 2,
        uncontrollable: true,
        abilities: [
            {
                ...attack,
                actions: [
                    {
                        type: ACTION_TYPES.ATTACK,
                        target: TARGET_TYPES.HOSTILE,
                        damage: 2,
                        animationOptions: {
                            rotateToFaceTarget: true,
                        },
                    },
                ],
            },
        ],
        effects: [
            { ...ward },
            {
                name: "Soul Blade Effect",
                icon: BurningSoulBladeMinionImage,
                disableDisplayIcon: true,
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                onSummoned: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    induceCombatantAttack: true,
                },
                onFriendlyAbility: {
                    conditionOperator: "and",
                    disableTriggerFromProcs: true,
                    chance: 0.5,
                    conditions: [
                        {
                            calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                            sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                            isOffense: true,
                            comparator: "eq",
                        },
                        {
                            calculationTarget: CONDITION_TARGETS.ACTOR,
                            property: "isPlayer",
                            value: true,
                            comparator: "eq",
                        },
                    ],
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    induceCombatantAttack: true,
                },
            },
        ],
    },
    upgrades: [
        {
            minion: {
                maxHP: 1,
                abilities: [
                    {
                        actions: [
                            {
                                damage: 1,
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
    description: "Heal 1 {{{ _healing_ }}} each hit.",
    actions: [
        {
            damage: 6,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            secondaryAction: {
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
    description: "Deal damage equal to your {{{ _armor_ }}}. Your {{{ _armor_ }}} decays by half.",
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
        {
            type: ACTION_TYPES.NONE,
            target: TARGET_TYPES.SELF,
            decayArmor: true,
        },
    ],
    upgrades: [
        {
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
    description: "Double your {{{ _armor_ }}}.",
    rarity: RARITIES.RARE,
    overrideBodyText: true,
    disableConditionGlow: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
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
                        armor: 1,
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
    description:
        "Gain {{ actions.0.effects.0.lifeOnHit }} Life on Hit. <br/> <br/> <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
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
                    duration: 3,
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
    description: "Cards in your hand are Upgraded. <br/> <br/> <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.STOMP,
            applyAbilityEffects: {
                pile: CARD_PILE_TYPES.HAND,
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
                            pile: CARD_PILE_TYPES.HAND,
                            abilityEffects: [battlelordAbilityEffect],
                        },
                    },
                    onAddCardToHand: {
                        applyAbilityEffects: {
                            pile: CARD_PILE_TYPES.HAND,
                            abilityEffects: [battlelordAbilityEffect],
                        },
                    },
                    onDrawCard: {
                        applyAbilityEffects: {
                            pile: CARD_PILE_TYPES.HAND,
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
    description: "Deal damage equal to <b>{{ actions.0.multiplier.value }}</b> of your HP.",
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
                damage: 4,
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
                        damage: 3,
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
            damage: 28,
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

export const forgehammer: Ability = {
    name: "Forge Hammer",
    image: SquareHammerImage,
    description: "Upgrade a random card in hand for the rest of battle.",
    rarity: RARITIES.UNCOMMON,
    resourceCost: 1,
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: SquareHammerImage,
            applyAbilityEffects: {
                pile: CARD_PILE_TYPES.HAND,
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
        "<b>Ward.</b> Every turn, <b>Radiate</b> ATT Down to foes / {{ nestedAbility.actions.0.secondaryAction.healing }} {{{ _healing_ }}} to allies within 2 spaces.",
    rarity: RARITIES.RARE,
    resourceCost: 2,
    minion: {
        name: "Guardian Statue",
        image: PinkBeanStatueImage,
        maxHP: 6,
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
            ward,
            {
                name: "Golden",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.NONE,
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
                                    effects: [{ ...attackDown, duration: 1 }],
                                },
                                secondaryAction: {
                                    excludePrimaryTarget: true,
                                    area: 2,
                                    healing: 1,
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
                                    effects: [{ ...attackDown, duration: 1 }],
                                },
                                secondaryAction: {
                                    excludePrimaryTarget: true,
                                    area: 2,
                                    healing: 1,
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
                maxHP: 1,
                abilities: [
                    {
                        actions: [
                            {
                                damage: 1,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};

export const beatdown: Ability = {
    name: "Beatdown",
    image: ChanceAttackImage,
    description:
        "When you apply a debuff, attack that target for <b>{{ nestedAbility.actions.0.damage }}</b> {{{ _damage_ }}}. <br/> <br/> <b>{{ actions.0.effects.0.duration }}</b>{{{ _duration_ }}}",
    overrideBodyText: true,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Beatdown",
                    icon: ChanceAttackImage,
                    description: "When you apply a debuff, attack that target.",
                    duration: 4,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    onApplyEffect: {
                        targetType: TRIGGER_TARGET_TYPES.TARGET,
                        ability: {
                            name: "Beatdown",
                            image: ChanceAttackImage,
                            actions: [
                                {
                                    type: ACTION_TYPES.ATTACK,
                                    target: TARGET_TYPES.HOSTILE,
                                    damage: 2,
                                    playbackTime: 500,
                                },
                            ],
                        },
                        conditions: [
                            {
                                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                                sourceType: TRIGGER_SOURCE_TYPES.EFFECT,
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
                            onApplyEffect: {
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

export const bide: Ability = {
    name: "Bide",
    resourceCost: 1,
    overrideBodyText: true,
    rarity: RARITIES.UNCOMMON,
    description: "Place up to {{ selectCards.maxAmount }} cards from your hand on top of your deck. <b>Infuriate.</b>",
    image: WarriorThroneImage,
    selectCards: {
        type: SELECT_CARD_TYPES.HAND_TO_TOP_DECK,
        maxAmount: 2,
    },
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            icon: WarriorThroneImage,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            effects: [infuriateEffect],
        },
    ],
    upgrades: [
        {
            selectCards: {
                maxAmount: 1,
            },
        },
    ],
};

export const honedBlock: Ability = {
    name: "Honed Block",
    image: SilverAquilaImage,
    resourceCost: 1,
    description: "<b>Play:</b> Upgrade for the rest of battle. (Once.)",
    rarity: RARITIES.COMMON,
    onUse: {
        abilityEffects: [
            {
                name: "Hone",
                maxApplications: 1,
                removeOnDiscard: false,
                upgradedByLevels: 1,
            },
        ],
    },
    actions: [
        {
            armor: 7,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
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

export const honedStrike: Ability = {
    name: "Honed Strike",
    image: BurningSoulBladeImage,
    resourceCost: 1,
    description: "<b>Play:</b> Upgrade for the rest of battle. (Once.)",
    rarity: RARITIES.COMMON,
    onUse: {
        abilityEffects: [
            {
                name: "Hone",
                maxApplications: 1,
                removeOnDiscard: false,
                upgradedByLevels: 1,
            },
        ],
    },
    actions: [
        {
            damage: 8,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
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

export const moratorium: Ability = {
    name: "Moratorium",
    image: DarkImpaleImage,
    resourceCost: 1,
    description: "If lethal, the target lives with 1 HP.",
    rarity: RARITIES.COMMON,
    actions: [
        {
            damage: 11,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            targetMinHP: 1,
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 4,
                },
            ],
        },
    ],
};

export const bluntForce: Ability = {
    name: "Blunt Force",
    image: BlastImage,
    resourceCost: 3,
    rarity: RARITIES.UNCOMMON,
    description: "Deal damage equal to <b>{{ actions.0.multiplier.value }}</b> of your HP.",
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 1,
            multiplier: {
                type: MULTIPLIER_TYPES.HP,
                value: 0.5,
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

export const retribute: Ability = {
    name: "Retribute",
    image: SpearSweepImage,
    description: "+{{actions.0.bonus.damage}} {{{ _damage_ }}} if you took unblocked damage last turn.",
    overrideBodyText: true,
    rarity: RARITIES.COMMON,
    resourceCost: 2,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 9,
            area: 2,
            bonus: {
                damage: 5,
                conditions: [
                    {
                        calculationTarget: CONDITION_TARGETS.ACTOR,
                        hasEffect: directDamageTaken.name,
                        comparator: "eq",
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
                    bonus: {
                        damage: 2,
                    },
                },
            ],
        },
    ],
};

export const bladeworks: Ability = {
    name: "Bladeworks",
    image: BladeworksImage,
    rarity: RARITIES.RARE,
    resourceCost: 3,
    depletedOnUse: true,
    description: "Summon 3 Soul Blades. For each that doesn't fit, a random summon is Tributed.",
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            summon: [
                { minion: [cloneDeep(soulBlade.minion)], tributePossible: true },
                { minion: [cloneDeep(soulBlade.minion)], tributePossible: true },
                { minion: [cloneDeep(soulBlade.minion)], tributePossible: true },
            ],
        },
    ],
    upgrades: [
        {
            resourceCost: -1,
        },
    ],
};

export const shieldCharge: Ability = {
    name: "Shield Charge",
    image: LightningChargeImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    description: "When you gain {{{ _armor_ }}}, the next use is free and doesn't go to discard.",
    onReceiveArmor: {
        abilityEffects: [
            {
                resourceCost: -1,
                reusable: true,
                highlightCard: true,
            },
        ],
    },
    actions: [
        {
            area: 1,
            damage: 7,
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
            ],
        },
    ],
};

export const ballista: Ability = {
    name: "Ballista",
    resourceCost: 1,
    image: BallistaImage,
    description: "<b>Auto:</b> Apply <b>{{ minion.abilities.0.actions.0.effects.0.stacks }}</b>{{{ _bleed_ }}} every turn.",
    overrideBodyText: true,
    rarity: RARITIES.UNCOMMON,
    minion: {
        name: "Ballista",
        image: BallistaImage,
        uncontrollable: true,
        maxHP: 6,
        abilities: [
            {
                name: "Shoot",
                image: AvengersArrowImage,
                actions: [
                    {
                        type: ACTION_TYPES.RANGE_ATTACK,
                        target: TARGET_TYPES.HOSTILE,
                        animation: ANIMATION_TYPES.ONE_WAY,
                        icon: AvengersArrowImage,
                        damage: 1,
                        effects: [{ ...bleed, stacks: 1 }],
                        animationOptions: {
                            rotateToFaceTarget: true,
                            rotate: -45,
                        },
                    },
                ],
            },
        ],
        effects: [
            {
                name: "",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                onSummoned: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    induceCombatantAttack: true,
                },
                onTurnStart: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    induceCombatantAttack: true,
                },
            },
        ],
    },
    actions: [],
    upgrades: [
        {
            minion: {
                maxHP: 2,
                abilities: [
                    {
                        actions: [
                            {
                                damage: 1,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};

const pummelAction = {
    damage: 7,
    targetArea: 5,
    type: ACTION_TYPES.ATTACK,
    target: TARGET_TYPES.RANDOM_HOSTILE,
    secondaryAction: {
        damage: 2,
    },
    drawCards: {
        amount: 1,
    },
};

export const pummel: Ability = {
    name: "Pummel",
    rarity: RARITIES.RARE,
    image: RedBoxingGloveImage,
    resourceCost: 1,
    overrideBodyText: true,
    description:
        "Hit a random enemy, x3. Self-inflict <b>{{ actions.0.secondaryAction.damage }}</b> {{{ _damage_ }}} and draw a card each time.",
    actions: [{ ...pummelAction }, { ...pummelAction }, { ...pummelAction }],
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

export const outrage: Ability = {
    name: "Outrage",
    resourceCost: 2,
    description: "Hits x3. Cards in your hand cost <b>+1</b> or <b>-1 Fury</b>, randomly chosen.",
    image: MushmomAngryImage,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            damage: 5,
        },
        {
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            damage: 5,
        },
        {
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            damage: 5,
            applyAbilityEffects: {
                pile: CARD_PILE_TYPES.HAND,
                abilityEffects: [{ resourceCost: 1 }, { resourceCost: -1 }],
                mode: "random-pick",
            },
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

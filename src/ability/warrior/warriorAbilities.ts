import {
    AdvancedWeaponMasteryImage,
    BladestormImage,
    BlastExtraStrikeImage,
    BlockImage,
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

export const bash2: Ability = {
    name: "Bash",
    level: 2,
    resourceCost: 0,
    image: BrickImage,
    actions: [
        {
            damage: 5,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
};

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
    upgrades: [bash2],
};

export const warLeap2: Ability = {
    name: "War Leap",
    level: 2,
    resourceCost: 0,
    image: WarLeapImage,
    actions: [
        {
            damage: 3,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            effects: [bleed],
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
    upgrades: [warLeap2],
};

export const slashBlast2: Ability = {
    name: "Slash Blast",
    level: 2,
    resourceCost: 1,
    image: SlashBlastImage,
    actions: [
        {
            damage: 7,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            area: 1,
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
    upgrades: [slashBlast2],
};

export const slam2: Ability = {
    name: "Slam",
    level: 2,
    resourceCost: 1,
    image: SpikedMaceImage,
    actions: [
        {
            damage: 10,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
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
    upgrades: [slam2],
};

export const anger2: Ability = {
    name: "Anger",
    level: 2,
    resourceCost: 0,
    image: EnrageImage,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            damage: 3,
            resources: 3,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
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
            damage: 3,
            resources: 2,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
    upgrades: [anger2],
};

export const shieldStrike2: Ability = {
    name: "Shield Strike",
    level: 2,
    resourceCost: 2,
    rarity: RARITIES.COMMON,
    image: ShieldRedImage,
    actions: [
        {
            damage: 10,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
        {
            armor: 10,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
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
    upgrades: [shieldStrike2],
};

export const block2: Ability = {
    name: "Block",
    level: 2,
    resourceCost: 1,
    image: BlockImage,
    actions: [
        {
            armor: 9,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
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
    upgrades: [block2],
};

const shout2: Ability = {
    name: "Shout",
    level: 2,
    resourceCost: 0,
    image: ShoutImage,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            resources: 2,
            drawCards: {
                amount: 2,
            },
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
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
    upgrades: [shout2],
};

export const spikes2: Ability = {
    name: "Spikes",
    level: 2,
    resourceCost: 1,
    image: SpikeBallImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            target: TARGET_TYPES.FRIENDLY,
            effects: [thorns],
            type: ACTION_TYPES.EFFECT,
            armor: 8,
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
    upgrades: [spikes2],
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

export const warBanner2: Ability = {
    name: "War Banner",
    level: 2,
    resourceCost: 2,
    description: "Every turn, grants 3 armor and +1 attack to allies within 2 spaces.",
    rarity: RARITIES.UNCOMMON,
    minion: {
        name: "War Banner",
        image: FlagImage,
        maxHP: 5,
        abilities: [],
        effects: [
            {
                ...stealth,
                duration: 4,
            },
            {
                name: "War Banner - Drumbeat of War",
                description: "Granting 3 armor and +1 attack to allies within 2 slots every turn.",
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
                                armor: 3,
                                area: 2,
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
                        actions: [
                            {
                                ...drumOfWar,
                                armor: 3,
                                area: 2,
                            },
                        ],
                    },
                },
            },
        ],
    },
    actions: [],
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
    upgrades: [warBanner2],
};

export const yell2: Ability = {
    name: "Yell",
    level: 2,
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
                    attackPower: -3,
                    duration: 2,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.DEBUFF,
                    icon: WarMushImage,
                },
            ],
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
                    attackPower: -2,
                    duration: 2,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.DEBUFF,
                    icon: WarMushImage,
                },
            ],
        },
    ],
    upgrades: [yell2],
};

export const bunchOBricks2: Ability = {
    name: "Bunch o' Bricks",
    level: 2,
    resourceCost: 1,
    image: BricksImage,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            addCards: [bash, bash, bash, bash].map((card) => ({ ...card, removeAfterTurn: true })),
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
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
        },
    ],
    upgrades: [bunchOBricks2],
};

export const hammerang2: Ability = {
    name: "Hammerang",
    level: 2,
    resourceCost: 1,
    reusable: true, // Hmm... beware of any ability that reduces resource cost
    image: HammerImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            damage: 9,
            secondaryDamage: 7,
            targetArea: 2,
            numTargets: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            ricochet: true,
            animation: ANIMATION_TYPES.YOYO,
            icon: HammerImage,
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
    upgrades: [hammerang2],
};

export const ironWill2: Ability = {
    name: "Iron Will",
    level: 2,
    resourceCost: 1,
    image: IronWillImage,
    depletedOnUse: true,
    preemptive: true,
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
    upgrades: [ironWill2],
};

export const hyperBody2: Ability = {
    name: "Hyper Body",
    level: 2,
    resourceCost: 0,
    image: HyperBodyImage,
    depletedOnUse: true,
    preemptive: true,
    rarity: RARITIES.UNCOMMON,
    description: "+1 healing from healing sources",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Hyper Body",
                    description: "+1 healing from healing sources",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    healingReceived: 1,
                },
            ],
        },
    ],
};

export const hyperBody: Ability = {
    name: "Hyper Body",
    resourceCost: 1,
    image: HyperBodyImage,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    description: "+1 healing from healing sources",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Hyper Body",
                    description: "+1 healing from healing sources",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    healingReceived: 1,
                },
            ],
        },
    ],
    upgrades: [hyperBody2],
};

export const sweepingReach2: Ability = {
    name: "Sweeping Reach",
    level: 2,
    resourceCost: 1,
    image: WeaponBoosterImage,
    description: "+1 area for your next 3 offensive abilities",
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
                    stacks: 3,
                    maxApplications: 1,
                    onOffensiveAbility: {
                        decrementStacks: 1,
                    },
                },
            ],
        },
    ],
};

export const sweepingReach: Ability = {
    name: "Sweeping Reach",
    resourceCost: 1,
    image: WeaponBoosterImage,
    description: "+1 area for your next 2 offensive abilities",
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
    upgrades: [sweepingReach2],
};

export const sharpen2: Ability = {
    name: "Sharpen",
    level: 2,
    resourceCost: 1,
    image: WeaponMasteryImage,
    preemptive: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Sharpen",
                    icon: WeaponMasteryImage,
                    disableDisplayIcon: true,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 1,
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
                },
            ],
        },
    ],
    upgrades: [sharpen2],
};

export const rush2: Ability = {
    name: "Rush",
    level: 2,
    resourceCost: 1,
    image: RushImage,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            damage: 10,
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
    upgrades: [rush2],
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
    upgrades: [berserk2],
};

export const closeCombat2: Ability = {
    name: "Close Combat",
    level: 2,
    resourceCost: 1,
    preemptive: true,
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
            damage: 2,
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
    upgrades: [closeCombat2],
};

export const recovery2: Ability = {
    name: "Recovery",
    level: 2,
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
    upgrades: [recovery2],
};

export const magicCrash2: Ability = {
    name: "Magic Crash",
    level: 2,
    resourceCost: 1,
    image: MagicCrashImage,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            damage: 9,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            effects: [{ ...silence }],
        },
    ],
};

export const magicCrash: Ability = {
    name: "Magic Crash",
    resourceCost: 2,
    image: MagicCrashImage,
    depletedOnUse: true,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 1,
            effects: [{ ...silence }],
        },
    ],
};

export const dash2: Ability = {
    name: "Dash",
    level: 2,
    resourceCost: 1,
    image: WarriorMasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 3,
            },
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
    upgrades: [dash2],
};

export const ironBody2: Ability = {
    name: "Iron Body",
    level: 2,
    resourceCost: 1,
    image: IronBodyImage,
    rarity: RARITIES.COMMON,
    actions: [
        {
            armor: 10,
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
    upgrades: [ironBody2],
};

export const rendingStrike2: Ability = {
    name: "Rend",
    level: 2,
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
                {
                    ...bleed,
                    duration: 3,
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
    upgrades: [rendingStrike2],
};

export const whirlwind2: Ability = {
    name: "Whirlwind",
    level: 2,
    image: PanicImage,
    resourceCost: 1,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 2,
            damage: 5,
            effects: [
                {
                    ...bleed,
                    duration: 3,
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
    upgrades: [whirlwind2],
};

export const rupture2: Ability = {
    name: "Rupture",
    resourceCost: 0,
    depletedOnUse: true,
    image: RedFistOfFuryImage,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 10,
            effects: [bleed, stun],
        },
    ],
};

export const rupture: Ability = {
    name: "Rupture",
    resourceCost: 0,
    depletedOnUse: true,
    image: RedFistOfFuryImage,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 7,
            effects: [bleed, stun],
        },
    ],
    upgrades: [rupture2],
};

export const bladestorm2: Ability = {
    name: "Bladestorm",
    level: 2,
    resourceCost: 0,
    image: BladestormImage,
    depletedOnUse: true,
    rarity: RARITIES.RARE,
    actions: [
        {
            addCards: [whirlwind2, whirlwind2, whirlwind2].map((card) => ({ ...card, resourceCost: 1, removeAfterTurn: true })),
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
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
            addCards: [whirlwind, whirlwind, whirlwind].map((card) => ({ ...card, resourceCost: 1, removeAfterTurn: true })),
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
        },
    ],
    upgrades: [bladestorm2],
};

export const combatOrders2: Ability = {
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
                    attackPower: 2,
                    duration: 0,
                    icon: CombatOrdersImage,
                },
            ],
            induceCombatantAttack: true,
            playbackTime: 1200,
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
    upgrades: [combatOrders2],
};

export const dustDevils2: Ability = {
    name: "Dust Devils",
    level: 2,
    resourceCost: 1,
    image: TornadoIcon,
    description: "When you attack, summon tornadoes that deal 1-2 damage and hit up to 3 enemies",
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
                    description: "When you attack, summon tornadoes that deal 1-2 damage and hit up to 3 enemies",
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
                                    secondaryDamage: 2,
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
    upgrades: [dustDevils2],
};

export const doubleTime2: Ability = {
    name: "Double Time",
    level: 2,
    image: DoubleTimeImage,
    resourceCost: 0,
    description: "Create a copy of a card in your hand. It costs 2 less and is Ephemeral",
    depletedOnUse: true,
    rarity: RARITIES.RARE,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.COPY_FROM_HAND,
                effects: {
                    resourceCost: -2,
                    removeAfterTurn: true,
                },
            },
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
    upgrades: [doubleTime2],
};

export const arsenal2: Ability = {
    name: "Arsenal",
    level: 2,
    resourceCost: 1,
    image: AdvancedWeaponMasteryImage,
    description: "Discover an offensive ability available to your class. It costs 2 less and is Ephemeral",
    rarity: RARITIES.RARE,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            selectCards: {
                type: SELECT_CARD_TYPES.DISCOVER_FROM_CLASS,
                filters: [ACTION_TYPES.ATTACK],
                effects: {
                    resourceCost: -2,
                    removeAfterTurn: true,
                },
            },
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
    upgrades: [arsenal2],
};

export const sledge2: Ability = {
    name: "Sledge",
    resourceCost: 2,
    level: 2,
    image: GiganticSledgeImage,
    rarity: RARITIES.UNCOMMON,
    description: "Deplete another card in your hand to use this ability",
    selectCards: {
        type: SELECT_CARD_TYPES.DEPLETE_FROM_HAND,
    },
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 20,
            destroyArmor: 1,
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
    upgrades: [sledge2],
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

const guillotine2: Ability = {
    name: "Guillotine",
    level: 2,
    resourceCost: 1,
    image: InstinctualComboImage,
    description: "On kill: Refund cost and return to hand",
    rarity: RARITIES.RARE,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 16,
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
            damage: 13,
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
    upgrades: [guillotine2],
};

const counterattack2: Ability = {
    name: "Counter",
    image: NamelessSwordImage,
    resourceCost: 1,
    rarity: RARITIES.RARE,
    description: "Next turn, when you are attacked, counter for 7 damage and inflict Bleed.",
    overrideBodyText: true,
    level: 2,
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
                                    damage: 7,
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
};

export const counterattack: Ability = {
    ...counterattack2,
    level: 1,
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
    upgrades: [counterattack2],
};

export const poundOfNails2: Ability = {
    name: "Pound Of Nails",
    resourceCost: 1,
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
    upgrades: [poundOfNails2],
};

const overpower2: Ability = {
    name: "Overpower",
    resourceCost: 1,
    rarity: RARITIES.COMMON,
    image: RageImage,
    level: 2,
    description: "+4 damage to targets with less HP than you",
    actions: [
        {
            damage: 8,
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
            damage: 6,
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
    upgrades: [overpower2],
};

const braveSlash2: Ability = {
    name: "Brave Slash",
    resourceCost: 1,
    depletedOnUse: true,
    image: IntrepidSlashImage,
    rarity: RARITIES.UNCOMMON,
    description: "Randomly hits the target or its neighbors, x3",
    level: 2,
    actions: [
        {
            damage: 7,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
            targetArea: 1,
        },
        {
            damage: 7,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
            targetArea: 1,
        },
        {
            damage: 7,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
            targetArea: 1,
        },
    ],
};

export const braveSlash: Ability = {
    ...braveSlash2,
    level: 1,
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
};

const chanceAttack2: Ability = {
    name: "Chance Attack",
    resourceCost: 1,
    image: ChanceAttackImage,
    depletedOnUse: true,
    preemptive: true,
    level: 2,
    description: "against debuffed enemies",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Chance Attack",
                    icon: ChanceAttackImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 2,
                    conditions: [
                        {
                            calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                            hasEffectClass: EFFECT_CLASSES.DEBUFF,
                        },
                    ],
                },
            ],
        },
    ],
};

export const chanceAttack: Ability = {
    name: "Chance Attack",
    resourceCost: 1,
    image: ChanceAttackImage,
    depletedOnUse: true,
    description: "against debuffed enemies",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Chance Attack",
                    icon: ChanceAttackImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 2,
                    conditions: [
                        {
                            calculationTarget: TRIGGER_TARGET_TYPES.TARGET,
                            hasEffectClass: EFFECT_CLASSES.DEBUFF,
                        },
                    ],
                },
            ],
        },
    ],
    upgrades: [chanceAttack2],
};

const brandish2: Ability = {
    name: "Brandish",
    resourceCost: 1,
    image: BrandishImage,
    description: "Hits twice",
    level: 2,
    actions: [
        {
            damage: 7,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
        },
        {
            damage: 7,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
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
    upgrades: [brandish2],
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

const ragingBlowAction: Action = {
    damage: 3,
    type: ACTION_TYPES.ATTACK,
    target: TARGET_TYPES.HOSTILE,
};

const ragingBlow2: Ability = {
    name: "Raging Blow",
    resourceCost: 1,
    image: RagingBlowImage,
    rarity: RARITIES.UNCOMMON,
    description: "Hits twice",
    level: 2,
    actions: [
        { ...ragingBlowAction, damage: 5 },
        { ...ragingBlowAction, damage: 5 },
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
};

export const ragingBlow: Ability = {
    ...ragingBlow2,
    level: 1,
    actions: [
        ragingBlowAction,
        ragingBlowAction,
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
    upgrades: [ragingBlow2],
};

export const worldReaver: Ability = {
    name: "World Reaver",
    resourceCost: 2,
    depletedOnUse: true,
    image: WorldReaverImage,
    description: "Deals 3 damage for every attack you made this turn",
    rarity: RARITIES.RARE,
    actions: [
        {
            area: 1,
            damage: 3,
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            multiplier: {
                type: MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    ...immunity,
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
};

export const burningSoulBlade: Ability = {
    name: "Burning Soul Blade",
    resourceCost: 1,
    image: BurningSoulBladeImage,
    rarity: RARITIES.UNCOMMON,
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
                        damage: 2,
                    },
                ],
            },
        ],
        effects: [
            {
                name: "Burning Soul Blade",
                icon: BurningSoulBladeMinionImage,
                type: EFFECT_TYPES.IMMUNITY,
                class: EFFECT_CLASSES.BUFF,
                attackAreaIncrease: 1,
                onAttack: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    effects: [
                        {
                            name: "Burning Soul Blade",
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.BUFF,
                            attackPower: 1,
                        },
                    ],
                },
            },
        ],
    },
};

const divineCharge2: Ability = {
    name: "Fierce Charge",
    level: 2,
    resourceCost: 1,
    image: DivineChargeImage,
    description: "Heal 1 for every enemy hit.",
    actions: [
        {
            damage: 7,
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
    upgrades: [divineCharge2],
};

const shieldMastery2: Ability = {
    name: "Shield Mastery",
    resourceCost: 1,
    image: ShieldMasteryImage,
    rarity: RARITIES.UNCOMMON,
    depletedOnUse: true,
    level: 2,
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
                    duration: 1,
                },
            ],
            addCards: [block2, block2, block2].map((card) => ({ ...card, removeAfterTurn: true })),
        },
    ],
};

export const shieldMastery: Ability = {
    name: "Shield Mastery",
    resourceCost: 1,
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
                    duration: 1,
                },
            ],
            addCards: [block, block, block].map((card) => ({ ...card, removeAfterTurn: true })),
        },
    ],
    upgrades: [shieldMastery2],
};

export const judgment2: Ability = {
    name: "Judgment",
    resourceCost: 2,
    level: 2,
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
};

export const judgment: Ability = {
    name: "Judgment",
    resourceCost: 3,
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
    upgrades: [judgment2],
};

const parashockGuard2: Ability = {
    name: "Parashock Guard",
    resourceCost: 1,
    image: ParashockGuardImage,
    description: "Gain armor equal to your current armor",
    level: 2,
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            armor: 3,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            bonus: {
                armor: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.ARMOR,
                    calculationTarget: CONDITION_TARGETS.ACTOR,
                },
            },
        },
    ],
};

export const parashockGuard: Ability = {
    name: "Parashock Guard",
    resourceCost: 1,
    image: ParashockGuardImage,
    description: "Gain armor equal to your current armor",
    rarity: RARITIES.UNCOMMON,
    actions: [
        {
            armor: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            multiplier: {
                type: MULTIPLIER_TYPES.ARMOR,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
        },
    ],
    upgrades: [parashockGuard2],
};

export const bloodthirst: Ability = {
    name: "Bloodthirst",
    resourceCost: 1,
    image: DarkThirstImage,
    rarity: RARITIES.RARE,
    description: "Gain +1 life on hit, +3 life on kill, and +1 ATT, but self-inflict Bleed. 3 turns.",
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
    description: "Gain +1 life on hit and +1 ATT. Counter: gain +1 ATT. Lasts 3 turns.",
    overrideBodyText: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Lord of Darkness",
                    icon: LordOfDarknessImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 1,
                    duration: 3,
                    lifeOnHit: 1,
                    onReceiveDamage: {
                        effects: [{ ...attackPower, duration: 3 }],
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    },
                    maxApplications: 1,
                },
            ],
        },
    ],
};

export const gungnir: Ability = {
    name: "Gungnir",
    resourceCost: 5,
    depletedOnUse: true,
    image: GungnirImage,
    rarity: RARITIES.RARE,
    description: "(Damage equal to 50% of your max HP)",
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 2,
            damage: 1,
            multiplier: {
                type: MULTIPLIER_TYPES.MAX_HP,
                value: 0.5,
                calculationTarget: CONDITION_TARGETS.ACTOR,
            },
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
};

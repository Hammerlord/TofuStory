import {
    AdvancedWeaponMasteryImage,
    BladestormImage,
    BlockImage,
    BrickImage,
    BricksImage,
    CloseCombatImage,
    DoubleTimeImage,
    EnrageImage,
    BlastExtraStrikeImage,
    FlagImage,
    GiganticSledgeImage,
    HammerImage,
    HyperBodyImage,
    IronBodyImage,
    IronWillImage,
    SpikedMaceImage,
    MagicCrashImage,
    PanicImage,
    PowerStanceImage,
    RageImage,
    RedFistOfFuryImage,
    RushImage,
    SelfRecoveryImage,
    ShieldRedImage,
    ShoutImage,
    SlashBlastImage,
    SpikeBallImage,
    WarLeapImage,
    WarMushImage,
    WarriorMasteryImage,
    WeaponBoosterImage,
    WeaponMasteryImage,
    MetalAxeImage,
    CombatOrdersImage,
} from "../../images";
import { FireworksIcon, TornadoIcon } from "../../images/icons";
import { silence, stealth, stun, thorns, wound } from "../Effects";
import {
    Ability,
    Action,
    ACTION_TYPES,
    ANIMATION_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../types";
import { MULTIPLIER_TYPES } from "./../types";

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
            effects: [stun],
            bonus: {
                damage: 6,
                conditions: [
                    {
                        healthPercentage: 1,
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        comparator: "eq",
                    },
                ],
            },
        },
    ],
};

export const warLeap: Ability = {
    name: "War Leap",
    resourceCost: 0,
    image: WarLeapImage,
    actions: [
        {
            damage: 1,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            effects: [stun],
            bonus: {
                damage: 4,
                conditions: [
                    {
                        healthPercentage: 1,
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        comparator: "eq",
                    },
                ],
            },
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
    image: RageImage,
    actions: [
        {
            damage: 1,
            resources: 2,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            drawCards: {
                amount: 1,
            },
        },
    ],
};

export const anger: Ability = {
    name: "Anger",
    resourceCost: 0,
    image: RageImage,
    actions: [
        {
            damage: 1,
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
    resourceCost: 2,
    image: ShieldRedImage,
    actions: [
        {
            damage: 7,
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
    actions: [
        {
            effects: [
                {
                    name: "Shout",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 0,
                    lifeOnHit: 1,
                    icon: ShoutImage,
                },
            ],
            resources: 1,
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
    actions: [
        {
            effects: [
                {
                    name: "Shout",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 0,
                    lifeOnHit: 1,
                    icon: ShoutImage,
                },
            ],
            resources: 1,
            drawCards: {
                amount: 1,
            },
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.SHOUT,
        },
    ],
    upgrades: [shout2],
};

export const spikedArmor2: Ability = {
    name: "Spiked Armor",
    level: 2,
    resourceCost: 1,
    image: SpikeBallImage,
    actions: [
        {
            armor: 8,
            target: TARGET_TYPES.FRIENDLY,
            effects: [{ ...thorns, duration: 4 }],
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const spikedArmor: Ability = {
    name: "Spiked Armor",
    resourceCost: 1,
    image: SpikeBallImage,
    actions: [
        {
            armor: 6,
            target: TARGET_TYPES.FRIENDLY,
            effects: [{ ...thorns, duration: 3 }],
            type: ACTION_TYPES.EFFECT,
        },
    ],
    upgrades: [spikedArmor2],
};

const drumOfWar: Action = {
    type: ACTION_TYPES.EFFECT,
    target: TARGET_TYPES.SELF,
    excludePrimaryTarget: true,
    armor: 2,
    area: 1,
    effects: [
        {
            name: "Drums of War",
            description: "Attack power increased.",
            icon: WeaponMasteryImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            attackPower: 1,
            duration: 1,
        },
    ],
};

export const warBanner2: Ability = {
    name: "War Banner",
    level: 2,
    resourceCost: 2,
    description: "When summoned or when your turn starts, grants 3 armor and +1 attack to allies within 2 spaces.",
    minion: {
        name: "War Banner",
        image: FlagImage,
        maxHP: 5,
        damage: 0,
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
    description: "When summoned or when your turn starts, grants 2 armor and +1 attack to nearby allies.",
    minion: {
        name: "War Banner",
        image: FlagImage,
        maxHP: 5,
        damage: 0,
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
                        actions: [drumOfWar],
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
    actions: [
        {
            area: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.SHOUT,
            effects: [
                {
                    name: "Admonished",
                    attackPower: -3,
                    attackDamageReceived: 1,
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
    actions: [
        {
            area: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.SHOUT,
            effects: [
                {
                    name: "Admonished",
                    attackPower: -2,
                    attackDamageReceived: 1,
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
    actions: [
        {
            damage: 8,
            secondaryDamage: 6,
            targetArea: 1,
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
    actions: [
        {
            damage: 6,
            secondaryDamage: 4,
            targetArea: 1,
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
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            effects: [
                {
                    name: "Iron Will",
                    icon: IronWillImage,
                    description: "Receiving +3 armor from armor sources",
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    armorReceived: 3,
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
    resourceCost: 1,
    image: HyperBodyImage,
    depletedOnUse: true,
    preemptive: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Hyper Body",
                    icon: HyperBodyImage,
                    description: "Gaining +1 resource every 2 turns and +1 healing received",
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    resourcesPerTurn: 1,
                    healingReceived: 1,
                    turnsTriggerFrequency: 2,
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
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Hyper Body",
                    icon: HyperBodyImage,
                    description: "Gaining +1 resource every 2 turns",
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    resourcesPerTurn: 1,
                    turnsTriggerFrequency: 2,
                },
            ],
        },
    ],
    upgrades: [hyperBody2],
};

export const sweepingReach2: Ability = {
    name: "Sweeping Reach",
    level: 2,
    resourceCost: 0,
    image: WeaponBoosterImage,
    description: "Increases the area of your next offensive ability by 1",
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
                    description: "Increases the area of your next offensive ability by 1",
                    attackAreaIncrease: 1,
                    onAttack: {
                        removeEffect: true,
                    },
                },
            ],
        },
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            addCards: [
                {
                    name: "Sweeping Reach",
                    image: WeaponBoosterImage,
                    removeAfterTurn: true,
                    resourceCost: 0,
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
                                    description: "Increases the area of your next offensive ability by 1",
                                    attackAreaIncrease: 1,
                                    onAttack: {
                                        removeEffect: true,
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

export const sweepingReach: Ability = {
    name: "Sweeping Reach",
    resourceCost: 0,
    image: WeaponBoosterImage,
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
                    description: "Increases the area of your next offensive ability by 1",
                    attackAreaIncrease: 1,
                    onAttack: {
                        removeEffect: true,
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
    resourceCost: 0,
    image: WeaponMasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Sharpen",
                    icon: WeaponMasteryImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 4,
                    duration: 0,
                    onAttack: {
                        removeEffect: true,
                    },
                },
            ],
        },
    ],
};

export const sharpen: Ability = {
    name: "Sharpen",
    resourceCost: 0,
    image: WeaponMasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Sharpen",
                    icon: WeaponMasteryImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 3,
                    duration: 0,
                    onAttack: {
                        removeEffect: true,
                    },
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
                amount: 2,
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
    resourceCost: 1,
    image: PowerStanceImage,
    depletedOnUse: true,
    description: "Reduces the cost of cards in your current hand by 3 until they are used or discarded",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 2,
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
    resourceCost: 1,
    image: PowerStanceImage,
    depletedOnUse: true,
    description: "Reduces the cost of cards in your current hand by 3 until they are used or discarded",
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
    upgrades: [berserk2],
};

export const closeCombat2: Ability = {
    name: "Close Combat",
    level: 2,
    resourceCost: 1,
    preemptive: true,
    image: CloseCombatImage,
    description: "Pulls enemies toward the selected target",
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
            healing: 3,
            effects: [
                {
                    name: "Recovery",
                    icon: SelfRecoveryImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    canBeSilenced: true,
                    duration: 3,
                    onTurnStart: {
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
            healing: 2,
            effects: [
                {
                    name: "Recovery",
                    icon: SelfRecoveryImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    canBeSilenced: true,
                    duration: 3,
                    onTurnStart: {
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
    actions: [
        {
            damage: 3,
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
    actions: [
        {
            damage: 1,
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
    resourceCost: 0,
    image: WarriorMasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 2,
            },
            resources: 1,
            effects: [
                {
                    name: "Dash",
                    icon: WarriorMasteryImage,
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    duration: 2,
                    drawCardsPerTurn: 1,
                },
            ],
        },
    ],
};

export const dash: Ability = {
    name: "Dash",
    resourceCost: 0,
    image: WarriorMasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 2,
            },
            effects: [
                {
                    name: "Dash",
                    icon: WarriorMasteryImage,
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    duration: 1,
                    drawCardsPerTurn: 1,
                },
            ],
        },
    ],
    upgrades: [dash2],
};

export const ironBody2: Ability = {
    name: "Iron Body",
    level: 2,
    resourceCost: 1,
    image: IronBodyImage,
    actions: [
        {
            armor: 9,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Iron Body",
                    icon: IronBodyImage,
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    preventArmorDecay: true,
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
    actions: [
        {
            armor: 7,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Iron Body",
                    icon: IronBodyImage,
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    preventArmorDecay: true,
                    duration: 1,
                },
            ],
        },
    ],
    upgrades: [ironBody2],
};

export const rendingStrike2: Ability = {
    name: "Rending Strike",
    level: 2,
    resourceCost: 1,
    image: BlastExtraStrikeImage,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 5,
            effects: [
                {
                    ...wound,
                    duration: 3,
                },
                {
                    ...wound,
                    duration: 3,
                },
                {
                    ...wound,
                    duration: 3,
                },
            ],
        },
    ],
};

export const rendingStrike: Ability = {
    name: "Rending Strike",
    resourceCost: 1,
    image: BlastExtraStrikeImage,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 3,
            effects: [
                {
                    ...wound,
                    duration: 3,
                },
                {
                    ...wound,
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
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 2,
            damage: 5,
            effects: [
                {
                    ...wound,
                    duration: 4,
                },
            ],
        },
    ],
};

export const whirlwind: Ability = {
    name: "Whirlwind",
    image: PanicImage,
    resourceCost: 1,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 2,
            damage: 3,
            effects: [
                {
                    ...wound,
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
    image: RedFistOfFuryImage,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 3,
            bonus: {
                damage: 3,
                area: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.BLEEDS,
                    calculationTarget: CONDITION_TARGETS.TARGET,
                },
                conditions: [
                    {
                        hasEffectType: [EFFECT_TYPES.BLEED, EFFECT_TYPES.STUN],
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        comparator: "eq",
                    },
                ],
            },
        },
    ],
};

export const rupture: Ability = {
    name: "Rupture",
    resourceCost: 0,
    image: RedFistOfFuryImage,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 3,
            bonus: {
                damage: 2,
                area: 1,
                multiplier: {
                    type: MULTIPLIER_TYPES.BLEEDS,
                    calculationTarget: CONDITION_TARGETS.TARGET,
                },
                conditions: [
                    {
                        hasEffectType: [EFFECT_TYPES.BLEED, EFFECT_TYPES.STUN],
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        comparator: "eq",
                    },
                ],
            },
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
    resourceCost: 1,
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
    resourceCost: 1,
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
    preemptive: true,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Dust Devils",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 4,
                    icon: TornadoIcon,
                    description: "When you attack, summon tornadoes that deal 1-2 damage and hit up to 3 enemies",
                    onAttack: {
                        ability: {
                            name: "Dust Devils",
                            actions: [
                                {
                                    target: TARGET_TYPES.RANDOM_HOSTILE,
                                    type: ACTION_TYPES.RANGE_ATTACK,
                                    animation: ANIMATION_TYPES.ONE_WAY_SIDEWINDER,
                                    damage: 2,
                                    secondaryDamage: 1,
                                    icon: TornadoIcon,
                                    playbackTime: 350,
                                    numTargets: 2, // Bug: 1 more target is hit than stated in this property
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
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Dust Devils",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 4,
                    icon: TornadoIcon,
                    description: "When you attack, summon tornadoes that deal 1 damage and hit up to 3 enemies",
                    onAttack: {
                        ability: {
                            name: "Dust Devils",
                            actions: [
                                {
                                    target: TARGET_TYPES.RANDOM_HOSTILE,
                                    type: ACTION_TYPES.RANGE_ATTACK,
                                    animation: ANIMATION_TYPES.ONE_WAY_SIDEWINDER,
                                    damage: 1,
                                    icon: TornadoIcon,
                                    playbackTime: 350,
                                    numTargets: 2, // Bug: 1 more target is hit than stated in this property
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
    resourceCost: 1,
    description: "Create a copy of a card in your hand. It costs 2 less and is Ephemeral",
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
    resourceCost: 1,
    description: "Create a copy of a card in your hand. It costs 1 less and is Ephemeral",
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
    description: "Deplete another card in your hand to use this ability",
    depletedOnUse: true,
    selectCards: {
        type: SELECT_CARD_TYPES.DEPLETE_FROM_HAND,
    },
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 20,
            destroyArmor: 0.5,
        },
    ],
};

export const sledge: Ability = {
    name: "Sledge",
    resourceCost: 2,
    image: GiganticSledgeImage,
    description: "Deplete another card in your hand to use this ability",
    depletedOnUse: true,
    selectCards: {
        type: SELECT_CARD_TYPES.DEPLETE_FROM_HAND,
    },
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 15,
            destroyArmor: 0.5,
        },
    ],
    upgrades: [sledge2],
};

export const bladedArmor: Ability = {
    name: "Bladed Armor",
    resourceCost: 1,
    image: MetalAxeImage,
    description: "When you lose armor, hurl a sidearm at a random enemy for 2 damage",
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

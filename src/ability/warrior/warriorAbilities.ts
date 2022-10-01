import {
    advancedWeaponMasteryImage,
    bladestormImage,
    blockImage,
    brick,
    bricks,
    closecombatImage,
    doubleTimeImage,
    enrageImage,
    extraStrikeImage,
    Fireworks,
    flag,
    giganticSledgeImage,
    hammer,
    hyperbody,
    ironbodyImage,
    ironwill as ironwillImage,
    mace,
    magiccrashImage,
    panicSkillImage,
    powerstanceImage,
    rage,
    redFistOfFuryImage,
    rushImage,
    selfRecoveryImage,
    shieldred,
    shout,
    slashblast,
    spikes,
    Tornado,
    warleap,
    warmush,
    warriormasteryImage,
    weaponbooster,
    weaponmasteryImage,
} from "../../images";
import { silence, stealth, stun, thorns, wound } from "../Effects";
import {
    Ability,
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
    image: brick,
    actions: [
        {
            damage: 4,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
};

export const bash: Ability = {
    name: "Bash",
    resourceCost: 0,
    image: brick,
    actions: [
        {
            damage: 2,
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
    image: warleap,
    actions: [
        {
            damage: 2,
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
    image: warleap,
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
    image: slashblast,
    actions: [
        {
            damage: 6,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            area: 1,
        },
    ],
};

export const slashBlast: Ability = {
    name: "Slash Blast",
    resourceCost: 1,
    image: slashblast,
    actions: [
        {
            damage: 4,
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
    image: mace,
    actions: [
        {
            damage: 9,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
};

export const slam: Ability = {
    name: "Slam",
    resourceCost: 1,
    image: mace,
    actions: [
        {
            damage: 6,
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
    image: rage,
    actions: [
        {
            damage: 3,
            resources: 2,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const anger: Ability = {
    name: "Anger",
    resourceCost: 0,
    image: rage,
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
    image: shieldred,
    actions: [
        {
            damage: 9,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
        {
            armor: 9,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const shieldStrike: Ability = {
    name: "Shield Strike",
    resourceCost: 2,
    image: shieldred,
    actions: [
        {
            damage: 6,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
        {
            armor: 6,
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
    image: blockImage,
    actions: [
        {
            armor: 8,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const block: Ability = {
    name: "Block",
    resourceCost: 1,
    image: blockImage,
    actions: [
        {
            armor: 5,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
    upgrades: [block2],
};

const bloodthirst2: Ability = {
    name: "Bloodthirst",
    resourceCost: 1,
    image: shout,
    depletedOnUse: true,
    actions: [
        {
            effects: [
                {
                    name: "Bloodthirst",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 0,
                    onResourcesSpent: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        healing: 4,
                    },
                    icon: shout,
                },
            ],
            healing: 7,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const bloodthirst: Ability = {
    name: "Bloodthirst",
    resourceCost: 1,
    image: shout,
    depletedOnUse: true,
    actions: [
        {
            effects: [
                {
                    name: "Bloodthirst",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 0,
                    onResourcesSpent: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        healing: 3,
                    },
                    icon: shout,
                },
            ],
            healing: 5,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
        },
    ],
    upgrades: [bloodthirst2],
};

export const spikedArmor2: Ability = {
    name: "Spiked Armor",
    level: 2,
    resourceCost: 1,
    image: spikes,
    actions: [
        {
            armor: 7,
            target: TARGET_TYPES.FRIENDLY,
            effects: [{ ...thorns, duration: 4 }],
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const spikedArmor: Ability = {
    name: "Spiked Armor",
    resourceCost: 1,
    image: spikes,
    actions: [
        {
            armor: 4,
            target: TARGET_TYPES.FRIENDLY,
            effects: [{ ...thorns, duration: 3 }],
            type: ACTION_TYPES.EFFECT,
        },
    ],
    upgrades: [spikedArmor2],
};

const drumOfWar = {
    type: ACTION_TYPES.EFFECT,
    target: TARGET_TYPES.SELF,
    excludePrimaryTarget: true,
    armor: 2,
    area: 1,
    effects: [
        {
            name: "Drums of War",
            description: "Attack power increased.",
            icon: weaponmasteryImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            damage: 1,
            duration: 1,
        },
    ],
};

export const warBanner2: Ability = {
    name: "War Banner",
    level: 2,
    resourceCost: 2,
    minion: {
        name: "War Banner",
        image: flag,
        maxHP: 5,
        damage: 0,
        onSummon: [
            {
                ...drumOfWar,
                armor: 3,
                area: 2,
            },
        ],
        effects: [
            {
                ...stealth,
                duration: 3,
            },
            {
                name: "War Banner",
                icon: Fireworks,
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
            },
        ],
    },
    actions: [],
};

export const warBanner: Ability = {
    name: "War Banner",
    resourceCost: 2,
    minion: {
        name: "War Banner",
        image: flag,
        maxHP: 5,
        damage: 0,
        onSummon: [drumOfWar],

        effects: [
            {
                ...stealth,
                duration: 2,
            },
            {
                name: "War Banner",
                icon: Fireworks,
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
    image: warmush,
    actions: [
        {
            area: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    name: "Admonished",
                    attackPower: -3,
                    attackDamageReceived: 1,
                    duration: 2,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.DEBUFF,
                    icon: warmush,
                },
            ],
        },
    ],
};

export const yell: Ability = {
    name: "Yell",
    resourceCost: 2,
    image: warmush,
    actions: [
        {
            area: 1,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    name: "Admonished",
                    attackPower: -2,
                    attackDamageReceived: 1,
                    duration: 2,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.DEBUFF,
                    icon: warmush,
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
    image: bricks,
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
    image: bricks,
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
    image: hammer,
    actions: [
        {
            damage: 7,
            secondaryDamage: 6,
            targetArea: 2,
            numTargets: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            ricochet: true,
            animation: ANIMATION_TYPES.YOYO,
            icon: hammer,
        },
    ],
};

export const hammerang: Ability = {
    name: "Hammerang",
    resourceCost: 1,
    reusable: true, // Hmm... beware of any ability that reduces resource cost
    image: hammer,
    actions: [
        {
            damage: 5,
            secondaryDamage: 4,
            targetArea: 2,
            numTargets: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            ricochet: true,
            animation: ANIMATION_TYPES.YOYO,
            icon: hammer,
        },
    ],
    upgrades: [hammerang2],
};

export const ironWill2: Ability = {
    name: "Iron Will",
    level: 2,
    resourceCost: 1,
    image: ironwillImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            armor: 5,
            effects: [
                {
                    name: "Iron Will",
                    icon: ironwillImage,
                    description: "Receiving +3 armor from armor sources",
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    armorReceived: 3,
                    duration: 2,
                },
            ],
        },
    ],
};

export const ironWill: Ability = {
    name: "Iron Will",
    resourceCost: 1,
    image: ironwillImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            armor: 4,
            effects: [
                {
                    name: "Iron Will",
                    icon: ironwillImage,
                    description: "Receiving +1 armor from armor sources",
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    armorReceived: 2,
                    duration: 2,
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
    image: hyperbody,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Hyper Body",
                    icon: hyperbody,
                    description: "Gaining +1 resource and healing received per turn",
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    resourcesPerTurn: 1,
                    healingReceived: 1,
                    duration: 4,
                },
            ],
        },
    ],
};

export const hyperBody: Ability = {
    name: "Hyper Body",
    resourceCost: 1,
    image: hyperbody,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Hyper Body",
                    icon: hyperbody,
                    description: "Gaining +1 resource per turn",
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    resourcesPerTurn: 1,
                    duration: 3,
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
    image: weaponbooster,
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
                    icon: weaponbooster,
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
                    image: weaponbooster,
                    description: "Increases the area of your next offensive ability by 1",
                    removeAfterTurn: true,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            effects: [
                                {
                                    name: "Sweeping Reach",
                                    type: EFFECT_TYPES.NONE,
                                    class: EFFECT_CLASSES.BUFF,
                                    icon: weaponbooster,
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
    resourceCost: 1,
    image: weaponbooster,
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
                    icon: weaponbooster,
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
    image: weaponmasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Sharpen",
                    icon: weaponmasteryImage,
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
};

export const sharpen: Ability = {
    name: "Sharpen",
    resourceCost: 0,
    image: weaponmasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Sharpen",
                    icon: weaponmasteryImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 2,
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
    image: rushImage,
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
    image: rushImage,
    actions: [
        {
            damage: 4,
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
    resourceCost: 2,
    image: powerstanceImage,
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
    resourceCost: 3,
    image: powerstanceImage,
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
    image: closecombatImage,
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
    resourceCost: 2,
    image: closecombatImage,
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
    image: selfRecoveryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            healing: 3,
            effects: [
                {
                    name: "Recovery",
                    icon: selfRecoveryImage,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    canBeSilenced: true,
                    duration: 3,
                    onTurnStart: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        healing: 4,
                    },
                },
            ],
        },
    ],
};

export const recovery: Ability = {
    name: "Recovery",
    resourceCost: 1,
    image: selfRecoveryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            healing: 2,
            effects: [
                {
                    name: "Recovery",
                    icon: selfRecoveryImage,
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
    upgrades: [recovery2],
};

export const magicCrash: Ability = {
    name: "Magic Crash",
    resourceCost: 2,
    image: magiccrashImage,
    actions: [
        {
            damage: 4,
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
    image: warriormasteryImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            drawCards: {
                amount: 3,
            },
            resources: 1,
        },
    ],
};

export const dash: Ability = {
    name: "Dash",
    resourceCost: 0,
    image: warriormasteryImage,
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
    image: ironbodyImage,
    actions: [
        {
            armor: 5,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Iron Body",
                    icon: ironbodyImage,
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    preventArmorDecay: true,
                    duration: 2,
                    onTurnStart: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        armor: 3,
                    },
                },
            ],
        },
    ],
};

export const ironBody: Ability = {
    name: "Iron Body",
    resourceCost: 1,
    image: ironbodyImage,
    actions: [
        {
            armor: 4,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            effects: [
                {
                    name: "Iron Body",
                    icon: ironbodyImage,
                    class: EFFECT_CLASSES.BUFF,
                    type: EFFECT_TYPES.NONE,
                    preventArmorDecay: true,
                    duration: 1,
                    onTurnStart: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        armor: 2,
                    },
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
    image: extraStrikeImage,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    ...wound,
                    duration: 5,
                },
                {
                    ...wound,
                    duration: 5,
                },
                {
                    ...wound,
                    duration: 5,
                },
            ],
        },
    ],
};

export const rendingStrike: Ability = {
    name: "Rending Strike",
    resourceCost: 1,
    image: extraStrikeImage,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            effects: [
                {
                    ...wound,
                    duration: 5,
                },
                {
                    ...wound,
                    duration: 5,
                },
            ],
        },
    ],
    upgrades: [rendingStrike2],
};

export const whirlwind2: Ability = {
    name: "Whirlwind",
    level: 2,
    image: panicSkillImage,
    resourceCost: 2,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 2,
            effects: [
                {
                    ...wound,
                    duration: 4,
                },
            ],
            bonus: {
                damage: 2,
                conditions: [
                    {
                        hasEffectType: [EFFECT_TYPES.BLEED],
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        comparator: "eq",
                    },
                ],
            },
        },
    ],
};

export const whirlwind: Ability = {
    name: "Whirlwind",
    image: panicSkillImage,
    resourceCost: 2,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            area: 2,
            effects: [
                {
                    ...wound,
                    duration: 3,
                },
            ],
            bonus: {
                damage: 1,
                conditions: [
                    {
                        hasEffectType: [EFFECT_TYPES.BLEED],
                        calculationTarget: CONDITION_TARGETS.TARGET,
                        comparator: "eq",
                    },
                ],
            },
        },
    ],
    upgrades: [whirlwind2],
};

export const rupture2: Ability = {
    name: "Rupture",
    resourceCost: 0,
    image: redFistOfFuryImage,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 6,
            bonus: {
                damage: 3,
                multiplier: {
                    type: MULTIPLIER_TYPES.BLEEDS,
                    calculationTarget: CONDITION_TARGETS.TARGET,
                },
                conditions: [
                    {
                        hasEffectType: [EFFECT_TYPES.BLEED],
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
    image: redFistOfFuryImage,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 4,
            bonus: {
                damage: 2,
                multiplier: {
                    type: MULTIPLIER_TYPES.BLEEDS,
                    calculationTarget: CONDITION_TARGETS.TARGET,
                },
                conditions: [
                    {
                        hasEffectType: [EFFECT_TYPES.BLEED],
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
    image: bladestormImage,
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
    image: bladestormImage,
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

export const rally2: Ability = {
    name: "Rally",
    resourceCost: 1,
    image: enrageImage,
    actions: [
        {
            area: 2,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            effects: [
                {
                    name: "Inspired",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 3,
                    duration: 0,
                    icon: enrageImage,
                },
            ],
        },
    ],
};

export const rally: Ability = {
    name: "Rally",
    resourceCost: 1,
    image: enrageImage,
    actions: [
        {
            area: 2,
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.FRIENDLY,
            effects: [
                {
                    name: "Inspired",
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    attackPower: 2,
                    duration: 0,
                    icon: enrageImage,
                },
            ],
        },
    ],
    upgrades: [rally2],
};

export const dustDevils2: Ability = {
    name: "Dust Devils",
    level: 2,
    resourceCost: 1,
    image: Tornado,
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
                    icon: Tornado,
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
                                    icon: Tornado,
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
    image: Tornado,
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
                    icon: Tornado,
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
                                    icon: Tornado,
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

export const doubleTime: Ability = {
    name: "Double Time",
    image: doubleTimeImage,
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
};

export const arsenal: Ability = {
    name: "Arsenal",
    resourceCost: 1,
    image: advancedWeaponMasteryImage,
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
};

export const sledge: Ability = {
    name: "Sledge",
    resourceCost: 2,
    image: giganticSledgeImage,
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
        },
    ],
};

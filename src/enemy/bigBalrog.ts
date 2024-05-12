import { isUntargetable } from "./../battle/utils";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    CARD_PILE_TYPES,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    EffectEventTrigger,
    MULTIPLIER_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import {
    BalrogClawLeftImage,
    BalrogClawRightImage,
    BalrogImage,
    BoulderFragmentImage,
    DarkThunderBoltProjectileImage,
    EncroachingDarknessImage,
    FireMarbleImage,
    GlowingOrbImage,
    LampImage,
    NightShadeExplosionImage,
    RespawnTokenImage,
    ReturningRockImage,
    SkeletonOfHorrorImage,
    SkullStrikerImage,
    ThunderBoltImage,
    UpMATTImage,
} from "../images";
import { defUp, ward, burn, poison, immunity, preventArmorDecay, hardy, attackPower, silence } from "./../ability/Effects";
import { attack } from "./abilities";
import { lifeLink, temporaryResist } from "./effect";
import { agonyCard } from "./undead";
import { BATTLEFIELD_SIDES } from "../battle/types";
import { CloudIcon, ShieldIcon } from "../images/icons";

export const tombstoneMinion: Minion = {
    name: "Tombstone",
    image: ReturningRockImage,
    disableTribute: true,
    maxHP: 1,
    abilities: [],
    effects: [
        {
            name: "Tombstone",
            description: "Can't be Tributed. Disappears when this effect ends.",
            preventTurnAction: true,
            untargetable: true,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            duration: 5,
            onEnd: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                ability: {
                    name: "Crumble",
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            retreat: true,
                        },
                    ],
                },
            },
        },
    ],
};

export const lordBalrog: Minion = {
    name: "Lord Balrog",
    maxHP: 666,
    isBoss: true,
    image: BalrogImage,
    imageOptions: {
        styles: {
            minWidth: "200%",
            minHeight: "125%",
            position: "absolute",
            left: "-45%",
            bottom: "-35px",
            maxHeight: "unset",
        },
    },
    abilities: [
        {
            name: "Fireball",
            image: FireMarbleImage,
            actions: [
                {
                    damage: 6,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: FireMarbleImage,
                    effects: [{ ...burn, stacks: 1 }],
                },
            ],
        },
        {
            name: "Tombstone",
            image: ReturningRockImage,
            description: "Blocks off a space on the player's side. If there is no space, destroys an existing summon.",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.HOSTILE,
                    summon: [
                        {
                            side: BATTLEFIELD_SIDES.PLAYER_SIDE,
                            tributePossible: true,
                            minion: [tombstoneMinion],
                        },
                    ],
                },
            ],
        },
        {
            name: "Double Fireball",
            image: FireMarbleImage,
            actions: [
                {
                    damage: 4,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: FireMarbleImage,
                    effects: [{ ...burn, stacks: 1 }],
                },
                {
                    damage: 4,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: FireMarbleImage,
                    effects: [{ ...burn, stacks: 1 }],
                },
            ],
        },
        {
            name: "Dark Lightning",
            image: ThunderBoltImage,
            actions: [
                {
                    damage: 10,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    icon: DarkThunderBoltProjectileImage,
                    animationOptions: {
                        height: 250,
                        width: 60,
                        flash: 200,
                        brightness: 0,
                    },
                    area: 3,
                    effects: [
                        {
                            ...poison,
                            stacks: 2,
                        },
                    ],
                },
            ],
        },
        {
            name: "Doom!",
            image: SkeletonOfHorrorImage,
            resourceCost: 3,
            castTime: 1,
            description: "Depletes the top card of your deck. Adds an Agony card to your discard.",
            actions: [
                {
                    damage: 10,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.PLAYER,
                    icon: SkullStrikerImage,
                    animation: ANIMATION_TYPES.BEAM,
                    moveCards: {
                        from: CARD_PILE_TYPES.DECK,
                        to: CARD_PILE_TYPES.DEPLETED,
                        filters: [
                            {
                                property: "name",
                                comparator: "not",
                                value: "Beacon",
                            },
                        ],
                        amount: 1,
                    },
                    addCardsToDiscard: [{ ...agonyCard }],
                },
            ],
        },
        {
            name: "Cloak of Darkness",
            image: ShieldIcon,
            description: "Gain 200 Armor and dispel all debuffs. After 3 turns, will deal damage equal to Armor, up to 50.",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 200,
                    removeDebuffs: true,
                    effects: [
                        {
                            ...preventArmorDecay,
                            name: "Cloak of Darkness",
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.BUFF,
                            icon: NightShadeExplosionImage,
                            description: "When this effect ends, deals damage equal to Armor, up to 50.",
                            preventTurnAction: true,
                            canBeSilenced: false,
                            resourcesPerTurn: -1,
                            portraitAnimationOptions: {
                                filter: "brightness(0.3) saturate(0.4) drop-shadow(0 0 5px rgba(0, 0, 0, 0.25))",
                            },
                            duration: 4,
                            onReceiveDamage: {
                                usableWhileStunned: true,
                                conditions: [
                                    {
                                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                        armor: 0,
                                        comparator: "eq",
                                    },
                                ],
                                removeEffect: true,
                            },
                            onEnd: {
                                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                conditions: [
                                    {
                                        calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                        armor: 0,
                                        comparator: "gt",
                                    },
                                ],
                                ability: {
                                    name: "Explosive Shadow",
                                    image: NightShadeExplosionImage,
                                    actions: [
                                        {
                                            damage: 1,
                                            maxDamage: 50,
                                            type: ACTION_TYPES.RANGE_ATTACK,
                                            target: TARGET_TYPES.HOSTILE,
                                            icon: NightShadeExplosionImage,
                                            animation: ANIMATION_TYPES.ACTION_EXPLODE,
                                            multiplier: {
                                                type: MULTIPLIER_TYPES.ARMOR,
                                                calculationTarget: CONDITION_TARGETS.ACTOR,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            ],
        },
        {
            name: "Shatter",
            resourceCost: 3,
            description: "Destroys all Tombstones. Each Tombstone explodes for 13 damage to characters on the same side.",
            image: BoulderFragmentImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE_CHARACTER,
                    targetName: tombstoneMinion.name,
                    area: 5,
                    induceCombatant: {
                        action: {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.EFFECT,
                            damage: 13,
                            area: 5,
                            secondaryAction: { damage: 5 },
                        },
                    },
                },
            ],
        },
    ],
    effects: [
        hardy,
        {
            name: "Wicked",
            icon: SkullStrikerImage,
            description: "Ramping +1 DEF Up and +1 ATT Up.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            turnsTriggerFrequency: 2,
            canBeSilenced: true,
            onTurnEnd: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                ability: {
                    name: "Wicked Power",
                    image: SkullStrikerImage,
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            icon: SkullStrikerImage,
                            animation: ANIMATION_TYPES.ACTION_EXPLODE,
                            effects: [defUp, attackPower],
                        },
                    ],
                },
            },
            onBattleStart: {
                ability: {
                    name: "Wicked Power",
                    image: SkullStrikerImage,
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            icon: SkullStrikerImage,
                            animation: ANIMATION_TYPES.ACTION_EXPLODE,
                            effects: [defUp, attackPower],
                        },
                    ],
                },
            },
        },
    ],
};

const revive: EffectEventTrigger = {
    usableWhileStunned: true,
    affectsDeadCharacters: true,
    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
    effects: [
        {
            name: "Reviving...",
            type: EFFECT_TYPES.LIFE_LINK,
            class: EFFECT_CLASSES.BUFF,
            icon: RespawnTokenImage,
            canBeSilenced: false,
            persistsWhenDead: true,
            description: "Revives when this effect ends.",
            duration: 3,
            onEnd: {
                usableWhileStunned: true,
                usableWhileDead: true,
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                ability: {
                    name: "Revive",
                    image: RespawnTokenImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.FRIENDLY,
                            healing: 1,
                            multiplier: {
                                type: MULTIPLIER_TYPES.MAX_HP,
                                calculationTarget: CONDITION_TARGETS.ACTOR,
                                value: 1,
                            },
                            resurrect: true,
                        },
                    ],
                },
            },
            onFriendlyDeath: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                resetDuration: true,
                usableWhileStunned: true,
                usableWhileDead: true,
            },
        },
    ],
};

const lightInTheDark: Ability = {
    name: "A Light in the Dark",
    image: LampImage,
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.HOSTILE,
            area: 5,
            removeEffects: [defUp.name, attackPower.name],
            effects: [{ ...silence, duration: 1 }],
        },
    ],
};

export const beaconCard: Ability = {
    name: "Beacon",
    description: "Can be played on Tombstones. <br/> <b>Untargetable.</b> Dispels the effects of Wicked Power.",
    image: LampImage,
    resourceCost: 0,
    minion: {
        name: "Beacon",
        maxHP: 3,
        uncontrollable: true,
        image: LampImage,
        abilities: [],
        bypassDisableTribute: true,
        effects: [
            {
                name: "Light in the Dark",
                description: "Untargetable. Character disappears when this effect ends.",
                icon: LampImage,
                type: EFFECT_TYPES.IMMUNITY,
                class: EFFECT_CLASSES.BUFF,
                untargetable: true,
                duration: 3,
                onSummoned: {
                    ability: lightInTheDark,
                },
                onTurnStart: {
                    ability: lightInTheDark,
                },
                onEnd: {
                    targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    ability: {
                        name: "Vanish",
                        image: CloudIcon,
                        actions: [
                            {
                                target: TARGET_TYPES.SELF,
                                type: ACTION_TYPES.NONE,
                                retreat: true,
                            },
                        ],
                    },
                },
            },
        ],
    },
    actions: [],
};

const clawEffect: Effect = {
    ...lifeLink,
    description: "When defeated, revives after 3 turns.",
    canBeSilenced: false,
    type: EFFECT_TYPES.LIFE_LINK,
    class: EFFECT_CLASSES.BUFF,
    onDeath: [
        {
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    comparator: "eq",
                    numFriendly: 0,
                    filters: [
                        {
                            property: "name",
                            value: lordBalrog.name,
                            comparator: "not",
                        },
                    ],
                },
            ],
            addCards: [beaconCard],
        },
        {
            ...revive,
        },
    ],
};

export const balrogClawA: Minion = {
    name: "Claw A",
    maxHP: 100,
    image: BalrogClawLeftImage,
    isBoss: true,
    abilities: [
        {
            name: "Shoot",
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: EncroachingDarknessImage,
                    animationOptions: {
                        width: 150,
                        height: 150,
                    },
                    damage: 5,
                },
            ],
        },
        {
            name: "Warding",
            image: UpMATTImage,
            description: "Applies Ward to all allies.",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    area: 5,
                    effects: [ward],
                },
            ],
        },
        {
            name: "Shoot",
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: EncroachingDarknessImage,
                    animationOptions: {
                        width: 150,
                        height: 150,
                    },
                    damage: 5,
                },
            ],
        },
    ],
    effects: [hardy, clawEffect],
};

export const balrogClawB: Minion = {
    name: "Claw B",
    maxHP: 100,
    image: BalrogClawRightImage,
    isBoss: true,
    abilities: [
        {
            name: "Resistance",
            description: "Applies 2 Resistance to all allies.",
            image: temporaryResist.icon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    area: 5,
                    effects: [
                        {
                            ...temporaryResist,
                            stacks: 2,
                        },
                    ],
                },
            ],
        },
        {
            name: "Shoot",
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: EncroachingDarknessImage,
                    animationOptions: {
                        width: 150,
                        height: 150,
                    },
                    damage: 5,
                },
            ],
        },
        {
            name: "Shoot",
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: EncroachingDarknessImage,
                    animationOptions: {
                        width: 150,
                        height: 150,
                    },
                    damage: 5,
                },
            ],
        },
    ],
    effects: [hardy, clawEffect],
};

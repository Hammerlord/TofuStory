import { onBattleEnd } from "./../battle/actions/phases";
import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import { Item, RARITIES } from "../item/types";

export enum TARGET_TYPES {
    HOSTILE = "hostile",
    SELF = "self",
    FRIENDLY = "friendly",
    RANDOM_HOSTILE = "random-hostile",
    RANDOM_FRIENDLY = "random-friendly",
    FRIENDLY_CHARACTER = "friendly-character",
}

export enum EFFECT_TYPES {
    NONE = "none",
    STUN = "stun",
    BLEED = "bleed",
    POISON = "poison",
    FREEZE = "freeze",
    BURN = "burn",
    CHILL = "chill",
    STEALTH = "stealth",
    RAGE = "rage",
    SILENCE = "silence",
    IMMUNITY = "immunity", // including effects
    ATTACK_IMMUNITY = "attackImmunity",
    LIFE_LINK = "lifeLink",
}

export enum EFFECT_CLASSES {
    BUFF = "buff",
    DEBUFF = "debuff",
    NONE = "none",
}

export enum CONDITION_TARGETS {
    TARGET = "target",
    ACTOR = "actor",
    TRIGGER_SOURCE = "trigger-source", // The proccing ability, effect, etc. to compare to the condition
}

// Who should receive the proc that was triggered?
// externalParty: for example, the target being attacked, or the target attacking the owner of this effect
// effectApplier: the combatant who applied the effect
// random: this can be multiple targets
export enum TRIGGER_TARGET_TYPES {
    EFFECT_OWNER = "effect-owner",
    PLAYER = "player",
    EFFECT_APPLIER = "effect-applier",
    TARGET = "target",
    ACTOR = "actor",
    ALL_TARGETS = "all-targets", // All targets affected by the trigger action
}

export interface EffectEventTrigger {
    removeEffect?: boolean; // Remove this effect from its owner after completion of the event
    conditionOperator?: "and" | "or"; // OR by default
    conditions?: Condition[]; // OR if multiple conditions are present
    parentEffect?: {
        // Update the parent effect's stats
        damage?: number;
    };

    targetType?: TRIGGER_TARGET_TYPES;
    mesos?: number;
    // Stat changes that do not trigger an 'action'
    effects?: Effect[];
    armor?: number;
    healing?: number;
    drawCards?: {
        amount: number;
        effects?: AbilityEffects;
    };
    addCards?: Ability[];
    resurrect?: boolean;
    resources?: number;
    damage?: number;
    randomOptions?: {
        numTargets?: number;
        targetType: TARGET_TYPES.RANDOM_HOSTILE | TARGET_TYPES.RANDOM_FRIENDLY;
    };

    usableWhileStunned?: boolean;
    usableWhileDead?: boolean;
    // If you are providing an ability to be applied to a target, you probably don't want to do any of the other properties.
    // (Ability actions already have their own targeting and effects and whatnot)
    // If a string is supplied, it is a reference
    ability?: Ability | string;
    multiplier?: Multiplier;
    // Names of effects to remove from the combatant
    removeEffects?: string[];
    area?: number;
    excludePrimaryTarget?: boolean;
    /** Wild magic */
    autoCastAbilities?: AutoCastAbility;
    chance?: number; // A percentage of occurrence, up to 1
    // Reduces a stack of the parent effect when this event triggers. If the parent effect has 1 or no stacks, this behaves like removeEffect.
    decrementStacks?: number;
    // How many times did this event occur on the effect owner over the lifetime of the parent effect
    eventTriggeredTimes?: number;
    // How often should the effects proc compared to how often the event triggered. Modulo.
    eventTriggerFrequency?: number;
}

export enum EFFECT_EVENT_KEYS {
    onAbility = "onAbility",
    onOffensiveAbility = "onOffensiveAbility",
    onDepleteAbility = "onDepleteAbility",
    onAttack = "onAttack",
    onDeath = "onDeath",
    onFriendlyDeath = "onFriendlyDeath",
    onHostileDeath = "onHostileDeath",
    onReceiveAttack = "onReceiveAttack",
    onFriendlyReceiveAttack = "onFriendlyReceiveAttack",
    onReceiveDamage = "onReceiveDamage",
    onReceiveHealing = "onReceiveHealing",
    onReceiveArmor = "onReceiveArmor",
    onReceiveEffect = "onReceiveEffect",
    onApplyEffect = "onApplyEffect",
    onEffectRemoved = "onEffectRemoved",
    onResourcesSpent = "onResourcesSpent",
    onResourcesGained = "onResourcesGained",
    onTurnStart = "onTurnStart",
    onTurnInProgress = "onTurnInProgress",
    onReceiveOverhealing = "onReceiveOverhealing",
    onTurnEnd = "onTurnEnd",
    onEnd = "onEnd",
    onWaveStart = "onWaveStart",
    onWaveClear = "onWaveClear",
    onSummoned = "onSummoned",
    onHostileSummon = "onHostileSummon",
    onFriendlySummon = "onFriendlySummon",
    onArmorLoss = "onArmorLoss",
    onDrawCard = "onDrawCard", // Player drew a card
    onDeckCycle = "onDeckCycle", // Player's deck reset
    onBattleStart = "onBattleStart",
    onBattleEnd = "onBattleEnd",
}

export enum SCALING_VALUE_TYPES {
    FLAT = "flat",
    PERCENTAGE = "percentage",
}

export interface AbilityDamageReceived {
    abilityName: string;
    damage: number;
    type: SCALING_VALUE_TYPES;
}

export interface Effect {
    name: string;
    type: EFFECT_TYPES;
    class: EFFECT_CLASSES;
    // 0: lasts until the end of the current turn; 1: lasts until the end of the opponent's turn...
    duration?: number;
    attackPower?: number;
    description?: string;
    // The icon to display below the combatant
    icon?: string;
    // Disable the icon display below the combatant (this was added to clean up some of the clutter with attack power increases)
    disableDisplayIcon?: boolean;
    // The larger, possibly animated effect image to display on top of the combatant portrait
    image?: string;
    weaponAnimation?: "glow";
    // Stacks is the number of this effect but stored on the same effect object, rather than the traditional "n" effect objects representing "n" stacks.
    // See Volatile Magic for usage.
    stacks?: number;
    /** When reapplied at the application maximum, the application with the lowest duration will pandemic, instead of adding another application */
    maxApplications?: number;
    attackAreaIncrease?: number;
    basicAttackAreaIncrease?: number;
    resourcesPerTurn?: number;
    drawCardsPerTurn?: number;
    /** If true, effect has no effect on its owner */
    excludeEffectOwner?: boolean;
    /** Prevent application of certain effects */
    immunities?: {
        type: "effect-type" | "effect";
        value: EFFECT_TYPES[] | string[]; // If string[], provide the names of the effects
    };
    preventArmorDecay?: boolean;
    armorReceived?: number; // Increased armor received, that is; ditto for below
    attackDamageReceived?: number;
    healingReceived?: number;
    /** Healing received when hitting an enemy. Scales with the number of enemies hit */
    lifeOnHit?: number;
    /** Damage to reflect back to attackers */
    thorns?: number;
    lifeOnKill?: number;
    /** Mesos received when hitting an enemy. Only works if the enemy has mesos to steal. */
    mesoSteal?: number;
    abilityDamageReceived?: AbilityDamageReceived[];
    conditions?: Condition[];
    onAbility?: EffectEventTrigger;
    onOffensiveAbility?: EffectEventTrigger;
    onDepleteAbility?: EffectEventTrigger;
    onAttack?: EffectEventTrigger;
    onDeath?: EffectEventTrigger;
    onFriendlyDeath?: EffectEventTrigger;
    onHostileDeath?: EffectEventTrigger;
    onReceiveAttack?: EffectEventTrigger;
    onReceiveDamage?: EffectEventTrigger;
    onFriendlyReceiveAttack?: EffectEventTrigger;
    onReceiveHealing?: EffectEventTrigger;
    onReceiveArmor?: EffectEventTrigger;
    onReceiveEffect?: EffectEventTrigger;
    onApplyEffect?: EffectEventTrigger;
    onResourcesSpent?: EffectEventTrigger;
    onResourcesGained?: EffectEventTrigger;
    onTurnStart?: EffectEventTrigger;
    onTurnInProgress?: EffectEventTrigger;
    onTurnEnd?: EffectEventTrigger;
    /** When the effect ticks down and ends naturally, not when it is removed or dispelled */
    onEnd?: EffectEventTrigger;
    onWaveStart?: EffectEventTrigger;
    onWaveClear?: EffectEventTrigger;
    onEffectRemoved?: EffectEventTrigger;
    onReceiveOverhealing?: EffectEventTrigger;
    /** When the effect owner is summoned */
    onSummoned?: EffectEventTrigger;
    /** When a minion friendly to the effect owner is summoned */
    onFriendlySummon?: EffectEventTrigger;
    /** When a minion hostile to the effect owner is summoned */
    onHostileSummon?: EffectEventTrigger;
    /** Whenever character loses armor -- this includes armor decay */
    onArmorLoss?: EffectEventTrigger;
    onDrawCard?: EffectEventTrigger;
    onDeckCycle?: EffectEventTrigger;
    onBattleStart?: EffectEventTrigger;
    onBattleEnd?: EffectEventTrigger;
    canBeSilenced?: boolean;
    /** Character does not choose and play an ability during its turn */
    preventTurnAction?: boolean;
    applyEffects?: Effect[]; // Additional effects that periodically trigger from this effect
    /** How many turns it should cool down before triggering again */
    turnsTriggerFrequency?: number;
    skillBonus?: {
        comparator?: "includes" | "eq"; // Default is exact match (eq). Not case sensitive
        skill: string;
        damage: number;
    }[];
    onlyVisibleWhenProcced?: boolean;
    mesosGained?: number; // Percentage; 1 = 100%
    maxHP?: number;
    dotDamageIncrease?: number;
    // Ignore stealth
    truesight?: boolean;
    /** Replace certain properties on the effect owner */
    override?: {
        portrait?: string[]; // If an array is provided, a random item will be chosen
        damage?: number;
    };
    viewDeckInOrder?: boolean;
    minimumAttackDamage?: number;
    bypassImmunity?: boolean;
}

export interface CombatEffect extends Effect {
    id: string;
    uptime: number;
    applierId?: string;
}

export interface Minion {
    name: string;
    image: string;
    imageOptions?: {
        filter: string;
    };
    maxHP: number;
    HP?: number;
    armor?: number;
    abilities?: Ability[];
    effects?: Effect[];
    resources?: number;
    isBoss?: boolean;
    isElite?: boolean;
    mesos?: number;
    items?: Item[];
    weapon?: string;
    weaponImageOptions?: {
        top?: string;
        left?: string;
        transform?: string;
    };
}

export interface Multiplier {
    type: MULTIPLIER_TYPES;
    calculationTarget?: CONDITION_TARGETS;
    // Eg. if the type is maxHP, pass a percentage (number in range 0 <= 1) of the maxHP to scale from
    // Eg. if the type is ABILITIES_WITH_NAME, give the name value here
    value?: string | number;
    // Currently only available for ALL_CARDS and EFFECT_DURATIONS.
    // Eg. Providing a filter can narrow down the number of cards { property: "name", comparator: "includes", value: "bolt" }
    filters?: { property: string; comparator: "includes" | "eq"; value: any }[];
}

export interface Bonus {
    /**
     * Flat amount to increase or decrease. Should be an integer.
     */
    damage?: number;
    healing?: number;
    armor?: number;
    effects?: Effect[];
    area?: number;

    /**
     * A multiplier on the bonus amount
     */
    multiplier?: Multiplier;

    /**
     * Conditions to pass for the bonus to apply.
     * Multiple conditions are evaluated as "OR".
     */
    conditions?: Condition[];
    excludePrimaryTarget?: boolean;
}

export interface Condition {
    /** Equals | Less than | Greater than | Not equals/has -- Only used in pass/fail check */
    comparator?: "eq" | "lt" | "gt" | "not" | "modulo";
    calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES;
    // Comparing properties on another target, eg. HP between actor and target
    otherCalculationTarget?: {
        targetType: CONDITION_TARGETS | TRIGGER_TARGET_TYPES;
        property: string;
    };

    /** Unique effects, not stacks; TODO numDebuffs/Buffs do nothing */
    numDebuffs?: number;
    numBuffs?: number;
    hasEffectType?: EFFECT_TYPES[];
    hasEffectClass?: EFFECT_CLASSES.BUFF | EFFECT_CLASSES.DEBUFF;
    hasEffect?: string; // Effect name
    /** Unique effects, not stacks */
    numEffects?: number;
    /** This should be a decimal value up to 1 */
    resourcePercentage?: number;
    /** Flat HP value */
    HP?: number;
    /** This should be a decimal value up to 1 */
    healthPercentage?: number;
    armor?: number;
    /** Whether the name of the target matches the condition depending on comparator */
    name?: string | string[];
    /** How far away the target/actor are from each other. Similar to area. 0 = directly across from each other. */
    proximity?: number;
    /** If the character is an elite enemy or boss */
    isElite?: boolean;
    numAbilitiesUsed?:
        | number
        | {
              type?: ACTION_TYPES[];
              amount: number;
          };
    sourceType?: TRIGGER_SOURCE_TYPES;
    /** Only applicable when comparing against an ability */
    resourceCost?: number;
    isOffense?: boolean;
    /** Number of units on the board friendly to the calculationTarget, including itself */
    numFriendly?: number;
}

export enum MULTIPLIER_TYPES {
    FLAT = "flat", // Take the value as-is
    ATTACKS_MADE_IN_TURN = "attacksMadeInTurn",
    ARMOR = "armor",
    // This is for players only; count the number of cards they own with a particular name
    ABILITIES_WITH_NAME = "abilitiesWithName",
    HP = "HP",
    MAX_HP = "maxHP",
    DEBUFFS = "debuffs",
    BLEEDS = "bleeds",
    /**
     * Number of characters affected by the current action
     */
    NUM_AFFECTED_TARGETS = "numCharactersAffected",
    /**
     * Number of characters affected by the trigger source action
     * For example, the trigger event was onAttack; this makes the resultant proc scale with the number of enemies hit by the attack
     */
    NUM_SOURCE_TARGETS = "numSourceCharactersAffected",
    RESOURCES_SPENT = "resourcesSpent",
    OVERHEALING = "overhealing",
    ALL_CARDS = "all-cards",
    EFFECT_DURATIONS = "effect-durations",
}

export interface Radiate {
    damage?: number;
    area?: number;
    effects?: Effect[];
}

export interface SelectCards {
    type: SELECT_CARD_TYPES;
    cards?: Ability[];
    filters?: ACTION_TYPES[];
    effects?: AbilityEffects;
    maxAmount?: number;
}

export enum MORPH_MINION_MODIFIERS {
    SUM = "sum",
    DIVIDE_EVENLY = "divide-evenly",
}

export enum MORPH_TYPES {
    /** For each minion, transform it to another minion */
    MAP = "map",
    /** Replace targeted minions with one or more minions */
    MERGE = "merge",
}

export interface Morph {
    type: MORPH_TYPES;
    minions: {
        minion: Minion | string; // Minion object or a string name
        positionIndex?: number; // Only applicable for MORPH_TYPES.MERGE (place the new minion in a specific index on the board)
        conditions?: Condition[]; // Morph x minion to y minion if it meets this condition (otherwise, nothing happens to x minion)
        storeSummoner?: true; // This minion takes the place of its summoner. When killed, the summoner will reappear in its place.
    }[];
    modifiers?: {
        HP: MORPH_MINION_MODIFIERS;
    };
}

export interface Action {
    damage?: number;
    secondaryDamage?: number;
    flatDamage?: number; // Deal damage that is not affected by any modifiers
    type: ACTION_TYPES;
    healing?: number;
    armor?: number;
    target?: TARGET_TYPES;
    // If TARGET_TYPES is FRIENDLY_CHARACTER, provide the character's name.
    // Meant for enemies selecting a specific ally to support.
    targetName?: string;
    area?: number;
    /** Only applicable to target type RANDOM or ricochet. If not supplied, all targets on one side are eligible. */
    targetArea?: number;
    numTargets?: number;
    // Bounces between numTargets within targetArea
    ricochet?: boolean;
    effects?: (string | Effect)[]; // If a string (name of effect) is provided, attempt to look up the corresponding effect
    description?: string;
    movement?: number;
    resources?: number;
    /** Displaces characters toward the target index */
    vacuum?: number;
    /** Effects on the cards currently in the hand */
    currentHandEffects?: AbilityEffects;
    /** Adds cards to your current hand */
    addCards?: Ability[];
    addCardsToDeck?: Ability[];
    /** Adds cards to your current discard pile */
    addCardsToDiscard?: Ability[];
    drawCards?: {
        amount: number;
        effects?: AbilityEffects;
        filters?: ACTION_TYPES[]; // Force it to draw a certain type of card
    };
    selectCards?: SelectCards;
    retrieveDepletedCards?: {
        amount: number;
    };
    icon?: string; // Used as a projectile
    bonus?: Bonus | Bonus[];
    multiplier?: Multiplier;
    animation?: ANIMATION_TYPES;
    conditions?: Condition[];
    excludePrimaryTarget?: boolean;
    /** Radiates damage/effects to opponents on the other side of the board. */
    radiate?: {
        damage?: number;
        area?: number;
        effects?: Effect[];
        icon?: string;
        animation?: ANIMATION_TYPES;
        playbackTime?: number;
    };
    /** Percentage of armor on the target to remove */
    destroyArmor?: number;
    resurrect?: boolean;
    playbackTime?: number;
    summon?: {
        // If more than one minion is provided, chooses one randomly.
        minion: (Minion | string)[];
        // Which position on the friendly side of the board to summon the minion. If the slot is occupied, this will fail quietly. If not provided, a random valid slot will be chosen.
        positionIndex?: number;
    }[];
    // Mutate one or more combatants/minions to become one or more different combatants/minions.
    morph?: Morph;
    // When cast on a combatant that has attack power, that combatant will attack randomly.
    induceCombatantAttack?: boolean;
    mesos?: number;
    stealMesos?: number;
    // Dispels all debuffs currently on the character
    removeDebuffs?: boolean;
    // Names of effects to be removed
    removeEffects?: string[];
    animationOptions?: {
        rotate?: number; // Degrees to rotate a sprite; for example, an arrow sprite might be at 45 degrees and need to be oriented to point at a target
        mirrorX?: boolean;
        rotateToFaceTarget?: boolean; // Whether a projectile such as an arrow should orient toward the target. True by default.
        width?: number;
        height?: number;
        opacity?: number; // Should be a decimal with a max value of 1
        flash?: number; // Duration of a single flash, in milliseconds. Smaller MS = faster flashing
        fadeOut?: boolean;
        sidewinder?: boolean; // If true, projectile takes an indirect route toward the target
    };
    // Secondary effects to apply to another party. Eg. if the action is an attack but it also heals the actor.
    secondaryAction?: {
        target: "actor";
        damage?: number;
        resources?: number;
        healing?: number;
        multiplier?: Multiplier;
        flatDamage?: number;
        conditions?: Condition[];
        effects?: Effect[];
        returnParentCardToHand?: boolean;
    };
    /** Wild magic */
    autoCastAbilities?: AutoCastAbility;
    retreat?: boolean;
}

export interface Ability {
    name: string;
    resourceCost?: number | "x"; // "x" means to expend the remainder of your resources
    actions: Action[];
    minion?: Minion;
    image?: string;
    channelDuration?: number;
    rarity?: RARITIES;
    castTime?: number;
    description?: string;
    /** Escape hatch to depend on description only if the body text generator is unmanageable */
    overrideBodyText?: boolean;
    /** AKA ephemeral -- ability disappears after your turn or on use */
    removeAfterTurn?: boolean;
    reusable?: boolean;
    depletedOnUse?: boolean;
    /** An effect applied to this ability when another ability is used */
    onAbilityUse?: {
        resourceCost?: number;
    };
    dialog?: string;
    upgrades?: Ability[];
    /** The upgrade level of this ability; assumed to be 1 (baseline) if not provided */
    level?: number;
    /** On battle start, this ability is shuffled to the top of your deck. */
    preemptive?: boolean;
    /** This is treated as a prerequisite to using the ability */
    selectCards?: SelectCards;
    /** Prerequisite to use the ability at all */
    conditions?: Condition[];
    /** Enemies should prefer to use this ability if it is available */
    priority?: boolean;
    effectsWhileOwned?: Effect[];
    onDraw?: {
        ability: Ability;
    };
}

/**
 * Includes resourceCost/damage changes that only last for the duration that the ability exists in the player's hand
 */
export interface HandAbility extends Ability {
    instanceId: string;
    effects?: AbilityEffects;
}

export enum ACTION_TYPES {
    ATTACK = "attack",
    RANGE_ATTACK = "ranged-attack",
    EFFECT = "effect",
    NONE = "none",
    MOVEMENT = "movement",
    BLEED = "bleed",
    BURN = "burn",
    SPECIAL = "special",
    HINDER = "hindrance",
}

export enum ANIMATION_TYPES {
    // 'icon' travels from actor to target spinning
    ONE_WAY_SPIN = "one-way-spin",
    ONE_WAY_SPIN_FAST = "one-way-spin-fast",
    // 'icon' travels from actor to target and back
    YOYO = "yoyo",
    ONE_WAY = "one-way",
    RICOCHET = "ricochet",
    DROP = "drop",
    // This is the same as ACTION_TYPES.EFFECT
    CAST = "cast",
    SHOUT = "shout",
    SNOOZE = "snooze",
    BEAM = "beam",
    EXPLODE = "explode",
    STOMP = "stomp",
    ACTION_EXPLODE = "action-image-explode",
    SPIN = "spin", // Spin in place
}

export interface AbilityEffects {
    resourceCost?: number;
    damage?: number;
    removeAfterTurn?: boolean;
}

export enum SELECT_CARD_TYPES {
    COPY_FROM_HAND = "copy",
    DISCOVER_FROM_CLASS = "discover-from-class",
    PRESET_CARDS = "preset-cards",
    DEPLETE_FROM_HAND = "deplete",
    HAND_TO_TOP_DECK = "hand-to-top-deck",
    DISCARD_TO_DRAW = "discard-to-draw",
}

export enum AUTO_CAST_ABILITY_TYPES {
    OFFENSE_FROM_CLASS = "offense-from-class",
    FROM_CLASS = "from-class",
    PRESET_CARDS = "preset-cards",
}

export interface AutoCastAbility {
    type: AUTO_CAST_ABILITY_TYPES;
    amount: number;
    presetCards?: Ability[];
    filters?: { property: string; comparator: "includes" | "eq" | "lt" | "gt"; value: any }[];
}

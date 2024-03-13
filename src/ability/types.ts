import { chessPiece } from "./../item/items";
import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import { Item, RARITIES } from "../item/types";

export enum TARGET_TYPES {
    HOSTILE = "hostile",
    SELF = "self",
    FRIENDLY = "friendly",
    RANDOM_HOSTILE = "random-hostile",
    RANDOM_FRIENDLY = "random-friendly",
    FRIENDLY_CHARACTER = "friendly-character",
    MOVE = "move",
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
    FEAR = "fear",
    TAUNT = "taunt", // Characters hostile to a unit with this effect are only allowed to target that unit
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

/**
 * What happens when an effect event triggers. It can perform a pseudo-Action, hence properties of Action are included here.
 */
export type EffectEventTrigger = { [key in keyof Action]?: Action[key] } & {
    removeEffect?: boolean; // Remove this effect from its owner after completion of the event
    conditionOperator?: "and" | "or"; // OR by default
    parentEffect?: {
        // Update the parent effect's stats
        damage?: number;
    };

    // Who receives the effects of this event or the ability configured.
    targetType?: TRIGGER_TARGET_TYPES;
    randomOptions?: {
        numTargets?: number;
        targetType: TARGET_TYPES.RANDOM_HOSTILE | TARGET_TYPES.RANDOM_FRIENDLY;
    };

    usableWhileStunned?: boolean;
    usableWhileDead?: boolean;
    // If you are providing an entire ability to be used when this effect event triggers, you probably don't want to use the pseudo-Action configurations.
    // (Ability actions already have their own targeting and effects and whatnot).
    // If a string is supplied, it is assumed to be a reference to an ability object.
    ability?: Ability | string;
    chance?: number; // A percentage of occurrence, up to 1
    // Reduces a stack of the parent effect when this event triggers. If the parent effect has 1 or no stacks, this behaves like removeEffect.
    decrementStacks?: number;
    // How many times did this event occur on the effect owner over the lifetime of the parent effect
    eventTriggeredTimes?: number;
    // How often should the effects proc compared to how often the event triggered. Modulo.
    eventTriggerFrequency?: number;
    // Eg. if tracking resources spent, it's how many resources total have been spent over the lifetime of the parent effect.
    // If not trackable in this manner, this property is 1:1 with eventTriggeredTimes.
    triggerSum?: number;

    // Eg. if event is tracking resources spent, a value of 3 = trigger this event every 3 resources spent.
    triggerFrequencyFromSum?: number;
    // Sources that were triggered from effect events cannot trigger this event
    disableTriggerFromProcs?: boolean;
    excludeEffectOwner?: boolean; // For onFriendlyAttacked, do not include the effect owner in the event triggers
};

export enum EFFECT_EVENT_KEYS {
    onAbility = "onAbility",
    onOffensiveAbility = "onOffensiveAbility",
    onDepleteAbility = "onDepleteAbility",
    onAttack = "onAttack",
    onDeath = "onDeath",
    onFriendlyDeath = "onFriendlyDeath",
    onHostileDeath = "onHostileDeath",
    onFriendlyKill = "onFriendlyKill", // When the effect owner or a friendly unit kills something
    onKill = "onKill", // When the effect owner personally gets the killing blow
    onReceiveAttack = "onReceiveAttack",
    onFriendlyReceiveAttack = "onFriendlyReceiveAttack",
    onReceiveDamage = "onReceiveDamage",
    onReceiveHealing = "onReceiveHealing",
    onReceiveArmor = "onReceiveArmor",
    onReceiveEffect = "onReceiveEffect",
    onApplyEffect = "onApplyEffect",
    onResourcesSpent = "onResourcesSpent",
    onResourcesGained = "onResourcesGained",
    onTurnStart = "onTurnStart",
    onTurnInProgress = "onTurnInProgress",
    onReceiveOverhealing = "onReceiveOverhealing",
    onTurnEnd = "onTurnEnd",
    onEnd = "onEnd", // When the effect ticks down and ends naturally, not when it is removed or dispelled
    onRemoved = "onRemoved", // When the effect is removed or dispelled
    onWaveStart = "onWaveStart",
    onWaveClear = "onWaveClear",
    onSummoned = "onSummoned",
    onHostileAbility = "onHostileAbility",
    onHostileSupportAbility = "onHostileSupportAbility",
    onHostileSummon = "onHostileSummon", // When a minion hostile to the effect owner is summoned
    onFriendlySummon = "onFriendlySummon", // When a minion friendly to the effect owner is summoned
    onArmorLoss = "onArmorLoss", // Whenever character loses armor -- this includes armor decay
    onDrawCard = "onDrawCard", // Player drew a card
    onAddCardToHand = "onAddCardToHand", // Player added cards from the card selection overlay
    onDeckCycle = "onDeckCycle", // Player's deck reset
    onBattleStart = "onBattleStart",
    onBattleEnd = "onBattleEnd",
    onMoveCardFromHandToDeck = "onMoveCardFromHandToDeck",
    onFriendlyMove = "onFriendlyMove",
}

type effectEventKeys = keyof typeof EFFECT_EVENT_KEYS;

export enum SCALING_VALUE_TYPES {
    FLAT = "flat",
    PERCENTAGE = "percentage",
}

export interface AbilityDamageReceived {
    abilityName: string;
    damage: number;
    type: SCALING_VALUE_TYPES;
}

export type Effect = { [key in effectEventKeys]?: EffectEventTrigger } & {
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
    allowMoveCardFromHandToDeck?: boolean;
    conditions?: Condition[];
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
    // Display stacks even if there is only one stack. Useful for temporary 1-stack effects which are not limited by duration.
    /** @see ironBody */
    alwaysDisplayStacks?: boolean;
    // If this effect came from an item, provide the item name here (doubles as the item ID)
    itemSource?: string;
    /**
     * @see chessPiece
     */
    allowFriendlyMovement?: boolean;
    // Brick vs. Steel Ore effect: Brick wins
    maxDamageTaken?: number;
    // Effect owner cannot use abilities with these action types. Eg. Whip causes Snails to be unable to Loaf.
    disableAbilities?: ACTION_TYPES[];
    // If true, attacks become RANDOM_HOSTILE targeting.
    hitRandomTarget?: boolean;
    portraitAnimationOptions?: {
        fadeInOut?: boolean; // Exclusive with combatant portrait animations (you can only have one animation).
    };
    extendEffectDuration?: {
        amount: number;
        filters?: { property: string; comparator: "includes" | "eq"; value: any }[];
    };
};

export type CombatEffect = Effect & {
    id: string;
    uptime: number;
    applierId?: string;
};

export interface Minion {
    name: string;
    image: string;
    description?: string;
    imageOptions?: {
        filter?: string;
        animation?: "float";
    };
    maxHP: number;
    HP?: number;
    armor?: number;
    abilities?: Ability[];
    effects?: (Effect | CombatEffect)[];
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
    comparator?: "eq" | "lt" | "gt" | "not" | "modulo" | "includes";
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
    BUFFS = "buffs",
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

export interface SelectCards {
    type: SELECT_CARD_TYPES;
    cards?: Ability[];
    filters?: ACTION_TYPES[];
    effects?: AbilityEffect[];
    maxAmount?: number;
}

export enum MORPH_MINION_MODIFIERS {
    SUM = "sum",
    DIVIDE_EVENLY = "divide-evenly",
    MULTIPLY = "multiply", // This is hard-coded to be 1.5x. Woohoo.
}

export enum MORPH_TYPES {
    /** For each minion, transform it to another minion */
    MAP = "map",
    /** Replace targeted minions with one or more minions */
    MERGE = "merge",
}

export interface Morph {
    type: MORPH_TYPES;
    resurrect?: boolean; // Can be cast on dead targets
    minions: {
        minion: Minion | string; // Minion object or a string name
        positionIndex?: number; // Only applicable for MORPH_TYPES.MERGE (place the new minion in a specific index on the board)
        conditions?: Condition[]; // Morph x minion to y minion if it meets this condition (otherwise, nothing happens to x minion)
        storeSummoner?: true; // This minion takes the place of its summoner. When killed, the summoner will reappear in its place.
    }[];
    modifiers?: {
        HP?: MORPH_MINION_MODIFIERS;
        maxHP?: MORPH_MINION_MODIFIERS;
    };
}

export type Action = {
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
    /** Only applicable to target type RANDOM or numTargets configured. If not supplied, it's 0. */
    targetArea?: number;
    // Hits random extra targets within targetArea
    numTargets?: number;
    effects?: (string | Effect)[]; // If a string (name of effect) is provided, attempt to look up the corresponding effect
    description?: string;
    movement?: number;
    resources?: number;
    /** Displaces characters toward the target index */
    vacuum?: number;
    /** Effects on the cards in a particular pile */
    applyAbilityEffects?: {
        // How many cards should be affected. Randomly chosen, eg. 2 will pick 2 random cards in that pile to apply the affect on.
        // If not supplied, it's all the cards (you may want this when applying an effect to all cards in hand, for example).
        amount?: number;
        pile: "hand" | "deck" | "discard" | "deplete";
        abilityEffects: AbilityEffect[];
    };
    /** Adds cards to your current hand */
    addCards?: Ability[];
    addCardsToDeck?: Ability[];
    /** Adds cards to your current discard pile */
    addCardsToDiscard?: Ability[];
    moveCards?: {
        from: "hand" | "deck" | "discard" | "deplete";
        to: "hand" | "deck" | "discard" | "deplete";
        amount: number;
    };
    drawCards?: {
        amount: number;
        effects?: AbilityEffect[];
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
        bonus?: Bonus;
    };
    /** Percentage of armor on the target to remove */
    destroyArmor?: number;
    resurrect?: boolean;
    playbackTime?: number;
    summon?: {
        // If more than one minion is provided, chooses one randomly.
        minion: (Minion | string)[];
        // Which specific index position on the friendly side of the board to summon the minion. If the slot is occupied, this will fail quietly. If not provided, a random valid slot will be chosen.
        positionIndex?: number;
        // Place the summoned minion next to the summoner if there is space. If not, finds the next closest space.
        placement?: "adjacent";
        // If true, there cannot be more than one minion with the same name on the board
        noDuplicateMinions?: boolean;
    }[];
    // Mutate one or more combatants/minions to become one or more different combatants/minions.
    morph?: Morph;
    // When cast on a combatant that has attack power, that combatant will attack randomly.
    induceCombatantAttack?: boolean;
    induceCombatant?: {
        mode: "random" | "left-to-right" | "right-to-left";
        action: Action;
    };
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
        brightness?: number; // Value of 1 is normal brightness
        // Bounces between numTargets within targetArea.
        ricochet?: boolean;
        disableScreenShake?: boolean; // Only applicable for stomp
    };
    // Secondary effects to apply to another party. Eg. if the action is an attack but it also heals the actor.
    secondaryAction?: {
        target: "actor";
        area?: number;
        damage?: number;
        resources?: number;
        healing?: number;
        multiplier?: Multiplier;
        flatDamage?: number;
        conditions?: Condition[];
        effects?: Effect[];
        returnParentCardToHand?: boolean;
        armor?: number;
        removeEffects?: string[];
        isPriority?: boolean; // If true, play this before the main ability
        excludePrimaryTarget?: boolean;
    };
    /** Wild magic */
    autoCastAbilities?: AutoCastAbility;
    /** Combatant runs away (turns null) */
    retreat?: boolean;
};

export interface AddCardUpgradeOptions {
    // If true, the cards of addCards should be upgraded
    upgradeLevels?: number;
    // The add cards array should have n extra cards added to it
    appendCards?: number;
}

export interface AbilityUpgrade {
    description?: string;
    preemptive?: boolean;
    resourceCost?: number;
    depletedOnUse?: boolean;
    minion?;
    addActions?: {
        // If true, instead of .pushing to actions, the action will be prepended
        prepend?: boolean;
        actions: Action[];
    };
    // Eg. the first item maps to action[0]
    actions?: {
        // Numbers should be amount to increase by, not absolute value
        damage?: number;
        healing?: number;
        secondaryDamage?: number;
        resources?: number;
        armor?: number;
        numTargets?: number;
        // If provided, maps to action[0].effects[0]
        effects?: {
            [key in EFFECT_EVENT_KEYS]?: {
                ability?;
            };
        }[] &
            { attackPower?: number; stacks?: number; duration?: number }[];
        drawCards?: {
            amount?: number;
            effects?: AbilityEffect[];
            filters?: ACTION_TYPES[]; // Force it to draw a certain type of card
        };

        area?: number;

        selectCards?;
        bonus?: { [key in keyof Bonus]?: Bonus[key] };
        radiate?;
        multiplier?;

        addCardOptions?: AddCardUpgradeOptions;
        addCardsToDeckOptions?: AddCardUpgradeOptions;
        selectCardOptions?: AddCardUpgradeOptions; // Only applicable if the card has selectCards.cards
        autoCastAbilities?;
        secondaryAction?;
    }[];
}

export interface AbilityEvent {
    abilityEffects?: AbilityEffect[];
    ability?: Ability;
}

export interface Ability {
    name: string;
    resourceCost?: number | "x"; // "x" means to expend the remainder of your resources
    actions: Action[];
    minion?: Minion;
    minionOptions?: {
        // Enables playing a minion directly over top of another minion, killing the previous one.
        // The minion can be played for free in this manner.
        tributeSummon?: boolean;
    };
    image?: string;
    channelDuration?: number;
    rarity?: RARITIES;
    castTime?: number;
    description?: string;
    /** Escape hatch to depend on description only if the body text generator is unmanageable */
    overrideBodyText?: boolean;
    /** AKA ephemeral -- ability disappears after your turn or on use */
    removeAfterTurn?: boolean;
    // If true, this card cannot be played.
    unplayable?: boolean;
    reusable?: boolean;
    depletedOnUse?: boolean;
    dialog?: string;
    // A map of properties to increment/decrement/add/remove on the ability object when upgraded.
    upgrades?: AbilityUpgrade[];
    /** The upgrade level of this ability; assumed to be 1 (baseline) if not provided */
    level?: number;
    /** On battle start, this ability is shuffled to the top of your deck. */
    preemptive?: boolean;
    /** This is treated as a prerequisite to using the ability */
    selectCards?: SelectCards;
    /** Prerequisite to use the ability at all */
    conditions?: Condition[];
    effectsWhileOwned?: Effect[];
    /** Something that happens when an ability is used (not necessarily this one) */
    onAbilityUse?: AbilityEvent;
    /** Something that happens when you draw this card. Currently does NOT apply abilityEffects */
    onDraw?: AbilityEvent;
    /** Something that happens when this card leaves your hand (not necessarily discarded) */
    onLeaveHand?: AbilityEvent;
    hideResourceCostIcon?: boolean;
}

/**
 * Includes resourceCost/damage changes that only last for the duration that the ability exists in the player's hand
 */
export interface CombatAbility extends Ability {
    instanceId?: string;
    effects?: AbilityEffect[];
}

export enum ACTION_TYPES {
    ATTACK = "attack",
    RANGE_ATTACK = "ranged-attack",
    EFFECT = "effect",
    NONE = "none",
    MOVEMENT = "movement",
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
    CONSUMABLE = "consumable", // Eat a consumable
}

/**
 * Effects modifying the ability
 */
export interface AbilityEffect {
    name?: string; // Doubles as an ID for maxApplications
    applierId?: string;
    resourceCost?: number;
    damage?: number;
    removeParentCardAfterTurn?: boolean; // Effectively adds the 'ephemeral' keyword on the parent ability
    upgradedByLevels?: number;
    maxApplications?: number;
    // Whether this effect should be cleared if the card is discarded. True by default.
    removeOnDiscard?: boolean;
}

export enum SELECT_CARD_TYPES {
    COPY_FROM_HAND = "copy",
    DISCOVER_FROM_CLASS = "discover-from-class",
    SEARCH_DECK = "search-deck",
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
    upgradeLevels?: number;
}

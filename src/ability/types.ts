export enum TARGET_TYPES {
    HOSTILE = "hostile",
    SELF = "self",
    FRIENDLY = "friendly",
    RANDOM_HOSTILE = "random-hostile",
    RANDOM_FRIENDLY = "random-friendly",
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
}

export enum EFFECT_CLASSES {
    BUFF = "buff",
    DEBUFF = "debuff",
}

export enum CONDITION_TARGETS {
    TARGET = "target",
    ACTOR = "actor",
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
    conditions?: Condition[]; // OR if multiple conditions are present
    parentEffect?: {
        // Update the parent effect's stats
        damage?: number;
    };

    targetType?: TRIGGER_TARGET_TYPES;
    // Stat changes that do not trigger an 'action'
    effects?: Effect[];
    armor?: number;
    healing?: number;
    drawCards?: {
        amount: number;
        effects?: AbilityEffects;
    };
    resurrect?: boolean;
    resources?: number;
    damage?: number;
    randomOptions?: {
        numTargets?: number;
        targetType: TARGET_TYPES.RANDOM_HOSTILE | TARGET_TYPES.RANDOM_FRIENDLY;
    };

    usableWhileStunned?: boolean;
    // If you are providing an ability to be applied to a target, you probably don't want to do any of the other properties.
    // (Ability actions already have their own targeting and effects and whatnot)
    ability?: Ability;
    multiplier?: Multiplier;
}

export enum EFFECT_EVENT_KEYS {
    onAbility = "onAbility",
    onAttack = "onAttack",
    onDeath = "onDeath",
    onFriendlyDeath = "onFriendlyDeath",
    onHostileDeath = "onHostileDeath",
    onReceiveAttack = "onReceiveAttack",
    onReceiveDamage = "onReceiveDamage",
    onReceiveHealing = "onReceiveHealing",
    onReceiveArmor = "onReceiveArmor",
    onReceiveEffect = "onReceiveEffect",
    onEffectRemoved = "onEffectRemoved",
    onResourcesSpent = "onResourcesSpent",
    onTurnStart = "onTurnStart",
    onTurnEnd = "onTurnEnd",
    onEnd = "onEnd",
    onWaveStart = "onWaveStart",
    onWaveClear = "onWaveClear",
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
    icon?: string;
    attackAreaIncrease?: number;
    basicAttackAreaIncrease?: number;
    isAuraEffect?: boolean;
    resourcesPerTurn?: number;
    drawCardsPerTurn?: number;
    /** Area causes it to affect surrounding targets like an aura */
    area?: number;
    /** If true, effect has no effect on its owner */
    excludeEffectOwner?: boolean;
    immunities?: EFFECT_TYPES[];
    preventArmorDecay?: boolean;
    armorReceived?: number; // Increased armor received, that is; ditto for below
    attackDamageReceived?: number;
    healingReceived?: number;
    /** Healing received when hitting an enemy. Scales with the number of enemies hit */
    lifeOnHit?: number;
    /** Damage to reflect back to attackers */
    thorns?: number;
    lifeOnKill?: number;
    abilityDamageReceived?: AbilityDamageReceived[];
    /** Only a single instance of this effect type can be on the character */
    unique?: boolean;
    conditions?: Condition[];
    onAbility?: EffectEventTrigger;
    onAttack?: EffectEventTrigger;
    onDeath?: EffectEventTrigger;
    onFriendlyDeath?: EffectEventTrigger;
    onHostileDeath?: EffectEventTrigger;
    onReceiveAttack?: EffectEventTrigger;
    onReceiveDamage?: EffectEventTrigger;
    onReceiveHealing?: EffectEventTrigger;
    onReceiveArmor?: EffectEventTrigger;
    onReceiveEffect?: EffectEventTrigger;
    onResourcesSpent?: EffectEventTrigger;
    onTurnStart?: EffectEventTrigger;
    onTurnEnd?: EffectEventTrigger;
    onEnd?: EffectEventTrigger;
    onWaveStart?: EffectEventTrigger;
    onWaveClear?: EffectEventTrigger;
    onEffectRemoved?: EffectEventTrigger;
    canBeSilenced?: boolean;
    applyEffects?: Effect[]; // Additional effects that periodically trigger from this effect
    /** How many turns it should cool down before triggering again */
    turnsTriggerFrequency?: number;
    skillBonus?: {
        skill: string;
        damage: number;
    }[];
    onlyVisibleWhenProcced?: boolean;
    mesosGained?: number; // Percentage; 1 = 100%
    maxHP?: number;
    dotDamageIncrease?: number;
    onEncounterEnd?: {
        abilityChoices?: number;
    };
    onCamp?: {
        abilityChoices?: number;
        healing?: number;
    };
}

export interface CombatEffect extends Effect {
    id: string;
    uptime: number;
    applierId?: string;
}

export interface Aura extends Effect {
    area?: number;
}

export interface Minion {
    name: string;
    image: string;
    maxHP: number;
    HP?: number;
    armor?: number;
    abilities?: Ability[];
    damage?: number;
    effects?: Effect[];
    resources?: number;
    /** Enemy basic attack. If not provided, one will be generated. */
    attack?: Ability;
    /** Actions to perform when this minion has been summoned */
    onSummon?: Action[];
    isBoss?: boolean;
    mesos?: number;
}

export interface Multiplier {
    type: MULTIPLIER_TYPES;
    calculationTarget?: CONDITION_TARGETS;
    // Eg. if the type is maxHP, pass a percentage (number in range 0 <= 1) of the maxHP to scale from
    // Eg. if the type is ABILITIES_WITH_NAME, give the name value here
    value?: string | number;
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
    /** Equals | Less than | Greater than -- Only used in pass/fail check */
    comparator?: "eq" | "lt" | "gt";

    /** Unique effects, not stacks */
    numDebuffs?: number;
    numBuffs?: number;
    hasEffectType?: EFFECT_TYPES[];
    hasEffectClass?: EFFECT_CLASSES.BUFF | EFFECT_CLASSES.DEBUFF;
    /** Unique effects, not stacks */
    numEffects?: number;
    /** This should be a decimal value up to 1 */
    healthPercentage?: number;
    armor?: number;
    /** Whether the name of the target matches the condition. This is always an "includes" check: */
    characterName?: string;
    calculationTarget: CONDITION_TARGETS.ACTOR | CONDITION_TARGETS.TARGET | TRIGGER_TARGET_TYPES;
}

export enum MULTIPLIER_TYPES {
    FLAT = "flat", // Take the value as-is
    ATTACKS_MADE_IN_TURN = "attacksMadeInTurn",
    ARMOR = "armor",
    // This is for players only; count the number of cards they own with a particular name
    ABILITIES_WITH_NAME = "abilitiesWithName",
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
}

export interface Radiate {
    damage?: number;
    area?: number;
    effects?: Effect[];
}

export interface SelectCards {
    type: SELECT_CARD_TYPES;
    filters?: ACTION_TYPES[];
    effects?: AbilityEffects;
}

export enum MORPH_MINION_MODIFIERS {
    SUM = "sum",
    DIVIDE_EVENLY = "divide-evenly",
}

export interface Action {
    damage?: number;
    secondaryDamage?: number;
    type: ACTION_TYPES;
    healing?: number;
    armor?: number;
    target?: TARGET_TYPES;
    area?: number;
    /** Only applicable to target type RANDOM or ricochet. If not supplied, all targets on one side are eligible. */
    targetArea?: number;
    numTargets?: number;
    // Bounces between numTargets within targetArea
    ricochet?: boolean;
    effects?: Effect[];
    description?: string;
    movement?: number;
    resources?: number;
    /** Displaces characters toward the target index */
    vacuum?: number;
    /** Effects on the cards currently in the hand */
    currentHandEffects?: AbilityEffects;
    /** Adds cards to your current hand */
    addCards?: Ability[];
    /** Adds cards to your current discard pile */
    addCardsToDiscard?: Ability[];
    drawCards?: {
        amount: number;
        effects?: AbilityEffects;
    };
    selectCards?: SelectCards;
    icon?: string; // Used as a projectile
    bonus?: Bonus;
    multiplier?: Multiplier;
    animation?: ANIMATION_TYPES;
    conditions?: Condition[];
    excludePrimaryTarget?: boolean;
    /** Radiates damage/effects to opponents on the other side of the board. */
    radiate?: {
        damage?: number;
        area?: number;
        effects?: Effect[];
    };
    /** Percentage of armor on the target to remove */
    destroyArmor?: number;
    resurrect?: boolean;
    playbackTime?: number;
    summon?: {
        // If more than one minion is provided, chooses one randomly.
        minion: Minion[];
        // Which position on the friendly side of the board to summon the minion. If the slot is occupied, this will fail quietly. If not provided, a random valid slot will be chosen.
        positionIndex?: number;
    }[];
    // Mutate one or more combatants/minions to become one or more different combatants/minions.
    morph?: {
        minions: {
            minion: Minion | string; // Minion object or a string name
            positionIndex?: number;
        }[];
        modifiers: {
            HP: MORPH_MINION_MODIFIERS;
        };
    };
    // When cast on a combatant that has attack power, that combatant will attack randomly.
    induceCombatantAttack?: boolean;
}

export interface Ability {
    name: string;
    resourceCost?: number | "x"; // "x" means to expend the remainder of your resources
    actions: Action[];
    minion?: Minion;
    image?: string;
    channelDuration?: number;
    castTime?: number;
    description?: string;
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
}

export enum ANIMATION_TYPES {
    // 'icon' travels from actor to target spinning
    ONE_WAY_SPIN = "one-way-spin",
    // 'icon' travels from actor to target and back
    YOYO = "yoyo",
    ONE_WAY = "one-way",
    ONE_WAY_SIDEWINDER = "one-way-sidewinder",
    RICOCHET = "ricochet",
    DROP = "drop",
    // This is the same as ACTION_TYPES.EFFECT
    CAST = "cast",
}

export interface AbilityEffects {
    resourceCost?: number;
    damage?: number;
    removeAfterTurn?: boolean;
}

export enum SELECT_CARD_TYPES {
    COPY_FROM_HAND = "copy",
    DISCOVER_FROM_CLASS = "discover-from-class",
    DEPLETE_FROM_HAND = "deplete",
}

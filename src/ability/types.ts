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

export interface TriggerEffect {
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
}

export interface EffectEventTrigger {
    removeEffect?: boolean; // Remove this effect from its owner after completion of the event
    conditions?: EffectCondition[]; // OR if multiple conditions are present
    parentEffect?: {
        // Update the parent effect's stats
        damage?: number;
    };
    // Who should receive the proc that was triggered?
    // externalParty: for example, the target being attacked, or the target attacking the owner of this effect
    // effectApplier: the combatant who applied the effect
    // random: this can be multiple targets
    targetType?: "effectOwner" | "externalParty" | "effectApplier" | "random";
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

    // If you are providing actions to be applied to a target, you probably don't want to do any of the other properties.
    // (Actions already have their own targeting and effects and whatnot)
    actions?: Action[];
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

export interface Effect {
    name?: string;
    type: EFFECT_TYPES;
    class: EFFECT_CLASSES;
    // 0: lasts until the end of the current turn; 1: lasts until the end of the opponent's turn...
    duration?: number;
    damage?: number;
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
    damageReceived?: number;
    healingReceived?: number;
    /** Only a single instance of this effect type can be on the character */
    unique?: boolean;
    /** A percentage of damage will be returned as HP to the effect owner */
    leech?: number;
    conditions?: EffectCondition[];
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

interface Minion {
    // Merge with Combatant?
    name: string;
    image: string;
    maxHP: number;
    damage: number;
    effects?: Effect[];
    armor?: number;
    aura?: Aura;
}

export enum CONDITION_TYPE {
    INCREMENTING = "incrementing",
    DECREMENTING = "decrementing",
    FLAT = "flat",
}

export interface Multiplier {
    type: MULTIPLIER_TYPES;
    calculationTarget: "actor" | "target";
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

    /**
     * A multiplier on the bonus amount
     */
    multiplier?: Multiplier;

    /**
     * Conditions to pass for the bonus to apply.
     * Multiple conditions are evaluated as "OR".
     */
    conditions?: AbilityCondition[];
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
}

export interface AbilityCondition extends Condition {
    calculationTarget: "actor" | "target";
}

export interface EffectCondition extends Condition {
    calculationTarget: "effectOwner" | "externalParty";
}

export enum MULTIPLIER_TYPES {
    ATTACKS_MADE_IN_TURN = "attacksMadeInTurn",
    ARMOR = "armor",
    // This is for players only; count the number of cards they own with a particular name
    ABILITIES_WITH_NAME = "abilitiesWithName",
    MAX_HP = "maxHP",
    DEBUFFS = "debuffs",
    BLEEDS = "bleeds",
}

export interface Radiate {
    damage?: number;
    area?: number;
    effects?: Effect[];
}

export interface Action {
    damage?: number;
    secondaryDamage?: number;
    type: ACTION_TYPES;
    healing?: number;
    armor?: number;
    target?: TARGET_TYPES;
    area?: number;
    /** Only applicable to target type RANDOM. If not supplied, all targets on one side are eligible. */
    targetArea?: number;
    numTargets?: number;
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
    icon?: string; // Used as a projectile
    bonus?: Bonus;
    multiplier?: Multiplier;
    animation?: ANIMATION_TYPES;
    conditions?: AbilityCondition[];
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
}

export interface Ability {
    name: string;
    resourceCost?: number;
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
    level?: number; // The level of this ability; assumed to be 1 if not provided
}

/**
 * Includes resourceCost/damage changes that only last for the duration that the ability exists in the player's hand
 */
export interface HandAbility extends Ability {
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
}

export enum ANIMATION_TYPES {
    // 'icon' travels from actor to target spinning
    ONE_WAY_SPIN = "one-way-spin",
    // 'icon' travels from actor to target and back
    YOYO = "yoyo",
    ONE_WAY = "one-way",
}

export interface AbilityEffects {
    resourceCost?: number;
    damage?: number;
}

export enum TARGET_TYPES {
    HOSTILE = "hostile",
    SELF = "self",
    FRIENDLY = "friendly",
    RANDOM_HOSTILE = "random-hostile",
}

export enum EFFECT_TYPES {
    NONE = "none",
    STUN = "stun",
    BLEED = "bleed",
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

export interface EffectEventTrigger {
    removeEffect?: boolean;
    conditions?: EffectCondition[]; // OR if multiple conditions are present
    parentEffect?: {
        // Update the parent effect's stats
        damage?: number;
    };
    effectOwner?: {
        // Stat changes to apply to the target (owner of this effect)
        effects?: Effect[];
        armor?: number;
        healing?: number;
    };
    externalParty?: {
        // Stat changes to apply to the character who triggered this event
        effects?: Effect[];
    };
}

export interface Effect {
    name?: string;
    type: EFFECT_TYPES;
    class: EFFECT_CLASSES;
    // 0: lasts until the end of the current turn; 1: lasts until the end of the opponent's turn...
    duration?: number;
    damage?: number;
    description?: string;
    healthPerResourcesSpent?: number;
    icon?: string;
    thorns?: number;
    attackAreaIncrease?: number;
    basicAttackAreaIncrease?: number;
    isAuraEffect?: boolean;
    healingPerTurn?: number;
    armorPerTurn?: number;
    resourcesPerTurn?: number;
    immunities?: EFFECT_TYPES[];
    preventArmorDecay?: boolean;
    armorReceived?: number;
    damageReceived?: number;
    healingReceived?: number;
    /** Only a single instance of this effect type can be on the character */
    unique?: boolean;
    /** The target for this is random */
    healTargetPerTurn?: number;
    damageTargetPerTurn?: number;
    /** A percentage of damage will be returned as HP to the effect owner */
    leech?: number;
    conditions?: EffectCondition[];
    onAttack?: EffectEventTrigger;
    onFriendlyKilled?: EffectEventTrigger;
    onReceiveAttack?: EffectEventTrigger;
    onReceiveDamage?: EffectEventTrigger;
    onReceiveEffect?: EffectEventTrigger;
    canBeSilenced?: boolean;
    applyEffects?: Effect[]; // Additional effects that periodically trigger from this effect
    /** How many turns it should cool down before triggering again */
    turnsTriggerFrequency?: number;
    /** How many turns was this effect up on the character */
    uptime?: number;
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
    name?: string;
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
}

export interface Action {
    damage?: number;
    secondaryDamage?: number;
    type: ACTION_TYPES;
    healing?: number;
    armor?: number;
    target?: TARGET_TYPES;
    area?: number;
    effects?: Effect[];
    description?: string;
    movement?: number;
    resources?: number;
    /** Displaces characters toward the target index */
    vacuum?: number;
    /** Effects on the cards currently in the hand */
    cards?: {
        effects: AbilityEffects;
    };
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
    area?: number;
    removeAfterTurn?: boolean;
    reusable?: boolean;
    depletedOnUse?: boolean;
    /** An effect applied to this ability when another ability is used */
    onAbilityUse?: {
        resourceCost?: number;
    };
    dialog?: string;
}

/**
 * Includes resourceCost/damage changes that only last for the duration that the ability exists in the player's hand
 */
export interface HandAbility extends Ability {
    effects: AbilityEffects;
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
    // 'icon' travels from actor to target
    ONE_WAY = "one-way",
    // 'icon' travels from actor to target and back
    YOYO = "yoyo",
}

export interface AbilityEffects {
    resourceCost?: number;
    damage?: number;
}

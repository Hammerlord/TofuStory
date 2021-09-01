export enum TARGET_TYPES {
    HOSTILE = "hostile",
    SELF = "self",
    FRIENDLY = "friendly",
    RANDOM_HOSTILE = "random-hostile",
}

export enum EFFECT_TYPES {
    STUN = "stun",
    BLEED = "bleed",
    FREEZE = "freeze",
    BUFF = "buff",
    DEBUFF = "debuff",
}

export interface EffectCondition {
    types: EFFECT_TYPES[];
    comparator: "eq";
}

export interface Effect {
    name?: string;
    type: EFFECT_TYPES;
    // 0: lasts until the end of the current turn; 1: lasts until the end of the opponent's turn...
    duration?: number;
    damage?: number;
    description?: string;
    healthPerResourcesSpent?: number;
    icon?: string;
    thorns?: number;
    isAuraEffect?: boolean;
    healingPerTurn?: number;
    armorPerTurn?: number;
    immunities?: EFFECT_TYPES[];
    armorReceived?: number;
    damageReceived?: number;
    healingReceived?: number;
    onReceiveEffect?: {
        conditions?: EffectCondition[]; // OR if multiple conditions are present
        target?: {
            // Stat changes to apply to the target (owner of this effect)
            effects?: Effect[];
        };
        actor?: {
            // Stat changes to apply to the character who triggered this event
            effects?: Effect[];
        };
    };
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
    scale?: {
        calculationTarget: "actor" | "target";
        basedOn: "numDebuffs" | "numBuffs";
        max?: number;
    };

    /**
     * Conditions to pass for the bonus to apply.
     * Multiple conditions are evaluated as "OR".
     */
    conditions?: Conditions[];
}

export interface Conditions {
    calculationTarget: "actor" | "target";
    /** Equals | Less than | Greater than -- Only used in pass/fail check */
    comparator?: "eq" | "lt" | "gt";

    /** Unique effects, not stacks */
    numDebuffs?: number;
    numBuffs?: number;
    hasEffectType?: EFFECT_TYPES[];
    /** Unique effects, not stacks */
    numEffects?: number;
    healthPercentage?: number;
}

export interface Action {
    damage?: number;
    type: ACTION_TYPES;
    healing?: number;
    armor?: number;
    target?: TARGET_TYPES;
    area?: number;
    effects?: Effect[];
    description?: string;
    movement?: number;
    resources?: number;
    addCards?: Ability[];
    icon?: string; // Used as a projectile
    bonus?: Bonus;
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
}

export enum ACTION_TYPES {
    ATTACK = "attack",
    RANGE_ATTACK = "ranged-attack",
    EFFECT = "effect",
    NONE = "none",
    MOVEMENT = "movement",
}

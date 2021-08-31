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

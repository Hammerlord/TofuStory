export enum TARGET_TYPES {
    HOSTILE = "hostile",
    SELF = "self",
    FRIENDLY = "friendly",
}

export enum EFFECT_TYPES {
    STUN = "stun",
    BLEED = "bleed",
    FREEZE = "freeze",
    BUFF = "buff",
}

export interface EffectCondition {
    types: EFFECT_TYPES[];
    comparator: 'eq';
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
        target?: { // Stat changes to apply to the target (owner of this effect)
            effects?: Effect[];
        },
        actor?: { // Stat changes to apply to the character who triggered this event
            effects?: Effect[];
        }
    },
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
    healing?: number;
    armor?: number;
    target?: TARGET_TYPES;
    area?: number;
    effects?: Effect[];
    description?: string;
    movement?: number;
    resources?: number;
    /** The number of cards to draw. Only applicable to player */
    cards?: number;
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
}

export enum ACTION_TYPES {
    DAMAGE = "damage",
    CASTING = "casting",
    EFFECT = "effect",
    ARMOR = "armor",
    NONE = "none",
    MOVEMENT = "movement",
}

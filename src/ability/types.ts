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

export interface Effect {
    type: EFFECT_TYPES;
    // 0: lasts until the end of the current turn; 1: lasts until the end of the opponent's turn...
    duration?: number;
    damage?: number;
    healthPerResourcesSpent?: number;
}

interface Minion {
    name: string;
    image: string;
    maxHP: number;
    damage: number;
    effects?: Effect[];
    armor?: number;
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
}

export enum ACTION_TYPES {
    DAMAGE = "damage",
    CASTING = "casting",
    ARMOR = "armor",
    NONE = "none",
    MOVEMENT = "movement",
}

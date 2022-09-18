import { Combatant } from "./../character/types";
import { Ability, Action, CombatEffect } from "./../ability/types";
export interface BattleNotification {
    id: string; // For rerendering the same message if applicable
    text: string;
    severity: "warning" | "info" | "error";
}

export enum BATTLEFIELD_SIDES {
    /** Enemies are the player's opponents */
    ENEMY_SIDE = "enemySide",
    PLAYER_SIDE = "playerSide",
}

/**
 * The results of an action being applied.
 */
export interface Event {
    action?: Action;
    playerSide: (Combatant | null)[];
    enemySide: (Combatant | null)[];
    actorId?: string;
    selectedIndex?: number;
    targetSide?: BATTLEFIELD_SIDES;
    id: string;
    playbackTime: number;
}

export interface EventGroup {
    events: Event[];
    ability?: Ability;
}

export interface TriggerSource {
    source: Action | CombatEffect | Ability;
    type: "ability" | "effect" | "proc";
    actorId?: string;
    targetId?: string;
}

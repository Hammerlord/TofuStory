import { Combatant } from "./../character/types";
import { Ability, Action } from "./../ability/types";
export interface BattleNotification {
    id: string; // For rerendering the same message if applicable
    text: string;
    severity: "warning" | "info" | "error";
}

export enum BATTLEFIELD_SIDES {
    /** Enemies are the player's opponents */
    ENEMIES = "enemies",
    /** Allies are the player side */
    ALLIES = "allies",
}

/**
 * The results of an action being applied.
 */
export interface Event {
    action?: Action;
    updatedAllies: Combatant[];
    updatedEnemies: Combatant[];
    actorId?: string;
    selectedIndex?: number;
    targetSide?: BATTLEFIELD_SIDES;
    id: string;
}

export interface EventGroup {
    events: Event[];
    ability?: Ability;
}

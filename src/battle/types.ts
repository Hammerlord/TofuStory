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
    allTargetIndices: number[];
    selectedIndex?: number;
    targetSide?: BATTLEFIELD_SIDES;
    id: string;
    playbackTime: number;
}

export interface EventGroup {
    events: Event[];
    ability?: Ability;
}

export enum TRIGGER_SOURCE_TYPES {
    ABILITY = "ability",
    EFFECT = "effect",
    // An extra effect or action triggered conditionally from another effect
    PROC = "proc",
}

/**
 * "What" triggered this action, effect, or proc to occur. For example:
 * - When triggering an action from an ability, the ability is the source (caused the action to occur)
 * - When triggering an onAttack event, the attack action is the source
 * - Events like "on turn end" were not caused by any action in particular and do not have a source
 */
export interface TriggerSource {
    source: Action | CombatEffect | Ability;
    type: TRIGGER_SOURCE_TYPES;
    actorId?: string;
    // The selected target during the action
    targetId?: string;
    // All targets affected by the action
    allTargetIds?: string[];
}

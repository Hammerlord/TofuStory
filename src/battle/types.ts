import { Combatant, Player } from "./../character/types";
import { Ability, Action, ActionOptionalProperties, CombatEffect, Minion } from "./../ability/types";
import { Item } from "../item/types";
import { UpdatedCombatantStats } from "./actions/getUpdatedStats";
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
    allTargetIndices?: number[];
    selectedIndex?: number;
    targetSide?: BATTLEFIELD_SIDES;
    id: string;
    playbackTime: number;
    actionParent?: Ability | Item;
    source?: TriggerSource;
    // Cards which have been added to hand/deck/discard/deplete, for animation purposes.
    newCards: Ability[];
    cardsAddedTo: "hand" | "deck" | "discard" | "deplete";
    newCombatants: Combatant[];
    displacements?: Displacement;
}

export interface EventGroup {
    events: Event[];
    ability?: Ability;
}

export enum TRIGGER_SOURCE_TYPES {
    ABILITY = "ability",
    ITEM = "item",
    EFFECT = "effect",
    NONE = "none",
}

/**
 * "What" triggered this action, effect, or proc to occur. For example:
 * - When triggering an action from an ability, the ability is the source (caused the action to occur)
 * - When triggering an onAttack event, the attack action is the source
 * - Events like "on turn end" were not caused by any action in particular and do not have a source
 */
export interface TriggerSource {
    source?: Action | CombatEffect | Ability | Item;
    // The amount of, eg. block, healing, overhealing done by the source
    statUpdate?: UpdatedCombatantStats;
    type: TRIGGER_SOURCE_TYPES;
    actorId?: string;
    // The selected target during the action (or the summoned minion)
    targetId?: string;
    // All targets affected by the action
    allTargetIds?: string[];
    // Logs ids of effects, etc. in the chain of event triggers. This is used to prevent duplicate procs in a single event chain.
    triggerHistory?: string[];
    isProc?: boolean;
    // Number of eg. resources to add to EffectEventTrigger.triggerSum
    trackSumAmount?: number;
}

export interface Wave {
    description?: string | string[] | JSX.Element | JSX.Element[];
    enemies: Minion[];
    presetDeck?: Ability[];
    generateEliteAffixes?: boolean;
    winCondition?: {
        defeatBoss?: boolean;
        surviveRounds?: number;
    };
}

export interface CombatantInfo {
    combatant: Combatant | Player;
    index?: number;
    friendly?: (Combatant | null)[];
    hostile?: (Combatant | null)[];
    friendlySide?: BATTLEFIELD_SIDES;
    hostileSide?: BATTLEFIELD_SIDES;
}

export enum BATTLE_TYPES {
    ENCOUNTER = "encounter",
    ELITE_ENCOUNTER = "eliteEncounter",
    BOSS = "bossEncounter",
}

// Logs combatants who moved or were displaced (eg. by vacuum) during an action. `from` and `to` are the index positions.
export type Displacement = { [combatantId: string]: { from: number; to: number; side: BATTLEFIELD_SIDES } };

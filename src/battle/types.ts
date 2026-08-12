import { ReactElement } from "react";
import { Item } from "../item/types";
import { Ability, Action, CardPileType, CombatEffect, Effect, Minion } from "./../ability/types";
import { Combatant, Player } from "./../character/types";
import { UpdatedCombatantStats } from "./actions/getUpdatedStats";
import { PlaybackCollector } from "./actions/playbackCollector";
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
    actorId?: string;
    allTargetIndices?: number[];
    selectedIndex?: number;
    targetSide?: BATTLEFIELD_SIDES;
    id: string;
    actionParent?: Ability | Item | Effect;
    source: TriggerSource;
    playerSide: (Combatant | null)[];
    enemySide: (Combatant | null)[];
    playbackTime?: number;
    statUpdates?: { [combatantId: string]: UpdatedCombatantStats };
    addCards?: {
        cards: Ability[];
        cardsAddedTo: CardPileType;
    }[];
    newCombatants: Combatant[];
    displacements?: Displacement;
}

export interface EventGroup {
    id: string; // UUID
    image?: string;
    events: Event[];
    name: string; // Equivalent to actionParent.name
    // The final state of the board after all the events
    playerSide: (Combatant | null)[];
    enemySide: (Combatant | null)[];
    playbackTime: number;
    // Cards which have been added to hand/deck/discard/deplete, for animation purposes.
    addCards: {
        cards: Ability[];
        cardsAddedTo: CardPileType;
    }[];

    newCombatants: Combatant[];
    displacements?: Displacement;
    // Aggregated stat updates of the events
    statUpdates?: { [combatantId: string]: UpdatedCombatantStats };
}

export enum TRIGGER_SOURCE_TYPES {
    ABILITY = "ability",
    ACTION = "action",
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
    isTribute?: boolean;
    // Number of eg. resources to add to EffectEventTrigger.triggerSum
    trackSumAmount?: number;
    // For ability previews, target indices should become determinate. (And not change every time the preview snapshot changes.)
    isPreviewMode?: boolean;

    // The playback collector is added here because the TriggerSource object already gets passed through many of the action branches;
    // otherwise we'd have to update params individually
    playbackCollector?: PlaybackCollector;
}

export interface Wave {
    description?: string | string[] | ReactElement | ReactElement[];
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

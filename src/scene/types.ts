import { Ability } from "../ability/types";
import { BATTLE_TYPES, Wave } from "../battle/types";
import { ActivityHistoryLog } from "../character/playerReducer";
import { Combatant, Player } from "../character/types";
import { Item } from "../item/types";
import { REGIONS } from "../Map/regions";

export enum SCENE_CONDITION_TYPES {
    INFAMY = "infamy",
    // Scene.id strings
    VISITED_SCENES = "visited-scenes",
    PLAYER_CLASS = "player-class",
    MESOS = "mesos",
}

export interface SceneCondition {
    type: SCENE_CONDITION_TYPES;
    // Includes is for array values
    comparator: "lt" | "gt" | "eq" | "includes";
    // The value of what the player class, etc. needs to be
    value: any;
}

export interface EventScene {
    id: string; // Scene ID to track which scenes you have visited
    script: ScriptNode[];
    repeatable?: boolean; // Does nothing right now
    // Array of conditions resolves with AND operator by default
    conditions?: SceneCondition[];
    disableTransition?: boolean; // If true, do not transition out on scene end
}

export interface SceneEncounter {
    addAbilities?: Ability[];
    waves: Wave[];
    disableCardRewards?: boolean;
    disableItemRewards?: boolean;
    overrideItemChoices?: Item[];
    type?: BATTLE_TYPES;
    backgroundMusic?: string;
    isTutorial?: boolean;
}

export interface Shop {
    merchant: {
        name: string;
    };
    hasDiscount?: boolean;
}

export interface ScriptConditions {
    battle?: {
        totalDamage?: number; // How much damage was dealt in the most recent battle. See Gachapon for an example of how this is used.
        totalKills?: number; // How many enemies were killed in the most recent battle. See perionDummies for an example of how this is used.
    };
    activityScore?: number; // A numeric score tracking how "well" the player did in the recent puzzle/activity. Depends on the activity.
    comparator?: "lt" | "eq" | "gt";
    items?: string[];
    mesos?: number;
    chance?: number;
}

export interface ScriptResponse {
    text: string;
    isExit?: boolean;
    encounter?: SceneEncounter;
    next?: ScriptNode[];
    infamy?: number;
    shop?: Shop;
    camp?: boolean;
    removeAbility?: boolean;
    upgradeCards?: number; // Number of cards to upgrade. Eligible cards will be chosen randomly.
    id?: string; // Scene ID to track which scenes you have visited
}

export interface ScriptNodeTreasure {
    isOpen?: boolean;
    isCursed?: boolean;
}

export interface ScriptNode {
    speaker?: {
        name: string;
        image: string;
    };
    scene?: ({ player }: { player: Player }) => JSX.Element;
    disableBackground?: boolean;
    background?: string;
    puzzle?: ({
        player,
        onComplete,
        onExit,
    }: {
        player: Player;
        onComplete: ({ success, infamy }?: ActivityHistoryLog) => void;
        onExit: () => void;
    }) => JSX.Element;
    treasureBox?: ScriptNodeTreasure;
    dialog: string[];
    responses?: ScriptResponse[];
    // Items given straight to the player. If amount < itemPool.length, that number of items will be selected randomly
    // If itemPool not supplied, all non-acquired equipment is used as the pool
    items?: {
        itemPool?: Item[];
        amount?: number;
    };

    itemChoices?: {
        // The pool of items that can be shown as options. If the items are already obtained, they will be replaced by unobtained items.
        items?: Item[];
        // How many different options the player can pick from
        numChoices: number;
        bonuses?: {
            rare: number;
            uncommon: number;
        };
        // If there are no suitable replacements, mesos will be given instead.
        disableItemReplacements?: boolean;
    };
    region?: REGIONS;
    loseItems?: string[];
    loseMesos?: number;
    // Select the batch of script nodes depending on which one passes conditions. The first one that passes is the one chosen.
    // TRICKY: If this is to compare the recent battle, this must come after the fight has concluded so that we can actually track that fight's metrics.
    conditionalNext?: { conditions: ScriptConditions[]; next: ScriptNode[] }[];
    infamy?: number;
}

export interface SceneProps {
    player?: Player;
    onComplete?: ({ success, infamy }?: { success?: boolean; infamy?: number }) => void;
}

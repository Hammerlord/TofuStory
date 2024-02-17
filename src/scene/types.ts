import { Ability } from "../ability/types";
import { BATTLE_TYPES, Wave } from "../battle/types";
import { Combatant } from "../character/types";
import { Item } from "../item/types";
import { REGIONS } from "../Map/regions";

export enum SCENE_CONDITION_TYPES {
    NOTOREITY = "notoreity",
    // Scene.id strings
    VISITED_SCENES = "visited-scenes",
    PLAYER_CLASS = "player-class",
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
    // Array of conditions resolves with AND operator by default
    conditions?: SceneCondition[];
}

export interface SceneEncounter {
    addAbilities?: Ability[];
    waves: Wave[];
    disableCardRewards?: boolean;
    itemRewards?: Item[];
    type?: BATTLE_TYPES;
}

export interface Shop {
    merchant: {
        name: string;
    };
    hasDiscount?: boolean;
}

export interface ScriptConditions {
    battleTotalDamage: number;
    comparator: "lt" | "eq" | "gt";
}

export interface ScriptResponse {
    text: string;
    isExit?: boolean;
    encounter?: SceneEncounter;
    next?: ScriptNode[];
    notoriety?: number;
    shop?: Shop;
    camp?: boolean;
    removeAbility?: boolean;
    id?: string; // Scene ID to track which scenes you have visited
}

export interface ScriptNode {
    speaker?: {
        name: string;
        image: string;
    };
    scene?: ({ player }: { player: Combatant }) => JSX.Element;
    // Do not fade to black if scene changes
    disableTransition?: boolean;
    background?: string;
    puzzle?: ({ player, onComplete }: { player: Combatant; onComplete: (success?: boolean) => void }) => JSX.Element;
    treasureBox?: boolean;
    dialog: string[];
    responses?: ScriptResponse[];
    items?: Item[];
    itemChoices?: {
        // The pool of items that can be shown as options. If the items are already obtained, they will be replaced by unobtained items.
        items?: Item[];
        // How many different options the player can pick from
        numChoices: number;
        bonuses?: {
            rare: number;
            uncommon: number;
        };
    };
    region?: REGIONS;
    loseItems?: string[];
    // Select the batch of script nodes depending on which one passes conditions. The first one that passes is the one chosen.
    // TRICKY: If this is to compare the recent battle, this must come after the fight has concluded so that we can actually track that fight's metrics.
    conditionalNext?: { conditions: ScriptConditions[]; next: ScriptNode[] }[];
}

export interface SceneProps {
    player?: Combatant;
    onComplete?: () => void;
}

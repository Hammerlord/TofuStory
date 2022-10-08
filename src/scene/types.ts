import { Ability, Minion } from "../ability/types";
import { Combatant } from "../character/types";
import { Item } from "../item/types";

export interface Scene {
    characters: string[]; // Character names to mark who you have interacted with
    script: ScriptNode[];
}

export interface ScriptResponse {
    text: string;
    isExit?: boolean;
    encounter?: {
        addAbilities?: Ability[];
        characters: string[];
        waves: {
            enemies: Minion[];
        }[];
    };
    next?: ScriptNode[];
    notoriety?: number;
    shop?: {
        merchant: {
            name: string;
        };
        hasDiscount?: boolean;
    };
}

export interface ScriptNode {
    speaker?: {
        name: string;
        image: string;
    };
    scene?: ({ player }: { player: Combatant }) => JSX.Element;
    background?: string;
    puzzle?: ({ player, onComplete }: { player: Combatant; onComplete: () => void }) => JSX.Element;
    dialog: string[];
    responses?: ScriptResponse[];
    items?: Item[];
    healthRecovery?: number; // Percentage
}

export interface NPC {
    character: string;
    scenes: {
        intro: Scene;
        fought: Scene;
        notorious: Scene;
        helped: Scene;
    };
}

export interface SceneProps {
    player?: Combatant;
    onComplete?: () => void;
}

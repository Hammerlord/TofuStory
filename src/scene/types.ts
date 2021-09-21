import { Enemy } from "../enemy/enemy";
import { Item } from "../item/types";

export interface Scene {
    characters: string[]; // Character names to mark who you have interacted with
    script: ScriptNode[];
    scene: ({ player }: { player: any }) => JSX.Element;
}

export interface ScriptResponse {
    text: string;
    isExit?: boolean;
    encounter?: {
        characters: string[];
        waves: {
            enemies: Enemy[];
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
    dialog: string[];
    responses?: ScriptResponse[];
    items?: Item[];
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

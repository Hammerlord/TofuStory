import { Enemy } from "../enemy/enemy";

export interface Scene {
    script: ScriptNode[];
    scene: ({ player }: { player: any }) => JSX.Element;
}

export interface ScriptResponse {
    text: string;
    isExit?: boolean;
    encounter?: {
        waves: {
            enemies: Enemy[];
        }[];
    };
    next?: ScriptNode[];
    notoriety?: number;
}

export interface ScriptNode {
    speaker?: {
        name: string;
        image: string;
    };
    dialog: string[];
    responses?: ScriptResponse[];
    items?: {
        name: string;
        image: string;
        HP?: number;
    }[];
}

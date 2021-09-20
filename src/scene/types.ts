import { Enemy } from "../enemy/enemy";
import { Item } from "../item/types";

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

export interface MerchantScenes {
    intro: Scene;
    robbed: Scene;
    notorious: Scene;
    helped: Scene;
}

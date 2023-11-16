import { Ability, Minion } from "../ability/types";
import { BATTLE_TYPES, Wave } from "../battle/types";
import { Combatant } from "../character/types";
import { Item } from "../item/types";
import { REGIONS } from "../Map/regions";

export interface Scene {
    characters: string[]; // Character names to mark who you have interacted with
    script: ScriptNode[];
}

export interface SceneEncounter {
    addAbilities?: Ability[];
    characters: string[];
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

export interface ScriptResponse {
    text: string;
    isExit?: boolean;
    encounter?: SceneEncounter;
    next?: ScriptNode[];
    notoriety?: number;
    shop?: Shop;
    camp?: boolean;
}

export interface ScriptNode {
    speaker?: {
        name: string;
        image: string;
    };
    scene?: ({ player }: { player: Combatant }) => JSX.Element;
    background?: string;
    puzzle?: ({ player, onComplete }: { player: Combatant; onComplete: (success?: boolean) => void }) => JSX.Element;
    dialog: string[];
    responses?: ScriptResponse[];
    items?: Item[];
    itemChoices?: {
        // The pool of items that can be shown as options. If not provided, it will select unobtained items
        items?: Item[];
        // How many different options the player can pick from
        numChoices: number;
    };
    region?: REGIONS;
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

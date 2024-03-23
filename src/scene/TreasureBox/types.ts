import { Player } from "../../character/types";
import { Item } from "../../item/types";

export interface PuzzleProps {
    onComplete: (payload?: PuzzleCompletionPayload) => void;
    completed?: boolean;
    onInteraction?: Function;
    player: Player;
}

export interface PuzzleCompletionPayload {
    success?: boolean;
    infamy?: number;
    score?: number;
    type?;
    items?: Item[];
}

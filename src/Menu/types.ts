import { Wave } from "./tutorial";
export enum PLAYER_CLASSES {
    WARRIOR = "Warrior",
}

export interface NPCTracker {
    fought: number;
    spoken: number;
    helped: number;
}

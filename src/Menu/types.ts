export enum PLAYER_CLASSES {
    WARRIOR = "Warrior",
}

export interface NPCTracker {
    fought: number;
    spoken: number;
    helped: number;
}

export enum WARRIOR_SECONDARY_JOBS {
    FIGHTER = "Fighter",
    DARK_KNIGHT = "Dark Knight",
    WHITE_KNIGHT = "White Knight",
}

export const SECONDARY_JOBS = {
    [PLAYER_CLASSES.WARRIOR]: WARRIOR_SECONDARY_JOBS,
};

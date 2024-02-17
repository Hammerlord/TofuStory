export enum PLAYER_CLASSES {
    WARRIOR = "Warrior",
    MAGICIAN = "Magician",
}

export enum WARRIOR_SECONDARY_JOBS {
    FIGHTER = "Fighter",
    DARK_KNIGHT = "Dark Knight",
    WHITE_KNIGHT = "White Knight",
}

export enum MAGICIAN_SECONDARY_JOBS {
    FIRE_POISON_MAGE = "Fire & Poison Mage",
    ICE_LIGHTNING_MAGE = "Ice & Lightning Mage",
    PRIEST = "Priest",
}

export const SECONDARY_JOBS = {
    [PLAYER_CLASSES.WARRIOR]: WARRIOR_SECONDARY_JOBS,
    [PLAYER_CLASSES.MAGICIAN]: MAGICIAN_SECONDARY_JOBS,
};

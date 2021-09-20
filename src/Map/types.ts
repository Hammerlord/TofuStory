import { Enemy } from "../enemy/enemy";
import { MerchantScenes } from "../scene/types";

export enum NODE_TYPES {
    ENCOUNTER = "encounter",
    EVENT = "event",
    RESTING_ZONE = "restingZone",
    SHOP = "shop",
}

export interface RouteNode {
    x: number;
    y: number;
    type: NODE_TYPES;
    difficulty?: ENCOUNTER_DIFFICULTY | ENCOUNTER_DIFFICULTY[];
    encounters?: Enemy[][];
    npc: {
        id: string;
        scenes: MerchantScenes;
    };
    //next: RouteNode[];
}

export interface MapEnemies {
    easy: Enemy[];
    normal: Enemy[];
    hard: Enemy[];
    hardest: Enemy[];
}

export enum ENCOUNTER_DIFFICULTY {
    EASY = "easy",
    NORMAL = "normal",
    HARD = "hard",
    ELITE = "elite",
    ELITE_TRIAD = "eliteTriad",
}

export enum ENEMY_DIFFICULTY {
    EASY = "easy",
    NORMAL = "normal",
    HARD = "hard",
    HARDEST = "hardest",
}

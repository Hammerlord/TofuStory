import { Enemy } from "../enemy/enemy";

export enum NODE_TYPES {
    encounter = "encounter",
    event = "event",
    restingZone = "restingZone",
}

export interface RouteNode {
    x: number;
    y: number;
    type: NODE_TYPES;
    difficulty?: ENCOUNTER_DIFFICULTY | ENCOUNTER_DIFFICULTY[];
    encounters: Enemy[][];
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

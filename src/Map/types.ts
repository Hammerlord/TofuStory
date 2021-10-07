import { Wave } from "./../Menu/tutorial";
import { Item } from "../item/types";
import { Enemy } from "./../enemy/enemy";
import { NPC } from "./../scene/types";
import KerningCity from "./KerningCity";
import LithHarbor from "./LithHarbor";

export enum NODE_TYPES {
    ENCOUNTER = "encounter",
    ELITE_ENCOUNTER = "eliteEncounter",
    EVENT = "event",
    RESTING_ZONE = "restingZone",
    SHOP = "shop",
    TOWN = "town",
    TREASURE = "treasure",
}

export interface RouteNode {
    x: number;
    y: number;
    type: NODE_TYPES;
    encounter?: Wave[];
    npc?: NPC;
    treasure?: {
        mesos?: number;
        items?: Item[];
        puzzle: Function;
    };
}

export interface MapEnemies {
    easy: Enemy[];
    normal: Enemy[];
    hard: Enemy[];
    hardest: Enemy[];
}

export enum ENEMY_DIFFICULTY {
    EASY = "easy",
    NORMAL = "normal",
    HARD = "hard",
    HARDEST = "hardest",
}

export interface Route {
    nodes: {
        x: number;
        y: number;
        type?: NODE_TYPES;
        town?: TOWNS;
    }[];
    initialPlayerPosition?: {
        x: number;
        y: number;
    };
    enemies?: MapEnemies;
    events?: NPC[];
    treasure?: {
        mesos?: { min: number; max: number };
        items?: Item[];
    }[];
    elites?: Enemy[];
    next?: Route[];
}

export enum TOWNS {
    HENESYS = "Henesys",
    KERNING = "Kerning City",
    LITH_HARBOUR = "Lith Harbour",
    PERION = "Perion",
    ELLINIA = "Ellinia",
}

export const TOWN_MAP = {
    [TOWNS.KERNING]: KerningCity,
    [TOWNS.LITH_HARBOUR]: LithHarbor,
};

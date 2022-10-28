import { Item } from "../item/types";
import { NPC } from "./../scene/types";
import KerningCity from "./KerningCity";
import LithHarbor from "./LithHarbor";
import { Minion } from "../ability/types";
import { Wave } from "../battle/types";

export enum NODE_TYPES {
    ENCOUNTER = "encounter",
    ELITE_ENCOUNTER = "eliteEncounter",
    BOSS = "bossEncounter",
    EVENT = "event",
    RESTING_ZONE = "restingZone",
    SHOP = "shop",
    TOWN = "town",
    TREASURE = "treasure",
}

export interface RouteNode {
    id?: string;
    x: number;
    y: number;
    type?: NODE_TYPES;
    encounter?: Wave[];
    npc?: NPC;
    treasure?: {
        mesos?: number;
        items?: Item[];
        puzzle: Function;
    };
    town?: TOWNS;
    regionBG?: string; // Path to background URL
}

export interface MapEnemies {
    easy: Minion[];
    normal: Minion[];
    hard: Minion[];
    hardest: Minion[];
}

export enum ENEMY_DIFFICULTY {
    EASY = "easy",
    NORMAL = "normal",
    HARD = "hard",
    HARDEST = "hardest",
}

export interface Route {
    nodes: RouteNode[];
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
    elites?: Minion[];
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

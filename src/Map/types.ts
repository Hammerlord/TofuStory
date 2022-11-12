import { Minion } from "../ability/types";
import { BATTLE_TYPES, Wave } from "../battle/types";
import { ElliniaBGImage, HenesysRegionBGImage, KerningCityBGImage, LithRegionBGImage, PerionRegionBGImage } from "../images";
import { Item } from "../item/types";
import { NPC } from "./../scene/types";
import Henesys from "./Henesys";
import KerningCity from "./KerningCity";
import LithHarbor from "./LithHarbor";
import { REGIONS } from "./regions";

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
        puzzle: Function;
        mesos?: number[]; // [min, max]
        items?: Item[]; // If not provided, it will grant a piece of equipment not already owned by the player
    };
    town?: TOWNS;
    region: REGIONS;
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
    LITH_HARBOR = "Lith Harbor",
    PERION = "Perion",
    ELLINIA = "Ellinia",
}

export const TOWN_MAP = {
    [TOWNS.KERNING]: KerningCity,
    [TOWNS.LITH_HARBOR]: LithHarbor,
    [TOWNS.HENESYS]: Henesys,
};

export const BG_MAP = {
    [REGIONS.HENESYS]: HenesysRegionBGImage,
    [REGIONS.KERNING]: KerningCityBGImage,
    [REGIONS.LITH_HARBOR]: LithRegionBGImage,
    [REGIONS.PERION]: PerionRegionBGImage,
    [REGIONS.ELLINIA]: ElliniaBGImage,
};

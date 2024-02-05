import { Ability, Minion } from "../ability/types";
import { BATTLE_TYPES, Wave } from "../battle/types";
import {
    AltForestBGImage,
    ElliniaBGImage,
    HenesysRegionBGImage,
    KerningCityBGImage,
    LithRegionBGImage,
    PerionRegionBGImage,
} from "../images";
import { Item } from "../item/types";
import { NPC } from "./../scene/types";
import Henesys from "./Henesys";
import KerningCity from "./KerningCity";
import LithHarbor from "./LithHarbor";
import Perion from "./Perion";
import Ellinia from "./Ellinia";
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
    cardRewards?: Ability[]; // If this is a battle, these abilities will be included in the card rewards screen upon victory
    town?: TOWNS;
    region: REGIONS;
}

export interface EliteMap {
    minions: Minion[];
    single: Minion[];
    duo: Minion[];
    trio: Minion[];
    squad: Minion[];
}

export interface Route {
    nodes: RouteNode[];
    initialPlayerPosition?: {
        x: number;
        y: number;
    };
    /** If not provided, it will attempt to fallback on enemies from the preceding route */
    enemies?: (Minion | null)[][];
    /** Pool of preset enemies when generating a fight with multiple waves, expected to be easier than the single-wave `enemies` bucket. */
    multiWaveEnemies?: (Minion | null)[][];
    events?: NPC[];
    treasure?: {
        mesos?: { min: number; max: number };
        items?: Item[];
    }[];
    /** If not provided, the route will not have elites */
    elites?: EliteMap;
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
    [TOWNS.PERION]: Perion,
    [TOWNS.ELLINIA]: Ellinia,
};

export const BG_MAP = {
    [REGIONS.HENESYS]: HenesysRegionBGImage,
    [REGIONS.KERNING]: KerningCityBGImage,
    [REGIONS.LITH_HARBOR]: LithRegionBGImage,
    [REGIONS.PERION]: PerionRegionBGImage,
    [REGIONS.ELLINIA]: ElliniaBGImage,
    [REGIONS.HIDDEN_FOREST]: AltForestBGImage,
};

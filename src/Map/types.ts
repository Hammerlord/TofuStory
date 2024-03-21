import { Ability, Minion } from "../ability/types";
import { Wave } from "../battle/types";
import {
    AltForestBGImage,
    ElliniaBGImage,
    HenesysRegionBGImage,
    KerningCityBGImage,
    LithRegionBGImage,
    PerionRegionBGImage,
    SleepywoodRegionBGImage,
} from "../images";
import { Item } from "../item/types";
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
    event?;
    treasure?: {
        mesos?: number[]; // [min, max]
        items?: Item[]; // If not provided, it will grant a piece of equipment not already owned by the player
        curse?: "damage";
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
    special?: (Minion | null)[][]; // Elite encounters as-is, no affixes added
}

export interface Route {
    id: string; // Unique identifier for this route
    /** Value up to 1. 1 = 100%. If not provided, the chance is 0. */
    cursedTreasureChance?: number;
    nodes: RouteNode[];
    initialPlayerPosition?: {
        x: number;
        y: number;
    };
    /** If not provided, it will attempt to fallback on enemies from the preceding route */
    enemies?: (Minion | null)[][];
    /** Pool of preset enemies when generating a fight with multiple waves, expected to be easier than the single-wave `enemies` bucket. */
    multiWaveEnemies?: (Minion | null)[][];
    treasure?: {
        mesos?: { min: number; max: number };
        items?: Item[];
    }[];
    /** If not provided, the route will not have elites */
    elites?: EliteMap;
    eliteOptions?: {
        /** How many elites are on this route. If not provided, it's 1 (if elites are configured). */
        numElites?: number;
        /** If not provided, it's 1 (if elites are configured). */
        numAffixes?: number;
    };
    next?: Route[];
}

export enum TOWNS {
    HENESYS = "Henesys",
    KERNING = "Kerning City",
    LITH_HARBOR = "Lith Harbor",
    PERION = "Perion",
    ELLINIA = "Ellinia",
    SLEEPYWOOD = "Sleepywood",
}

export const BG_MAP = {
    [REGIONS.HENESYS]: HenesysRegionBGImage,
    [REGIONS.KERNING]: KerningCityBGImage,
    [REGIONS.LITH_HARBOR]: LithRegionBGImage,
    [REGIONS.PERION]: PerionRegionBGImage,
    [REGIONS.SLEEPYWOOD]: SleepywoodRegionBGImage,
    [REGIONS.ELLINIA]: ElliniaBGImage,
    [REGIONS.HIDDEN_FOREST]: AltForestBGImage,
};

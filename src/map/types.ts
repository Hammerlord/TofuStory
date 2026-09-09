import { OnBuyItem } from "../shops/constants";
import { Ability, CombatAbility, Minion } from "../ability/types";
import { Player } from "../character/types";
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
import { EventScene } from "../scene/types";
import { REGIONS } from "./regions";
import { BattleState } from "../battle/types";

export enum NODE_TYPES {
    ENCOUNTER = "encounter",
    ELITE_ENCOUNTER = "eliteEncounter",
    BOSS = "bossEncounter",
    EVENT = "event",
    RESTING_ZONE = "restingZone",
    SHOP = "shop",
    TRADING_POST = "tradingPost",
    TRANSMUTE = "transmute",
    TOWN = "town",
    TREASURE = "treasure",
}

export interface RouteNode {
    id?: string;
    x?: number;
    y?: number;
    type?: NODE_TYPES;
    encounter?: string; // This is usually a pre-configured overworld boss, identified by a string ID. See overworldBosses.ts.
    event?: EventScene;
    treasure?: {
        mesos?: number[]; // [min, max]
        items?: Item[]; // If not provided, it will grant a piece of equipment not already owned by the player
        curse?: "damage";
    };
    cardRewards?: Ability[]; // If this is a battle, these abilities will be included in the card rewards screen upon victory
    town?: TOWNS;
    region: REGIONS;
}

/** A single point along a route at which its region switches from `Route.region` to a new one. */
export interface RegionTransition {
    atNodeIndex: number;
    region: REGIONS;
}

export interface GeneratedRouteNode extends RouteNode {
    routeId: string;
    previousRouteId?: string;
    next?: GeneratedRouteNode[];
}

export interface EliteMap {
    minions: Minion[];
    single: Minion[];
    duo: Minion[];
    trio: Minion[];
    squad: Minion[];
    special?: (Minion | null)[][]; // Elite encounters as-is, no affixes added
}

export type EliteOptions = {
    /** How many elites are on this route. If not provided, it's 1 (if elites are configured). */
    numElites?: number;
    /** If not provided, it's 1 (if elites are configured). */
    numAffixes?: number;
    damageModifier?: number; // 0: no change, 1: +1 attack power or more for elites
};

export interface Route {
    id: string; // Unique identifier for this route
    /** Value up to 1. 1 = 100%. If not provided, the chance is 0. */
    cursedTreasureChance?: number;
    /** Number of generated levels in this route, matching what `nodes.length` used to represent. */
    numNodes: number;
    /** Region for this route's nodes, from node 0 up to (but not including) `regionTransition.atNodeIndex`, if any. */
    region: REGIONS;
    /** If this route's region changes partway through, the index it switches at and the new region. */
    regionTransition?: RegionTransition;
    /** Index (within `numNodes`) of this route's boss encounter, if it has one. */
    bossNodeIndex?: number;
    /** Pool of possible encounter IDs for the boss node; one is chosen at random. */
    bosses?: string[];
    /** Town this route starts at, if it's used as an entry point into the middle of travel. */
    startingTown?: TOWNS;
    /** Town at the end of this route, if applicable. */
    endingTown?: TOWNS;
    specialEnemies?: Minion[];
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
    eliteOptions?: EliteOptions;
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

export type TownProperties = {
    player: Player;
    onExit: () => void;
    onClickScene: (scene: EventScene) => void;
    onCamp: () => void;
    onBattle: (battleConfig: BattleState, callback: Function) => void;
};

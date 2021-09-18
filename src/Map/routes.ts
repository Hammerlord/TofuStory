import { axeStump, fireBoar, octopus, snail, stump, thiefAssassin, wildBoar } from "../enemy/enemy";
import { blueSnail, noobA, noobB, orangeMushroom, redSnail, shroom } from "./../enemy/enemy";
import { ENCOUNTER_DIFFICULTY, ENEMY_DIFFICULTY, MapEnemies, NODE_TYPES, RouteNode } from "./types";

const { EASY, NORMAL, HARD, HARDEST } = ENEMY_DIFFICULTY;
export const enemyLayouts = {
    easy: [
        [null, EASY, EASY, EASY, null],
        [null, EASY, EASY, EASY, EASY],
        [NORMAL, NORMAL, null, null, null],
        [EASY, NORMAL, EASY, null, null],
        [null, EASY, NORMAL, EASY, null],
        [null, NORMAL, NORMAL, null, null],
        [null, NORMAL, EASY, NORMAL, null],
        [NORMAL, null, null, null, NORMAL],
        [null, null, HARD, null, null],
    ] as ENEMY_DIFFICULTY[][],
    normal: [
        [null, NORMAL, EASY, NORMAL, EASY],
        [null, NORMAL, null, NORMAL, null],
        [EASY, NORMAL, null, NORMAL, EASY],
        [NORMAL, NORMAL, null, NORMAL, NORMAL],
        [null, HARD, null, NORMAL, null],
        [null, NORMAL, HARD, null, null],
        [null, NORMAL, NORMAL, NORMAL, null],
        [EASY, EASY, EASY, EASY, EASY],
        [EASY, EASY, NORMAL, EASY, EASY],
    ] as ENEMY_DIFFICULTY[][],
    hard: [
        [EASY, NORMAL, HARD, NORMAL, EASY],
        [null, NORMAL, HARD, NORMAL, null],
        [NORMAL, NORMAL, null, null, HARD],
        [null, HARD, null, HARD, null],
        [HARD, null, null, null, HARD],
        [EASY, null, HARDEST, null, EASY],
        [null, null, HARDEST, null, null],
    ] as ENEMY_DIFFICULTY[][],
};

export const routeLithToKerning = {
    location: "",
    enemies: {
        easy: [snail],
        normal: [blueSnail, shroom],
        hard: [redSnail, orangeMushroom],
        hardest: [orangeMushroom],
    } as MapEnemies,
    nodes: [
        {
            x: 0.15873015873015872,
            y: 0.730697961704756,
            type: NODE_TYPES.encounter,
            difficulty: ENCOUNTER_DIFFICULTY.EASY,
        },
        {
            x: 0.1963718820861678,
            y: 0.6868437306979617,
            type: NODE_TYPES.encounter,
            difficulty: ENCOUNTER_DIFFICULTY.EASY,
        },
        {
            x: 0.254875283446712,
            y: 0.679431747992588,
            type: NODE_TYPES.encounter,
            difficulty: [ENCOUNTER_DIFFICULTY.EASY, ENCOUNTER_DIFFICULTY.NORMAL],
        },
        {
            x: 0.2925170068027211,
            y: 0.6244595429277332,
            type: NODE_TYPES.restingZone,
        },
        {
            x: 0.24807256235827665,
            y: 0.6016059295861643,
            type: NODE_TYPES.encounter,
            encounters: [[null, noobA, null, noobB, null]],
        },
        {
            x: 0.19591836734693877,
            y: 0.609017912291538,
            type: NODE_TYPES.encounter,
            difficulty: ENCOUNTER_DIFFICULTY.ELITE_TRIAD,
        },
        {
            x: 0.17551020408163265,
            y: 0.5558987029030266,
            type: NODE_TYPES.encounter,
            difficulty: ENCOUNTER_DIFFICULTY.ELITE,
        },
        {
            x: 0.1877818778187782,
            y: 0.4992147419118417,
            type: NODE_TYPES.encounter,
            encounters: [[null, null, thiefAssassin, null, null]],
        },
    ] as RouteNode[],
};

export const routeKerningToPerion = {
    enemies: {
        easy: [blueSnail, octopus],
        normal: [stump, redSnail, wildBoar],
        hard: [axeStump, orangeMushroom],
        hardest: [fireBoar],
    } as MapEnemies,
    nodes: [
        {
            x: 0.18263888888888888,
            y: 0.3499464292311671,
            type: NODE_TYPES.encounter,
            difficulty: ENCOUNTER_DIFFICULTY.EASY,
        },
        {
            x: 0.22256944444444443,
            y: 0.3291388037093139,
            type: NODE_TYPES.encounter,
            difficulty: ENCOUNTER_DIFFICULTY.EASY,
        },
        {
            x: 0.27847222222222223,
            y: 0.33481361066981935,
            type: NODE_TYPES.restingZone,
        },
        {
            x: 0.3138888888888889,
            y: 0.29840026600657626,
            type: NODE_TYPES.encounter,
            difficulty: [ENCOUNTER_DIFFICULTY.EASY, ENCOUNTER_DIFFICULTY.NORMAL],
        },
        {
            x: 0.31875,
            y: 0.24827280452211178,
            type: NODE_TYPES.encounter,
            difficulty: ENCOUNTER_DIFFICULTY.ELITE_TRIAD,
        },
        {
            x: 0.3371527777777778,
            y: 0.2113865592788266,
            type: NODE_TYPES.encounter,
            difficulty: ENCOUNTER_DIFFICULTY.ELITE,
        },
    ] as RouteNode[],
};

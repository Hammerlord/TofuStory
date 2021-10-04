import {
    axeStump,
    blueSnail,
    fireBoar,
    noobA,
    noobB,
    octopus,
    orangeMushroom,
    redSnail,
    shroom,
    snail,
    stump,
    thiefAssassin,
    wildBoar,
} from "../../enemy/enemy";
import { goldRichieMerchant } from "../../scene/GoldRichie";
import { ENCOUNTER_DIFFICULTY, MapEnemies, NODE_TYPES, RouteNode } from "../types";

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
            type: NODE_TYPES.ENCOUNTER,
            difficulty: ENCOUNTER_DIFFICULTY.EASY,
        },
        {
            x: 0.1963718820861678,
            y: 0.6868437306979617,
            type: NODE_TYPES.ENCOUNTER,
            difficulty: ENCOUNTER_DIFFICULTY.EASY,
        },
        {
            x: 0.254875283446712,
            y: 0.679431747992588,
            type: NODE_TYPES.ENCOUNTER,
            difficulty: [ENCOUNTER_DIFFICULTY.EASY, ENCOUNTER_DIFFICULTY.NORMAL],
        },
        {
            x: 0.2925170068027211,
            y: 0.6244595429277332,
            type: NODE_TYPES.RESTING_ZONE,
        },
        {
            x: 0.24807256235827665,
            y: 0.6016059295861643,
            type: NODE_TYPES.ENCOUNTER,
            encounters: [[null, noobA, null, noobB, null]],
        },
        {
            x: 0.19591836734693877,
            y: 0.609017912291538,
            type: NODE_TYPES.ENCOUNTER,
            difficulty: ENCOUNTER_DIFFICULTY.ELITE_TRIAD,
        },
        {
            x: 0.17551020408163265,
            y: 0.5558987029030266,
            type: NODE_TYPES.ENCOUNTER,
            difficulty: ENCOUNTER_DIFFICULTY.ELITE,
        },
        {
            x: 0.1877818778187782,
            y: 0.4992147419118417,
            type: NODE_TYPES.ENCOUNTER,
            encounters: [[null, null, thiefAssassin, null, null]],
        },
    ] as RouteNode[],
};

export const routeKerningToPerion = {
    enemies: {
        easy: [stump, octopus],
        normal: [blueSnail, redSnail, wildBoar],
        hard: [axeStump, orangeMushroom],
        hardest: [fireBoar],
    } as MapEnemies,
    nodes: [
        {
            x: 0.18263888888888888,
            y: 0.3499464292311671,
            type: NODE_TYPES.ENCOUNTER,
            difficulty: ENCOUNTER_DIFFICULTY.EASY,
        },
        {
            x: 0.22256944444444443,
            y: 0.3291388037093139,
            type: NODE_TYPES.ENCOUNTER,
            difficulty: ENCOUNTER_DIFFICULTY.EASY,
        },
        {
            x: 0.27847222222222223,
            y: 0.33481361066981935,
            type: NODE_TYPES.RESTING_ZONE,
        },
        {
            x: 0.3138888888888889,
            y: 0.29840026600657626,
            type: NODE_TYPES.SHOP,
            npc: goldRichieMerchant,
        },
        {
            x: 0.31875,
            y: 0.24827280452211178,
            type: NODE_TYPES.ENCOUNTER,
            difficulty: ENCOUNTER_DIFFICULTY.ELITE_TRIAD,
        },
        {
            x: 0.3371527777777778,
            y: 0.2113865592788266,
            type: NODE_TYPES.ENCOUNTER,
            difficulty: ENCOUNTER_DIFFICULTY.ELITE,
        },
    ] as RouteNode[],
};

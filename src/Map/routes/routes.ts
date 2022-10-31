import {
    axeStump,
    blueSnail,
    fireBoar,
    manoEnemy,
    mutantSnailEnemy,
    octopus,
    orangeMushroom,
    pig,
    redSnail,
    ribbonPig,
    shroom,
    slime,
    snail,
    stump,
    wildBoar,
} from "../../enemy/enemy";
import { strangePig } from "../../enemy/strangePig";
import { stumpy } from "../../enemy/stumpy";
import { REGIONS } from "../regions";
import { MapEnemies, NODE_TYPES, Route, RouteNode, TOWNS } from "../types";

export const routeKerningToPerion: Route = {
    enemies: {
        easy: [stump],
        normal: [octopus, redSnail, wildBoar],
        hard: [axeStump, orangeMushroom],
        hardest: [fireBoar],
    } as MapEnemies,
    nodes: [
        {
            x: 0.18263888888888888,
            y: 0.3499464292311671,
            region: REGIONS.KERNING,
        },
        {
            x: 0.22256944444444443,
            y: 0.3291388037093139,
            region: REGIONS.KERNING,
        },
        {
            x: 0.27847222222222223,
            y: 0.33481361066981935,
            region: REGIONS.PERION,
        },
        {
            x: 0.3138888888888889,
            y: 0.29840026600657626,
            region: REGIONS.PERION,
        },
        {
            x: 0.31875,
            y: 0.24827280452211178,
            type: NODE_TYPES.BOSS,
            encounter: [{ enemies: [null, null, stumpy, null, null] }],
            region: REGIONS.PERION,
        },
        {
            x: 0.3371527777777778,
            y: 0.2113865592788266,
            region: REGIONS.PERION,
        },
    ] as RouteNode[],
};

const toKerning: Route = {
    elites: [snail, blueSnail, shroom],
    nodes: [
        {
            x: 0.19591836734693877,
            y: 0.609017912291538,
            region: REGIONS.HENESYS,
        },
        {
            x: 0.17551020408163265,
            y: 0.5558987029030266,
            region: REGIONS.HENESYS,
        },
        {
            x: 0.1877818778187782,
            y: 0.4992147419118417,
            region: REGIONS.KERNING,
        },
        {
            x: 0.18412698412698414,
            y: 0.4544662963518991,
            region: REGIONS.KERNING,
        },
        {
            x: 0.14982728842832468,
            y: 0.39576595119082625,
            type: NODE_TYPES.TOWN,
            town: TOWNS.KERNING,
            region: REGIONS.KERNING,
        },
    ] as RouteNode[],
    next: [routeKerningToPerion],
};

const toKerningForest: Route = {
    nodes: [
        {
            x: 0.24807256235827665,
            y: 0.6016059295861643,
            region: REGIONS.LITH_HARBOR,
        },
        {
            x: 0.23139329805996472,
            y: 0.5596757243657109,
            region: REGIONS.HENESYS,
        },
        {
            x: 0.2324514991181658,
            y: 0.5092328479207326,
            type: NODE_TYPES.BOSS,
            encounter: [{ enemies: [null, snail, mutantSnailEnemy, snail, null] }],
            region: REGIONS.HENESYS,
        },
    ],
    next: [toKerning],
};

export const routeElliniaPerion = {
    nodes: [
        {
            x: 0.6398963730569949,
            y: 0.5545427815348427,
        },
        {
            x: 0.5949913644214162,
            y: 0.5468979711849457,
        },
        {
            x: 0.5703799654576857,
            y: 0.5004410467509556,
        },
        {
            x: 0.5699481865284974,
            y: 0.4392825639517789,
        },
        {
            x: 0.5651986183074266,
            y: 0.37283152014113496,
        },
        {
            x: 0.5379965457685665,
            y: 0.32225815936489266,
        },
        {
            x: 0.5086355785837651,
            y: 0.2752131725962952,
        },
        {
            x: 0.4641623488773748,
            y: 0.25169067921199645,
        },
        {
            x: 0.42918825561312607,
            y: 0.2211114378124081,
        },
    ],
};

export const routeHenesysEllinia: Route = {
    nodes: [
        {
            x: 0.5246113989637305,
            y: 0.8079976477506615,
            region: REGIONS.HENESYS,
        },
        {
            x: 0.5531088082901554,
            y: 0.7603645986474566,
            region: REGIONS.HENESYS,
        },
        {
            x: 0.5613126079447323,
            y: 0.7062628638635695,
            region: REGIONS.HENESYS,
        },
        {
            x: 0.5906735751295337,
            y: 0.6574536900911496,
            type: NODE_TYPES.BOSS,
            encounter: [{ enemies: [null, null, strangePig, null, null] }],
            region: REGIONS.HENESYS,
        },
        {
            x: 0.6308290155440415,
            y: 0.6356953837106734,
            region: REGIONS.ELLINIA,
        },
        {
            x: 0.6640759930915371,
            y: 0.6080564539841223,
            region: REGIONS.ELLINIA,
        },
    ],
    next: [],
};

export const toHenesys: Route = {
    elites: [snail, blueSnail, shroom],
    nodes: [
        {
            x: 0.38765432098765434,
            y: 0.7446329379972977,
            region: REGIONS.HENESYS,
        },
        {
            x: 0.3950617283950617,
            y: 0.8070860231196517,
            region: REGIONS.HENESYS,
        },
        {
            x: 0.45509499136442144,
            y: 0.8068215230814466,
            type: NODE_TYPES.TOWN,
            town: TOWNS.HENESYS,
            region: REGIONS.HENESYS,
        },
    ],
    next: [routeHenesysEllinia],
};

export const toHenesysForest: Route = {
    nodes: [
        {
            x: 0.30483592400690845,
            y: 0.6727433107909438,
            region: REGIONS.LITH_HARBOR,
        },
        {
            x: 0.3143350604490501,
            y: 0.7221405468979711,
            region: REGIONS.HENESYS,
        },
        {
            x: 0.3333333333333333,
            y: 0.7680094089973537,
            region: REGIONS.HENESYS,
        },
        {
            x: 0.363668430335097,
            y: 0.7907521393184207,
            region: REGIONS.HENESYS,
        },
        {
            x: 0.37178130511463847,
            y: 0.6970725116348897,
            type: NODE_TYPES.BOSS,
            encounter: [{ enemies: [null, snail, manoEnemy, snail, null] }],
            region: REGIONS.HENESYS,
        },
    ],
    next: [toHenesys],
};

export const routeLith: Route = {
    initialPlayerPosition: {
        x: 0.15716753022452504,
        y: 0.7956483387239047,
    },
    enemies: {
        easy: [snail, blueSnail],
        normal: [shroom, redSnail],
        hard: [pig, slime],
        hardest: [orangeMushroom, ribbonPig],
    } as MapEnemies,
    nodes: [
        {
            x: 0.16,
            y: 0.7301997386596976,
            region: REGIONS.LITH_HARBOR,
        },
        {
            x: 0.1887719298245614,
            y: 0.690057868209819,
            region: REGIONS.LITH_HARBOR,
        },
        {
            x: 0.23333333333333334,
            y: 0.6852790741086429,
            region: REGIONS.LITH_HARBOR,
        },
        {
            x: 0.2729824561403509,
            y: 0.6675975359342916,
            region: REGIONS.LITH_HARBOR,
        },
        {
            x: 0.29157894736842105,
            y: 0.6241105096135897,
            region: REGIONS.LITH_HARBOR,
        },
    ],
    next: [toHenesysForest, toKerningForest],
};

export const toLith: Route = {
    initialPlayerPosition: {
        x: 0.15873015873015872,
        y: 0.730697961704756,
    },
    enemies: {
        easy: [snail, blueSnail],
        normal: [shroom, redSnail],
        hard: [pig, slime],
        hardest: [orangeMushroom, ribbonPig],
    } as MapEnemies,
    nodes: [
        {
            x: 0.15716753022452504,
            y: 0.7956483387239047,
            type: NODE_TYPES.TOWN,
            town: TOWNS.LITH_HARBOR,
            region: REGIONS.LITH_HARBOR,
        },
    ],
    next: [routeLith],
};

const routeDeadTrees = {
    nodes: [
        { x: 0.5168393782383419, y: 0.4263451925904146 },
        { x: 0.49697754749568224, y: 0.36930314613349013 },
        { x: 0.44602763385146804, y: 0.33578359306086447 },
        { x: 0.4175302245250432, y: 0.28932666862687445 },
        {
            x: 0.3864421416234888,
            y: 0.2528668038812114,
        },
    ],
};

const routeSewer = {
    nodes: [
        { x: 0.2033678756476684, y: 0.39988238753307853 },
        { x: 0.24913644214162348, y: 0.4022346368715084 },
        {
            x: 0.28281519861830745,
            y: 0.4334019406057042,
        },
        {
            x: 0.29922279792746115,
            y: 0.48279917671273154,
        },
        {
            x: 0.31563039723661485,
            y: 0.5316083504851514,
        },
        {
            x: 0.3501727115716753,
            y: 0.5551308438694501,
        },
    ],
};

const routePerionSleepywood = {
    nodes: [
        { x: 0.3860103626943005, y: 0.25227874154660396 },
        { x: 0.3756476683937824, y: 0.297559541311379 },
        {
            x: 0.3549222797927461,
            y: 0.3416642164069391,
        },
        {
            x: 0.34110535405872194,
            y: 0.39282563951778887,
        },
        {
            x: 0.36787564766839376,
            y: 0.4445751249632461,
        },
        {
            x: 0.4123488773747841,
            y: 0.481034989708909,
        },
    ],
};

const perionCoordinates = {
    x: 0.38385146804835923,
    y: 0.18406351073213761,
};

const elliniaCoordinates = {
    x: 0.6968911917098446,
    y: 0.5492502205233755,
};

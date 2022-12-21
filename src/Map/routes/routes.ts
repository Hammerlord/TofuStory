import { shellThrow } from "./../../ability/neutralAbilities";
import {
    axeStump,
    blueSnail,
    fireBoar,
    lupin,
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
import { curseEye, elliniaGreenMushroom, elliniaHornyMushroom } from "./../../enemy/enemy";

export const routeKerningToPerion: Route = {
    enemies: {
        easy: [stump, redSnail],
        normal: [octopus, wildBoar],
        hard: [axeStump, orangeMushroom],
        hardest: [fireBoar],
    } as MapEnemies,
    nodes: [
        { x: 0.18101545253863136, y: 0.3502607225066942, region: REGIONS.KERNING },
        { x: 0.21444339325134026, y: 0.32964451811635537, region: REGIONS.KERNING },
        { x: 0.2532324187953327, y: 0.33093303089075154, region: REGIONS.KERNING },
        { x: 0.28981393882056133, y: 0.33308055218141186, region: REGIONS.PERION },
        {
            x: 0.3169347209082308,
            y: 0.2961431859820548,
            type: NODE_TYPES.BOSS,
            encounter: [
                {
                    enemies: [null, null, stumpy, null, null],
                    winCondition: {
                        defeatBoss: true,
                    },
                },
            ],
            region: REGIONS.PERION,
        },
        {
            x: 0.31875,
            y: 0.24827280452211178,
            region: REGIONS.PERION,
        },
        { x: 0.34058656575212864, y: 0.20809481306498265, region: REGIONS.PERION },
        {
            x: 0.38385146804835923,
            y: 0.18406351073213761,
            type: NODE_TYPES.TOWN,
            town: TOWNS.PERION,
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
            encounter: [
                {
                    enemies: [null, snail, mutantSnailEnemy, snail, null],
                    winCondition: {
                        defeatBoss: true,
                    },
                },
            ],
            cardRewards: [shellThrow],
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
    enemies: {
        easy: [stump, redSnail],
        normal: [elliniaGreenMushroom, elliniaHornyMushroom],
        hard: [axeStump, orangeMushroom],
        hardest: [curseEye, lupin],
    } as MapEnemies,
    nodes: [
        { x: 0.5162946428571429, y: 0.814892576037545, region: REGIONS.HENESYS },
        { x: 0.546875, y: 0.7790196702466737, region: REGIONS.HENESYS },
        { x: 0.5584821428571428, y: 0.7282503883223052, region: REGIONS.HENESYS },
        {
            x: 0.5734375,
            y: 0.6790011447789057,
            type: NODE_TYPES.BOSS,
            encounter: [
                {
                    enemies: [null, null, strangePig, null, null],
                    winCondition: {
                        defeatBoss: true,
                    },
                },
            ],
            region: REGIONS.HENESYS,
        },
        { x: 0.6104910714285714, y: 0.6504244232166863, region: REGIONS.ELLINIA },
        { x: 0.6424107142857143, y: 0.6276238475021494, region: REGIONS.ELLINIA },
        { x: 0.6756696428571428, y: 0.5969190722065733, region: REGIONS.ELLINIA },
        {
            x: 0.6968911917098446,
            y: 0.5492502205233755,
            region: REGIONS.ELLINIA,
            town: TOWNS.ELLINIA,
            type: NODE_TYPES.TOWN,
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
            encounter: [
                {
                    enemies: [null, snail, manoEnemy, snail, null],
                    winCondition: {
                        defeatBoss: true,
                    },
                },
            ],
            cardRewards: [shellThrow],
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

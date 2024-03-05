import { shellThrow } from "./../../ability/neutralAbilities";
import {
    axeStump,
    blueMushroom,
    blueSnail,
    darkStoneGolem,
    fireBoar,
    greenMushroom,
    ironHog,
    lupin,
    miniKargo,
    octopus,
    orangeMushroom,
    owlTower,
    pig,
    redSnail,
    ribbonPig,
    shroom,
    slime,
    snail,
    stump,
    wildBoar,
    wildKargo,
} from "../../enemy/enemy";
import { strangePig } from "../../enemy/strangePig";
import { stumpy } from "../../enemy/stumpy";
import { REGIONS } from "../regions";
import { NODE_TYPES, Route, RouteNode, TOWNS } from "../types";
import { curseEye, elliniaGreenMushroom, elliniaHornyMushroom } from "./../../enemy/enemy";
import { mossyMushroom, mossySnail } from "../../enemy/mossyMushroomSnail";
import { manoEnemy, minionSnail, mutantSnailEnemy } from "../../enemy/bossSnails";
import { balrog } from "../../enemy/balrog";

const sleepywood: Route = {
    nodes: [
        {
            x: 0.4294642857142857,
            y: 0.5364215446440023,
            region: REGIONS.SLEEPYWOOD,
            type: NODE_TYPES.TOWN,
            town: TOWNS.SLEEPYWOOD,
            id: "Sleepywood",
        },
    ],
};

const routePerionSleepywood: Route = {
    eliteOptions: {
        numElites: 3,
        numAffixes: 2,
    },
    elites: {
        minions: [stump, elliniaGreenMushroom],
        single: [fireBoar],
        duo: [fireBoar],
        trio: [wildBoar, axeStump],
        squad: [elliniaGreenMushroom],
        special: [
            [null, owlTower, null, owlTower, null],
            [null, miniKargo, wildKargo, miniKargo, null],
        ],
    },
    nodes: [
        { x: 0.3860103626943005, y: 0.25227874154660396, region: REGIONS.PERION },
        { x: 0.3756476683937824, y: 0.297559541311379, region: REGIONS.PERION },
        {
            x: 0.3549222797927461,
            y: 0.3416642164069391,
            region: REGIONS.PERION,
        },
        {
            x: 0.34110535405872194,
            y: 0.39282563951778887,
            region: REGIONS.SLEEPYWOOD,
        },
        {
            x: 0.36787564766839376,
            y: 0.4445751249632461,
            region: REGIONS.SLEEPYWOOD,
        },
        {
            x: 0.4123488773747841,
            y: 0.481034989708909,
            region: REGIONS.SLEEPYWOOD,
        },
    ],
    next: [sleepywood],
};

export const routeKerningToPerion: Route = {
    elites: {
        minions: [shroom, redSnail, stump],
        single: [fireBoar],
        duo: [wildBoar, axeStump],
        trio: [orangeMushroom, octopus],
        squad: [redSnail, stump],
    },
    enemies: [
        [stump, stump, axeStump, stump, stump],
        [null, orangeMushroom, stump, orangeMushroom, null],
        [null, stump, fireBoar, stump, null],
        [snail, redSnail, octopus, redSnail, snail],
        [null, wildBoar, null, wildBoar, null],
        [octopus, null, stump, null, octopus],
        [null, octopus, redSnail, octopus, null],
        [stump, redSnail, stump, redSnail, stump],
        [stump, stump, wildBoar, stump, stump],
        [null, axeStump, null, axeStump, null],
    ],
    multiWaveEnemies: [
        [null, stump, stump, stump, null],
        [null, redSnail, stump, redSnail, null],
        [null, snail, wildBoar, snail, null],
        [null, null, fireBoar, null, null],
        [null, blueSnail, axeStump, blueSnail, null],
        [null, stump, null, axeStump, null],
        [null, stump, null, wildBoar, null],
        [null, orangeMushroom, null, orangeMushroom, null],
        [null, stump, octopus, stump, null],
        [null, octopus, null, octopus, null],
        [snail, stump, snail, stump, snail],
    ],
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
    cursedTreasureChance: 0.25,
    next: [routePerionSleepywood],
};

const toKerning: Route = {
    elites: {
        minions: [snail, blueSnail],
        single: [orangeMushroom, octopus],
        duo: [stump, slime],
        trio: [redSnail, shroom],
        squad: [snail, blueSnail],
    },
    nodes: [
        {
            x: 0.17551020408163265,
            y: 0.5558987029030266,
            region: REGIONS.KERNING,
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
    enemies: [
        [snail, null, octopus, null, snail],
        [snail, null, orangeMushroom, null, snail],
        [null, snail, octopus, snail, null],
        [null, snail, orangeMushroom, snail, null],
        [null, slime, null, slime, null],
        [null, stump, blueSnail, stump, null],
        [null, pig, null, pig, null],
        [null, pig, null, slime, null],
        [snail, redSnail, blueSnail, redSnail, snail],
        [null, redSnail, redSnail, redSnail, null],
        [snail, shroom, blueSnail, shroom, snail],
    ],
    multiWaveEnemies: [
        [null, null, orangeMushroom, null, null],
        [null, null, octopus, null, null],
        [null, snail, pig, snail, null],
        [null, blueSnail, slime, blueSnail, null],
        [snail, null, slime, null, snail],
        [snail, blueSnail, redSnail, blueSnail, snail],
        [null, slime, null, redSnail, null],
        [null, shroom, redSnail, shroom, null],
        [null, stump, null, stump, null],
    ],
    nodes: [
        {
            x: 0.24807256235827665,
            y: 0.6016059295861643,
            region: REGIONS.LITH_HARBOR,
        },
        {
            x: 0.19591836734693877,
            y: 0.609017912291538,
            encounter: [
                {
                    enemies: [null, minionSnail, mutantSnailEnemy, minionSnail, null],
                    winCondition: {
                        defeatBoss: true,
                    },
                },
            ],
            type: NODE_TYPES.BOSS,
            cardRewards: [shellThrow],
            region: REGIONS.LITH_HARBOR,
        },
    ],
    next: [toKerning],
};

export const routeElliniaSleepywood = {
    eliteOptions: {
        numElites: 3,
        numAffixes: 2,
    },
    elites: {
        minions: [elliniaGreenMushroom, stump],
        single: [lupin, curseEye, ironHog],
        duo: [axeStump, wildBoar],
        trio: [elliniaHornyMushroom, orangeMushroom],
        squad: [stump, elliniaGreenMushroom],
        special: [[null, mossyMushroom, null, mossySnail, null]],
    },
    enemies: [
        [stump, stump, axeStump, stump, stump],
        [stump, orangeMushroom, stump, orangeMushroom, stump],
        [orangeMushroom, null, elliniaGreenMushroom, null, orangeMushroom],
        [elliniaGreenMushroom, null, elliniaHornyMushroom, null, elliniaGreenMushroom],
        [elliniaGreenMushroom, stump, orangeMushroom, stump, elliniaGreenMushroom],
        [elliniaGreenMushroom, orangeMushroom, elliniaGreenMushroom, orangeMushroom, elliniaGreenMushroom],
        [null, elliniaHornyMushroom, stump, elliniaHornyMushroom, null],
        [null, elliniaHornyMushroom, orangeMushroom, elliniaHornyMushroom, null],
        [null, elliniaHornyMushroom, greenMushroom, elliniaHornyMushroom, null],
        [null, lupin, null, lupin, null],
        [null, stump, curseEye, stump, null],
        [null, axeStump, stump, axeStump, null],
    ],
    multiWaveEnemies: [
        [null, null, curseEye, null, null],
        [null, redSnail, lupin, redSnail, null],
        [null, stump, axeStump, stump, null],
        [elliniaGreenMushroom, null, elliniaGreenMushroom, null, elliniaGreenMushroom],
        [null, stump, orangeMushroom, stump, null],
        [null, elliniaHornyMushroom, null, elliniaHornyMushroom, null],
        [null, stump, stump, stump, null],
        [null, stump, elliniaGreenMushroom, stump, null],
        [elliniaGreenMushroom, null, stump, null, elliniaGreenMushroom],
        [null, axeStump, null, axeStump, null],
    ],
    nodes: [
        { x: 0.6580357142857143, y: 0.5479738363393676, region: REGIONS.ELLINIA },
        { x: 0.6176339285714286, y: 0.5573980743013761, region: REGIONS.ELLINIA },
        { x: 0.5810267857142857, y: 0.5485818516917552, region: REGIONS.SLEEPYWOOD },
        { x: 0.5537946428571429, y: 0.5814146807206882, region: REGIONS.SLEEPYWOOD },
        { x: 0.5129464285714286, y: 0.57837460395875, region: REGIONS.SLEEPYWOOD },
        { x: 0.47544642857142855, y: 0.5710784197300982, region: REGIONS.SLEEPYWOOD },
    ],
    next: [sleepywood],
};

export const routeElliniaPerion = {
    eliteOptions: {
        numElites: 3,
        numAffixes: 2,
    },
    elites: {
        minions: [elliniaGreenMushroom, stump],
        single: [lupin, curseEye, fireBoar],
        duo: [axeStump, wildBoar],
        trio: [elliniaHornyMushroom, orangeMushroom],
        squad: [stump, elliniaGreenMushroom],
        special: [[null, mossyMushroom, null, mossySnail, null]],
    },
    enemies: [
        [stump, stump, axeStump, stump, stump],
        [stump, orangeMushroom, stump, orangeMushroom, stump],
        [orangeMushroom, null, elliniaGreenMushroom, null, orangeMushroom],
        [elliniaGreenMushroom, null, elliniaHornyMushroom, null, elliniaGreenMushroom],
        [elliniaGreenMushroom, stump, orangeMushroom, stump, elliniaGreenMushroom],
        [elliniaGreenMushroom, orangeMushroom, elliniaGreenMushroom, orangeMushroom, elliniaGreenMushroom],
        [null, elliniaHornyMushroom, stump, elliniaHornyMushroom, null],
        [null, elliniaHornyMushroom, orangeMushroom, elliniaHornyMushroom, null],
        [null, elliniaHornyMushroom, greenMushroom, elliniaHornyMushroom, null],
        [null, stump, fireBoar, stump, null],
        [null, lupin, null, lupin, null],
        [null, stump, curseEye, stump, null],
        [null, axeStump, stump, axeStump, null],
        [null, fireBoar, null, fireBoar, null],
    ],
    multiWaveEnemies: [
        [null, null, fireBoar, null, null],
        [null, null, curseEye, null, null],
        [null, redSnail, lupin, redSnail, null],
        [null, stump, axeStump, stump, null],
        [elliniaGreenMushroom, null, elliniaGreenMushroom, null, elliniaGreenMushroom],
        [null, stump, orangeMushroom, stump, null],
        [null, elliniaHornyMushroom, null, elliniaHornyMushroom, null],
        [null, stump, stump, stump, null],
        [null, stump, elliniaGreenMushroom, stump, null],
        [elliniaGreenMushroom, null, stump, null, elliniaGreenMushroom],
        [null, axeStump, null, axeStump, null],
    ],
    nodes: [
        {
            x: 0.6398963730569949,
            y: 0.5545427815348427,
            region: REGIONS.ELLINIA,
        },
        {
            x: 0.5949913644214162,
            y: 0.5468979711849457,
            region: REGIONS.ELLINIA,
        },
        {
            x: 0.5703799654576857,
            y: 0.5004410467509556,
            region: REGIONS.ELLINIA,
        },
        {
            x: 0.5699481865284974,
            y: 0.4392825639517789,
            region: REGIONS.PERION,
        },

        {
            x: 0.5651986183074266,
            y: 0.37283152014113496,
            region: REGIONS.PERION,
        },
        {
            x: 0.5379965457685665,
            y: 0.32225815936489266,
            region: REGIONS.PERION,
        },
        {
            x: 0.5086355785837651,
            y: 0.2752131725962952,
            region: REGIONS.PERION,
        },
        {
            x: 0.4641623488773748,
            y: 0.25169067921199645,
            region: REGIONS.PERION,
        },
        {
            x: 0.42918825561312607,
            y: 0.2211114378124081,
            region: REGIONS.PERION,
        },
    ],
    cursedTreasureChance: 0.5,
};

export const routeHenesysEllinia: Route = {
    enemies: [
        [stump, redSnail, elliniaGreenMushroom, redSnail, stump],
        [null, null, curseEye, null, null],
        [null, null, ironHog, null, null],
        [null, ribbonPig, null, ribbonPig, null],
        [null, axeStump, stump, axeStump, null],
        [null, lupin, null, lupin, null],
        [elliniaGreenMushroom, elliniaHornyMushroom, redSnail, elliniaHornyMushroom, elliniaGreenMushroom],
        [null, elliniaHornyMushroom, elliniaGreenMushroom, elliniaHornyMushroom, null],
        [null, elliniaHornyMushroom, stump, elliniaHornyMushroom, null],
        [stump, pig, stump, pig, stump],
        [blueSnail, slime, pig, slime, blueSnail],
        [elliniaGreenMushroom, elliniaGreenMushroom, slime, elliniaGreenMushroom, elliniaGreenMushroom],
        [stump, redSnail, stump, redSnail, stump],
        [blueMushroom, blueSnail, orangeMushroom, blueSnail, blueMushroom],
    ],
    multiWaveEnemies: [
        [null, elliniaHornyMushroom, null, elliniaHornyMushroom, null],
        [elliniaGreenMushroom, null, stump, null, elliniaGreenMushroom],
        [blueSnail, blueSnail, blueMushroom, blueSnail, blueSnail],
        [null, stump, stump, stump, null],
        [null, null, lupin, null, null],
        [null, axeStump, null, stump, null],
        [null, pig, redSnail, pig, null],
        [null, slime, null, slime, null],
        [stump, blueSnail, stump, blueSnail, stump],
        [null, elliniaGreenMushroom, elliniaHornyMushroom, elliniaGreenMushroom, null],
    ],
    elites: {
        minions: [redSnail, elliniaGreenMushroom, stump],
        single: [lupin, curseEye],
        duo: [axeStump, orangeMushroom, slime, elliniaHornyMushroom],
        trio: [elliniaGreenMushroom, pig, blueMushroom],
        squad: [stump, elliniaGreenMushroom],
        special: [[null, null, darkStoneGolem, null, null]],
    },
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
    next: [routeElliniaSleepywood],
    cursedTreasureChance: 0.25,
};

export const toHenesys: Route = {
    elites: {
        minions: [snail, blueSnail],
        single: [orangeMushroom, ribbonPig],
        duo: [pig, slime, blueMushroom],
        trio: [redSnail, shroom],
        squad: [snail, blueSnail],
        special: [[blueMushroom, stump, blueMushroom, stump, blueMushroom]],
    },
    nodes: [
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
    enemies: [
        [snail, null, ribbonPig, null, snail],
        [snail, null, orangeMushroom, null, snail],
        [null, snail, ribbonPig, snail, null],
        [null, snail, orangeMushroom, snail, null],
        [null, slime, null, slime, null],
        [null, pig, blueSnail, pig, null],
        [null, pig, null, pig, null],
        [null, pig, null, slime, null],
        [snail, redSnail, blueSnail, redSnail, snail],
        [null, redSnail, redSnail, redSnail, null],
        [snail, shroom, blueSnail, shroom, snail],
        [blueSnail, blueSnail, blueMushroom, blueSnail, blueSnail],
    ],
    multiWaveEnemies: [
        [null, null, orangeMushroom, null, null],
        [null, null, ribbonPig, null, null],
        [null, snail, pig, snail, null],
        [null, blueSnail, slime, blueSnail, null],
        [snail, null, slime, null, snail],
        [snail, blueSnail, redSnail, blueSnail, snail],
        [null, slime, null, redSnail, null],
        [null, shroom, redSnail, shroom, null],
    ],
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
            type: NODE_TYPES.BOSS,
            encounter: [
                {
                    enemies: [null, minionSnail, manoEnemy, minionSnail, null],
                    winCondition: {
                        defeatBoss: true,
                    },
                },
            ],
            cardRewards: [shellThrow],
        },
    ],
    next: [toHenesys],
};

export const routeLith: Route = {
    initialPlayerPosition: {
        x: 0.15716753022452504,
        y: 0.7956483387239047,
    },
    enemies: [
        [snail, blueSnail, snail, blueSnail, snail],
        [snail, blueSnail, redSnail, blueSnail, snail],
        [snail, snail, redSnail, snail, snail],
        [null, blueSnail, pig, snail, null],
        [blueSnail, snail, shroom, snail, blueSnail],
        [shroom, null, redSnail, null, blueSnail],
        [null, blueSnail, slime, blueSnail, null],
        [null, snail, slime, snail, null],
        [null, redSnail, shroom, redSnail, null],
        [null, shroom, redSnail, shroom, null],
        [null, pig, null, redSnail, null],
        [null, null, orangeMushroom, null, null],
    ],
    multiWaveEnemies: [
        [snail, snail, null, snail, snail],
        [null, blueSnail, snail, blueSnail, null],
        [snail, null, shroom, null, snail],
        [null, blueSnail, shroom, blueSnail, null],
        [null, shroom, null, shroom, null],
        [null, shroom, null, redSnail, null],
        [null, blueSnail, redSnail, blueSnail, null],
        [null, redSnail, null, redSnail, null],
        [null, null, pig, null, null],
        [null, null, slime, null, null],
    ],
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

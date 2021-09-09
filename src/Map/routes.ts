import { snail } from "../enemy/enemy";
import { blueSnail, noobA, noobB, orangeMushroom, redSnail, shroom } from "./../enemy/enemy";
import { NODE_TYPES, RouteNode } from "./types";

const encounters = {
    low: [
        [null, snail, snail, snail, null],
        [snail, snail, blueSnail, snail, snail],
        [snail, snail, snail, snail, snail],
        [null, blueSnail, null, shroom, null],
        [snail, null, shroom, null, snail],
        [null, null, redSnail, null, null],
        [snail, blueSnail, snail, null, snail],
        [null, blueSnail, snail, blueSnail, null],
        [redSnail, null, null, null, blueSnail],
        [blueSnail, null, null, null, shroom],
    ],
    medium: [
        [null, blueSnail, snail, redSnail, null],
        [null, blueSnail, shroom, blueSnail, null],
        [null, redSnail, null, redSnail, null],
        [null, blueSnail, orangeMushroom, blueSnail, null],
        [snail, blueSnail, redSnail, blueSnail, snail],
        [null, shroom, null, orangeMushroom, null],
        [null, shroom, blueSnail, shroom, null],
    ],
    high: [],
    boss: [[null, noobA, null, noobB, null]],
};

export const routeLithToKerning = {
    location: "",
    encounters,
    nodes: [
        {
            x: 0.15873015873015872,
            y: 0.730697961704756,
            type: NODE_TYPES.encounter,
            difficulty: "low",
        },
        {
            x: 0.1963718820861678,
            y: 0.6868437306979617,
            type: NODE_TYPES.encounter,
            difficulty: "low",
        },
        {
            x: 0.254875283446712,
            y: 0.679431747992588,
            type: NODE_TYPES.encounter,
            difficulty: "medium",
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
            difficulty: "boss",
        },
        {
            x: 0.19591836734693877,
            y: 0.609017912291538,
            type: NODE_TYPES.encounter,
            difficulty: "low",
        },
        {
            x: 0.17551020408163265,
            y: 0.5558987029030266,
            type: NODE_TYPES.encounter,
            difficulty: "medium",
        },
    ] as RouteNode[],
};

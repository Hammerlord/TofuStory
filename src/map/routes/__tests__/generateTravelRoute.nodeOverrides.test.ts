import { describe, expect, it } from "vitest";
import { REGIONS } from "../../regions";
import { GeneratedRouteNode, NODE_TYPES, Route, TOWNS } from "../../types";
import generateTravelRoute from "../generateTravelRoute";

const collectLevels = (root: GeneratedRouteNode): GeneratedRouteNode[][] => {
    const levels: GeneratedRouteNode[][] = [[root]];
    let current = levels[0];
    while (current[0]?.next?.length) {
        const nextNodes: GeneratedRouteNode[] = [];
        for (const node of current) {
            for (const nxt of node.next ?? []) {
                if (!nextNodes.includes(nxt)) {
                    nextNodes.push(nxt);
                }
            }
        }
        if (nextNodes.length === 0) {
            break;
        }
        current = nextNodes;
        levels.push(current);
    }
    return levels;
};

const baseRoute = (overrides: Route["nodeOverrides"]): Route => ({
    id: "override-demo",
    region: REGIONS.LITH_HARBOR,
    numNodes: 6,
    startingTown: TOWNS.LITH_HARBOR,
    endingTown: TOWNS.KERNING,
    // Enough of a floor for normal levels to always roll a real node type.
    multiWaveEnemies: [[null]],
    nodeOverrides: overrides,
});

describe("generateTravelRoute nodeOverrides", () => {
    it("replaces a level with a forced boss node", () => {
        const levels = collectLevels(
            generateTravelRoute({
                startingRoute: baseRoute({
                    "3": [{ type: NODE_TYPES.BOSS, encounter: "mano" }],
                }),
            }),
        );

        expect(levels[3]).toHaveLength(1);
        expect(levels[3][0].type).toBe(NODE_TYPES.BOSS);
        expect(levels[3][0].encounter).toBe("mano");
    });

    it("falls back to a random boss from the override's bossPool when encounter is omitted", () => {
        const levels = collectLevels(
            generateTravelRoute({
                startingRoute: baseRoute({
                    "3": [{ type: NODE_TYPES.BOSS, bossPool: ["mano", "stumpy"] }],
                }),
            }),
        );

        expect(levels[3][0].type).toBe(NODE_TYPES.BOSS);
        expect(["mano", "stumpy"]).toContain(levels[3][0].encounter);
    });

    it("can place multiple authored nodes on one level", () => {
        const levels = collectLevels(
            generateTravelRoute({
                startingRoute: baseRoute({
                    "2": [{ type: NODE_TYPES.TREASURE }, { type: NODE_TYPES.SHOP }],
                }),
            }),
        );

        expect(levels[2]).toHaveLength(2);
        expect(levels[2].map((n) => n.type)).toEqual([NODE_TYPES.TREASURE, NODE_TYPES.SHOP]);
    });

    it("keeps town nodes and normal generation on non-overridden levels", () => {
        const levels = collectLevels(
            generateTravelRoute({
                startingRoute: baseRoute({
                    "3": [{ type: NODE_TYPES.BOSS, encounter: "mano" }],
                }),
            }),
        );

        expect(levels[0][0].type).toBe(NODE_TYPES.TOWN);
        expect(levels[0][0].town).toBe(TOWNS.LITH_HARBOR);
        expect(levels[5][0].type).toBe(NODE_TYPES.TOWN);
        expect(levels[5][0].town).toBe(TOWNS.KERNING);
        // non-overridden intermediate levels get generated nodes
        expect(levels[1].length).toBeGreaterThan(0);
        expect(levels[1].every((n) => n.type !== undefined)).toBe(true);
    });

    it("no-ops when overrides target out-of-range indices", () => {
        const levels = collectLevels(
            generateTravelRoute({
                startingRoute: baseRoute({
                    "99": [{ type: NODE_TYPES.BOSS, encounter: "mano" }],
                }),
            }),
        );

        expect(levels).toHaveLength(6);
        expect(levels.flat().some((n) => n.encounter === "mano")).toBe(false);
    });
});
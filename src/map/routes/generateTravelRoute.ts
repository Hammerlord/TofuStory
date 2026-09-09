import * as uuid from "uuid";
import { REGIONS } from "../regions";
import { GeneratedRouteNode, NODE_TYPES, Route, RouteNode } from "../types";
import { getRandomInt, getRandomItem, shuffle } from "./../../utils";

const MIN_NODES_PER_LEVEL = 2;
const MAX_NODES_PER_LEVEL = 3;
const NODE_SPACING = 0.1;
const BRANCH_OFFSET = 0.35;
const RARE_NODE_CHANCE = 0.2;

type Bookkeeping = {
    numEncountersSinceRestPoint: number;
    numNodesSinceLastTreasure: number;
};

const DISTANCE_EPSILON = 1e-9;

const yDistance = (a: GeneratedRouteNode, b: GeneratedRouteNode) => Math.abs((a.y ?? 0) - (b.y ?? 0));

const wireLevels = (fromLevel: GeneratedRouteNode[], toLevel: GeneratedRouteNode[]) => {
    if (fromLevel.length === 0 || toLevel.length === 0) {
        return;
    }

    const numLinks =
        fromLevel.length === toLevel.length ? Math.min(2, toLevel.length) : Math.max(1, Math.ceil(toLevel.length / fromLevel.length));

    fromLevel.forEach((node) => {
        const closest = [...toLevel].sort((a, b) => yDistance(a, node) - yDistance(b, node));
        const cutoffIndex = Math.min(numLinks, toLevel.length) - 1;
        const cutoffDistance = yDistance(closest[cutoffIndex], node);
        node.next = closest.filter((n) => yDistance(n, node) <= cutoffDistance + DISTANCE_EPSILON);
    });

    toLevel.forEach((target) => {
        if (fromLevel.some((node) => node.next?.includes(target))) {
            return;
        }

        const nearest = [...fromLevel].sort((a, b) => yDistance(a, target) - yDistance(b, target))[0];
        (nearest.next ??= []).push(target);
    });
};

const wireRouteBranches = (fromLevel: GeneratedRouteNode[], branchEntryLevels: GeneratedRouteNode[][]) => {
    if (fromLevel.length === 0 || branchEntryLevels.length === 0) {
        return;
    }

    const entries = branchEntryLevels.map((level) => level[0]).filter((node): node is GeneratedRouteNode => node !== undefined);

    if (entries.length === 0) {
        return;
    }

    entries.forEach((entry) => {
        const closestParents = [...fromLevel].sort((a, b) => yDistance(a, entry) - yDistance(b, entry));

        const parent = closestParents[0];

        if (!parent) {
            return;
        }

        parent.next ??= [];

        if (!parent.next.includes(entry)) {
            parent.next.push(entry);
        }
    });
};

const partition = <T>(items: T[], numGroups: number): T[][] => {
    const groups: T[][] = Array.from({ length: numGroups }, () => []);
    shuffle(items).forEach((item, i) => groups[i % numGroups].push(item));
    return groups.map((group, i) => (group.length ? group : [items[i % items.length]]));
};

/** The region a given node index within `route` falls under, accounting for `regionTransition`. */
const regionAtIndex = (route: Route, index: number): REGIONS =>
    route.regionTransition && index >= route.regionTransition.atNodeIndex ? route.regionTransition.region : route.region;

const generateTravelRoute = ({ startingRoute }: { startingRoute: Route }): GeneratedRouteNode => {
    const getTotalLevels = (route: Route): number => {
        if (!route.next?.length) {
            return route.numNodes;
        }

        if (route.next.length === 1) {
            return route.numNodes + getTotalLevels(route.next[0]);
        }

        return route.numNodes + Math.max(...route.next.map(getTotalLevels));
    };
    const totalLevels = Math.max(getTotalLevels(startingRoute), 1);

    /** A generated level is capped to 2 nodes when it immediately follows a single-node convergence. */
    const getLevelNodeCount = (precedingLevelSize: number | undefined): number => {
        if (precedingLevelSize === 1) {
            return 2;
        }

        if (precedingLevelSize === 2) {
            return 3;
        }

        return getRandomInt(MIN_NODES_PER_LEVEL, MAX_NODES_PER_LEVEL);
    };

    const buildSegment = ({
        route,
        prevRoute,
        depth,
        center,
        bookkeeping,
        incomingLevelSize = 1,
        isBranchEntry = false,
    }: {
        route: Route;
        prevRoute?: Route;
        depth: number;
        center: number;
        bookkeeping: Bookkeeping;
        incomingLevelSize?: number;
        isBranchEntry?: boolean;
    }): GeneratedRouteNode[] => {
        const routeId = route.id;

        const numLevels = route.numNodes;
        const uncommonBaseline = Math.ceil(numLevels / 5);
        const likelihood = 0.5;

        let numEvents = uncommonBaseline;
        let numTreasures = uncommonBaseline;
        let numShops = uncommonBaseline;
        let numEliteEncounters = route.elites ? (route.eliteOptions?.numElites ?? uncommonBaseline) : 0;
        let numTradingPosts = 1;
        let numTransmutes = 1;

        let { numEncountersSinceRestPoint, numNodesSinceLastTreasure } = bookkeeping;

        const rollType = (prevLevel: GeneratedRouteNode[] | undefined): NODE_TYPES => {
            const types: NODE_TYPES[] = [];

            const notInPrevLevel = (nodeType: NODE_TYPES) => {
                if (!prevLevel) {
                    return true;
                }

                return !prevLevel.some((n) => n.type === nodeType);
            };

            if (numTreasures > 0 && numNodesSinceLastTreasure >= 3) {
                types.push(NODE_TYPES.TREASURE);
            }

            if (numEncountersSinceRestPoint >= 3 && notInPrevLevel(NODE_TYPES.RESTING_ZONE)) {
                types.push(NODE_TYPES.RESTING_ZONE);
            } else if (numEvents > 0 && Math.random() < likelihood) {
                types.push(NODE_TYPES.EVENT);
            } else if (numEliteEncounters > 0 && Math.random() < likelihood) {
                types.push(NODE_TYPES.ELITE_ENCOUNTER);
            } else {
                const rareTypes: NODE_TYPES[] = [];

                // To give Trading Post a better chance at being useful,
                // it should come after any treasure chests.
                if (numTradingPosts > 0 && numTreasures === 0) {
                    rareTypes.push(NODE_TYPES.TRADING_POST);
                }

                if (numTransmutes > 0) {
                    rareTypes.push(NODE_TYPES.TRANSMUTE);
                }

                if (rareTypes.length > 0 && Math.random() < RARE_NODE_CHANCE) {
                    types.push(getRandomItem(rareTypes));
                } else if (numShops > 0 && Math.random() < likelihood && notInPrevLevel(NODE_TYPES.SHOP)) {
                    types.push(NODE_TYPES.SHOP);
                } else {
                    types.push(NODE_TYPES.ENCOUNTER);
                }
            }

            return getRandomItem(types);
        };

        const applyBookkeeping = (type: NODE_TYPES) => {
            if (type === NODE_TYPES.ENCOUNTER) {
                ++numEncountersSinceRestPoint;
            } else if (type === NODE_TYPES.ELITE_ENCOUNTER) {
                --numEliteEncounters;
                ++numEncountersSinceRestPoint;
            } else if (type === NODE_TYPES.EVENT) {
                --numEvents;
                ++numEncountersSinceRestPoint;
            } else if (type === NODE_TYPES.RESTING_ZONE) {
                numEncountersSinceRestPoint = 0;
            } else if (type === NODE_TYPES.TREASURE) {
                --numTreasures;
            } else if (type === NODE_TYPES.SHOP) {
                --numShops;
            } else if (type === NODE_TYPES.TRADING_POST) {
                --numTradingPosts;
            } else if (type === NODE_TYPES.TRANSMUTE) {
                --numTransmutes;
            }

            if (type === NODE_TYPES.TREASURE) {
                numNodesSinceLastTreasure = 0;
            } else {
                ++numNodesSinceLastTreasure;
            }
        };

        const makeGeneratedNode = ({
            base,
            forcedType,
            prevLevel,
        }: {
            base: Partial<RouteNode>;
            forcedType?: NODE_TYPES;
            prevLevel: GeneratedRouteNode[] | undefined;
        }): GeneratedRouteNode => {
            const type = forcedType || rollType(prevLevel);

            if (!forcedType) {
                applyBookkeeping(type);
            }

            const node: GeneratedRouteNode = {
                ...base,
                id: base.town ?? uuid.v4(),
                type,
                routeId,
                previousRouteId: prevRoute?.id,
                next: [],
            } as GeneratedRouteNode;

            if (type === NODE_TYPES.TREASURE && !node.treasure) {
                const isCursedTreasure = route.cursedTreasureChance && Math.random() <= route.cursedTreasureChance;

                node.treasure = {
                    mesos: [20, 40],
                    curse: isCursedTreasure ? "damage" : undefined,
                };
            }

            return node;
        };

        const positionLevel = (level: GeneratedRouteNode[], levelDepth: number, levelCenter: number) => {
            const x = totalLevels <= 1 ? 0 : levelDepth / (totalLevels - 1);
            const n = level.length;

            level.forEach((node, i) => {
                node.x = x;
                const y = levelCenter + (i - (n - 1) / 2) * NODE_SPACING;
                node.y = Math.max(0, Math.min(1, y));
            });
        };

        if (route.numNodes === 0) {
            const next = route.next || [];

            if (next.length === 0) {
                return [];
            }

            if (next.length === 1) {
                return buildSegment({
                    route: next[0],
                    prevRoute: route,
                    depth,
                    center,
                    bookkeeping,
                    incomingLevelSize,
                    isBranchEntry,
                });
            }

            const branchCenters = next.map((_, i) => center + (i - (next.length - 1) / 2) * BRANCH_OFFSET);

            return next.flatMap((nextRoute, i) =>
                buildSegment({
                    route: nextRoute,
                    prevRoute: route,
                    depth,
                    center: branchCenters[i],
                    bookkeeping,
                    incomingLevelSize: 1,
                    isBranchEntry: true,
                })
            );
        }

        const levels: GeneratedRouteNode[][] = [];

        for (let idx = 0; idx < route.numNodes; idx++) {
            const region = regionAtIndex(route, idx);
            const prevLevel: GeneratedRouteNode[] | undefined = levels[idx - 1];

            if (idx === 0 && route.startingTown !== undefined) {
                levels.push([
                    makeGeneratedNode({
                        base: {
                            region,
                            town: route.startingTown,
                        },
                        forcedType: NODE_TYPES.TOWN,
                        prevLevel,
                    }),
                ]);
                continue;
            }

            if (idx === route.numNodes - 1 && route.endingTown !== undefined) {
                levels.push([
                    makeGeneratedNode({
                        base: {
                            region,
                            town: route.endingTown,
                        },
                        forcedType: NODE_TYPES.TOWN,
                        prevLevel,
                    }),
                ]);
                continue;
            }

            if (idx === route.bossNodeIndex) {
                const encounter = route.bosses && getRandomItem(route.bosses);

                levels.push([
                    makeGeneratedNode({
                        base: {
                            region,
                            encounter,
                        },
                        forcedType: NODE_TYPES.BOSS,
                        prevLevel,
                    }),
                ]);
                continue;
            }

            const precedingLevelSize = idx === 0 ? incomingLevelSize : levels[idx - 1].length;

            /*
             * A route reached through `route.next` always has exactly
             * one entry node. Subsequent levels are free to branch normally.
             */
            const count = idx === 0 && isBranchEntry ? 1 : getLevelNodeCount(precedingLevelSize);

            if (!levels.length) {
                levels.push(
                    Array.from({ length: count }, () =>
                        makeGeneratedNode({ base: { region }, forcedType: NODE_TYPES.ENCOUNTER, prevLevel })
                    )
                );
                continue;
            }

            levels.push(Array.from({ length: count }, () => makeGeneratedNode({ base: { region }, prevLevel })));
        }

        levels.forEach((level, levelIndex) => {
            positionLevel(level, depth + levelIndex, center);

            if (levelIndex > 0) {
                wireLevels(levels[levelIndex - 1], level);
            }
        });

        const lastLevel = levels[levels.length - 1];
        const nextDepth = depth + levels.length;

        const nextBookkeeping = {
            numEncountersSinceRestPoint,
            numNodesSinceLastTreasure,
        };

        const next = route.next || [];

        if (next.length === 0) {
            return levels[0];
        }

        const branchCenters = next.map((_, i) => center + (i - (next.length - 1) / 2) * BRANCH_OFFSET);

        let groups: GeneratedRouteNode[][];
        if (next.length > 1 && lastLevel.length >= next.length) {
            groups = partition(lastLevel, next.length);
        } else {
            groups = next.map(() => lastLevel);
        }

        const branchEntryLevels: GeneratedRouteNode[][] = [];

        next.forEach((nextRoute, i) => {
            const wireLevel = groups[i];

            const childFirstLevel = buildSegment({
                route: nextRoute,
                prevRoute: route,
                depth: nextDepth,
                center: branchCenters[i],
                bookkeeping: nextBookkeeping,
                incomingLevelSize: wireLevel.length,
                isBranchEntry: true,
            });

            if (childFirstLevel.length > 0) {
                branchEntryLevels.push(childFirstLevel);
            }
        });

        wireRouteBranches(lastLevel, branchEntryLevels);
        return levels[0];
    };

    const rootLevel = buildSegment({
        route: startingRoute,
        depth: 0,
        center: 0.5,
        bookkeeping: {
            numEncountersSinceRestPoint: 0,
            numNodesSinceLastTreasure: 0,
        },
    });

    return rootLevel[0];
};

export default generateTravelRoute;

import * as uuid from "uuid";
import { GeneratedRouteNode, NODE_TYPES, Route, RouteNode } from "../types";
import { getRandomInt, getRandomItem, shuffle } from "./../../utils";

const MIN_NODES_PER_LEVEL = 2;
const MAX_NODES_PER_LEVEL = 3;
const NODE_SPACING = 0.1;
const BRANCH_OFFSET = 0.3;
const RARE_NODE_CHANCE = 0.15;

type Bookkeeping = {
    numEncountersSinceRestPoint: number;
    numNodesSinceLastTreasure: number;
};

const DISTANCE_EPSILON = 1e-9;

const yDistance = (a: GeneratedRouteNode, b: GeneratedRouteNode) => Math.abs((a.y ?? 0) - (b.y ?? 0));

const wireLevels = (fromLevel: GeneratedRouteNode[], toLevel: GeneratedRouteNode[]) => {
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

const partition = <T>(items: T[], numGroups: number): T[][] => {
    const groups: T[][] = Array.from({ length: numGroups }, () => []);
    shuffle(items).forEach((item, i) => groups[i % numGroups].push(item));
    return groups.map((group, i) => (group.length ? group : [items[i % items.length]]));
};

const findCommonBossIndex = (routes: Route[]): number | null => {
    const maxCheck = Math.min(...routes.map((r) => r.nodes.length));
    for (let i = 0; i < maxCheck; i++) {
        if (routes.every((r) => r.nodes[i]?.type === NODE_TYPES.BOSS)) {
            return i;
        }
        if (routes.some((r) => r.nodes[i]?.type === NODE_TYPES.BOSS)) {
            return null;
        }
    }
    return null;
};

const generateTravelRoute = ({ startingRoute }: { startingRoute: Route }): GeneratedRouteNode => {
    const getTotalLevels = (route: Route): number => {
        if (!route.next?.length) {
            return route.nodes.length;
        }

        if (route.next.length === 1) {
            return route.nodes.length + getTotalLevels(route.next[0]);
        }

        const bossIndex = findCommonBossIndex(route.next);
        if (bossIndex !== null) {
            const remainderLevels = Math.max(
                ...route.next.map((nextRoute) => getTotalLevels({ ...nextRoute, nodes: nextRoute.nodes.slice(bossIndex + 1) }))
            );
            return route.nodes.length + bossIndex + 1 + 1 + remainderLevels;
        }

        return route.nodes.length + Math.max(...route.next.map(getTotalLevels));
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
        incomingLevelSize,
    }: {
        route: Route;
        prevRoute?: Route;
        depth: number;
        center: number;
        bookkeeping: Bookkeeping;
        incomingLevelSize?: number;
    }): GeneratedRouteNode[] => {
        const routeId = route.id;

        const numLevels = route.nodes.length;
        let numEvents = numLevels < 3 ? 0 : 1;

        const uncommonBaseline = Math.ceil(numLevels / 5);
        let numTreasures = uncommonBaseline;
        let numShops = uncommonBaseline;
        let numEliteEncounters = route.elites ? (route.eliteOptions?.numElites ?? uncommonBaseline) : 0;
        let numTradingPosts = 1;
        let numTransmutes = 1;
        let { numEncountersSinceRestPoint, numNodesSinceLastTreasure } = bookkeeping;

        const rollType = (): NODE_TYPES => {
            const types: NODE_TYPES[] = [];

            if (numTreasures > 0 && numNodesSinceLastTreasure >= 3) {
                types.push(NODE_TYPES.TREASURE);
            }

            if (numEncountersSinceRestPoint >= 3) {
                types.push(NODE_TYPES.RESTING_ZONE);
            } else if (numEvents > 0) {
                types.push(NODE_TYPES.EVENT);
            } else if (numEliteEncounters > 0) {
                types.push(NODE_TYPES.ELITE_ENCOUNTER);
            } else {
                const rareTypes: NODE_TYPES[] = [];

                // To give Trading Post a better chance at being useful, it should come after any treasure chests.
                if (numTradingPosts > 0 && numTreasures === 0) {
                    rareTypes.push(NODE_TYPES.TRADING_POST);
                }
                if (numTransmutes > 0) {
                    rareTypes.push(NODE_TYPES.TRANSMUTE);
                }

                if (rareTypes.length > 0 && Math.random() < RARE_NODE_CHANCE) {
                    types.push(getRandomItem(rareTypes));
                } else if (numShops > 0 && Math.random() < 0.5) {
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

        const makeGeneratedNode = (base: Partial<RouteNode>, forcedType?: NODE_TYPES): GeneratedRouteNode => {
            const type = forcedType || rollType();
            if (!forcedType) {
                applyBookkeeping(type);
            }

            const node: GeneratedRouteNode = {
                ...base,
                id: base.id || uuid.v4(),
                type,
                routeId,
                previousRouteId: prevRoute?.id,
                next: [],
            } as GeneratedRouteNode;

            if (type === NODE_TYPES.TREASURE && !node.treasure) {
                const isCursedTreasure = route.cursedTreasureChance && Math.random() <= route.cursedTreasureChance;
                node.treasure = { mesos: [20, 40], curse: isCursedTreasure ? "damage" : undefined };
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

        if (route.nodes.length === 0) {
            if (route.next?.length === 1) {
                return buildSegment({ route: route.next[0], prevRoute: route, depth, center, bookkeeping, incomingLevelSize });
            }
            return [];
        }

        const levels: GeneratedRouteNode[][] = [];
        route.nodes.forEach((rawNode, idx) => {
            if (rawNode.type === NODE_TYPES.TOWN || rawNode.type === NODE_TYPES.BOSS) {
                levels.push([makeGeneratedNode(rawNode, rawNode.type)]);
                return;
            }

            const precedingLevelSize = idx === 0 ? incomingLevelSize : levels[idx - 1].length;
            const count = getLevelNodeCount(precedingLevelSize);
            levels.push(Array.from({ length: count }, () => makeGeneratedNode({ region: rawNode.region })));
        });

        levels.forEach((level, levelIndex) => {
            positionLevel(level, depth + levelIndex, center);

            if (levelIndex > 0) {
                wireLevels(levels[levelIndex - 1], level);
            }
        });

        const lastLevel = levels[levels.length - 1];
        const nextDepth = depth + levels.length;
        const nextBookkeeping = { numEncountersSinceRestPoint, numNodesSinceLastTreasure };

        if (route.next?.length === 1) {
            const childFirstLevel = buildSegment({
                route: route.next[0],
                prevRoute: route,
                depth: nextDepth,
                center,
                bookkeeping: nextBookkeeping,
                incomingLevelSize: lastLevel.length,
            });
            wireLevels(lastLevel, childFirstLevel);
        } else if (route.next && route.next.length > 1) {
            const nextRoutes = route.next;
            const bossIndex = findCommonBossIndex(nextRoutes);

            if (bossIndex !== null) {
                const chosenBranch = getRandomItem(nextRoutes) as Route;
                let mergedLevel = lastLevel;
                let mergedDepth = nextDepth;

                for (let i = 0; i < bossIndex; i++) {
                    const rawNode = chosenBranch.nodes[i];
                    const count = getLevelNodeCount(mergedLevel.length);
                    const level = Array.from({ length: count }, () => {
                        const node = makeGeneratedNode({ region: rawNode.region });
                        node.routeId = chosenBranch.id;
                        node.previousRouteId = route.id;
                        return node;
                    });
                    positionLevel(level, mergedDepth, center);
                    wireLevels(mergedLevel, level);
                    mergedLevel = level;
                    ++mergedDepth;
                }

                const bossNode = makeGeneratedNode(chosenBranch.nodes[bossIndex], NODE_TYPES.BOSS);
                bossNode.routeId = chosenBranch.id;
                bossNode.previousRouteId = route.id;
                positionLevel([bossNode], mergedDepth, center);
                wireLevels(mergedLevel, [bossNode]);
                ++mergedDepth;

                const branchCenters = nextRoutes.map((_, i) => center + (i - (nextRoutes.length - 1) / 2) * BRANCH_OFFSET);

                const branchEntryLevel = nextRoutes.map((nextRoute) => {
                    const regionSource = nextRoute.nodes[bossIndex + 1] || nextRoute.nodes[bossIndex];
                    return makeGeneratedNode({ region: regionSource?.region });
                });
                branchEntryLevel.forEach((node, i) => {
                    node.routeId = nextRoutes[i].id;
                    node.previousRouteId = route.id;
                    positionLevel([node], mergedDepth, branchCenters[i]);
                });
                wireLevels([bossNode], branchEntryLevel);
                ++mergedDepth;

                nextRoutes.forEach((nextRoute, i) => {
                    const remainder: Route = { ...nextRoute, nodes: nextRoute.nodes.slice(bossIndex + 1) };
                    const childFirstLevel = buildSegment({
                        route: remainder,
                        prevRoute: route,
                        depth: mergedDepth,
                        center: branchCenters[i],
                        bookkeeping: nextBookkeeping,
                        incomingLevelSize: 1,
                    });
                    wireLevels([branchEntryLevel[i]], childFirstLevel);
                });
            } else {
                const groups = partition(lastLevel, nextRoutes.length);
                const branchCenters = nextRoutes.map((_, i) => center + (i - (nextRoutes.length - 1) / 2) * BRANCH_OFFSET);
                nextRoutes.forEach((nextRoute, i) => {
                    const childFirstLevel = buildSegment({
                        route: nextRoute,
                        prevRoute: route,
                        depth: nextDepth,
                        center: branchCenters[i],
                        bookkeeping: nextBookkeeping,
                        incomingLevelSize: groups[i].length,
                    });
                    wireLevels(groups[i], childFirstLevel);
                });
            }
        }

        return levels[0];
    };

    const rootLevel = buildSegment({
        route: startingRoute,
        depth: 0,
        center: 0.5,
        bookkeeping: { numEncountersSinceRestPoint: 0, numNodesSinceLastTreasure: 0 },
    });

    return rootLevel[0];
};

export default generateTravelRoute;

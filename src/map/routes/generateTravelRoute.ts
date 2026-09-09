import * as uuid from "uuid";
import { GeneratedRouteNode, NODE_TYPES, Route, RouteNode } from "../types";
import { getRandomInt, getRandomItem, shuffle } from "./../../utils";

const MIN_NODES_PER_LEVEL = 2;
const MAX_NODES_PER_LEVEL = 3;

type Bookkeeping = {
    numEncountersSinceRestPoint: number;
    numNodesSinceLastTreasure: number;
};

const wireLevels = (fromLevel: GeneratedRouteNode[], toLevel: GeneratedRouteNode[]) => {
    fromLevel.forEach((node) => {
        node.next = toLevel;
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
        yRange,
        bookkeeping,
        incomingLevelSize,
    }: {
        route: Route;
        prevRoute?: Route;
        depth: number;
        yRange: [number, number];
        bookkeeping: Bookkeeping;
        incomingLevelSize?: number;
    }): GeneratedRouteNode[] => {
        const routeId = route.id;

        let numEvents = route.nodes.length < 3 ? 0 : 1;
        let numTreasures = 1;
        let numEliteEncounters = route.elites ? (route.eliteOptions?.numElites ?? 1) : 0;
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
                types.push(NODE_TYPES.ENCOUNTER);
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

        const positionLevel = (level: GeneratedRouteNode[], levelDepth: number, range: [number, number]) => {
            const x = totalLevels <= 1 ? 0 : levelDepth / (totalLevels - 1);
            const mid = (range[0] + range[1]) / 2;
            const verticalSpacingScale = 0.5;
            level.forEach((node, i) => {
                node.x = x;
                const y = range[0] + ((range[1] - range[0]) * (i + 1)) / (level.length + 1);
                node.y = mid + (y - mid) * verticalSpacingScale;
            });
        };

        if (route.nodes.length === 0) {
            if (route.next?.length === 1) {
                return buildSegment({ route: route.next[0], prevRoute: route, depth, yRange, bookkeeping, incomingLevelSize });
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
            positionLevel(level, depth + levelIndex, yRange);

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
                yRange,
                bookkeeping: nextBookkeeping,
                incomingLevelSize: lastLevel.length,
            });
            wireLevels(lastLevel, childFirstLevel);
        } else if (route.next && route.next.length > 1) {
            const nextRoutes = route.next;
            const bossIndex = findCommonBossIndex(nextRoutes);

            if (bossIndex !== null) {
                // Every branch starts with the same shared filler + a boss node - collapse that
                // prefix into a single path so all branches converge on ONE boss before diverging.
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
                    positionLevel(level, mergedDepth, yRange);
                    wireLevels(mergedLevel, level);
                    mergedLevel = level;
                    ++mergedDepth;
                }

                const bossNode = makeGeneratedNode(chosenBranch.nodes[bossIndex], NODE_TYPES.BOSS);
                bossNode.routeId = chosenBranch.id;
                bossNode.previousRouteId = route.id;
                positionLevel([bossNode], mergedDepth, yRange);
                wireLevels(mergedLevel, [bossNode]);
                ++mergedDepth;

                const branchYRanges = nextRoutes.map((_, i): [number, number] => [
                    yRange[0] + ((yRange[1] - yRange[0]) * i) / nextRoutes.length,
                    yRange[0] + ((yRange[1] - yRange[0]) * (i + 1)) / nextRoutes.length,
                ]);

                const branchEntryLevel = nextRoutes.map((nextRoute) => {
                    const regionSource = nextRoute.nodes[bossIndex + 1] || nextRoute.nodes[bossIndex];
                    return makeGeneratedNode({ region: regionSource?.region });
                });
                branchEntryLevel.forEach((node, i) => {
                    node.routeId = nextRoutes[i].id;
                    node.previousRouteId = route.id;
                });
                positionLevel(branchEntryLevel, mergedDepth, yRange);
                wireLevels([bossNode], branchEntryLevel);
                ++mergedDepth;

                nextRoutes.forEach((nextRoute, i) => {
                    const remainder: Route = { ...nextRoute, nodes: nextRoute.nodes.slice(bossIndex + 1) };
                    const childFirstLevel = buildSegment({
                        route: remainder,
                        prevRoute: route,
                        depth: mergedDepth,
                        yRange: branchYRanges[i],
                        bookkeeping: nextBookkeeping,
                        incomingLevelSize: 1,
                    });
                    wireLevels([branchEntryLevel[i]], childFirstLevel);
                });
            } else {
                const groups = partition(lastLevel, nextRoutes.length);
                nextRoutes.forEach((nextRoute, i) => {
                    const branchYRange: [number, number] = [
                        yRange[0] + ((yRange[1] - yRange[0]) * i) / nextRoutes.length,
                        yRange[0] + ((yRange[1] - yRange[0]) * (i + 1)) / nextRoutes.length,
                    ];
                    const childFirstLevel = buildSegment({
                        route: nextRoute,
                        prevRoute: route,
                        depth: nextDepth,
                        yRange: branchYRange,
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
        yRange: [0, 1],
        bookkeeping: { numEncountersSinceRestPoint: 0, numNodesSinceLastTreasure: 0 },
    });

    return rootLevel[0];
};

export default generateTravelRoute;

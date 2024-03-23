import uuid from "uuid";
import { GeneratedRouteNode, NODE_TYPES, Route } from "../types";
import { getRandomItem } from "./../../utils";

/**
 * Given a route's raw data, generate a route tree traversable by the player.
 */
const generateTravelRoute = ({ startingRoute }: { startingRoute: Route }) => {
    const generateBranch = ({
        route,
        numEncountersSinceRestPoint = 0,
        numNodesSinceLastTreasure = 0,
        prevRoute = undefined,
    }: {
        route: Route;
        numEncountersSinceRestPoint?: number;
        numNodesSinceLastTreasure?: number;
        prevRoute?;
    }) => {
        const routeId = route.id;

        let initialNode;
        let currentNode;
        let numEvents = route.nodes.length < 3 ? 0 : 1;
        let numTreasures = 1;
        let numEliteEncounters = 0;

        if (route.elites) {
            const { numElites = 1 } = route.eliteOptions || {};
            numEliteEncounters = numElites;
        }

        const generateNodeType = () => {
            const types = [];

            if (numTreasures > 0 && numNodesSinceLastTreasure >= 3) {
                types.push(NODE_TYPES.TREASURE);
            }

            if (numEncountersSinceRestPoint >= 3) {
                types.push(NODE_TYPES.RESTING_ZONE);
            } else {
                if (numEvents > 0 && currentNode?.type !== NODE_TYPES.EVENT) {
                    types.push(NODE_TYPES.EVENT);
                } else if (numEliteEncounters) {
                    types.push(NODE_TYPES.ELITE_ENCOUNTER);
                } else {
                    types.push(NODE_TYPES.ENCOUNTER);
                }
            }

            return getRandomItem(types);
        };

        const generateTreeNode = (baseNode) => {
            const transformedNode: GeneratedRouteNode = {
                ...baseNode,
                id: baseNode.id || uuid.v4(),
                routeId,
                previousRouteId: prevRoute?.id,
                type: baseNode.type || generateNodeType(),
            };

            const type = transformedNode.type;
            if (type === NODE_TYPES.ENCOUNTER) {
                ++numEncountersSinceRestPoint;
            } else if (type === NODE_TYPES.ELITE_ENCOUNTER) {
                --numEliteEncounters;
                ++numEncountersSinceRestPoint;
            } else if (type === NODE_TYPES.TREASURE) {
                const isCursedTreasure = route?.cursedTreasureChance && Math.random() <= route?.cursedTreasureChance;
                transformedNode.treasure = {
                    mesos: [20, 40],
                    curse: isCursedTreasure ? "damage" : undefined,
                };
                --numTreasures;
            } else if (type === NODE_TYPES.EVENT) {
                // No op, event generation is handled live
                ++numEncountersSinceRestPoint;
                --numEvents;
            } else if (type === NODE_TYPES.RESTING_ZONE) {
                numEncountersSinceRestPoint = 0;
            }

            if (type === NODE_TYPES.TREASURE) {
                numNodesSinceLastTreasure = 0;
            } else {
                ++numNodesSinceLastTreasure;
            }

            return transformedNode;
        };

        const generateInitialNode = (baseNode) => {
            if (baseNode.type) {
                return generateTreeNode(baseNode);
            }

            if (numEncountersSinceRestPoint >= 2) {
                numEncountersSinceRestPoint = 0;

                return {
                    ...baseNode,
                    id: baseNode.id || uuid.v4(),
                    type: NODE_TYPES.RESTING_ZONE,
                };
            }

            return generateTreeNode(baseNode);
        };

        route.nodes.forEach((node) => {
            if (!initialNode) {
                initialNode = generateInitialNode(node);
                currentNode = initialNode;
                return;
            }

            const next = generateTreeNode(node);
            if (currentNode) {
                currentNode.next = [next];
            }
            currentNode = next;
        });

        if (route.next) {
            currentNode.next = route.next.map((nextRoute) =>
                generateBranch({ route: nextRoute, numEncountersSinceRestPoint, numNodesSinceLastTreasure, prevRoute: route })
            );
        }

        return initialNode;
    };

    return generateBranch({ route: startingRoute });
};

export default generateTravelRoute;

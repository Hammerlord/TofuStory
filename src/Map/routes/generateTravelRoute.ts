import uuid from "uuid";
import OnOffPuzzle from "../../scene/TreasureBox/OnOffPuzzle";
import ReelLockPuzzle from "../../scene/TreasureBox/ReelLockPuzzle";
import RowPuzzle from "../../scene/TreasureBox/RowPuzzle";
import SortingPuzzle from "../../scene/TreasureBox/SortingPuzzle";
import { NODE_TYPES, Route } from "../types";
import { getRandomItem } from "./../../utils";
import { generateElites, generateWaves } from "./../encounters";
import { RouteNode } from "./../types";

/**
 * Given a route's raw data, generate a route tree traversable by the player.
 */
const generateTravelRoute = ({ startingRoute }: { startingRoute: Route }) => {
    const generateBranch = (baseRoute: Route, numEncountersSinceRestPoint = 0, prevRoute = undefined) => {
        let initialNode;
        let currentNode;
        let numEvents = baseRoute.nodes.length < 3 ? 0 : 1;
        let numTreasures = 1;
        let numEliteEncounters = 0;
        if (baseRoute.elites) {
            const { numElites = 1 } = baseRoute.eliteOptions || {};
            numEliteEncounters = numElites;
        }

        const generateNodeType = () => {
            const types = [];
            if (numTreasures > 0 && currentNode?.type !== NODE_TYPES.TREASURE) {
                types.push(NODE_TYPES.TREASURE);
            }
            if (numEncountersSinceRestPoint >= 2) {
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
            const transformedNode: RouteNode = {
                ...baseNode,
                id: baseNode.id || uuid.v4(),
                type: baseNode.type || generateNodeType(),
            };

            const type = transformedNode.type;
            if (type === NODE_TYPES.ENCOUNTER) {
                transformedNode.encounter = generateWaves(baseRoute, prevRoute);
                ++numEncountersSinceRestPoint;
            } else if (type === NODE_TYPES.ELITE_ENCOUNTER) {
                --numEliteEncounters;
                ++numEncountersSinceRestPoint;
                transformedNode.encounter = generateElites(baseRoute);
            } else if (type === NODE_TYPES.TREASURE) {
                const isCursedTreasure = baseRoute?.cursedTreasureChance && Math.random() <= baseRoute?.cursedTreasureChance;
                transformedNode.treasure = {
                    puzzle: getRandomItem([ReelLockPuzzle, OnOffPuzzle, SortingPuzzle, RowPuzzle]),
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

        baseRoute.nodes.forEach((node) => {
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

        if (baseRoute.next) {
            currentNode.next = baseRoute.next.map((route) => generateBranch(route, numEncountersSinceRestPoint, baseRoute));
        }

        return initialNode;
    };

    return generateBranch(startingRoute);
};

export default generateTravelRoute;

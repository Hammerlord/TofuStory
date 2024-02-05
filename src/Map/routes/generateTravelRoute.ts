import uuid from "uuid";
import ComboPuzzle from "../../scene/TreasureBox/ComboPuzzle";
import OnOffPuzzle from "../../scene/TreasureBox/OnOffPuzzle";
import ReelLockPuzzle from "../../scene/TreasureBox/ReelLockPuzzle";
import RowPuzzle from "../../scene/TreasureBox/RowPuzzle";
import SortingPuzzle from "../../scene/TreasureBox/SortingPuzzle";
import { NODE_TYPES, Route } from "../types";
import { getRandomItem } from "./../../utils";
import { generateElites, generateWaves } from "./../encounters";
import { RouteNode } from "./../types";
import { events } from "./eventList";

/**
 * Given a route's raw data, generate a route tree traversable by the player.
 */
const generateTravelRoute = ({ route, notoreity, numRoutesComplete }: { route: Route; notoreity: number; numRoutesComplete: number }) => {
    const generateBranch = (baseRoute: Route, numEncountersSinceRestPoint = 0, prevRoute = undefined) => {
        let initialNode;
        let currentNode;
        let numEvents = Math.floor(baseRoute.nodes.length / 4);
        let numTreasures = 1;
        let numEliteEncounters = baseRoute.elites ? 1 : 0;

        const generateNodeType = () => {
            const types = [];
            if (numEvents > 0 && currentNode?.type !== NODE_TYPES.EVENT) {
                types.push(NODE_TYPES.EVENT);
            }
            if (numTreasures > 0 && currentNode?.type !== NODE_TYPES.TREASURE) {
                types.push(NODE_TYPES.TREASURE);
            }
            if (numEncountersSinceRestPoint >= 2) {
                types.push(NODE_TYPES.RESTING_ZONE);
            } else {
                if (numEliteEncounters) {
                    types.push(NODE_TYPES.ELITE_ENCOUNTER);
                }
                types.push(NODE_TYPES.ENCOUNTER);
            }

            return getRandomItem(types);
        };

        const generateTreeNode = (baseNode) => {
            const transformedNode: RouteNode = {
                ...baseNode,
                id: uuid.v4(),
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
                transformedNode.treasure = {
                    puzzle: getRandomItem([ComboPuzzle, ReelLockPuzzle, OnOffPuzzle, SortingPuzzle, RowPuzzle]),
                    mesos: [20, 40],
                };
                --numTreasures;
            } else if (type === NODE_TYPES.EVENT) {
                transformedNode.npc = {
                    ...getRandomItem(events),
                };
                --numEvents;
            } else if (type === NODE_TYPES.RESTING_ZONE) {
                numEncountersSinceRestPoint = 0;
            }
            return transformedNode;
        };

        const generateInitialNode = (baseNode) => {
            if (baseNode.type) {
                return baseNode;
            }
            if (numEncountersSinceRestPoint >= 2) {
                numEncountersSinceRestPoint = 0;

                return {
                    ...baseNode,
                    id: uuid.v4(),
                    type: NODE_TYPES.RESTING_ZONE,
                };
            }

            ++numEncountersSinceRestPoint;
            return {
                ...baseNode,
                id: uuid.v4(),
                type: NODE_TYPES.ENCOUNTER,
                encounter: generateWaves(baseRoute, prevRoute),
            };
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

    return generateBranch(route);
};

export default generateTravelRoute;

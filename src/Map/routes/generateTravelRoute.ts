import uuid from "uuid";
import ComboPuzzle from "../../scene/TreasureBox/ComboPuzzle";
import RedBluePuzzle from "../../scene/TreasureBox/RedBluePuzzle";
import ReelLockPuzzle from "../../scene/TreasureBox/ReelLockPuzzle";
import { NODE_TYPES, Route } from "../types";
import { getRandomItem } from "./../../utils";
import { generateWaves } from "./../encounters";
import { RouteNode } from "./../types";
import { events, treasure } from "./eventList";

/**
 * Given a route's raw data, generate a route tree traversable by the player.
 */
const generateTravelRoute = ({ route, notoreity, numRoutesComplete }: { route: Route; notoreity: number; numRoutesComplete: number }) => {
    const generateBranch = (baseRoute: Route) => {
        let initialNode;
        let currentNode;
        let numEncountersSinceRestPoint = 0;
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
                types.push(NODE_TYPES.ENCOUNTER, NODE_TYPES.ENCOUNTER);
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
            if (type === NODE_TYPES.ENCOUNTER || type === NODE_TYPES.ELITE_ENCOUNTER) {
                transformedNode.encounter = generateWaves(type, baseRoute.enemies || route.enemies);
                if (type === NODE_TYPES.ELITE_ENCOUNTER) {
                    --numEliteEncounters;
                }
                ++numEncountersSinceRestPoint;
            } else if (type === NODE_TYPES.TREASURE) {
                transformedNode.treasure = {
                    ...getRandomItem(treasure),
                    puzzle: getRandomItem([ComboPuzzle, ReelLockPuzzle, RedBluePuzzle]),
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

        baseRoute.nodes.forEach((node) => {
            if (!initialNode) {
                // First one is always a normal fight
                initialNode = {
                    ...node,
                    id: uuid.v4(),
                    type: NODE_TYPES.ENCOUNTER,
                    encounter: generateWaves(NODE_TYPES.ENCOUNTER, baseRoute.enemies || route.enemies),
                };
                currentNode = initialNode;
                ++numEncountersSinceRestPoint;
                return;
            }

            const next = generateTreeNode(node);
            if (currentNode) {
                currentNode.next = [next];
            }
            currentNode = next;
        });

        if (baseRoute.next) {
            currentNode.next = baseRoute.next.map(generateBranch);
        }

        return initialNode;
    };

    return generateBranch(route);
};

export default generateTravelRoute;

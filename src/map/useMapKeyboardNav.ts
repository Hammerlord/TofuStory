import { useEffect } from "react";
import { GeneratedRouteNode } from "./types";

/** A level's nodes, ordered from the uppermost node to the lowermost one. */
const sortTopToBottom = (nodes: GeneratedRouteNode[]): GeneratedRouteNode[] =>
    [...nodes].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));

export const getNodeIndexForTravelKey = (key: string, numNodes: number): number | null => {
    if (numNodes <= 0) {
        return null;
    }

    switch (key) {
        case "ArrowUp":
            return numNodes >= 2 ? 0 : null;
        case "ArrowRight":
            return Math.floor((numNodes - 1) / 2);
        case "ArrowDown":
            return numNodes >= 2 ? numNodes - 1 : null;
        default:
            return null;
    }
};

export interface UseMapKeyboardNavOptions {
    /** The nodes the player may travel to, ie. the nodes of the level after the player's. */
    nextNodes?: GeneratedRouteNode[];
    /** Called with the node the player travelled to. */
    onSelectNode: (node: GeneratedRouteNode) => void;
    /** When false, the travel keys are ignored (eg. while an overlay covers the map). */
    enabled?: boolean;
}

/**
 * Lets the player travel along the overworld map with the arrow keys.
 */
const useMapKeyboardNav = ({
    nextNodes,
    onSelectNode,
    enabled = true,
}: UseMapKeyboardNavOptions) => {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.repeat) {
                return;
            }

            const nodes = sortTopToBottom(nextNodes ?? []);
            const nodeIndex = getNodeIndexForTravelKey(event.key, nodes.length);
            const node = nodeIndex === null ? undefined : nodes[nodeIndex];

            if (!node) {
                return;
            }

            event.preventDefault();
            onSelectNode(node);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [enabled, nextNodes, onSelectNode]);
};

export default useMapKeyboardNav;

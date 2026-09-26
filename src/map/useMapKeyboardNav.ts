import { useEffect } from "react";
import { GeneratedRouteNode } from "./types";

/** How high up the map a node sits, as a fraction of the map's height (0 = top, 1 = bottom). */
const getY = (node: GeneratedRouteNode) => node.y ?? 0;

/** A level's nodes, ordered from the uppermost node to the lowermost one. */
const sortTopToBottom = (nodes: GeneratedRouteNode[]): GeneratedRouteNode[] =>
    [...nodes].sort((a, b) => getY(a) - getY(b));

/**
 * Which node of the next level a travel key travels to, relative to where the player currently is.
 *
 * The player moves along a vertical stack of nodes, so its height in the map decides where each
 * key takes it:
 * - Right goes to the node directly in front of the player, ie. the one at the player's height.
 * - Up goes to the nearest node above the player, and down to the nearest node below, so neither
 *   does anything when the player is already at the top or the bottom of the next level.
 *
 * A node that is just as far above the player as another one is below it (which happens when the
 * player is level with the gap between two nodes) counts as being in front, so that the upper one
 * is picked.
 */
export const getNodeForTravelKey = (
    key: string,
    playerY: number,
    nextNodes: GeneratedRouteNode[],
): GeneratedRouteNode | null => {
    const nodes = sortTopToBottom(nextNodes);

    if (nodes.length === 0) {
        return null;
    }

    switch (key) {
        case "ArrowUp":
            // The nodes are sorted, so the last node above the player is the closest one.
            return nodes.filter((node) => getY(node) < playerY).pop() ?? null;
        case "ArrowRight":
            return nodes
                .slice(1)
                .reduce(
                    (closest, node) =>
                        Math.abs(getY(node) - playerY) < Math.abs(getY(closest) - playerY)
                            ? node
                            : closest,
                    nodes[0],
                );
        case "ArrowDown":
            return nodes.find((node) => getY(node) > playerY) ?? null;
        default:
            return null;
    }
};

export interface UseMapKeyboardNavOptions {
    /** The node the player is at, whose height in the map the travel keys are relative to. */
    playerNode?: GeneratedRouteNode | null;
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
    playerNode,
    nextNodes,
    onSelectNode,
    enabled = true,
}: UseMapKeyboardNavOptions) => {
    useEffect(() => {
        if (!enabled || !playerNode) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.repeat) {
                return;
            }

            const node = getNodeForTravelKey(event.key, getY(playerNode), nextNodes ?? []);

            if (!node) {
                return;
            }

            event.preventDefault();
            onSelectNode(node);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [enabled, playerNode, nextNodes, onSelectNode]);
};

export default useMapKeyboardNav;

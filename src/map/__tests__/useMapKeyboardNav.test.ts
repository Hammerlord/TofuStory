import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderHook } from "@testing-library/react";
import useMapKeyboardNav from "../useMapKeyboardNav";
import { GeneratedRouteNode } from "../types";

const makeNode = (id: string, y: number): GeneratedRouteNode => ({
    id,
    routeId: "test-route",
    y,
});

/** Renders the hook with the player at `playerY` and the given level ahead of them. */
const renderMapKeyboardNav = ({
    playerY = 0.5,
    nextNodes,
    enabled,
}: {
    playerY?: number;
    nextNodes: GeneratedRouteNode[];
    enabled?: boolean;
}) => {
    const onSelectNode = vi.fn();
    renderHook(() =>
        useMapKeyboardNav({
            playerNode: makeNode("player", playerY),
            nextNodes,
            onSelectNode,
            enabled,
        }),
    );

    return {
        onSelectNode,
        pressKey: (key: string, options?: { repeat?: boolean }) =>
            fireEvent.keyDown(window, { key, repeat: options?.repeat }),
    };
};

const expectTravelledTo = (onSelectNode: ReturnType<typeof vi.fn>, id: string) =>
    expect(onSelectNode).toHaveBeenLastCalledWith(expect.objectContaining({ id }));

describe("useMapKeyboardNav", () => {
    it("travels to the node above, in front of, and below the player", () => {
        // The level is deliberately out of order to prove the nodes are stacked by their y position.
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            nextNodes: [makeNode("front", 0.5), makeNode("above", 0.4), makeNode("below", 0.6)],
        });

        pressKey("ArrowUp");
        expectTravelledTo(onSelectNode, "above");

        pressKey("ArrowRight");
        expectTravelledTo(onSelectNode, "front");

        pressKey("ArrowDown");
        expectTravelledTo(onSelectNode, "below");

        expect(onSelectNode).toHaveBeenCalledTimes(3);
    });

    it("travels relative to the player when they are not level with the middle node", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            playerY: 0.45,
            nextNodes: [makeNode("top", 0.4), makeNode("middle", 0.5), makeNode("bottom", 0.6)],
        });

        // The player is level with the gap between the top and middle nodes, so the top one is
        // the node in front of them rather than the middle one.
        pressKey("ArrowRight");
        expectTravelledTo(onSelectNode, "top");

        // The top node is also the only node above the player, and the middle one is the closest
        // below them.
        pressKey("ArrowUp");
        expectTravelledTo(onSelectNode, "top");

        pressKey("ArrowDown");
        expectTravelledTo(onSelectNode, "middle");

        expect(onSelectNode).toHaveBeenCalledTimes(3);
    });

    it("treats a node level with the gap between two nodes as the one in front", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            playerY: 0.45,
            nextNodes: [makeNode("top", 0.4), makeNode("bottom", 0.5)],
        });

        pressKey("ArrowRight");
        expectTravelledTo(onSelectNode, "top");
        expect(onSelectNode).toHaveBeenCalledTimes(1);

        pressKey("ArrowDown");
        expectTravelledTo(onSelectNode, "bottom");
    });

    it("travels to the only node of a single node level with the right arrow key", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            playerY: 0.42,
            nextNodes: [makeNode("only", 0.5)],
        });

        pressKey("ArrowRight");
        expect(onSelectNode).toHaveBeenCalledTimes(1);
        expectTravelledTo(onSelectNode, "only");
    });

    it("cannot travel up or down when the next level has only one node", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            nextNodes: [makeNode("only", 0.5)],
        });

        pressKey("ArrowUp");
        pressKey("ArrowDown");

        expect(onSelectNode).not.toHaveBeenCalled();
    });

    it("cannot travel up when the player is at the top of the next level", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            playerY: 0.3,
            nextNodes: [makeNode("top", 0.4), makeNode("bottom", 0.5)],
        });

        pressKey("ArrowUp");

        expect(onSelectNode).not.toHaveBeenCalled();
    });

    it("cannot travel down when the player is at the bottom of the next level", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            playerY: 0.6,
            nextNodes: [makeNode("top", 0.4), makeNode("bottom", 0.5)],
        });

        pressKey("ArrowDown");

        expect(onSelectNode).not.toHaveBeenCalled();
    });

    it("ignores keys when the next level has no nodes", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({ nextNodes: [] });

        pressKey("ArrowUp");
        pressKey("ArrowRight");
        pressKey("ArrowDown");

        expect(onSelectNode).not.toHaveBeenCalled();
    });

    it("ignores keys that are not travel keys", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            nextNodes: [makeNode("top", 0.4), makeNode("bottom", 0.5)],
        });

        pressKey("ArrowLeft");
        pressKey("Enter");
        pressKey("a");

        expect(onSelectNode).not.toHaveBeenCalled();
    });

    it("ignores keys while disabled", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            nextNodes: [makeNode("only", 0.5)],
            enabled: false,
        });

        pressKey("ArrowRight");

        expect(onSelectNode).not.toHaveBeenCalled();
    });

    it("ignores held down keys so a single press only travels one node", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            nextNodes: [makeNode("top", 0.4), makeNode("bottom", 0.5)],
        });

        pressKey("ArrowDown", { repeat: true });

        expect(onSelectNode).not.toHaveBeenCalled();
    });
});

import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderHook } from "@testing-library/react";
import useMapKeyboardNav from "../useMapKeyboardNav";
import { GeneratedRouteNode } from "../types";

const makeNode = (id: string, y: number): GeneratedRouteNode => ({
    id,
    routeId: "test-route",
    y,
});

const renderMapKeyboardNav = ({
    nextNodes,
    enabled,
}: {
    nextNodes: GeneratedRouteNode[];
    enabled?: boolean;
}) => {
    const onSelectNode = vi.fn();
    renderHook(() => useMapKeyboardNav({ nextNodes, onSelectNode, enabled }));

    return {
        onSelectNode,
        pressKey: (key: string, options?: { repeat?: boolean }) =>
            fireEvent.keyDown(window, { key, repeat: options?.repeat }),
    };
};

describe("useMapKeyboardNav", () => {
    it("travels to the upper, middle, and lower node of the next level", () => {
        // The level is deliberately out of order to prove the nodes are stacked by their y position.
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            nextNodes: [makeNode("middle", 0.5), makeNode("upper", 0.3), makeNode("lower", 0.7)],
        });

        pressKey("ArrowUp");
        expect(onSelectNode).toHaveBeenLastCalledWith(expect.objectContaining({ id: "upper" }));

        pressKey("ArrowRight");
        expect(onSelectNode).toHaveBeenLastCalledWith(expect.objectContaining({ id: "middle" }));

        pressKey("ArrowDown");
        expect(onSelectNode).toHaveBeenLastCalledWith(expect.objectContaining({ id: "lower" }));

        expect(onSelectNode).toHaveBeenCalledTimes(3);
    });

    it("travels to the only node of a single node level with the right arrow key", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            nextNodes: [makeNode("only", 0.5)],
        });

        pressKey("ArrowRight");
        expect(onSelectNode).toHaveBeenCalledTimes(1);
        expect(onSelectNode).toHaveBeenLastCalledWith(expect.objectContaining({ id: "only" }));
    });

    it("cannot travel up or down when the next level only has one node", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            nextNodes: [makeNode("only", 0.5)],
        });

        pressKey("ArrowUp");
        pressKey("ArrowDown");

        expect(onSelectNode).not.toHaveBeenCalled();
    });

    it("travels to the upper and lower node of a two node level", () => {
        const { onSelectNode, pressKey } = renderMapKeyboardNav({
            nextNodes: [makeNode("upper", 0.4), makeNode("lower", 0.6)],
        });

        pressKey("ArrowUp");
        expect(onSelectNode).toHaveBeenLastCalledWith(expect.objectContaining({ id: "upper" }));

        pressKey("ArrowDown");
        expect(onSelectNode).toHaveBeenLastCalledWith(expect.objectContaining({ id: "lower" }));

        expect(onSelectNode).toHaveBeenCalledTimes(2);
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
            nextNodes: [makeNode("upper", 0.4), makeNode("lower", 0.6)],
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
            nextNodes: [makeNode("upper", 0.4), makeNode("lower", 0.6)],
        });

        pressKey("ArrowDown", { repeat: true });

        expect(onSelectNode).not.toHaveBeenCalled();
    });
});

import { describe, expect, it, vi } from "vitest";
import { detectKeyboardMode, detectMouseMode } from "../../globalInput";
import { getConfiguredStore } from "../../store";
import { inputStateSlice } from "../inputReducer";

const { setKeyboardMode } = inputStateSlice.actions;

const getKeyboardMode = (store: ReturnType<typeof getConfiguredStore>) =>
    store.getState().input.isKeyboardMode;

describe("input mode", () => {
    describe("the input slice", () => {
        it("starts off the keyboard, and is not part of the player's save data", () => {
            const store = getConfiguredStore();

            expect(getKeyboardMode(store)).toBe(false);
            expect(store.getState().character).not.toHaveProperty("isKeyboardMode");
        });

        it("switches between the keyboard and the mouse", () => {
            const store = getConfiguredStore();

            expect(getKeyboardMode(store)).toBe(false);
            store.dispatch(setKeyboardMode(true));
            expect(getKeyboardMode(store)).toBe(true);
            store.dispatch(setKeyboardMode(false));
            expect(getKeyboardMode(store)).toBe(false);
        });
    });

    describe("detectKeyboardMode", () => {
        it("switches on for a gameplay keypress", () => {
            const store = getConfiguredStore();

            detectKeyboardMode(store)(new KeyboardEvent("keydown", { key: "ArrowRight" }));

            expect(getKeyboardMode(store)).toBe(true);
        });

        it("ignores modifier-only presses", () => {
            const store = getConfiguredStore();

            ["Shift", "Control", "Alt", "Meta"].forEach((key) =>
                detectKeyboardMode(store)(new KeyboardEvent("keydown", { key })),
            );

            expect(getKeyboardMode(store)).toBe(false);
        });

        it("leaves the browser's own shortcuts to the browser", () => {
            const store = getConfiguredStore();

            detectKeyboardMode(store)(new KeyboardEvent("keydown", { key: "r", ctrlKey: true }));
            detectKeyboardMode(store)(new KeyboardEvent("keydown", { key: "q", metaKey: true }));

            expect(getKeyboardMode(store)).toBe(false);
        });

        it("still counts a keypress aimed at a focused button as the keyboard", () => {
            const store = getConfiguredStore();

            detectKeyboardMode(store)(new KeyboardEvent("keydown", { key: "Enter" }));

            expect(getKeyboardMode(store)).toBe(true);
        });

        it("does not dispatch again while already on the keyboard", () => {
            const store = getConfiguredStore();
            const spy = vi.spyOn(store, "dispatch");
            detectKeyboardMode(store)(new KeyboardEvent("keydown", { key: "ArrowRight" }));
            const dispatchesWhileOn = spy.mock.calls.length;

            detectKeyboardMode(store)(new KeyboardEvent("keydown", { key: "ArrowRight" }));

            expect(getKeyboardMode(store)).toBe(true);
            expect(spy.mock.calls.length).toBe(dispatchesWhileOn);
        });
    });

    describe("detectMouseMode", () => {
        it("switches off as soon as the player uses the mouse", () => {
            const store = getConfiguredStore();
            detectKeyboardMode(store)(new KeyboardEvent("keydown", { key: "ArrowRight" }));

            detectMouseMode(store)();

            expect(getKeyboardMode(store)).toBe(false);
        });

        it("does not dispatch while the player is already on the mouse", () => {
            const store = getConfiguredStore();
            const spy = vi.spyOn(store, "dispatch");

            detectMouseMode(store)();

            expect(spy).not.toHaveBeenCalled();
        });
    });
});

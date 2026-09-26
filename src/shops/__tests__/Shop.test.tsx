import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import "../../battle/actions/phases/phases";
import { Ability } from "../../ability/types";
import { warriorDefaultAttack } from "../../ability/warrior/warriorAbilities";
import { playerStateSlice } from "../../character/playerReducer";
import { Item } from "../../item/types";
import { tofuSpecial } from "../../item/items";
import { PLAYER_CLASSES } from "../../Menu/types";
import Shop from "../Shop";
import { getConfiguredStore } from "../../store";

vi.mock("../../ability/AbilityView/AbilityView", () => ({
    default: ({ ability }: { ability: Ability }) => (
        <div data-testid="mock-ability-view">{ability.name}</div>
    ),
}));

vi.mock("../../item/ItemView", () => ({
    default: ({ item }: { item: Item }) => <div data-testid="mock-item-view">{item.name}</div>,
}));

// jsdom does not implement the Web Animations API, which the shop uses for its entrance
// and purchase animations. So stub them here.
const animateStub = vi.fn(() => ({
    cancel: vi.fn(),
    finished: Promise.resolve(),
}));

Element.prototype.animate = animateStub as unknown as typeof Element.prototype.animate;

const renderShop = (mesos: number, onExit = () => {}) => {
    const store = getConfiguredStore();
    store.dispatch(
        playerStateSlice.actions.onSelectClass({
            selectedClass: PLAYER_CLASSES.WARRIOR,
            deck: [warriorDefaultAttack],
        }),
    );
    store.dispatch(playerStateSlice.actions.updateMesos(mesos));

    render(
        <Provider store={store}>
            <Shop onExit={onExit} />
        </Provider>,
    );

    return store;
};

const pressKey = (key: string) => fireEvent.keyDown(window, { key });

const getStockNames = (testId: string) =>
    screen.getAllByTestId(testId).map((element) => element.textContent);

const getEntryNames = () => [
    ...getStockNames("mock-ability-view"),
    ...getStockNames("mock-item-view"),
];

const getReticles = () => Array.from(document.querySelectorAll(".keyboard-reticle"));

const getSelectedSlot = (): HTMLElement | null => {
    const buyButton = screen.queryByRole("button", { name: /^Buy/ });
    return buyButton ? (buyButton.closest("div")?.parentElement as HTMLElement) : null;
};

const getSelectedName = (): string | null => {
    const slot = getSelectedSlot();
    if (!slot) {
        return null;
    }

    return (
        within(slot).queryByTestId("mock-ability-view")?.textContent ??
        within(slot).queryByTestId("mock-item-view")?.textContent ??
        null
    );
};

const getSelectedPriceText = (): string | null => {
    const slot = getSelectedSlot();
    return slot ? (within(slot).queryByText(/FREE|\d+/)?.textContent ?? null) : null;
};

const focusEntry = (count: number) => {
    for (let i = 0; i < count; i++) {
        pressKey("ArrowRight");
    }
};

const FOOD_NAMES = ["Tofu", "Tofu Soup"];

const getItemEntryIndex = (name: string) => getEntryNames().lastIndexOf(name);

describe("shop keyboard controls", () => {
    it("marks the card the arrows point at and buys it on confirm", () => {
        const store = renderShop(100000);
        const abilities = getStockNames("mock-ability-view");

        expect(getReticles()).toHaveLength(0);
        expect(screen.queryByRole("button", { name: /^Buy/ })).toBeNull();

        pressKey("ArrowRight");

        expect(getReticles()).toHaveLength(1);
        expect(getReticles()[0].parentElement).toContainElement(
            screen.getAllByTestId("mock-ability-view")[1],
        );
        expect(getSelectedName()).toBe(abilities[1]);

        pressKey("Enter");

        expect(store.getState().character.deck).toHaveLength(2);
        expect(store.getState().character.player?.mesos).toBeLessThan(100000);
        expect(getReticles()).toHaveLength(0);
        expect(screen.queryByRole("button", { name: /^Buy/ })).toBeNull();
    });

    it("moves onto the next card in stock, skipping the sold slot", () => {
        renderShop(100000);
        const abilities = getStockNames("mock-ability-view");

        pressKey("ArrowRight");
        pressKey("Enter");

        pressKey("ArrowRight");

        expect(getSelectedName()).toBe(abilities[2]);
    });

    it("does not buy a card the player cannot afford", () => {
        const store = renderShop(0);
        const deckSize = store.getState().character.deck.length;

        pressKey("ArrowRight");

        expect(getReticles()).toHaveLength(1);
        expect(getSelectedName()).toBeNull();

        pressKey("Enter");

        expect(store.getState().character.deck).toHaveLength(deckSize);
        expect(store.getState().character.player?.mesos).toBe(0);
    });

    it("buys an item from the item column", () => {
        const store = renderShop(100000);
        const itemViews = screen.getAllByTestId("mock-item-view");
        const entryIndex = getItemEntryIndex(FOOD_NAMES[0]);

        focusEntry(entryIndex);

        expect(getReticles()[0].parentElement).toContainElement(
            itemViews[entryIndex - getStockNames("mock-ability-view").length],
        );
        expect(getSelectedName()).toBe(FOOD_NAMES[0]);

        pressKey("Enter");

        expect(store.getState().character.player?.items.map((item) => item.name)).toContain(
            FOOD_NAMES[0],
        );
        expect(store.getState().character.player?.mesos).toBeLessThan(100000);
    });

    it("honours the free food charge, and charges for the next food", () => {
        const store = renderShop(100000);
        store.dispatch(playerStateSlice.actions.acquireItems([tofuSpecial]));

        focusEntry(getItemEntryIndex(FOOD_NAMES[0]));

        expect(getSelectedPriceText()).toBe("FREE");
        pressKey("Enter");

        expect(store.getState().character.player?.mesos).toBe(100000);
        expect(store.getState().character.player?.items.map((item) => item.name)).toContain(
            FOOD_NAMES[0],
        );

        focusEntry(getItemEntryIndex(FOOD_NAMES[1]));

        expect(getSelectedPriceText()).toBe("50");
        pressKey("Enter");

        expect(store.getState().character.player?.mesos).toBe(99950);
    });

    it("refreshes the stock on R", () => {
        const store = renderShop(100000);

        pressKey("ArrowRight");
        pressKey("R");

        expect(store.getState().character.player?.mesos).toBe(99950);
        expect(getReticles()).toHaveLength(0);
    });

    it("does not refresh when the player cannot pay for it", () => {
        const store = renderShop(0);

        pressKey("R");

        expect(store.getState().character.player?.mesos).toBe(0);
    });

    it("closes the shop on Q", () => {
        const onExit = vi.fn();
        renderShop(100000, onExit);

        pressKey("Q");

        expect(onExit).toHaveBeenCalledTimes(1);
    });
});

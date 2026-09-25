import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import CardRemovalGrid from "../CardRemovalGrid";
import { REMOVING_CLASS } from "../panelAnimation";
import { CombatAbility } from "../../ability/types";
import { createCombatAbility } from "../../ability/createCombatAbility";
import { warriorDefaultAttack } from "../../ability/warrior/warriorAbilities";
import { Item, ITEM_TYPES } from "../../item/types";

vi.mock("../../ability/AbilityView/AbilityView", () => ({
    default: ({ ability }: { ability: CombatAbility }) => (
        <div data-testid="mock-ability-view">{ability.name}</div>
    ),
}));

vi.mock("../../images/icons", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../images/icons")>();
    return {
        ...actual,
        XIcon: () => <span data-testid="mock-x-icon">X</span>,
    };
});

// jsdom does not implement the Web Animations API; record what the code tries to animate.
const animateCalls: Array<{ target: HTMLElement; options: KeyframeAnimationOptions }> = [];

const animateStub = vi.fn(function (
    this: HTMLElement,
    frames: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions,
) {
    animateCalls.push({ target: this, options: (options as KeyframeAnimationOptions) || {} });
    return {
        cancel: vi.fn(),
        play: vi.fn(),
        pause: vi.fn(),
        finish: vi.fn(),
    };
});

beforeEach(() => {
    vi.useFakeTimers();
    animateCalls.length = 0;
    Element.prototype.animate = animateStub as unknown as typeof Element.prototype.animate;
});

afterEach(() => {
    vi.useRealTimers();
    // @ts-expect-error - test cleanup
    delete Element.prototype.animate;
});

const makeCard = (name: string, instanceId: string): CombatAbility => {
    const card = createCombatAbility(warriorDefaultAttack);
    return { ...card, name, instanceId };
};

const renderGrid = (cards: CombatAbility[], onRemoveAbility = vi.fn()) => {
    render(<CardRemovalGrid cards={cards} onRemoveAbility={onRemoveAbility} />);
    return { onRemoveAbility };
};

const selectAndRemove = () => {
    fireEvent.click(screen.getAllByTestId("mock-ability-view")[0]);
    fireEvent.click(screen.getByText("Remove Selection"));
};

const RemovingIncenseParent = ({
    cards,
    onRemove,
}: {
    cards: CombatAbility[];
    onRemove: (updatedDeck: CombatAbility[]) => void;
}) => {
    const [deck, setDeck] = useState(cards);
    const [usingItem, setUsingItem] = useState<Item | null>({
        name: "Incense",
        image: "",
        type: ITEM_TYPES.CONSUMABLE,
        removeCard: true,
        stacks: 2,
    });

    const handleRemoveAbility = (updatedDeck: CombatAbility[]) => {
        onRemove(updatedDeck);
        setDeck(updatedDeck);
        setUsingItem((prev) => {
            if (prev && prev.stacks && prev.stacks > 1) {
                return { ...prev, stacks: prev.stacks - 1 };
            }
            return null;
        });
    };

    return usingItem ? (
        <CardRemovalGrid cards={deck} onRemoveAbility={handleRemoveAbility} />
    ) : null;
};

describe("CardRemovalGrid removal close animation", () => {
    it("plays the removed card's fade-out before the grid starts closing (single card)", () => {
        const card = makeCard("Attack", "single-card");
        const { onRemoveAbility } = renderGrid([card]);

        const tile = () =>
            screen.getByTestId("mock-ability-view").parentElement?.parentElement as HTMLElement;
        const panel = screen.getByText("Remove An Ability").parentElement
            ?.parentElement as HTMLElement;

        selectAndRemove();

        expect(tile().className).toContain(REMOVING_CLASS);
        expect(panel.className).not.toContain("panelClosing");
        expect(onRemoveAbility).not.toHaveBeenCalled();
        expect(
            animateCalls.some(
                ({ target, options }) =>
                    target === tile() && options.duration === 300,
            ),
        ).toBe(true);

        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(panel.className).not.toContain("panelClosing");
        expect(onRemoveAbility).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(panel.className).toContain("panelClosing");
        expect(onRemoveAbility).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(400);
        });
        expect(onRemoveAbility).toHaveBeenCalledTimes(1);
    });

    it("reopens the grid for the next Incense instead of being stuck closed", () => {
        const cards = [makeCard("Attack", "card-a"), makeCard("Heavy Attack", "card-b")];
        const onRemove = vi.fn();
        render(<RemovingIncenseParent cards={cards} onRemove={onRemove} />);

        const panel = () =>
            screen.getByText("Remove An Ability").parentElement?.parentElement as HTMLElement;

        selectAndRemove();
        act(() => {
            vi.advanceTimersByTime(700);
        });

        expect(onRemove).toHaveBeenCalledTimes(1);
        expect(onRemove).toHaveBeenNthCalledWith(1, [cards[1]]);
        expect(panel().className).not.toContain("panelClosing");
        expect(screen.getAllByTestId("mock-ability-view")).toHaveLength(1);

        fireEvent.click(screen.getAllByTestId("mock-ability-view")[0]);
        fireEvent.click(screen.getByText("Remove Selection"));
        act(() => {
            vi.advanceTimersByTime(700);
        });

        expect(onRemove).toHaveBeenCalledTimes(2);
        expect(onRemove).toHaveBeenNthCalledWith(2, []);
        expect(screen.queryByText("Remove An Ability")).toBeNull();
    });
});

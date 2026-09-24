import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import CardRemovalGrid from "../CardRemovalGrid";
import { REMOVING_CLASS } from "../panelAnimation";
import { CombatAbility } from "../../ability/types";
import { createCombatAbility } from "../../ability/createCombatAbility";
import { warriorDefaultAttack } from "../../ability/warrior/warriorAbilities";

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
});

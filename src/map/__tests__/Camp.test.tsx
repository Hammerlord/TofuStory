import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createCombatAbility } from "../../ability/createCombatAbility";
import { warriorDefaultAttack } from "../../ability/warrior/warriorAbilities";
import defaultCharacterProperties from "../../character/defaultCharacterProperties";
import { Item } from "../../item/types";
import { coffeePot, personalAnvil } from "../../item/items";
import { NUM_CAMP_TRANSMUTATIONS } from "../../shops/constants";
import Camp from "../Camp";

const testCard = createCombatAbility(warriorDefaultAttack);

vi.mock("../../shops/Transmutation", () => ({
    TransmutationView: function MockTransmutationView(props: any) {
        return (
            <div data-testid="mock-transmutation-view">
                <h2>Transmute Ability</h2>
                <p>Transmutations left: {props.numTransmutations}</p>
                <button
                    onClick={() =>
                        props.onTransmuted({
                            card: testCard.instanceId,
                            for: { instanceId: "test-for-id", name: "Test Card" },
                        })
                    }
                >
                    Confirm Transmute
                </button>
                <button onClick={props.onCancelTransmute}>Cancel</button>
            </div>
        );
    },
}));

vi.mock("../../Menu/CardUpgradeGrid", () => ({
    default: function MockCardUpgradeGrid({ onConfirm }: any) {
        return (
            <div data-testid="mock-upgrade-grid">
                <h2>Upgrade an Ability</h2>
                <button onClick={() => onConfirm([])}>Confirm Upgrade</button>
            </div>
        );
    },
}));

const renderCamp = (extraItems: Item[] = []) => {
    const player = {
        ...defaultCharacterProperties,
        items: [...defaultCharacterProperties.items, personalAnvil, ...extraItems],
    };

    const updateDeck = vi.fn();
    const updatePlayer = vi.fn();
    const onExit = vi.fn();

    render(
        <Camp
            onExit={onExit}
            player={player}
            deck={[testCard]}
            updateDeck={updateDeck}
            updatePlayer={updatePlayer}
        />,
    );

    return { updateDeck, updatePlayer, onExit };
};

describe("Camp transmutation", () => {
    it("allows transmuting a card when the player owns an item that enables it", () => {
        renderCamp();

        fireEvent.click(screen.getByText("TRANSMUTE"));

        expect(screen.getByText("Transmute Ability")).toBeInTheDocument();
    });

    it("grants exactly one free transmutation at the campsite", () => {
        renderCamp();

        fireEvent.click(screen.getByText("TRANSMUTE"));

        expect(
            screen.getByText(`Transmutations left: ${NUM_CAMP_TRANSMUTATIONS}`),
        ).toBeInTheDocument();
        expect(NUM_CAMP_TRANSMUTATIONS).toBe(1);
    });

    it("decrements activities remaining when a transmutation is completed", async () => {
        const { updateDeck } = renderCamp();

        expect(screen.getByText("Activities remaining: 1")).toBeInTheDocument();

        fireEvent.click(screen.getByText("TRANSMUTE"));
        fireEvent.click(screen.getByText("Confirm Transmute"));

        await waitFor(() => {
            expect(screen.getByText("Activities remaining: 0")).toBeInTheDocument();
        });
    });

    it("disables transmute when there are no activities remaining", () => {
        // The Coffee Pot grants an extra camp activity, so the player starts with 2.
        renderCamp([coffeePot]);

        expect(screen.getByText("Activities remaining: 2")).toBeInTheDocument();

        // Spend both activities hone-ing, leaving 0 remaining.
        for (let i = 0; i < 2; i++) {
            fireEvent.click(screen.getByText("HONE"));
            fireEvent.click(screen.getByText("Confirm Upgrade"));
        }

        expect(screen.getByText("Activities remaining: 0")).toBeInTheDocument();

        // Transmute must be disabled when there are no activities remaining.
        const transmuteActivity = screen.getByText("TRANSMUTE").parentElement as HTMLElement;
        expect(transmuteActivity).toHaveClass("disabled");

        fireEvent.click(screen.getByText("TRANSMUTE"));
        expect(screen.queryByText("Transmute Ability")).not.toBeInTheDocument();
    });
});
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createCombatAbility } from "../../ability/createCombatAbility";
import { warriorDefaultAttack } from "../../ability/warrior/warriorAbilities";
import defaultCharacterProperties from "../../character/defaultCharacterProperties";
import { personalAnvil } from "../../item/items";
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

const renderCamp = () => {
    const player = {
        ...defaultCharacterProperties,
        items: [...defaultCharacterProperties.items, personalAnvil],
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
});

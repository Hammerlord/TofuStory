import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { createCombatAbility } from "../../ability/createCombatAbility";
import { warriorDefaultAttack } from "../../ability/warrior/warriorAbilities";
import defaultCharacterProperties from "../../character/defaultCharacterProperties";
import { personalAnvil } from "../../item/items";
import { NUM_CAMP_TRANSMUTATIONS } from "../../shops/constants";
import Camp from "../Camp";

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
            deck={[createCombatAbility(warriorDefaultAttack)]}
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
});

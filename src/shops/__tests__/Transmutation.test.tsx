// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { warriorDefaultAttack } from "../../ability/warrior/warriorAbilities";
import { playerStateSlice } from "../../character/playerReducer";
import { PLAYER_CLASSES } from "../../Menu/types";
import { BASE_NUM_TRANSMUTATIONS } from "../../shops/constants";
import Transmutation from "../../shops/Transmutation";
import { getConfiguredStore } from "../../store";

const renderShopTransmutation = () => {
    const store = getConfiguredStore();
    store.dispatch(
        playerStateSlice.actions.onSelectClass({
            selectedClass: PLAYER_CLASSES.WARRIOR,
            deck: [warriorDefaultAttack],
        }),
    );

    render(
        <Provider store={store}>
            <Transmutation onExit={() => {}} />
        </Provider>,
    );

    return store;
};

describe("non-campsite transmutation", () => {
    it("renders the transmutation view", () => {
        renderShopTransmutation();

        expect(screen.getByText("Transmute Ability")).toBeInTheDocument();
    });

    it("grants the base number of free transmutations outside of the campsite", () => {
        renderShopTransmutation();

        expect(
            screen.getByText(`Transmutations left: ${BASE_NUM_TRANSMUTATIONS}`),
        ).toBeInTheDocument();
        expect(BASE_NUM_TRANSMUTATIONS).toBe(3);
    });
});

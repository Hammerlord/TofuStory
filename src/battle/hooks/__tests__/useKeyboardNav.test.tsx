import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { Ability, CombatAbility } from "../../../ability/types";
import { createCombatAbility } from "../../../ability/createCombatAbility";
import {
    bash,
    cleave,
    closeCombat,
    slam,
    whirlwind,
} from "../../../ability/warrior/warriorAbilities";
import defaultCharacterProperties from "../../../character/defaultCharacterProperties";
import { useAppSelector } from "../../../hooks";
import { inputStateSlice } from "../../../input/inputReducer";
import { getConfiguredStore } from "../../../store";
import { battleStateSlice } from "../../reducer";
import { BattleControls } from "../useBattleControls";
import { useKeyboardNav } from "../useKeyboardNav";

const { setKeyboardMode } = inputStateSlice.actions;
const { updateBattle, selectHandAbility } = battleStateSlice.actions;

const HAND_ABILITIES = [closeCombat, bash, cleave, slam, whirlwind];

const makeHand = (abilities: Ability[] = HAND_ABILITIES): CombatAbility[] =>
    abilities.map((ability) => createCombatAbility(ability));

const renderKeyboardNav = ({
    hand = makeHand(),
    isKeyboardMode = false,
    isPlayerTurn = true,
    disableActions = false,
    preselectedCardId = null,
    resources = 99,
}: {
    hand?: CombatAbility[];
    isKeyboardMode?: boolean;
    isPlayerTurn?: boolean;
    disableActions?: boolean;
    preselectedCardId?: string | null;
    resources?: number;
} = {}) => {
    const store = getConfiguredStore();
    store.dispatch(updateBattle({ hand, isPlayerTurn, selectedHandAbilityId: preselectedCardId }));
    if (isKeyboardMode) {
        store.dispatch(setKeyboardMode(true));
    }

    const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(
        () => {
            // The real controls derive the hand from the battle on the store, so the stub has
            // to do the same for the hook to see a card being played.
            const controls = {
                player: { ...defaultCharacterProperties, resources },
                hand: useAppSelector((state) => state.battle?.hand ?? []),
                movementAbility: closeCombat,
                allowMoveCardFromHandToDeck: false,
                allowFriendlyMovement: false,
                disableActions,
                warn: vi.fn(),
                warnNeedMoreResources: vi.fn(),
                handleAbilityUse: vi.fn(),
                handleSelectCardsPrerequisite: vi.fn(),
                handleMoveCardToDeck: vi.fn(),
            } as unknown as BattleControls;

            return useKeyboardNav(controls);
        },
        { wrapper },
    );

    return { result, store };
};

const selectedCardId = (store: ReturnType<typeof getConfiguredStore>) =>
    store.getState().battle?.selectedHandAbilityId ?? null;

const playCard = (
    store: ReturnType<typeof getConfiguredStore>,
    setKeyboardNav: (nav: null) => void,
    remainingHand: CombatAbility[],
) => {
    // The keyboard clears its selection before playing, then the battle consumes the card.
    act(() => {
        setKeyboardNav(null);
    });
    act(() => {
        store.dispatch(updateBattle({ hand: remainingHand, selectedHandAbilityId: null }));
    });
};

describe("useKeyboardNav keyboard mode", () => {
    it("leaves the hand alone while the player is on the mouse", () => {
        const hand = makeHand();
        const { result, store } = renderKeyboardNav({ hand });

        expect(result.current.keyboardNav).toBeNull();
        expect(store.getState().battle?.selectedHandAbilityId).toBeNull();
    });

    it("selects the first card of the hand when the player is on the keyboard", () => {
        const hand = makeHand();
        const { result, store } = renderKeyboardNav({ hand, isKeyboardMode: true });

        expect(result.current.keyboardNav).toEqual({ mode: "card", cardIndex: 0 });
        expect(selectedCardId(store)).toBe(hand[0].instanceId);
    });

    it("does not steal a card the player has already chosen", () => {
        const hand = makeHand();
        const { result, store } = renderKeyboardNav({
            hand,
            isKeyboardMode: true,
            preselectedCardId: hand[0].instanceId,
        });

        expect(result.current.keyboardNav).toBeNull();
        expect(selectedCardId(store)).toBe(hand[0].instanceId);
    });

    it("waits for the battlefield to be the player's before selecting anything", () => {
        const hand = makeHand();
        const { result, store } = renderKeyboardNav({
            hand,
            isKeyboardMode: true,
            isPlayerTurn: false,
        });

        expect(result.current.keyboardNav).toBeNull();
        expect(selectedCardId(store)).toBeNull();
    });

    it("drops the selection as soon as the player goes back to the mouse", () => {
        const hand = makeHand();
        const { result, store } = renderKeyboardNav({ hand, isKeyboardMode: true });

        expect(result.current.keyboardNav).toEqual({ mode: "card", cardIndex: 0 });

        act(() => {
            store.dispatch(setKeyboardMode(false));
        });

        expect(result.current.keyboardNav).toBeNull();
    });

    it("selects the next card in line once the player plays a card", () => {
        const hand = makeHand();
        const { result, store } = renderKeyboardNav({ hand, isKeyboardMode: true });

        act(() => {
            store.dispatch(selectHandAbility(hand[1].instanceId));
        });
        playCard(store, result.current.setKeyboardNav, [hand[0], hand[2], hand[3], hand[4]]);

        // hand[2] is the card that moved up into the slot the played card left behind.
        expect(result.current.keyboardNav).toEqual({ mode: "card", cardIndex: 1 });
        expect(selectedCardId(store)).toBe(hand[2].instanceId);
    });

    it("selects the last card when the last card in the hand is played", () => {
        const hand = makeHand();
        const { result, store } = renderKeyboardNav({ hand, isKeyboardMode: true });

        act(() => {
            store.dispatch(selectHandAbility(hand[4].instanceId));
        });
        playCard(store, result.current.setKeyboardNav, [hand[0], hand[1], hand[2], hand[3]]);

        expect(result.current.keyboardNav).toEqual({ mode: "card", cardIndex: 3 });
        expect(selectedCardId(store)).toBe(hand[3].instanceId);
    });

    it("does not move the player along when the mouse took over", () => {
        const hand = makeHand();
        const { result, store } = renderKeyboardNav({ hand, isKeyboardMode: true });

        act(() => {
            store.dispatch(setKeyboardMode(false));
            store.dispatch(selectHandAbility(hand[1].instanceId));
        });
        playCard(store, result.current.setKeyboardNav, [hand[0], hand[2], hand[3], hand[4]]);

        expect(result.current.keyboardNav).toBeNull();
        expect(selectedCardId(store)).toBeNull();
    });

    it("leaves the player where they are when they deselect without playing", () => {
        const hand = makeHand();
        const { result, store } = renderKeyboardNav({
            hand,
            isKeyboardMode: true,
            preselectedCardId: hand[1].instanceId,
        });

        act(() => {
            store.dispatch(selectHandAbility(null));
        });

        expect(result.current.keyboardNav).toBeNull();
        expect(selectedCardId(store)).toBeNull();
    });
});

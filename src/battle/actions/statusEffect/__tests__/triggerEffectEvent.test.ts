import { describe, expect, it, vi } from "vitest";
import { ACTION_TYPES, EffectEventTrigger } from "../../../../ability/types";
import { ActionContext } from "../../../../battle/types";
import { onEffectEventTrigger } from "../triggerEffectEvent";

vi.mock("../../../calculateBonus", () => ({
    calculateBonus: vi.fn(() => ({ chance: 0.1 })),
}));

vi.mock("../../../getMultiplier", () => ({
    getMultiplier: vi.fn(() => 1),
}));

vi.mock("../../../passesConditions", () => ({
    passesConditions: vi.fn(() => true),
}));

vi.mock("../../combatantData", () => ({
    findCombatantData: vi.fn(() => ({
        combatant: { id: "test-id", name: "Test", HP: 100, effects: [] },
    })),
}));

vi.mock("../effectLifecycle", () => ({
    checkUpdateEffectLifecycle: vi.fn(() => ({})),
}));

import { calculateBonus } from "../../../calculateBonus";
import { getMultiplier } from "../../../getMultiplier";
import { checkUpdateEffectLifecycle } from "../effectLifecycle";

const makeContext = (overrides: Partial<ActionContext> = {}): ActionContext => ({
    name: "Test",
    sourceChain: [],
    triggerHistory: [],
    isPreviewMode: false,
    ...overrides,
});

const makeEffectEvent = (chance: number): EffectEventTrigger => ({
    type: ACTION_TYPES.NONE,
    chance,
    targetType: undefined,
    effects: [],
});

const makeEffect = () => ({
    id: "test-effect",
    name: "Test Effect",
    type: "none" as const,
    effects: [],
});

describe("checkEffectEventTriggerGate", () => {
    it("does not trigger proc when in preview mode and chance is less than 100%", () => {
        (calculateBonus as ReturnType<typeof vi.fn>).mockReturnValue({ chance: 0.1 });
        (getMultiplier as ReturnType<typeof vi.fn>).mockReturnValue(1);

        const context = makeContext({ isPreviewMode: true });
        const effectEvent = makeEffectEvent(0.1);
        const effect = makeEffect();
        const ownerId = "test-owner";

        const thunk = onEffectEventTrigger({
            effectEvent,
            effectEventKey: "onAttack",
            effect,
            ownerId,
            context,
        });

        const dispatch = vi.fn((action: any) => {
            if (typeof action === "function") {
                return action(dispatch, getState);
            }
            return action;
        });
        const getState = vi.fn(() => ({
            battle: {
                playerSide: [],
                enemySide: [],
                hand: [],
                deck: [],
                discard: [],
            },
        })) as () => any;

        thunk(dispatch, getState);

        expect(checkUpdateEffectLifecycle).not.toHaveBeenCalled();
    });

    it("still triggers proc when in preview mode and chance is exactly 100%", () => {
        (calculateBonus as ReturnType<typeof vi.fn>).mockReturnValue({ chance: 1 });
        (getMultiplier as ReturnType<typeof vi.fn>).mockReturnValue(1);

        const context = makeContext({ isPreviewMode: true });
        const effectEvent = makeEffectEvent(1);
        const effect = makeEffect();
        const ownerId = "test-owner";

        const thunk = onEffectEventTrigger({
            effectEvent,
            effectEventKey: "onAttack",
            effect,
            ownerId,
            context,
        });

        const dispatch = vi.fn((action: any) => {
            if (typeof action === "function") {
                return action(dispatch, getState);
            }
            return action;
        });
        const getState = vi.fn(() => ({
            battle: {
                playerSide: [],
                enemySide: [],
                hand: [],
                deck: [],
                discard: [],
            },
        })) as () => any;

        thunk(dispatch, getState);

        expect(checkUpdateEffectLifecycle).toHaveBeenCalled();
    });

    it("still triggers proc when NOT in preview mode regardless of chance", () => {
        (calculateBonus as ReturnType<typeof vi.fn>).mockReturnValue({ chance: 0.1 });
        (getMultiplier as ReturnType<typeof vi.fn>).mockReturnValue(1);

        const context = makeContext({ isPreviewMode: false });
        const effectEvent = makeEffectEvent(0.1);
        const effect = makeEffect();
        const ownerId = "test-owner";

        const thunk = onEffectEventTrigger({
            effectEvent,
            effectEventKey: "onAttack",
            effect,
            ownerId,
            context,
        });

        const dispatch = vi.fn((action: any) => {
            if (typeof action === "function") {
                return action(dispatch, getState);
            }
            return action;
        });
        const getState = vi.fn(() => ({
            battle: {
                playerSide: [],
                enemySide: [],
                hand: [],
                deck: [],
                discard: [],
            },
        })) as () => any;

        thunk(dispatch, getState);

        expect(checkUpdateEffectLifecycle).toHaveBeenCalled();
    });
});

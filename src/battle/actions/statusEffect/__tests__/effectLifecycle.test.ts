import { describe, expect, it, vi, beforeEach } from "vitest";
import { Effect, EFFECT_CLASSES } from "../../../../ability/types";
import { arcaneAim } from "../../../../ability/magician/magicianAbilities";
import { createCombatEffect } from "../../../../character/effects/createCombatEffect";
import { Combatant } from "../../../../character/types";
import { BATTLEFIELD_SIDES } from "../../../types";
import { AppDispatch, RootState } from "../../../../store";
import { tickDownStatusEffects } from "../effectLifecycle";

vi.mock("../../combatantData", () => ({
    findCombatantData: vi.fn(),
    updateCombatant: vi.fn(),
}));

vi.mock("../../enqueueEvent", () => ({
    enqueueEvent: vi.fn(),
}));

vi.mock("../../statChanges", () => ({
    triggerStatChangeEvents: vi.fn(),
}));

vi.mock("../triggerEffectEvent", () => ({
    onEffectEventTrigger: vi.fn(),
}));

import { findCombatantData, updateCombatant } from "../../combatantData";
import { enqueueEvent } from "../../enqueueEvent";

beforeEach(() => {
    vi.clearAllMocks();
});

describe("tickDownStatusEffects", () => {
    it("removes a 0-duration effect when the owner's turn ends", () => {
        const arcaneAiming = createCombatEffect(arcaneAim.actions[0].effects![0] as Effect);
        expect(arcaneAiming.name).toBe("Arcane Aim");
        expect(arcaneAiming.duration).toBe(0);

        const combatant = {
            id: "player",
            name: "Player",
            HP: 100,
            effects: [arcaneAiming],
        } as Combatant;

        vi.mocked(findCombatantData).mockReturnValue({
            combatant,
            index: 0,
            friendly: [combatant],
            hostile: [],
            friendlySide: BATTLEFIELD_SIDES.PLAYER_SIDE,
            hostileSide: BATTLEFIELD_SIDES.ENEMY_SIDE,
        });

        const getState = vi.fn(() => ({ battle: {} })) as unknown as () => RootState;
        const dispatch = vi.fn((action: unknown) => {
            if (typeof action === "function") {
                return action(dispatch, getState);
            }
            return action;
        }) as unknown as AppDispatch;

        tickDownStatusEffects("player", { name: "End Turn" })(dispatch, getState);

        expect(updateCombatant).toHaveBeenCalledWith({
            combatantId: "player",
            newProperties: { effects: [] },
        });

        expect(enqueueEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                statUpdates: {
                    player: expect.objectContaining({
                        removedEffects: [
                            expect.objectContaining({ id: arcaneAiming.id, duration: -1 }),
                        ],
                    }),
                },
            }),
        );
    });

    it("keeps effects with a positive remaining duration when the owner's turn ends", () => {
        const longLasting = createCombatEffect({
            name: "Long Lasting",
            class: EFFECT_CLASSES.BUFF,
            duration: 3,
        });
        const combatant = {
            id: "player",
            name: "Player",
            HP: 100,
            effects: [longLasting],
        } as Combatant;

        vi.mocked(findCombatantData).mockReturnValue({
            combatant,
            index: 0,
            friendly: [combatant],
            hostile: [],
            friendlySide: BATTLEFIELD_SIDES.PLAYER_SIDE,
            hostileSide: BATTLEFIELD_SIDES.ENEMY_SIDE,
        });

        const getState = vi.fn(() => ({ battle: {} })) as unknown as () => RootState;
        const dispatch = vi.fn((action: unknown) => {
            if (typeof action === "function") {
                return action(dispatch, getState);
            }
            return action;
        }) as unknown as AppDispatch;

        tickDownStatusEffects("player", { name: "End Turn" })(dispatch, getState);

        expect(updateCombatant).toHaveBeenCalledWith({
            combatantId: "player",
            newProperties: {
                effects: [expect.objectContaining({ id: longLasting.id, duration: 2 })],
            },
        });
        expect(enqueueEvent).not.toHaveBeenCalled();
    });
});

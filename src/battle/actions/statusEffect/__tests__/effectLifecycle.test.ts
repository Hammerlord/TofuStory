import { describe, expect, it, vi, beforeEach } from "vitest";
import { Effect, EFFECT_CLASSES } from "../../../../ability/types";
import { arcaneAim } from "../../../../ability/magician/magicianAbilities";
import { createCombatEffect } from "../../../../character/effects/createCombatEffect";
import { ActionContext } from "../../../types";
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
        };

        vi.mocked(findCombatantData).mockReturnValue({
            combatant,
            index: 0,
            friendly: [combatant],
            hostile: [],
            friendlySide: "playerSide",
            hostileSide: "enemySide",
        } as any);

        const getState = vi.fn(() => ({ battle: {} })) as any;
        const dispatch = vi.fn((action: any) => {
            if (typeof action === "function") {
                return action(dispatch, getState);
            }
            return action;
        });

        tickDownStatusEffects("player", { name: "End Turn" } as ActionContext)(dispatch, getState);

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
        };

        vi.mocked(findCombatantData).mockReturnValue({
            combatant,
            index: 0,
            friendly: [combatant],
            hostile: [],
            friendlySide: "playerSide",
            hostileSide: "enemySide",
        } as any);

        const getState = vi.fn(() => ({ battle: {} })) as any;
        const dispatch = vi.fn((action: any) => {
            if (typeof action === "function") {
                return action(dispatch, getState);
            }
            return action;
        });

        tickDownStatusEffects("player", { name: "End Turn" } as ActionContext)(dispatch, getState);

        expect(updateCombatant).toHaveBeenCalledWith({
            combatantId: "player",
            newProperties: {
                effects: [expect.objectContaining({ id: longLasting.id, duration: 2 })],
            },
        });
        expect(enqueueEvent).not.toHaveBeenCalled();
    });
});

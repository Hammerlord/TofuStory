import { describe, expect, it, vi } from "vitest";
import { getUpdatedStats } from "../getUpdatedStats";
import { UpdatedCombatantStats } from "../getUpdatedStats";
import { Combatant } from "../../../character/types";
import { Action } from "../../../ability/types";
import { chargedEffect } from "../../../item/starterItemEffects";
import { createCombatEffect } from "../../../character/effects/createCombatEffect";
import { stageStatChanges } from "../statChanges";
import { BATTLEFIELD_SIDES } from "../../types";

vi.mock("../../calculateDamage", () => ({
    calculateDamage: vi.fn(({ action }) => action.damage || 0),
}));

vi.mock("../../calculateArmor", () => ({
    calculateArmor: vi.fn(() => 0),
}));

vi.mock("../../calculateBonus", () => ({
    calculateBonus: vi.fn(({ action }) => action),
}));

vi.mock("../../utils", () => ({
    calculateMesoMultiplier: vi.fn(({ mesos }) => mesos),
    getMaxHP: vi.fn((c) => c.HP),
}));

vi.mock("../../combatantData", () => ({
    hasEffectType: vi.fn(() => false),
}));

vi.mock("../statusEffect/getEnabledEffects", () => ({
    getEnabledEffects: vi.fn(() => []),
}));

vi.mock("../../targeting/targeting", () => ({
    isNegatedByStealth: vi.fn(() => false),
}));

vi.mock("../../phases/checkHalveArmor", () => ({
    getHalveArmorAmount: vi.fn(() => 0),
}));

function createMockCombatant(overrides: Partial<Combatant> = {}): Combatant {
    return {
        id: "test-target",
        name: "Test Enemy",
        image: "test.png",
        HP: 100,
        maxHP: 100,
        armor: 20,
        effects: [],
        resources: 0,
        isPlayer: false,
        isBoss: false,
        isElite: false,
        damage: 5,
        turnHistory: [],
        abilities: [],
        abilityHistory: [],
        items: [],
        mesos: 0,
        resourcesPerTurn: 0,
        maxResources: 0,
        ...overrides,
    };
}

function createMockGetCombatantById(combatant: Combatant) {
    return (id: string) => {
        if (id === combatant.id) {
            return {
                combatant,
                index: 0,
                friendlySide: BATTLEFIELD_SIDES.ENEMY_SIDE,
                friendly: [combatant],
                hostile: [],
            };
        }
        return undefined;
    };
}

const applyChargedTo = (target: Combatant, effectConfig: typeof chargedEffect = chargedEffect) =>
    getUpdatedStats({
        actorId: "actor",
        targetIds: [target.id],
        action: { effects: [effectConfig], type: "attack" } as Action,
        getCombatantById: createMockGetCombatantById(target),
        deck: [],
        hand: [],
        discard: [],
    });

describe("Charged re-application while already Charged (at stack/application cap)", () => {
    it("a finite maxDuration (restored locally) DROPS the second Charged from statUpdate.effects", () => {
        const withMaxDurationConfig = { ...chargedEffect, maxDuration: 1 };
        const target = createMockCombatant({
            effects: [createCombatEffect(withMaxDurationConfig)],
        });

        const result = applyChargedTo(target, withMaxDurationConfig);
        const statUpdate = result[0].statUpdate as UpdatedCombatantStats;

        expect(statUpdate.effects?.find((e) => e.name === "Charged")).toBeUndefined();
    });

    it("without a finite maxDuration, the second Charged REMAINS in statUpdate.effects (receive events fire)", () => {
        const { maxDuration: _maxDuration, ...noMaxDurationConfig } = chargedEffect;
        const target = createMockCombatant({
            effects: [createCombatEffect(noMaxDurationConfig)],
        });

        const result = applyChargedTo(target, noMaxDurationConfig);
        const statUpdate = result[0].statUpdate as UpdatedCombatantStats;

        expect(statUpdate.effects?.find((e) => e.name === "Charged")).toBeDefined();

        // Piping through the apply pipeline must not stack Charged: one application, stacks still 1.
        const staged = stageStatChanges(statUpdate, target);
        const stagedCharged = staged.effects.filter((e) => e.name === "Charged");
        expect(stagedCharged).toHaveLength(1);
        expect(stagedCharged[0].stacks).toBe(1);
    });

    it("first application (player has no Charged yet) is never dropped regardless of cap config", () => {
        const target = createMockCombatant({ effects: [] });

        const result = applyChargedTo(target);
        const statUpdate = result[0].statUpdate as UpdatedCombatantStats;

        expect(statUpdate.effects?.find((e) => e.name === "Charged")).toBeDefined();
    });
});
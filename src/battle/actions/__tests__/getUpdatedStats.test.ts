import { describe, expect, it, vi } from "vitest";
import { getUpdatedStats } from "../getUpdatedStats";
import { UpdatedCombatantStats } from "../getUpdatedStats";
import { Combatant } from "../../../character/types";
import { Action } from "../../../ability/types";
import { arcaneAim } from "../../../ability/magician/magicianAbilities";
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

const baseAction: Action = { damage: 50, type: "attack" };

describe("getUpdatedStats - damageDealt", () => {
    it("computes damageDealt excluding overkill when damage exceeds armor + HP", () => {
        const target = createMockCombatant({ HP: 50, armor: 10, maxHP: 50 });
        const getCombatantById = createMockGetCombatantById(target);

        const result = getUpdatedStats({
            actorId: "actor",
            targetIds: [target.id],
            action: baseAction,
            getCombatantById,
            deck: [],
            hand: [],
            discard: [],
        });

        const statUpdate = result[0].statUpdate as UpdatedCombatantStats;

        // totalArmor = 10 + 0 = 10, targetApplicableHP = 50
        // damageDealt = min(50, 10 + 50) = min(50, 60) = 50
        expect(statUpdate.damageDealt).toBe(50);
    });

    it("computes damageDealt excluding overkill when heavy damage would cause overkill", () => {
        const target = createMockCombatant({ HP: 50, armor: 10, maxHP: 50 });
        const getCombatantById = createMockGetCombatantById(target);

        const heavyAction: Action = { ...baseAction, damage: 100 };
        const result = getUpdatedStats({
            actorId: "actor",
            targetIds: [target.id],
            action: heavyAction,
            getCombatantById,
            deck: [],
            hand: [],
            discard: [],
        });

        const statUpdate = result[0].statUpdate as UpdatedCombatantStats;

        // totalArmor = 10, targetApplicableHP = 50
        // damageDealt = min(100, 10 + 50) = min(100, 60) = 60
        // Overkill = 100 - 60 = 40 (excluded from damageDealt)
        expect(statUpdate.damageDealt).toBe(60);
        expect(statUpdate.rawDamage).toBe(100);
        expect(statUpdate.rawDamage).toBeGreaterThan(statUpdate.damageDealt);
    });

    it("computes damageDealt equal to rawDamage when damage is less than armor", () => {
        const target = createMockCombatant({ HP: 100, armor: 100, maxHP: 100 });
        const getCombatantById = createMockGetCombatantById(target);

        const weakAction: Action = { ...baseAction, damage: 30 };
        const result = getUpdatedStats({
            actorId: "actor",
            targetIds: [target.id],
            action: weakAction,
            getCombatantById,
            deck: [],
            hand: [],
            discard: [],
        });

        const statUpdate = result[0].statUpdate as UpdatedCombatantStats;

        // totalArmor = 100, targetApplicableHP = 100
        // damageDealt = min(30, 100 + 100) = min(30, 200) = 30
        expect(statUpdate.damageDealt).toBe(30);
        expect(statUpdate.rawDamage).toBe(30);
        expect(statUpdate.damageDealt).toBe(statUpdate.rawDamage);
    });

    it("computes damageDealt correctly when bypassArmor is true", () => {
        const target = createMockCombatant({ HP: 50, armor: 100, maxHP: 50 });
        const getCombatantById = createMockGetCombatantById(target);

        const bypassAction: Action = { ...baseAction, damage: 80, bypassArmor: true };
        const result = getUpdatedStats({
            actorId: "actor",
            targetIds: [target.id],
            action: bypassAction,
            getCombatantById,
            deck: [],
            hand: [],
            discard: [],
        });

        const statUpdate = result[0].statUpdate as UpdatedCombatantStats;

        // bypassArmor: damageDealt = min(80, 50) = 50 (capped at HP)
        expect(statUpdate.damageDealt).toBe(50);
        expect(statUpdate.rawDamage).toBe(80);
    });

    it("keeps a 0-duration status effect (Arcane Aim) at duration 0 so it expires at end of turn", () => {
        const player = createMockCombatant({
            id: "player",
            name: "Player",
            isPlayer: true,
            effects: [],
        });
        const getCombatantById = createMockGetCombatantById(player);

        const result = getUpdatedStats({
            actorId: player.id,
            targetIds: [player.id],
            action: arcaneAim.actions[0] as Action,
            getCombatantById,
            deck: [],
            hand: [],
            discard: [],
        });

        const statUpdate = result[0].statUpdate as UpdatedCombatantStats;
        const appliedArcaneAim = statUpdate.effects?.find((e) => e.name === "Arcane Aim");

        expect(appliedArcaneAim).toBeDefined();
        expect(appliedArcaneAim?.duration).toBe(0);
        expect(appliedArcaneAim?.originalDuration).toBe(0);
    });
});

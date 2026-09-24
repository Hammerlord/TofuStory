import { describe, expect, it } from "vitest";
import { BATTLEFIELD_SIDES, CombatantInfo } from "../../../../battle/types";
import { Combatant } from "../../../../character/types";
import { createCombatEffect } from "../../../../character/effects/createCombatEffect";
import { snailStompers } from "../../../../item/items";
import { getEnabledEffects } from "../getEnabledEffects";

function makeCombatant(overrides: Partial<Combatant> = {}): Combatant {
    return {
        id: "test-combatant",
        name: "Test",
        image: "test.png",
        HP: 100,
        maxHP: 100,
        armor: 0,
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

function makeCombatantInfo(
    combatant: Combatant,
    overrides: Partial<CombatantInfo> = {},
): CombatantInfo {
    return {
        combatant,
        index: 0,
        friendly: [],
        hostile: [],
        friendlySide: BATTLEFIELD_SIDES.PLAYER_SIDE,
        hostileSide: BATTLEFIELD_SIDES.ENEMY_SIDE,
        ...overrides,
    };
}

describe("getEnabledEffects - Snail Stompers condition", () => {
    it("enables Snail Stompers effect when target has 20 or less HP", () => {
        const player = makeCombatant({
            id: "player",
            isPlayer: true,
            effects: [createCombatEffect(snailStompers.effects![0])],
        });
        const playerInfo = makeCombatantInfo(player);

        const target = makeCombatant({
            id: "low-hp-enemy",
            HP: 15,
            maxHP: 15,
        });
        const targetInfo = makeCombatantInfo(target);

        const enabled = getEnabledEffects({
            combatantInfo: playerInfo,
            target: targetInfo,
        });

        expect(enabled.some((e) => e.name === "Snail Stompers")).toBe(true);
    });

    it("disables Snail Stompers effect when target has more than 20 HP", () => {
        const player = makeCombatant({
            id: "player",
            isPlayer: true,
            effects: [createCombatEffect(snailStompers.effects![0])],
        });
        const playerInfo = makeCombatantInfo(player);

        const target = makeCombatant({
            id: "high-hp-enemy",
            HP: 25,
            maxHP: 25,
        });
        const targetInfo = makeCombatantInfo(target);

        const enabled = getEnabledEffects({
            combatantInfo: playerInfo,
            target: targetInfo,
        });

        expect(enabled.some((e) => e.name === "Snail Stompers")).toBe(false);
    });
});

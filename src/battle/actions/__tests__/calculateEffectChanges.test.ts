import { describe, expect, it } from "vitest";
import { burn, chill, taunt } from "../../../ability/Effects";
import { CombatEffect } from "../../../ability/types";
import { createCombatEffect } from "../../../character/effects/createCombatEffect";
import { calculateEffectChanges } from "../calculateEffectChanges";

const applyChillTimes = (count: number): CombatEffect[] =>
    Array.from({ length: count }, () => createCombatEffect(chill));

const getChills = (effects: CombatEffect[]): CombatEffect[] =>
    effects.filter((effect) => effect.name === chill.name);

const getTotalStacks = (effects: CombatEffect[]): number =>
    getChills(effects).reduce((acc, effect) => acc + (effect.stacks || 1), 0);

const getTotalDuration = (effects: CombatEffect[]): number =>
    getChills(effects).reduce((acc, effect) => acc + (effect.duration || 0), 0);

const applyTauntTimes = (count: number): CombatEffect[] =>
    Array.from({ length: count }, () => createCombatEffect(taunt));

const getTaunts = (effects: CombatEffect[]): CombatEffect[] =>
    effects.filter((effect) => effect.name === taunt.name);

describe("calculateEffectChanges", () => {
    it("caps Blizzard's Chill applications at 3 (maxApplications) for a fresh target", () => {
        const result = calculateEffectChanges(applyChillTimes(5), []);

        expect(getChills(result)).toHaveLength(3);
        expect(getTotalStacks(result)).toBe(3);
    });

    it("does not grow Chill stacks past 3 when reapplying at the cap; the lowest-duration application pandemics instead", () => {
        const existingChills = applyChillTimes(3);
        const result = calculateEffectChanges(applyChillTimes(2), existingChills);

        const chills = getChills(result);
        expect(chills).toHaveLength(3);
        expect(getTotalStacks(chills)).toBe(3);

        expect(getTotalDuration(chills)).toBe(10);
        chills.forEach((effect) => expect(effect.duration).toBeLessThanOrEqual(10));
    });

    it("keeps single-application stack effects like Burn consolidating into one instance", () => {
        const existingBurn = createCombatEffect(burn);
        const result = calculateEffectChanges([createCombatEffect(burn)], [existingBurn]);

        const burns = result.filter((effect) => effect.name === burn.name);
        expect(burns).toHaveLength(1);
        expect(burns[0].stacks).toBe(4);
    });

    it("does not overwrite an existing infinite duration effect's duration via the pandemic branch", () => {
        const existingTaunt = createCombatEffect(taunt);
        expect(existingTaunt.duration).toBe(Infinity);

        const result = calculateEffectChanges([createCombatEffect(taunt)], [existingTaunt]);
        const taunts = getTaunts(result);

        expect(taunts).toHaveLength(1);
        expect(taunts[0].duration).toBe(Infinity);
    });
});

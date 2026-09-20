import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AbilityPreview from "../AbilityPreview";
import { PreviewStatUpdate } from "../AbilityPreview";
import { Combatant } from "../types";

const createMockCombatant = (overrides: Partial<Combatant> = {}): Combatant => ({
    id: "test-combatant",
    name: "Test Enemy",
    image: "test.png",
    HP: 50,
    maxHP: 50,
    armor: 10,
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
});

const createPreviewStatUpdate = (
    overrides: Partial<PreviewStatUpdate["statUpdate"]> = {},
): PreviewStatUpdate => ({
    statUpdate: {
        combatantId: "test-combatant",
        rawDamage: 80,
        healthDamage: 50,
        damageDealt: 60,
        armor: -10,
        isDeathBlow: true,
        overkill: 0,
        effects: [],
        failedToApplyEffects: [],
        ...overrides,
    },
    nondeterministic: false,
    action: { damage: 80 },
});

describe("AbilityPreview", () => {
    describe("damage display", () => {
        it("displays damageDealt for enemy combatants instead of rawDamage", () => {
            const combatant = createMockCombatant({ HP: 50, armor: 10 });
            const previewStatUpdate = [createPreviewStatUpdate()];

            render(
                <AbilityPreview
                    previewStatUpdate={previewStatUpdate}
                    combatant={combatant}
                    isEnemy={true}
                />,
            );

            // Should show damageDealt (60), not rawDamage (80)
            expect(screen.getByText("60")).toBeInTheDocument();
            expect(screen.queryByText("80")).not.toBeInTheDocument();
        });

        it("displays rawDamage for player-side combatants including overkill", () => {
            const combatant = createMockCombatant({ HP: 50, armor: 10, isPlayer: true });
            const previewStatUpdate = [createPreviewStatUpdate()];

            render(
                <AbilityPreview
                    previewStatUpdate={previewStatUpdate}
                    combatant={combatant}
                    isEnemy={false}
                />,
            );

            // Should show rawDamage (80) for player side so they can see overkill
            expect(screen.getByText("80")).toBeInTheDocument();
        });

        it("displays damageDealt of 0 when enemy has no effective damage", () => {
            const combatant = createMockCombatant({ HP: 50, armor: 10 });
            const previewStatUpdate = [
                createPreviewStatUpdate({ rawDamage: 0, healthDamage: 0, damageDealt: 0 }),
            ];

            render(
                <AbilityPreview
                    previewStatUpdate={previewStatUpdate}
                    combatant={combatant}
                    isEnemy={true}
                />,
            );

            // With no damage, the preview should be null
            expect(screen.queryByText("0")).not.toBeInTheDocument();
        });
    });
});

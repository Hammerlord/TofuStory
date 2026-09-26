import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../ability/AbilityView/utils", () => ({
    isOffensiveAction: () => false,
    hasOffensiveAbility: (combatant: Combatant) => Boolean(combatant?.abilities?.length),
}));

vi.mock("../../../../battle/utils", () => ({
    isUntargetable: () => false,
    isStealthed: () => false,
    hasTruesight: () => false,
}));

vi.mock("../../../../battle/passesConditions", () => ({
    passesConditions: () => true,
}));

vi.mock("../../../../battle/actions/combatantData", () => {
    const SIDES = ["playerSide", "enemySide"] as const;
    return {
        findCombatantData: (battle: Partial<BattleState>, combatantId?: string) => {
            if (!battle) {
                return undefined;
            }
            for (const friendlySide of SIDES) {
                const friendly = battle[friendlySide] || [];
                const combatant = friendly.find(
                    (combatant: Combatant | null) => combatant?.id === combatantId,
                );
                if (combatant) {
                    const hostileSide = friendlySide === "playerSide" ? "enemySide" : "playerSide";
                    return {
                        combatant,
                        index: friendly.indexOf(combatant),
                        friendly,
                        hostile: battle[hostileSide] || [],
                        friendlySide,
                        hostileSide,
                    };
                }
            }
            return undefined;
        },
    };
});

vi.mock("../../../../battle/actions/statusEffect/getEnabledEffects", () => ({
    getEnabledEffects: () => [],
    hasEffectType: () => false,
}));

import {
    ACTION_TYPES,
    Action,
    CombatAbility,
    CombatEffect,
    EFFECT_TYPES,
    TARGET_TYPES,
} from "../../../../ability/types";
import { Combatant } from "../../../../character/types";
import { BATTLEFIELD_SIDES, BattleState, CombatantInfo } from "../../../../battle/types";
import {
    autoSelectActionTarget,
    calculateTargetIndices,
    getValidTargetIndicesForAction,
    resolveActionTarget,
} from "../targeting";

const makeCombatant = (overrides: Partial<Combatant> = {}): Combatant => ({
    id: "combatant",
    name: "Combatant",
    image: "",
    isPlayer: false,
    HP: 100,
    maxHP: 100,
    armor: 0,
    resources: 0,
    resourcesPerTurn: 0,
    effects: [],
    turnHistory: [],
    abilities: [],
    abilityHistory: [],
    items: [],
    mesos: 0,
    damage: 1,
    ...overrides,
});

const makeBattle = ({
    playerSide,
    enemySide,
}: {
    playerSide: (Combatant | null)[];
    enemySide: (Combatant | null)[];
}): BattleState =>
    ({
        playerSide,
        enemySide,
    }) as BattleState;

const tauntEffect: CombatEffect = { type: EFFECT_TYPES.TAUNT } as CombatEffect;

const priorityTargetEffect: CombatEffect = {
    type: EFFECT_TYPES.PRIORITY_TARGET,
} as CombatEffect;

const hostileAttackAction: Action = {
    type: ACTION_TYPES.ATTACK,
    target: TARGET_TYPES.HOSTILE,
    damage: 3,
};

const rolloutAction: Action = {
    type: ACTION_TYPES.ATTACK,
    target: TARGET_TYPES.HOSTILE,
    damage: 3,
    secondaryDamage: 1,
    numExtraTargets: 1,
    targetArea: 2,
    playbackTime: 750,
};

const playerSide: (Combatant | null)[] = [
    makeCombatant({ id: "player", name: "Player", isPlayer: true, HP: 50 }),
    null,
    null,
    makeCombatant({
        id: "taunt-minion",
        name: "Taunting Minion",
        effects: [tauntEffect],
    }),
    null,
];

const enemySide: (Combatant | null)[] = [
    makeCombatant({ id: "red-snail", name: "Red Snail" }),
    null,
    null,
    null,
    null,
];

const actorData: CombatantInfo = {
    combatant: enemySide[0]!,
    index: 0,
    friendly: enemySide,
    hostile: playerSide,
    friendlySide: BATTLEFIELD_SIDES.ENEMY_SIDE,
    hostileSide: BATTLEFIELD_SIDES.PLAYER_SIDE,
};

describe("getValidTargetIndicesForAction", () => {
    it("finds a taunting minion beyond the target area radius when there is no initial selection (Rollout regression)", () => {
        const validIndices = getValidTargetIndicesForAction({
            action: rolloutAction,
            actorData,
        });

        expect(validIndices).toEqual([{ index: 3, side: BATTLEFIELD_SIDES.PLAYER_SIDE }]);
    });

    it("returns every alive hostile target when there is no taunt and no priority target", () => {
        const noTauntPlayerSide: (Combatant | null)[] = [
            makeCombatant({ id: "player", name: "Player", isPlayer: true, HP: 50 }),
            null,
            null,
            makeCombatant({ id: "minion", name: "Minion", HP: 20 }),
            null,
        ];

        const validIndices = getValidTargetIndicesForAction({
            action: rolloutAction,
            actorData: { ...actorData, hostile: noTauntPlayerSide },
        });

        expect(validIndices).toEqual([
            { index: 0, side: BATTLEFIELD_SIDES.PLAYER_SIDE },
            { index: 3, side: BATTLEFIELD_SIDES.PLAYER_SIDE },
        ]);
    });

    it("still restricts to targets near an existing selection", () => {
        const twoTauntsPlayerSide: (Combatant | null)[] = [
            makeCombatant({
                id: "taunt-0",
                name: "Taunting Minion",
                effects: [tauntEffect],
            }),
            null,
            null,
            makeCombatant({
                id: "taunt-3",
                name: "Taunting Minion",
                effects: [tauntEffect],
            }),
            null,
        ];

        const randomHostileAction: Action = {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.RANDOM_HOSTILE,
            damage: 3,
            targetArea: 2,
        };

        const validIndices = getValidTargetIndicesForAction({
            action: randomHostileAction,
            actorData: { ...actorData, hostile: twoTauntsPlayerSide },
            initialSelectedIndex: 0,
            initialSelectedSide: BATTLEFIELD_SIDES.PLAYER_SIDE,
        });

        expect(validIndices).toEqual([{ index: 0, side: BATTLEFIELD_SIDES.PLAYER_SIDE }]);
    });

    it("restricts an induceCombatantAttack friendly pick to units with an offensive ability", () => {
        const playerSideWithPuppet: (Combatant | null)[] = [
            makeCombatant({
                id: "player",
                name: "Player",
                isPlayer: true,
                HP: 50,
                abilities: [{} as CombatAbility],
            }),
            null,
            null,
            makeCombatant({ id: "puppet", name: "Puppet", HP: 7, abilities: [] }),
            null,
        ];

        const induceFriendlyAction: Action = {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.RANDOM_FRIENDLY,
            induceCombatantAttack: true,
        };

        const validIndices = getValidTargetIndicesForAction({
            action: induceFriendlyAction,
            actorData: { ...actorData, friendly: playerSideWithPuppet },
        });

        // The Player is the only candidate that can actually follow up (has an offensive ability),
        // so it is always picked over the Puppet.
        expect(validIndices).toEqual([{ index: 0, side: BATTLEFIELD_SIDES.ENEMY_SIDE }]);
    });

    it("filters non-offensive candidates for induceCombatantAttack while keeping eligible ones", () => {
        const mixedPlayerSide: (Combatant | null)[] = [
            makeCombatant({ id: "ally-0", name: "Ally 0", HP: 50, abilities: [] }),
            null,
            makeCombatant({
                id: "ally-2",
                name: "Ally 2",
                HP: 50,
                abilities: [{} as CombatAbility],
            }),
            null,
        ];

        const induceFriendlyAction: Action = {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.RANDOM_FRIENDLY,
            induceCombatantAttack: true,
        };

        const validIndices = getValidTargetIndicesForAction({
            action: induceFriendlyAction,
            actorData: { ...actorData, friendly: mixedPlayerSide },
        });

        expect(validIndices).toEqual([{ index: 2, side: BATTLEFIELD_SIDES.ENEMY_SIDE }]);
    });

    it("falls back to all friendly combatants when none have an offensive ability", () => {
        const allSupportPlayerSide: (Combatant | null)[] = [
            makeCombatant({ id: "ally-0", name: "Ally 0", HP: 50, abilities: [] }),
            null,
            null,
            makeCombatant({ id: "ally-3", name: "Ally 3", HP: 50, abilities: [] }),
            null,
        ];

        const induceFriendlyAction: Action = {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.RANDOM_FRIENDLY,
            induceCombatantAttack: true,
        };

        const validIndices = getValidTargetIndicesForAction({
            action: induceFriendlyAction,
            actorData: { ...actorData, friendly: allSupportPlayerSide },
        });

        expect(validIndices).toHaveLength(1);
        expect([0, 3]).toContain(validIndices[0].index);
        expect(validIndices[0].side).toBe(BATTLEFIELD_SIDES.ENEMY_SIDE);
    });
});

describe("autoSelectActionTarget", () => {
    it("rolls a fresh target for Rollout instead of finding nothing (no-target bug)", () => {
        const battle = makeBattle({ playerSide, enemySide });

        const target = autoSelectActionTarget({
            action: rolloutAction,
            actorId: "red-snail",
            battle,
        });

        expect(target).toEqual({ index: 3, side: BATTLEFIELD_SIDES.PLAYER_SIDE });
    });
});

describe("resolveActionTarget", () => {
    it("resolves deterministically to the lone priority target", () => {
        const playerSideWithPriorityTarget: (Combatant | null)[] = [
            makeCombatant({ id: "player", name: "Player", isPlayer: true, HP: 50 }),
            null,
            null,
            makeCombatant({
                id: "locked-on-minion",
                name: "Locked On Minion",
                effects: [priorityTargetEffect],
            }),
            null,
        ];

        const battle = makeBattle({ playerSide: playerSideWithPriorityTarget, enemySide });

        const resolved = resolveActionTarget({
            action: hostileAttackAction,
            actorId: "red-snail",
            battle,
        });

        expect(resolved.isDeterminate).toBe(true);
        expect(resolved.target).toEqual({
            index: 3,
            side: BATTLEFIELD_SIDES.PLAYER_SIDE,
        });
    });

    it("resolves indeterminately when multiple combatants hold the priority-target debuff", () => {
        const playerSideWithTwoPriorityTargets: (Combatant | null)[] = [
            makeCombatant({
                id: "locked-on-0",
                name: "Locked On 0",
                effects: [priorityTargetEffect],
            }),
            null,
            null,
            makeCombatant({
                id: "locked-on-3",
                name: "Locked On 3",
                effects: [priorityTargetEffect],
            }),
            null,
        ];

        const battle = makeBattle({ playerSide: playerSideWithTwoPriorityTargets, enemySide });

        const resolved = resolveActionTarget({
            action: hostileAttackAction,
            actorId: "red-snail",
            battle,
        });

        expect(resolved.isDeterminate).toBe(false);
        expect([0, 3]).toContain(resolved.target?.index);
        expect(resolved.target?.side).toBe(BATTLEFIELD_SIDES.PLAYER_SIDE);
    });

    it("resolves deterministically to an already-selected hostile target", () => {
        const battle = makeBattle({ playerSide, enemySide });

        const resolved = resolveActionTarget({
            action: hostileAttackAction,
            actorId: "red-snail",
            battle,
            initialSelectedIndex: 0,
            initialSelectedSide: BATTLEFIELD_SIDES.PLAYER_SIDE,
        });

        expect(resolved.isDeterminate).toBe(true);
        expect(resolved.target).toEqual({
            index: 0,
            side: BATTLEFIELD_SIDES.PLAYER_SIDE,
        });
    });
});

describe("calculateTargetIndices", () => {
    it("bounces to an extra target within targetArea for Rollout", () => {
        const playerSideWithTwoTargets: (Combatant | null)[] = [
            makeCombatant({ id: "player-0", name: "Player 0", isPlayer: true, HP: 50 }),
            null,
            makeCombatant({ id: "player-2", name: "Player 2", isPlayer: true, HP: 50 }),
        ];

        const enemySide: (Combatant | null)[] = [
            makeCombatant({ id: "red-snail", name: "Red Snail" }),
        ];

        const battle = makeBattle({ playerSide: playerSideWithTwoTargets, enemySide });
        const actorData: CombatantInfo = {
            combatant: enemySide[0]!,
            index: 0,
            friendly: enemySide,
            hostile: playerSideWithTwoTargets,
            friendlySide: BATTLEFIELD_SIDES.ENEMY_SIDE,
            hostileSide: BATTLEFIELD_SIDES.PLAYER_SIDE,
        };

        const targetData: CombatantInfo = {
            combatant: playerSideWithTwoTargets[2]!,
            index: 2,
            friendly: playerSideWithTwoTargets,
            hostile: enemySide,
            friendlySide: BATTLEFIELD_SIDES.PLAYER_SIDE,
            hostileSide: BATTLEFIELD_SIDES.ENEMY_SIDE,
        };

        const result = calculateTargetIndices({
            action: rolloutAction,
            selectedIndex: 2,
            side: BATTLEFIELD_SIDES.PLAYER_SIDE,
            actorData,
            targetData,
            battle,
            isPreviewMode: false,
        });

        const targetedIndices = result.targetedIndices;
        expect(targetedIndices).toContain(2); // primary target
        expect(targetedIndices).toContain(0); // extra target (bounced)
        expect(targetedIndices.length).toBe(2);
    });
});

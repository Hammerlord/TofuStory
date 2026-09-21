import { describe, expect, it, vi } from "vitest";
import { attack } from "../../../enemy/abilities";
import { createCombatant } from "../../../enemy/createEnemy";
import { checkInduce } from "../inducedAction";

vi.mock("../useAbility", () => ({
    useAbility: (payload: any) => ({ type: "USE_ABILITY", payload }),
    onUseAbility: () => ({ type: "ON_USE_ABILITY" }),
}));

const buildBattle = () => {
    const player = createCombatant({
        name: "Player",
        image: "player.png",
        maxHP: 30,
        isPlayer: true,
        abilities: [attack],
    })!;
    const puppet = createCombatant({
        name: "Puppet",
        image: "puppet.png",
        maxHP: 7,
        abilities: [],
    })!;

    return {
        playerSide: [player, null, puppet, null],
        enemySide: [],
    } as any;
};

const getInducedActors = (dispatch: ReturnType<typeof vi.fn>): string[] =>
    (dispatch.mock.calls.flat() as any[])
        .filter((action) => action?.type === "USE_ABILITY")
        .map((action: any) => action.payload.actorId);

describe("checkInduce (induceCombatantAttack)", () => {
    it("commands only friendly units with an offensive ability to follow up", () => {
        const battle = buildBattle();
        const player = battle.playerSide[0];
        const puppet = battle.playerSide[2];

        const dispatch = vi.fn();
        checkInduce({
            action: { induceCombatantAttack: true } as any,
            affectedTargetIds: [puppet.id, player.id],
            parentContext: undefined as any,
        })(dispatch, () => ({ battle }));

        // The Puppet has no abilities, so the Player is the only one commanded to attack.
        const inducedActors = getInducedActors(dispatch);
        expect(inducedActors).toEqual([player.id]);
    });

    it("still commands units without an offensive ability when nobody has one", () => {
        const battle = buildBattle();
        const puppet = battle.playerSide[2];

        const dispatch = vi.fn();
        checkInduce({
            action: { induceCombatantAttack: true } as any,
            affectedTargetIds: [puppet.id],
            parentContext: undefined as any,
        })(dispatch, () => ({ battle }));

        const inducedActors = getInducedActors(dispatch);
        expect(inducedActors).toEqual([puppet.id]);
    });
});
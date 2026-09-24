import { describe, expect, it, vi } from "vitest";
import { attack } from "../../../enemy/abilities";
import { createCombatant } from "../../../enemy/createEnemy";
import { Ability, CombatAbility } from "../../../ability/types";
import { Combatant } from "../../../character/types";
import { ActionContext, BATTLEFIELD_SIDES, BattleState } from "../../types";
import { RootState } from "../../../store";
import { checkInduce } from "../inducedAction";

vi.mock("../useAbility", () => ({
    useAbility: (payload: {
        ability: Ability | CombatAbility;
        selectedIndex?: number;
        side?: BATTLEFIELD_SIDES;
        actorId: string;
        isAutoCast?: boolean;
        isProc?: boolean;
        context: ActionContext;
    }) => ({ type: "USE_ABILITY", payload }),
    onUseAbility: () => ({ type: "ON_USE_ABILITY" }),
}));

const buildBattle = (): BattleState => {
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

    const playerSide: (Combatant | null)[] = [player, null, puppet, null];
    const enemySide: (Combatant | null)[] = [];

    return {
        playerSide,
        enemySide,
    } as BattleState;
};

type UseAbilityAction = { type: "USE_ABILITY"; payload: { actorId: string } };
const getInducedActors = (dispatch: ReturnType<typeof vi.fn>): string[] =>
    (dispatch.mock.calls.flat() as UseAbilityAction[])
        .filter((action) => action?.type === "USE_ABILITY")
        .map((action) => action.payload.actorId);

describe("checkInduce (induceCombatantAttack)", () => {
    it("commands only friendly units with an offensive ability to follow up", () => {
        const battle = buildBattle();
        const player = battle.playerSide[0]!;
        const puppet = battle.playerSide[2]!;

        const dispatch = vi.fn();
        checkInduce({
            action: { induceCombatantAttack: true },
            affectedTargetIds: [puppet.id, player.id],
            parentContext: undefined as unknown as ActionContext,
        })(dispatch, (() => ({ battle })) as unknown as () => RootState);

        // The Puppet has no abilities, so the Player is the only one commanded to attack.
        const inducedActors = getInducedActors(dispatch);
        expect(inducedActors).toEqual([player.id]);
    });

    it("still commands units without an offensive ability when nobody has one", () => {
        const battle = buildBattle();
        const puppet = battle.playerSide[2]!;

        const dispatch = vi.fn();
        checkInduce({
            action: { induceCombatantAttack: true },
            affectedTargetIds: [puppet.id],
            parentContext: undefined as unknown as ActionContext,
        })(dispatch, (() => ({ battle })) as unknown as () => RootState);

        const inducedActors = getInducedActors(dispatch);
        expect(inducedActors).toEqual([puppet.id]);
    });
});
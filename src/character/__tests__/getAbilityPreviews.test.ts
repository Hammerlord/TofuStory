import { describe, expect, it } from "vitest";
import { lockOn } from "../../ability/bowman/bowmanAbilities";
import { ACTION_TYPES, EFFECT_TYPES } from "../../ability/types";
import { attack } from "../../enemy/abilities";
import { createCombatant } from "../../enemy/createEnemy";
import { BATTLEFIELD_SIDES, BattleState } from "../../battle/types";
import { BATTLE_STATES } from "../../battle/states";
import { BATTLE_TYPES } from "../../battle/types";
import getAbilityPreviews from "../getAbilityPreviews";
import { PLAYER_CLASSES } from "../../Menu/types";
import { Player } from "../types";
import { PreviewStatUpdate } from "../AbilityPreview";

const buildBattle = (): BattleState => {
    const player = {
        id: "player-id",
        name: "Bowman",
        image: "bowman.png",
        HP: 50,
        maxHP: 50,
        armor: 0,
        effects: [],
        resources: 3,
        maxResources: 3,
        resourcesPerTurn: 1,
        isPlayer: true,
        class: PLAYER_CLASSES.BOWMAN,
        turnHistory: [],
        abilities: [],
        abilityHistory: [],
        items: [],
        mesos: 100,
        drawCardsPerTurn: 1,
        weaponSkins: [],
    } as Player;

    const minion = createCombatant({
        name: "Test Minion",
        image: "minion.png",
        maxHP: 5,
        abilities: [attack],
    })!;

    const enemy = createCombatant({
        name: "Test Enemy",
        image: "enemy.png",
        maxHP: 50,
    })!;

    const enemy2 = createCombatant({
        name: "Test Enemy 2",
        image: "enemy2.png",
        maxHP: 50,
    })!;

    return {
        enemySide: [enemy, enemy2],
        playerSide: [null, null, player, minion, null],
        deck: [],
        discard: [],
        hand: [],
        depleted: [],
        isPlayerTurn: true,
        eventQueue: [],
        charactersAttackedThisTurn: [],
        round: 0,
        waves: [],
        currentWaveIndex: 0,
        selectCardsPrompt: null,
        state: BATTLE_STATES.TURN_IN_PROGRESS,
        type: BATTLE_TYPES.ENCOUNTER,
        statistics: {
            totalDamage: 0,
            totalKills: 0,
            damageByEnemyName: {},
        },
        addAbilities: [],
        selectedAllyId: null,
        selectedHandAbilityId: null,
        actionHistory: [],
    };
};

const previewLockOnOnEnemy = (battle: BattleState) => {
    const enemy = battle.enemySide[0]!;
    const player = battle.playerSide[2] as Player;

    return getAbilityPreviews({
        ability: {
            ...lockOn,
            effects: [],
            actions: lockOn.actions.slice(),
        },
        actor: player,
        target: {
            side: BATTLEFIELD_SIDES.ENEMY_SIDE,
            index: 0,
            id: enemy.id,
        },
        battle,
    });
};

const attackPreviews = (previews: PreviewStatUpdate[] = []): PreviewStatUpdate[] =>
    previews.filter((p) => p.action?.type === ACTION_TYPES.ATTACK);

describe("Lock On ability previews", () => {
    it("previews the induced follow-up attack as a determinate hit on the priority target", () => {
        const battle = buildBattle();
        const enemy = battle.enemySide[0]!;
        const enemy2 = battle.enemySide[1]!;

        const { result } = previewLockOnOnEnemy(battle);

        // The induced follow-up attack should hit ONLY the Locked On enemy and be
        // displayed as a determinate (non-"?"-spread) hit.
        const enemy1Attacks = attackPreviews(result[enemy.id]);
        const enemy2Attacks = attackPreviews(result[enemy2.id]);

        expect(enemy1Attacks).toHaveLength(1);
        expect(enemy1Attacks[0].nondeterministic).toBe(false);
        expect(enemy2Attacks).toHaveLength(0);
    });

    it("keeps the induced follow-up attack nondeterministic when multiple combatants hold a priority-target debuff", () => {
        const battle = buildBattle();
        const enemy = battle.enemySide[0]!;
        const enemy2 = battle.enemySide[1]!;
        enemy2.effects = [{ type: EFFECT_TYPES.PRIORITY_TARGET }];

        const { result } = previewLockOnOnEnemy(battle);

        const enemy1Attacks = attackPreviews(result[enemy.id]);
        const enemy2Attacks = attackPreviews(result[enemy2.id]);
        const allAttacks = [...enemy1Attacks, ...enemy2Attacks];

        // With two Locked On candidates the follow-up could hit either one, so it
        // must be shown as an indeterminate "?" spread across all enemies.
        expect(allAttacks.length).toBeGreaterThan(0);
        for (const attack of allAttacks) {
            expect(attack.nondeterministic).toBe(true);
        }
    });
});

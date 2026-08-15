import { BattleState } from "./reducer";

export const checkWinCondition = ({ battle }: { battle: BattleState }) => {
    const { enemySide, currentWaveIndex, waves, round } = battle;
    const { winCondition = {} } = waves[currentWaveIndex] || {};
    if (winCondition.defeatBoss) {
        return enemySide.every((enemy) => !enemy?.isBoss || enemy?.HP <= 0);
    }

    // +1 to account for 0 based start
    if (winCondition.surviveRounds && round === winCondition.surviveRounds + 1) {
        return true;
    }

    return enemySide.every((enemy) => !enemy || enemy.HP <= 0);
};

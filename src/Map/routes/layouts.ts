import { ENEMY_DIFFICULTY } from "./../types";

const { EASY, NORMAL, HARD, HARDEST } = ENEMY_DIFFICULTY;
export const enemyLayouts = {
    easy: [
        [null, EASY, EASY, EASY, null],
        [null, EASY, EASY, EASY, EASY],
        [EASY, null, EASY, null, EASY],
        [null, EASY, NORMAL, EASY, null],
        [null, NORMAL, null, NORMAL, null],
        [NORMAL, null, null, null, NORMAL],
        [null, null, HARD, null, null],
    ] as ENEMY_DIFFICULTY[][],
    normal: [
        [null, NORMAL, EASY, NORMAL, null],
        [null, NORMAL, null, NORMAL, null],
        [EASY, NORMAL, null, NORMAL, EASY],
        [NORMAL, EASY, null, EASY, NORMAL],
        [null, HARD, null, EASY, null],
        [null, EASY, HARD, null, null],
        [HARD, null, null, null, EASY],
        [NORMAL, null, NORMAL, null, NORMAL],
        [EASY, EASY, EASY, EASY, EASY],
        [EASY, EASY, NORMAL, EASY, EASY],
    ] as ENEMY_DIFFICULTY[][],
    hard: [
        [EASY, NORMAL, NORMAL, NORMAL, EASY],
        [EASY, EASY, HARD, NORMAL, EASY],
        [null, NORMAL, HARD, NORMAL, null],
        [NORMAL, NORMAL, null, null, HARD],
        [null, HARD, null, HARD, null],
        [HARD, null, null, null, HARD],
        [EASY, null, HARDEST, null, EASY],
        [null, null, HARDEST, null, null],
    ] as ENEMY_DIFFICULTY[][],
};

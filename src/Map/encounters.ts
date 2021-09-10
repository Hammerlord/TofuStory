import { createCombatant } from "./../enemy/createEnemy";
import { concat } from "ramda";
import { Enemy } from "../enemy/enemy";
import { hardy, raging, thorns } from "./../ability/Effects";
import { tantrum } from "./../enemy/abilities";
import { Wave } from "./../Menu/tutorial";
import { getRandomItem } from "./../utils";
import { enemyLayouts } from "./routes";
import { ENCOUNTER_DIFFICULTY, ENEMY_DIFFICULTY, RouteNode } from "./types";

const generateEliteTriad = (possibleEnemies: Enemy[][]) => {
    const affix = getRandomItem([thorns, raging]);
    const ability = getRandomItem([tantrum]);
    const baseEnemy = getRandomItem(concat(...Object.values(possibleEnemies)));
    const enemy = {
        ...baseEnemy,
        maxHP: Math.floor(baseEnemy.maxHP * 1.25 + 10),
        abilities: [...(baseEnemy.abilities || []), ability],
        effects: [hardy, affix],
    };

    return getRandomItem([
        [null, enemy, enemy, enemy, null],
        [enemy, null, enemy, null, enemy],
        [enemy, null, enemy, enemy, null],
        [enemy, null, null, enemy, enemy],
    ]);
};

const generateNumWaves = (difficulty: ENCOUNTER_DIFFICULTY) => {
    let possibleNumWaves = [];
    if (difficulty === "easy") {
        possibleNumWaves = [2, 3];
    } else if (difficulty === "normal") {
        possibleNumWaves = [1, 2, 2];
    } else {
        possibleNumWaves = [1];
    }

    return getRandomItem(possibleNumWaves);
};

const getLayoutDifficulty = (waveNum: number, numWaves: number): ENEMY_DIFFICULTY => {
    const waveDifficulties = [
        ["easy", "normal"],
        ["normal", "normal", "hard"],
        ["normal", "hard"],
    ];

    const divisor = numWaves - 1 || 1;
    const index = Math.floor((waveNum / divisor) * (waveDifficulties.length - 1));
    return getRandomItem(waveDifficulties[index]);
};

export const generateWaves = (node: RouteNode, possibleEnemies): Wave[] => {
    if (node.encounters) {
        return node.encounters.map((encounter) => {
            return { enemies: encounter.map(createCombatant) };
        });
    }
    const difficulty: ENCOUNTER_DIFFICULTY = Array.isArray(node.difficulty) ? getRandomItem(node.difficulty) : node.difficulty;
    const numWaves = generateNumWaves(difficulty);

    const generateEnemies = (i: number) => {
        if (difficulty === ENCOUNTER_DIFFICULTY.ELITE_TRIAD || difficulty === ENCOUNTER_DIFFICULTY.ELITE) {
            return generateEliteTriad(possibleEnemies);
        }

        const layoutDifficulty = getLayoutDifficulty(i, numWaves);
        const layout = getRandomItem(enemyLayouts[layoutDifficulty]);
        return layout.map((enemyDifficulty: ENEMY_DIFFICULTY) => {
            if (!enemyDifficulty) {
                return null;
            }

            return getRandomItem(possibleEnemies[enemyDifficulty]);
        });
    };

    return Array.from({ length: numWaves }).map((_, i) => ({ enemies: generateEnemies(i).map(createCombatant) }));
};

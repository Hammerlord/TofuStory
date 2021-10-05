import { concat } from "ramda";
import { Ability } from "../ability/types";
import { Enemy } from "../enemy/enemy";
import { avenger, elite, eliteSquad, raging, thorns } from "./../ability/Effects";
import { tantrum } from "./../enemy/abilities";
import { createCombatant } from "./../enemy/createEnemy";
import { Wave } from "./../Menu/tutorial";
import { getRandomItem, shuffle } from "./../utils";
import { enemyLayouts } from "./routes/layouts";
import { ENCOUNTER_DIFFICULTY, ENEMY_DIFFICULTY, MapEnemies, NODE_TYPES, RouteNode } from "./types";

const getSyntheticSummon = (summonableEnemies: Enemy[]): Ability => {
    return {
        name: "Call Minion",
        minion: {
            ...getRandomItem(summonableEnemies),
        },
        actions: [],
    };
};

const generateEliteTriad = (possibleEnemies: MapEnemies): (Enemy | null)[] => {
    const affix = getRandomItem([thorns, raging, avenger]);
    const ability = getRandomItem([tantrum]);
    const baseEnemy = getRandomItem(concat(...Object.values(possibleEnemies)));
    const enemy = {
        ...baseEnemy,
        maxHP: Math.floor(baseEnemy.maxHP * 1.2 + 10),
        abilities: [...(baseEnemy.abilities || []), ability],
        effects: [eliteSquad, affix],
    };

    return getRandomItem([
        [null, enemy, enemy, enemy, null],
        [enemy, null, enemy, null, enemy],
        [enemy, null, enemy, enemy, null],
        [enemy, null, null, enemy, enemy],
    ]);
};

const generateElite = (possibleEnemies: MapEnemies): (Enemy | null)[] => {
    const affix = getRandomItem([thorns, raging]);
    const ability = getRandomItem([getSyntheticSummon(possibleEnemies.easy)]);
    const baseEnemy = getRandomItem(concat(...Object.values(possibleEnemies)));
    const enemy = {
        ...baseEnemy,
        maxHP: Math.floor(baseEnemy.maxHP * 1.5 + 10),
        abilities: [...(baseEnemy.abilities || []), ability],
        effects: [elite, affix],
    };
    return [null, getRandomItem(possibleEnemies.easy), enemy, getRandomItem(possibleEnemies.easy), null];
};

const getWaveDifficulties = (numWaves: number): ENEMY_DIFFICULTY[] => {
    if (numWaves === 1) {
        return [ENEMY_DIFFICULTY.HARD];
    }
    if (numWaves === 2) {
        return [
            getRandomItem([ENEMY_DIFFICULTY.EASY, ENEMY_DIFFICULTY.NORMAL]),
            getRandomItem([ENEMY_DIFFICULTY.EASY, ENEMY_DIFFICULTY.NORMAL, ENEMY_DIFFICULTY.NORMAL, ENEMY_DIFFICULTY.HARD]),
        ];
    }

    const remainder = numWaves - 2;
    return shuffle([
        getRandomItem([ENEMY_DIFFICULTY.EASY, ENEMY_DIFFICULTY.EASY, ENEMY_DIFFICULTY.NORMAL]),
        getRandomItem([ENEMY_DIFFICULTY.EASY, ENEMY_DIFFICULTY.NORMAL]),
        ...Array.from({ length: remainder }).map(() => ENEMY_DIFFICULTY.EASY),
    ]);
};

export const generateWaves = (encounterType: NODE_TYPES.ENCOUNTER | NODE_TYPES.ELITE_ENCOUNTER, possibleEnemies: MapEnemies): Wave[] => {
    console.log();
    if (encounterType === NODE_TYPES.ELITE_ENCOUNTER) {
        return [{ enemies: Math.random() < 0.5 ? generateElite(possibleEnemies) : generateEliteTriad(possibleEnemies) }];
    }

    const numWaves = getRandomItem([1, 2, 3]);
    const waveDifficulties = getWaveDifficulties(numWaves);

    const generateEnemies = (i: number) => {
        const difficulty = waveDifficulties[i];
        const layout = getRandomItem(enemyLayouts[difficulty]);
        return layout.map((enemyDifficulty: ENEMY_DIFFICULTY) => {
            if (!enemyDifficulty) {
                return null;
            }

            return getRandomItem(possibleEnemies[enemyDifficulty]);
        });
    };

    return Array.from({ length: numWaves }).map((_, i) => ({ enemies: generateEnemies(i).map(createCombatant) }));
};

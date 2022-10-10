import { concat } from "ramda";
import { Ability, Minion } from "../ability/types";
import { Wave } from "../battle/types";
import { avenger, elite, eliteSquad, eruptive, explosive, raging, shielding, thorns } from "./../ability/Effects";
import { tantrum } from "./../enemy/abilities";
import { createCombatant } from "./../enemy/createEnemy";
import { getRandomItem, shuffle } from "./../utils";
import { enemyLayouts } from "./routes/layouts";
import { ENEMY_DIFFICULTY, MapEnemies, NODE_TYPES } from "./types";

const getSyntheticSummon = (summonableEnemies: Minion[]): Ability => {
    return {
        name: "Call Minion",
        minion: {
            ...getRandomItem(summonableEnemies),
        },
        actions: [],
    };
};

const generateEliteSquad = (possibleEnemies: MapEnemies): (Minion | null)[] => {
    const affix = getRandomItem([thorns, raging, avenger, shielding, explosive]);
    const baseEnemy = getRandomItem(possibleEnemies.easy);

    const enemy = {
        ...baseEnemy,
        maxHP: Math.floor(baseEnemy.maxHP * 1.2 + 20),
        abilities: [...(baseEnemy.abilities || [])],
        effects: [eliteSquad, affix],
    };

    return [enemy, enemy, enemy, enemy, enemy];
};

const generateEliteTriad = (possibleEnemies: MapEnemies): (Minion | null)[] => {
    const affix = getRandomItem([thorns, raging, avenger, shielding, explosive]);
    const ability = getRandomItem([tantrum]);
    const baseEnemy = getRandomItem([...possibleEnemies.easy, ...possibleEnemies.normal]);
    const enemy = {
        ...baseEnemy,
        maxHP: Math.floor(baseEnemy.maxHP * 1.25 + 30),
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

const generateElite = (possibleEnemies: MapEnemies): (Minion | null)[] => {
    const affix = getRandomItem([thorns, raging, shielding, eruptive]);
    const ability = getRandomItem([getSyntheticSummon(possibleEnemies.easy)]);
    const baseEnemy = getRandomItem(concat(possibleEnemies.hard, possibleEnemies.hardest));
    const enemy = {
        ...baseEnemy,
        maxHP: Math.floor(baseEnemy.maxHP * 1.5 + 50),
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
    if (encounterType === NODE_TYPES.ELITE_ENCOUNTER) {
        const eliteType = getRandomItem([1, 2, 3]);
        if (eliteType === 1) {
            return [{ enemies: generateElite(possibleEnemies) }];
        } else if (eliteType === 2) {
            return [{ enemies: generateEliteTriad(possibleEnemies) }];
        } else {
            return [{ enemies: generateEliteSquad(possibleEnemies) }];
        }
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

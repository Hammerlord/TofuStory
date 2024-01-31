import { concat } from "ramda";
import { ACTION_TYPES, Effect, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { Wave } from "../battle/types";
import { avenger, elite, eliteSquad, eruptive, explosive, raging, shielding, thorns } from "./../ability/Effects";
import { tantrum } from "./../enemy/abilities";
import { createCombatant } from "./../enemy/createEnemy";
import { getRandomItem, shuffle } from "./../utils";
import { enemyLayouts } from "./routes/layouts";
import { ENEMY_DIFFICULTY, MapEnemies, NODE_TYPES } from "./types";
import { lifeLink } from "../enemy/effect";

const generateEliteSquad = (possibleEnemies: MapEnemies): (Minion | null)[] => {
    const affix = getRandomItem([thorns, raging, avenger, shielding, explosive, lifeLink]);
    const baseEnemy = getRandomItem(possibleEnemies.easy);

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: Math.floor(baseEnemy.maxHP * 1.2 + 20),
        abilities: [...(baseEnemy.abilities || [])],
        effects: [eliteSquad, affix],
    };

    return [enemy, enemy, enemy, enemy, enemy];
};

const generateEliteTriad = (possibleEnemies: MapEnemies): (Minion | null)[] => {
    const affix = getRandomItem([thorns, raging, avenger, shielding, explosive, lifeLink]);
    const ability = getRandomItem([tantrum]);
    const baseEnemy = getRandomItem([...possibleEnemies.easy, ...possibleEnemies.normal]);
    const enemy = {
        ...baseEnemy,
        isElite: true,
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
    const swarming: Effect = {
        type: EFFECT_TYPES.NONE,
        class: EFFECT_CLASSES.BUFF,
        canBeSilenced: true,
        name: "Swarming",
        icon: possibleEnemies.easy[0].image,
        description: "Periodically summoning minions.",
        turnsTriggerFrequency: 3,
        onTurnStart: {
            ability: {
                name: "Call Minions",
                actions: [
                    {
                        target: TARGET_TYPES.SELF,
                        type: ACTION_TYPES.EFFECT,
                        summon: [
                            {
                                minion: possibleEnemies.easy,
                            },
                            {
                                minion: possibleEnemies.easy,
                            },
                        ],
                    },
                ],
            },
        },
    };
    const affix = getRandomItem([thorns, raging, shielding, eruptive, swarming]);
    const baseEnemy = getRandomItem(concat(possibleEnemies.hard, possibleEnemies.hardest));
    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: Math.floor(baseEnemy.maxHP * 1.5 + 50),
        abilities: [...(baseEnemy.abilities || []), tantrum],
        effects: [elite, affix],
    };

    return [null, getRandomItem(possibleEnemies.easy), enemy, getRandomItem(possibleEnemies.easy), null];
};

const getWaveDifficulties = (numWaves: number): ENEMY_DIFFICULTY[] => {
    if (numWaves === 1) {
        return [ENEMY_DIFFICULTY.HARD, ENEMY_DIFFICULTY.HARDEST];
    }
    if (numWaves === 2) {
        return [
            getRandomItem([ENEMY_DIFFICULTY.EASY, ENEMY_DIFFICULTY.NORMAL]),
            getRandomItem([ENEMY_DIFFICULTY.NORMAL, ENEMY_DIFFICULTY.NORMAL, ENEMY_DIFFICULTY.HARD]),
        ];
    }
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

    const numWaves = getRandomItem([1, 2]);
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

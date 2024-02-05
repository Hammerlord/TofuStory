import { concat } from "ramda";
import { ACTION_TYPES, Effect, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { Wave } from "../battle/types";
import { avenger, elite, eliteSquad, eruptive, explosive, raging, shielding, thorns } from "./../ability/Effects";
import { tantrum } from "./../enemy/abilities";
import { createCombatant } from "./../enemy/createEnemy";
import { getRandomItem, shuffle } from "./../utils";
import { EliteMap, NODE_TYPES, Route } from "./types";
import { clandestine, lifeLink, poisonous } from "../enemy/effect";

const generateEliteSquad = (eliteMap: EliteMap): (Minion | null)[] => {
    const affix = getRandomItem([thorns, raging, avenger, shielding, explosive, lifeLink, clandestine]);
    const baseEnemy = getRandomItem(eliteMap.squad);

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: Math.floor(baseEnemy.maxHP * 1.2 + 20),
        abilities: [...(baseEnemy.abilities || [])],
        effects: [eliteSquad, affix],
    };

    return [enemy, enemy, enemy, enemy, enemy];
};

const generateEliteTriad = (eliteMap: EliteMap): (Minion | null)[] => {
    const affix = getRandomItem([thorns, raging, avenger, shielding, explosive, lifeLink, clandestine]);
    const ability = getRandomItem([tantrum]);
    const baseEnemy = getRandomItem(eliteMap.trio);
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
        [null, enemy, enemy, null, enemy],
    ]);
};

const generateEliteDuo = (eliteMap: EliteMap): (Minion | null)[] => {
    const affix = getRandomItem([thorns, raging, shielding, explosive, lifeLink, clandestine, poisonous]);
    const ability = getRandomItem([tantrum]);
    const baseEnemy = getRandomItem(eliteMap.duo || eliteMap.trio);
    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: Math.floor(baseEnemy.maxHP * 1.35 + 40),
        abilities: [...(baseEnemy.abilities || []), ability],
        effects: [eliteSquad, affix],
    };

    return getRandomItem([
        [null, enemy, enemy, null, null],
        [null, null, enemy, enemy, null],
        [null, enemy, null, enemy, null],
        [null, enemy, null, enemy, null],
        [enemy, null, null, null, enemy],
    ]);
};

const generateElite = (eliteMap: EliteMap): (Minion | null)[] => {
    const minion = getRandomItem(eliteMap.minions);
    const swarming: Effect = {
        type: EFFECT_TYPES.NONE,
        class: EFFECT_CLASSES.BUFF,
        canBeSilenced: true,
        name: "Swarming",
        icon: minion.image,
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
                                minion: eliteMap.minions,
                            },
                            {
                                minion: eliteMap.minions,
                            },
                        ],
                    },
                ],
            },
        },
    };
    const affix = getRandomItem([thorns, raging, shielding, eruptive, swarming, clandestine, poisonous]);
    const baseEnemy = getRandomItem(eliteMap.single);
    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: Math.floor(baseEnemy.maxHP * 1.5 + 50),
        abilities: [...(baseEnemy.abilities || []), tantrum],
        effects: [elite, affix],
    };

    return [null, getRandomItem(eliteMap.minions), enemy, getRandomItem(eliteMap.minions), null];
};

export const generateElites = (route: Route) => {
    const eliteType = getRandomItem([1, 2, 3, 4]);
    if (eliteType === 1) {
        return [{ enemies: generateElite(route.elites) }];
    } else if (eliteType === 2) {
        return [{ enemies: generateEliteTriad(route.elites) }];
    } else if (eliteType === 3) {
        return [{ enemies: generateEliteSquad(route.elites) }];
    } else {
        return [{ enemies: generateEliteDuo(route.elites) }];
    }
};

export const generateWaves = (route: Route, fallbackRoute?: Route): Wave[] => {
    const numWaves = getRandomItem([1, 2]);

    const waves = [];
    let enemyPool = numWaves === 1 ? route.enemies || fallbackRoute?.enemies : route.multiWaveEnemies || fallbackRoute?.multiWaveEnemies;
    enemyPool = shuffle(enemyPool || []);

    for (let i = 0; i < numWaves; ++i) {
        let retries = 3;
        const generateEnemies = () => {
            const candidates = enemyPool.shift();
            const numSameEnemies = waves.length && candidates.map((c, j) => c && c?.name === waves[i - 1][j]?.name).filter((v) => v).length;
            const isTooSimilarToPrev = numSameEnemies >= 3;
            if (isTooSimilarToPrev && retries) {
                enemyPool.push(candidates);
                generateEnemies();
                --retries;
            } else {
                waves.push({ enemies: candidates });
            }
        };
        generateEnemies();
    }

    return waves;
};

import { ACTION_TYPES, Effect, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { Wave } from "../battle/types";
import { clandestine, lifeLink, poisonous } from "../enemy/effect";
import { avenger, elite, eliteSquad, eliteTrio, eruptive, explosive, raging, shielding, thorns } from "./../ability/Effects";
import { tantrum } from "./../enemy/abilities";
import { getRandomItem, shuffle } from "./../utils";
import { EliteMap, Route } from "./types";

const generateEliteSquad = (eliteMap: EliteMap): (Minion | null)[] => {
    const affix = getRandomItem([thorns, raging, avenger, shielding, explosive, lifeLink, clandestine]);
    const baseEnemy = getRandomItem(eliteMap.squad);
    const { maxHP, armor, abilities = [], effects = [] } = baseEnemy;

    const applyMultiplier = (val: number = 0) => (val === 0 ? 0 : Math.floor(val * 1.2 + 20));

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: applyMultiplier(maxHP),
        armor: applyMultiplier(armor),
        abilities: [...abilities],
        effects: [...effects, eliteSquad, affix],
    };

    const alternateResource = {
        ...enemy,
        resources: 2,
    };

    return [enemy, alternateResource, enemy, alternateResource, enemy];
};

const generateEliteTriad = (eliteMap: EliteMap): (Minion | null)[] => {
    const affix = getRandomItem([thorns, raging, avenger, shielding, explosive, lifeLink, clandestine]);
    const ability = getRandomItem([tantrum]);
    const baseEnemy = getRandomItem(eliteMap.trio);

    const { maxHP, armor, abilities = [], effects = [] } = baseEnemy;
    const applyMultiplier = (val: number = 0) => (val === 0 ? 0 : Math.floor(val * 1.25 + 30));

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: applyMultiplier(maxHP),
        armor: applyMultiplier(armor),
        abilities: [...abilities, ability],
        effects: [...effects, eliteTrio, affix],
    };

    const alternateResource = {
        ...enemy,
        resources: 2,
    };

    return getRandomItem([
        [null, enemy, alternateResource, enemy, null],
        [enemy, null, alternateResource, null, enemy],
        [enemy, null, alternateResource, enemy, null],
        [null, enemy, alternateResource, null, enemy],
    ]);
};

const generateEliteDuo = (eliteMap: EliteMap): (Minion | null)[] => {
    const affix = getRandomItem([thorns, raging, shielding, explosive, lifeLink, clandestine, poisonous]);
    const ability = getRandomItem([tantrum]);
    const baseEnemy = getRandomItem(eliteMap.duo || eliteMap.trio);

    const { maxHP, armor, abilities = [], effects = [] } = baseEnemy;
    const applyMultiplier = (val: number = 0) => (val === 0 ? 0 : Math.floor(val * 1.35 + 40));

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: applyMultiplier(maxHP),
        armor: applyMultiplier(armor),
        abilities: [...abilities, ability],
        effects: [...effects, eliteSquad, affix],
    };

    const alternateResource = {
        ...enemy,
        resources: 2,
    };

    return getRandomItem([
        [null, enemy, alternateResource, null, null],
        [null, null, alternateResource, enemy, null],
        [null, alternateResource, null, enemy, null],
        [null, enemy, null, alternateResource, null],
        [alternateResource, null, null, null, enemy],
        [enemy, null, null, null, alternateResource],
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
    const { maxHP, armor, abilities = [], effects = [] } = baseEnemy;
    const applyMultiplier = (val: number = 0) => (val === 0 ? 0 : Math.floor(val * 1.5 + 50));

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: applyMultiplier(maxHP),
        armor: applyMultiplier(armor),
        abilities: [...abilities, tantrum],
        effects: [...effects, elite, affix],
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

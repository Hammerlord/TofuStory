import { Ability, ACTION_TYPES, Effect, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { Wave } from "../battle/types";
import { sneaky, lifeLink, poisonous } from "../enemy/effect";
import { avenger, elite, eliteSquad, eliteTrio, eruptive, explosive, raging, shielding, thorns } from "./../ability/Effects";
import { attack, tantrum } from "./../enemy/abilities";
import { getRandomItem, shuffle } from "./../utils";
import { EliteMap, Route } from "./types";

const findAttackDamage = (minion: Minion): number => {
    let attackDamage = 0;
    let backupAttackDamage = 0;
    for (const ability of minion?.abilities || []) {
        for (const action of ability.actions) {
            if (ability.name === attack.name) {
                attackDamage = action.damage;
                break;
            }
            if (action.damage) {
                backupAttackDamage = action.damage;
            }
        }
    }
    return attackDamage || backupAttackDamage;
};

const generateTantrumAttack = (baseEnemy: Minion): Ability => {
    const attackDamage = findAttackDamage(baseEnemy);

    return {
        ...tantrum,
        actions: [
            {
                target: TARGET_TYPES.HOSTILE,
                type: ACTION_TYPES.ATTACK,
                damage: Math.ceil(attackDamage * 1.2),
            },
            {
                target: TARGET_TYPES.HOSTILE,
                type: ACTION_TYPES.ATTACK,
                damage: Math.ceil(attackDamage * 1.2),
            },
            {
                target: TARGET_TYPES.HOSTILE,
                type: ACTION_TYPES.ATTACK,
                damage: Math.ceil(attackDamage * 1.2),
            },
        ],
    };
};

const generateEliteSquad = (eliteMap: EliteMap, numAffixes: number = 1): (Minion | null)[] => {
    const affixes = shuffle([thorns, raging, avenger, shielding, explosive, lifeLink, sneaky]).slice(0, numAffixes);
    const baseEnemy = getRandomItem(eliteMap.squad);
    const { maxHP, armor, abilities = [], effects = [] } = baseEnemy;

    const applyMultiplier = (val: number = 0) => (val === 0 ? 0 : Math.floor(val * 1.2 + 10));

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: applyMultiplier(maxHP),
        armor: applyMultiplier(armor),
        abilities: [...abilities],
        effects: [...effects, eliteSquad, ...affixes],
    };

    const alternateResource = {
        ...enemy,
        resources: 2,
    };

    return [enemy, alternateResource, enemy, alternateResource, enemy];
};

const generateEliteTriad = (eliteMap: EliteMap, numAffixes: number = 1): (Minion | null)[] => {
    const affixes = shuffle([thorns, raging, avenger, shielding, explosive, lifeLink, sneaky]).slice(0, numAffixes);
    const baseEnemy = getRandomItem(eliteMap.trio);
    const ability = getRandomItem([generateTantrumAttack(baseEnemy)]);

    const { maxHP, armor, abilities = [], effects = [] } = baseEnemy;
    const applyMultiplier = (val: number = 0) => (val === 0 ? 0 : Math.floor(val * 1.2 + 15));

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: applyMultiplier(maxHP),
        armor: applyMultiplier(armor),
        abilities: [...abilities, ability],
        effects: [...effects, eliteTrio, ...affixes],
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

const generateEliteDuo = (eliteMap: EliteMap, numAffixes: number = 1): (Minion | null)[] => {
    const affixes = shuffle([thorns, raging, shielding, explosive, lifeLink, sneaky, poisonous]).slice(0, numAffixes);
    const baseEnemy = getRandomItem(eliteMap.duo || eliteMap.trio);
    const ability = getRandomItem([generateTantrumAttack(baseEnemy)]);

    const { maxHP, armor, abilities = [], effects = [] } = baseEnemy;
    const applyMultiplier = (val: number = 0) => (val === 0 ? 0 : Math.floor(val * 1.3 + 20));

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: applyMultiplier(maxHP),
        armor: applyMultiplier(armor),
        abilities: [...abilities, ability],
        effects: [...effects, eliteTrio, ...affixes],
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

const generateElite = (eliteMap: EliteMap, numAffixes: number = 1): (Minion | null)[] => {
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
    const affixes = shuffle([thorns, raging, shielding, eruptive, swarming, sneaky, poisonous]).slice(0, numAffixes);
    const baseEnemy = getRandomItem(eliteMap.single);
    const { maxHP, armor, abilities = [], effects = [] } = baseEnemy;
    const ability = getRandomItem([generateTantrumAttack(baseEnemy)]);
    const applyMultiplier = (val: number = 0) => (val === 0 ? 0 : Math.floor(val * 1.4 + 25));

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: applyMultiplier(maxHP),
        armor: applyMultiplier(armor),
        abilities: [...abilities, ability],
        effects: [...effects, elite, ...affixes],
    };

    return [null, getRandomItem(eliteMap.minions), enemy, getRandomItem(eliteMap.minions), null];
};

export const generateElites = (route: Route): { enemies: Minion[] }[] => {
    const getSquad = () => generateEliteSquad(route.elites, route.eliteOptions?.numAffixes);
    const getTriad = () => generateEliteTriad(route.elites, route.eliteOptions?.numAffixes);
    const getDuo = () => generateEliteDuo(route.elites, route.eliteOptions?.numAffixes);
    const getSingle = () => generateElite(route.elites, route.eliteOptions?.numAffixes);

    const eliteGenerators = [getSquad, getTriad, getDuo, getSingle];
    if (route.elites.special?.length > 0) {
        eliteGenerators.push(() => getRandomItem(route.elites.special));
    }

    return [{ enemies: getRandomItem(eliteGenerators)() }];
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

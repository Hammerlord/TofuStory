import { Ability, ACTION_TYPES, Effect, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { Wave } from "../battle/types";
import { sneaky, lifeLink, poisonous } from "../enemy/effect";
import {
    avenger,
    elite,
    eliteSquad,
    eliteThorns,
    eliteTrio,
    eruptive,
    explosive,
    raging,
    warding,
    stoneSkin,
    vengeful,
} from "./../ability/Effects";
import { attack, tantrum, shoot } from "./../enemy/abilities";
import { getRandomItem, moveHeadToTail, shuffle } from "./../utils";
import { EliteMap, EliteOptions, Route } from "./types";

const findAttackDamage = (minion: Minion): number => {
    let attackDamage = 0;
    let backupAttackDamage = 0;
    for (const ability of minion?.abilities || []) {
        if (ability?.resourceCost) {
            // Special abilities are not counted
            continue;
        }
        for (const action of ability.actions) {
            if ([attack.name, shoot.name].includes(ability.name)) {
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
    const attackDamage = findAttackDamage(baseEnemy) || 1;

    return {
        ...tantrum,
        actions: [
            {
                target: TARGET_TYPES.RANDOM_HOSTILE,
                type: ACTION_TYPES.ATTACK,
                damage: Math.ceil(attackDamage),
            },
            {
                target: TARGET_TYPES.RANDOM_HOSTILE,
                type: ACTION_TYPES.ATTACK,
                damage: Math.ceil(attackDamage),
            },
            {
                target: TARGET_TYPES.RANDOM_HOSTILE,
                type: ACTION_TYPES.ATTACK,
                damage: Math.ceil(attackDamage),
            },
        ],
    };
};

// To help with early game scaling, Avenger's damage cannot exceed the character's base attack damage.
const getAdjustedAvenger = (baseEnemy: Minion): Effect => {
    const attackDamage = findAttackDamage(baseEnemy) || 1;
    return {
        ...avenger,
        onFriendlyDeath: {
            ...avenger.onFriendlyDeath,
            effects: [
                {
                    ...vengeful,
                    attackPower: Math.min(attackDamage, vengeful.attackPower),
                },
            ],
        },
    };
};

const getRecentEnemies = (previousEncounters: Wave[][]) => {
    // Do not allow fighting the same enemies close together
    const lastThreeEncounters = previousEncounters.slice().reverse().slice(0, 3);
    const recentEnemyLog = lastThreeEncounters.reduce((acc, waves: Wave[]) => {
        waves.forEach((wave) => {
            wave.enemies.forEach((enemy: Minion | null) => {
                if (enemy) {
                    acc[enemy.name] = true;
                }
            });
        });

        return acc;
    }, {});
    return recentEnemyLog;
};

const pickBaseEnemy = ({ elites, previousEncounters }: { elites: Minion[]; previousEncounters: Wave[][] }): Minion => {
    const recentEnemyLog = getRecentEnemies(previousEncounters);
    const eligibleEnemies = elites.filter((enemy: Minion) => {
        return !recentEnemyLog[enemy.name];
    });

    return getRandomItem(eligibleEnemies.length ? eligibleEnemies : elites);
};

export const generateEliteSquad = ({
    eliteMap,
    options,
    previousEncounters,
}: {
    eliteMap: EliteMap;
    options?: EliteOptions;
    previousEncounters: Wave[][];
}): (Minion | null)[] => {
    const { numAffixes = 1, damageModifier = 0 } = options || {};

    const baseEnemy = pickBaseEnemy({ elites: eliteMap.squad, previousEncounters });
    const affixPool = [eliteThorns, raging, warding, explosive, lifeLink, sneaky];
    if (!baseEnemy.armor) {
        affixPool.push(stoneSkin);
    }
    const affixes = shuffle(affixPool).slice(0, numAffixes);

    const { maxHP, armor, abilities = [], effects = [] } = baseEnemy;

    const applyMultiplier = (val: number = 0) => (val === 0 ? 0 : Math.floor(val * 1.3 + 10));
    const finalDamageMod = Math.max(0, damageModifier - 1);

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: applyMultiplier(maxHP),
        armor: applyMultiplier(armor),
        abilities: [...abilities],
        effects: [...effects, { ...eliteSquad, attackPower: eliteSquad.attackPower + finalDamageMod }, ...affixes],
    };

    const alternate = {
        ...enemy,
        resources: 2,
        // It feels a bit more varied if the enemy aren't 100% coordinated in when they attack or not (for enemies with more than one ability)
        abilities: moveHeadToTail(enemy.abilities),
        // Same with effects: the enemies eg. don't all stealth at once
        effects: enemy.effects.map((e) => {
            return {
                ...e,
                uptime: 2,
                onWaveStart: undefined,
            };
        }),
    };

    return [enemy, alternate, enemy, alternate, enemy];
};

const generateEliteTriad = ({
    eliteMap,
    options,
    previousEncounters,
}: {
    eliteMap: EliteMap;
    options?: EliteOptions;
    previousEncounters: Wave[][];
}): (Minion | null)[] => {
    const { numAffixes = 1, damageModifier = 0 } = options || {};

    const baseEnemy = pickBaseEnemy({ elites: eliteMap.trio, previousEncounters });
    const affixPool = [eliteThorns, raging, getAdjustedAvenger(baseEnemy), warding, explosive, lifeLink, sneaky];
    if (!baseEnemy.armor) {
        affixPool.push(stoneSkin);
    }
    const affixes = shuffle(affixPool).slice(0, numAffixes);

    const ability = getRandomItem([generateTantrumAttack(baseEnemy)]);

    const { maxHP, armor, abilities = [], effects = [] } = baseEnemy;
    const applyMultiplier = (val: number = 0) => (val === 0 ? 0 : Math.floor(val * 1.4 + 15));

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: applyMultiplier(maxHP),
        armor: applyMultiplier(armor),
        abilities: [...abilities, ability],
        effects: [...effects, { ...eliteTrio, attackPower: eliteTrio.attackPower + damageModifier }, ...affixes],
    };

    const alternate = {
        ...enemy,
        resources: 2,
        // It feels a bit more varied if the enemy aren't 100% coordinated in when they attack or not (for enemies with more than one ability)
        abilities: moveHeadToTail(enemy.abilities),
    };

    return getRandomItem([
        [null, enemy, alternate, enemy, null],
        [enemy, null, alternate, null, enemy],
        [enemy, null, alternate, enemy, null],
        [null, enemy, alternate, null, enemy],
    ]);
};

const generateEliteDuo = ({
    eliteMap,
    options,
    previousEncounters,
}: {
    eliteMap: EliteMap;
    options?: EliteOptions;
    previousEncounters: Wave[][];
}): (Minion | null)[] => {
    const { numAffixes = 1, damageModifier = 0 } = options || {};
    const baseEnemy = pickBaseEnemy({ elites: eliteMap.duo || eliteMap.trio, previousEncounters });
    const affixPool = [eliteThorns, raging, warding, explosive, lifeLink, sneaky, poisonous];
    if (!baseEnemy.armor) {
        affixPool.push(stoneSkin);
    }

    const affixes = shuffle(affixPool).slice(0, numAffixes);

    const ability = getRandomItem([generateTantrumAttack(baseEnemy)]);

    const { maxHP, armor, abilities = [], effects = [] } = baseEnemy;
    const applyMultiplier = (val: number = 0) => (val === 0 ? 0 : Math.floor(val * 1.6 + 20));

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: applyMultiplier(maxHP),
        armor: applyMultiplier(armor),
        abilities: [...abilities, ability],
        effects: [...effects, { ...elite, attackPower: elite.attackPower + damageModifier }, ...affixes],
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

const generateElite = ({
    eliteMap,
    options,
    previousEncounters,
}: {
    eliteMap: EliteMap;
    options?: EliteOptions;
    previousEncounters: Wave[][];
}): (Minion | null)[] => {
    const { numAffixes = 1, damageModifier = 0 } = options || {};
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

    const baseEnemy = pickBaseEnemy({ elites: eliteMap.single, previousEncounters });
    const affixPool = [eliteThorns, raging, warding, eruptive, swarming, sneaky, poisonous];
    if (!baseEnemy.armor) {
        affixPool.push(stoneSkin);
    }

    const affixes = shuffle(affixPool).slice(0, numAffixes);
    const { maxHP, armor, abilities = [], effects = [] } = baseEnemy;
    const ability = getRandomItem([generateTantrumAttack(baseEnemy)]);
    const applyMultiplier = (val: number = 0) => (val === 0 ? 0 : Math.floor(val * 1.8 + 30));

    const enemy = {
        ...baseEnemy,
        isElite: true,
        maxHP: applyMultiplier(maxHP),
        armor: applyMultiplier(armor),
        abilities: [...abilities, ability],
        effects: [...effects, { ...elite, attackPower: elite.attackPower + damageModifier * 2 }, ...affixes],
    };

    return [null, getRandomItem(eliteMap.minions), enemy, getRandomItem(eliteMap.minions), null];
};

export const generateElites = (route: Route, previousEncounters: Wave[][]): { enemies: Minion[] }[] => {
    if (!route) {
        return;
    }

    const eliteProps = { eliteMap: route.elites, options: route.eliteOptions, previousEncounters };
    const getSquad = () => generateEliteSquad(eliteProps);
    const getTriad = () => generateEliteTriad(eliteProps);
    const getDuo = () => generateEliteDuo(eliteProps);
    const getSingle = () => generateElite(eliteProps);

    const eliteGenerators = [getSquad, getTriad, getDuo, getSingle];

    if (route.elites.special?.length > 0) {
        eliteGenerators.push(() => {
            const eligibleEnemies = route.elites.special.filter((enemySet: (Minion | null)[]) => {
                const recentEnemyLog = getRecentEnemies(previousEncounters);
                return enemySet.every((enemy) => !enemy || !recentEnemyLog[enemy.name]);
            });
            return getRandomItem(eligibleEnemies.length ? eligibleEnemies : route.elites.special);
        });
    }

    return [{ enemies: getRandomItem(eliteGenerators)() }];
};

export const generateWaves = ({
    route,
    fallbackRoute,
    previousEncounters = [],
}: {
    route: Route;
    fallbackRoute?: Route;
    previousEncounters: Wave[][];
}): Wave[] => {
    const numWaves = getRandomItem([1, 2]);

    const waves = [];
    const baseEnemyPool: Minion[][] =
        numWaves === 1 ? route.enemies || fallbackRoute?.enemies : route.multiWaveEnemies || fallbackRoute?.multiWaveEnemies;

    let enemyPool = baseEnemyPool.slice();

    const lastThreeBattles = previousEncounters.slice().reverse().slice(0, 3);
    const getNames = (characters: (Minion | null)[]) => JSON.stringify(characters.map((e) => e?.name)); // Quick and dirty way to identify the board enemy side.

    const filteredEnemyPool = (enemyPool || []).filter((enemies: Minion[]) => {
        const enemyNames = getNames(enemies);
        return lastThreeBattles.every((waves: Wave[]) => {
            return waves.every((wave: Wave) => {
                return enemyNames !== getNames(wave.enemies);
            });
        });
    });

    if (filteredEnemyPool.length > 0) {
        enemyPool = filteredEnemyPool;
    }

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

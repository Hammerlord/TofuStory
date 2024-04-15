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
import { getRandomItem, shuffle } from "./../utils";
import { EliteMap, Route } from "./types";

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

const generateEliteSquad = ({ eliteMap, numAffixes = 1 }: { eliteMap: EliteMap; numAffixes: number }): (Minion | null)[] => {
    const affixes = shuffle([eliteThorns, raging, warding, explosive, lifeLink, sneaky, stoneSkin]).slice(0, numAffixes);
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

    // It feels a bit more varied if the enemy aren't 100% coordinated in when they attack or not (for enemies with more than one ability)
    const alternateAbilities: Ability[] = enemy.abilities.slice();
    if (alternateAbilities.length) {
        alternateAbilities.push(alternateAbilities.shift());
    }
    const alternate = {
        ...enemy,
        resources: 2,
        abilities: alternateAbilities,
    };

    return [enemy, alternate, enemy, alternate, enemy];
};

const generateEliteTriad = ({ eliteMap, numAffixes = 1 }: { eliteMap: EliteMap; numAffixes: number }): (Minion | null)[] => {
    const baseEnemy = getRandomItem(eliteMap.trio);
    const affixes = shuffle([eliteThorns, raging, getAdjustedAvenger(baseEnemy), warding, explosive, lifeLink, sneaky, stoneSkin]).slice(
        0,
        numAffixes
    );

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

    // It feels a bit more varied if the enemy aren't 100% coordinated in when they attack or not (for enemies with more than one ability)
    const alternateAbilities: Ability[] = enemy.abilities.slice();
    if (alternateAbilities.length) {
        alternateAbilities.push(alternateAbilities.shift());
    }
    const alternate = {
        ...enemy,
        resources: 2,
        abilities: alternateAbilities,
    };

    return getRandomItem([
        [null, enemy, alternate, enemy, null],
        [enemy, null, alternate, null, enemy],
        [enemy, null, alternate, enemy, null],
        [null, enemy, alternate, null, enemy],
    ]);
};

const generateEliteDuo = ({ eliteMap, numAffixes = 1 }: { eliteMap: EliteMap; numAffixes: number }): (Minion | null)[] => {
    const affixes = shuffle([eliteThorns, raging, warding, explosive, lifeLink, sneaky, poisonous, stoneSkin]).slice(0, numAffixes);
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

const generateElite = ({ eliteMap, numAffixes = 1 }: { eliteMap: EliteMap; numAffixes: number }): (Minion | null)[] => {
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
    const affixes = shuffle([eliteThorns, raging, warding, eruptive, swarming, sneaky, poisonous, stoneSkin]).slice(0, numAffixes);
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

export const generateElites = (route: Route, previousEncounters: Wave[][]): { enemies: Minion[] }[] => {
    if (!route) {
        return;
    }

    const eliteProps = { eliteMap: route.elites, numAffixes: route.eliteOptions?.numAffixes };
    const getSquad = () => generateEliteSquad(eliteProps);
    const getTriad = () => generateEliteTriad(eliteProps);
    const getDuo = () => generateEliteDuo(eliteProps);
    const getSingle = () => generateElite(eliteProps);

    const eliteGenerators = [getSquad, getTriad, getDuo, getSingle];

    if (route.elites.special?.length > 0) {
        eliteGenerators.push(() => {
            const eligibleEnemies = route.elites.special.filter((enemySet: (Minion | null)[]) => {
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

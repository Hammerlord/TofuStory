import { parseAction } from "./../battle/parseAbilityActions";
import { cloneDeep } from "lodash";
import { Effect } from "./../ability/types";
import { getRandomItem, shuffle } from "./../utils";
import { applyActionToCharacter, Event } from "../battle/parseAbilityActions";
import { Ability, EFFECT_TYPES, TARGET_TYPES } from "../ability/types";
import { Enemy } from "./tofu";
import { Combatant } from "../character/types";

const getPossibleMoveIndices = ({ currentLocationIndex, enemies, movement }): number[] => {
    const min = Math.max(0, currentLocationIndex - movement);
    const max = Math.min(enemies.length, currentLocationIndex + movement);
    const moveIndices = [];
    for (let i = min; i < max; ++i) {
        if (!enemies[i]) {
            moveIndices.push(i);
        }
    }
    return moveIndices;
};

const isBusy = (enemy: Combatant): boolean => {
    return enemy?.effects?.some((effect) => effect.type === EFFECT_TYPES.STUN);
};

const getPopulatedEnemyIndices = (enemies) => {
    const indices = [];
    enemies.forEach((enemy, i) => {
        if (enemy && !isBusy(enemy)) {
            indices.push(i);
        }
    });
    return indices;
};

/**
 * For now this is just to check that if a movement ability was picked, there are no obstructions blocking that movement.
 * Otherwise, pick a different ability.
 */
const canUseAbility = ({ enemy, ability, enemies }): boolean => {
    const movementAction = ability.actions.find((action) => action.movement);
    if (!movementAction) {
        return true;
    }
    const index = enemies.findIndex((e: Combatant) => e && e.id === enemy.id);
    return (
        getPossibleMoveIndices({
            currentLocationIndex: index,
            enemies,
            movement: movementAction.movement,
        }).length > 0
    );
};

const enemyMove = ({ casterId, allies, enemies }): Event[] => {
    const caster = enemies.find((e) => e && e.id === casterId);
    const { abilities } = caster;
    const ability: Ability = getRandomItem(
        abilities.filter((a) => canUseAbility({ enemy: caster, ability: a, enemies }))
    );

    const getValidTargetIndices = (characters: (Combatant | null)[]) => {
        const indices = [];
        characters.forEach((character: Combatant | null, i: number) => {
            if (character && character.HP > 0) {
                indices.push(i);
            }
        });
        return indices;
    };

    const results = [];
    ability.actions.forEach((action) => {
        const { target, movement } = action;
        let targetIndex;
        // Each subsequent action should be based on the most recently updated enemies/player states.
        const recentEnemies = results[results.length - 1]?.updatedEnemies || enemies;
        const recentAllies = results[results.length - 1]?.updatedAllies || allies;

        if (movement) {
            targetIndex = getRandomItem(
                getPossibleMoveIndices({
                    currentLocationIndex: recentEnemies.findIndex(
                        (enemy) => enemy?.id === casterId
                    ),
                    enemies: recentEnemies,
                    movement,
                })
            );
        } else if (target === TARGET_TYPES.FRIENDLY) {
            const validEnemyIndices = getValidTargetIndices(recentEnemies);
            targetIndex = getRandomItem(validEnemyIndices);
        } else if (target === TARGET_TYPES.HOSTILE) {
            const validAllyIndices = getValidTargetIndices(recentAllies);
            targetIndex = getRandomItem(validAllyIndices);
        }

        results.push(
            parseAction({
                casterId,
                enemies: recentEnemies,
                allies: recentAllies,
                targetIndex,
                action,
            })
        );
    });
    return results;
};

const enemyTurn = ({ enemies, allies }): Event[] => {
    const randomizedIndices = shuffle(getPopulatedEnemyIndices(enemies)); // Randomize enemy move order
    const results = [];
    // Each subsequent move should be based on the most recently updated enemies/player states.
    const getRecentEnemies = () => results[results.length - 1]?.updatedEnemies || enemies;
    const getRecentAllies = () => results[results.length - 1]?.updatedAllies || allies;
    randomizedIndices.forEach((i) => {
        const enemy = enemies[i];
        if (!enemy || enemy.HP === 0) {
            return;
        }

        results.push(
            ...enemyMove({
                casterId: enemy.id,
                allies: getRecentAllies(),
                enemies: getRecentEnemies(),
            })
        );
    });

    let totalBleedDamage = 0;
    const enemiesWithBleedsTriggered: Combatant[] = getRecentEnemies().map(
        (enemy: Combatant, i: number) => {
            if (!enemy) {
                return enemy;
            }
            const bleedDamage: number = enemy.effects.reduce((acc: number, effect: Effect) => {
                if (effect.type === EFFECT_TYPES.BLEED) {
                    acc += effect.damage || 1;
                }
                return acc;
            }, 0);

            totalBleedDamage += bleedDamage;
            return applyActionToCharacter(enemy, {
                damage: bleedDamage,
                description: "Enemies took bleed damage.",
            });
        }
    );

    if (totalBleedDamage) {
        results.push({
            updatedEnemies: enemiesWithBleedsTriggered,
            updatedAllies: getRecentAllies(),
        } as Event);
    }

    return results;
};

export default enemyTurn;

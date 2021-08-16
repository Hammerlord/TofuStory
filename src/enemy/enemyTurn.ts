import { cloneDeep } from "lodash";
import { Effect } from "./../ability/types";
import { getRandomItem, shuffle } from "./../utils";
import { applyActionToCharacter, Event } from "../battle/parseAbilityActions";
import { Ability, EFFECT_TYPES, TARGET_TYPES } from "../ability/types";
import { Enemy } from "./tofu";
import { Combatant } from "../character/types";

const getPossibleMoveIndices = ({
    currentLocationIndex,
    enemies,
    movement,
}): number[] => {
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
        abilities.filter((a) =>
            canUseAbility({ enemy: caster, ability: a, enemies })
        )
    );

    const getValidTargetIndices = (characters: (Combatant | null)[]) => {
        const indices = [];
        characters.forEach((character: Combatant | null, i: number) => {
            if (character && character.HP > 0) {
                indices.push(i);
            }
        });
        console.log('indices', indices);
        return indices;
    };

    return ability.actions.map((action) => {
        const { target, movement, area = 0 } = action;
        let updatedEnemies;
        let updatedAllies;

        const updateCharacters = (
            characters: (Combatant | null)[],
            targetIndex: number
        ): Combatant[] => {
            return characters.map((character: Combatant | null, i: number) => {
                if (!character) {
                    return null;
                }

                const isTargetHit =
                    i >= targetIndex - area && i <= targetIndex + area;
                if (isTargetHit) {
                    return applyActionToCharacter(character, action);
                }
                return cloneDeep(character);
            });
        };

        if (target === TARGET_TYPES.SELF) {
            const index = enemies.findIndex((e) => e && e.id === caster.id);
            updatedEnemies = updateCharacters(enemies, index);
            if (movement) {
                const targetIndex = getRandomItem(
                    getPossibleMoveIndices({
                        currentLocationIndex: index,
                        enemies,
                        movement,
                    })
                );
                [updatedEnemies[index], updatedEnemies[targetIndex]] = [
                    updatedEnemies[targetIndex],
                    updatedEnemies[index],
                ];
            }
        } else if (target === TARGET_TYPES.FRIENDLY) {
            const validEnemyIndices = getValidTargetIndices(enemies);
            const targetIndex = getRandomItem(validEnemyIndices);
            updatedEnemies = updateCharacters(enemies, targetIndex);
        } else {
            updatedEnemies = enemies.map(cloneDeep);
        }

        if (target === TARGET_TYPES.HOSTILE) {
            const validAllyIndices = getValidTargetIndices(allies);
            const targetIndex = getRandomItem(validAllyIndices);
            updatedAllies = updateCharacters(allies, targetIndex);
        } else {
            updatedAllies = allies.map(cloneDeep);
        }

        return {
            action,
            updatedAllies,
            updatedEnemies,
            casterId: caster.id,
        };
    });
};

const enemyTurn = ({ enemies, allies }): Event[] => {
    const randomizedIndices = shuffle(getPopulatedEnemyIndices(enemies)); // Randomize enemy move order
    const enemyActions = [];
    randomizedIndices.forEach((i) => {
        const enemy = enemies[i];
        if (!enemy || enemy.HP === 0) {
            return;
        }

        const parsed = enemyMove({ casterId: enemy.id, allies, enemies });
        // Each subsequent action should be based on the most recently updated enemies/player states.
        const latest = parsed[parsed.length - 1];
        enemies = latest.updatedEnemies;
        allies = latest.updatedAllies;
        enemyActions.push(...parsed);
    });

    const enemiesWithBleedsTriggered: Combatant[] = enemies.map(
        (enemy: Combatant, i: number) => {
            if (!enemy) {
                return enemy;
            }
            const totalBleedDamage: number = enemy.effects.reduce(
                (acc: number, effect: Effect) => {
                    if (effect.type === EFFECT_TYPES.BLEED) {
                        acc += effect.damage || 1;
                    }
                    return acc;
                },
                0
            );

            return applyActionToCharacter(enemy, {
                damage: totalBleedDamage,
                description: "Enemies took bleed damage.",
            });
        }
    );

    enemyActions.push({
        updatedEnemies: enemiesWithBleedsTriggered,
        updatedAllies: allies,
    } as Event);

    return enemyActions;
};

export default enemyTurn;

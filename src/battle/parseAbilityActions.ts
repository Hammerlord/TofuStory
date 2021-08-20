import { createCombatant } from "./../enemy/createEnemy";
import uuid from "uuid";
import { Effect } from "./../ability/types";
import { Action, TARGET_TYPES } from "../ability/types";
import { Combatant, CombatPlayer } from "../character/types";
import { cloneDeep } from "lodash";

/**
 * The results of an action being applied.
 */
export interface Event {
    action?: Action;
    updatedAllies: Combatant[];
    updatedEnemies: Combatant[];
    casterId?: string;
}

// it's like an Action, but can be synthetic, so it doesn't necessarily have a target
// ... yeah I know
interface ApplyAction {
    damage?: number;
    healing?: number;
    armor?: number;
    effects?: Effect[];
    resources?: number;
    description?: string;
}

export const applyActionToCharacter = (character: Combatant, action: ApplyAction): Combatant => {
    const { damage = 0, healing = 0, armor = 0, effects = [], resources = 0 } = action;

    const updatedArmor = Math.max(0, character.armor - damage + armor);
    const healthDamage = Math.max(0, damage - character.armor);
    let HP = Math.max(0, character.HP - healthDamage);
    HP = HP > 0 ? Math.min(character.maxHP, HP + healing) : 0;
    const updatedEffects: Effect[] =
        HP === 0 ? [] : [...character.effects, ...(effects.map(cloneDeep) as Effect[])];
    return {
        ...character,
        HP,
        armor: updatedArmor,
        effects: updatedEffects,
        resources: (character.resources || 0) + resources,
    };
};

const calculateThornsDamage = (action: Action, hitTargets: Combatant[]): number => {
    if (!action.damage) {
        return 0;
    }

    return hitTargets.reduce((acc, { effects }) => {
        return acc + effects.reduce((acc, { thorns = 0 }) => acc + thorns, 0);
    }, 0);
};

const parseAction = ({ enemies, allies, action, targetIndex, side, casterId }): Event => {
    const { area = 0, target: targetType } = action;

    const { friendly, hostile, caster } = getFriendlyOrHostile({
        enemies,
        allies,
        casterId,
    });
    const isInArea = (character, i) => {
        return character && i >= targetIndex - area && i <= targetIndex + area;
    };
    let targets = [];
    if (targetType === TARGET_TYPES.SELF) {
        targets = [caster];
    } else if (targetType === TARGET_TYPES.FRIENDLY) {
        targets = friendly.filter(isInArea);
    } else if (targetType === TARGET_TYPES.HOSTILE) {
        targets = hostile.filter(isInArea);
    }

    const updatedTargetsMap = targets
        .map((character) => applyActionToCharacter(character, action))
        .reduce((acc, current) => {
            acc[current.id] = current;
            return acc;
        }, {});

    const thornsDamage = calculateThornsDamage(action, targets);
    if (thornsDamage > 0) {
        updatedTargetsMap[casterId] = applyActionToCharacter(
            updatedTargetsMap[casterId] || caster,
            {
                damage: thornsDamage,
            }
        );
    }

    const getUpdatedCharacter = (character) => {
        return updatedTargetsMap[character?.id] || cloneDeep(character);
    };

    return {
        action,
        updatedAllies: allies.map(getUpdatedCharacter),
        updatedEnemies: enemies.map(getUpdatedCharacter),
        casterId,
    };
};

const getFriendlyOrHostile = ({ casterId, enemies, allies }) => {
    const [friendly, hostile] = allies.find((ally) => ally && ally.id === casterId)
        ? [allies, enemies]
        : [enemies, allies];
    return {
        friendly,
        hostile,
        caster: friendly.find((character) => character && character.id === casterId),
    };
};

export const useAllyAbility = ({
    enemies,
    targetIndex,
    side,
    ability,
    allies,
    casterId,
}): Event[] => {
    const { minion, actions, resourceCost } = ability;
    const results = [];

    if (minion) {
        results.push({
            updatedEnemies: enemies.map(cloneDeep),
            updatedAllies: allies.map((ally: Combatant | null, i: number) => {
                return i === targetIndex ? createCombatant(minion) : cloneDeep(ally);
            }),
            casterId,
        });
    }

    // All actions should be based on the most recent version of enemies/allies
    const mostRecentEnemies = () => results[results.length - 1]?.updatedEnemies || enemies;
    const mostRecentAllies = () => results[results.length - 1]?.updatedAllies || allies;

    results.push(
        ...actions.map((action: Action) => {
            const parsed = parseAction({
                enemies: mostRecentEnemies(),
                allies: mostRecentAllies(),
                targetIndex,
                side,
                action,
                casterId,
            });

            return parsed;
        })
    );

    const caster = mostRecentAllies().find((ally) => ally?.id === casterId);

    const healthPerResourcesSpent = caster.effects.reduce(
        (acc, { healthPerResourcesSpent = 0 }) => {
            return acc + healthPerResourcesSpent;
        },
        0
    );

    if (healthPerResourcesSpent > 0) {
        const healing = healthPerResourcesSpent * resourceCost;
        if (healing > 0) {
            const newHP = Math.min(caster.maxHP || Infinity, caster.HP + healing);
            const updatedAllies = mostRecentAllies().map((character) => {
                if (character?.id === caster.id) {
                    return {
                        ...cloneDeep(caster),
                        HP: newHP,
                    };
                }

                return character;
            });
            results.push({
                updatedAllies,
                updatedEnemies: mostRecentEnemies().map(cloneDeep),
                casterId: null,
            });
        }
    }
    return results;
};

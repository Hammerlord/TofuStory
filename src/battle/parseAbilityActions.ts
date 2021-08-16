import { createCombatant } from './../enemy/createEnemy';
import uuid from 'uuid';
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

export const applyActionToCharacter = (
    character: Combatant,
    action: ApplyAction
): Combatant => {
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

export const emptyReport = Object.freeze({
    healingReceived: 0,
    armorGained: 0,
    effectsAdded: [],
    damageTaken: 0,
    isSlain: false,
});

const parseAction = ({ enemies, allies, action, targetIndex, side, casterId }): Event => {
    const { area = 0, target: targetType, minion } = action;

    const isTargetHit = (() => {
        const { friendly, hostile, caster } = getFriendlyOrHostile({
            enemies,
            allies,
            casterId,
        });
        const isTargetHit = (character, i) => {
            return character && i >= targetIndex - area && i <= targetIndex + area;
        };
        let targets = [];
        if (targetType === TARGET_TYPES.SELF) {
            targets = [caster];
        } else if (targetType === TARGET_TYPES.FRIENDLY) {
            targets = friendly.filter(isTargetHit);
        } else if (targetType === TARGET_TYPES.HOSTILE) {
            targets = hostile.filter(isTargetHit);
        }
        return ({ id }) => targets.some((t) => t.id === id);
    })();

    const updateCharacter = (character: Combatant | null): Combatant | null => {
        if (!character) {
            return character;
        }

        if (isTargetHit(character)) {
            return applyActionToCharacter(character, action);
        }

        return cloneDeep(character);
    };

    const updateAllies = (allies: (Combatant | null)[]) => {
        return allies.map((ally: Combatant | null, i) => {
            if (!ally) {
                if (minion && targetIndex === i) {
                    return createCombatant(minion);
                }

                return ally;
            }

            if (isTargetHit(ally)) {
                return applyActionToCharacter(ally, action);
            }

            return cloneDeep(ally);
        });
    };

    return {
        action,
        updatedAllies: updateAllies(allies),
        updatedEnemies: enemies.map(updateCharacter),
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

export const parseAbilityActions = ({
    enemies,
    targetIndex,
    side,
    resourceCost = 0,
    actions = [],
    allies,
    casterId,
}): Event[] => {
    let updatedEnemies = enemies;
    let updatedAllies = allies;
    const parsedActions = actions.map((action) => {
        const parsed = parseAction({
            enemies: updatedEnemies,
            allies: updatedAllies,
            targetIndex,
            side,
            action,
            casterId,
        });

        // All actions should be based on the most recent version of enemies/allies
        updatedEnemies = parsed.updatedEnemies; // "enemies" relative to the player, not to the caster
        updatedAllies = parsed.updatedAllies; // "allies" relative to the player, not to the caster
        return parsed;
    });

    const { friendly, hostile, caster } = getFriendlyOrHostile({
        enemies: updatedEnemies,
        allies: updatedAllies,
        casterId,
    });

    const healthPerResourcesSpent = caster.effects.reduce(
        (acc, { healthPerResourcesSpent = 0 }) => {
            return acc + healthPerResourcesSpent;
        },
        0
    );

    if (healthPerResourcesSpent > 0) {
        const healing = healthPerResourcesSpent * resourceCost;
        if (healing > 0) {
            const newHP = Math.min(caster.maxHP, caster.HP + healing);
            const updatedAllies = friendly.map((character) => {
                if (character && character.id === casterId) {
                    return {
                        ...caster,
                        HP: newHP,
                    };
                }

                return character;
            });
            parsedActions.push({
                updatedAllies,
                updatedEnemies: updatedEnemies.map(cloneDeep),
                casterId: null,
            });
        }
    }
    return parsedActions;
};

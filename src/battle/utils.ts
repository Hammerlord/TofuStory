import { shuffle } from "./../utils";
import { Ability, Action, ACTION_TYPES, TARGET_TYPES } from "./../ability/types";
import { Combatant } from "../character/types";

export const getCharacterStatChanges = ({ oldCharacter, newCharacter }: { oldCharacter: Combatant; newCharacter: Combatant }) => {
    const updatedStatChanges = {} as any;
    const oldEffectiveHP = oldCharacter.HP + oldCharacter.armor;
    const newEffectiveHP = newCharacter.HP + newCharacter.armor;
    if (newEffectiveHP < oldEffectiveHP) {
        updatedStatChanges.damage = oldEffectiveHP - newEffectiveHP;
    }

    if (newCharacter.HP > oldCharacter.HP) {
        updatedStatChanges.healing = newCharacter.HP - oldCharacter.HP;
    }

    if (newCharacter.armor > oldCharacter.armor) {
        updatedStatChanges.armor = newCharacter.armor - oldCharacter.armor;
    }

    return updatedStatChanges;
};

/**
 * Reduces the duration of effects by 1 and removes them if they have run out of time
 */
export const updateEffects = (target: Combatant) => {
    if (!target) {
        return target;
    }

    return {
        ...target,
        effects: target.effects
            .map((effect) => ({
                ...effect,
                duration: (effect.duration || Infinity) - 1,
            }))
            .filter(({ duration = Infinity }) => duration > 0),
    };
};

export const removeEndedEffects = (target: Combatant) => {
    if (!target) {
        return target;
    }

    return {
        ...target,
        effects: target.effects.filter(({ duration = Infinity }) => duration > 0),
    };
};

/**
 * Player conditional helpers
 */

export const canUseAbility = (character, ability: Ability | undefined): boolean => {
    const { resourceCost = 0 } = ability;
    return resourceCost <= (character.resources || 0);
};

export const isValidTarget = ({ ability, side, allies, enemies, index }): boolean => {
    // Get the first action target to determine whether a valid target has been clicked.
    const { actions = [], minion } = ability;

    if (minion) {
        return side === "allies" && (!allies[index] || allies[index].HP === 0);
    }

    const abilityArea = ability.area || 0;
    const { target, area = abilityArea } = actions[0] || {};

    if (side === "allies") {
        if (target === TARGET_TYPES.SELF) {
            return allies[index]?.isPlayer;
        }

        if (target === TARGET_TYPES.FRIENDLY) {
            if (area === 0) {
                // No sense in letting a single target ability whiff on an empty slot, for now
                return Boolean(allies[index]) && allies[index].HP > 0;
            }
            return true;
        }
    } else if (side === "enemies" && (target === TARGET_TYPES.HOSTILE || target === TARGET_TYPES.RANDOM_HOSTILE)) {
        if (area === 0) {
            return Boolean(enemies[index]) && enemies[index].HP > 0;
        }
        return true;
    }

    return false;
};

export const updatePlayer = (statChanges: Function, allies: (Combatant | null)[]): (Combatant | null)[] => {
    const updatedAllies = allies.map((ally) => {
        if (!ally || !ally.isPlayer) {
            return ally;
        }

        return {
            ...ally,
            ...statChanges(ally),
        };
    });

    return updatedAllies;
};

/**
 * Clean up dead characters from previous events, or some staleness may occur.
 */
export const cleanUpDeadCharacters = (characters: (Combatant | null)[]) => {
    return characters.map((character) => {
        if (!character || character.HP > 0) {
            return character;
        }

        return null;
    });
};

export const calculateDamage = ({ actor, target, action }: { actor?: Combatant; target?: Combatant; action: Action }): number => {
    const actionDamage = action.damage || 0;
    if (!actor || action.type !== ACTION_TYPES.ATTACK && action.type !== ACTION_TYPES.RANGE_ATTACK) {
        return actionDamage;
    }

    const damage = actor.effects.reduce((acc, { damage = 0 }) => acc + damage, actor.damage || 0) + actionDamage;
    const damageReceived = target?.effects.reduce((acc, { damageReceived = 0 }) => acc + damageReceived, 0) || 0;
    const totalDamage = damage + damageReceived;
    if (actor.damage > 0 || actionDamage > 0) {
        return Math.max(1, totalDamage); // An actor/ability that can do damage must do at least 1 damage
    }

    return Math.max(0, totalDamage);
};

export const calculateArmor = ({ target, action }): number => {
    const targetArmor = target?.effects.reduce((acc: number, { armorReceived = 0 }) => acc + armorReceived, 0) || 0;
    const armor = targetArmor + (action.armor || 0);
    return Math.max(0, armor);
};

/**
 * @param characters
 * @returns indices of characters that are alive
 */
export const getValidTargetIndices = (characters: (Combatant | null)[]): number[] => {
    const indices = [];
    characters.forEach((character: Combatant | null, i: number) => {
        if (character && character.HP > 0) {
            indices.push(i);
        }
    });
    return indices;
};

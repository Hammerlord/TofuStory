import { shuffle } from "./../utils";
import { Ability, TARGET_TYPES } from "./../ability/types";
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

    const { target, area = 1 } = actions[0] || {};

    if (side === "allies") {
        if (target === TARGET_TYPES.SELF) {
            return allies[index]?.isPlayer;
        }

        if (target === TARGET_TYPES.FRIENDLY) {
            if (area === 1) {
                // No sense in letting a single target ability whiff on an empty slot, for now
                return Boolean(allies[index]) && allies[index].HP > 0;
            }
            return true;
        }
    } else if (side === "enemies" && target === TARGET_TYPES.HOSTILE) {
        if (area === 1) {
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

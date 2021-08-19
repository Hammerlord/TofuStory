import { Ability, TARGET_TYPES } from "./../ability/types";
import { Combatant } from "../character/types";

export const getCharacterStatChanges = ({
    oldCharacter,
    newCharacter,
}: {
    oldCharacter: Combatant;
    newCharacter: Combatant;
}) => {
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
                duration: effect.duration - 1,
            }))
            .filter((effect) => effect.duration > 0),
    };
};

export const getBattleEndResult = ({
    enemies,
    allies,
}): "Draw" | "Victory" | "Defeat" | undefined => {
    const enemiesAllDead = enemies.every((enemy) => !enemy || enemy.HP === 0);
    const playerDead = allies.find((ally) => ally && ally.isPlayer).HP <= 0;

    if (enemiesAllDead && playerDead) {
        return "Draw";
    }

    if (enemiesAllDead) {
        return "Victory";
    }

    if (playerDead) {
        return "Defeat";
    }
};

/**
 * Player conditional helpers
 */

export const canUseAbility = (character, ability: Ability | undefined): boolean => {
    const { resourceCost = 0 } = ability;
    return resourceCost <= (character.resources || 0);
};

export const isValidTarget = ({ ability, side, allies, index }): boolean => {
    // Get the first action target to determine whether a valid target has been clicked.
    const { actions = [], minion } = ability;

    if (minion) {
        return side === "allies" && (!allies[index] || allies[index].HP === 0);
    }

    const { target } = actions[0] || {};

    if (target === TARGET_TYPES.SELF) {
        return side === "allies" && allies[index]?.isPlayer;
    }

    if (target === TARGET_TYPES.FRIENDLY) {
        return side === "allies";
    }

    if (target === TARGET_TYPES.HOSTILE) {
        return side === "enemies";
    }
};

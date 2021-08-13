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

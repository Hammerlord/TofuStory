import { Combatant, Player } from "../character/types";
import { Action, EFFECT_CLASSES, EFFECT_TYPES, Effect } from "./../ability/types";

export const getMaxHP = (combatant?: Combatant | null): number => {
    if (!combatant) {
        return 0;
    }

    const silenced = isSilenced(combatant);
    const enabledEffects = combatant.effects?.filter((effect) => {
        const disabled = silenced && effect.canBeSilenced && effect.class === EFFECT_CLASSES.BUFF; // Only buffs can be silenced
        return !disabled;
    });
    // Conditional max HP checking can cause an infinite loop
    // For now assume that there are no conditions tied to max HP effects
    return (
        combatant.maxHP +
        enabledEffects.reduce((acc, effect) => {
            const maxHP = (effect.maxHP || 0) * (effect.stacks || 1);
            return acc + maxHP;
        }, 0)
    );
};

export const isSilenced = (character: Combatant): boolean => {
    return character?.effects?.some((effect) => effect.type === EFFECT_TYPES.SILENCE);
};

export const canTargetIfStealthed = (actor: Combatant, target: Combatant, action?: Action): boolean => {
    return !isStealthed(target) || hasTruesight(actor) || action?.bypassStealth;
};

export const isStealthed = (character?: Combatant | null): boolean => {
    if (!character) {
        return false;
    }
    const silenced = isSilenced(character);
    return character.effects?.some(({ type, canBeSilenced }) => type === EFFECT_TYPES.STEALTH && (!canBeSilenced || !silenced));
};

export const isUntargetable = (character?: Combatant | null): boolean => {
    if (!character) {
        return false;
    }
    return character.effects?.some(({ untargetable }) => untargetable);
};

export const hasTruesight = (character?: Combatant): boolean => {
    if (!character) {
        return false;
    }
    const silenced = isSilenced(character);
    return character.effects?.some(({ truesight, canBeSilenced }) => truesight && (!canBeSilenced || !silenced));
};

export const isStunnedOrFrozen = (combatant: Combatant): boolean => {
    return combatant?.effects.some((effect: Effect) => [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE].includes(effect.type));
};

export const calculateMesoMultiplier = ({ player, mesos = 0 }: { player: Player; mesos?: number }): number => {
    const mesosGainedMultiplier = player.effects.reduce((acc, { mesosGained = 0 }) => {
        return acc + mesosGained;
    }, 1);

    return Math.floor(mesos * mesosGainedMultiplier);
};

import { Combatant, Player } from "../character/types";
import { Ability, AbilityEffect, Action, CombatAbility, EFFECT_CLASSES, EFFECT_TYPES, Effect } from "./../ability/types";
import { BASE_MAX_RESOURCES } from "./constants";
import { getHandAuraEffects } from "./view/Hand";
import { CombatantInfo, TRIGGER_SOURCE_TYPES } from "./types";
import { calculateActionArea } from "./actions/targeting/targeting";

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

// We're just going to assume max resource effects always take hold (does not need to pass conditions and cannot be silenced)
// There is only one example of max resource increase, and it is for the player character only:
/** @see emerald */
export const getMaxResources = (character: Combatant): number => {
    if (!character) {
        return 0;
    }
    const { maxResources: initMaxResources = BASE_MAX_RESOURCES, effects = [] } = character;
    return effects.reduce((acc, effect) => acc + (effect?.maxResources || 0), initMaxResources);
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

export const canUsePlayerAbility = (player: Player, ability: CombatAbility | undefined): boolean => {
    const isUnplayable = ability.unplayable && !ability.effects?.some((e) => e.bypassUnplayable);
    if (!player || !ability || isUnplayable || ability.effects?.some((e) => e.isLocked)) {
        return false;
    }

    const { resourceCost = 0, effects = [] } = ability;
    if (resourceCost === "x") {
        return player.resources > 0;
    }

    const resourceCostFromEffects = effects.reduce((acc, e: AbilityEffect) => {
        return acc + (e.resourceCost || 0);
    }, 0);
    return resourceCost + resourceCostFromEffects <= (player.resources || 0);
};

export const isStunnedOrFrozen = (combatant: Combatant): boolean => {
    return combatant?.effects.some((effect: Effect) => [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE].includes(effect.type));
};

export const isWithinAbilityArea = ({
    ability,
    actor,
    selectedIndex,
    targetIndex,
}: {
    ability: Ability;
    actor: CombatantInfo;
    selectedIndex: number;
    targetIndex: number;
}): boolean => {
    if (!ability) {
        return false;
    }
    if ([selectedIndex, targetIndex].some((i) => typeof i !== "number")) {
        return false;
    }
    const action = ability.actions[0];
    const area =
        calculateActionArea({ action, actor, source: { source: ability, type: TRIGGER_SOURCE_TYPES.ABILITY } }) || action?.area || 0;
    return Math.abs(selectedIndex - targetIndex) <= area;
};

export const calculateMesoMultiplier = ({ player, mesos = 0 }: { player: Player; mesos?: number }): number => {
    const mesosGainedMultiplier = player.effects.reduce((acc, { mesosGained = 0 }) => {
        return acc + mesosGained;
    }, 1);

    return Math.floor(mesos * mesosGainedMultiplier);
};

/** Returns a card with aura effects applied, if any. */
export const getCardByInstanceId = (hand: CombatAbility[], id: string | null): CombatAbility | undefined => {
    if (!id) {
        return;
    }

    const handAuraEffects = getHandAuraEffects(hand);
    // With hand aura effects applied
    const abilityIndex = hand.findIndex(({ instanceId }) => instanceId === id);
    const ability = hand[abilityIndex];
    if (!ability) {
        return;
    }
    return {
        ...ability,
        effects: [...(ability.effects || []), ...(handAuraEffects[abilityIndex] || [])],
    };
};

export const getAbilityResourceCost = ({
    combatant,
    effects = [],
    resourceCost = 0,
}: {
    combatant?: Combatant | Player;
    effects: AbilityEffect[];
    resourceCost: number | "x";
}) => {
    if (resourceCost === "x") {
        return combatant?.resources || 0;
    }
    const resourceCostFromEffects = effects.reduce((acc, e: AbilityEffect) => {
        return acc + (e.resourceCost || 0);
    }, 0);

    return Math.max(0, resourceCost + resourceCostFromEffects);
};

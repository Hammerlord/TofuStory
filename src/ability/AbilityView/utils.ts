import { Combatant, Player } from "../../character/types";

import { getUpgradeCard } from "../../Menu/utils";
import { ACTION_TYPES, Ability, AbilityEffect, Action, CombatAbility, Effect, TARGET_TYPES } from "./../types";
import { BLUE, GREEN, GREY, RED } from "./constants";

export const getAllEffects = (ability: Ability): Effect[] => {
    return ability.actions
        ?.reduce((acc, { effects = [] }) => {
            acc.push(...effects);
            return acc;
        }, [])
        .concat(ability.minion?.effects || []);
};

export const getAbilityColor = (ability: Ability): string | undefined => {
    const { actions = [], minion } = ability || {};
    const { target: targetType, type } = actions[0] || {};

    if (minion) {
        return GREEN;
    }

    if (type === ACTION_TYPES.HINDER) {
        return GREY;
    }

    if (targetType === TARGET_TYPES.HOSTILE || targetType === TARGET_TYPES.RANDOM_HOSTILE) {
        return RED;
    }

    if (targetType === TARGET_TYPES.FRIENDLY || targetType === TARGET_TYPES.SELF || targetType === TARGET_TYPES.MOVE) {
        return BLUE;
    }
};

export const isAttackAction = (action: Action): boolean => {
    return isOffensiveAction(action) && action.damage > 0;
};

export const isOffensiveAction = (action: Action): boolean => {
    return [TARGET_TYPES.HOSTILE, TARGET_TYPES.RANDOM_HOSTILE, TARGET_TYPES.HOSTILE_CHARACTER].includes(action.target);
};

export const isOffensiveAbility = (ability: Ability): boolean => {
    return (ability?.actions || []).some(isOffensiveAction);
};

export const isAttackAbility = (ability: Ability): boolean => {
    return (ability?.actions || []).some(isAttackAction);
};

export const isSupportAction = (action: Action): boolean => {
    return (
        [TARGET_TYPES.SELF, TARGET_TYPES.FRIENDLY, TARGET_TYPES.RANDOM_FRIENDLY, TARGET_TYPES.FRIENDLY_CHARACTER].includes(action.target) &&
        action.type !== ACTION_TYPES.NONE
    );
};

export const isSupportAbility = (ability: Ability): boolean => {
    return (ability?.actions || []).some(isSupportAction);
};

export const getAbilityUpgradedFromEffects = ({ combatant, ability }: { combatant: Combatant; ability: CombatAbility }) => {
    if (!ability) {
        return ability;
    }

    const totalUpgradeByLevels = ability.effects?.reduce((acc, e: AbilityEffect) => acc + (e.upgradedByLevels || 0), 0) || 0;

    let card = ability;
    Array.from({ length: totalUpgradeByLevels }).forEach(() => {
        card = {
            ...(getUpgradeCard(card, { ignoreMaxLevel: true }) || card),
        };
    });

    return card;
};

// For Astral Rewind copies: Procced abilities do not have instanceIds, only actual cards do. Do not copy procs or unique abilities.
export const getLastPlayedCards = ({ player, amount = 0 }: { player: Player; amount?: number }) => {
    if (!amount) {
        return [];
    }
    return (player?.abilityHistory || [])
        .slice()
        .reverse()
        .filter((ability: CombatAbility) => ability.instanceId && !ability.isUnique)
        .slice(0, amount);
};

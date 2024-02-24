import { getUpgradeCard } from "../../Menu/utils";
import { Combatant, Player } from "../../character/types";
import { Ability, ACTION_TYPES, CombatEffect, Effect, CombatAbility, TARGET_TYPES } from "./../types";
import { GREEN, GREY, BLUE, RED } from "./constants";

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

    if (targetType === TARGET_TYPES.FRIENDLY || targetType === TARGET_TYPES.SELF) {
        return BLUE;
    }
};

export const isOffensiveAbility = (ability: Ability): boolean => {
    return (
        ability?.actions.some((action) => action.target === TARGET_TYPES.HOSTILE || action.target === TARGET_TYPES.RANDOM_HOSTILE) || false
    );
};

export const getAbilityUpgradedFromEffects = ({ combatant, ability }: { combatant: Combatant; ability: CombatAbility }) => {
    if (!ability) {
        return ability;
    }

    let totalUpgradeByLevels =
        combatant?.effects.reduce((acc, effect: CombatEffect) => {
            return acc + (effect.upgradeCardsByLevels || 0);
        }, 0) || 0;

    totalUpgradeByLevels += ability?.effects?.upgradedByLevels || 0;

    let card = ability;
    Array.from({ length: totalUpgradeByLevels }).forEach(() => {
        card = {
            ...(getUpgradeCard(card, { ignoreMaxLevel: true }) || card),
            instanceId: card.instanceId,
        };
    });

    return card;
};

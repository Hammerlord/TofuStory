import { Combatant, Player } from "../../character/types";

import { getUpgradeCard } from "../../Menu/utils";
import {
    ACTION_TYPES,
    Ability,
    AbilityEffect,
    Action,
    Bonus,
    CombatAbility,
    Condition,
    Effect,
    TARGET_TYPES,
} from "./../types";
import { BLUE, GREEN, GREY, RED } from "./constants";

export const getAllEffects = (ability: Ability): (Effect | string)[] => {
    const actions = ability.actions || [];
    return actions
        .reduce(
            (acc, { effects = [] }) => {
                acc.push(...effects);
                return acc;
            },
            [] as (Effect | string)[],
        )
        .concat(ability.minion?.effects || []);
};

export const getAbilityColor = (ability?: Ability): string | undefined => {
    if (!ability) {
        return;
    }

    const { actions = [], minion } = ability;
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

    if (
        targetType === TARGET_TYPES.FRIENDLY ||
        targetType === TARGET_TYPES.SELF ||
        targetType === TARGET_TYPES.MOVE
    ) {
        return BLUE;
    }
};

export const isAttackAction = (action: Action): boolean => {
    return isOffensiveAction(action) && (action.damage || 0) > 0;
};

export const isOffensiveAction = (action: Action): boolean => {
    return (
        action.target !== undefined &&
        [
            TARGET_TYPES.HOSTILE,
            TARGET_TYPES.RANDOM_HOSTILE,
            TARGET_TYPES.HOSTILE_CHARACTER,
        ].includes(action.target)
    );
};

export const isOffensiveAbility = (ability: Ability): boolean => {
    return (ability?.actions || []).some(isOffensiveAction);
};

export const isAttackAbility = (ability: Ability): boolean => {
    return (ability?.actions || []).some(isAttackAction);
};

export const hasOffensiveAbility = (combatant?: Combatant | null): boolean => {
    return Boolean(combatant?.abilities?.some(isOffensiveAbility));
};

export const isSupportAction = (action: Action): boolean => {
    return (
        action.target !== undefined &&
        [
            TARGET_TYPES.SELF,
            TARGET_TYPES.FRIENDLY,
            TARGET_TYPES.RANDOM_FRIENDLY,
            TARGET_TYPES.FRIENDLY_CHARACTER,
        ].includes(action.target) &&
        action.type !== ACTION_TYPES.NONE
    );
};

export const isSupportAbility = (ability?: Ability): boolean => {
    return (ability?.actions || []).some(isSupportAction);
};

export const getAbilityUpgradedFromEffects = ({
    combatant,
    ability,
}: {
    combatant: Combatant;
    ability: CombatAbility;
}) => {
    if (!ability) {
        return ability;
    }

    const totalUpgradeByLevels =
        ability.effects?.reduce((acc, e: AbilityEffect) => acc + (e.upgradedByLevels || 0), 0) || 0;

    let card = ability;
    Array.from({ length: totalUpgradeByLevels }).forEach(() => {
        card = {
            ...(getUpgradeCard(card, { ignoreMaxLevel: true }) || card),
            effects: card.effects || [],
        };
    });

    return card;
};

// For Astral Rewind copies: Procced abilities do not have instanceIds, only actual cards do. Do not copy procs or unique abilities.
export const getLastPlayedCards = ({
    player,
    amount = 0,
}: {
    player?: Player | undefined;
    amount?: number;
}) => {
    if (!amount || !player) {
        return [];
    }
    return (player.abilityHistory || [])
        .slice()
        .reverse()
        .filter((ability): ability is CombatAbility => "instanceId" in ability && !ability.isUnique)
        .slice(0, amount);
};

/**
 * Every Condition attached to an ability's actions, including conditions on its bonuses
 * and secondary actions. Used by the `hasTag` condition check to systemically identify
 * abilities (eg. cards that consume the Charged effect).
 */
export const getAllActionConditions = (ability?: Ability | null): Condition[] => {
    const getActionBonusConditions = (action: Action): Condition[] => {
        const bonuses = Array.isArray(action.bonus)
            ? action.bonus
            : action.bonus
              ? [action.bonus]
              : [];
        return bonuses.flatMap((bonus) => bonus?.conditions || []);
    };

    return (ability?.actions || []).flatMap((action) => {
        const conditions = [...(action.conditions || []), ...getActionBonusConditions(action)];
        if (!action.secondaryAction) {
            return conditions;
        }

        return [
            ...conditions,
            ...(action.secondaryAction.conditions || []),
            ...getActionBonusConditions(action.secondaryAction),
        ];
    });
};

export const abilityHasConditionTag = (ability?: Ability | null, tag?: string): boolean => {
    if (!tag) {
        return false;
    }
    return getAllActionConditions(ability).some((condition) => condition?.tag === tag);
};

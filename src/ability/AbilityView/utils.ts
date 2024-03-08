import Handlebars from "handlebars";
import { getUpgradeCard } from "../../Menu/utils";
import { Combatant } from "../../character/types";
import { ACTION_TYPES, Ability, AbilityEffect, CombatAbility, Effect, TARGET_TYPES } from "./../types";
import { getDamageStatistics } from "./DamageIcon";
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

export const isOffensiveAbility = (ability: Ability): boolean => {
    return (
        ability?.actions.some((action) => action.target === TARGET_TYPES.HOSTILE || action.target === TARGET_TYPES.RANDOM_HOSTILE) || false
    );
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
            instanceId: card.instanceId,
        };
    });

    return card;
};

export const interpolateAbilityDescription = ({ ability }) => {
    // Some abilities apply an effect, where the "main" point of the ability is a proc from that effect, eg. Dust Devils.
    // Do a lookup to find the statistics that allow us to interpolate the description, in those cases.
    const traverseForNestedAbility = (obj: any): Ability | undefined => {
        if (Array.isArray(obj)) {
            for (const val of obj) {
                const result = traverseForNestedAbility(val);
                if (result) {
                    return result;
                }
            }
        }

        if (!obj || typeof obj !== "object") {
            return;
        }

        if (obj.ability) {
            return obj.ability;
        }

        for (const val of Object.values(obj)) {
            if (typeof val === "object") {
                const ability = traverseForNestedAbility(val);
                if (ability) {
                    return ability;
                }
            }
        }
    };

    const cardTypeString = (color) => {
        const properties = {
            width: 7,
            height: 7,
            display: "inline-block",
            margin: "2px",
            transform: "rotate(45deg)",
            background: color,
        };

        const styleStr = Object.entries(properties).reduce((acc, entry) => {
            return acc + entry.join(":") + ";";
        }, "");

        return `<span style="${styleStr}"></span>`;
    };
    const elementMapping = {
        _offense_: cardTypeString(RED),
        _support_: cardTypeString(BLUE),
    };

    const nestedAbility = traverseForNestedAbility(ability);

    return Handlebars.compile(ability.description || "")({
        ...ability,
        ...elementMapping,
        nestedAbility,
    });
};

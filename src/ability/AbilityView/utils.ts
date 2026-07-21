import Handlebars from "handlebars";
import { cloneDeep } from "lodash";
import { CombatantInfo } from "../../battle/types";
import { getMultiplier } from "../../battle/utils";
import { Combatant, Player } from "../../character/types";
import {
    BloodEmojiImage,
    CrossedSwordsImage,
    FireEmojiImage,
    HeartImage,
    HourglassImage,
    ManaImage,
    NimbleJewelCImage,
    SealImage,
    ShieldImage,
    SnowflakeEmojiImage,
    StunImage,
} from "../../images";
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

export const interpolateAbilityDescription = ({
    ability,
    playerInfo,
    deck,
    hand,
    discard,
}: {
    ability: CombatAbility;
    playerInfo: CombatantInfo;
    deck;
    hand;
    discard;
}) => {
    ability = cloneDeep(ability);
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

    // If displaying a percentage, show "25%" instead of "0.25x" for values 0 < n < 1.
    // !!! This action is destructive! Must clone deep beforehand !!!
    const traverseForNestedPercentages = (obj) => {
        if (!obj) {
            return;
        }

        for (const [key, val] of Object.entries(obj)) {
            if (typeof val === "object") {
                traverseForNestedPercentages(val);
            } else if (typeof val === "number") {
                if (val > 0 && val < 1) {
                    obj[key] = Math.floor(val * 100) + "%";
                }
            } else if (Array.isArray(obj)) {
                for (const val of obj) {
                    traverseForNestedPercentages(val);
                }
            }
        }

        return obj;
    };

    const styleObjectToString = (object) => {
        return Object.entries(object).reduce((acc, entry) => {
            return acc + entry.join(":") + ";";
        }, "");
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

        const styleStr = styleObjectToString(properties);
        return `<span style="${styleStr}"></span>`;
    };

    const iconStyles = {
        width: 16,
        height: 16,
        "vertical-align": "bottom",
    };

    const iconStyleStr = styleObjectToString(iconStyles);

    const styleStrWithShadow = styleObjectToString({
        ...iconStyles,
        filter: "drop-shadow(0 0 1px black)",
    });

    const manaStyleStr = styleObjectToString({ ...iconStyles, width: 12 });

    const multiplierAction = ability.actions?.find((action) => action.multiplier);
    const multiplier = multiplierAction
        ? getMultiplier({ actor: playerInfo, multiplier: multiplierAction.multiplier, deck, hand, discard })
        : 0;

    const elementMapping = {
        _offense_: cardTypeString(RED),
        _support_: cardTypeString(BLUE),
        _summon_: cardTypeString(GREEN),
        _damage_: `<img src="${CrossedSwordsImage}" alt="Damage" style="${styleStrWithShadow}"/>`,
        _healing_: `<img src="${HeartImage}" alt="HP" style="${iconStyleStr}"/>`,
        _armor_: `<img src="${ShieldImage}" alt="Armor" style="${styleStrWithShadow}"/>`,
        _duration_: `<img src="${HourglassImage}" alt="Turns" style="${styleStrWithShadow}"/>`,
        _burn_: `<img src="${FireEmojiImage}" alt="Burn" style="${styleStrWithShadow}"/>`,
        _chill_: `<img src="${SnowflakeEmojiImage}" alt="Chill" style="${styleStrWithShadow}"/>`,
        _mana_: `<img src="${ManaImage}" alt="Mana" style="${manaStyleStr}"/>`,
        _bleed_: `<img src="${BloodEmojiImage}" alt="Bleed" style="${styleStrWithShadow}"/>`,
        _stun_: `<img src="${StunImage}" alt="Stun" style="${styleStrWithShadow}"/>`,
        _silence_: `<img src="${SealImage}" alt="Stun" style="${styleStrWithShadow}"/>`,
        _freeze_: `<img src="${NimbleJewelCImage}" alt="Stun" style="${styleStrWithShadow}"/>`,
        _multiplier_: multiplier,
    };

    const nestedAbility = cloneDeep(traverseForNestedAbility(ability));

    return Handlebars.compile(ability.description || "")({
        ...traverseForNestedPercentages(ability),
        ...elementMapping,
        nestedAbility: traverseForNestedPercentages(nestedAbility),
    });
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

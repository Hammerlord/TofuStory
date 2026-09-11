import { cloneDeep } from "lodash";
import { JOB_CARD_MAP } from "../ability";
import { DEFAULT_CARD_MAX_LEVEL } from "../ability/AbilityView/constants";
import { createCombatAbility } from "../ability/createCombatAbility";
import { directDamageTakenTrigger } from "../ability/Effects";
import { NEUTRAL_ABILITIES } from "../ability/neutralAbilities";
import { Ability, CombatAbility, CombatEffect, Effect } from "../ability/types";
import { BATTLE_TYPES } from "../battle/types";
import { createCombatEffect } from "../character/effects/createCombatEffect";
import { Player } from "../character/types";
import { Item } from "../item/types";
import { getRandomItem } from "../utils";
import { AbilityUpgrade } from "./../ability/types";

export const aggregateItemEffects = (items: Item[]): CombatEffect[] => {
    const effects: CombatEffect[] = [createCombatEffect(directDamageTakenTrigger)]; // Player always has this effect for calculating whether damage was recently taken
    items.forEach((item) => {
        const itemEffects: CombatEffect[] =
            item?.effects?.map((e: Effect) => ({ ...createCombatEffect(e), itemSource: item.name, stacks: item?.stacks || 1 })) || [];
        effects.push(...itemEffects);
    });
    return effects;
};

export const aggregateAbilityEffects = (abilities: CombatAbility[]): CombatEffect[] => {
    const effects: CombatEffect[] = [];
    abilities.forEach((a: CombatAbility) => {
        const abilityEffects =
            a.effectsWhileOwned?.map((e) => ({
                ...createCombatEffect(e),
                originalAbilityId: a.instanceId,
                isEffectFromHoldingAbility: true, // Flag to recalculate if a card event occurs
            })) || [];
        effects.push(...abilityEffects);
    });
    return effects;
};

export const getUpgradeCard = (card: CombatAbility | Ability, options: { ignoreMaxLevel?: boolean; maxLevel?: number } = {}) => {
    const { ignoreMaxLevel = false, maxLevel = DEFAULT_CARD_MAX_LEVEL } = options;
    if (!card.upgrades?.length || (card.level && card.level >= maxLevel && !ignoreMaxLevel)) {
        return;
    }

    let newCard = cloneDeep(card);

    const traverseAndApplyUpgradeStats = (upgradeObj: AbilityUpgrade | any, equivalentObj: any) => {
        if (!upgradeObj || !equivalentObj) {
            return;
        }

        const cannotBeBelowZeroProperties = ["damage", "healing", "armor"];
        const { addCardOptions, selectCardOptions, addCardsToDeckOptions, addActions, ...other } = upgradeObj;

        Object.entries(other).forEach(([key, val]) => {
            if (typeof equivalentObj[key] === "undefined") {
                equivalentObj[key] = val;
                return;
            }

            if (typeof val === "number") {
                equivalentObj[key] = (equivalentObj[key] || 0) + val;
                if (cannotBeBelowZeroProperties.includes(key)) {
                    equivalentObj[key] = Math.max(0, equivalentObj[key]);
                }
                return;
            }

            if (Array.isArray(val)) {
                val.forEach((v, i) => {
                    if (!equivalentObj[key][i]) {
                        equivalentObj[key][i] = v;
                    } else {
                        traverseAndApplyUpgradeStats(v, equivalentObj[key][i]);
                    }
                });
                return;
            }

            if (typeof val === "object") {
                traverseAndApplyUpgradeStats(val, equivalentObj[key]);
                return;
            }

            equivalentObj[key] = val;
        });

        if (addCardOptions && equivalentObj.addCards) {
            const { appendCards = 0, upgradeLevels = 0 } = addCardOptions;
            const cards = equivalentObj.addCards.slice(0, appendCards).map(cloneDeep);
            equivalentObj.addCards = [...equivalentObj.addCards, ...cards].map((card) => {
                for (let i = 0; i < upgradeLevels; ++i) {
                    card = getUpgradeCard(card, { ignoreMaxLevel: true }) || card;
                }

                return card;
            });
        }

        if (addCardsToDeckOptions && equivalentObj.addCardsToDeck) {
            const { appendCards = 0, upgradeLevels = 0 } = addCardsToDeckOptions;
            const cards = equivalentObj.addCardsToDeck.slice(0, appendCards).map(cloneDeep);
            equivalentObj.addCardsToDeck = [...equivalentObj.addCardsToDeck, ...cards].map((card) => {
                for (let i = 0; i < upgradeLevels; ++i) {
                    card = getUpgradeCard(card, { ignoreMaxLevel: true }) || card;
                }

                return card;
            });
        }

        if (selectCardOptions && equivalentObj.selectCards?.cards) {
            const { appendCards = 0, upgradeLevels = 0 } = selectCardOptions;
            const cards = equivalentObj.selectCards.cards.slice(0, appendCards).map(cloneDeep);
            equivalentObj.selectCards.cards = [...equivalentObj.selectCards.cards, ...cards].map((card) => {
                for (let i = 0; i < upgradeLevels; ++i) {
                    card = getUpgradeCard(card, { ignoreMaxLevel: true }) || card;
                }

                return card;
            });
        }

        if (addActions && Array.isArray(equivalentObj.actions)) {
            const { actions = [], prepend = false } = addActions;
            if (prepend) {
                equivalentObj.actions.unshift(...actions.map(cloneDeep));
            } else {
                equivalentObj.actions.push(...actions.map(cloneDeep));
            }
        }
    };

    traverseAndApplyUpgradeStats(card.upgrades[0], newCard);

    // The top level resourceCost cannot be below zero, but nested resourceCosts (eg. resource cost reductions can).
    // So only apply the floor on the top level.
    newCard = {
        ...newCard,
        resourceCost: typeof newCard.resourceCost === "number" ? Math.max(0, newCard.resourceCost) : newCard.resourceCost,
    };

    const isFunctionallySameCard = JSON.stringify(newCard) === JSON.stringify(card);
    if (isFunctionallySameCard) {
        // It is misleading to show a card as "leveled up" if it doesn't actually have any property increases since the last level.
        // Eg. some cards lose their 'Deplete' tag and that's it, there are no further upgrades beyond that.
        // In the future there may be extra upgrades beyond level 2.
        return;
    }

    return createCombatAbility({
        ...newCard,
        level: (card.level || 1) + 1,
    });
};

export const getCardPool = (player: Player, deck: CombatAbility[]) => {
    const { starters, all } = JOB_CARD_MAP[player.class];

    const disabledCards = new Set(player.items.flatMap((item) => item.disableCardsFromBeingFound ?? []));

    const ownedUniqueCards = new Set(deck.filter((card) => card.isUnique).map((card) => card.name));

    return [
        ...all.map((card) => {
            if (starters.some(({ name }) => name === card.name)) {
                return getUpgradeCard(card) || card;
            }
            return card;
        }),
    ]
        .concat(NEUTRAL_ABILITIES)
        .filter((ability) => !ownedUniqueCards.has(ability.name) && !disabledCards.has(ability.name));
};

export const getCardChoicesFromItems = ({
    deck,
    player,
    battleType,
}: {
    deck: CombatAbility[];
    player: Player;
    battleType?: BATTLE_TYPES;
}): { choices: Ability[]; numChoices: number } => {
    const ownedUniqueCards = new Set(deck.filter((card) => card.isUnique).map((card) => card.name));

    const { choices, numChoices } = player.items.reduce(
        (acc, item: Item) => {
            const { amount = 0, battleTypes: battleTypeFilters, abilities: initAbilities = [] } = item.abilityChoices || {};
            if (battleTypeFilters && battleType && !battleTypeFilters.includes(battleType)) {
                return acc;
            }

            const { choices, numChoices } = acc;
            const abilities = initAbilities.filter((ability) => !ownedUniqueCards.has(ability.name));
            if (abilities.length) {
                choices.push(getRandomItem(abilities));
            }

            return {
                choices,
                numChoices: numChoices + amount,
            };
        },
        { choices: [], numChoices: 0 } as { choices: Ability[]; numChoices: number }
    );

    return { choices, numChoices };
};

export const filterUnobtainableItems = ({
    playerItems,
    excludeItems,
    itemsToFilter,
}: {
    playerItems: Item[];
    excludeItems?: Item[];
    itemsToFilter: Item[];
}) => {
    const filterOut = new Set(playerItems.flatMap((item) => [item.name, ...(item.exclusive ?? [])]));

    excludeItems?.forEach((item) => filterOut.add(item.name));

    return itemsToFilter.filter((item) => !filterOut.has(item.name));
};

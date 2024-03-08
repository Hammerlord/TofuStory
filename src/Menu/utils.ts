import { cloneDeep } from "lodash";
import uuid from "uuid";
import { CARD_MAX_LEVEL } from "../ability/AbilityView/constants";
import { Ability, CombatAbility, Effect } from "../ability/types";
import { Item } from "../item/types";
import { AbilityUpgrade } from "./../ability/types";

const copyEffect = (e: Effect) => ({
    ...cloneDeep(e),
    id: uuid.v4(),
    uptime: 1,
});

export const aggregateItemEffects = (items: Item[]): Effect[] => {
    const effects = [];
    items.forEach((item) => {
        const itemEffects: Effect[] = item?.effects?.map((e: Effect) => ({ ...copyEffect(e), itemSource: item.name })) || [];
        effects.push(...itemEffects);
    });
    return effects;
};

export const aggregateAbilityEffects = (abilities: Ability[]): Effect[] => {
    const effects = [];
    abilities.forEach((a: Ability) => {
        const abilityEffects =
            a.effectsWhileOwned?.map((e) => ({
                ...copyEffect(e),
                isEffectFromHoldingAbility: true, // Flag to recalculate if a card event occurs
            })) || [];
        effects.push(...abilityEffects);
    });
    return effects;
};

export const getUpgradeCard = (card: CombatAbility, options?: { ignoreMaxLevel?: boolean; retainId?: boolean }) => {
    if (!card.upgrades?.length || (card.level && card.level === card.maxLevel && !options?.ignoreMaxLevel)) {
        return;
    }

    const newCard = cloneDeep(card);

    const traverseAndApplyUpgradeStats = (upgradeObj: AbilityUpgrade | any, equivalentObj: any) => {
        if (!upgradeObj || !equivalentObj) {
            return;
        }

        const cannotBeBelowZeroProperties = ["damage", "healing", "resourceCost", "armor"];
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
                    traverseAndApplyUpgradeStats(v, equivalentObj[key][i]);
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

    const isFunctionallySameCard = JSON.stringify(newCard) === JSON.stringify(card);
    if (isFunctionallySameCard) {
        // It is misleading to show a card as "leveled up" if it doesn't actually have any property increases since the last level.
        // Eg. some cards lose their 'Deplete' tag and that's it, there are no further upgrades beyond that.
        // In the future there may be extra upgrades beyond level 2.
        return;
    }

    return {
        ...newCard,
        level: (card.level || 1) + 1,
        maxLevel: card.maxLevel || CARD_MAX_LEVEL,
        // Why not always retain ID if there is one?
        instanceId: (options?.retainId && card.instanceId) || uuid.v4(),
    };
};

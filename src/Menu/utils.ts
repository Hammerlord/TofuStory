import { cloneDeep } from "lodash";
import uuid from "uuid";
import { CARD_MAX_LEVEL } from "../ability/AbilityView/constants";
import { Ability, Effect } from "../ability/types";
import { Item } from "../item/types";
import { AbilityUpgrade } from "./../ability/types";

const copyEffect = (e: Effect) => ({
    ...cloneDeep(e),
    id: uuid.v4(),
    uptime: 0,
});

export const aggregateItemEffects = (items: Item[]): Effect[] => {
    const effects = [];
    items.forEach((item) => {
        const itemEffects = item?.effects?.map(copyEffect) || [];
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

export const getUpgradeCard = (card: Ability, options?: { ignoreMaxLevel?: boolean }) => {
    if (!card.upgrades || (card.level && card.level === card.maxLevel && !options?.ignoreMaxLevel)) {
        return;
    }

    const newCard = {
        ...cloneDeep(card),
        level: (card.level || 1) + 1,
        maxLevel: card.maxLevel || CARD_MAX_LEVEL,
        instanceId: uuid.v4(),
    };

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
            const { appendCards = 0, isUpgraded = false } = addCardOptions;
            const cards = equivalentObj.addCards.slice(0, appendCards).map(cloneDeep);
            equivalentObj.addCards = [...equivalentObj.addCards, ...cards].map((card) => {
                return (isUpgraded && getUpgradeCard(card)) || card;
            });
        }

        if (addCardsToDeckOptions && equivalentObj.addCardsToDeck) {
            const { appendCards = 0, isUpgraded = false } = addCardsToDeckOptions;
            const cards = equivalentObj.addCardsToDeck.slice(0, appendCards).map(cloneDeep);
            equivalentObj.addCardsToDeck = [...equivalentObj.addCardsToDeck, ...cards].map((card) => {
                return (isUpgraded && getUpgradeCard(card)) || card;
            });
        }

        if (selectCardOptions && equivalentObj.selectCards?.cards) {
            const { appendCards = 0, isUpgraded = false } = selectCardOptions;
            const cards = equivalentObj.selectCards.slice(0, appendCards).map(cloneDeep);
            equivalentObj.selectCards.cards = [...equivalentObj.selectCards.cards, ...cards].map((card) => {
                return (isUpgraded && getUpgradeCard(card)) || card;
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

    return newCard;
};

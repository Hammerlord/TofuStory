import uuid from "uuid";
import { cloneDeep } from "lodash";
import { Ability, Effect } from "../ability/types";
import { Item } from "../item/types";
import { CARD_MAX_LEVEL } from "../ability/AbilityView/constants";

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

export const getUpgradeCard = (card: Ability) => {
    if (!card.upgrades || card.level === card.maxLevel) {
        return;
    }

    const newCard = {
        ...cloneDeep(card),
        level: (card.level || 1) + 1,
        maxLevel: card.maxLevel || CARD_MAX_LEVEL,
        instanceId: uuid.v4(),
    };

    const traverseAndApplyUpgradeStats = (upgradeObj: any, equivalentObj: any) => {
        if (!upgradeObj || !equivalentObj) {
            return;
        }

        Object.entries(upgradeObj).forEach(([key, val]) => {
            if (typeof equivalentObj[key] === "undefined") {
                equivalentObj[key] = val;
                return;
            }

            if (typeof val === "number") {
                equivalentObj[key] = (equivalentObj[key] || 0) + val;
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
    };

    traverseAndApplyUpgradeStats(card.upgrades[0], newCard);

    return newCard;
};

// For filling in the minion card descriptions in the minion preview tooltip because

import { fireSpirit } from "../ability/magician/magicianAbilities";
import { Ability, Action, ActionSummon } from "../ability/types";
import { soulBlade } from "../ability/warrior/warriorAbilities";

// usually this is part of the minion's parent card, not a part of the minion object itself.
const minionCardLookup = {
    [soulBlade.name]: soulBlade,
    [fireSpirit.name]: fireSpirit,
};

// Traverses `obj` to find add cards to your hand/deck/etc. properties and displays those cards.
export const getCardsTooltipConfig = (obj: Ability | Action | any): { [name: string]: Ability } => {
    const cardsToAddMap = {};

    const findCardsToAdd = (obj: Ability | Action | any) => {
        if (Array.isArray(obj)) {
            obj.forEach(findCardsToAdd);
        } else if (typeof obj === "object") {
            const { addCards = [], addCardsToDiscard = [], addCardsToDeck = [], selectCards = {}, summon, ...other } = obj;
            const cardsToDisplay = [...addCards, ...addCardsToDiscard, ...addCardsToDeck, ...(selectCards.cards || [])].filter(
                (obj) => obj?.name // Sometimes the addCards object is being grabbed from upgrade properties and isn't a real card
            );

            if (summon) {
                const summonCards = summon.reduce((acc, config: ActionSummon) => {
                    const { minion: baseMinions = [] } = config;
                    baseMinions.forEach((minion) => {
                        const card = minionCardLookup[typeof minion === "string" ? minion : minion.name];
                        if (card) {
                            acc.push(card);
                        } else if (typeof minion === "object") {
                            // Display a "common card" version of the minion which is likely not as comprehensive as the card lookup
                            // But it's something.
                            acc.push({ name: minion.name, description: minion.description, minion, actions: [], overrideBodyText: true });
                        }
                    });

                    return acc;
                }, []);
                cardsToDisplay.push(...summonCards);
            }
            cardsToDisplay.forEach((card) => {
                const key = card.name + JSON.stringify(card.image);
                if (!cardsToAddMap[key]) {
                    cardsToAddMap[key] = card; // We only want to display it once
                    findCardsToAdd(card);
                }
            });

            // minion: undefined, do NOT look up minion abilities and treat them as 'cards'.
            Object.values({ ...other, minion: undefined }).forEach((child) => {
                findCardsToAdd(child);
            });
        }
    };

    findCardsToAdd(obj);
    return cardsToAddMap;
};

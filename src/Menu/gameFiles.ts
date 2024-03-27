import uuid from "uuid";
import { JOB_CARD_MAP } from "../ability";
import { getUpgradeCard } from "./utils";
import { CLASS_ITEMS } from "../Map/routes/eventList";
import { ITEM_MASTERLIST } from "../devtools/DevItemViewer";
import { chargingStone, greaterChargingStone, rageStone, rampageStone } from "../item/starterItems";
import { cakeItem, halfEatenHotdog, unagiItem } from "../item/consumables";
import { NEUTRAL_ABILITIES } from "../ability/neutralAbilities";

export const saveGame = (characterObject) => {
    const { deck, player } = characterObject;
    // Due to card effects sometimes using SVGs (functions, which cannot be stringified), flatten the objects to just their name/level here and do a lookup on retrieval.
    const flattenDeck = deck.map((card) => ({ name: card.name, level: card.level }));
    const flattenItems = player.items.map((item) => ({ name: item.name, stacks: item.stacks }));
    localStorage.setItem("saveFile", JSON.stringify({ ...characterObject, deck: flattenDeck, player: { ...player, items: flattenItems } }));
};

export const getGameFile = () => {
    const saveFileString = localStorage.getItem("saveFile");
    if (saveFileString) {
        try {
            const fileObj = JSON.parse(saveFileString);
            const { deck = [], player = {} } = fileObj;
            const cards = [...JOB_CARD_MAP[player.class].all, ...NEUTRAL_ABILITIES];
            const hydratedDeck = deck
                .map((flatCard) => {
                    const { name, level = 1 } = flatCard;
                    const hydrated = cards.find((card) => card.name === name);
                    if (hydrated) {
                        let upgradedCard = hydrated;
                        while ((upgradedCard.level || 1) < level) {
                            const newUpgradedCard = getUpgradeCard(upgradedCard);
                            if (newUpgradedCard) {
                                upgradedCard = newUpgradedCard;
                            } else {
                                break;
                            }
                        }
                        return { ...upgradedCard, instanceId: uuid.v4() };
                    }
                })
                .filter((v) => v);

            const starters = [rageStone, rampageStone, chargingStone, greaterChargingStone];
            const consumables = [halfEatenHotdog, unagiItem, cakeItem];
            const itemLookup = [...ITEM_MASTERLIST, ...CLASS_ITEMS[player.class], ...starters, ...consumables];
            const items = player.items.map((item) => {
                const found = itemLookup.find((otherItem) => otherItem.name === item.name);
                if (found) {
                    return {
                        ...found,
                        stacks: item.stacks || undefined,
                    };
                }

                return item;
            });

            return { ...fileObj, deck: hydratedDeck, player: { ...player, items } };
        } catch (e) {
            console.error(e);
            // Just return nothing if something failed. It will be treated as a new run.
        }
    }
};

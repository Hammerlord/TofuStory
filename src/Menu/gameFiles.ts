import uuid from "uuid";
import { JOB_CARD_MAP } from "../ability";
import { getUpgradeCard } from "./utils";

export const saveGame = (characterObject) => {
    const { deck } = characterObject;
    // Due to card effects sometimes using SVGs (functions, which cannot be stringified), flatten the objects to just their name/level here and do a lookup on retrieval.
    const flattenDeck = deck.map((card) => ({ name: card.name, level: card.level }));
    localStorage.setItem("saveFile", JSON.stringify({ ...characterObject, deck: flattenDeck }));
};

export const getGameFile = () => {
    const saveFileString = localStorage.getItem("saveFile");
    if (saveFileString) {
        try {
            const fileObj = JSON.parse(saveFileString);
            const { deck = [], player = {} } = fileObj;
            const hydratedDeck = deck.map((flatCard) => {
                const { name, level = 1 } = flatCard;
                const hydrated = JOB_CARD_MAP[player.class].all.find((card) => card.name === name);
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
            });

            return { ...fileObj, deck: hydratedDeck };
        } catch (e) {
            console.error(e);
            // Just return nothing if something failed. It will be treated as a new run.
        }
    }
};

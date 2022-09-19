import {
    luckSack,
    panlid,
    coffeePot,
    drakeBlood,
    nependeathSap,
    respawnToken,
    safetyCharm,
    stolenFence,
    sunshinePan,
    blackScroll,
    energyStone,
    guideBook,
    alligatorTube,
    cactus,
} from "./../../item/items";
import { goldRichieMerchant } from "../../scene/GoldRichie";
import { noob } from "../../scene/Noob";

export const events = [goldRichieMerchant, noob];
export const ALL_ITEMS = [
    safetyCharm,
    drakeBlood,
    nependeathSap,
    coffeePot,
    respawnToken,
    sunshinePan,
    stolenFence,
    panlid,
    luckSack,
    energyStone,
    guideBook,
    alligatorTube,
    cactus,
];

export const treasure = [
    ...ALL_ITEMS.map((item) => ({
        items: [item, blackScroll],
        mesos: { min: 10, max: 20 },
    })),
    {
        mesos: { min: 85, max: 100 },
    },
];

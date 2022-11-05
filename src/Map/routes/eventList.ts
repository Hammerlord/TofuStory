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
    engravedStone,
    guideBook,
    alligatorTube,
    cactus,
    pieceOfIce,
    aquamarine,
} from "./../../item/items";
import { goldRichieMerchant } from "../../scene/GoldRichie/GoldRichie";
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
    engravedStone,
    guideBook,
    alligatorTube,
    cactus,
    pieceOfIce,
    aquamarine,
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

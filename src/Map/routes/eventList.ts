import { coffeePot, drakeBlood, nependeathSap, respawnToken, safetyCharm, stolenFence, sunshinePan } from "../../item/items";
import { goldRichieMerchant } from "../../scene/GoldRichie";
import { noob } from "../../scene/Noob";

export const events = [goldRichieMerchant, noob];

export const treasure = [
    ...[safetyCharm, drakeBlood, nependeathSap, coffeePot, respawnToken, sunshinePan, stolenFence].map((item) => ({
        items: [item],
        mesos: { min: 10, max: 20 },
    })),
    {
        mesos: { min: 85, max: 100 },
    },
];

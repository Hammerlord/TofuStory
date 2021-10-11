import { stolenFence } from "../../item/items";
import { goldRichieMerchant } from "../../scene/GoldRichie";
import { noob } from "../../scene/Noob";

export const events = [goldRichieMerchant, noob];

export const treasure = [
    {
        items: [stolenFence],
        mesos: { min: 10, max: 20 },
    },
    {
        mesos: { min: 85, max: 100 },
    },
];

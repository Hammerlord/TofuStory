import { stolenFence } from "../../item/items";
import { goldRichieMerchant } from "../../scene/GoldRichie";

export const events = [goldRichieMerchant];

export const treasure = [
    {
        items: [stolenFence],
        mesos: { min: 10, max: 20 },
    },
    {
        mesos: { min: 85, max: 100 },
    },
];

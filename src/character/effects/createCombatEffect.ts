import { cloneDeep } from "lodash";
import * as uuid from "uuid";
import { CombatEffect, Effect } from "../../ability/types";
import { effectNameMap } from "../../enemy/effect";

export const createCombatEffect = (e: Effect | CombatEffect): CombatEffect => {
    return {
        id: uuid.v4(),
        uptime: 1,
        stacks: 1,
        maxStacks: Infinity,
        maxDuration: Infinity,
        maxApplications: Infinity,
        originalDuration: e.duration || Infinity,
        turnsTriggerFrequency: 0,
        duration: Infinity,
        ...cloneDeep(e),
    };
};

export const lookupEffect = (effect: String | Effect) => {
    if (typeof effect === "string") {
        return {
            ...effectNameMap[effect],
        };
    }

    return effect as Effect | CombatEffect;
};

import * as uuid from "uuid";
import { Ability, ACTION_TYPES, CombatAbility } from "../../ability/types";
import { Event, EventGroup } from "../types";
import { UpdatedCombatantStats } from "./getUpdatedStats";

const isGroupableEvent = (event: Event, previousEvent: Event) => {
    if (!previousEvent) {
        return false;
    }

    const { damage, armor, healing, type, summon } = event.action || {};
    const { actionParent, source } = event || {};
    /**
     * Generally what we want to group in a single event playback are:
     * 1. pure stat changes (such as status effect applications) with no actions attached
     * 2. Zzz, 3. the Perion Dummies "Reinforce!" ability
     * Do these rules satisfy the above?...
     */
    const sameAbility =
        (actionParent as CombatAbility)?.name === (previousEvent.actionParent as CombatAbility)?.name &&
        (source?.source as CombatAbility)?.name === (previousEvent.source?.source as CombatAbility)?.name;

    return (!type || type === ACTION_TYPES.EFFECT || type === ACTION_TYPES.NONE) && sameAbility && !damage && !armor && !healing && !summon;
};

export const aggregateStatUpdates = (
    base?: { [combatantId: string]: UpdatedCombatantStats },
    other?: { [combatantId: string]: UpdatedCombatantStats }
) => {
    base = base || {};
    if (!other) {
        return base;
    }

    Object.entries(other).forEach(([combatantId, stats]) => {
        if (!base[combatantId]) {
            base[combatantId] = stats;
            return;
        }

        Object.entries(stats).forEach(([key, value]) => {
            if (typeof value === "string") {
                return;
            }

            const originalValue = base[combatantId][key];

            if (Array.isArray(value)) {
                base[combatantId][key] = [...(originalValue || []), ...value];
                return;
            }

            if (typeof value === "number") {
                base[combatantId][key] = (originalValue || 0) + value;
                return;
            }

            if (value !== undefined) {
                base[combatantId][key] = value;
            }
        });
    });

    return base;
};

export const playbackCollector = (): PlaybackCollector => {
    const queue: EventGroup[] = [];

    const addToGroup = (event: Event, group: EventGroup) => {
        group.events.push(event);

        const eventPlayback = typeof event.playbackTime === "number" ? event.playbackTime : event.action?.playbackTime;
        group.playbackTime = group.playbackTime || eventPlayback;
        group.addCards = [...group.addCards, ...(event.addCards || [])];
        group.newCombatants = [...group.newCombatants, ...(event.newCombatants || [])];
        group.displacements = { ...group.displacements, ...event.displacements };
        group.statUpdates = aggregateStatUpdates(group.statUpdates, event.statUpdates);
    };

    return {
        collect: (event: Event, alwaysGroup: boolean = false) => {
            if (queue.length) {
                const prevGroup = queue.at(-1);
                const prevEvent = prevGroup.events?.at(-1);
                if (isGroupableEvent(event, prevEvent) || (prevEvent && alwaysGroup)) {
                    addToGroup(event, prevGroup);
                    return;
                }
            }

            const eventPlayback = typeof event.playbackTime === "number" ? event.playbackTime : event.action?.playbackTime;

            queue.push({
                ...event,
                id: uuid.v4(),
                name: (event.actionParent as Ability)?.name,
                image: (event.actionParent as Ability)?.image,
                playbackTime: eventPlayback,
                addCards: event.addCards || [],
                newCombatants: event.newCombatants || [],
                events: [event],
            });
        },
        get: () => {
            return queue;
        },
    };
};

export interface PlaybackCollector {
    collect: (event: Event, alwaysGroup?: boolean) => void;
    get: () => EventGroup[];
}

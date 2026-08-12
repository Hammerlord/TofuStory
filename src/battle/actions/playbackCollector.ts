import * as uuid from "uuid";
import { Ability, ACTION_TYPES } from "../../ability/types";
import { Event, EventGroup } from "../types";

const isGroupableEvent = (event: Event, previousEvent: Event) => {
    if (!previousEvent) {
        return false;
    }
    if (!event.action) {
        return true;
    }

    const type = event.action.type;
    const sameAbility = event.actionParent?.name === previousEvent.actionParent?.name;
    return (type === ACTION_TYPES.EFFECT || type === ACTION_TYPES.NONE) && sameAbility;
};

export const playbackCollector = (): PlaybackCollector => {
    const queue: EventGroup[] = [];

    const addToGroup = (event: Event, group: EventGroup) => {
        group.events.push(event);
        group.playerSide = event.playerSide;
        group.enemySide = event.enemySide;

        let eventPlayback = event.playbackTime || event.action?.playbackTime;
        group.playbackTime = group.playbackTime || eventPlayback;
        group.addCards = [...group.addCards, ...(event.addCards || [])];
        group.newCombatants = [...group.newCombatants, ...(event.newCombatants || [])];
        group.displacements = { ...group.displacements, ...event.displacements };

        group.statUpdates = {
            ...group.statUpdates,
        };

        Object.entries(event.statUpdates || {}).forEach(([combatantId, stats]) => {
            if (!group.statUpdates[combatantId]) {
                group.statUpdates[combatantId] = stats;
                return;
            }

            Object.entries(stats).forEach(([key, value]) => {
                if (typeof value === "string") {
                    return;
                }

                const originalValue = group.statUpdates[combatantId][key];

                if (Array.isArray(value)) {
                    group.statUpdates[combatantId][key] = [...(originalValue || []), ...value];
                    return;
                }

                if (typeof value === "number") {
                    group.statUpdates[combatantId][key] = (originalValue || 0) + value;
                }
            });
        });
    };

    return {
        collect: (event: Event) => {
            if (queue.length) {
                const prevGroup = queue.at(-1);
                const prevEvent = prevGroup.events?.at(-1);
                if (isGroupableEvent(event, prevEvent)) {
                    addToGroup(event, prevGroup);
                    return;
                }
            }

            queue.push({
                ...event,
                id: uuid.v4(),
                name: event.actionParent?.name,
                image: (event.actionParent as Ability)?.image,
                playbackTime: event.playbackTime || event.action?.playbackTime,
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
    collect: (event: Event) => void;
    get: () => EventGroup[];
}

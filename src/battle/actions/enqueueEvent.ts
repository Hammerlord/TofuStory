import * as uuid from "uuid";
import { ACTION_TYPES, Ability, Action, CardPileType, CombatAbility } from "../../ability/types";
import { Combatant } from "../../character/types";
import {
    MULTI_ACTION_PLAYBACK_SPEED,
    NORMAL_ACTION_PLAYBACK_SPEED,
    RANGED_ACTION_PLAYBACK_SPEED,
    RICOCHET_ACTION_PLAYBACK_SPEED,
} from "../constants";
import { BattleState, battleStateSlice } from "../reducer";
import { ActionParent, BATTLEFIELD_SIDES, Displacement, Event } from "../types";
import { ActionContext } from "./../types";
import { UpdatedCombatantStats } from "./getUpdatedStats";
import { PlaybackCollector } from "./playbackCollector";

const { pushEventQueue } = battleStateSlice?.actions || {};

/**
 * A middleware that pushes to event queue while handling playbackCollector
 */
export const enqueueEvent = ({
    action,
    actorId,
    selectedIndex,
    allTargetIndices,
    actionParent,
    targetSide,
    playbackTime,
    newCombatants,
    context,
    newCards,
    cardsAddedTo,
    displacements,
    statUpdates,
    options,
}: {
    action?: Action;
    actorId?: string;
    selectedIndex?: number;
    allTargetIndices?: number[];
    actionParent?: ActionParent;
    targetSide?: BATTLEFIELD_SIDES;
    playbackTime?: number; // MS
    context?: ActionContext;
    newCombatants?: Combatant[];
    displacements?: Displacement;
    newCards?: CombatAbility[];
    cardsAddedTo?: CardPileType;
    statUpdates?: { [combatantId: string]: UpdatedCombatantStats };
    options?: { alwaysGroup: boolean };
}) => {
    return (dispatch, getState) => {
        playbackTime = action?.playbackTime || playbackTime || 0;
        if (!playbackTime && action) {
            if (action.animationOptions?.ricochet) {
                const playbackMultiple = allTargetIndices.length > 1 ? (RICOCHET_ACTION_PLAYBACK_SPEED / 3) * allTargetIndices.length : 0;
                playbackTime = RICOCHET_ACTION_PLAYBACK_SPEED + playbackMultiple;
            } else if ((actionParent as Ability)?.actions?.length > 1) {
                playbackTime = MULTI_ACTION_PLAYBACK_SPEED;
            } else if (action.type === ACTION_TYPES.RANGE_ATTACK) {
                playbackTime = RANGED_ACTION_PLAYBACK_SPEED;
            } else {
                playbackTime = NORMAL_ACTION_PLAYBACK_SPEED;
            }
        }

        const collector: PlaybackCollector | undefined = context?.playbackCollector;
        const addCards =
            newCards?.length > 0
                ? [
                      {
                          cards: newCards,
                          cardsAddedTo,
                      },
                  ]
                : [];

        const battle: BattleState = getState().battle;
        const event: Event = {
            playerSide: battle.playerSide,
            enemySide: battle.enemySide,
            action,
            actorId,
            id: uuid.v4(),
            selectedIndex,
            // HACK: ensure that the selected index and "extra target indices" are hit first in playback
            allTargetIndices,
            targetSide: targetSide,
            actionParent,
            source: context?.sourceChain?.at(-1),
            playbackTime,
            newCombatants: newCombatants || [],
            displacements,
            statUpdates,
            addCards,
        };

        const isEmptyEvent =
            !action &&
            !actorId &&
            !allTargetIndices?.length &&
            !actionParent &&
            !targetSide &&
            !newCombatants &&
            !displacements &&
            !addCards?.length &&
            !statUpdates;

        if (isEmptyEvent) {
            return;
        }

        if (collector) {
            collector.collect(event, options?.alwaysGroup);
            return;
        }

        dispatch(
            pushEventQueue({
                ...event,
                name: (event.actionParent as Ability)?.name,
                image: (event.actionParent as Ability)?.image,
                playbackTime: playbackTime,
                events: [event],
                addCards,
            })
        );
    };
};

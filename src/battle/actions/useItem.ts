import { TARGET_TYPES, ACTION_TYPES, ANIMATION_TYPES } from "../../ability/types";
import { TRIGGER_SOURCE_TYPES, ActionContext } from "../types";
import { performAction } from "./performAction";
import { findCombatantData, updateCombatant } from "./combatantData";
import { PlaybackCollector } from "./playbackCollector";

export const useItem = ({
    itemIndex,
    actorId,
    playbackCollector,
}: {
    itemIndex: number;
    actorId: string;
    playbackCollector: PlaybackCollector;
}) => {
    return (dispatch, getState) => {
        const { index, friendlySide, combatant } = findCombatantData(getState().battle, actorId) || {};
        if (!friendlySide) {
            return;
        }

        const item = combatant.items[itemIndex];

        const source = { type: TRIGGER_SOURCE_TYPES.ITEM, source: item, actorId, targetId: actorId, allTargetIds: [actorId] };

        const context: ActionContext = {
            name: "Use Item",
            sourceChain: [source],
            triggerHistory: [],
            playbackCollector,
        };

        dispatch(
            performAction({
                action: {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    healing: item.healing,
                    resources: item.resources,
                    effects: item.effects,
                    icon: item.image,
                    animation: ANIMATION_TYPES.CONSUMABLE,
                },
                actorId,
                selectedIndex: index,
                side: friendlySide,
                parentContext: context,
            })
        );

        dispatch(
            updateCombatant({
                combatantId: actorId,
                newProperties: {
                    items: findCombatantData(getState().battle, actorId)?.combatant?.items.filter((item, i) => i !== itemIndex),
                },
            })
        );
    };
};

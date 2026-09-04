import * as uuid from "uuid";
import { CombatAbility, CARD_PILE_TYPES } from "../../../ability/types";
import { CARD_DEPLETED_PLAYBACK_SPEED } from "../../constants";
import { EventGroup } from "../../types";
import { enqueueEvent } from "../enqueueEvent";
import { applyAbilityEventEffects } from "./utils";
import { battleStateSlice } from "../../reducer";
import { prepareForDiscard } from "./utils";

const { updateBattle } = battleStateSlice.actions;

export const handleDiscardAfterUse = (ability: CombatAbility) => {
    return (dispatch, getState) => {
        const { removeAfterTurn, depletedOnUse, minion } = ability;

        const { discard, depleted } = getState().battle;
        const newDiscard = discard.slice();
        const newDepleted = depleted.slice();
        if (depletedOnUse) {
            newDepleted.push(ability);
        } else if (!minion && !removeAfterTurn) {
            const discarded = prepareForDiscard([ability]).map((card) => {
                return applyAbilityEventEffects({
                    event: card.onUse,
                    ability: card,
                });
            });

            newDiscard.unshift(...discarded);
        }

        if (depletedOnUse) {
            dispatch(
                enqueueEvent({
                    ...getState().battle,
                    id: uuid.v4(),
                    playbackTime: CARD_DEPLETED_PLAYBACK_SPEED,
                    newCards: [ability],
                    cardsAddedTo: CARD_PILE_TYPES.DEPLETED,
                    events: [],
                } as EventGroup)
            );
        }

        dispatch(
            updateBattle({
                discard: newDiscard,
                depleted: newDepleted,
            })
        );
    };
};

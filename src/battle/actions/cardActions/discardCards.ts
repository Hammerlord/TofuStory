import * as uuid from "uuid";
import { CombatAbility, CARD_PILE_TYPES } from "../../../ability/types";
import { CARD_DEPLETED_PLAYBACK_SPEED } from "../../constants";
import { EventGroup } from "../../types";
import { enqueueEvent } from "../enqueueEvent";
import { applyAbilityEventEffects } from "./utils";
import { battleStateSlice } from "../../reducer";
import { prepareForDiscard } from "./utils";
import { AppDispatch, RootState } from "../../../store";

const { updateBattle } = battleStateSlice.actions;

export const handleDiscardAfterUse = (ability: CombatAbility) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const { removeAfterTurn, depletedOnUse, minion } = ability;

        const { discard, depleted } = getState().battle!;
        const newDiscard = discard.slice();
        const newDepleted = depleted.slice();
        if (depletedOnUse) {
            newDepleted.push(ability);
        } else if (!minion && !removeAfterTurn) {
            const discarded = prepareForDiscard({ cards: [ability], isPlayed: true }).map((card) => {
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
                    playbackTime: CARD_DEPLETED_PLAYBACK_SPEED,
                    newCards: [ability],
                    cardsAddedTo: CARD_PILE_TYPES.DEPLETED,
                })
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

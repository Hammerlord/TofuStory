import { CARD_PILE_TYPES, CombatAbility } from "../../../ability/types";
import { Player } from "../../../character/types";
import { AppDispatch, RootState } from "../../../store";
import { CARD_DEPLETED_PLAYBACK_SPEED } from "../../constants";
import { battleStateSlice } from "../../reducer";
import { enqueueEvent } from "../enqueueEvent";
import { applyAbilityEventEffects, prepareForDiscard } from "./utils";

const { updateBattle } = battleStateSlice.actions;

export const handleDiscardAfterUse = (ability: CombatAbility) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const { removeAfterTurn, depletedOnUse, minion } = ability;

        const battle = getState().battle!;
        const { discard, depleted, playerSide } = battle;
        const newDiscard = discard.slice();
        const newDepleted = depleted.slice();
        if (depletedOnUse) {
            newDepleted.push(ability);
        } else if (!minion && !removeAfterTurn) {
            const player = playerSide.find((c) => c?.isPlayer) as Player;
            const discarded = prepareForDiscard({ cards: [ability], isPlayed: true, battle, player }).map((card) => {
                return applyAbilityEventEffects({
                    event: card.onUse,
                    ability: card,
                    battle,
                    player,
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

import { CARD_PILE_TYPES, CombatAbility, EFFECT_EVENT_KEYS } from "../../../ability/types";
import { battleStateSlice } from "../../reducer";
import { ActionContext, TRIGGER_SOURCE_TYPES } from "../../types";
import { enqueueEvent } from "../enqueueEvent";
import { checkEventTrigger } from "../statusEffect/triggerEffectEvent";

const { updateBattle } = battleStateSlice?.actions || {};

/**
 * Send `abilities` to the deplete pile and trigger the onDeplete effect event.
 */
export const depleteAbilities =
    ({ actorId, abilities = [], source: context }: { actorId: string; abilities: CombatAbility[]; source?: ActionContext }) =>
    (dispatch, getState) => {
        const { hand, depleted = [] } = getState().battle;
        dispatch(
            enqueueEvent({
                newCards: abilities,
                cardsAddedTo: CARD_PILE_TYPES.DEPLETED,
                context,
            })
        );

        dispatch(
            updateBattle({
                hand: hand.filter((ability: CombatAbility) => {
                    return abilities.every((card) => card.instanceId !== ability.instanceId);
                }),
                depleted: [...depleted, ...abilities],
            })
        );

        abilities.forEach((card) => {
            dispatch(
                checkEventTrigger({
                    combatantId: actorId,
                    effectEventKey: EFFECT_EVENT_KEYS.onDepleteAbility,
                    context: {
                        triggerHistory: [],
                        ...context,
                        sourceChain: [...(context?.sourceChain || []), { source: card, type: TRIGGER_SOURCE_TYPES.ABILITY }],
                    },
                })
            );
        });
    };

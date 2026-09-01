import { Ability, ACTION_TYPES, EFFECT_EVENT_KEYS } from "../../../ability/types";
import { BattleState } from "../../reducer";
import { ActionContext, BATTLEFIELD_SIDES, TriggerSource } from "../../types";
import { enqueueEvent } from "../enqueueEvent";
import { UpdatedCombatantStats } from "../getUpdatedStats";
import { checkEventTrigger } from "../statusEffect/triggerEffectEvent";
import { partition } from "ramda";

export const filterImmunedHindranceCards = ({
    cardsToAdd: initialCardsToAdd,
    context,
}: {
    cardsToAdd?: Ability[];
    context?: ActionContext;
}) => {
    return (dispatch, getState): Ability[] => {
        const [hindranceCards, cardsToAdd] = partition(
            (card) => card.actions.some((a) => a.type === ACTION_TYPES.HINDER),
            initialCardsToAdd || []
        );

        if (hindranceCards.length === 0) {
            return cardsToAdd;
        }

        const immuned = [];
        const source: TriggerSource | undefined = context?.sourceChain?.at(-1);

        const checkImmunity = () => {
            if (hindranceCards.length === 0) {
                return;
            }

            const battle: BattleState = getState().battle;
            const player = battle.playerSide.find((c) => c?.isPlayer);
            const hindranceImmunity = player.effects.find((e) => e.immunities?.type === "hindrance-card");
            if (!hindranceImmunity) {
                return;
            }
            const stacks = hindranceImmunity.stacks || 1;
            if (stacks) {
                const removed = hindranceCards.shift();
                immuned.push(removed);

                const triggerSource: TriggerSource = { ...source, source: removed, targetId: player.id };
                dispatch(
                    checkEventTrigger({
                        combatantId: player.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onFailedToReceiveHindranceCard,
                        context: {
                            ...context,
                            sourceChain: [...(context?.sourceChain || []), triggerSource],
                            trackSumAmount: 1,
                        },
                    })
                );

                checkImmunity();
            }
        };

        checkImmunity();

        if (immuned.length) {
            const battle: BattleState = getState().battle;
            const player = battle.playerSide.find((c) => c?.isPlayer);
            const changesToAnnounce: UpdatedCombatantStats = {
                combatantId: player.id,
                failedToAddCards: immuned,
                context,
                actorId: source?.actorId,
            };

            const statUpdates = { [player.id]: changesToAnnounce };

            // dispatch(enqueueEvent({ context, targetSide: BATTLEFIELD_SIDES.PLAYER_SIDE, statUpdates, options: { alwaysGroup: true } }));
        }
        return cardsToAdd.concat(hindranceCards);
    };
};

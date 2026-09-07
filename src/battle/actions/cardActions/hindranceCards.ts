import { partition } from "ramda";
import * as uuid from "uuid";
import { Ability, ACTION_TYPES, CombatAbility, EFFECT_EVENT_KEYS } from "../../../ability/types";
import { AppDispatch, RootState } from "../../../store";
import { BattleState } from "../../reducer";
import { ActionContext, BATTLEFIELD_SIDES, TriggerSource } from "../../types";
import { enqueueEvent } from "../enqueueEvent";
import { UpdatedCombatantStats } from "../getUpdatedStats";
import { checkEventTrigger } from "../statusEffect/triggerEffectEvent";
import { createCombatAbility } from "../../../ability/createCombatAbility";

export const filterImmunedHindranceCards = ({
    cardsToAdd: initialCardsToAdd,
    context,
}: {
    cardsToAdd?: Ability[];
    context: ActionContext;
    // This is a thunk that returns Ability[]... how to make TS happy for the callers?
}): any => {
    return (dispatch: AppDispatch, getState: () => RootState): Ability[] => {
        const [hindranceCards, cardsToAdd]: [Ability[], Ability[]] = partition(
            (card: Ability) => card.actions.some((a) => a.type === ACTION_TYPES.HINDER),
            initialCardsToAdd || []
        );

        if (hindranceCards.length === 0) {
            return cardsToAdd;
        }

        const immuned: CombatAbility[] = [];
        const source: TriggerSource | undefined = context?.sourceChain?.at(-1);

        const checkImmunity = () => {
            if (hindranceCards.length === 0) {
                return;
            }

            const battle: BattleState = getState().battle!;
            const player = battle.playerSide.find((c) => c?.isPlayer);
            if (!player) {
                return;
            }

            const hindranceImmunity = player.effects.find((e) => e.immunities?.type === "hindrance-card");
            if (!hindranceImmunity) {
                return;
            }
            const stacks = hindranceImmunity.stacks || 1;
            if (stacks) {
                // instanceId: for identification purposes during visual feedback
                const hindrance: Ability = hindranceCards.shift()!;
                const removed: CombatAbility = createCombatAbility(hindrance);
                immuned.push(removed);

                const changesToAnnounce: UpdatedCombatantStats = {
                    combatantId: player.id,
                    failedToAddCards: immuned,
                    context,
                    actorId: source?.actorId,
                };

                const triggerSource: TriggerSource = { ...source, source: removed, statUpdate: changesToAnnounce, targetId: player.id };
                const statUpdates = { [player.id]: changesToAnnounce };

                dispatch(enqueueEvent({ context, targetSide: BATTLEFIELD_SIDES.PLAYER_SIDE, statUpdates, options: { alwaysGroup: true } }));
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
        return cardsToAdd.concat(hindranceCards);
    };
};

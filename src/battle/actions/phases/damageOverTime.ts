import { ACTION_TYPES, Action, EFFECT_TYPES } from "../../../ability/types";
import { dotAbilityMap, dotDamageMap } from "../../constants";
import { BATTLEFIELD_SIDES, TRIGGER_SOURCE_TYPES } from "../../types";
import { getEnabledEffects } from "../statusEffect/getEnabledEffects";
import { findCombatantData } from "../combatantData";
import { ActionContext } from "../../types";
import { enqueueEvent } from "../enqueueEvent";
import { UpdatedCombatantStats, getUpdatedStats } from "../getUpdatedStats";
import { applyStatChanges, triggerStatChangeEvents } from "../statChanges";

/**
 * Trigger damage over time (DoT) effects. DoT effects of a class, such as burn, should be rolled into a single instance of damage
 * (so that 5x bleed doesn't trigger damage received events 5x).
 * @param combatantId - Combatant UUID
 */
export const handleDoTs =
    ({ combatantIds, side, context }: { combatantIds: string[]; side: BATTLEFIELD_SIDES; context: ActionContext }) =>
    (dispatch, getState) => {
        [EFFECT_TYPES.BLEED, EFFECT_TYPES.POISON, EFFECT_TYPES.BURN].map((dotType) => {
            const updatedStats: { statUpdate: UpdatedCombatantStats; action: Action; actorId?: string }[] = [];

            combatantIds.forEach((combatantId) => {
                // Perform another lookup on combatant info as it may have changed between effect triggers
                const combatantInfo = findCombatantData(getState().battle, combatantId);
                const { combatant, index } = combatantInfo || {};
                if (!combatant?.HP) {
                    return;
                }
                const activeEffects = getEnabledEffects({ combatantInfo });
                const matchingDoT = activeEffects.find((effect) => effect.type === dotType);
                if (!matchingDoT) {
                    return;
                }

                const dotStacks = matchingDoT.stacks || 1;
                const damage = dotStacks * dotDamageMap[dotType];

                if (!damage) {
                    return;
                }

                const updated = getUpdatedStats({
                    ...getState().battle,
                    targetIds: [combatantId],
                    actorId: matchingDoT.applierId,
                    selectedIndex: index,
                    action: {
                        type: ACTION_TYPES.EFFECT,
                        flatDamage: damage,
                        bypassArmor: true,
                    },
                    getCombatantById: (id) => findCombatantData(getState().battle, id),
                });

                dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));
                updatedStats.push(...updated);
            });

            if (!updatedStats.length) {
                return;
            }
            const aggregatedStatUpdates = updatedStats.reduce((acc, stats: { statUpdate: UpdatedCombatantStats; action: Action }) => {
                const { statUpdate } = stats;
                acc[statUpdate.combatantId] = statUpdate;
                return acc;
            }, {});

            dispatch(
                enqueueEvent({
                    targetSide: side,
                    statUpdates: aggregatedStatUpdates,
                    // Hack: this is for displaying the dot type in the ability notification banner
                    actionParent: dotAbilityMap[dotType],
                    context: context,
                })
            );

            dispatch(
                triggerStatChangeEvents(
                    updatedStats.map(({ statUpdate, action, actorId }) => ({
                        statUpdate,
                        context: {
                            ...context,
                            sourceChain: [
                                ...(context?.sourceChain || []),
                                {
                                    source: action,
                                    actorId,
                                    targetId: statUpdate.combatantId,
                                    statUpdate,
                                    type: TRIGGER_SOURCE_TYPES.ACTION,
                                },
                            ],
                        },
                    }))
                )
            );
        });
    };

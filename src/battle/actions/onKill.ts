import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_EVENT_KEYS, EFFECT_TYPES } from "../../ability/types";
import { playerStateSlice } from "../../character/playerReducer";
import { Combatant } from "../../character/types";
import { BattleState, battleStateSlice, BattleStatistics } from "../reducer";
import { BATTLEFIELD_SIDES, CombatantInfo, TRIGGER_SOURCE_TYPES } from "../types";
import { findCombatantData, getEnabledEffects } from "../utils";
import { BATTLE_STATES } from "./../reducer";
import { ActionContext } from "./../types";
import { getUpdatedStats } from "./getUpdatedStats";
import { applyStatChanges, isActorPlayerSide, triggerStatChangeEvents } from "./statChanges";
import { checkEventTrigger } from "./triggerEffectEvent";

const { updateBattle, updateBattleState } = battleStateSlice?.actions || {};
const { updatePlayer } = playerStateSlice?.actions || {};

export const handleOnKill = (context: ActionContext) => {
    return (dispatch, getState) => {
        const source = context?.sourceChain?.at(-1);
        if (!source) {
            return;
        }
        const { actorId, targetId } = source;
        const killedByInfo = findCombatantData(getState().battle, actorId);
        const { combatant: killedBy, index, friendly } = killedByInfo || {};
        if (!killedBy || killedBy.HP <= 0) {
            return;
        }

        const killedInfo = findCombatantData(getState().battle, targetId);
        const isKilledTargetThreatening = Boolean(killedInfo?.combatant?.abilities?.[0]);

        if (isKilledTargetThreatening) {
            const lifeOnKill = getEnabledEffects({ combatantInfo: killedByInfo }).reduce((acc, { lifeOnKill = 0 }) => acc + lifeOnKill, 0);

            if (lifeOnKill > 0) {
                const updated = getUpdatedStats({
                    ...getState().battle,
                    actorId: killedBy.id,
                    targetIds: [killedBy.id],
                    selectedIndex: index,
                    action: {
                        type: ACTION_TYPES.EFFECT,
                        healing: lifeOnKill,
                    },
                    context: {
                        ...context,
                    },
                    getCombatantById: (id) => findCombatantData(getState().battle, id),
                });

                dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));
                const lifeOnKillSource = {
                    type: TRIGGER_SOURCE_TYPES.EFFECT,
                    actorId: killedBy.id,
                    targetId: killedBy.id,
                    triggerHistory: [],
                };

                dispatch(
                    triggerStatChangeEvents(
                        updated.map(({ statUpdate, action }) => ({
                            statUpdate,
                            context: {
                                ...context,
                                sourceChain: [...(context?.sourceChain || []), { ...lifeOnKillSource, action, statUpdate }],
                            },
                        }))
                    )
                );
            }
        }

        dispatch(
            checkEventTrigger({
                combatantId: killedBy.id,
                effectEventKey: EFFECT_EVENT_KEYS.onKill,
                context: { ...context },
            })
        );

        friendly.forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onFriendlyKill,
                        context: { ...context },
                    })
                );
            }
        });
    };
};

export const onCombatantDeath = ({ combatantId, context }: { combatantId: string; context?: ActionContext }) => {
    return (dispatch, getState) => {
        const deadCombatant = findCombatantData(getState().battle, combatantId);
        const { friendly, hostile, combatant, friendlySide } = deadCombatant || {};
        const source = context?.sourceChain?.at(-1);
        if (isActorPlayerSide({ side: getState().battle.playerSide, source })) {
            const currentStatistics: BattleStatistics = getState().battle.statistics;
            dispatch(
                updateBattle({
                    statistics: {
                        ...currentStatistics,
                        totalKills: currentStatistics.totalKills + 1,
                    },
                })
            );
        }

        if (friendly) {
            // Remove all effects that have durations on them, reset resources and casting
            // Order matters: do not remove status effects gained from onDeath event
            dispatch(
                updateBattle({
                    [friendlySide]: friendly.map((combatant) => {
                        if (combatant?.id === combatantId) {
                            return {
                                ...combatant,
                                effects: combatant.effects.filter((e) => {
                                    const hasDuration = typeof e.duration === "number" && e.duration !== Infinity;
                                    return (
                                        (e.class !== EFFECT_CLASSES.DEBUFF && !hasDuration) ||
                                        e.persistsWhenDead ||
                                        e[EFFECT_EVENT_KEYS.onDeath]
                                    ); // Still allow onDeath effects to play out
                                }),
                                casting: null,
                                resources: 0,
                                armor: 0,
                            };
                        }

                        return combatant;
                    }),
                })
            );
        }

        dispatch(checkEventTrigger({ combatantId, effectEventKey: EFFECT_EVENT_KEYS.onDeath, context: context }));

        if (!combatant || !friendly) {
            return;
        }

        const dispatchEvent = (combatant: Combatant | null, effectEventKey: EFFECT_EVENT_KEYS) => {
            const { id } = combatant || {};
            if (id !== combatantId) {
                dispatch(checkEventTrigger({ combatantId: id, effectEventKey, context: context }));
            }
        };

        dispatch(handleOnKill(context));
        dispatch(checkUpdatePlayerMoneyOnKill({ deadCombatantInfo: deadCombatant, context: context }));

        friendly.forEach((combatant: Combatant | null) => {
            dispatchEvent(combatant, EFFECT_EVENT_KEYS.onFriendlyDeath);
        });

        hostile.forEach((combatant: Combatant | null) => {
            dispatchEvent(combatant, EFFECT_EVENT_KEYS.onHostileDeath);
        });

        const { playerSide } = getState().battle;

        const player = playerSide.find((c: Combatant | null) => c?.isPlayer);
        if (player.HP <= 0) {
            dispatch(updateBattleState(BATTLE_STATES.DEFEAT));
            dispatch(updatePlayer(player));
            return;
        }
    };
};

const checkUpdatePlayerMoneyOnKill = ({
    deadCombatantInfo: deadCombatantInfo,
    context,
}: {
    deadCombatantInfo: CombatantInfo;
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        if (!deadCombatantInfo) {
            return;
        }

        if (deadCombatantInfo.friendlySide === BATTLEFIELD_SIDES.PLAYER_SIDE) {
            return;
        }

        const combatant = deadCombatantInfo.combatant;

        if (!combatant?.mesos) {
            return;
        }

        const isLifeLink = combatant.effects.some((e) => e.type === EFFECT_TYPES.LIFE_LINK);
        if (isLifeLink) {
            // This should be handled at the end of the combat since we don't want to potentially retrigger multiple money drops from lifelink
            return;
        }

        const moneyAction = {
            mesos: combatant.mesos || 0,
            type: ACTION_TYPES.NONE,
        };

        const battle: BattleState = getState().battle;
        const player = battle.playerSide.find((c) => c?.isPlayer);
        if (!player) {
            return;
        }

        const updated = getUpdatedStats({
            ...getState().battle,
            targetIds: [player.id],
            actorId: deadCombatantInfo,
            action: moneyAction,
            context: context,
            getCombatantById: (id: string) => findCombatantData(getState().battle, id),
        });
        dispatch(applyStatChanges(updated.map(({ statUpdate }) => statUpdate)));
    };
};

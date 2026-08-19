import { CombatEffect, Effect, EFFECT_EVENT_KEYS } from "../../ability/types";
import { playerStateSlice } from "../../character/playerReducer";
import { Combatant, Player } from "../../character/types";
import { BattleState, battleStateSlice, BattleStatistics } from "../reducer";
import { BATTLEFIELD_SIDES, TRIGGER_SOURCE_TYPES, TriggerSource } from "../types";
import { ActionContext } from "./../types";
import { findCombatantData, isActorPlayerSide } from "./combatantData";
import { UpdatedCombatantStats } from "./getUpdatedStats";
import { onCombatantDeath } from "./onKill";
import { checkEventTrigger, onEffectEventTrigger } from "./statusEffect/triggerEffectEvent";
import { updateEnemyTargetingAfterEffectsApplied } from "./targeting/enemyTargeting";

const { updateBattle } = battleStateSlice?.actions || {};
const { updatePlayer } = playerStateSlice?.actions || {};

export const triggerStatChangeEvents =
    (statChanges: { statUpdate: UpdatedCombatantStats; context?: ActionContext }[]) => (dispatch, getState) => {
        statChanges.forEach(({ statUpdate, context }) => {
            const {
                combatantId,
                rawDamage = 0,
                healthDamage = 0,
                armor = 0,
                resources = 0,
                healing = 0,
                overhealing = 0,
                effects = [],
                isDeathBlow = false,
                rawResources = 0,
                removedEffects = [],
                isArmorDecay = false,
                isArmorBroken = false,
                failedToApplyEffects = [],
            } = statUpdate;

            const dispatchEvent = ({
                effectEventKey,
                sourcePayload,
                trackSumAmount,
            }: {
                effectEventKey: EFFECT_EVENT_KEYS;
                sourcePayload?: { [key in keyof TriggerSource]? };
                trackSumAmount?: number;
            }) => {
                const updatedSourceChain = [...(context?.sourceChain || []), { ...sourcePayload, targetId: combatantId, statUpdate }];
                dispatch(
                    checkEventTrigger({
                        combatantId,
                        effectEventKey,
                        context: { ...context, trackSumAmount, sourceChain: updatedSourceChain },
                    })
                );
            };

            if (resources < 0) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onResourcesSpent, trackSumAmount: Math.abs(resources) });
            }

            if (rawResources > 0) {
                // This event currently includes overcapping resources; use overcappedResources when nuance required
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onResourcesGained, trackSumAmount: Math.abs(rawResources) });
            }

            if (healing > 0) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onReceiveHealing, trackSumAmount: Math.abs(healing) });
            }

            if (overhealing > 0) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onReceiveOverhealing, trackSumAmount: Math.abs(overhealing) });
            }

            if (armor > 0) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onReceiveArmor, trackSumAmount: Math.abs(armor) });
            } else if (armor < 0) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onArmorLoss, trackSumAmount: Math.abs(armor) });
            }

            if (isArmorDecay) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onArmorDecay });
            }

            if (isArmorBroken) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onArmorBreak });
            }

            if (rawDamage > 0) {
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onReceiveDamage, trackSumAmount: Math.abs(rawDamage) });
            }

            if (healthDamage > 0) {
                const source = context?.sourceChain?.at(-1);
                dispatch(updateDamageStatistics(healthDamage, source));
                dispatchEvent({ effectEventKey: EFFECT_EVENT_KEYS.onReceiveHealthDamage, trackSumAmount: Math.abs(healthDamage) });
            }

            effects.forEach((e: CombatEffect) => {
                dispatchEvent({
                    effectEventKey: EFFECT_EVENT_KEYS.onReceiveEffect,
                    sourcePayload: { source: e, type: TRIGGER_SOURCE_TYPES.EFFECT },
                });

                const source: TriggerSource = { statUpdate, source: e, type: TRIGGER_SOURCE_TYPES.EFFECT, targetId: combatantId };

                dispatch(
                    checkEventTrigger({
                        combatantId: e.applierId,
                        effectEventKey: EFFECT_EVENT_KEYS.onApplyEffect,
                        context: { ...context, sourceChain: [...(context?.sourceChain || []), source] },
                    })
                );
            });

            dispatch(updateEnemyTargetingAfterEffectsApplied({ combatantId, effectsApplied: effects }));

            removedEffects.forEach((e: CombatEffect) => {
                if (!e.onRemoved) {
                    return;
                }

                const removedEvents = Array.isArray(e.onRemoved) ? e.onRemoved : [e.onRemoved];
                removedEvents.forEach((effectEvent) => {
                    dispatch(
                        onEffectEventTrigger({
                            ownerId: combatantId,
                            effectEvent,
                            effect: e,
                            effectEventKey: EFFECT_EVENT_KEYS.onRemoved,
                        })
                    );
                });
            });

            failedToApplyEffects.forEach((e: Effect) => {
                dispatchEvent({
                    effectEventKey: EFFECT_EVENT_KEYS.onFailedToReceiveEffect,
                    sourcePayload: { source: e, type: TRIGGER_SOURCE_TYPES.EFFECT },
                });
            });

            if (isDeathBlow) {
                dispatch(onCombatantDeath({ combatantId, context: context }));
            }
        });
    };

export const applyStatChanges = (statUpdates: UpdatedCombatantStats[]) => (dispatch, getState) => {
    // Apply the stat updates first before triggering any related events
    statUpdates.forEach((statUpdate: UpdatedCombatantStats) => {
        const combatantId = statUpdate.combatantId;
        const battle: BattleState = getState().battle;
        const { combatant: oldCombatant, friendlySide, friendly } = findCombatantData(battle, combatantId) || {};
        // Due to morph, the combatant may no longer exist
        if (!oldCombatant) {
            return;
        }

        dispatch(
            updateBattle({
                [friendlySide]: friendly.map((combatant: Combatant | null) => {
                    if (combatant?.id !== combatantId) {
                        return combatant;
                    }

                    return stageStatChanges(statUpdate, oldCombatant);
                }),
            })
        );

        // Updates player money and HP for the state outside of combat.
        // TRICKY: all money operations on the player side affect the PLAYER, even if the minion got the kill, etc.
        if (friendlySide === BATTLEFIELD_SIDES.PLAYER_SIDE && !battle.isTutorial) {
            const player = friendly.find((p) => p?.isPlayer);
            const stats = stageStatChanges(statUpdate, player);
            const updatePlayerStats = { mesos: stats.mesos || 0 };

            if (oldCombatant.isPlayer) {
                // @ts-ignore
                updatePlayerStats.HP = stats.HP;
            }

            dispatch(updatePlayer(updatePlayerStats));
        }
    });
};

export const stageStatChanges = (statUpdate: UpdatedCombatantStats, combatant: Combatant | Player) => {
    const { healthDamage = 0, armor = 0, resources = 0, healing = 0, effects = [], mesos = 0, removedEffects = [] } = statUpdate;

    const combatantEffects = combatant.effects.filter((effect: CombatEffect) => removedEffects.every(({ id }) => id !== effect.id));

    return {
        ...combatant,
        HP: Math.max(0, combatant.HP - healthDamage + healing),
        armor: combatant.armor + armor,
        resources: Math.max(0, combatant.resources + resources),
        effects: calculateEffectChanges(effects, combatantEffects),
        mesos: Math.max(0, combatant.mesos + mesos),
    };
};

const updateDamageStatistics = (damage: number, source?: TriggerSource) => (dispatch, getState) => {
    const battle: BattleState = getState().battle;
    if (isActorPlayerSide({ playerSide: battle.playerSide, source: source })) {
        const statistics: BattleStatistics = {
            ...battle.statistics,
            totalDamage: (battle.statistics.totalDamage || 0) + (damage || 0),
            damageByEnemyName: {
                ...battle.statistics.damageByEnemyName,
            },
        };

        const target = findCombatantData(battle, source.targetId);
        const targetName = target?.combatant?.name;
        if (targetName) {
            statistics.damageByEnemyName[targetName] = (statistics.damageByEnemyName[targetName] || 0) + (damage || 0);
        }

        dispatch(
            updateBattle({
                statistics,
            })
        );
    }
};

/**
 * When an effect reaches max stacks, the existing effect with the shortest duration gets its duration extended by the duration of the incoming effect.
 */
const calculateEffectChanges = (incomingEffects: CombatEffect[], existingEffects: CombatEffect[]): CombatEffect[] => {
    const updatedEffects = existingEffects.slice();

    incomingEffects.forEach((incomingEffect: CombatEffect) => {
        if (!incomingEffect.maxApplications) {
            updatedEffects.push(incomingEffect);
            return;
        }

        const idCountMap = {};
        updatedEffects.forEach((effect: CombatEffect) => {
            if (!effect.maxApplications || effect.name !== incomingEffect.name) {
                return;
            }

            if (!idCountMap[effect.name]) {
                idCountMap[effect.name] = {
                    count: 1,
                    lowestDuration: effect,
                };

                return;
            }
            ++idCountMap[effect.name].count;
            if (effect.duration < idCountMap[effect.name].lowestDuration?.duration) {
                idCountMap[effect.name].lowestDuration = effect;
            }
        });

        if (!idCountMap[incomingEffect.name] || idCountMap[incomingEffect.name].count < incomingEffect.maxApplications) {
            updatedEffects.push(incomingEffect);
            return;
        }

        updatedEffects.forEach((effect: CombatEffect, i) => {
            const { lowestDuration } = idCountMap[effect.name] || {};
            if (lowestDuration?.id === effect.id) {
                // This is the effect to extend the duration and/or stacks
                const updatedEffectDuration = isNaN(updatedEffects[i].duration) ? Infinity : updatedEffects[i].duration;
                const incomingEffectDuration = isNaN(incomingEffect.duration) ? Infinity : incomingEffect.duration;
                const newDuration = updatedEffectDuration + incomingEffectDuration;
                const maxDuration = effect.maxDuration || Infinity;
                const maxStacks = updatedEffects[i].maxStacks || incomingEffect.maxStacks || Infinity;
                updatedEffects[i] = {
                    ...updatedEffects[i],
                    duration: Math.min(maxDuration, newDuration),
                    stacks: Math.min((updatedEffects[i].stacks || 0) + (incomingEffect.stacks || 0), maxStacks),
                    // The last character who applies the DoT gets the applier attribution, eg. for effects like Tauromacis Horn.
                    applierId: incomingEffect.applierId || effect.applierId,
                };
            }
        });
    });

    return updatedEffects;
};

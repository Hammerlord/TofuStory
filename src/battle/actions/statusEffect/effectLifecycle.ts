import { partition } from "ramda";
import { CombatEffect, EFFECT_CLASSES, EFFECT_EVENT_KEYS, EffectEventTrigger } from "../../../ability/types";
import { findCombatantData } from "../combatantData";
import { ActionContext } from "../../types";
import { triggerStatChangeEvents } from "../statChanges";
import { onEffectEventTrigger } from "./triggerEffectEvent";
import { updateCombatant } from "../combatantData";

/**
 * Handles updating effect lifecycle properties
 * Restores its duration based on the effect event configuration
 * And/or removes the effect if it has run out of stacks/was flagged for removal by the effect event
 */
export const checkUpdateEffectLifecycle =
    ({
        effect,
        effectEvent,
        context,
        ownerId,
    }: {
        effect: CombatEffect;
        effectEvent: EffectEventTrigger;
        context: ActionContext;
        ownerId: string;
    }) =>
    (dispatch, getState) => {
        const { removeEffect, decrementStacks = 0, incrementStacks = 0, resetDuration } = effectEvent;

        const { combatant } = findCombatantData(getState().battle, ownerId) || {};
        if (!combatant) {
            return;
        }

        const maxStacks = effect.maxStacks || Infinity;
        const updatedStacks = (effect.stacks || 1) - (decrementStacks || 0) + (incrementStacks || 0);
        const updatedEffect = {
            ...effect,
            stacks: Math.min(maxStacks, updatedStacks),
            duration: resetDuration ? effect.originalDuration : effect.duration,
        };

        if (removeEffect || updatedEffect.stacks === 0) {
            const removedEffects = [];
            const newEffects = [];
            combatant.effects.forEach((e) => (e.id === effect.id ? removedEffects.push(e) : newEffects.push(e)));

            dispatch(triggerStatChangeEvents([{ statUpdate: { combatantId: ownerId, removedEffects }, context: context }]));
            dispatch(updateCombatant({ combatantId: ownerId, newProperties: { effects: newEffects } }));
            return;
        }

        if ((decrementStacks && updatedEffect.stacks > 0) || resetDuration || incrementStacks) {
            const newEffects = combatant.effects.map((e: CombatEffect) => {
                return e.id === effect.id ? updatedEffect : e;
            });
            dispatch(updateCombatant({ combatantId: ownerId, newProperties: { effects: newEffects } }));
        }
    };

/**
 * Reduces the duration of effects by 1 and removes them if they have run out of time
 */
export const tickDownStatusEffects = (combatantId: string, effectClass?: EFFECT_CLASSES) => {
    return (dispatch, getState) => {
        const { combatant } = findCombatantData(getState().battle, combatantId) || {};
        if (!combatant) {
            return;
        }
        const tickedDown = combatant.effects.map((effect) => {
            if (!effectClass || effect.class === effectClass) {
                return {
                    ...effect,
                    uptime: effect.uptime + 1,
                    duration: (isNaN(effect.duration) ? Infinity : effect.duration) - 1,
                };
            }

            return effect;
        });

        const [activeEffects, effectsEnded] = partition(({ duration = Infinity }) => duration > 0, tickedDown);
        dispatch(
            updateCombatant({
                combatantId: combatant.id,
                newProperties: {
                    effects: activeEffects,
                },
            })
        );

        effectsEnded.forEach((effect: CombatEffect) => {
            if (!effect.onEnd) {
                return;
            }

            const events = Array.isArray(effect.onEnd) ? effect.onEnd : [effect.onEnd];
            events.forEach((effectEvent) => {
                dispatch(
                    onEffectEventTrigger({
                        ownerId: combatantId,
                        effectEvent,
                        effect,
                        effectEventKey: EFFECT_EVENT_KEYS.onEnd,
                    })
                );
            });
        });
    };
};
export const isTurnToTrigger = ({ turnsTriggerFrequency, uptime }): boolean => {
    if (!turnsTriggerFrequency) {
        return true;
    }

    if (uptime === 1) {
        return false;
    }

    return uptime % turnsTriggerFrequency === 0;
};

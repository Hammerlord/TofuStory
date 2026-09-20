import { CombatEffect } from "../../ability/types";

/**
 * `maxStacks` and `maxApplications` are equal:
 * - "Stack" effects hold their whole magnitude in one application (eg. Burn/Poison: `maxApplications: 1`
 *   and a `stacks` value). Their total stacks are capped by `maxStacks`.
 * - "Application" effects are one stack per application (eg. Chill: `maxApplications: 3`, `stacks: 1`).
 *   The smaller of the two wins.
 */
const getTotalStacksCap = (incomingEffect: CombatEffect): number => {
    const { maxStacks = Infinity, maxApplications = Infinity, stacks = 1 } = incomingEffect;
    if (maxApplications === 1 || stacks > 1) {
        return maxStacks;
    }
    return Math.min(maxStacks, maxApplications);
};

/**
 * Checks and applies cases where an incoming effect should be applied to an existing effect, rather than creating a new effect.
 * When an effect has reached its application (or total stack) cap, the existing effect with the shortest duration gets its duration
 * extended by the duration of the incoming effect ("pandemic") instead of adding another application. Stacks absorbed by a pandemic
 * respect the total stack cap shared by every application of the effect.
 */
export const calculateEffectChanges = (
    incomingEffects: CombatEffect[],
    existingEffects: CombatEffect[],
): CombatEffect[] => {
    const updatedEffects = existingEffects.slice();

    incomingEffects.forEach((incomingEffect: CombatEffect) => {
        if (!incomingEffect.maxApplications) {
            const existingEffectIndex = updatedEffects.findIndex(
                (effect: CombatEffect) =>
                    effect.name === incomingEffect.name &&
                    effect.stacks < effect.maxStacks &&
                    effect.duration === incomingEffect.duration,
            );

            const existingEffect = updatedEffects[existingEffectIndex];
            if (!existingEffect) {
                updatedEffects.push(incomingEffect);
                return;
            }

            const { stacks = 1, maxStacks = Infinity, applierId } = existingEffect;
            updatedEffects[existingEffectIndex] = {
                ...existingEffect,
                stacks: Math.min(maxStacks, stacks + (incomingEffect.stacks || 1)),
                // The last character who applies the DoT gets the applier attribution, eg. for effects like Tauromacis Horn.
                applierId: incomingEffect.applierId || applierId,
            };
            return;
        }

        const idCountMap: {
            [effectName: string]: {
                count: number;
                totalStacks: number;
                lowestDuration: CombatEffect;
            };
        } = {};
        updatedEffects.forEach((effect: CombatEffect) => {
            if (!effect.maxApplications || effect.name !== incomingEffect.name) {
                return;
            }

            if (!idCountMap[effect.name]) {
                idCountMap[effect.name] = {
                    count: 1,
                    totalStacks: effect.stacks || 1,
                    lowestDuration: effect,
                };

                return;
            }

            ++idCountMap[effect.name].count;
            idCountMap[effect.name].totalStacks += effect.stacks || 1;
            if (effect.duration < idCountMap[effect.name].lowestDuration?.duration) {
                idCountMap[effect.name].lowestDuration = effect;
            }
        });

        const totalStacksCap = getTotalStacksCap(incomingEffect);
        const { count, totalStacks } = idCountMap[incomingEffect.name] || {};
        if (
            !count ||
            (count < (incomingEffect.maxApplications || Infinity) && totalStacks < totalStacksCap)
        ) {
            updatedEffects.push(incomingEffect);
            return;
        }

        updatedEffects.forEach((effect: CombatEffect, i) => {
            const { lowestDuration, totalStacks: existingTotalStacks = 0 } =
                idCountMap[effect.name] || {};
            if (lowestDuration?.id === effect.id) {
                // The stack cap applies to the effect as a whole, so this application may only absorb
                // the stacks left over after accounting for every other application.
                const currentStacks = updatedEffects[i].stacks || 1;
                const otherApplicationsStacks = Math.max(0, existingTotalStacks - currentStacks);
                const stacksAllowed = Math.max(0, totalStacksCap - otherApplicationsStacks);
                const maxStacks = Math.min(
                    updatedEffects[i].maxStacks || Infinity,
                    incomingEffect.maxStacks || Infinity,
                );

                const newDuration =
                    updatedEffects[i].duration === Infinity
                        ? Infinity
                        : Math.min(
                              effect.maxDuration,
                              (updatedEffects[i].duration || 0) + (incomingEffect.duration || 0),
                          );

                updatedEffects[i] = {
                    ...updatedEffects[i],
                    duration: newDuration,
                    stacks: Math.min(
                        currentStacks + (incomingEffect.stacks || 1),
                        stacksAllowed,
                        maxStacks,
                    ),
                    // The last character who applies the DoT gets the applier attribution, eg. for effects like Tauromacis Horn.
                    applierId: incomingEffect.applierId || effect.applierId,
                };
            }
        });
    });

    return updatedEffects;
};

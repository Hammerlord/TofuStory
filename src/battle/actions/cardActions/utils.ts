import { AbilityEffect, AbilityEvent, CombatAbility } from "../../../ability/types";
import { passesChance, getRandomItem } from "../../../utils";
import { passesConditions } from "../../passesConditions";
import { ActionContext } from "../../types";

export const prepareForDiscard = (cards: CombatAbility[]) => {
    return cards
        .filter((ability: CombatAbility) => !ability.removeAfterTurn)
        .map((ability: CombatAbility) => {
            return applyAbilityEventEffects({
                event: ability.onLeaveHand,
                ability: {
                    ...ability,
                    effects: (ability.effects || []).filter((e) => {
                        const { removeOnDiscard = true } = e;
                        return !removeOnDiscard;
                    }),
                },
            });
        });
};

export const applyAbilityEventEffects = ({
    event,
    ability,
    context,
    bonusChance,
}: {
    event: AbilityEvent;
    ability: CombatAbility;
    context?: ActionContext;
    bonusChance?: number;
}): CombatAbility => {
    if (!event) {
        return ability;
    }

    const { abilityEffects = [], mode, chance } = event || {};

    const totalChance = typeof chance === "number" ? chance + (bonusChance || 0) : undefined;
    if (!passesChance(totalChance)) {
        return ability;
    }

    const effectsToApply = mode === "random-pick" ? [getRandomItem(abilityEffects)].filter((v) => v) : abilityEffects;

    const getCalculationTarget = () => undefined; // TODO for more comprehensive check, add combatants
    if (!passesConditions({ context, getCalculationTarget, proc: event })) {
        return ability;
    }

    const effects = [...(ability.effects || [])];

    effectsToApply.forEach((e: AbilityEffect) => {
        const countMap = effects.reduce((acc, e: AbilityEffect) => {
            if (e.name) {
                acc[e.name] = (acc[e.name] || 0) + 1;
            }

            return acc;
        }, {});

        const { name, maxApplications } = e;
        if (!maxApplications || !countMap[name] || countMap[name] < maxApplications) {
            effects.push(e);
        }
    });

    return { ...ability, effects };
};

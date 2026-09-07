import { AbilityEffect, AbilityEvent, CombatAbility } from "../../../ability/types";
import { Player } from "../../../character/types";
import { getRandomItem, passesChance } from "../../../utils";
import { findCombatantData } from "../combatantData";
import { passesConditions } from "../../passesConditions";
import { ActionContext, BattleState } from "../../types";

export const prepareForDiscard = ({
    cards,
    isPlayed = false,
    // Eg. Bounce does not get rid of Furious Strike
    alwaysKeepRetain = false,
    player,
    battle,
}: {
    cards: CombatAbility[];
    // isPlayed: set to true if the card was discarded after being played.
    isPlayed?: boolean;
    alwaysKeepRetain?: boolean;
    player: Player;
    battle: BattleState;
}) => {
    return cards
        .filter((ability: CombatAbility) => {
            if (ability.removeAfterTurn) {
                if (ability.retain) {
                    return !alwaysKeepRetain;
                }
                return false;
            }

            return true;
        })
        .map((ability: CombatAbility) => {
            return applyAbilityEventEffects({
                event: ability.onLeaveHand,
                ability: {
                    ...ability,
                    effects: (ability.effects || []).filter((e) => {
                        const { removeOnDiscard = true, removeOnPlay = true } = e;
                        if (removeOnDiscard) {
                            return true;
                        }

                        if (removeOnPlay) {
                            return isPlayed;
                        }

                        return false;
                    }),
                },
                player,
                battle,
            });
        });
};

export const applyAbilityEventEffects = ({
    event,
    ability,
    context,
    bonusChance,
    battle,
    player,
}: {
    event?: AbilityEvent | undefined;
    ability: CombatAbility;
    context?: ActionContext;
    bonusChance?: number;
    battle: BattleState;
    player: Player;
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
    const actor = findCombatantData(battle, player?.id);

    if (!passesConditions({ context, actor, proc: event, battle })) {
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

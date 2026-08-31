import { Ability, Action, ActionOptionalProperties, Bonus, CONDITION_TARGETS } from "../ability/types";
import { getMultiplier } from "./getMultiplier";
import { passesConditions } from "./passesConditions";
import { ActionContext, ActionParent, CombatantInfo, TriggerSource } from "./types";

export const calculateBonus = ({
    action,
    target,
    allTargets,
    actor,
    isTargetSelected,
    actionParent,
    context,
    deck,
    hand,
    discard,
}: {
    action: ActionOptionalProperties; // The action to apply the bonus to
    target?: CombatantInfo;
    allTargets: CombatantInfo[];
    actor?: CombatantInfo;
    isTargetSelected: boolean;
    actionParent?: ActionParent;
    context?: ActionContext;
    deck: Ability[];
    hand: Ability[];
    discard: Ability[];
}): ActionOptionalProperties => {
    if (!action.bonus) {
        return action;
    }

    const bonuses = Array.isArray(action.bonus) ? action.bonus : [action.bonus];
    const getCalculationTarget = (conditionTarget: CONDITION_TARGETS.ACTOR | CONDITION_TARGETS.TARGET): CombatantInfo | undefined => {
        if (conditionTarget === CONDITION_TARGETS.TARGET) {
            return target;
        }
        if (conditionTarget === CONDITION_TARGETS.ACTOR) {
            return actor;
        }
    };

    const source = context?.sourceChain?.at(-1);

    return bonuses.reduce(
        (acc: Action, bonus: Bonus) => {
            const { excludePrimaryTarget = false, effects: bonusEffects = [] } = bonus;
            const multiplier = getMultiplier({
                actor,
                target,
                allTargets,
                multiplier: bonus.multiplier,
                actionParent,
                source,
                deck,
                hand,
                discard,
            });

            const isValidTarget = !excludePrimaryTarget || !isTargetSelected;
            if (passesConditions({ getCalculationTarget, proc: bonus, context }) && isValidTarget) {
                const bonusDamage = (bonus.damage || 0) * multiplier;
                const { damage = 0, secondaryDamage, healing = 0, armor = 0, effects = [], area = 0, drawCards, chance = 1 } = acc;
                const drawCardsAmount = (bonus?.drawCards?.amount || 0) + (drawCards?.amount || 0);
                const drawCardsObj = drawCardsAmount ? { amount: drawCardsAmount } : undefined;

                const totalBonusEffects = bonusEffects.map((effect) => ({
                    ...effect,
                    stacks: (effect.stacks || 1) * multiplier,
                }));

                return {
                    ...acc,
                    area: area + (bonus.area || 0),
                    damage: damage + bonusDamage,
                    secondaryDamage: secondaryDamage && secondaryDamage + bonusDamage,
                    healing: healing + (bonus.healing || 0) * multiplier,
                    armor: armor + (bonus.armor || 0) * multiplier,
                    destroyArmor: (bonus.destroyArmor || 0) + (acc.destroyArmor || 0),
                    effects: [...effects, ...totalBonusEffects],
                    drawCards: drawCardsObj,
                    chance: chance + (bonus.bonusChance || 0),
                } as Action;
            }
            return acc;
        },
        { ...action }
    );
};

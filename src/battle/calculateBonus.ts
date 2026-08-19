import { ActionOptionalProperties, Ability, CONDITION_TARGETS, Action, Bonus } from "../ability/types";
import { Item } from "../item/types";
import { getMultiplier } from "./getMultiplier";
import { passesConditions } from "./passesConditions";
import { ActionParent, CombatantInfo, TriggerSource } from "./types";

export const calculateBonus = ({
    action,
    target,
    allTargets,
    actor,
    isTargetSelected,
    actionParent,
    source,
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
    source?: TriggerSource;
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
        } else if (conditionTarget === CONDITION_TARGETS.ACTOR) {
            return actor;
        }
    };

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
            if (passesConditions({ getCalculationTarget, proc: bonus, source: source }) && isValidTarget) {
                const bonusDamage = (bonus.damage || 0) * multiplier;
                const { damage = 0, secondaryDamage, healing = 0, armor = 0, effects = [], area = 0, drawCards } = acc;
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
                } as Action;
            }
            return acc;
        },
        { ...action }
    );
};

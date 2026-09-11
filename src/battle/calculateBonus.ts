import { Action, Bonus, CombatAbility, CONDITION_TARGETS } from "../ability/types";
import { getMultiplier } from "./getMultiplier";
import { passesConditions } from "./passesConditions";
import { BattleState } from "./types";
import { ActionContext, ActionParent, CombatantInfo, NonCombatPlayerInfo } from "./types";

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
    battle,
}: {
    action: Action; // The action to apply the bonus to
    // If we are out of combat, we don't have index, etc.
    actor?: NonCombatPlayerInfo | CombatantInfo;
    target?: NonCombatPlayerInfo | CombatantInfo;
    allTargets?: NonCombatPlayerInfo[] | CombatantInfo[];
    isTargetSelected: boolean;
    actionParent?: ActionParent;
    context?: ActionContext;
    deck: CombatAbility[];
    hand: CombatAbility[];
    discard: CombatAbility[];
    battle?: BattleState | null;
}): Action => {
    if (!action.bonus) {
        return action;
    }

    const bonuses = Array.isArray(action.bonus) ? action.bonus : [action.bonus];
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
            if (passesConditions({ target, actor, proc: bonus, context, battle }) && isValidTarget) {
                const bonusDamage = (bonus.damage || 0) * multiplier;
                const {
                    damage = 0,
                    secondaryDamage,
                    healing = 0,
                    armor = 0,
                    effects = [],
                    area = 0,
                    drawCards,
                    chance = 1,
                    resources = 0,
                } = acc;
                const drawCardsAmount = (bonus?.drawCards?.amount || 0) + (drawCards?.amount || 0);
                const drawCardsObj = drawCardsAmount ? { amount: drawCardsAmount } : undefined;

                const totalBonusEffects = bonusEffects
                    .map((effect) => ({
                        ...effect,
                        stacks: (effect.stacks || 1) * multiplier,
                    }))
                    .filter((effect) => effect.stacks !== 0);

                return {
                    ...acc,
                    area: area + (bonus.area || 0),
                    damage: damage + bonusDamage,
                    secondaryDamage: secondaryDamage && secondaryDamage + bonusDamage,
                    healing: healing + (bonus.healing || 0) * multiplier,
                    armor: armor + (bonus.armor || 0) * multiplier,
                    destroyArmor: (bonus.destroyArmor || 0) + (acc.destroyArmor || 0),
                    effects: [...effects, ...totalBonusEffects],
                    resources: resources + (bonus.resources || 0),
                    drawCards: drawCardsObj,
                    chance: chance + (bonus.bonusChance || 0),
                } as Action;
            }
            return acc;
        },
        { ...action }
    );
};

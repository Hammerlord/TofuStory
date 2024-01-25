import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { calculateDamage, getEnabledEffects, getMultiplier, getSkillBonusDamage } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { CrossedSwordsIcon } from "../../images/icons";
import { Action, ACTION_TYPES, CONDITION_TARGETS, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../types";
import { passesConditions } from "../../battle/passesConditions";

const calculateMultiplierFromActions = ({ ability, player, deck, hand, discard }): { damage: number; secondaryDamage: number } => {
    return ability.actions.reduce(
        (acc, action: Action) => {
            if (action.target === TARGET_TYPES.HOSTILE || action.target === TARGET_TYPES.RANDOM_HOSTILE) {
                const multiplier = getMultiplier({
                    actor: { combatant: player, index: undefined },
                    multiplier: action.multiplier,
                    deck,
                    hand,
                    discard,
                });

                const damageProps = {
                    actor: player,
                    action,
                    actionParent: ability,
                    multiplier,
                };
                acc.damage += player ? calculateDamage(damageProps) : action.damage || 0;
                acc.secondaryDamage += player
                    ? calculateDamage({ ...damageProps, targetIndex: 1, selectedIndex: 2 })
                    : action.secondaryDamage || 0;
            }
            return acc;
        },
        {
            damage: 0,
            secondaryDamage: 0,
        }
    );
};

export const getDamageStatistics = ({
    ability,
    player,
    deck,
    hand,
    discard,
}): {
    baseDamage: number;
    secondaryDamage: number;
    primaryTotalDamage: number;
    secondaryTotalDamage: number;
    hasMultiplier: boolean;
    damageBonusFromEffects: number;
    damageBonusFromConditions: number;
} => {
    const { actions = [] } = ability;
    const attackActions = actions.filter((action) => action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK);
    if (attackActions.length === 0) {
        return {
            baseDamage: 0,
            secondaryDamage: 0,
            primaryTotalDamage: 0,
            secondaryTotalDamage: 0,
            hasMultiplier: false,
            damageBonusFromEffects: 0,
            damageBonusFromConditions: 0,
        };
    }
    const damageBonusFromEffects =
        getEnabledEffects({ combatant: player }).reduce((acc, { attackPower = 0, skillBonus }) => {
            return acc + attackPower + getSkillBonusDamage({ ability, skillBonus });
        }, 0) || 0;
    const getCalculationTarget = (calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES) => {
        if (calculationTarget === CONDITION_TARGETS.ACTOR || calculationTarget === TRIGGER_TARGET_TYPES.EFFECT_OWNER) {
            return { combatant: player };
        }

        if (calculationTarget === CONDITION_TARGETS.TRIGGER_SOURCE) {
            return ability;
        }
    };
    const damageBonusFromConditionsArr: number[] = ability.actions.map((action) => {
        if (action.bonus?.damage && passesConditions({ getCalculationTarget, proc: action.bonus })) {
            return action.bonus.damage;
        }
        return 0;
    });

    const damageBonusFromConditions: number = damageBonusFromConditionsArr.reduce((a: number, c: number) => a + c, 0);
    const { damage: primaryWithMultiplier, secondaryDamage: secondaryWithMultiplier } = calculateMultiplierFromActions({
        ability,
        player,
        deck,
        hand,
        discard,
    });
    const primaryTotalDamage = primaryWithMultiplier + damageBonusFromEffects + damageBonusFromConditions;
    const hasAttackMultiplier = attackActions.some((action) => action.multiplier);
    const damageActions: number[] = attackActions.filter(({ damage }) => damage).map(({ damage }) => damage);
    // All actions need to do the same damage to be considered a multiplier
    const isMultiHit = damageActions.length > 1 && damageActions.every((a) => a === damageActions[0]);

    const baseDamage = (damageActions[0] || 0) + damageBonusFromEffects + (damageBonusFromConditionsArr[0] || 0);

    const secondaryDamageActions = attackActions
        .filter(({ secondaryDamage }) => secondaryDamage)
        .map(({ secondaryDamage }) => secondaryDamage);
    const secondaryDamage = (secondaryDamageActions[0] || 0) + damageBonusFromEffects + (damageBonusFromConditionsArr[0] || 0);

    const secondaryTotalDamage = secondaryWithMultiplier + damageBonusFromEffects + damageBonusFromConditions;

    return {
        baseDamage,
        secondaryDamage,
        primaryTotalDamage,
        secondaryTotalDamage,
        hasMultiplier: hasAttackMultiplier || isMultiHit,
        damageBonusFromEffects,
        damageBonusFromConditions,
    };
};

const useStyles = createUseStyles({
    highlightText: {
        "& .text": {
            color: "#42f57b",
        },
    },
});

/**
 * The damage icon that displays on the top left of an ability card
 */
const DamageIcon = ({ ability, player, deck, hand, discard }) => {
    const { actions } = ability;
    const {
        baseDamage,
        primaryTotalDamage: primaryTargetTotalDamage,
        hasMultiplier,
        damageBonusFromEffects,
        damageBonusFromConditions,
    } = getDamageStatistics({
        ability,
        player,
        deck,
        hand,
        discard,
    });
    const classes = useStyles();

    if (!primaryTargetTotalDamage) {
        return null;
    }

    const hasBonusDamage = actions.find(({ bonus }) => {
        if (Array.isArray(bonus)) {
            return bonus.some((b) => b?.damage > 0);
        }

        return bonus?.damage > 0;
    });
    const hasUnfulfilledBonus = hasBonusDamage && !damageBonusFromConditions;
    const isAdditive = hasUnfulfilledBonus || actions.some(({ secondaryDamage }) => secondaryDamage > 0);

    return (
        <Icon
            icon={<CrossedSwordsIcon />}
            text={`${baseDamage}${hasMultiplier ? "x" : ""}${isAdditive ? "+" : ""}`}
            className={classNames({
                [classes.highlightText]: damageBonusFromEffects > 0 || damageBonusFromConditions > 0,
            })}
        />
    );
};

export default DamageIcon;

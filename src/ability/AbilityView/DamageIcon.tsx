import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { calculateDamage, getEnabledEffects, getMultiplier } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { CrossedSwordsIcon } from "../../images/icons";
import { Action, ACTION_TYPES, CONDITION_TARGETS, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../types";
import { passesConditions } from "../../battle/passesConditions";

export const getDamageStatistics = ({
    ability,
    player,
}): { baseDamage: number; totalDamage: number; hasMultiplier: boolean; damageBonusFromEffects: number; damageBonusFromConditions } => {
    const { actions = [] } = ability;
    const attackActions = actions.filter((action) => action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK);
    if (attackActions.length === 0) {
        return {
            baseDamage: 0,
            totalDamage: 0,
            hasMultiplier: false,
            damageBonusFromEffects: 0,
            damageBonusFromConditions: 0,
        };
    }
    const damageBonusFromEffects = getEnabledEffects({ combatant: player }).reduce((acc, { attackPower = 0 }) => acc + attackPower, 0) || 0;
    const getCalculationTarget = (calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES) => {
        if (calculationTarget === CONDITION_TARGETS.ACTOR || calculationTarget === TRIGGER_TARGET_TYPES.EFFECT_OWNER) {
            return { combatant: player };
        }

        if (calculationTarget === CONDITION_TARGETS.TRIGGER_SOURCE) {
            return ability;
        }
    };
    const damageBonusFromConditions = ability.actions.reduce((acc, cur) => {
        if (cur.bonus?.damage && passesConditions({ getCalculationTarget, proc: cur.bonus })) {
            return acc + cur.bonus.damage;
        }
        return acc;
    }, 0);
    const totalDamage =
        actions.reduce((acc, action: Action) => {
            if (action.target === TARGET_TYPES.HOSTILE || action.target === TARGET_TYPES.RANDOM_HOSTILE) {
                const multiplier = getMultiplier({ actor: { combatant: player, index: undefined } });
                acc += player ? calculateDamage({ actor: player, action, actionParent: ability, multiplier }) : action.damage || 0;
            }
            return acc;
        }, 0) +
        damageBonusFromEffects +
        damageBonusFromConditions;
    const hasAttackMultiplier = attackActions.some((action) => action.multiplier);
    const damageActions = attackActions.map(({ damage }) => damage).filter((d: number) => d);
    const baseDamage = damageActions[0] || 0; // First result
    return {
        baseDamage,
        totalDamage,
        hasMultiplier: damageActions.length > 1 || hasAttackMultiplier,
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

const DamageIcon = ({ ability, player }) => {
    const { actions } = ability;
    const { baseDamage, totalDamage, hasMultiplier, damageBonusFromEffects, damageBonusFromConditions } = getDamageStatistics({
        ability,
        player,
    });
    const classes = useStyles();

    if (!totalDamage) {
        return null;
    }

    const isAdditive = actions.find(({ bonus }) => bonus?.damage > 0) || actions.some(({ secondaryDamage }) => secondaryDamage > 0);

    return (
        <Icon
            icon={<CrossedSwordsIcon />}
            text={`${baseDamage}${hasMultiplier ? "x" : ""}${!damageBonusFromConditions && isAdditive ? "+" : ""}`}
            className={classNames({
                [classes.highlightText]: damageBonusFromEffects > 0 || damageBonusFromConditions > 0,
            })}
        />
    );
};

export default DamageIcon;

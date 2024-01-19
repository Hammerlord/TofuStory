import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { calculateDamage, getEnabledEffects, getMultiplier } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { CrossedSwordsIcon } from "../../images/icons";
import { Action, ACTION_TYPES, TARGET_TYPES } from "../types";

export const getDamageStatistics = ({
    ability,
    player,
}): { baseDamage: number; totalDamage: number; hasMultiplier: boolean; damageBonusFromEffects: number } => {
    const { actions = [] } = ability;
    const attackActions = actions.filter((action) => action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK);
    if (attackActions.length === 0) {
        return {
            baseDamage: 0,
            totalDamage: 0,
            hasMultiplier: false,
            damageBonusFromEffects: 0,
        };
    }
    const damageBonusFromEffects = getEnabledEffects({ combatant: player }).reduce((acc, { attackPower = 0 }) => acc + attackPower, 0) || 0;
    const totalDamage =
        actions.reduce((acc, action: Action) => {
            if (action.target === TARGET_TYPES.HOSTILE || action.target === TARGET_TYPES.RANDOM_HOSTILE) {
                const multiplier = getMultiplier({ actor: { combatant: player, index: undefined } });
                acc += player ? calculateDamage({ actor: player, action, actionParent: ability, multiplier }) : action.damage || 0;
            }
            return acc;
        }, 0) + damageBonusFromEffects;
    const hasAttackMultiplier = attackActions.some((action) => action.multiplier);
    const baseDamage = Math.floor(totalDamage / (attackActions.length || 1));
    return {
        baseDamage,
        totalDamage,
        hasMultiplier: attackActions.length > 1 || hasAttackMultiplier,
        damageBonusFromEffects,
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
    const { baseDamage, totalDamage, hasMultiplier, damageBonusFromEffects } = getDamageStatistics({ ability, player });
    const classes = useStyles();

    if (!totalDamage) {
        return null;
    }

    const isAdditive = actions.find(({ bonus }) => bonus?.damage > 0) || actions.some(({ secondaryDamage }) => secondaryDamage > 0);

    return (
        <Icon
            icon={<CrossedSwordsIcon />}
            text={`${baseDamage}${hasMultiplier ? "x" : ""}${isAdditive ? "+" : ""}`}
            className={classNames({
                [classes.highlightText]: damageBonusFromEffects > 0,
            })}
        />
    );
};

export default DamageIcon;

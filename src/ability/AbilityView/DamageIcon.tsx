import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { calculateDamage } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { CrossedSwords } from "../../images";
import { Action, ACTION_TYPES, TARGET_TYPES } from "../types";

export const getDamageStatistics = ({
    ability,
    player,
}): { baseDamage: number; totalDamage: number; numActionsWithDamage: number; damageBonusFromEffects: number } => {
    const { actions = [] } = ability;
    const totalDamage = actions.reduce((acc, action: Action) => {
        if (action.target === TARGET_TYPES.HOSTILE || action.target === TARGET_TYPES.RANDOM_HOSTILE) {
            acc += player ? calculateDamage({ actor: player, action }) : action.damage || 0;
        }
        return acc;
    }, 0);
    const numActionsWithDamage = actions.filter(
        (action) => action.type === ACTION_TYPES.ATTACK || (action.type === ACTION_TYPES.RANGE_ATTACK && action.damage)
    ).length;
    const baseDamage = Math.floor(totalDamage / (numActionsWithDamage || 1));
    const damageBonusFromEffects = player?.effects.reduce((acc, { damage = 0 }) => acc + damage, 0) || 0;
    return {
        baseDamage,
        totalDamage,
        numActionsWithDamage,
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
    const { baseDamage, totalDamage, numActionsWithDamage, damageBonusFromEffects } = getDamageStatistics({ ability, player });
    const classes = useStyles();

    if (!totalDamage) {
        return null;
    }

    const hasMultiplier = numActionsWithDamage > 1;
    const isAdditive = actions.find(({ bonus }) => bonus?.damage > 0) || actions.some(({ secondaryDamage }) => secondaryDamage > 0);

    return (
        <Icon
            icon={<CrossedSwords />}
            text={`${baseDamage}${hasMultiplier ? "x" : ""}${isAdditive ? "+" : ""}`}
            className={classNames({
                [classes.highlightText]: damageBonusFromEffects > 0,
            })}
        />
    );
};

export default DamageIcon;

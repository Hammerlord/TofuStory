import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { calculateBonus, calculateDamage, getMultiplier } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { CrossedSwordsIcon } from "../../images/icons";
import { ACTION_TYPES, Action } from "../types";

export const getDamageStatistics = ({
    ability,
    player,
    deck,
    hand,
    discard,
}): {
    baseDamage: number;
    secondaryDamage: number;
    hasMultiplier: boolean;
    hasBonus: boolean;
    hasConditionFulfilled: boolean;
    isAdditive: boolean;
} => {
    const { actions = [] } = ability;
    const attackActions = actions.filter((action) => action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK);
    if (attackActions.length === 0) {
        return {
            baseDamage: 0,
            secondaryDamage: undefined,
            hasMultiplier: false,
            hasBonus: false,
            hasConditionFulfilled: false,
            isAdditive: false,
        };
    }

    // With bonus damage applied
    const withBonus = attackActions.map((action) => {
        return calculateBonus({
            action,
            actor: { combatant: player },
            allTargets: [],
            isTargetSelected: false,
            actionParent: ability,
            deck,
            hand,
            discard,
        });
    });

    const withAttackPower = withBonus.map((action: Action) => {
        const multiplier = getMultiplier({
            actor: { combatant: player },
            multiplier: action.multiplier,
            deck,
            hand,
            discard,
        });

        const damageProps = {
            actor: { combatant: player },
            action,
            actionParent: ability,
            multiplier,
        };
        let secondaryDamage = action.secondaryDamage || 0;
        if (player && secondaryDamage) {
            secondaryDamage = calculateDamage({ ...damageProps, targetIndex: 1, selectedIndex: 2 });
        }
        return {
            damage: player ? calculateDamage(damageProps) : action.damage || 0,
            secondaryDamage,
        };
    });
    const hasAttackMultiplier = attackActions.some((action) => action.multiplier);
    // All actions need to do the same damage to be considered a multiplier
    const isMultiHit = withAttackPower.length > 1 && withAttackPower.every(({ damage }) => damage === withAttackPower[0].damage);
    const hasUnfulfilledBonus = withBonus[0].damage === attackActions[0].damage && attackActions.some(({ bonus }) => bonus);
    const isAdditive = withAttackPower.some(({ secondaryDamage }) => secondaryDamage > 0) || hasUnfulfilledBonus;

    return {
        baseDamage: withAttackPower[0].damage,
        secondaryDamage: withAttackPower[0].secondaryDamage,
        hasMultiplier: hasAttackMultiplier || isMultiHit,
        hasConditionFulfilled: withBonus[0].damage > attackActions[0].damage,
        hasBonus: withAttackPower[0].damage > attackActions[0].damage,
        isAdditive,
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
    const { baseDamage, hasMultiplier, isAdditive, hasBonus } = getDamageStatistics({
        ability,
        player,
        deck,
        hand,
        discard,
    });
    const classes = useStyles();

    if (!baseDamage) {
        return null;
    }

    return (
        <Icon
            icon={<CrossedSwordsIcon />}
            text={`${baseDamage}${hasMultiplier ? "x" : ""}${isAdditive ? "+" : ""}`}
            className={classNames({
                [classes.highlightText]: hasBonus,
            })}
        />
    );
};

export default DamageIcon;

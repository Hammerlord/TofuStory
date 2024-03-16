import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { calculateBonus, calculateDamage, getMultiplier } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { CrossedSwordsIcon } from "../../images/icons";
import { ACTION_TYPES, Ability, Action, TARGET_TYPES } from "../types";
import { useAppSelector } from "../../hooks";
import { findCombatantData } from "../../battle/actions/actions";
import { CombatantInfo } from "../../battle/types";

export const getDamageStatistics = ({
    ability,
    playerInfo,
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
    const damageActions = actions.filter(
        (action) => action.damage !== undefined || action.target === TARGET_TYPES.HOSTILE || action.target === TARGET_TYPES.RANDOM_HOSTILE
    );
    if (damageActions.length === 0) {
        return {
            baseDamage: undefined,
            secondaryDamage: undefined,
            hasMultiplier: false,
            hasBonus: false,
            hasConditionFulfilled: false,
            isAdditive: false,
        };
    }

    // With bonus damage applied
    const withBonus = damageActions.map((action) => {
        return calculateBonus({
            action,
            actor: playerInfo,
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
            actor: playerInfo,
            multiplier: action.multiplier,
            deck,
            hand,
            discard,
        });

        const damageProps = {
            actor: playerInfo,
            action,
            actionParent: ability,
            multiplier,
        };
        let secondaryDamage = action.secondaryDamage || 0;
        if (playerInfo?.combatant && secondaryDamage) {
            secondaryDamage = calculateDamage({ ...damageProps, targetIndex: 1, selectedIndex: 2 });
        }
        return {
            damage: playerInfo?.combatant ? calculateDamage(damageProps) : action.damage || 0,
            secondaryDamage,
        };
    });

    // This is the potential to have a multiplier; false when a bonus is being applied
    const hasAttackMultiplier = damageActions.some((action) => action.multiplier) && damageActions[0].damage === withAttackPower[0].damage;
    // All actions need to do the same damage to be considered a multiplier
    const isMultiHit = withAttackPower.length > 1 && withAttackPower.every(({ damage }) => damage === withAttackPower[0].damage);
    const hasUnfulfilledBonus = withBonus[0].damage === damageActions[0].damage && damageActions.some(({ bonus }) => bonus);
    const hasAdditiveDamage = withAttackPower.some(({ secondaryDamage, damage }) => {
        return secondaryDamage > 0 || (damage && damage !== withAttackPower[0].damage);
    });
    const isAdditive = hasAdditiveDamage || hasUnfulfilledBonus;

    return {
        baseDamage: withAttackPower[0].damage,
        secondaryDamage: withAttackPower[0].secondaryDamage,
        hasMultiplier: hasAttackMultiplier || isMultiHit,
        hasConditionFulfilled: withBonus[0].damage > damageActions[0].damage,
        hasBonus: withAttackPower[0].damage > damageActions[0].damage,
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
const DamageIcon = ({
    ability,
    playerInfo,
    deck,
    hand,
    discard,
}: {
    ability: Ability;
    playerInfo: CombatantInfo;
    deck: Ability[];
    hand: Ability[];
    discard: Ability[];
}) => {
    const { baseDamage, hasMultiplier, isAdditive, hasBonus } = getDamageStatistics({
        ability,
        playerInfo,
        deck,
        hand,
        discard,
    });
    const classes = useStyles();

    if (baseDamage === undefined) {
        return;
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

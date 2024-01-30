import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { passesConditions } from "../../battle/passesConditions";
import { getEnabledEffects } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { ShieldIcon } from "../../images/icons";
import { CONDITION_TARGETS, TRIGGER_TARGET_TYPES } from "../types";

export const getArmorStatistics = ({
    ability,
    player,
}): { base: number; total: number; hasMultiplier: boolean; bonusFromEffects: number; bonusFromConditions } => {
    const { actions = [] } = ability;
    const armorActions = actions.filter((action) => action.armor > 0).map(({ armor }) => armor);
    if (armorActions.length === 0) {
        return {
            base: 0,
            total: 0,
            hasMultiplier: false,
            bonusFromEffects: 0,
            bonusFromConditions: 0,
        };
    }
    const bonusFromEffects =
        getEnabledEffects({ combatant: player }).reduce((acc, { armorReceived = 0 }) => {
            return acc + armorReceived;
        }, 0) || 0;
    const getCalculationTarget = (calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES) => {
        if (calculationTarget === CONDITION_TARGETS.ACTOR || calculationTarget === TRIGGER_TARGET_TYPES.EFFECT_OWNER) {
            return { combatant: player };
        }

        if (calculationTarget === CONDITION_TARGETS.TRIGGER_SOURCE) {
            return ability;
        }
    };
    const bonusFromConditionsArr: number[] = ability.actions.map((action) => {
        if (action.bonus?.armor && passesConditions({ getCalculationTarget, proc: action.bonus })) {
            return action.bonus.armor;
        }
        return 0;
    });

    const bonusFromConditions: number = bonusFromConditionsArr.reduce((a: number, c: number) => a + c, 0);
    const total = armorActions.reduce((acc: number, cur: number) => acc + cur, 0) + bonusFromEffects + bonusFromConditions;
    const base = armorActions[0] + bonusFromEffects + (bonusFromConditionsArr[0] || 0);
    return {
        base: base,
        total: total,
        hasMultiplier: armorActions.length > 1,
        bonusFromEffects: bonusFromEffects,
        bonusFromConditions: bonusFromConditions,
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
 * The armor icon that displays on the top left of an ability card
 */
const ArmorIcon = ({ ability, player }) => {
    const { actions } = ability;
    const { base, total, hasMultiplier, bonusFromEffects, bonusFromConditions } = getArmorStatistics({
        ability,
        player,
    });
    const classes = useStyles();

    if (!total) {
        return null;
    }

    const hasUnfulfilledBonus = actions.find(({ bonus }) => bonus?.armor > 0) && !bonusFromConditions;
    const isAdditive = hasUnfulfilledBonus;

    return (
        <Icon
            icon={<ShieldIcon />}
            text={`${base}${hasMultiplier ? "x" : ""}${isAdditive ? "+" : ""}`}
            className={classNames({
                [classes.highlightText]: bonusFromEffects > 0 || bonusFromConditions > 0,
            })}
        />
    );
};

export default ArmorIcon;

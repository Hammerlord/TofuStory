import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { passesConditions } from "../../battle/passesConditions";
import { calculateArmor, calculateBonus, getEnabledEffects, getMultiplier } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { ShieldIcon } from "../../images/icons";
import { Action, ActionOptionalProperties, CONDITION_TARGETS, CombatAbility, TRIGGER_TARGET_TYPES } from "../types";
import { CombatantInfo } from "../../battle/types";

export const getArmorStatistics = ({
    ability,
    playerInfo,
    deck,
    hand,
    discard,
}: {
    ability: CombatAbility;
    playerInfo: CombatantInfo;
    deck: CombatAbility[];
    hand: CombatAbility[];
    discard: CombatAbility[];
}): {
    base: number;
    hasMultiplier: boolean;
    hasConditionFulfilled: boolean;
    hasBonus: boolean;
    hasPenalty: boolean;
    isAdditive: boolean;
} => {
    const { actions = [] } = ability;
    const armorActions = actions.filter((action) => action.armor > 0 || action.secondaryAction?.armor > 0);
    if (armorActions.length === 0) {
        return {
            base: 0,
            hasMultiplier: false,
            hasBonus: false,
            hasConditionFulfilled: false,
            isAdditive: false,
            hasPenalty: false,
        };
    }

    const withBonus = armorActions.map((action) => {
        return {
            ...calculateBonus({
                action,
                actor: playerInfo,
                target: playerInfo, // Fix me: This is only if the ability targets SELF
                allTargets: [playerInfo],
                isTargetSelected: false,
                actionParent: ability,
                deck,
                hand,
                discard,
            }),
            secondaryAction:
                action.secondaryAction &&
                calculateBonus({
                    action: action.secondaryAction,
                    actor: playerInfo,
                    target: playerInfo,
                    allTargets: [playerInfo],
                    isTargetSelected: false,
                    actionParent: ability,
                    deck,
                    hand,
                    discard,
                }),
        };
    });

    const withArmorReceived = withBonus.map((action) => {
        const multiplier = getMultiplier({
            actor: playerInfo,
            multiplier: action.multiplier,
            deck,
            hand,
            discard,
        });

        const secondaryAction = action.secondaryAction || {};

        return {
            ...action,
            armor: calculateArmor({ target: playerInfo, action, multiplier }),
            secondaryAction: secondaryAction && {
                ...secondaryAction,
                armor: calculateArmor({ target: playerInfo, action: secondaryAction, multiplier }),
            },
        };
    });

    // Just taking the first one apparently because we don't have more than one armor action
    const withArmorReceivedArmor = withArmorReceived[0].armor || withArmorReceived[0].secondaryAction?.armor;
    const armorActionsArmor = armorActions[0].armor || armorActions[0].secondaryAction?.armor;

    // This is not accurate because of secondaryAction being baked into withArmorReceivedArmor/armorActionsArmor but not the bonus check
    const hasUnfulfilledBonus = withArmorReceivedArmor === armorActionsArmor && armorActions.some(({ bonus }) => bonus);
    const withBonusArmor = withBonus[0].armor || withBonus[0].secondaryAction?.armor;

    // This is the potential to have a multiplier; false when a bonus is being applied
    const hasMultiplier = armorActions.some((action) => action.multiplier) && armorActionsArmor === withArmorReceivedArmor;
    const hasAdditiveArmor = withArmorReceived.some(({ armor }) => {
        return armor && armor !== withArmorReceivedArmor;
    });
    const isAdditive = hasAdditiveArmor || hasUnfulfilledBonus;

    return {
        base: withArmorReceivedArmor,
        hasMultiplier,
        hasConditionFulfilled: withBonusArmor > armorActionsArmor,
        hasBonus: withArmorReceivedArmor > armorActionsArmor,
        hasPenalty: withArmorReceivedArmor < armorActionsArmor,
        isAdditive,
    };
};

const useStyles = createUseStyles({
    highlightText: {
        "& .text": {
            color: "#42f57b",
        },
    },
    negative: {
        "& .text": {
            color: "#ff9b94",
        },
    },
});

/**
 * The armor icon that displays on the top left of an ability card
 */
const ArmorIcon = ({ armorStatistics }) => {
    const { base, hasMultiplier, isAdditive, hasBonus, hasPenalty } = armorStatistics;
    const classes = useStyles();

    if (!base) {
        return null;
    }

    return (
        <Icon
            icon={<ShieldIcon />}
            text={`${base}${hasMultiplier ? "x" : ""}${isAdditive ? "+" : ""}`}
            className={classNames({
                [classes.highlightText]: hasBonus,
                [classes.negative]: hasPenalty,
            })}
        />
    );
};

export default ArmorIcon;

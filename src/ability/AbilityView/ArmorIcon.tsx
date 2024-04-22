import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { CombatantInfo } from "../../battle/types";
import { calculateArmor, calculateBonus, getMultiplier } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { ShieldIcon } from "../../images/icons";
import { CombatAbility } from "../types";

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
    const { actions: primaryActions = [] } = ability;

    const calcArmorFromActions = (actions = []) => {
        const armorActions = actions.filter((action) => action?.armor > 0);
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

            return {
                ...action,
                armor: calculateArmor({ target: playerInfo, action, multiplier }),
            };
        });

        // Just taking the first one apparently because we don't have more than one armor action in an ability
        const withArmorReceivedArmor = withArmorReceived[0].armor;
        const armorActionsArmor = armorActions[0].armor;

        // This is not accurate because of secondaryAction being baked into withArmorReceivedArmor/armorActionsArmor but not the bonus check
        const hasUnfulfilledBonus = withArmorReceivedArmor === armorActionsArmor && armorActions.some(({ bonus }) => bonus);
        const withBonusArmor = withBonus[0].armor;

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

    const primaryArmor = calcArmorFromActions(primaryActions);
    const secondaryArmor = calcArmorFromActions(primaryActions.map((action) => action.secondaryAction));
    if (primaryArmor.base) {
        return primaryArmor;
    }

    return secondaryArmor;
};

const useStyles = createUseStyles({
    armorIconRoot: {
        filter: "drop-shadow(0 0 1px black)",
    },
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
            className={classNames(classes.armorIconRoot, {
                [classes.highlightText]: hasBonus,
                [classes.negative]: hasPenalty,
            })}
        />
    );
};

export default ArmorIcon;

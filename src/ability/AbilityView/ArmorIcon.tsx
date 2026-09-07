import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { calculateArmor } from "../../battle/calculateArmor";
import { calculateBonus } from "../../battle/calculateBonus";
import { getMultiplier } from "../../battle/getMultiplier";
import { BattleState } from "../../battle/types";
import { ActionContext, NonCombatCharacterInfo, TRIGGER_SOURCE_TYPES } from "../../battle/types";
import Icon from "../../icon/Icon";
import { ShieldIcon } from "../../images/icons";
import { Action, CombatAbility } from "../types";

export interface ArmorStats {
    base: number;
    hasMultiplier: boolean;
    hasConditionFulfilled: boolean;
    hasBonus: boolean;
    hasPenalty: boolean;
    isAdditive: boolean;
}

export const getArmorStatistics = ({
    ability,
    playerInfo,
    deck = [],
    hand = [],
    discard = [],
    battle,
}: {
    ability: CombatAbility;
    playerInfo?: NonCombatCharacterInfo;
    deck?: CombatAbility[];
    hand?: CombatAbility[];
    discard?: CombatAbility[];
    battle?: BattleState | null;
}): ArmorStats => {
    const { actions: primaryActions = [] } = ability;

    const calcArmorFromActions = (actions: (Action | undefined)[] = []) => {
        const armorActions: Action[] = actions.filter((action): action is Action => (action?.armor || 0) > 0);
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

        const source = { source: ability, type: TRIGGER_SOURCE_TYPES.ABILITY };
        const context: ActionContext = {
            name: "Armor View",
            sourceChain: [source],
        };

        const props = {
            actor: playerInfo,
            target: playerInfo, // Fix me: This is only if the ability targets SELF
            allTargets: playerInfo ? [playerInfo] : [],
            deck,
            hand,
            discard,
            battle,
            context,
        };
        const withBonus = armorActions.map((action) => {
            return {
                ...calculateBonus({
                    action,
                    ...props,
                    isTargetSelected: false,
                    actionParent: ability,
                }),
            };
        });

        const withArmorReceived = withBonus.map((action) => {
            const multiplier = getMultiplier({
                ...props,
                actor: playerInfo,
                multiplier: action.multiplier,
            });

            return {
                ...action,
                armor: calculateArmor({
                    target: playerInfo,
                    action,
                    multiplier,
                    context,
                    battle,
                }),
            };
        });

        // Just taking the first one apparently because we don't have more than one armor action in an ability
        const withArmorReceivedArmor = withArmorReceived[0].armor;
        const armorActionsArmor = armorActions[0].armor || 0;

        // This is not accurate because of secondaryAction being baked into withArmorReceivedArmor/armorActionsArmor but not the bonus check
        const hasUnfulfilledBonus = withArmorReceivedArmor === armorActionsArmor && armorActions.some(({ bonus }) => bonus);
        const withBonusArmor = withBonus[0].armor || 0;

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
const ArmorIcon = ({ armorStatistics, highlightText }: { armorStatistics: ArmorStats; highlightText?: boolean }) => {
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
                [classes.highlightText]: hasBonus || highlightText,
                [classes.negative]: hasPenalty,
            })}
        />
    );
};

export default ArmorIcon;

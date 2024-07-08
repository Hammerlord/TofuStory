import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Fury, Mana } from "../../resource/ResourcesView";
import { Ability, AbilityEffect, CombatAbility } from "../types";
import { PLAYER_CLASSES } from "../../Menu/types";
import { Player } from "../../character/types";
import { useEffect, useRef, useState } from "react";
import { playExpandContractAnimation } from "../../character/animations";

const useStyles = createUseStyles({
    bonus: {
        "& .text": {
            color: "#42f57b",
        },
    },
    penalty: {
        "& .text": {
            color: "#ff9b94",
        },
    },
    cannotUse: {
        "& .text": {
            color: "#ff7373",
        },
    },
    placeholder: {
        width: 24,
    },
});

/**
 * Resource (Fury, Mana, etc.) cost icon that shows on the top right of a card.
 */
const AbilityResourceIcon = ({
    ability,
    player,
    disableBattleIndicators,
}: {
    ability: Ability | CombatAbility;
    player: Player;
    disableBattleIndicators?: boolean;
}) => {
    const classes = useStyles();
    const ref = useRef();
    const [isInitialized, setIsInitialized] = useState(false);

    // @ts-ignore - effects does not exist on Ability but we are setting a default here in that case
    const { resourceCost = 0, effects = [], hideResourceCostIcon } = ability;

    const resourceCostFromEffects = effects.reduce((acc, e: AbilityEffect) => {
        return acc + (e.resourceCost || 0);
    }, 0);
    const playerResources = typeof player?.resources === "number" ? player?.resources : Infinity;
    const totalResourceCost = resourceCost === "x" ? "X" : Math.max(0, resourceCost + resourceCostFromEffects);

    useEffect(() => {
        if (!isInitialized) {
            setIsInitialized(true);
            return;
        }

        if (!ref.current) {
            return;
        }

        const animation = playExpandContractAnimation({ object: ref.current });
        return () => {
            if (animation?.cancel) {
                animation.cancel();
            }
        };
    }, [totalResourceCost]);

    if (hideResourceCostIcon) {
        // Retain the dimensions
        return <div className={classes.placeholder} />;
    }

    const Icon =
        {
            [PLAYER_CLASSES.WARRIOR]: Fury,
            [PLAYER_CLASSES.MAGICIAN]: Mana,
        }[player?.class] || Fury;

    let className;
    if (!disableBattleIndicators) {
        className = {
            [classes.bonus]: resourceCostFromEffects < 0,
            [classes.penalty]: resourceCostFromEffects > 0,
            [classes.cannotUse]: totalResourceCost === "X" ? playerResources > 0 : totalResourceCost > playerResources,
        };
    }
    return <Icon text={totalResourceCost} className={classNames(className)} ref={ref} />;
};

export const ResourceIcon = ({
    text,
    playerClass,
    size,
    className,
}: {
    text?: string | number;
    playerClass: PLAYER_CLASSES;
    size?: "xl" | "lg" | "md" | "sm";
    className?: string;
}) => {
    const Icon =
        {
            [PLAYER_CLASSES.WARRIOR]: Fury,
            [PLAYER_CLASSES.MAGICIAN]: Mana,
        }[playerClass] || Fury;
    return <Icon text={text} size={size} className={className} />;
};

export default AbilityResourceIcon;

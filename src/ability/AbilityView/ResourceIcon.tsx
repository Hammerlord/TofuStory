import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Fury, Mana } from "../../resource/ResourcesView";
import { Ability, AbilityEffect, CombatAbility } from "../types";
import { PLAYER_CLASSES } from "../../Menu/types";

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
});

const AbilityResourceIcon = ({ ability, playerClass }: { ability: Ability | CombatAbility; playerClass: PLAYER_CLASSES }) => {
    const classes = useStyles();
    // @ts-ignore - effects does not exist on Ability but we are setting a default here in that case
    const { resourceCost, effects = [] } = ability;

    const resourceCostFromEffects = effects.reduce((acc, e: AbilityEffect) => {
        return acc + (e.resourceCost || 0);
    }, 0);
    const totalResourceCost = resourceCost === "x" ? "X" : Math.max(0, resourceCost + resourceCostFromEffects);

    const Icon =
        {
            [PLAYER_CLASSES.WARRIOR]: Fury,
            [PLAYER_CLASSES.MAGICIAN]: Mana,
        }[playerClass] || Fury;
    return (
        <Icon
            text={totalResourceCost}
            className={classNames({
                [classes.bonus]: resourceCostFromEffects < 0,
                [classes.penalty]: resourceCostFromEffects > 0,
            })}
        />
    );
};

export const ResourceIcon = ({
    text,
    playerClass,
    size,
}: {
    text?: string | number;
    playerClass: PLAYER_CLASSES;
    size?: "xl" | "lg" | "md" | "sm";
}) => {
    const Icon =
        {
            [PLAYER_CLASSES.WARRIOR]: Fury,
            [PLAYER_CLASSES.MAGICIAN]: Mana,
        }[playerClass] || Fury;
    return <Icon text={text} size={size} />;
};

export default AbilityResourceIcon;

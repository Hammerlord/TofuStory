import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Fury, Mana } from "../../resource/ResourcesView";
import { Ability, HandAbility } from "../types";
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

const AbilityResourceIcon = ({ ability, playerClass }: { ability: Ability | HandAbility; playerClass: PLAYER_CLASSES }) => {
    // @ts-ignore - effects does not exist on Ability but we are setting a default here in that case
    const { resourceCost, effects = {} } = ability;
    const resourceCostFromEffect = effects.resourceCost || 0;
    const classes = useStyles();
    const totalResourceCost = resourceCost === "x" ? "X" : Math.max(0, resourceCost + resourceCostFromEffect);
    const Icon =
        {
            [PLAYER_CLASSES.WARRIOR]: Fury,
            [PLAYER_CLASSES.MAGICIAN]: Mana,
        }[playerClass] || Fury;
    return (
        <Icon
            text={totalResourceCost}
            className={classNames({
                [classes.bonus]: resourceCostFromEffect < 0,
                [classes.penalty]: resourceCostFromEffect > 0,
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

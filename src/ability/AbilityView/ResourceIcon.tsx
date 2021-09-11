import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Fury } from "../../resource/ResourcesView";
import { Ability, HandAbility } from "../types";

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

const ResourceIcon = ({ ability }: { ability: Ability | HandAbility }) => {
    // @ts-ignore - effects does not exist on Ability but we are setting a default here in that case
    const { resourceCost, effects = {} } = ability;
    const resourceCostFromEffect = effects.resourceCost || 0;
    const classes = useStyles();
    const totalResourceCost = Math.max(0, resourceCost + resourceCostFromEffect);
    return (
        <Fury
            text={totalResourceCost}
            className={classNames({
                [classes.bonus]: resourceCostFromEffect < 0,
                [classes.penalty]: resourceCostFromEffect > 0,
            })}
        />
    );
};

export default ResourceIcon;

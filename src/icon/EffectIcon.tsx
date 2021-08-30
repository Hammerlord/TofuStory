import { Tooltip } from "@material-ui/core";
import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Effect } from "../ability/types";

import { CrossedSwords, Fireworks, Heart, Shield } from "../images";
import { Fury } from "../resource/ResourcesView";
import Icon from "./Icon";

const useStyles = createUseStyles({
    tooltip: {
        display: "flex",
        fontSize: "0.8rem",
        padding: "8px",
        fontFamily: "Barlow",
        fontWeight: "500",
        lineHeight: "24px",
    },
    tooltipTitle: {
        fontSize: "1.1rem",
        marginBottom: "4px",
    },
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    iconContainer: {
        marginRight: "16px",
    },
});

const EffectIcon = ({ effect, isAura }: { effect: Effect; isAura?: boolean }) => {
    if (!effect) {
        return null;
    }

    const classes = useStyles();

    let name = effect.name;
    let icon: string | JSX.Element = effect.icon;
    const {
        thorns = 0,
        healthPerResourcesSpent = 0,
        healingPerTurn = 0,
        armorPerTurn = 0,
        type,
        damage,
    } = effect;
    if (isAura) {
        name = "Aura";
        icon = <Fireworks />;
    }

    if (!icon) {
        return null;
    }

    const tooltipContent = (
        <div className={classes.tooltip}>
            <div className={classNames(classes.iconContainer)}>
                <Icon icon={icon} size={"lg"} />
            </div>
            <div className={classes.container}>
                <div className={classes.tooltipTitle}>{name}</div>
                {isAura && <span>Grants effects to adjacent allies:</span>}
                {damage > 0 && (
                    <div>
                        <Icon icon={<CrossedSwords />} text={damage} /> base attack
                    </div>
                )}
                {armorPerTurn > 0 && (
                    <div>
                        <Icon icon={<Shield />} text={armorPerTurn} /> per turn
                    </div>
                )}
                {healingPerTurn > 0 && (
                    <div>
                        <Icon icon={<Heart />} text={healingPerTurn} /> per turn
                    </div>
                )}
                {healthPerResourcesSpent > 0 && (
                    <div>
                        <Icon icon={<Heart />} text={healthPerResourcesSpent} /> per <Fury /> spent
                    </div>
                )}
                {thorns > 0 && <div>Reflects 1 damage to attackers</div>}
                <div>{effect.description}</div>
                {effect.duration < Infinity && <span>{effect.duration} turns remaining</span>}
            </div>
        </div>
    );
    return (
        <Tooltip title={tooltipContent} arrow classes={{ tooltip: classes.tooltip }}>
            <span>
                <Icon icon={icon} text={effect.duration < Infinity && effect.duration} />
            </span>
        </Tooltip>
    );
};

export default EffectIcon;

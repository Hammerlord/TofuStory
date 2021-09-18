import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Effect } from "../ability/types";

import { CrossedSwords, Fireworks, Heart, Shield, SpeechBubble } from "../images";
import { Fury } from "../resource/ResourcesView";
import Tooltip from "../view/Tooltip";
import Icon from "./Icon";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        display: "inline-block",
    },
    tooltipContents: {
        display: "flex",
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
    disabled: {
        opacity: 0.7,
    },
    "@keyframes fade": {
        "0%": {
            opacity: 0,
        },
        "100%": {
            opacity: 0.8,
        },
    },
    silenced: {
        marginTop: 8,
        color: "#ff9b94",
    },
    silenceIcon: {
        animationName: "$fade",
        animationDuration: "1.5s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        position: "absolute",
        display: "inline-block",
        left: 0,
        top: 0,
    },
});

const EffectIcon = ({ effect, isAura, silence }: { effect: Effect; isAura?: boolean; silence?: boolean }) => {
    if (!effect) {
        return null;
    }

    const classes = useStyles();

    let name = effect.name;
    let icon: string | JSX.Element = effect.icon;
    const { thorns = 0, healthPerResourcesSpent = 0, healingPerTurn = 0, armorPerTurn = 0, type, damage, leech = 0 } = effect;
    if (isAura) {
        name = "Aura";
        icon = <Fireworks />;
    }

    if (!icon) {
        return null;
    }

    const isSilenced = (effect.canBeSilenced || isAura) && silence;

    const tooltipContent = (
        <div className={classes.tooltipContents}>
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
                {leech > 0 && <div>Leeching {leech * 100}% of damage as health (rounded up)</div>}
                {thorns > 0 && <div>Reflects 1 damage to attackers</div>}
                <div>{effect.description}</div>
                {effect.duration < Infinity && <span>{effect.duration} turns remaining</span>}
                {isSilenced && <div className={classes.silenced}>Silenced</div>}
            </div>
        </div>
    );
    return (
        <Tooltip title={tooltipContent}>
            <span className={classes.root}>
                <Icon
                    icon={icon}
                    text={effect.duration < Infinity && effect.duration}
                    className={classNames({
                        [classes.disabled]: isSilenced,
                    })}
                />
                {isSilenced && <Icon icon={<SpeechBubble />} className={classes.silenceIcon} />}
            </span>
        </Tooltip>
    );
};

export default EffectIcon;

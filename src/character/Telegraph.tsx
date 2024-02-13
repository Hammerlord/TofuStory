import Handlebars from "handlebars";
import { createUseStyles } from "react-jss";
import { getUseAbilityIndex } from "../battle/actions/enemyTurn";
import { useAppSelector } from "../hooks";
import Icon from "../icon/Icon";
import { HourglassIcon, ThoughtBubbleIcon, WarningIcon } from "../images/icons";
import Tooltip from "../view/Tooltip";
import { BATTLE_STATES } from "../battle/reducer";
import { isStunnedOrFrozen, isTurnActionPrevented } from "../battle/utils";
import classNames from "classnames";
import { CombatantInfo } from "../battle/types";

const useStyles = createUseStyles({
    "@keyframes fadeIn": {
        "0%": {
            opacity: 0,
        },
        "100%": {
            opacity: 1,
        },
    },
    root: {
        display: "inline-block",
        animationName: "$fadeIn",
        animationDuration: "0.5s",
        animationFillMode: "forwards",
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
    abilityIcon: {
        width: 30,
        filter: "drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)",
    },
    "@keyframes upAndDown": {
        from: {
            transform: "translateY(0px)",
        },
        to: {
            transform: "translateY(6px)",
        },
    },
    telepathContainer: {
        width: 75,
        height: 75,
        position: "relative",
        WebkitFilter: "drop-shadow(0 0 2px black)",
        filter: "drop-shadow(0 0 2px black)",
        margin: "auto",
        animationName: "$upAndDown",
        animationDuration: "2s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
    telepathIcon: {
        height: "100%",
        width: "100%",
        opacity: 0.4,
    },
    telepathInner: {
        position: "absolute",
        width: 30,
        height: 30,
        left: "50%",
        top: "40%",
        transform: "translateX(-50%) translateY(-50%)",
    },
    channelDuration: {
        bottom: -5,
        right: -5,
        position: "absolute",
        fontWeight: "bold",
        color: "white",
        filter: "drop-shadow(0 0 2px black)",
    },
    warningIcon: {
        left: -10,
        top: -10,
        position: "absolute",
    },
    desaturated: {
        filter: "saturate(0.4)",
    },
});

/**
 * Tells the player what this combatant wants to do next.
 */
const Telegraph = ({ combatantInfo }: { combatantInfo: CombatantInfo }) => {
    const classes = useStyles();
    const { battle } = useAppSelector((state) => state);
    const { combatant } = combatantInfo || {};

    if (!combatant || combatant.isPlayer || !battle.isPlayerTurn || isTurnActionPrevented(combatant)) {
        return null;
    }

    const { ability: castingAbility, channelDuration, castTime: castingCastTime } = combatant?.casting || {};
    const ability = castingAbility || combatant?.abilities[getUseAbilityIndex(combatantInfo)];

    if (!ability) {
        return null;
    }

    const { image, name, description = "", castTime, resourceCost } = ability;

    let imageNode;
    if (typeof image === "string") {
        imageNode = <img src={image} className={classes.abilityIcon} />;
    } else if (typeof image === "function") {
        const ImageNode = image as Function;
        imageNode = <ImageNode className={classes.abilityIcon} />;
    }

    const interpolatedDescription = Handlebars.compile(description)({ caster: combatant.name || "" });
    const abilityHasYetToCast = typeof castingCastTime === "undefined" && castTime;

    return (
        <div className={classes.root}>
            <Tooltip
                title={
                    <div className={classes.tooltipContents}>
                        <div className={classes.container}>
                            <div className={classes.tooltipTitle}>
                                <Icon icon={image} size="sm" /> {name}
                            </div>
                            <div>{interpolatedDescription}</div>
                            {abilityHasYetToCast && castTime > 0 && (
                                <div className={classes.container}>
                                    Activates after {castTime} turn
                                    {castTime > 1 && "s"}.
                                </div>
                            )}
                            {channelDuration > 1 && (
                                <div>
                                    Repeats for {channelDuration} turn{channelDuration > 1 && "s"}.
                                </div>
                            )}
                        </div>
                    </div>
                }
            >
                <div className={classes.telepathContainer}>
                    <ThoughtBubbleIcon className={classes.telepathIcon} />
                    <span className={classes.telepathInner}>
                        <span
                            className={classNames({
                                [classes.desaturated]: abilityHasYetToCast,
                            })}
                        >
                            {imageNode}
                        </span>
                        {!abilityHasYetToCast && resourceCost === combatant?.maxResources && (
                            <Icon icon={<WarningIcon />} size={"sm"} className={classes.warningIcon} />
                        )}
                        {channelDuration && <span className={classes.channelDuration}>{channelDuration}</span>}
                        {abilityHasYetToCast && (
                            <span>
                                <Icon icon={<HourglassIcon />} size="sm" />
                            </span>
                        )}
                    </span>
                </div>
            </Tooltip>
        </div>
    );
};

export default Telegraph;

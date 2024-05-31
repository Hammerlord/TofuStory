import classNames from "classnames";
import Handlebars from "handlebars";
import { createUseStyles } from "react-jss";
import { AreaIndicator } from "../ability/AbilityView/AreaView";
import { BLUE, GREEN, RED } from "../ability/AbilityView/constants";
import { isOffensiveAbility } from "../ability/AbilityView/utils";
import { ACTION_TYPES, Ability, TARGET_TYPES } from "../ability/types";
import { getUseAbilityIndex } from "../battle/actions/enemyTurn";
import { CombatantInfo } from "../battle/types";
import { isTurnActionPrevented } from "../battle/utils";
import { useAppSelector } from "../hooks";
import Icon from "../icon/Icon";
import { HourglassIcon, NoEntryIcon, ThoughtBubbleIcon, WarningIcon } from "../images/icons";
import Tooltip from "../view/Tooltip";

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
        maxHeight: 30,
        objectFit: "contain",
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
        filter: "saturate(0.1)",
    },
    cancelIcon: {
        left: -5,
        top: -5,
        position: "absolute",
    },
    disabled: {
        color: "#ff9b94",
    },
    diamond: {
        width: "7px",
        height: "7px",
        transform: "rotate(45deg)",
        display: "inline-block",
        margin: "0 6px",
    },
    offensive: {
        background: RED,
    },
    support: {
        background: BLUE,
    },
    minion: {
        background: GREEN,
    },
    subContainer: {
        display: "flex",
        justifyContent: "space-between",
        verticalAlign: "bottom",
        whiteSpace: "nowrap",
    },
    areaContainer: {
        display: "flex",
        justifyContent: "space-between",
        marginLeft: 32,
    },
    areaIndicator: {
        display: "flex",
        alignItems: "center",
        marginLeft: 8,
    },
    targetPortrait: {
        position: "relative",
        display: "inline-block",
    },
    targetCombatantIndex: {
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 2.5px black")
            .join(", "),
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: -5,
        fontWeight: "bold",
        color: "white",
    },
});

export const getNextTelegraphedAbility = (combatantInfo: CombatantInfo): Ability | null => {
    const { combatant } = combatantInfo || {};
    const { ability: castingAbility } = combatant?.casting || {};
    return castingAbility || combatant?.abilities?.[getUseAbilityIndex(combatantInfo)];
};

/**
 * Tells the player what this combatant wants to do next.
 */
const Telegraph = ({ combatantInfo }: { combatantInfo: CombatantInfo }) => {
    const classes = useStyles();
    const { battle } = useAppSelector((state) => state);
    const { combatant } = combatantInfo || {};

    if (!combatant || combatant.isPlayer || !battle.isPlayerTurn || combatant.uncontrollable) {
        return null;
    }

    const { channelDuration, castTime: castingCastTime } = combatant?.casting || {};
    const ability = combatant.targeting?.ability || getNextTelegraphedAbility(combatantInfo);

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
    const isTurnPrevented = isTurnActionPrevented(combatantInfo);
    const abilityType = (() => {
        if (isOffensiveAbility(ability)) {
            return "offense";
        }

        if (ability.actions.some((action) => action.summon)) {
            return "summon";
        }

        if (ability.actions.some((action) => action.type === ACTION_TYPES.EFFECT)) {
            return "support";
        }
    })();

    const getTargetElement = () => {
        const actionTargets = combatant.targeting?.actionTargets || [];
        const combatantCountMap: { [combatantName: string]: string[] } = {};
        actionTargets.forEach((targeting) => {
            const { side: targetSide } = targeting || {};
            (battle[targetSide] || []).forEach((targetCombatant) => {
                if (!targetCombatant) {
                    return;
                }

                const { name, id } = targetCombatant;
                if (!combatantCountMap[name]) {
                    combatantCountMap[name] = [];
                }

                combatantCountMap[name].push(id);
            });
        });

        return actionTargets.map((targeting, i) => {
            // TODO: multi hits could be targeting random enemies
            const { index: targetIndex, side: targetSide } = targeting || {};
            const targetCombatant = battle[targetSide]?.[targetIndex];
            const isSelfCast = ability.actions.some((action) => action.target === TARGET_TYPES.SELF);
            if (!targetCombatant || abilityHasYetToCast || isSelfCast) {
                return null;
            }

            // If there are more than one of the same summon type on the board (eg. 2+ Fire Spirits), display the index of that summon
            const isIndexDisplayed = combatantCountMap[targetCombatant.name]?.length > 1;
            const displayIndex = targetIndex + 1; // 1-based indices when displaying to player
            return (
                <span className={classes.targetPortrait} key={[targetCombatant.image, i].join("-")}>
                    <Icon icon={targetCombatant.image} />
                    {isIndexDisplayed && <span className={classes.targetCombatantIndex}>{displayIndex}</span>}
                </span>
            );
        });
    };

    const area = ability.actions.reduce((acc, action) => {
        if (action.area > acc) {
            return action.area;
        }

        return acc;
    }, 0);

    return (
        <div className={classes.root}>
            <Tooltip
                title={
                    <div className={classes.tooltipContents}>
                        <div className={classes.container}>
                            <div className={classes.tooltipTitle}>
                                <Icon icon={image} size="sm" /> {name}{" "}
                                {isTurnPrevented && <span className={classes.disabled}>(Disabled)</span>}
                            </div>
                            <div className={classes.subContainer}>
                                {abilityType === "offense" && (
                                    <span>
                                        <span className={classNames(classes.diamond, classes.offensive)} />
                                        Offense
                                    </span>
                                )}
                                {abilityType === "summon" && (
                                    <span>
                                        <span className={classNames(classes.diamond, classes.minion)} />
                                        Summon
                                    </span>
                                )}
                                {abilityType === "support" && (
                                    <span>
                                        <span className={classNames(classes.diamond, classes.support)} />
                                        Support
                                    </span>
                                )}

                                {area > 0 && (
                                    <div className={classes.areaContainer}>
                                        Area:{" "}
                                        {area > 3 ? (
                                            "ALL"
                                        ) : (
                                            <AreaIndicator
                                                area={area}
                                                primaryColor="rgba(255, 255, 255, 0.5)"
                                                secondaryColor="rgba(255, 255, 255, 0.25)"
                                                className={classes.areaIndicator}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>{interpolatedDescription}</div>
                            {abilityHasYetToCast && castTime > 0 && (
                                <div className={classes.container}>
                                    Activates after {castTime === 1 ? "next turn." : `${castTime} turns.`}
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
                                [classes.desaturated]: abilityHasYetToCast || isTurnPrevented,
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
                        {getTargetElement()}
                        {isTurnPrevented && <Icon icon={NoEntryIcon} size="sm" className={classes.cancelIcon} />}
                    </span>
                </div>
            </Tooltip>
        </div>
    );
};

export default Telegraph;

import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { ResourceIcon } from "../ability/AbilityView/ResourceIcon";
import { Action } from "../ability/types";
import { UpdatedCombatantStats } from "../battle/actions/getUpdatedStats";
import Icon from "../icon/Icon";
import { CrossbonesIcon, CrossedSwordsIcon, NoEntryIcon, ShieldIcon } from "../images/icons";
import { Combatant, Player } from "./types";
import { IncomingDamageArrow2Image, IncomingDamageArrowImage, IncomingSupportArrow2Image, IncomingSupportArrowImage } from "../images";

const ARROW_ANIMATION_TIME = 2000; // ms

const useStyles = createUseStyles({
    previewRoot: {
        zIndex: 5,
        fontSize: "18px",
        fontWeight: "bold",
        padding: "8px",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        color: "white",
        display: "flex",
        whiteSpace: "nowrap",
        top: 25,
    },
    inner: {
        animationName: "$fadeIn",
        animationDuration: "0.25s",
        animationFillMode: "forwards",
    },
    "@keyframes fadeIn": {
        "0%": {
            opacity: 0,
        },
        "100%": {
            opacity: 1,
            transform: "translateY(10px)",
        },
    },
    previewIconContainer: {
        filter: "drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)",
        margin: "0 4px",
        position: "relative",
    },
    statUpdatePreview: {
        zIndex: 5,
        fontSize: "18px",
        fontWeight: "bold",
        background: "rgba(50, 60, 100, 0.9)",
        padding: "8px",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        color: "white",
        borderRadius: "4px",
        display: "flex",
        whiteSpace: "nowrap",
        top: -5,
        "&.nondeterministic": {
            background: "rgba(100, 70, 70, 0.8)",
            filter: "saturate(0.5)",
        },
        "&.enemyPreview": {
            background: "rgba(100, 40, 40, 0.9)",
        },
    },
    "@keyframes indicatorAnimation": {
        "0%": {
            opacity: 0,
            transform: "translateX(-50%) translateY(0px)",
        },
        "100%": {
            opacity: 0.25,
            transform: "translateX(-50%) translateY(30px)",
        },
    },
    indicator: {
        position: "absolute",
        left: "50%",
        top: "-40",
        transform: "translateX(-50%)",
        animationName: "$indicatorAnimation",
        animationDuration: `${ARROW_ANIMATION_TIME}ms`,
        animationIterationCount: "infinite",
        opacity: 0,
        width: 90,
    },
    nondeterministicIndicator: {
        filter: "saturate(0.3) brightness(1.5)",
        opacity: 0.9,
    },
    indicatorBase: {
        position: "absolute",
        left: "50%",
        top: "-40",
        transform: "translateX(-50%) translateY(30px)",
        width: 90,
    },
    statUpdate: {
        display: "inline-block",
        margin: "0 5px",
        whiteSpace: "nowrap",
        filter: "drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)",
    },
    resourceUpdate: {
        display: "inline-block",
        whiteSpace: "nowrap",
        marginLeft: "5px",
        filter: "drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)",
    },
    negative: {
        color: "#ff9b94",
    },
    lethalIcon: {
        display: "inline-block",
        verticalAlign: "middle",
        marginLeft: 8,
        marginBottom: 2,
    },
    divider: {
        borderLeft: "1px solid rgba(255, 255, 255, 0.3)",
        marginLeft: "4px",
        paddingRight: "4px",
        height: "15px",
        display: "inline-block",
    },
    immuned: {
        filter: "saturate(0)",
    },
    cancelIcon: {
        left: -3,
        top: -3,
        position: "absolute",
        filter: "brightness(2)",
    },
    stacks: {
        bottom: -2,
        left: 0,
        position: "absolute",
        textShadow: Array.from({ length: 10 })
            .map(() => "0px 0px 1px black")
            .join(", "),
        fontSize: "12px",
    },
    faded: {
        filter: "saturate(0.25)",
        opacity: 0.85,
    },
});

export interface PreviewStatUpdate {
    nondeterministic: boolean;
    statUpdate: UpdatedCombatantStats;
    action?: Action;
}

/**
 * The damage/armor preview that shows up when you hover over a combatant with a card selected.
 */
const AbilityPreview = ({
    previewStatUpdate,
    combatant,
    isEnemy,
    className,
}: {
    previewStatUpdate: PreviewStatUpdate[];
    combatant?: Combatant;
    isEnemy: boolean;
    className?: string;
}) => {
    const classes = useStyles();

    if (!previewStatUpdate) {
        return null;
    }

    const isNondeterministic = previewStatUpdate[0]?.nondeterministic;
    // Just show the first item, for abilities like Tribolt
    if (isNondeterministic) {
        previewStatUpdate = previewStatUpdate.slice(0, 1);
    }

    const getIndicator = () => {
        const { arrow, arrowBase } = isEnemy
            ? { arrow: IncomingDamageArrow2Image, arrowBase: IncomingDamageArrowImage }
            : { arrow: IncomingSupportArrow2Image, arrowBase: IncomingSupportArrowImage };

        return (
            <span
                className={classNames({
                    [classes.nondeterministicIndicator]: isNondeterministic,
                })}
            >
                <img src={arrowBase} className={classes.indicatorBase} />
                {Array.from({ length: 3 }).map((_, i) => (
                    <img
                        src={arrow}
                        className={classes.indicator}
                        style={{ animationDelay: `${i * (ARROW_ANIMATION_TIME / 3)}ms` }}
                        key={i}
                    />
                ))}
            </span>
        );
    };

    const getPreviewElement = () => {
        // FIX ME: bandaiding an issue where tribute kill has a double preview object.
        let isDeathBlowShown = false;
        const inner = previewStatUpdate.map((preview, i) => {
            const { action, nondeterministic, statUpdate } = preview || {};
            const { rawDamage = 0, effects = [], failedToApplyEffects = [], armor, resources = 0, isDeathBlow } = statUpdate;
            const showDamage = action?.damage > 0 || rawDamage > 0;
            const showArmor = action?.armor > 0;
            const nothingToShow = !showDamage && !showArmor && !effects.length && !failedToApplyEffects.length && !resources;
            if (nothingToShow) {
                return null;
            }

            const showDivider = (effects.length > 0 || failedToApplyEffects.length > 0) && (showDamage || showArmor);
            const isDefiniteKill = rawDamage === Infinity;
            const showDeathBlow = isDeathBlow && !isDeathBlowShown;
            if (showDeathBlow) {
                isDeathBlowShown = true;
            }

            if (isDefiniteKill) {
                if (showDeathBlow) {
                    return (
                        <span key={i} className={classes.statUpdate}>
                            <Icon icon={CrossbonesIcon} size={"xs"} />
                        </span>
                    );
                }
                return null;
            }

            return (
                <span key={i}>
                    {effects.map((e, i) => (
                        <span className={classes.previewIconContainer} key={[e.name, i].join("-")}>
                            <Icon icon={e.icon} size="sm" />
                            {e.stacks && <span className={classes.stacks}>{e.stacks}</span>}
                        </span>
                    ))}
                    {failedToApplyEffects.map((e, i) => (
                        <span className={classNames(classes.previewIconContainer)} key={[e.name, i].join("-")}>
                            <Icon icon={e.icon} className={classes.immuned} size="sm" />
                            <Icon icon={NoEntryIcon} size="min" className={classes.cancelIcon} />
                            {e.stacks && <span className={classes.stacks}>{e.stacks}</span>}
                        </span>
                    ))}
                    {showDivider && <span className={classes.divider} />}
                    {showDamage && (
                        <>
                            {!isDefiniteKill && (
                                <span className={classes.previewIconContainer}>
                                    <Icon icon={CrossedSwordsIcon} size="sm" />
                                </span>
                            )}
                            <span
                                className={classNames(classes.statUpdate, {
                                    [classes.negative]: !isDeathBlow && rawDamage < action?.damage,
                                })}
                                key={["damage-update", i].join("-")}
                            >
                                {!isDefiniteKill && (rawDamage || 0)}
                                {nondeterministic && "?"}{" "}
                                {isDeathBlow && (
                                    <span className={classes.lethalIcon}>
                                        <Icon icon={CrossbonesIcon} size={"xs"} />
                                    </span>
                                )}
                            </span>
                        </>
                    )}
                    {showArmor && (
                        <>
                            <span className={classes.previewIconContainer}>
                                <Icon icon={ShieldIcon} size="sm" />
                            </span>
                            <span
                                className={classNames(classes.statUpdate, {
                                    [classes.negative]: armor < action?.armor,
                                })}
                                key={["armor-update", i].join("-")}
                            >
                                {armor || 0}
                                {nondeterministic && "?"}{" "}
                            </span>
                        </>
                    )}
                    {resources > 0 && combatant?.isPlayer && (
                        <>
                            <span className={classNames(classes.resourceUpdate)}>+{resources}</span>
                            <span className={classes.previewIconContainer}>
                                <ResourceIcon size="sm" playerClass={(combatant as Player).class} />
                            </span>
                        </>
                    )}
                </span>
            );
        });

        if (inner.some((value) => value)) {
            return (
                <div
                    className={classNames(classes.statUpdatePreview, {
                        nondeterministic: isNondeterministic,
                        enemyPreview: isEnemy,
                    })}
                >
                    {inner}
                </div>
            );
        }

        return null;
    };

    return (
        <div
            className={classNames(classes.previewRoot, className, {
                [classes.faded]: !combatant,
            })}
        >
            <div className={classes.inner}>
                {getIndicator()}
                {getPreviewElement()}
            </div>
        </div>
    );
};

export default AbilityPreview;

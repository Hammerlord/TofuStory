import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Action } from "../ability/types";
import { UpdatedCombatantStats } from "../battle/actions/getUpdatedStats";
import Icon from "../icon/Icon";
import { CrossbonesIcon, CrossedSwordsIcon, NoEntryIcon, ShieldIcon } from "../images/icons";
import { Combatant, Player } from "./types";
import PlayerResources from "./PlayerResources";
import { ResourceIcon } from "../ability/AbilityView/ResourceIcon";

const useStyles = createUseStyles({
    "@keyframes fadeIn": {
        "0%": {
            opacity: 0,
        },
        "100%": {
            opacity: 1,
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
        animationName: "$fadeIn",
        animationDuration: "0.5s",
        animationFillMode: "forwards",
        display: "flex",
        whiteSpace: "nowrap",
        top: 30,
        "&.nondeterministic": {
            background: "rgba(100, 70, 70, 0.8)",
        },
        "&.enemyPreview": {
            background: "rgba(100, 40, 40, 0.9)",
        },
    },
    statUpdate: {
        display: "inline-block",
        margin: "0 5px",
        whiteSpace: "nowrap",
        filter: "drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)",
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
});

export interface PreviewStatUpdate {
    nondeterministic: boolean;
    statUpdate: UpdatedCombatantStats;
    action: Action;
}

/**
 * The damage/armor preview that shows up when you hover over a combatant with a card selected.
 */
const AbilityPreview = ({
    previewStatUpdate,
    combatant,
    isEnemy,
}: {
    previewStatUpdate: PreviewStatUpdate[];
    combatant: Combatant;
    isEnemy: boolean;
}) => {
    const classes = useStyles();

    if (!previewStatUpdate || !combatant) {
        return null;
    }

    const isNondeterministic = previewStatUpdate[0].nondeterministic;
    // Just show the first item, for abilities like Tribolt
    if (isNondeterministic) {
        previewStatUpdate = previewStatUpdate.slice(0, 1);
    }

    const { HP, armor } = combatant;
    let effectiveHP = HP + armor;

    return (
        <div
            className={classNames(classes.statUpdatePreview, {
                nondeterministic: previewStatUpdate.some((p) => p.nondeterministic),
                enemyPreview: isEnemy,
            })}
        >
            {previewStatUpdate.map((preview, i) => {
                const { action, nondeterministic, statUpdate } = preview || {};
                const { rawDamage = 0, effects = [], failedToApplyEffects = [], armor, resources = 0 } = statUpdate;
                const isAlreadyDead = effectiveHP <= 0 && !rawDamage;
                if (isAlreadyDead) {
                    // Prospected killed by a previous hit
                    return null;
                }

                effectiveHP -= rawDamage;
                const isLethal = rawDamage > 0 && effectiveHP <= 0;

                const showDamage = action.damage > 0 || rawDamage > 0;
                const showArmor = action.armor > 0;
                const nothingToShow = !showDamage && !showArmor && !effects.length && !failedToApplyEffects.length && !resources;
                if (nothingToShow) {
                    return null;
                }

                const showDivider = (effects.length > 0 || failedToApplyEffects.length > 0) && (showDamage || showArmor);

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
                                <span className={classes.previewIconContainer}>
                                    <Icon icon={CrossedSwordsIcon} size="sm" />
                                </span>
                                <span
                                    className={classNames(classes.statUpdate, {
                                        [classes.negative]: !isLethal && rawDamage < action?.damage,
                                    })}
                                    key={["damage-update", i].join("-")}
                                >
                                    {rawDamage || 0}
                                    {nondeterministic && "?"}{" "}
                                    {isLethal && (
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
                        {resources > 0 && combatant.isPlayer && (
                            <>
                                <span className={classNames(classes.resourceUpdate)}>+{resources}</span>
                                <span className={classes.previewIconContainer}>
                                    <ResourceIcon size="sm" playerClass={(combatant as Player).class} />
                                </span>
                            </>
                        )}
                    </span>
                );
            })}
        </div>
    );
};

export default AbilityPreview;

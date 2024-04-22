import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Action } from "../ability/types";
import { UpdatedCombatantStats } from "../battle/actions/getUpdatedStats";
import Icon from "../icon/Icon";
import { CrossbonesIcon, CrossedSwordsIcon, NoEntryIcon, ShieldIcon } from "../images/icons";

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
        filter: "drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)",
        margin: "0 4px",
        position: "relative",
    },
    statUpdatePreview: {
        zIndex: 5,
        fontSize: "18px",
        fontWeight: "bold",
        background: "rgba(100, 40, 40, 0.9)",
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
    },
    statUpdate: {
        display: "inline-block",
        margin: "0 5px",
        whiteSpace: "nowrap",
        filter: "drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)",
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
});

export interface PreviewStatUpdate {
    nondeterministic: boolean;
    statUpdate: UpdatedCombatantStats;
    action: Action;
}

/**
 * The damage/armor preview that shows up when you hover over a combatant with a card selected.
 */
const AbilityPreview = ({ previewStatUpdate, HP = 0, armor = 0 }: { previewStatUpdate: PreviewStatUpdate[]; HP: number; armor }) => {
    const classes = useStyles();

    if (!previewStatUpdate) {
        return null;
    }

    const isNondeterministic = previewStatUpdate[0].nondeterministic;
    // Just show the first item, for abilities like Tribolt
    if (isNondeterministic) {
        previewStatUpdate = previewStatUpdate.slice(0, 1);
    }

    let effectiveHP = HP + armor;

    return (
        <div
            className={classNames(classes.statUpdatePreview, {
                nondeterministic: previewStatUpdate.some((p) => p.nondeterministic),
            })}
        >
            {previewStatUpdate.map((preview, i) => {
                const { action, nondeterministic, statUpdate } = preview || {};
                const { rawDamage = 0, effects = [], failedToApplyEffects = [], armor } = statUpdate;
                const isAlreadyDead = effectiveHP <= 0 && !rawDamage;
                if (isAlreadyDead) {
                    // Prospected killed by a previous hit
                    return null;
                }

                effectiveHP -= rawDamage;
                const isLethal = rawDamage > 0 && effectiveHP <= 0;

                const showDamage = action.damage > 0 || rawDamage > 0;
                const showArmor = action.armor > 0;
                if (!showDamage && !showArmor && !effects.length && !failedToApplyEffects.length) {
                    return null;
                }

                const showDivider = (effects.length > 0 || failedToApplyEffects.length > 0) && (showDamage || showArmor);

                return (
                    <span key={i}>
                        {effects.map((e, i) => (
                            <span className={classes.previewIconContainer} key={[e.name, i].join("-")}>
                                <Icon icon={e.icon} size="sm" />
                            </span>
                        ))}
                        {failedToApplyEffects.map((e, i) => (
                            <span className={classNames(classes.previewIconContainer)} key={[e.name, i].join("-")}>
                                <Icon icon={e.icon} className={classes.immuned} size="sm" />
                                <Icon icon={NoEntryIcon} size="min" className={classes.cancelIcon} />
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
                    </span>
                );
            })}
        </div>
    );
};

export default AbilityPreview;

import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Action } from "../ability/types";
import { UpdatedCombatantStats } from "../battle/actions/getUpdatedStats";
import Icon from "../icon/Icon";
import { CrossbonesIcon, CrossedSwordsIcon } from "../images/icons";

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
        top: 20,
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
});

export interface PreviewStatUpdate {
    nondeterministic: boolean;
    statUpdate: UpdatedCombatantStats;
    action: Action;
}

/**
 * The damage preview that shows up when you hover over an enemy with an offensive card selected.
 * May be expanded to include buffs, debuffs, armor...
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
            <div className={classes.previewIconContainer}>
                <Icon icon={CrossedSwordsIcon} size="sm" />
            </div>
            {previewStatUpdate.map((preview, i) => {
                const { action, nondeterministic, statUpdate } = preview || {};
                const rawDamage = statUpdate?.rawDamage;
                const isAlreadyDead = effectiveHP <= 0 && !rawDamage;
                if (isAlreadyDead) {
                    // Prospected killed by a previous hit
                    return null;
                }

                effectiveHP -= rawDamage;
                const isLethal = rawDamage > 0 && effectiveHP <= 0;

                return (
                    <div
                        className={classNames(classes.statUpdate, {
                            [classes.negative]: !isLethal && rawDamage < action?.damage,
                        })}
                        key={["statUpdate", i].join("-")}
                    >
                        {rawDamage || 0}
                        {nondeterministic && "?"} {isLethal && <Icon icon={CrossbonesIcon} size={"sm"} />}
                    </div>
                );
            })}
        </div>
    );
};

export default AbilityPreview;

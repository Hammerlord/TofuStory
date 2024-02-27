import { partition } from "ramda";
import { createUseStyles } from "react-jss";
import { CombatEffect, EFFECT_CLASSES, Effect } from "../../ability/types";
import EffectGroupIcon from "../../icon/EffectGroupIcon";
import { Combatant, Player } from "../types";
import { Event } from "../../battle/types";
import { COLOR_RARITY_UNCOMMON } from "../../constants";

const indicatorSize = 6;
const useStyles = createUseStyles({
    root: {
        "& hr": {
            opacity: 0.8,
            width: "100%",
            height: 0,
            borderTop: 0,
            marginTop: 8,
            borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
        },
    },
    buffs: {
        minHeight: 24,
    },
    debuffs: {
        minHeight: 24,
    },
    divider: {
        display: "flex",
    },
    up: {
        borderLeft: `${indicatorSize}px solid transparent`,
        borderRight: `${indicatorSize}px solid transparent`,
        borderBottom: `${indicatorSize}px solid ${COLOR_RARITY_UNCOMMON}`,
        marginBottom: 1,
    },
    down: {
        borderLeft: `${indicatorSize}px solid transparent`,
        borderRight: `${indicatorSize}px solid transparent`,
        borderTop: `${indicatorSize}px solid #a74848`,
    },
    dividerIndicator: {
        display: "flex",
        flexDirection: "column",
        margin: "2px 8px",
    },
});

/**
 * Status effect icons to display below the combatant portrait
 */
const EffectIconsContainer = ({ combatant, isSilenced, event }: { combatant: Combatant | Player; isSilenced: boolean; event: Event }) => {
    const classes = useStyles();
    if (!combatant) {
        return null;
    }

    const [buffs, debuffs] = partition((e: CombatEffect) => e.class === EFFECT_CLASSES.BUFF, combatant?.effects || []);
    const getEffectGroups = (effects: CombatEffect[]) => {
        const map = effects.reduce((acc, effect: Effect) => {
            const { name, type, disableDisplayIcon } = effect;
            if (disableDisplayIcon) {
                return acc;
            }

            const key = [name, type].join("-"); // If it has the same name and type, it's *probably* the same effect
            return {
                ...acc,
                [key]: [...(acc[key] || []), effect],
            };
        }, {});
        return Object.values(map);
    };

    const shouldGlow = (effects: CombatEffect[]) => {
        return effects.some((e) => e.id === (event?.source?.source as CombatEffect)?.id);
    };

    return (
        <div className={classes.root}>
            <div className={classes.buffs}>
                {getEffectGroups(buffs).map((effects: CombatEffect[], i) => (
                    <EffectGroupIcon
                        effects={effects}
                        key={effects[0]?.name || i}
                        owner={combatant}
                        isSilenced={isSilenced}
                        glow={shouldGlow(effects)}
                    />
                ))}
            </div>
            <div className={classes.divider}>
                <hr />
                <div className={classes.dividerIndicator}>
                    <span className={classes.up} />
                    <span className={classes.down} />
                </div>
                <hr />
            </div>

            <div className={classes.debuffs}>
                {getEffectGroups(debuffs).map((effects: CombatEffect[], i) => (
                    <EffectGroupIcon
                        effects={effects}
                        key={effects[0]?.name || i}
                        owner={combatant}
                        isSilenced={isSilenced}
                        glow={shouldGlow(effects)}
                    />
                ))}
            </div>
        </div>
    );
};

export default EffectIconsContainer;

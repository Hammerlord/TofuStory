import { partition } from "ramda";
import { createUseStyles } from "react-jss";
import { CombatEffect, EFFECT_CLASSES, Effect } from "../../ability/types";
import EffectGroupIcon from "../../icon/EffectGroupIcon";

const useStyles = createUseStyles({
    buffs: {
        marginBottom: "4px",
    },
});

/**
 * Status effect icons to display below the combatant portrait
 */
const EffectIconsContainer = ({ combatant, isSilenced }) => {
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

    return (
        <>
            <div className={classes.buffs}>
                {getEffectGroups(buffs).map((effects: CombatEffect[], i) => (
                    <EffectGroupIcon effects={effects} key={effects[0]?.name || i} owner={combatant} isSilenced={isSilenced} />
                ))}
            </div>
            <div>
                {getEffectGroups(debuffs).map((effects: CombatEffect[], i) => (
                    <EffectGroupIcon effects={effects} key={effects[0]?.name || i} owner={combatant} isSilenced={isSilenced} />
                ))}
            </div>
        </>
    );
};

export default EffectIconsContainer;

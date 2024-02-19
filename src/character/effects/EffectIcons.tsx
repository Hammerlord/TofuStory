import { partition } from "ramda";
import { createUseStyles } from "react-jss";
import { CombatEffect, EFFECT_CLASSES, Effect } from "../../ability/types";
import EffectGroupIcon from "../../icon/EffectGroupIcon";
import { Combatant } from "../types";
import { Event } from "../../battle/types";

const useStyles = createUseStyles({
    buffs: {
        marginBottom: "4px",
    },
});

/**
 * Status effect icons to display below the combatant portrait
 */
const EffectIconsContainer = ({ combatant, isSilenced, event }: { combatant: Combatant; isSilenced: boolean; event: Event }) => {
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
        console.log(
            "check",
            event,
            effects.some((e) => e.id === (event?.source?.source as CombatEffect)?.id)
        );
        return effects.some((e) => e.id === (event?.source?.source as CombatEffect)?.id);
    };

    return (
        <>
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
            <div>
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
        </>
    );
};

export default EffectIconsContainer;

import { useEffect, useMemo, useRef, useState } from "react";
import { Combatant } from "../types";
import { StatChange } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { createUseStyles } from "react-jss";
import classNames from "classnames";

const PLAYBACK_TIME = 2000;

const floatAnimation = ({ object, delay, playbackTime = PLAYBACK_TIME }) => {
    const animationFrames: any[] = [
        {
            opacity: 0.5,
            easing: "ease-out",
            transform: "translateY(-50px)",
        },
        {
            opacity: 1,
        },
        {
            opacity: 1,
        },
        {
            opacity: 0,
            easing: "ease-in",
            transform: "translateY(-150px)",
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
        delay,
    });
};

const useStyles = createUseStyles({
    effectItem: {
        opacity: 0,
        fontWeight: "bold",
        fontSize: "18px",
        filter: Array.from({ length: 5 })
            .map(() => "drop-shadow(0 0 1px rgba(255, 255, 255, 0.8))")
            .join(" "),
        whiteSpace: "nowrap",
    },
    faded: {
        color: "#555",
        fontStyle: "italic",
    },
});

/**
 * A widget for announcing when status effects have been added or have faded
 */
const StatusEffectAnnouncer = ({ statChanges }: { statChanges: StatChange }) => {
    const classes = useStyles();
    const itemRefs = Array.from({ length: 100 }).map(() => useRef());
    const [effects, setEffects] = useState([]);
    const [removedEffects, setRemovedEffects] = useState([]);

    // Only display effects that are visible via icon
    const newEffects = statChanges?.effects?.filter((e) => e.icon && !e.disableDisplayIcon) || [];
    const newRemovedEffects = statChanges?.removedEffects?.filter((e) => e.icon && !e.disableDisplayIcon) || [];

    const getStringified = (effects) => {
        return JSON.stringify(effects.map((e) => e.id));
    };

    const animatedEffectsRef: any = useRef({});

    useEffect(() => {
        if (newEffects.length) {
            setEffects((prev) => {
                if (getStringified(prev) === getStringified(newEffects)) {
                    return prev;
                }

                return newEffects;
            });
        }

        if (newRemovedEffects.length) {
            setRemovedEffects((prev) => {
                if (getStringified(prev) === getStringified(newRemovedEffects)) {
                    return prev;
                }

                return newRemovedEffects;
            });
        }
    }, [getStringified(newEffects), getStringified(newRemovedEffects)]);

    useEffect(() => {
        effects.map((e, i) => {
            const key = e.id;
            if (!animatedEffectsRef.current[key]) {
                animatedEffectsRef.current[key] = true;
                const animation = floatAnimation({ object: itemRefs[i].current, delay: i * 100 });
                animation.onfinish = () => {
                    delete animatedEffectsRef.current[key];
                };
            }
        });
    }, [effects]);

    useEffect(() => {
        removedEffects.map((e, i) => {
            i = effects.length + i; // Comes after effects.
            const key = [e.id, "removed"].join("-");
            if (!animatedEffectsRef.current[key]) {
                animatedEffectsRef.current[key] = true;
                const animation = floatAnimation({ object: itemRefs[i].current, delay: i * 100 });
                animation.onfinish = () => {
                    delete animatedEffectsRef.current[key];
                };
            }
        });
    }, [removedEffects]);

    return (
        <div>
            {effects.map((e, i) => (
                <div key={e.id} className={classes.effectItem} ref={itemRefs[i]}>
                    + <Icon icon={e.icon} /> {e.name} {e.stacks > 1 ? `x${e.stacks}` : undefined}
                </div>
            ))}
            {removedEffects.map((e, i) => (
                <div key={e.id} className={classNames(classes.effectItem, classes.faded)} ref={itemRefs[effects.length + i]}>
                    <Icon icon={e.icon} /> {e.name} {e.stacks > 1 ? `x${e.stacks}` : undefined} faded
                </div>
            ))}
        </div>
    );
};

export default StatusEffectAnnouncer;

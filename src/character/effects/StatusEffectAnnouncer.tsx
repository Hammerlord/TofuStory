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
    fadedIcon: {
        filter: "saturate(0)",
    },
    effectClassContainer: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
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

    const aggregate = (effects) => {
        const aggregated = effects.reduce((acc, effect) => {
            if (!acc[effect.name]) {
                acc[effect.name] = {
                    ...effect,
                    stacks: 1,
                };
            } else {
                acc[effect.name].stacks += 1;
            }

            return acc;
        }, {});

        return Object.values(aggregated);
    };

    const animatedEffectsRef: any = useRef({});

    useEffect(() => {
        if (newEffects.length) {
            setEffects((prev) => {
                const aggregated = aggregate(newEffects);
                if (getStringified(prev) === getStringified(aggregated)) {
                    return prev;
                }

                return aggregated;
            });
        }

        if (newRemovedEffects.length) {
            setRemovedEffects((prev) => {
                const aggregated = aggregate(newRemovedEffects);

                if (getStringified(prev) === getStringified(aggregated)) {
                    return prev;
                }

                return aggregated;
            });
        }
    }, [newEffects, newRemovedEffects]);

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
            <div className={classes.effectClassContainer}>
                {effects.map((e, i) => (
                    <div key={e.id} className={classes.effectItem} ref={itemRefs[i]}>
                        + <Icon icon={e.icon} size="sm" /> {e.name} {e.stacks > 1 ? `x${e.stacks}` : undefined}
                    </div>
                ))}
            </div>
            <div className={classes.effectClassContainer}>
                {removedEffects.map((e, i) => (
                    <div key={e.id} className={classNames(classes.effectItem, classes.faded)} ref={itemRefs[effects.length + i]}>
                        <Icon icon={e.icon} size="sm" className={classes.fadedIcon} /> {e.name} {e.stacks > 1 ? `x${e.stacks}` : undefined}{" "}
                        faded
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatusEffectAnnouncer;

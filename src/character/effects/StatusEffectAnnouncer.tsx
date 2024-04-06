import { useEffect, useRef, useState } from "react";
import { Combatant } from "../types";
import { StatChange } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { createUseStyles } from "react-jss";
import classNames from "classnames";

const PLAYBACK_TIME = 2500;

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
            .map(() => "drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))")
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
    const effects = statChanges?.effects?.filter((e) => e.icon && !e.disableDisplayIcon) || [];
    const removedEffects = statChanges?.removedEffects?.filter((e) => e.icon && !e.disableDisplayIcon) || [];

    useEffect(() => {
        // Only display effects that are visible via icon
        const animations = [...effects, ...removedEffects].map((e, i) => {
            return floatAnimation({ object: itemRefs[i].current, delay: i * 100 });
        });
    }, [JSON.stringify(statChanges.effects), JSON.stringify(statChanges.removedEffects)]);

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

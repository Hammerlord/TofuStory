import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { CombatEffect, EFFECT_TYPES } from "../../ability/types";
import { StatChange } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { Combatant } from "../types";

const PLAYBACK_TIME = 2000;

const floatAnimation = ({ object, delay, playbackTime = PLAYBACK_TIME }) => {
    const animationFrames: any[] = [
        {
            opacity: 0.5,
            easing: "ease-out",
            transform: "translateY(-100px)",
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
            transform: "translateY(-200px)",
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
        height: 0,
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
        bottom: 0,
    },
});

type EffectQueued = {
    effect: CombatEffect;
    type: "added" | "removed" | "immuned";
};

/**
 * A widget for announcing when status effects have been added or have faded
 */
const StatusEffectAnnouncer = ({ statChanges, combatant }: { statChanges: StatChange; combatant: Combatant }) => {
    const classes = useStyles();
    const ref = useRef({});
    const [queue, setQueue]: [EffectQueued[], Function] = useState([]);

    const isInvalidCombatant =
        !combatant || (combatant.HP === 0 && combatant.effects.every((effect) => effect.type !== EFFECT_TYPES.LIFE_LINK));

    const aggregate = (effects): CombatEffect[] => {
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

    const getKey = (effect, type) => {
        return [effect.id, type].join("-");
    };

    useEffect(() => {
        if (isInvalidCombatant || !statChanges) {
            return;
        }

        // Only display effects that are visible via icon
        const { effects = [], removedEffects = [] } = statChanges;
        const newEffects = effects.filter((e) => e.icon && !e.disableDisplayIcon);
        const newRemovedEffects = removedEffects.filter((e) => e.icon && !e.disableDisplayIcon);

        const queuedKeys = queue.reduce((acc, item) => {
            acc[getKey(item.effect, item.type)] = true;
            return acc;
        }, {});

        const isAlreadyQueued = (effect: CombatEffect, type): boolean => {
            const key = getKey(effect, type);
            return Boolean(queuedKeys[key] || animatedEffectsRef[key]);
        };

        const newQueue = [...queue];
        aggregate(newEffects).forEach((effect) => {
            if (!isAlreadyQueued(effect, "added")) {
                newQueue.push({ effect, type: "added" });
            }
        });

        aggregate(newRemovedEffects).forEach((effect) => {
            if (!isAlreadyQueued(effect, "removed")) {
                newQueue.push({ effect, type: "removed" });
            }
        });

        if (queue.length === newQueue.length) {
            return;
        }

        setQueue(newQueue);
    }, [statChanges]);

    useEffect(() => {
        if (isInvalidCombatant) {
            return;
        }
        queue.forEach((item, i) => {
            const { effect: e, type } = item;
            const key = getKey(e, type);

            const elementRef = ref.current?.[key];
            if (!elementRef) {
                return;
            }
            if (!animatedEffectsRef.current[key]) {
                animatedEffectsRef.current[key] = true;
                const animation = floatAnimation({ object: elementRef, delay: i * 325 });
                animation.onfinish = () => {
                    delete animatedEffectsRef.current[key];
                    setQueue((prev) =>
                        prev.filter((item) => {
                            const queueItemKey = getKey(item.effect, item.type);
                            return queueItemKey !== key;
                        })
                    );
                };
            }
        });
    }, [queue]);

    return (
        <div className={classes.effectClassContainer}>
            {queue.map((item) => {
                const { effect: e, type } = item;

                const getInner = () => {
                    if (type === "added") {
                        return (
                            <>
                                + <Icon icon={e.icon} size="sm" /> {e.name} {e.stacks > 1 ? `x${e.stacks}` : undefined}
                            </>
                        );
                    }

                    if (type === "removed") {
                        return (
                            <>
                                <Icon icon={e.icon} size="sm" className={classes.fadedIcon} /> {e.name}{" "}
                                {e.stacks > 1 ? `x${e.stacks}` : undefined} faded
                            </>
                        );
                    }

                    if (type === "immuned") {
                        return (
                            <>
                                Resisted <Icon icon={e.icon} size="sm" className={classes.fadedIcon} /> {e.name}
                            </>
                        );
                    }
                };

                const key = getKey(e, type);
                return (
                    <div
                        key={key}
                        className={classNames(classes.effectItem, {
                            [classes.faded]: type === "removed" || type === "immuned",
                        })}
                        ref={(element) => {
                            if (element) {
                                ref.current[key] = element;
                            } else {
                                delete ref.current[key];
                            }
                        }}
                    >
                        {getInner()}
                    </div>
                );
            })}
        </div>
    );
};

export default StatusEffectAnnouncer;

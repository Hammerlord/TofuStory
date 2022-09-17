import classNames from "classnames";
import { useEffect, useMemo, useRef } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, ANIMATION_TYPES } from "../ability/types";
import { travel } from "../character/animations";

const PROJECTILE_WIDTH = 70;
const PROJECTILE_HEIGHT = 70;

const useStyles = createUseStyles({
    root: {
        pointerEvents: "none", // Not an interactable layer
    },
    projectile: {
        maxWidth: PROJECTILE_WIDTH,
        objectFit: "contain",
        WebkitFilter: "brightness(1) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        filter: "brightness(1) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        maxHeight: PROJECTILE_HEIGHT,
    },
});

const AnimationCanvas = ({ actor, target, allTargets = [], eventId, action, playbackTime = 1000 }: any) => {
    const eventIdRef = useRef(); // Prevent duplicate playbacks of the same action
    const projectileRefs = Array.from({ length: 5 }).map(() => useRef() as any);
    const { left: actorLeft, top: actorTop } = useMemo(() => {
        if (!actor?.getBoundingClientRect) {
            return {};
        }
        const { left, top, height, width } = actor?.getBoundingClientRect();
        return {
            left: left + width / 2,
            top: top + height / 2,
        };
    }, [actor]);
    const classes = useStyles();

    useEffect(() => {
        if (!target || !action || eventIdRef.current === eventId || !actor) {
            return;
        }

        eventIdRef.current = eventId;
        const { type, animation } = action || {};
        if (type === ACTION_TYPES.ATTACK && actor) {
            travel({ to: target, from: actor, returnToOrigin: true, playbackTime });
        } else if (type === ACTION_TYPES.RANGE_ATTACK) {
            const spin = animation === ANIMATION_TYPES.YOYO || animation === ANIMATION_TYPES.ONE_WAY_SPIN;
            const rotateToFaceTarget = animation === ANIMATION_TYPES.ONE_WAY;
            allTargets.forEach((tar, i) => {
                travel({
                    to: tar,
                    from: projectileRefs[i].current,
                    spin,
                    rotateToFaceTarget,
                    returnToOrigin: animation === ANIMATION_TYPES.YOYO,
                    playbackTime,
                });
            });
        }

        return () => {
            if (actor?.style) {
                actor.style.transform = "unset";
            }
            projectileRefs.forEach((ref) => {
                if (ref?.current?.style) {
                    ref.current.style.transform = "unset";
                }
            });
        };
    }, [eventId]);

    const { icon, type } = action || {};

    return (
        <div className={classes.root}>
            {type === ACTION_TYPES.RANGE_ATTACK && icon && (
                <>
                    {allTargets
                        .filter((val) => val)
                        .map((tar, i) => (
                            <span
                                style={{ position: "fixed", left: actorLeft - PROJECTILE_WIDTH / 2, top: actorTop - PROJECTILE_HEIGHT / 2 }}
                                key={i}
                            >
                                <img src={icon} className={classNames(classes.projectile)} ref={projectileRefs[i]} />
                            </span>
                        ))}
                </>
            )}
        </div>
    );
};

export default AnimationCanvas;

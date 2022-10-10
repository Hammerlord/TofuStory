import classNames from "classnames";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { Action, ACTION_TYPES, ANIMATION_TYPES } from "../ability/types";
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
    iconProjectile: {
        width: PROJECTILE_WIDTH,
        height: PROJECTILE_HEIGHT,
    },
});

const AnimationCanvas = ({
    actor,
    target,
    allTargets = [],
    eventId,
    action,
    playbackTime = 1000,
}: {
    actor?: HTMLElement;
    target?: HTMLElement;
    allTargets?: HTMLElement[];
    eventId?: string;
    action?: Action;
    playbackTime?: number;
}) => {
    const eventIdRef: MutableRefObject<string> = useRef(); // Prevent duplicate playbacks of the same action
    const projectileRefs = Array.from({ length: 5 }).map(() => useRef() as any);
    const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
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

        // HACK: If a one-way projectile animation finishes playing, there can be a flicker where it teleports back to the origination as we wait for the next event to occur.
        // Make the projectile turn invisible when the animation is done in that case.
        setIsAnimationPlaying(true);
        setTimeout(() => setIsAnimationPlaying(false), playbackTime);

        eventIdRef.current = eventId;
        const { type, animation, ricochet } = action || {};
        if (type === ACTION_TYPES.ATTACK && actor) {
            const spin = animation === ANIMATION_TYPES.YOYO || animation === ANIMATION_TYPES.ONE_WAY_SPIN;
            travel({ from: actor, to: target, returnToOrigin: true, spin, playbackTime });
            return;
        }

        if (type === ACTION_TYPES.RANGE_ATTACK) {
            const spin = animation === ANIMATION_TYPES.YOYO || animation === ANIMATION_TYPES.ONE_WAY_SPIN;
            const rotateToFaceTarget = animation === ANIMATION_TYPES.ONE_WAY;
            const animateRangeAttack = (target, projectileRefIndex: number) => {
                travel({
                    from: projectileRefs[projectileRefIndex].current,
                    to: target,
                    spin,
                    rotateToFaceTarget,
                    sidewinder: animation === ANIMATION_TYPES.ONE_WAY_SIDEWINDER,
                    returnToOrigin: animation === ANIMATION_TYPES.YOYO,
                    playbackTime,
                });
            };

            if (ricochet) {
                animateRangeAttack(allTargets, 0);
            } else {
                allTargets.forEach(animateRangeAttack);
            }
        }
    }, [eventId]);

    const { icon, type, ricochet } = action || {};
    const getProjectileElement = (i: number) => {
        if (typeof icon === "string") {
            return <img src={icon} className={classNames(classes.projectile)} ref={projectileRefs[i]} />;
        } else if (typeof icon === "function") {
            const Icon: Function = icon;
            return (
                <div className={classNames(classes.iconProjectile)} ref={projectileRefs[i]}>
                    <Icon />
                </div>
            );
        }
    };

    // TODO This gnarly bit of code is really just because there's one ability that ricochets right now and it's single target, so don't spawn more projectiles than needed
    const projectileTargets = ricochet ? [allTargets[0]] : allTargets;

    return (
        <div className={classes.root}>
            {type === ACTION_TYPES.RANGE_ATTACK && icon && (
                <>
                    {projectileTargets
                        .filter((val) => val)
                        .map((tar, i) => (
                            <span
                                style={{
                                    position: "fixed",
                                    left: actorLeft - PROJECTILE_WIDTH / 2,
                                    top: actorTop - PROJECTILE_HEIGHT / 2,
                                    visibility: isAnimationPlaying ? "visible" : "hidden",
                                }}
                                key={i}
                            >
                                {getProjectileElement(i)}
                            </span>
                        ))}
                </>
            )}
        </div>
    );
};

export default AnimationCanvas;

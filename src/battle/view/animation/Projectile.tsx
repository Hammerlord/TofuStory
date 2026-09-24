import classNames from "classnames";
import { useRef, useMemo, useEffect, FC } from "react";
import { createUseStyles } from "react-jss";
import { ActionAnimation, ANIMATION_TYPES } from "../../../ability/types";
import {
    getCenterCoords,
    playTossUpAnimation,
    playExplodeAnimation,
    playProjectileRainAnimation,
    playHomingAnimation,
    playTargetMarkerAnimation,
    playTravelAnimation,
} from "../../../character/animations";
import { Combatant } from "../../../character/types";
import { getRandomItem } from "../../../utils";
import {
    DEFAULT_PROJECTILE_RAIN_COUNT,
    MAX_BEAM_PROJECTILES,
    MIN_PROJECTILE_SIZE,
    NUM_SPACES_AWAY_DELAY,
    PROJECTILE_HEIGHT,
    PROJECTILE_WIDTH,
} from "./constants";

// Bug with JSS where props are not passed to animation keyframes. Use HO function instead
const useStyles = ({
    brightness = 1,
    flash = 200,
}: {
    brightness?: number;
    flash?: number | boolean;
    playbackTime?: number;
}) => {
    return createUseStyles({
        projectile: {
            objectFit: "contain",
            filter: `brightness(${brightness}) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)`,
            position: "fixed",
            minWidth: 40,
            zIndex: 5,
        },
        projectileInner: {
            height: "100%",
            width: "100%",
        },
        iconProjectile: {
            width: `${PROJECTILE_WIDTH}px`,
            height: `${PROJECTILE_HEIGHT}px`,
            position: "fixed",
            zIndex: 5,
            // HACK: we only want projectiles to be visible for the duration of the animation (see opacity properties in animation.ts). So set projectiles to be invisible otherwise.
            opacity: 0,
        },
        mirrorX: {
            transform: "scale(-1, 1)",
        },
        "@keyframes flash": {
            from: {
                filter: `brightness(${brightness + 0.25}) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 3px #fffee8)`,
            },
            to: {
                filter: `brightness(${brightness + 1.5}) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 3px #fffee8)`,
            },
        },
        flash: {
            animation: "$flash",
            transitionTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDuration: flash as unknown as string | number,
        },
        "@keyframes fadeOut": {
            "0%": {
                opacity: 1,
            },
            "100%": {
                opacity: 0,
            },
        },
        fadeOut: {
            animationName: "$fadeOut",
            animationDuration: `1s`,
        },
    });
};

export const getRotation = (animation: ANIMATION_TYPES) => {
    if ([ANIMATION_TYPES.ONE_WAY_SPIN_FAST].includes(animation)) {
        return 900;
    }
    if ([ANIMATION_TYPES.YOYO, ANIMATION_TYPES.ONE_WAY_SPIN].includes(animation)) {
        return 360;
    }
    if ([ANIMATION_TYPES.SPIN, ANIMATION_TYPES.CONSUMABLE].includes(animation)) {
        return 720;
    }
    return 0;
};

export const Projectile = ({
    actor,
    target,
    playbackTime,
    actionAnimation,
    eventId,
    delay,
}: {
    actor: { element: HTMLElement | null; combatant: Combatant; index: number };
    target:
        | { element: HTMLElement | null; index: number }
        | { element: HTMLElement | null; index: number }[];
    actionAnimation: ActionAnimation;
    playbackTime: number;
    eventId: string;
    delay?: number;
}) => {
    let { image, type: animationType, options } = actionAnimation || {};
    const {
        flash,
        brightness,
        width = MIN_PROJECTILE_SIZE,
        height = MIN_PROJECTILE_SIZE,
        opacity,
        fadeOut,
        mirrorX,
    } = options || {};
    const { element: actorElement, combatant: actorCombatant, index: actorIndex } = actor || {};
    const ref = useRef(null);
    const classes = useStyles({ playbackTime, flash, brightness })();

    const { x: actorX, y: actorY } = useMemo(() => {
        if (!actorElement?.getBoundingClientRect) {
            return { x: 0, y: 0 };
        }

        return getCenterCoords(actorElement);
    }, [actorElement]);

    const props = {
        ref,
        style: {
            left: `${actorX - MIN_PROJECTILE_SIZE / 2}px`,
            top: `${actorY - MIN_PROJECTILE_SIZE / 2}px`,
            width: `${width}px`,
            height: `${height}px`,
        },
    };

    const projectileOverride = actorCombatant?.projectileOverride;
    let projectile = image;
    if (projectile && projectileOverride) {
        if (Array.isArray(projectileOverride) && projectileOverride.length > 0) {
            projectile = getRandomItem(projectileOverride);
        } else if (typeof projectileOverride === "string") {
            projectile = projectileOverride;
        }
    }

    useEffect(() => {
        if (!actorElement || !projectile || !ref.current) {
            return;
        }

        options = {
            ...options,
            spin: options?.spin || getRotation(animationType),
        };

        const object = ref.current;

        if (animationType === ANIMATION_TYPES.CONSUMABLE) {
            playTossUpAnimation({
                ...options,
                from: actorElement,
                object,
                delay,
            });
            return;
        }

        if (animationType === ANIMATION_TYPES.ACTION_EXPLODE) {
            playExplodeAnimation({
                ...options,
                from: actorElement,
                object,
                playbackTime,
                delay,
            });

            return;
        }

        const targets = Array.isArray(target) ? target.map((t) => t.element) : target.element;

        if (animationType === ANIMATION_TYPES.PROJECTILE_RAIN) {
            if (Array.isArray(targets)) {
                targets.forEach((t) => {
                    playProjectileRainAnimation({
                        ...options,
                        to: t,
                        object,
                        playbackTime,
                        delay,
                    });
                });
            } else {
                playProjectileRainAnimation({
                    ...options,
                    to: targets,
                    object,
                    playbackTime,
                    delay,
                });
            }

            return;
        }

        if (animationType === ANIMATION_TYPES.HOMING) {
            if (Array.isArray(targets)) {
                targets.forEach((t) => {
                    playHomingAnimation({
                        ...options,
                        to: t,
                        object,
                        playbackTime,
                    });
                });
            } else {
                playHomingAnimation({
                    ...options,
                    to: targets,
                    object,
                    playbackTime,
                });
            }

            return;
        }

        if (animationType === ANIMATION_TYPES.TARGET_MARKER) {
            if (Array.isArray(targets)) {
                targets.forEach((t) => {
                    playTargetMarkerAnimation({
                        ...options,
                        to: t,
                        object,
                        playbackTime,
                    });
                });
            } else {
                playTargetMarkerAnimation({
                    ...options,
                    to: targets,
                    object,
                    playbackTime,
                });
            }

            return;
        }

        let adjustTimingByDistance = 0;
        if (target && !Array.isArray(target)) {
            const numSpacesAway = Math.abs(target.index - actorIndex);
            adjustTimingByDistance = 300 - numSpacesAway * NUM_SPACES_AWAY_DELAY;
        }

        playTravelAnimation({
            returnToOrigin: animationType === ANIMATION_TYPES.YOYO,
            fadeIn: animationType === ANIMATION_TYPES.BEAM,
            ...options,
            from: actorElement,
            to: targets,
            object,
            playbackTime: playbackTime - adjustTimingByDistance,
            delay,
            startEase: undefined,
        });
    }, [eventId]);

    if (typeof projectile === "string") {
        return (
            <span
                className={classNames(classes.iconProjectile, {
                    [classes.flash]: flash,
                    [classes.fadeOut]: fadeOut,
                })}
                {...props}
            >
                <img
                    src={projectile}
                    className={classNames(classes.projectileInner, {
                        [classes.mirrorX]: mirrorX,
                    })}
                    style={{
                        opacity,
                    }}
                />
            </span>
        );
    }

    if (typeof projectile === "function") {
        const Icon: FC<{ className?: string }> = projectile;
        return (
            <span
                className={classNames(classes.iconProjectile, {
                    [classes.flash]: flash,
                    [classes.fadeOut]: fadeOut,
                })}
                {...props}
            >
                <Icon
                    className={classNames(classes.projectileInner, {
                        [classes.mirrorX]: mirrorX,
                    })}
                />
            </span>
        );
    }

    return null;
};
export const ProjectileGroup = ({
    actionAnimation,
    actor,
    allTargets,
    playbackTime,
    eventId,
    index,
}: {
    actionAnimation: ActionAnimation;
    actor: { element: HTMLElement | null; combatant: Combatant; index: number };
    allTargets: { element: HTMLElement | null; index: number }[];
    playbackTime: number;
    eventId: string;
    index: number;
}) => {
    const { options, type: animationType } = actionAnimation;

    // "Beam" animations shoot a bunch of projectile images, while "projectile rain" drops a couple per target
    const projectileMultiplier =
        animationType === ANIMATION_TYPES.BEAM
            ? MAX_BEAM_PROJECTILES
            : animationType === ANIMATION_TYPES.PROJECTILE_RAIN
              ? (options?.projectileCount ?? DEFAULT_PROJECTILE_RAIN_COUNT)
              : 1;

    if (options?.ricochet) {
        return Array.from({ length: projectileMultiplier }).map((_, i) => (
            <Projectile
                target={allTargets}
                playbackTime={playbackTime}
                eventId={eventId}
                actionAnimation={actionAnimation}
                key={`projectile-${eventId}-${index}-${i}`}
                actor={actor}
                delay={i * 25}
            />
        ));
    }

    return allTargets.map((target) =>
        Array.from({ length: projectileMultiplier }).map((_, i) => (
            <Projectile
                target={target}
                playbackTime={playbackTime}
                eventId={eventId}
                actionAnimation={actionAnimation}
                key={`projectile-${eventId}-${index}-${i}`}
                actor={actor}
                delay={i * 25}
            />
        )),
    );
};

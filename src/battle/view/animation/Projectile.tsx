import classNames from "classnames";
import { useRef, useMemo, useEffect, FC, useContext } from "react";
import { createUseStyles } from "react-jss";
import { ActionAnimation, ACTION_TYPES, ANIMATION_TYPES, ProjectileParticleConfig } from "../../../ability/types";
import {
    getCenterCoords,
    playTossUpAnimation,
    playExplodeAnimation,
    playProjectileRainAnimation,
    playHomingAnimation,
    playTargetMarkerAnimation,
    playArrowAnimation,
    ARROW_IMPACT_DURATION,
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
import { ParticleTrail } from "./ParticleTrail";
import { ProjectileLayerContext } from "./projectileLayerContext";

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
    actionType,
    particles,
}: {
    actor: { element: HTMLElement | null; combatant: Combatant; index: number };
    target:
        | { element: HTMLElement | null; index: number }
        | { element: HTMLElement | null; index: number }[];
    actionAnimation: ActionAnimation;
    playbackTime: number;
    eventId: string;
    delay?: number;
    actionType?: ACTION_TYPES;
    particles?: ProjectileParticleConfig[];
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
    const ref = useRef<HTMLSpanElement>(null);
    const classes = useStyles({ playbackTime, flash, brightness })();
    const projectileLayerRef = useContext(ProjectileLayerContext);

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

        const projectileTargets = Array.isArray(target)
            ? target.map((t) => t.element)
            : target.element;

        if (animationType === ANIMATION_TYPES.PROJECTILE_RAIN) {
            if (Array.isArray(projectileTargets)) {
                projectileTargets.forEach((t) => {
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
                    to: projectileTargets,
                    object,
                    playbackTime,
                    delay,
                });
            }

            return;
        }

        if (animationType === ANIMATION_TYPES.HOMING) {
            if (Array.isArray(projectileTargets)) {
                projectileTargets.forEach((t) => {
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
                    to: projectileTargets,
                    object,
                    playbackTime,
                });
            }

            return;
        }

        if (animationType === ANIMATION_TYPES.TARGET_MARKER) {
            if (Array.isArray(projectileTargets)) {
                projectileTargets.forEach((t) => {
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
                    to: projectileTargets,
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

        if (animationType === ANIMATION_TYPES.ARROW) {
            const arrowClone = object.cloneNode(true) as HTMLElement;
            const overlay = projectileLayerRef?.current;
            if (overlay) {
                overlay.appendChild(arrowClone);
            } else {
                document.body.appendChild(arrowClone);
            }
            arrowClone.style.pointerEvents = "none";

            const animations = playArrowAnimation({
                ...options,
                from: actorElement,
                to: projectileTargets,
                object: arrowClone,
                playbackTime: playbackTime - adjustTimingByDistance,
                delay,
            });

            const removeClone = () => {
                if (arrowClone.isConnected) {
                    arrowClone.remove();
                }
            };

            if (!animations?.length) {
                removeClone();
                return;
            }

            animations[animations.length - 1].onfinish = removeClone;

            const totalAnimationTime =
                (delay || 0) + (playbackTime - adjustTimingByDistance) + ARROW_IMPACT_DURATION;
            window.setTimeout(removeClone, totalAnimationTime + 250);

            return;
        }

        playTravelAnimation({
            returnToOrigin: animationType === ANIMATION_TYPES.YOYO,
            fadeIn: animationType === ANIMATION_TYPES.BEAM,
            ...options,
            from: actorElement,
            to: projectileTargets,
            object,
            playbackTime: playbackTime - adjustTimingByDistance,
            delay,
            startEase: undefined,
        });
    }, [eventId]);

    if (typeof projectile === "string") {
        return (
            <>
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
                <ParticleTrail
                    actor={actor}
                    target={target}
                    particles={particles}
                    playbackTime={playbackTime}
                    delay={delay}
                    animationType={animationType}
                    actionType={actionType}
                    eventId={eventId}
                />
            </>
        );
    }

    if (typeof projectile === "function") {
        const Icon: FC<{ className?: string }> = projectile;
        return (
            <>
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
                <ParticleTrail
                    actor={actor}
                    target={target}
                    particles={particles}
                    playbackTime={playbackTime}
                    delay={delay}
                    animationType={animationType}
                    actionType={actionType}
                    eventId={eventId}
                />
            </>
        );
    }

    return (
        <ParticleTrail
            actor={actor}
            target={target}
            particles={particles}
            playbackTime={playbackTime}
            delay={delay}
            animationType={animationType}
            actionType={actionType}
            eventId={eventId}
        />
    );
};
export const ProjectileGroup = ({
    actionAnimation,
    actor,
    allTargets,
    playbackTime,
    eventId,
    index,
    actionType,
    particles,
}: {
    actionAnimation: ActionAnimation;
    actor: { element: HTMLElement | null; combatant: Combatant; index: number };
    allTargets: { element: HTMLElement | null; index: number }[];
    playbackTime: number;
    eventId: string;
    index: number;
    actionType?: ACTION_TYPES;
    particles?: ProjectileParticleConfig[];
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
                actionType={actionType}
                particles={particles}
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
                actionType={actionType}
                particles={particles}
            />
        )),
    );
};

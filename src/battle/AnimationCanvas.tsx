import classNames from "classnames";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, ANIMATION_TYPES, HandAbility } from "../ability/types";
import { explode, getCenterCoords, sendToPile, shake, tossUp, travel } from "../character/animations";
import { Combatant } from "../character/types";
import { BATTLEFIELD_SIDES, Event } from "./types";
import AbilityView from "../ability/AbilityView/AbilityView";

const PROJECTILE_WIDTH = 50;
const PROJECTILE_HEIGHT = 50;

// Bug with JSS where props are not passed to animation keyframes. Use HO function instead
const useStyles = ({ brightness = 1, flash = 200 }) => {
    return createUseStyles({
        root: {
            pointerEvents: "none", // Not an interactable layer
            position: "fixed",
            width: "100%",
            height: "100%",
            zIndex: 5,
        },
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
            width: PROJECTILE_WIDTH,
            height: PROJECTILE_HEIGHT,
            position: "fixed",
            zIndex: 5,
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
            animationDuration: flash,
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
        abilityContainer: {
            margin: 16,
            display: "inline-block",
            opacity: 0,
        },
        center: {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translateX(-50%) translateY(-50%)",
        },
    });
};

const DISPLACEMENT_SPEED = 500;
const MAX_BEAM_PROJECTILES = 5;

const AnimationCanvas = ({
    event,
    allyRefs = [],
    enemyRefs = [],
    battlefieldRef,
    deckRef,
    discardRef,
    depleteRef,
    initialBattlefield,
}: {
    event?: Event;
    allyRefs?: any[];
    enemyRefs?: any[];
    battlefieldRef;
    deckRef;
    discardRef;
    depleteRef;
    initialBattlefield: { playerSide: (Combatant | null)[]; enemySide: (Combatant | null)[] };
}) => {
    const {
        actorId,
        targetSide,
        selectedIndex,
        allTargetIndices = [],
        action,
        id: eventId,
        playbackTime,
        playerSide,
        enemySide,
    } = event || {};

    const getRefFromCharacterId = (characterId: string): React.RefObject<HTMLElement> => {
        if (!characterId) {
            return;
        }
        const allyIndex = playerSide.findIndex((ally) => characterId === ally?.id);
        if (allyIndex > -1) {
            return allyRefs[allyIndex];
        }

        const enemyIndex = enemySide.findIndex((enemy) => characterId === enemy?.id);
        if (enemyIndex > -1) {
            return enemyRefs[enemyIndex];
        }
    };

    const targets = targetSide === BATTLEFIELD_SIDES.PLAYER_SIDE ? allyRefs : enemyRefs;
    const targetElement = targets[selectedIndex]?.current;
    const allTargets = allTargetIndices.map((i) => targets[i]?.current).filter((v) => v);
    const actorElement = getRefFromCharacterId(actorId)?.current;

    const eventIdRef: MutableRefObject<string> = useRef(); // Prevent duplicate playbacks of the same action
    const projectileRefs = Array.from({ length: MAX_BEAM_PROJECTILES * 5 }).map(() => useRef() as any);
    const depleteCardRefs = Array.from({ length: 5 }).map(() => useRef() as any);

    const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
    const previousBattlefieldRef = useRef(initialBattlefield) as MutableRefObject<any>;
    const { x: actorX, y: actorY } = useMemo(() => {
        if (!actorElement?.getBoundingClientRect) {
            return { x: 0, y: 0 };
        }

        return getCenterCoords(actorElement);
    }, [actorElement]);

    const { icon, ricochet, animation, animationOptions } = action || {};
    const { mirrorX, width, height, rotateToFaceTarget, rotate, opacity, flash, fadeOut, sidewinder, brightness } = animationOptions || {};
    const classes = useStyles({ playbackTime, flash, brightness } as any)();

    // "Beam" animations shoot a bunch of projectile images
    const beamProjectileMultiplier = animation === ANIMATION_TYPES.BEAM ? MAX_BEAM_PROJECTILES : 1;

    const animationRefs = useRef([]);

    useEffect(() => {
        if (!targetElement || !action || eventIdRef.current === eventId || !actorElement) {
            return;
        }

        // HACK: If a one-way projectile animation finishes playing, there can be a flicker where it teleports back to the origination as we wait for the next event to occur.
        // Make the projectile turn invisible when the animation is done in that case.
        setIsAnimationPlaying(true);
        setTimeout(() => setIsAnimationPlaying(false), playbackTime - 10);

        eventIdRef.current = eventId;
        const { type, animation, ricochet, icon } = action || {};
        let spin = 0;
        if ([ANIMATION_TYPES.ONE_WAY_SPIN_FAST].includes(animation)) {
            spin = 900;
        } else if ([ANIMATION_TYPES.YOYO, ANIMATION_TYPES.ONE_WAY_SPIN].includes(animation)) {
            spin = 360;
        } else if ([ANIMATION_TYPES.SPIN].includes(animation)) {
            spin = 720;
        }

        animationRefs.current?.forEach((animation) => animation?.cancel());
        animationRefs.current = [];

        const options = { spin, rotation: rotate, playbackTime, rotateToFaceTarget };

        if (icon) {
            const animateProjectile = (target, projectileRefIndex: number) => {
                const refsFrom = projectileRefIndex * beamProjectileMultiplier;
                const refsTo = refsFrom + 1 * beamProjectileMultiplier;
                const object = projectileRefs.slice(refsFrom, refsTo).map((ref) => ref.current);

                if (animation === ANIMATION_TYPES.CONSUMABLE) {
                    animationRefs.current = tossUp({
                        from: actorElement,
                        object,
                        ...options,
                    });
                } else if (animation === ANIMATION_TYPES.ACTION_EXPLODE) {
                    animationRefs.current = explode({
                        from: actorElement,
                        object,
                        ...options,
                    });
                } else {
                    animationRefs.current = travel({
                        from: actorElement,
                        to: target,
                        object,
                        sidewinder,
                        returnToOrigin: animation === ANIMATION_TYPES.YOYO,
                        fadeIn: animation === ANIMATION_TYPES.BEAM,
                        ...options,
                    });
                }
            };

            if (ricochet) {
                animateProjectile(allTargets, 0);
            } else {
                allTargets.forEach(animateProjectile);
            }
        } else if (type === ACTION_TYPES.ATTACK || animation === ANIMATION_TYPES.ONE_WAY) {
            animationRefs.current = travel({ from: actorElement, to: targetElement, returnToOrigin: true, ...options });
        } else if (animation === ANIMATION_TYPES.SPIN) {
            animationRefs.current = travel({ from: actorElement, to: targetElement, ...options });
        }

        const checkHandleDisplacement = (combatantId: string) => {
            let side = BATTLEFIELD_SIDES.PLAYER_SIDE;
            let currentIndex = playerSide.findIndex((combatant) => combatantId === combatant?.id);
            if (currentIndex === -1) {
                currentIndex = enemySide.findIndex((combatant) => combatantId === combatant?.id);
                side = BATTLEFIELD_SIDES.ENEMY_SIDE;
            }

            if (currentIndex === -1) {
                return;
            }

            const prevIndex = previousBattlefieldRef.current[side].findIndex((combatant) => combatantId === combatant?.id);
            if (prevIndex === -1 || prevIndex === currentIndex) {
                return;
            }

            const refs = side === BATTLEFIELD_SIDES.PLAYER_SIDE ? allyRefs : enemyRefs;
            animationRefs.current = travel({
                object: refs[currentIndex]?.current,
                from: refs[prevIndex]?.current,
                to: refs[currentIndex]?.current,
                playbackTime: DISPLACEMENT_SPEED,
                freezeAxis: "y",
            });
        };

        playerSide.concat(enemySide).forEach((combatant) => {
            if (combatant) {
                checkHandleDisplacement(combatant.id);
            }
        });

        setTimeout(() => {
            previousBattlefieldRef.current = {
                playerSide,
                enemySide,
            };
        }, DISPLACEMENT_SPEED);

        if (animation === ANIMATION_TYPES.STOMP && battlefieldRef.current) {
            const shakeDuration = 175;
            shake({ object: battlefieldRef.current, delay: playbackTime - shakeDuration, playbackTime: shakeDuration });
        }
    }, [eventId]);

    useEffect(() => {
        depleteCardRefs.forEach((ref) => {
            if (ref.current) {
                animationRefs.current.push(
                    sendToPile({ object: ref.current, playbackTime: playbackTime - 250, to: depleteRef.current, desaturate: true })
                );
            }
        });
    }, [eventId]);

    const getProjectileElement = (i: number) => {
        const projectileDimensions = { width: 70, height: 70 };
        const props = {
            key: i,
            ref: projectileRefs[i],
            style: {
                visibility: isAnimationPlaying ? "visible" : "hidden",
                left: actorX - projectileDimensions.width / 2,
                top: actorY - projectileDimensions.height / 2,
                width,
                height,
            },
        } as any;

        if (typeof icon === "string") {
            return (
                <div
                    className={classNames(classes.iconProjectile, {
                        [classes.flash]: flash,
                        [classes.fadeOut]: fadeOut,
                    })}
                    {...props}
                >
                    <img
                        src={icon}
                        className={classNames(classes.projectileInner, {
                            [classes.mirrorX]: mirrorX,
                        })}
                        style={{
                            opacity,
                        }}
                    />
                </div>
            );
        } else if (typeof icon === "function") {
            const Icon: Function = icon;
            return (
                <div
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
                </div>
            );
        }
    };

    // TODO This gnarly bit of code is really just because there's one ability that ricochets right now and it's single target, so don't spawn more projectiles than needed
    const projectileTargets = ricochet ? [allTargets[0]] : allTargets;
    const numProjectiles = projectileTargets.filter((val) => val).length * beamProjectileMultiplier;

    return (
        <div className={classNames("animation-canvas", classes.root)}>
            {icon && <>{Array.from({ length: numProjectiles }).map((_, i) => getProjectileElement(i))}</>}
            <div className={classes.center}>
                {event?.newDepleteCards?.map((ability: HandAbility, i) => (
                    <div className={classes.abilityContainer} ref={depleteCardRefs[i]} key={ability.instanceId}>
                        <AbilityView ability={ability} disableGlow={true} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnimationCanvas;

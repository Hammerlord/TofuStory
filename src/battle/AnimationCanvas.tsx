import classNames from "classnames";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, ANIMATION_TYPES } from "../ability/types";
import { getCenterCoords, travel } from "../character/animations";
import { Combatant } from "../character/types";
import { BATTLEFIELD_SIDES, Event } from "./types";

const PROJECTILE_WIDTH = 50;
const PROJECTILE_HEIGHT = 50;

const useStyles = createUseStyles({
    root: {
        pointerEvents: "none", // Not an interactable layer
        position: "fixed",
        width: "100%",
        height: "100%",
    },
    projectile: {
        objectFit: "contain",
        WebkitFilter: "brightness(1) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        filter: "brightness(1) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
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
    "@keyframes explodeAnimation": {
        from: {
            transform: "scale(1)",
            WebkitFilter: "brightness(1.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            filter: "brightness(1.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            opacity: 0.8,
        },
        to: {
            transform: "scale(7)",
            opacity: 0,
            WebkitFilter: "brightness(3) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            filter: "brightness(3) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        },
    },
    exploding: {
        animation: "$explodeAnimation",
        transitionTimingFunction: "ease-in-out",
        animationIterationCount: 1,
        animationDuration: ({ playbackTime = 0 }: any) => `${playbackTime / 1000}s`,
        maxWidth: "100px",
    },
    mirrorX: {
        transform: "scale(-1, 1)",
    },
    "@keyframes flash": {
        from: {
            WebkitFilter: "brightness(1.25) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 3px #fffee8)",
            filter: "brightness(1.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 3px #fffee8)",
        },
        to: {
            WebkitFilter: "brightness(2.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 3px #fffee8)",
            filter: "brightness(2.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 3px #fffee8)",
        },
    },
    flash: {
        animation: "$flash",
        transitionTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        animationDuration: 200,
    },
});

const DISPLACEMENT_SPEED = 500;
const MAX_BEAM_PROJECTILES = 5;

const AnimationCanvas = ({
    event,
    allyRefs = [],
    enemyRefs = [],
    initialBattlefield,
}: {
    event?: Event;
    allyRefs?: any[];
    enemyRefs?: any[];
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
    const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
    const previousBattlefieldRef = useRef(initialBattlefield) as MutableRefObject<any>;
    const { x: actorX, y: actorY } = useMemo(() => {
        if (!actorElement?.getBoundingClientRect) {
            return { x: 0, y: 0 };
        }

        return getCenterCoords(actorElement);
    }, [actorElement]);
    const classes = useStyles({ playbackTime } as any);

    const { icon, ricochet, animation, animationOptions } = action || {};
    const { mirrorX, width, height, rotateToFaceTarget, rotate, opacity } = animationOptions || {};

    // "Beam" animations shoot a bunch of projectile images
    const beamProjectileMultiplier = animation === ANIMATION_TYPES.BEAM ? MAX_BEAM_PROJECTILES : 1;

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

        const options = { spin, rotation: rotate, playbackTime };
        if (icon && animation !== ANIMATION_TYPES.ACTION_EXPLODE) {
            const animateProjectile = (target, projectileRefIndex: number) => {
                const refsFrom = projectileRefIndex * beamProjectileMultiplier;
                const refsTo = refsFrom + 1 * beamProjectileMultiplier;
                const object = projectileRefs.slice(refsFrom, refsTo).map((ref) => ref.current);
                travel({
                    from: actorElement,
                    to: target,
                    object,
                    rotateToFaceTarget,
                    sidewinder: animation === ANIMATION_TYPES.ONE_WAY_SIDEWINDER,
                    returnToOrigin: animation === ANIMATION_TYPES.YOYO,
                    fadeIn: animation === ANIMATION_TYPES.BEAM,
                    ...options,
                });
            };

            if (ricochet) {
                animateProjectile(allTargets, 0);
            } else {
                allTargets.forEach(animateProjectile);
            }
        } else if (type === ACTION_TYPES.ATTACK || animation === ANIMATION_TYPES.ONE_WAY) {
            travel({ from: actorElement, to: targetElement, returnToOrigin: true, ...options });
        } else if (animation === ANIMATION_TYPES.SPIN) {
            travel({ from: actorElement, to: targetElement, ...options });
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
            travel({
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
    }, [eventId]);

    const getProjectileElement = (i: number) => {
        const projectileDimensions = projectileRefs[i].current?.getBoundingClientRect() || { width: 70, height: 70 };
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
                        [classes.exploding]: animation === ANIMATION_TYPES.ACTION_EXPLODE,
                        [classes.flash]: animationOptions.flash,
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
                        [classes.exploding]: animation === ANIMATION_TYPES.ACTION_EXPLODE,
                        [classes.flash]: animationOptions.flash,
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
        <div className={classes.root}>{icon && <>{Array.from({ length: numProjectiles }).map((_, i) => getProjectileElement(i))}</>}</div>
    );
};

export default AnimationCanvas;

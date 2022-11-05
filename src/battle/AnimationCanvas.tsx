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
        zIndex: 5,
    },
    iconProjectile: {
        width: PROJECTILE_WIDTH,
        height: PROJECTILE_HEIGHT,
        position: "fixed",
        zIndex: 5,
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
    const classes = useStyles();

    const { icon, ricochet, animation } = action || {};

    // "Beam" animations shoot a bunch of projectile images
    const beamProjectileMultiplier = animation === ANIMATION_TYPES.BEAM ? MAX_BEAM_PROJECTILES : 1;

    useEffect(() => {
        if (!targetElement || !action || eventIdRef.current === eventId || !actorElement) {
            return;
        }

        // HACK: If a one-way projectile animation finishes playing, there can be a flicker where it teleports back to the origination as we wait for the next event to occur.
        // Make the projectile turn invisible when the animation is done in that case.
        setIsAnimationPlaying(true);
        setTimeout(() => setIsAnimationPlaying(false), playbackTime);

        eventIdRef.current = eventId;
        const { type, animation, ricochet, icon } = action || {};
        let spin = 0;
        if (animation === ANIMATION_TYPES.ONE_WAY_SPIN_FAST) {
            spin = 900;
        } else if ([ANIMATION_TYPES.YOYO, ANIMATION_TYPES.ONE_WAY_SPIN].includes(animation)) {
            spin = 360;
        }

        if (icon) {
            const rotateToFaceTarget = animation === ANIMATION_TYPES.ONE_WAY;
            const animateProjectile = (target, projectileRefIndex: number) => {
                const refsFrom = projectileRefIndex * beamProjectileMultiplier;
                const refsTo = refsFrom + 1 * beamProjectileMultiplier;
                const object = projectileRefs.slice(refsFrom, refsTo).map((ref) => ref.current);
                travel({
                    from: actorElement,
                    to: target,
                    object,
                    spin,
                    rotateToFaceTarget,
                    sidewinder: animation === ANIMATION_TYPES.ONE_WAY_SIDEWINDER,
                    returnToOrigin: animation === ANIMATION_TYPES.YOYO,
                    playbackTime,
                    fadeIn: animation === ANIMATION_TYPES.BEAM,
                });
            };

            if (ricochet) {
                animateProjectile(allTargets, 0);
            } else {
                allTargets.forEach(animateProjectile);
            }
        } else if (type === ACTION_TYPES.ATTACK || animation === ANIMATION_TYPES.ONE_WAY) {
            travel({ from: actorElement, to: targetElement, returnToOrigin: true, spin, playbackTime });
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
            },
        } as any;

        if (typeof icon === "string") {
            return <img src={icon} className={classNames(classes.projectile)} {...props} />;
        } else if (typeof icon === "function") {
            const Icon: Function = icon;
            return (
                <div className={classNames(classes.iconProjectile)} {...props}>
                    <Icon />
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

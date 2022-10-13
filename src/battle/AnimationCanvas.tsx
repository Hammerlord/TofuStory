import classNames from "classnames";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { Ability, Action, ACTION_TYPES, ANIMATION_TYPES } from "../ability/types";
import { travel } from "../character/animations";
import { Combatant } from "../character/types";
import { Item } from "../item/types";
import { BATTLEFIELD_SIDES, Event } from "./types";

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

const DISPLACEMENT_SPEED = 500;

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
    const projectileRefs = Array.from({ length: 5 }).map(() => useRef() as any);
    const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
    const previousBattlefieldRef = useRef(initialBattlefield) as MutableRefObject<any>;
    const { left: actorLeft, top: actorTop } = useMemo(() => {
        if (!actorElement?.getBoundingClientRect) {
            return {};
        }
        const { left, top, height, width } = actorElement?.getBoundingClientRect();
        return {
            left: left + width / 2,
            top: top + height / 2,
        };
    }, [actorElement]);
    const classes = useStyles();

    useEffect(() => {
        if (!targetElement || !action || eventIdRef.current === eventId || !actorElement) {
            return;
        }

        // HACK: If a one-way projectile animation finishes playing, there can be a flicker where it teleports back to the origination as we wait for the next event to occur.
        // Make the projectile turn invisible when the animation is done in that case.
        setIsAnimationPlaying(true);
        setTimeout(() => setIsAnimationPlaying(false), playbackTime);

        eventIdRef.current = eventId;
        const { type, animation, ricochet } = action || {};
        const spin = animation === ANIMATION_TYPES.YOYO || animation === ANIMATION_TYPES.ONE_WAY_SPIN;

        if (type === ACTION_TYPES.ATTACK) {
            travel({ from: actorElement, to: targetElement, returnToOrigin: true, spin, playbackTime });
        } else if (type === ACTION_TYPES.RANGE_ATTACK) {
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

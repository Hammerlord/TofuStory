import classNames from "classnames";
import { RefObject, useEffect, useRef } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, ActionAnimation, ANIMATION_TYPES } from "../../../ability/types";
import {
    getCenterCoords,
    playExplodeAnimation,
    playShakeAnimation,
    playStompAnimation,
    playTravelAnimation,
} from "../../../character/animations";
import { Combatant } from "../../../character/types";
import { BATTLEFIELD_SIDES, EventGroup } from "../../types";
import CardAnimations from "./CardAnimations";
import { getRotation, ProjectileGroup } from "./Projectile";
import { ProjectileLayerContext } from "./projectileLayerContext";
import { DISPLACEMENT_SPEED, NUM_SPACES_AWAY_DELAY } from "./constants";

const useStyles = createUseStyles({
    root: {
        pointerEvents: "none", // Not an interactable layer
        position: "fixed",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: 5,
    },
});

/**
 * Normalized direction from `from` toward `to`, used to shake the battlefield
 * diagonally based on the relative positions of the attacker and the defender.
 * Falls back to a pure vertical bias when either element is unavailable.
 */
const getShakeDirection = (
    from: HTMLElement | null | undefined,
    to: HTMLElement | null | undefined,
    fallback: { x: number; y: number },
): { x: number; y: number } => {
    if (!from || !to) {
        return fallback;
    }

    const { x, y } = getCenterCoords(from);
    const { x: x2, y: y2 } = getCenterCoords(to);

    const xDiff = x2 - x;
    const yDiff = y2 - y;
    const distance = Math.hypot(xDiff, yDiff);
    if (distance === 0) {
        return fallback;
    }

    return { x: xDiff / distance, y: yDiff / distance };
};

/**
 * Component that controls animations such as moving an attacker to its target, or a projectile
 */
const AnimationCanvas = ({
    eventGroup: eventGroup,
    allyRefs = [],
    enemyRefs = [],
    battlefieldRef,
    deckRef,
    discardRef,
    depleteRef,
}: {
    eventGroup?: EventGroup;
    allyRefs?: RefObject<HTMLElement | null>[];
    enemyRefs?: RefObject<HTMLElement | null>[];
    battlefieldRef: RefObject<HTMLElement | null>;
    deckRef: RefObject<HTMLElement | null>;
    discardRef: RefObject<HTMLElement | null>;
    depleteRef: RefObject<HTMLElement | null>;
}) => {
    const {
        id: eventId,
        playbackTime = 0,
        playerSide = [],
        enemySide = [],
        displacements,
    } = eventGroup || {};
    const {
        actorId,
        targetSide,
        selectedIndex,
        allTargetIndices = [],
        action,
    } = eventGroup?.events[0] || {};

    const getIndexFromCharacterId = (characterId?: string): number | undefined => {
        if (!characterId) {
            return;
        }
        const allyIndex = playerSide.findIndex((ally) => characterId === ally?.id);
        if (allyIndex > -1) {
            return allyIndex;
        }
        return enemySide.findIndex((enemy) => characterId === enemy?.id);
    };

    const getRefFromCharacterId = (
        characterId?: string,
    ): RefObject<HTMLElement | null> | undefined => {
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

    const getCombatantFromId = (characterId?: string): Combatant | null | undefined => {
        if (!characterId) {
            return;
        }

        return playerSide.concat(enemySide).find((c: Combatant | null) => c?.id === characterId);
    };

    const targets = targetSide === BATTLEFIELD_SIDES.PLAYER_SIDE ? allyRefs : enemyRefs;
    const targetElement = targets[selectedIndex]?.current;
    const allTargets: { element: HTMLElement | null; index: number }[] = allTargetIndices
        .map((i) => {
            const ref = targets[i];
            return ref?.current ? { element: ref.current, index: i } : null;
        })
        .filter((v): v is { element: HTMLElement; index: number } => !!v);

    const actorElement = getRefFromCharacterId(actorId)?.current;

    const {
        icon,
        animation,
        animationOptions,
        animations = [],
        type: actionType,
        damage: actionDamage = 0,
    } = action || {};

    const classes = useStyles();

    const projectileLayerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!actorElement) {
            return;
        }

        const handleCharacterAnimation = (animationConfig: ActionAnimation) => {
            let { type: animationType, options } = animationConfig;
            options = {
                ...options,
                spin: options?.spin || getRotation(animationType),
            };

            if (animationType === ANIMATION_TYPES.SPIN) {
                playTravelAnimation({
                    from: actorElement,
                    to: targetElement,
                    ...options,
                    playbackTime,
                });
                return;
            }

            if (animationType === ANIMATION_TYPES.EXPLODE) {
                playExplodeAnimation({
                    from: actorElement,
                    playbackTime: playbackTime - 250,
                });
                return;
            }

            if (animationType === ANIMATION_TYPES.STOMP) {
                const shakeDuration = 175;
                const stompPlayback = playbackTime - shakeDuration - 100; // -100: just make it a little shorter
                if (battlefieldRef.current && !options?.disableScreenShake) {
                    playShakeAnimation({
                        object: battlefieldRef.current,
                        delay: stompPlayback,
                        playbackTime: shakeDuration,
                    });
                }

                playStompAnimation({
                    object: actorElement,
                    playbackTime: stompPlayback,
                });
                return;
            }

            if (actionType === ACTION_TYPES.ATTACK) {
                const numSpacesAway = Math.abs(selectedIndex - getIndexFromCharacterId(actorId));
                let adjustTimingByDistance =
                    NUM_SPACES_AWAY_DELAY * 4 - numSpacesAway * NUM_SPACES_AWAY_DELAY;
                const windup =
                    actionType === ACTION_TYPES.ATTACK ? Math.min(20, 5 * actionDamage) : 0;

                playTravelAnimation({
                    from: actorElement,
                    to: options?.ricochet ? allTargets.map((t) => t.element) : targetElement,
                    returnToOrigin: true,
                    windup: windup,
                    ...options,
                    playbackTime: playbackTime - adjustTimingByDistance,
                });
            }
        };

        handleCharacterAnimation({
            image: icon,
            type: animation,
            options: animationOptions,
        });
        if (Array.isArray(animations)) {
            animations.forEach(handleCharacterAnimation);
        }

        const battlefield = battlefieldRef.current;
        if (battlefield) {
            eventGroup?.events.forEach((event) => {
                if (!event.statUpdates) {
                    return;
                }

                Object.entries(event.statUpdates).forEach(([combatantId, statUpdate]) => {
                    const damage = statUpdate.healthDamage || 0;
                    if (damage === 0 || statUpdate.missed) {
                        return;
                    }

                    const isPlayerTarget = event.targetSide === BATTLEFIELD_SIDES.PLAYER_SIDE;
                    // Diagonal shake from the attacker toward whoever took the hit.
                    // Falls back to a vertical bias (toward the damaged side) when no actor/element is available.
                    const direction = getShakeDirection(
                        getRefFromCharacterId(event.actorId)?.current,
                        getRefFromCharacterId(combatantId)?.current,
                        isPlayerTarget ? { x: 0, y: 1 } : { x: 0, y: -1 },
                    );
                    const amplitude = Math.min(0.5, damage * 0.01);
                    const shakeDuration = 175;
                    playShakeAnimation({
                        object: battlefield,
                        delay: playbackTime / 2,
                        playbackTime: shakeDuration,
                        direction,
                        amplitude,
                    });
                });
            });
        }
    }, [eventId]);

    /**
     * Side effect for displacement playback
     */
    useEffect(() => {
        const checkHandleDisplacement = (combatantId: string) => {
            const displacement = displacements?.[combatantId];
            if (!displacement) {
                return;
            }

            const { from, to, side } = displacement;

            const refs = side === BATTLEFIELD_SIDES.PLAYER_SIDE ? allyRefs : enemyRefs;
            playTravelAnimation({
                object: refs[to]?.current,
                from: refs[from]?.current,
                to: refs[to]?.current,
                playbackTime: DISPLACEMENT_SPEED,
                freezeAxis: "y",
                fill: "forwards",
                fadeIn: "fast",
            });
        };

        playerSide.concat(enemySide).forEach((combatant) => {
            if (combatant) {
                checkHandleDisplacement(combatant.id);
            }
        });
    }, [eventId, allyRefs, enemyRefs]);

    const projectileGroups = [
        { image: icon, type: animation, options: animationOptions },
        ...animations,
    ];
    const actor: {
        element: HTMLElement | null | undefined;
        combatant: Combatant | null | undefined;
        index: number | undefined;
    } = {
        element: actorElement,
        combatant: getCombatantFromId(actorId),
        index: getIndexFromCharacterId(actorId),
    };

    const projectileParticles = actor.combatant?.effects.find(
        (effect) => effect.projectileParticles,
    )?.projectileParticles;

    return (
        <ProjectileLayerContext.Provider value={projectileLayerRef}>
            <div
                className={classNames("animation-canvas", classes.root)}
                ref={(node) => {
                    projectileLayerRef.current = node;
                }}
            >
                {projectileGroups.map((group, i) => (
                    <ProjectileGroup
                        actionAnimation={group}
                        allTargets={allTargets}
                        key={`${eventId}-${i}`}
                        eventId={eventId}
                        playbackTime={playbackTime}
                        actor={actor}
                        index={i}
                        actionType={actionType}
                        particles={projectileParticles}
                    />
                ))}
                <CardAnimations
                    eventGroup={eventGroup}
                    deckRef={deckRef}
                    discardRef={discardRef}
                    depleteRef={depleteRef}
                />
            </div>
        </ProjectileLayerContext.Provider>
    );
};

export default AnimationCanvas;

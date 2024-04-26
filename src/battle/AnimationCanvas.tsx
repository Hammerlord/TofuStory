import classNames from "classnames";
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, ANIMATION_TYPES, CombatAbility } from "../ability/types";
import {
    playExplodeAnimation,
    getCenterCoords,
    playStompAnimation,
    sendToPile,
    playShakeAnimation,
    playTossUpAnimation,
    playTravelAnimation,
    refreshToPile,
} from "../character/animations";
import { Combatant } from "../character/types";
import { BATTLEFIELD_SIDES, Event } from "./types";
import AbilityView from "../ability/AbilityView/AbilityView";
import { useAppDispatch, useAppSelector } from "../hooks";
import { battleStateSlice } from "./reducer";
import { MapleLeavesImage } from "../images";
import { DECK_CYCLE_TIME } from "../constants";
import { Fireworks } from "../fireworks/fireworks";

const PROJECTILE_WIDTH = 50;
const PROJECTILE_HEIGHT = 50;

// For the animated cards that refresh from the discard back to the deck
const CARD_WIDTH = 50;
const CARD_HEIGHT = 75;

// Bug with JSS where props are not passed to animation keyframes. Use HO function instead
const useStyles = ({ brightness = 1, flash = 200 }) => {
    return createUseStyles({
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
        cycledAbilityContainer: {
            position: "fixed",
            opacity: 0,
            background: "#176fbd",
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            borderRadius: "4px",
            border: "3px solid white",
            boxSizing: "content-box",
            "&:before": {
                content: "' '",
                backgroundImage: `url(${MapleLeavesImage})`,
                width: "100%",
                height: "100%",
                opacity: 0.1,
                display: "block",
                position: "absolute",
                left: 0,
                top: 0,
                backgroundPosition: "50% 0",
            },
        },
    });
};

const DISPLACEMENT_SPEED = 500;
const MAX_BEAM_PROJECTILES = 5;
const projectileElementCount = 100;

const { updateBattle } = battleStateSlice.actions;

/**
 * Component that controls animations such as moving an attacker to its target, or a projectile
 */
const AnimationCanvas = ({
    event,
    allyRefs = [],
    enemyRefs = [],
    battlefieldRef,
    deckRef,
    discardRef,
    depleteRef,
}: {
    event?: Event;
    allyRefs?: any[];
    enemyRefs?: any[];
    battlefieldRef;
    deckRef;
    discardRef;
    depleteRef;
}) => {
    const {
        actorId,
        targetSide,
        selectedIndex,
        allTargetIndices = [],
        action,
        id: eventId,
        playbackTime,
        playerSide = [],
        enemySide = [],
        displacements,
    } = event || {};

    const { battle } = useAppSelector((state) => state);
    const { deck, deckCycled } = battle;
    const dispatch = useAppDispatch();

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

    const projectileRefs = Array.from({ length: projectileElementCount }).map(() => useRef() as any);
    const addCardRefs = Array.from({ length: 5 }).map(() => useRef() as any);
    const deckCycleRefs = Array.from({ length: 100 }).map(() => useRef());

    const { x: actorX, y: actorY } = useMemo(() => {
        if (!actorElement?.getBoundingClientRect) {
            return { x: 0, y: 0 };
        }

        return getCenterCoords(actorElement);
    }, [actorElement]);

    const { x: discardX, y: discardY } = useMemo(() => {
        if (!discardRef?.current?.getBoundingClientRect) {
            return { x: 0, y: 0 };
        }

        return getCenterCoords(discardRef.current);
    }, [discardRef?.current]);

    const { icon, animation, animationOptions } = action || {};
    const {
        mirrorX,
        width,
        height,
        rotateToFaceTarget,
        rotate,
        opacity,
        flash,
        fadeOut,
        sidewinder,
        brightness,
        ricochet,
        disableScreenShake,
    } = animationOptions || {};
    const classes = useStyles({ playbackTime, flash, brightness } as any)();

    // "Beam" animations shoot a bunch of projectile images
    const beamProjectileMultiplier = animation === ANIMATION_TYPES.BEAM ? MAX_BEAM_PROJECTILES : 1;

    const animationRefs = useRef([]);

    useEffect(() => {
        if (!targetElement || !action || !actorElement) {
            return;
        }

        const { type, animation, icon } = action || {};
        let spin = 0;
        if ([ANIMATION_TYPES.ONE_WAY_SPIN_FAST].includes(animation)) {
            spin = 900;
        } else if ([ANIMATION_TYPES.YOYO, ANIMATION_TYPES.ONE_WAY_SPIN].includes(animation)) {
            spin = 360;
        } else if ([ANIMATION_TYPES.SPIN].includes(animation)) {
            spin = 720;
        }

        const options = { spin, rotation: rotate, playbackTime: playbackTime, rotateToFaceTarget };
        animationRefs.current.forEach((animation) => animation.cancel());
        animationRefs.current = [];

        if (icon) {
            const animateProjectile = (target, projectileRefIndex: number = 0) => {
                const refsFrom = projectileRefIndex * beamProjectileMultiplier;
                const refsTo = refsFrom + 1 * beamProjectileMultiplier;
                const object = projectileRefs.slice(refsFrom, refsTo).map((ref) => ref.current);

                if (animation === ANIMATION_TYPES.CONSUMABLE) {
                    const animations = playTossUpAnimation({
                        from: actorElement,
                        object,
                        ...options,
                    });
                    animationRefs.current.push(...animations);
                } else if (animation === ANIMATION_TYPES.ACTION_EXPLODE) {
                    const animations = playExplodeAnimation({
                        from: actorElement,
                        object,
                        ...options,
                    });

                    animationRefs.current.push(...animations);
                } else {
                    const animations = playTravelAnimation({
                        from: actorElement,
                        to: target,
                        object,
                        sidewinder,
                        returnToOrigin: animation === ANIMATION_TYPES.YOYO,
                        fadeIn: animation === ANIMATION_TYPES.BEAM,
                        ...options,
                        playbackTime: playbackTime - 250,
                    });

                    if (animations?.length) {
                        animationRefs.current.push(...animations);
                    }
                }
            };

            if (ricochet) {
                animateProjectile(allTargets);
            } else {
                allTargets.forEach(animateProjectile);
            }
        } else if (animation === ANIMATION_TYPES.STOMP) {
            const shakeDuration = 175;
            const stompPlayback = playbackTime - shakeDuration - 100; // -100: just make it a little shorter
            if (battlefieldRef.current && !disableScreenShake) {
                playShakeAnimation({ object: battlefieldRef.current, delay: stompPlayback, playbackTime: shakeDuration });
            }

            animationRefs.current.push(playStompAnimation({ object: actorElement, playbackTime: stompPlayback }));
        } else if (animation === ANIMATION_TYPES.SPIN) {
            animationRefs.current = playTravelAnimation({ from: actorElement, to: targetElement, ...options });
        } else if (animation === ANIMATION_TYPES.EXPLODE) {
            animationRefs.current = playExplodeAnimation({ from: actorElement, playbackTime: playbackTime - 250 });
        } else if (type === ACTION_TYPES.ATTACK || animation === ANIMATION_TYPES.ONE_WAY) {
            animationRefs.current = playTravelAnimation({
                from: actorElement,
                to: ricochet ? allTargets : targetElement,
                returnToOrigin: true,
                ...options,
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

    useEffect(() => {
        const addedTo = event?.cardsAddedTo;
        addCardRefs.forEach((ref) => {
            let props;
            if (addedTo === "deplete") {
                props = {
                    to: depleteRef.current,
                    desaturate: true,
                    darken: true,
                };
            } else if (addedTo === "deck") {
                props = {
                    to: deckRef.current,
                };
            } else if (addedTo === "discard") {
                props = {
                    to: discardRef.current,
                    desaturate: true,
                };
            }

            // No animation for added to hand -- having the hand gain cards will suffice
            if (ref.current && props) {
                animationRefs.current.push(sendToPile({ object: ref.current, playbackTime, ...props }));
            }
        });
    }, [eventId]);

    useEffect(() => {
        if (!deckCycled) {
            return;
        }

        const animations = deckCycleRefs.slice(0, deck.length).map((ref, i) => {
            return refreshToPile({ object: ref.current, playbackTime: DECK_CYCLE_TIME, to: deckRef.current, delay: i * 25 });
        });

        if (animations?.length) {
            animations[animations.length - 1].onfinish = () => dispatch(updateBattle({ deckCycled: false }));
        } else {
            dispatch(updateBattle({ deckCycled: false }));
        }
    }, [deckCycled, deck]);

    const getProjectileElement = (i: number) => {
        const projectileDimensions = { width: 70, height: 70 };
        const props = {
            key: i,
            ref: projectileRefs[i],
            style: {
                left: actorX - projectileDimensions.width / 2,
                top: actorY - projectileDimensions.height / 2,
                width,
                height,
            },
        } as any;

        if (typeof icon === "string") {
            return (
                <span
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
                </span>
            );
        } else if (typeof icon === "function") {
            const Icon: Function = icon;
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
    };

    // TODO This gnarly bit of code is really just because there's one ability that ricochets right now and it's single target, so don't spawn more projectiles than needed
    const projectileTargets = ricochet ? [allTargets[0]] : allTargets;
    const numProjectiles = projectileTargets.filter((val) => val).length * beamProjectileMultiplier;

    return (
        <div className={classNames("animation-canvas", classes.root)}>
            {Array.from({ length: numProjectiles }).map((_, i) => getProjectileElement(i))}
            <div className={classes.center}>
                {event?.newCards?.map((ability: CombatAbility, i) => (
                    <div className={classes.abilityContainer} ref={addCardRefs[i]} key={ability.instanceId || i}>
                        <AbilityView ability={ability} disableGlow={true} />
                    </div>
                ))}
            </div>
            {deckCycled &&
                deck.map((card, i) => (
                    <div
                        ref={deckCycleRefs[i]}
                        className={classes.cycledAbilityContainer}
                        key={card.instanceId || i}
                        style={{
                            left: discardX - CARD_WIDTH / 2,
                            top: discardY - CARD_HEIGHT / 2,
                        }}
                    ></div>
                ))}
        </div>
    );
};

export default AnimationCanvas;

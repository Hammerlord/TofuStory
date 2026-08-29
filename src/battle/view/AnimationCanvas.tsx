import classNames from "classnames";
import { FC, RefObject, useEffect, useMemo, useRef } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../../ability/AbilityView/AbilityView";
import {
    Ability,
    ACTION_TYPES,
    ActionAnimation,
    ANIMATION_TYPES,
    AnimationOptions,
    CARD_PILE_TYPES,
    CardPileType,
    CombatAbility,
} from "../../ability/types";
import {
    getCenterCoords,
    playExplodeAnimation,
    playShakeAnimation,
    playStompAnimation,
    playTossUpAnimation,
    playTravelAnimation,
    refreshToPile,
    sendToPile,
} from "../../character/animations";
import { DECK_CYCLE_TIME } from "../../constants";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { MapleLeavesImage } from "../../images";
import { CARD_ADDED_PLAYBACK_SPEED, CARD_DEPLETED_PLAYBACK_SPEED } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES, Event, EventGroup } from "../types";
import { Combatant } from "../../character/types";
import { getRandomItem } from "../../utils";

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
const NUM_SPACES_AWAY_DELAY = 30;

const { updateBattle } = battleStateSlice.actions;

const getRotation = (animation: ANIMATION_TYPES) => {
    if ([ANIMATION_TYPES.ONE_WAY_SPIN_FAST].includes(animation)) {
        return 900;
    }
    if ([ANIMATION_TYPES.YOYO, ANIMATION_TYPES.ONE_WAY_SPIN].includes(animation)) {
        return 360;
    }
    if ([ANIMATION_TYPES.SPIN].includes(animation)) {
        return 720;
    }
    return 0;
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
    allyRefs?: any[];
    enemyRefs?: any[];
    battlefieldRef;
    deckRef;
    discardRef;
    depleteRef;
}) => {
    const { id: eventId, playbackTime, playerSide = [], enemySide = [], displacements } = eventGroup || {};
    const { actorId, targetSide, selectedIndex, allTargetIndices = [], action } = eventGroup?.events[0] || {};

    const deck = useAppSelector((state) => state.battle?.deck);
    const deckCycled = useAppSelector((state) => state.battle?.deckCycled);
    const dispatch = useAppDispatch();

    const getIndexFromCharacterId = (characterId: string): number => {
        if (!characterId) {
            return;
        }
        const allyIndex = playerSide.findIndex((ally) => characterId === ally?.id);
        if (allyIndex > -1) {
            return allyIndex;
        }
        return enemySide.findIndex((enemy) => characterId === enemy?.id);
    };

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

    const getCombatantFromId = (characterId: string): Combatant | null => {
        if (!characterId) {
            return;
        }
        return playerSide.concat(enemySide).find((c) => c?.id === characterId);
    };

    const targets = targetSide === BATTLEFIELD_SIDES.PLAYER_SIDE ? allyRefs : enemyRefs;
    const targetElement = targets[selectedIndex]?.current;
    const allTargets: { element: HTMLElement | null; index: number }[] = allTargetIndices
        .map((i) => {
            const ref = targets[i];
            return ref?.current ? { element: ref.current, index: i } : null;
        })
        .filter((v): v is { element: HTMLElement | null; index: number } => !!v);

    const actorElement = getRefFromCharacterId(actorId)?.current;
    const addCardRefs = Array.from({ length: 5 }).map(() => useRef(null) as any);
    const deckCycleRefs = Array.from({ length: 100 }).map(() => useRef(null));

    const { x: discardX, y: discardY } = useMemo(() => {
        if (!discardRef?.current?.getBoundingClientRect) {
            return { x: 0, y: 0 };
        }

        return getCenterCoords(discardRef.current);
    }, [discardRef?.current]);

    const { icon, animation, animationOptions, animations = [], type: actionType } = action || {};

    const classes = useStyles({})();

    useEffect(() => {
        const handleCharacterAnimation = (animationConfig: ActionAnimation) => {
            let { type: animationType, options } = animationConfig;
            options = {
                ...options,
                spin: options?.spin || getRotation(animationType),
            };

            if (animationType === ANIMATION_TYPES.SPIN) {
                playTravelAnimation({ from: actorElement, to: targetElement, ...options, playbackTime });
                return;
            }

            if (animationType === ANIMATION_TYPES.EXPLODE) {
                playExplodeAnimation({ from: actorElement, playbackTime: playbackTime - 250 });
                return;
            }

            if (animationType === ANIMATION_TYPES.STOMP) {
                const shakeDuration = 175;
                const stompPlayback = playbackTime - shakeDuration - 100; // -100: just make it a little shorter
                if (battlefieldRef.current && !options?.disableScreenShake) {
                    playShakeAnimation({ object: battlefieldRef.current, delay: stompPlayback, playbackTime: shakeDuration });
                }

                playStompAnimation({ object: actorElement, playbackTime: stompPlayback });
                return;
            }

            if (actionType === ACTION_TYPES.ATTACK) {
                const numSpacesAway = Math.abs(selectedIndex - getIndexFromCharacterId(actorId));
                let adjustTimingByDistance = NUM_SPACES_AWAY_DELAY * 4 - numSpacesAway * NUM_SPACES_AWAY_DELAY;
                const windup = actionType === ACTION_TYPES.ATTACK ? Math.min(20, 5 * action.damage) : 0;

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

        handleCharacterAnimation({ image: icon, type: animation, options: animationOptions });
        if (Array.isArray(animations)) {
            animations.forEach(handleCharacterAnimation);
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
        const animateCardRef = (ref: RefObject<HTMLElement>, addedTo: CardPileType) => {
            let props;
            if (addedTo === CARD_PILE_TYPES.DEPLETED) {
                props = {
                    to: depleteRef.current,
                    desaturate: true,
                    darken: true,
                    playbackTime: CARD_DEPLETED_PLAYBACK_SPEED,
                };
            } else if (addedTo === CARD_PILE_TYPES.DECK) {
                props = {
                    to: deckRef.current,
                    playbackTime: CARD_ADDED_PLAYBACK_SPEED,
                };
            } else if (addedTo === CARD_PILE_TYPES.DISCARD) {
                props = {
                    to: discardRef.current,
                    desaturate: true,
                    playbackTime: CARD_DEPLETED_PLAYBACK_SPEED,
                };
            }

            // No animation for added to hand -- having the hand gain cards will suffice
            if (ref.current && props) {
                sendToPile({ object: ref.current, ...props });
            }
        };

        eventGroup?.addCards?.forEach((value: { cards: Ability[]; cardsAddedTo: CardPileType }, i) => {
            value.cards.forEach((card, j) => {
                const ref = addCardRefs[i + j];
                animateCardRef(ref, value.cardsAddedTo);
            });
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

    const projectileGroups = [{ image: icon, type: animation, options: animationOptions }, ...animations];
    const actor: { element: HTMLElement | null; combatant: Combatant; index: number } = {
        element: actorElement,
        combatant: getCombatantFromId(actorId),
        index: getIndexFromCharacterId(actorId),
    };

    return (
        <div className={classNames("animation-canvas", classes.root)}>
            {projectileGroups.map((group, i) => (
                <ProjectileGroup
                    actionAnimation={group}
                    allTargets={allTargets}
                    key={`${eventId}-${i}`}
                    eventId={eventId}
                    playbackTime={playbackTime}
                    actor={actor}
                    index={i}
                />
            ))}
            <div className={classes.center}>
                {eventGroup?.addCards?.map((addCards: { cards: CombatAbility[] }) =>
                    addCards.cards.map((ability: CombatAbility, i) => (
                        <div className={classes.abilityContainer} ref={addCardRefs[i]} key={ability.instanceId || i}>
                            <AbilityView ability={ability} disableGlow={true} />
                        </div>
                    ))
                )}
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

const ProjectileGroup = ({
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

    // "Beam" animations shoot a bunch of projectile images
    const beamProjectileMultiplier = animationType === ANIMATION_TYPES.BEAM ? MAX_BEAM_PROJECTILES : 1;

    if (options?.ricochet) {
        return Array.from({ length: beamProjectileMultiplier }).map((_, i) => (
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
        Array.from({ length: beamProjectileMultiplier }).map((_, i) => (
            <Projectile
                target={target}
                playbackTime={playbackTime}
                eventId={eventId}
                actionAnimation={actionAnimation}
                key={`projectile-${eventId}-${index}-${i}`}
                actor={actor}
                delay={i * 25}
            />
        ))
    );
};

const MIN_PROJECTILE_SIZE = 50;

const Projectile = ({
    actor,
    target,
    playbackTime,
    actionAnimation,
    eventId,
    delay,
}: {
    actor: { element: HTMLElement | null; combatant: Combatant; index: number };
    target: { element: HTMLElement | null; index: number } | { element: HTMLElement | null; index: number }[];
    actionAnimation: ActionAnimation;
    playbackTime: number;
    eventId: string;
    delay?: number;
}) => {
    let { image, type: animationType, options } = actionAnimation || {};
    const { flash, brightness, width = MIN_PROJECTILE_SIZE, height = MIN_PROJECTILE_SIZE, opacity, fadeOut, mirrorX } = options || {};
    const { element: actorElement, combatant: actorCombatant, index: actorIndex } = actor || {};
    const ref = useRef(null);
    const classes = useStyles({ playbackTime, flash, brightness } as any)();

    const { x: actorX, y: actorY } = useMemo(() => {
        if (!actorElement?.getBoundingClientRect) {
            return { x: 0, y: 0 };
        }

        return getCenterCoords(actorElement);
    }, [actorElement]);

    const scale = Math.max(MIN_PROJECTILE_SIZE / width, MIN_PROJECTILE_SIZE / height);

    const projectileWidth = width * scale;
    const projectileHeight = height * scale;

    const props = {
        ref,
        style: {
            left: actorX - MIN_PROJECTILE_SIZE / 2,
            top: actorY - MIN_PROJECTILE_SIZE / 2,
            width: projectileWidth,
            height: projectileHeight,
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
        let adjustTimingByDistance = 0;
        if (target && !Array.isArray(target)) {
            const numSpacesAway = Math.abs(target.index - actorIndex);
            adjustTimingByDistance = 300 - numSpacesAway * NUM_SPACES_AWAY_DELAY;
        }

        const targets = Array.isArray(target) ? target.map((t) => t.element) : target.element;
        playTravelAnimation({
            returnToOrigin: animationType === ANIMATION_TYPES.YOYO,
            fadeIn: animationType === ANIMATION_TYPES.BEAM,
            ...options,
            from: actorElement,
            to: targets,
            object,
            playbackTime: playbackTime - adjustTimingByDistance,
            delay,
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

export default AnimationCanvas;

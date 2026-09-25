import { useRef, useMemo, useEffect, FC } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, ANIMATION_TYPES, ProjectileParticleConfig } from "../../../ability/types";
import {
    getCenterCoords,
    getUnscaledCenterCoords,
} from "../../../character/animations";
import { Combatant } from "../../../character/types";
import { NUM_SPACES_AWAY_DELAY } from "./constants";

const useStyles = createUseStyles({
    particleLayer: {
        position: "fixed",
        width: 0,
        height: 0,
        zIndex: 6,
        pointerEvents: "none",
    },
    particle: {
        position: "absolute",
        pointerEvents: "none",
    },
    particleInner: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
    },
});

export const ParticleTrail = ({
    actor,
    target,
    particles,
    playbackTime,
    delay,
    animationType,
    actionType,
    eventId,
}: {
    actor: { element: HTMLElement | null; combatant: Combatant; index: number };
    target:
        | { element: HTMLElement | null; index: number }
        | { element: HTMLElement | null; index: number }[];
    particles?: ProjectileParticleConfig[];
    playbackTime: number;
    delay?: number;
    animationType?: ANIMATION_TYPES;
    actionType?: ACTION_TYPES;
    eventId: string;
}) => {
    const classes = useStyles();
    const particleAnimationRefs = useRef<(Animation | null)[]>([]);
    const particleLayerRef = useRef<HTMLSpanElement>(null);
    const { element: actorElement, index: actorIndex } = actor || {};

    const { x: actorX, y: actorY } = useMemo(() => {
        if (!actorElement?.getBoundingClientRect) {
            return { x: 0, y: 0 };
        }

        return getCenterCoords(actorElement);
    }, [actorElement]);

    const particleLayout = useMemo(() => {
        if (!particles?.length) {
            return [];
        }

        const isMelee = actionType === ACTION_TYPES.ATTACK;

        let pathX = 0;
        let pathY = 0;
        let dirX = 0;
        let dirY = -1;
        const targetElement = Array.isArray(target) ? target[0]?.element : target?.element;
        if (actorElement?.getBoundingClientRect && targetElement?.getBoundingClientRect) {
            const from = getUnscaledCenterCoords(actorElement);
            const to = getUnscaledCenterCoords(targetElement);
            pathX = to.x - from.x;
            pathY = to.y - from.y;
            const length = Math.hypot(pathX, pathY) || 1;
            dirX = pathX / length;
            dirY = pathY / length;
        }
        const perpX = -dirY;
        const perpY = dirX;

        return particles.flatMap((particle, pIndex) => {
            const { image, count = 1, size = 16, spread = 20, flicker = true } = particle;
            return Array.from({ length: count }, (_, i) => {
                const base = Math.max(spread, 16);
                const emissionP = isMelee
                    ? (count > 1 ? (i + 1) / (count + 1) : 0.6) * 0.45
                    : count > 1
                      ? (i + 1) / (count + 1)
                      : 0.35;
                const lateral = (i - (count - 1) / 2) * base * 0.28;
                const rise = isMelee ? -28 : 0;
                const drift = 16 + (i % 2) * 8;

                const fromX = pathX * emissionP + perpX * lateral;
                const fromY = pathY * emissionP + perpY * lateral + rise;

                return {
                    key: `${pIndex}-${i}`,
                    image,
                    size,
                    flicker,
                    emissionP,
                    fromX,
                    fromY,
                    toX: isMelee
                        ? fromX + dirX * drift + perpX * lateral * 0.5
                        : fromX - dirX * drift - perpX * lateral * 0.5,
                    toY: isMelee
                        ? fromY + dirY * drift + perpY * lateral * 0.5
                        : fromY - dirY * drift - perpY * lateral * 0.5,
                };
            });
        });
    }, [particles, actionType, actorElement, target]);

    const renderParticleImage = (particle: { image?: string }) => {
        if (typeof particle.image === "string") {
            return <img src={particle.image} className={classes.particleInner} />;
        }
        if (typeof particle.image === "function") {
            const ParticleIcon: FC<{ className?: string }> = particle.image;
            return <ParticleIcon className={classes.particleInner} />;
        }
        return null;
    };

    const isTravelAnimation = !(
        [
            ANIMATION_TYPES.CONSUMABLE,
            ANIMATION_TYPES.ACTION_EXPLODE,
            ANIMATION_TYPES.PROJECTILE_RAIN,
            ANIMATION_TYPES.HOMING,
            ANIMATION_TYPES.TARGET_MARKER,
        ] as (ANIMATION_TYPES | undefined)[]
    ).includes(animationType);

    useEffect(() => {
        const particleLayerElement = particleLayerRef.current;
        if (!isTravelAnimation || !particleLayerElement || !particles?.length) {
            return;
        }

        const particleSpans = Array.from(
            particleLayerElement.querySelectorAll<HTMLElement>("[data-particle]"),
        );
        if (particleSpans.length === 0) {
            return;
        }

        let particleDuration = playbackTime;
        if (target && !Array.isArray(target)) {
            const numSpacesAway = Math.abs(target.index - actorIndex);
            particleDuration -= 300 - numSpacesAway * NUM_SPACES_AWAY_DELAY;
        }

        particleAnimationRefs.current = particleSpans.map((el, i) => {
            const particle = particleLayout[i];
            if (!particle || particleDuration <= 0) {
                return null;
            }

            const particleLife = Math.max(220, Math.min(420, particleDuration * 0.38));
            const emissionDelay =
                (delay || 0) + particleDuration * (particle.emissionP ?? 0.5) * 0.8;
            const flickers = particle.flicker !== false;
            const midX = particle.fromX + (particle.toX - particle.fromX) * 0.5;
            const midY = particle.fromY + (particle.toY - particle.fromY) * 0.5;
            const frames: Keyframe[] = [
                {
                    transform: `translate(calc(-50% + ${particle.fromX}px), calc(-50% + ${particle.fromY}px))`,
                    opacity: 0,
                },
                {
                    transform: `translate(calc(-50% + ${particle.fromX}px), calc(-50% + ${particle.fromY}px))`,
                    opacity: 0.9,
                    offset: 0.12,
                    easing: "ease-out",
                },
                {
                    transform: `translate(calc(-50% + ${midX}px), calc(-50% + ${midY}px))`,
                    opacity: 0.45,
                    offset: 0.55,
                },
                {
                    transform: `translate(calc(-50% + ${particle.toX}px), calc(-50% + ${particle.toY}px))`,
                    opacity: flickers ? 0.7 : 0.3,
                    offset: 0.78,
                },
                {
                    transform: `translate(calc(-50% + ${particle.toX}px), calc(-50% + ${particle.toY}px))`,
                    opacity: 0,
                },
            ];

            return el.animate(frames, {
                duration: particleLife,
                delay: emissionDelay,
                fill: "forwards",
            });
        });

        return () => {
            particleAnimationRefs.current.forEach((anim) => anim?.cancel());
        };
    }, [eventId]);

    if (particleLayout.length === 0) {
        return null;
    }

    return (
        <span
            ref={particleLayerRef}
            className={classes.particleLayer}
            style={{
                left: `${actorX}px`,
                top: `${actorY}px`,
            }}
        >
            {particleLayout.map((particle) => (
                <span
                    key={particle.key}
                    data-particle
                    className={classes.particle}
                    style={{
                        left: "50%",
                        top: "50%",
                        width: particle.size,
                        height: particle.size,
                        transform: `translate(calc(-50% + ${particle.toX}px), calc(-50% + ${particle.toY}px))`,
                        opacity: 0,
                    }}
                >
                    {renderParticleImage(particle)}
                </span>
            ))}
        </span>
    );
};
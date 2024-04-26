import { useEffect, useRef } from "react";
import { createUseStyles } from "react-jss";
import { ANIMATION_TYPES } from "../ability/types";
import { getCenterCoords } from "../character/animations";
import { Fireworks } from "../fireworks/fireworks";
import { BATTLEFIELD_SIDES, Event } from "./types";

const useStyles = createUseStyles({
    particleCanvasRoot: {
        pointerEvents: "none", // Not an interactable layer
        position: "fixed",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: 1,
        filter: "drop-shadow(0 0 1px rgba(255, 255, 200, 0.5)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.75)) brightness(1.25)",
    },
});

const fireworksSettings = {
    particles: 15,
    hue: { min: 0, max: 45 },
    lineWidth: { explosion: { min: 2, max: 4 } },
    gravity: 1.5,
    friction: 0.97,
    decay: { min: 0.015, max: 0.03 },
};

const hitSettings = {
    ...fireworksSettings,
    particles: 8,
    gravity: 0,
    friction: 0.92,
    hue: { min: 0, max: 25 },
    decay: { min: 0.045, max: 0.05 },
};

const ParticleCanvas = ({ event, allyRefs = [], enemyRefs = [] }: { event?: Event; allyRefs?: any[]; enemyRefs?: any[] }) => {
    const { targetSide, allTargetIndices = [], action, id: eventId, playbackTime, statUpdates, playerSide, enemySide } = event || {};
    const container = useRef<HTMLDivElement>(null);
    const particles = useRef<any>(null);
    const classes = useStyles();

    useEffect(() => {
        if (!particles.current) {
            particles.current = new Fireworks(container.current!, hitSettings);
        }

        return () => {
            particles.current!.stop();
        };
    }, []);

    useEffect(() => {
        const targetElements = targetSide === BATTLEFIELD_SIDES.PLAYER_SIDE ? allyRefs : enemyRefs;

        if (action?.animation === ANIMATION_TYPES.FIREWORKS) {
            const allTargets = allTargetIndices.map((i) => targetElements[i]?.current).filter((v) => v);
            setTimeout(() => {
                particles.current.updateOptions(fireworksSettings);
                allTargets.forEach((element) => {
                    particles.current!.launch(getCenterCoords(element));
                });
            }, playbackTime / 2);
        } else if (statUpdates) {
            const sideCombatants = event[targetSide];
            const hitIndices = sideCombatants
                .map((combatant, i) => {
                    if (statUpdates[combatant?.id]?.rawDamage) {
                        return i;
                    }
                })
                .filter((v) => typeof v === "number");

            if (hitIndices.length) {
                setTimeout(() => {
                    particles.current.updateOptions(hitSettings);
                    hitIndices.forEach((index) => {
                        particles.current!.launch(getCenterCoords(targetElements[index]?.current));
                    });
                }, playbackTime / 2);
            }
        }
    }, [eventId]);

    return <div className={classes.particleCanvasRoot} ref={container} />;
};

export default ParticleCanvas;

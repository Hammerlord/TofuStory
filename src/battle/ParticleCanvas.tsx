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
    },
});

const ParticleCanvas = ({
    event,
    allyRefs = [],
    enemyRefs = [],
    battlefieldRef,
}: {
    event?: Event;
    allyRefs?: any[];
    enemyRefs?: any[];
    battlefieldRef;
}) => {
    const { targetSide, allTargetIndices = [], action, id: eventId, playbackTime } = event || {};
    const container = useRef<HTMLDivElement>(null);
    const fireworks = useRef<any>(null);
    const hitParticles = useRef<any>(null);
    const classes = useStyles();

    useEffect(() => {
        if (!fireworks.current) {
            fireworks.current = new Fireworks(container.current!, {
                particles: 15,
                hue: { min: 0, max: 45 },
                brightness: { min: 80, max: 90 },
                lineWidth: { explosion: { min: 2, max: 4 } },
            });
        }
        return () => {
            fireworks.current!.stop();
        };
    }, []);

    useEffect(() => {
        if (action?.animation === ANIMATION_TYPES.FIREWORKS) {
            const targets = targetSide === BATTLEFIELD_SIDES.PLAYER_SIDE ? allyRefs : enemyRefs;
            const allTargets = allTargetIndices.map((i) => targets[i]?.current).filter((v) => v);
            setTimeout(() => {
                allTargets.forEach((element) => {
                    fireworks.current!.launch(getCenterCoords(element));
                });
            }, playbackTime / 2);
        }
    }, [eventId]);

    return <div className={classes.particleCanvasRoot} ref={container} />;
};

export default ParticleCanvas;

import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { UpdatedCombatantStats } from "../battle/actions/getUpdatedStats";
import { Boom2Image, BoomImage } from "../images";
import { getRandomInt } from "../utils";
import { HIT_PLAYBACK } from "./constants";
import { clamp } from "ramda";

const useStyles = createUseStyles({
    root: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "30px",
        height: "30px",
        minWidth: "30px",
        minHeight: "30px",
        transform: "translate(-50%, -50%)",
        filter: "drop-shadow(0px 0px 1px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.8))",
    },
    rotationWrapper: {
        position: "absolute",
        inset: 0,
        transformOrigin: "center center",
    },
    icon: {
        position: "absolute",
        width: "225%",
        height: "225%",
        top: "50%",
        left: "50%",
        margin: 0,
        transform: "translate(-50%, -50%)",
    },
    text: {
        position: "absolute",
        color: "white",
        fontWeight: "bold",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "22px",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
    },
});

const HitIcon = ({ statChanges }: { statChanges?: UpdatedCombatantStats }) => {
    const baseline = 50;
    const maxOffset = 25;
    const [pos] = useState({
        x: getRandomInt(baseline - maxOffset, baseline + maxOffset),
        y: getRandomInt(baseline - maxOffset, baseline + maxOffset),
    });

    const [rotation] = useState(getRandomInt(0, 360));

    const classes = useStyles();
    const rootRef = useRef<HTMLSpanElement>(null);
    const iconRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!statChanges?.healthDamage) {
            return;
        }

        const root = rootRef.current;
        const icon = iconRef.current;

        if (!root || !icon) {
            return;
        }

        const rootAnimation = root.animate(
            [
                {
                    opacity: 1,
                    offset: 0.8,
                },
                {
                    opacity: 0,
                },
            ],
            {
                duration: HIT_PLAYBACK,
                fill: "forwards",
            }
        );

        const iconAnimation = icon.animate(
            [
                {
                    scale: 0.5,
                    transform: "translateX(-75%) translateY(-75%)",
                },
                {
                    scale: 1,
                },
            ],
            {
                duration: 150,
                fill: "forwards",
            }
        );

        return () => {
            rootAnimation.cancel();
            iconAnimation.cancel();
        };
    }, [statChanges]);

    const healthDamage = statChanges?.healthDamage || 0;
    const isHardHitThreshold = healthDamage > 20;
    const src = isHardHitThreshold ? Boom2Image : BoomImage;
    const scale = clamp(0.75, 1.3, 0.6 + Math.ceil(healthDamage / 3) * 0.1);

    return (
        <span
            className={classes.root}
            ref={rootRef}
            style={{
                transform: `translate(-${pos.x}%, -${pos.y}%)`,
            }}
        >
            <span
                className={classes.rotationWrapper}
                style={{
                    transform: `rotate(${rotation}deg)`,
                    scale,
                }}
            >
                <img src={src} className={classes.icon} ref={iconRef} />
            </span>

            <span className={classes.text}>{healthDamage}</span>
        </span>
    );
};

const HitIcons = ({ statChanges, delay }: { statChanges?: UpdatedCombatantStats; delay: number }) => {
    const [hits, setHits] = useState<{ id: number; statChanges: UpdatedCombatantStats }[]>([]);

    const nextId = useRef(0);

    useEffect(() => {
        if (!statChanges?.healthDamage) {
            return;
        }

        const id = nextId.current++;

        const startTimeout = setTimeout(() => {
            setHits((prev) => [
                ...prev,
                {
                    id,
                    statChanges,
                },
            ]);
        }, delay);

        const endTimeout = setTimeout(() => {
            setHits((prev) => prev.filter((hit) => hit.id !== id));
        }, delay + HIT_PLAYBACK);

        return () => {
            clearTimeout(startTimeout);
            clearTimeout(endTimeout);
        };
    }, [statChanges, delay]);

    return (
        <>
            {hits.map((hit) => (
                <HitIcon key={hit.id} statChanges={hit.statChanges} />
            ))}
        </>
    );
};

export default HitIcons;

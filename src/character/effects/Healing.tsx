import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { SparklesIcon } from "../../images/icons";
import { getRandomArbitrary, getRandomInt } from "../../utils";
import Icon from "./../../icon/Icon";
import { HIT_PLAYBACK } from "../../icon/constants";

const useStyles = createUseStyles({
    text: {
        fontSize: "22px",
        color: "#42f57b",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textShadow: Array.from({ length: 5 })
            .map(() => "0 0 3px black")
            .join(", "),
        fontWeight: "bold",
        zIndex: "3",
        opacity: 0,
    },
    root: {
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    icon: {
        position: "absolute",
        opacity: 0,
        boxShadow: "0 0 5px 3px rgba(255, 245, 200, 0.5)",
        "& svg": {
            filter: "drop-shadow(0 0 2px #fff2c4) drop-shadow(0 0 2px #fff2c4)",
        },
    },
});

const getParticles = () => {
    const numParticles = 5;
    return Array.from({ length: numParticles }).map((_, i) => {
        const min = 5;
        const max = 85;
        const step = (max - min) / numParticles;
        const currentMin = i * step + min;
        const currentMax = currentMin + step;
        return {
            left: `${getRandomInt(currentMin, currentMax)}%`,
            bottom: `${getRandomInt(-5, 5)}px`,
            animationDelay: getRandomArbitrary(0, 0.5),
        };
    });
};

const HealingEffect = ({
    healing,
    particles,
    onDone,
}: {
    healing: number;
    particles: Array<{ left: string; bottom: string; animationDelay: number }>;
    onDone: () => void;
}) => {
    const classes = useStyles();
    const particleRefs = useRef<Element[]>([]);
    const textRef = useRef<HTMLSpanElement>(null);
    const particleAnimationRefs = useRef<Animation[]>([]);
    const textAnimationRef = useRef<Animation | null>(null);

    useEffect(() => {
        const textAnim = textRef.current?.animate(
            [
                { opacity: 1, offset: 0.8 },
                { opacity: 0 },
            ],
            {
                duration: HIT_PLAYBACK,
                fill: "forwards",
            },
        );

        textAnimationRef.current = textAnim ?? null;

        particleAnimationRefs.current?.forEach((anim) => anim.cancel());

        const particleAnims = particleRefs.current.map((particle, i) => {
            return particle?.animate(
                [
                    {
                        opacity: 1,
                        offset: particles[i]?.animationDelay,
                    },
                    {
                        opacity: 0,
                        transform: "translateY(-200%)",
                    },
                ],
                {
                    duration: HIT_PLAYBACK,
                    fill: "forwards",
                },
            );
        });

        particleAnimationRefs.current = particleAnims;

        const timeout = setTimeout(() => {
            textAnimationRef.current?.cancel();
            particleAnimationRefs.current.forEach((anim) => anim.cancel());
            onDone();
        }, HIT_PLAYBACK);

        return () => {
            clearTimeout(timeout);
            textAnimationRef.current?.cancel();
            particleAnimationRefs.current.forEach((anim) => anim.cancel());
        };
    }, []);

    return (
        <>
            {particles.map((style, i) => (
                // @ts-ignore
                <Icon
                    key={i}
                    icon={<SparklesIcon />}
                    className={classes.icon}
                    style={style}
                    ref={(el) => (particleRefs.current[i] = el)}
                />
            ))}
            {healing > 0 && (
                <span className={classes.text} ref={textRef}>
                    {healing}
                </span>
            )}
        </>
    );
};

const Healing = ({ statChanges }: { statChanges?: { healing?: number } }) => {
    const classes = useStyles();
    const [activeEffects, setActiveEffects] = useState<
        { id: number; healing: number; particles: ReturnType<typeof getParticles> }[]
    >([]);
    const nextId = useRef(0);

    useEffect(() => {
        const healing = statChanges?.healing || 0;
        if (healing <= 0) {
            return;
        }

        const id = nextId.current++;
        const particles = getParticles();

        setActiveEffects((prev) => [...prev, { id, healing, particles }]);

        const timeout = setTimeout(() => {
            setActiveEffects((prev) => prev.filter((effect) => effect.id !== id));
        }, HIT_PLAYBACK);

        return () => {
            clearTimeout(timeout);
        };
    }, [statChanges]);

    return (
        <div className={classes.root}>
            {activeEffects.map((effect) => (
                <HealingEffect
                    key={effect.id}
                    healing={effect.healing}
                    particles={effect.particles}
                    onDone={() => {
                        setActiveEffects((prev) => prev.filter((e) => e.id !== effect.id));
                    }}
                />
            ))}
        </div>
    );
};

export default Healing;

import { RefObject, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { SparklesIcon } from "../../images/icons";
import { getRandomArbitrary, getRandomInt } from "../../utils";
import Icon from "./../../icon/Icon";

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
        display: "none",
    },
    root: {
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    icon: {
        position: "absolute",
        display: "none",
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

const Healing = ({ statChanges }: { statChanges: { healing: number } }) => {
    const classes = useStyles();
    const [particles, setParticles] = useState(getParticles());
    const particleRefs = useRef([]);
    const particleAnimationRefs = useRef([]);
    const textRef: RefObject<HTMLSpanElement | null> = useRef(null);
    const textAnimationRef: RefObject<Animation | null> = useRef(null);

    useEffect(() => {
        if (statChanges.healing > 0) {
            textAnimationRef.current?.cancel();
            const textAnim = textRef.current?.animate(
                [
                    {
                        opacity: 1,
                        offset: 0.8,
                        display: "block",
                    },
                    { opacity: 0, display: "block" },
                ],
                1500
            );

            textAnimationRef.current = textAnim;

            particleAnimationRefs.current?.forEach((animation) => animation?.cancel());

            const particleAnims = particleRefs.current?.map((particle, i) => {
                return particle?.animate(
                    [
                        {
                            transform: "translateY(0)",
                            opacity: 1,
                            display: "block",
                            offset: particles[i]?.animationDelay,
                        },
                        {
                            transform: "translateY(-200%)",
                            opacity: 0,
                            display: "block",
                        },
                    ],
                    1500
                );
            });

            particleAnimationRefs.current = particleAnims;
        }
    }, [statChanges]);

    return (
        <div className={classes.root}>
            {particles.map((style, i) => (
                // @ts-ignore
                <Icon key={i} icon={<SparklesIcon />} className={classes.icon} style={style} ref={(el) => (particleRefs.current[i] = el)} />
            ))}
            <span className={classes.text} ref={textRef}>
                {statChanges.healing}
            </span>
        </div>
    );
};

export default Healing;

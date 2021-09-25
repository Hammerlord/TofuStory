import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { Sparkles } from "../../images";
import { getRandomArbitrary, getRandomInt } from "../../utils";
import Icon from "./../../icon/Icon";

const ANIMATION_DURATION = 1;

const useStyles = createUseStyles({
    text: {
        fontSize: "20px",
        color: "#42f57b",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textShadow: "0 0 2px black, 0 0 2px black, 0 0 2px black, 0 0 2px black",
        fontWeight: "bold",
        zIndex: "3",
    },
    root: {
        width: "100%",
        height: "100%",
    },
    "@keyframes animation": {
        "0%": {
            transform: "translateY(0)",
            opacity: 4,
        },
        "100%": {
            transform: "translateY(-200%)",
            opacity: 0,
        },
    },
    icon: {
        position: "absolute",
        animationName: "$animation",
        animationDuration: `${ANIMATION_DURATION}s`,
        animationIterationCount: "infinite",
        boxShadow: "0 0 5px 3px rgba(255, 245, 200, 0.5)",
        "& svg": {
            WebkitFilter: "drop-shadow(0 0 2px #fff2c4) drop-shadow(0 0 2px #fff2c4)",
            filter: "drop-shadow(0 0 2px #fff2c4) drop-shadow(0 0 2px #fff2c4)",
        },
    },
});

const Healing = ({ amount }: { amount: number }) => {
    const classes = useStyles();
    const [particles, setParticles] = useState([]);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (amount > 0) {
            const numParticles = 5;
            setShow(true);
            setParticles(
                Array.from({ length: numParticles }).map((_, i) => {
                    const min = 5;
                    const max = 85;
                    const step = (max - min) / numParticles;
                    const currentMin = i * step + min;
                    const currentMax = currentMin + step;
                    return {
                        left: `${getRandomInt(currentMin, currentMax)}%`,
                        bottom: `${getRandomInt(-5, 5)}px`,
                        animationDelay: `${getRandomArbitrary(0, 0.5)}s`,
                    };
                })
            );
            const timeout = setTimeout(() => setShow(false), ANIMATION_DURATION * 1000);
            return () => {
                clearTimeout(timeout);
                setShow(false);
            };
        }
    }, [amount]);

    if (!show) {
        return null;
    }

    return (
        <div className={classes.root}>
            {particles.map((style, i) => (
                <Icon key={i} icon={<Sparkles />} className={classes.icon} style={style} />
            ))}
            <span className={classes.text}>{amount}</span>
        </div>
    );
};

export default Healing;

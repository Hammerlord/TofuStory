import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { Fire, Snowflake } from "../images";
import { getRandomArbitrary, getRandomInt } from "../utils";
import Icon from "./Icon";

const ANIMATION_DURATION = 2;

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
            transform: "translateY(-10%)",
            opacity: 0,
        },
    },
    icon: {
        position: "absolute",
        animationName: "$animation",
        animationDuration: `${ANIMATION_DURATION}s`,
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        boxShadow: "0 0 5px 3px rgba(255, 245, 200, 0.5)",
        "& svg": {
            WebkitFilter: "drop-shadow(0 0 2px #fff2c4) drop-shadow(0 0 2px #fff2c4)",
            filter: "drop-shadow(0 0 2px #fff2c4) drop-shadow(0 0 2px #fff2c4)",
        },
    },
});

const Chill = ({ amount }) => {
    const classes = useStyles();
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (amount > 0) {
            const numParticles = 4;
            setParticles(
                Array.from({ length: numParticles }).map((_, i) => {
                    const min = 10;
                    const max = 80;
                    const step = (max - min) / numParticles;
                    const currentMin = i * step + min;
                    const currentMax = currentMin + step;
                    return {
                        left: `${getRandomInt(currentMin, currentMax)}%`,
                        bottom: `${getRandomInt(5, 75)}%`,
                        animationDelay: `${getRandomArbitrary(0, 1.5)}s`,
                        width: getRandomArbitrary(24, 40),
                    };
                })
            );
        } else {
            setParticles([]);
        }
    }, [amount]);

    return (
        <div className={classes.root}>
            {particles.map((style, i) => (
                <Icon key={i} icon={<Snowflake />} className={classes.icon} style={style} />
            ))}
        </div>
    );
};

export default Chill;

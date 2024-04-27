import { MutableRefObject, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { BoomImage } from "../images";
import Icon from "./Icon";
import { getRandomInt } from "../utils";

const useStyles = createUseStyles({
    root: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        display: "none",
        filter: "drop-shadow(0px 0px 1px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.8))",
        width: "30px",
        height: "30px",
        minWidth: "30px",
        minHeight: "30px",
    },
    icon: {
        width: "225%",
        height: "225%",
        position: "absolute",
        top: "45%",
        left: "42%",
        transform: "translateX(-50%) translateY(-50%)",
        margin: "auto",
    },
    text: {
        position: "absolute",
        color: "white",
        fontWeight: "bold",
        top: "40%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        fontSize: "22px",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
    },
});

const HitIcon = ({ statChanges }) => {
    const [oldStatChanges, setOldStatChanges] = useState({ damage: 0 });
    const [pos, setPos] = useState({ x: 50, y: 50 });
    const classes = useStyles();
    const rootRef: MutableRefObject<HTMLSpanElement> = useRef();
    const iconRef: MutableRefObject<HTMLImageElement> = useRef();
    const animationRefs: MutableRefObject<any> = useRef([]);

    useEffect(() => {
        if (!statChanges.damage) {
            return;
        }

        if (rootRef.current) {
            animationRefs.current?.forEach((animation) => animation.cancel());
            animationRefs.current = [];
            const rootAnimation = rootRef.current.animate(
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

            animationRefs.current.push(rootAnimation);

            const iconAnimation = iconRef.current.animate(
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
            animationRefs.current.push(iconAnimation);

            setPos({ x: getRandomInt(30, 70), y: getRandomInt(30, 70) });
            setOldStatChanges(statChanges);
        }
    }, [statChanges]);

    return (
        <span className={classes.root} ref={rootRef} style={{ transform: `translateX(-${pos.x}%) translateY(-${pos.y}%)` }}>
            <img src={BoomImage} className={classes.icon} ref={iconRef} />
            <span className={classes.text}>{oldStatChanges.damage}</span>
        </span>
    );
};

export default HitIcon;

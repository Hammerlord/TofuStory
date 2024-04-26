import { MutableRefObject, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { BoomImage } from "../images";
import Icon from "./Icon";

const useStyles = createUseStyles({
    root: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        display: "none",
        filter: "drop-shadow(0px 0px 1px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.8))",
        "& .icon": {
            width: "225%",
            height: "225%",
            position: "absolute",
            top: "45%",
            left: "42%",
            transform: "translateX(-50%) translateY(-50%)",
        },
        "& .text": {
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translateX(-50%) translateY(-50%)",
            fontSize: "22px",
            textShadow: Array.from({ length: 10 })
                .map(() => "0 0 3px black")
                .join(", "),
        },
    },
});

const HitIcon = ({ statChanges }) => {
    const [oldStatChanges, setOldStatChanges] = useState({ damage: 0 });
    const classes = useStyles();
    const ref: MutableRefObject<HTMLSpanElement> = useRef();
    const animationRef: MutableRefObject<Animation> = useRef();

    useEffect(() => {
        if (!statChanges.damage) {
            return;
        }

        if (ref.current) {
            animationRef.current?.cancel();
            const animation = ref.current?.animate(
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

            animationRef.current = animation;
            setOldStatChanges(statChanges);
        }
    }, [statChanges]);

    return (
        <span className={classes.root} ref={ref}>
            <Icon icon={BoomImage} text={oldStatChanges.damage} />
        </span>
    );
};

export default HitIcon;

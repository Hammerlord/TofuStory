import { MutableRefObject, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { BoomIcon } from "../images/icons";
import Icon from "./Icon";

const useStyles = createUseStyles({
    root: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        height: "100%",
        width: "100%",
        display: "none",
        "& .icon": {
            width: "250%",
            height: "250%",
            position: "absolute",
            top: "50%",
            left: "46%",
            transform: "translateX(-50%) translateY(-50%)",
        },
        "& .text": {
            position: "absolute",
            top: "50%",
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

    return <Icon icon={<BoomIcon />} className={classes.root} text={oldStatChanges.damage} ref={ref} />;
};

export default HitIcon;

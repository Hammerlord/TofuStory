import { MutableRefObject, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { BoomIcon } from "../images/icons";
import Icon from "./Icon";
import { LightbeamImage } from "../images";
import { playExplodeAnimation } from "../character/animations";
import { getRandomInt } from "../utils";
import classNames from "classnames";

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
            top: "55%",
            left: "42%",
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
    "@keyframes flash": {
        from: {
            filter: `brightness(0.8)`,
            transform: "translateX(-50%) translateY(-50%) scale(0.5)",
            opacity: 1,
        },
        to: {
            filter: `brightness(1.25) drop-shadow(0 0 3px #fffee8)`,
            transform: "translateX(-50%) translateY(-50%) scale(1.75)",
            opacity: 0.5,
        },
    },
    lightBeam: {
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        position: "absolute",
        animation: "$flash",
        transitionTimingFunction: "ease-out",
        animationDuration: 200,
        animationDelay: 50,
        opacity: 0,
        "&.hide": {
            display: "none",
        },
        "&.small": {
            width: "50%",
            height: "50%",
        },
        "&.medium": {
            width: "100%",
            height: "100%",
        },
        "&.large": {
            width: "150%",
            height: "150%",
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
            <img
                src={LightbeamImage}
                className={classNames(classes.lightBeam, {
                    hide: !oldStatChanges.damage || oldStatChanges.damage < 5,
                    small: oldStatChanges.damage >= 5,
                    medium: oldStatChanges.damage >= 10,
                    large: oldStatChanges.damage > 20,
                })}
            />
            <Icon icon={<BoomIcon />} text={oldStatChanges.damage} />
        </span>
    );
};

export default HitIcon;

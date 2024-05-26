import { MutableRefObject, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { StatChange } from "../battle/utils";
import { ShieldImage } from "../images";

const useStyles = createUseStyles({
    root: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        display: "none",
        filter: "drop-shadow(0px 0px 1px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.8))",
    },
    icon: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        margin: "auto",
        width: "40px",
        height: "40px",
    },
    text: {
        position: "absolute",
        color: "white",
        fontWeight: "bold",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        fontSize: "20px",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
    },
});

/**
 * To display damage that was blocked by Armor.
 */
const BlockIcon = ({ statChanges }: { statChanges: StatChange }) => {
    const [oldBlockedDamage, setOldBlockedDamage] = useState(0);
    const classes = useStyles();
    const rootRef: MutableRefObject<HTMLSpanElement> = useRef();
    const iconRef: MutableRefObject<HTMLImageElement> = useRef();
    const animationRefs: MutableRefObject<any> = useRef([]);

    useEffect(() => {
        const { armor = 0 } = statChanges || {};
        const blockedDamage = Math.min(0, armor);
        if (!blockedDamage) {
            return;
        }

        if (rootRef.current) {
            animationRefs.current?.forEach((animation) => animation.cancel());
            animationRefs.current = [];
            const rootAnimation = rootRef.current.animate(
                [
                    {
                        opacity: 0.75,
                        display: "block",
                        offset: 0.8,
                    },
                    { opacity: 0, display: "block" },
                ],
                1500
            );

            animationRefs.current.push(rootAnimation);
            setOldBlockedDamage(Math.abs(blockedDamage));
        }
    }, [statChanges]);

    return (
        <span className={classes.root} ref={rootRef}>
            <img src={ShieldImage} className={classes.icon} ref={iconRef} />
            <span className={classes.text}>{oldBlockedDamage}</span>
        </span>
    );
};

export default BlockIcon;

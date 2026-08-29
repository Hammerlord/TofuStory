import { RefObject, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { UpdatedCombatantStats } from "../battle/actions/getUpdatedStats";
import { ShieldImage } from "../images";
import { HIT_PLAYBACK } from "./constants";

const useStyles = createUseStyles({
    root: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
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
const BlockIcon = ({ statChanges }: { statChanges: UpdatedCombatantStats }) => {
    const classes = useStyles();
    const rootRef: RefObject<HTMLSpanElement> = useRef(null);
    const iconRef: RefObject<HTMLImageElement> = useRef(null);

    useEffect(() => {
        const { armor = 0 } = statChanges || {};
        const blockedDamage = Math.min(0, armor);
        if (!blockedDamage) {
            return;
        }

        if (rootRef.current) {
            const rootAnimation = rootRef.current.animate(
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

            return () => {
                rootAnimation.cancel();
            };
        }
    }, [statChanges?.id]);

    return (
        <span className={classes.root} ref={rootRef}>
            <img src={ShieldImage} className={classes.icon} ref={iconRef} />
            <span className={classes.text}>{Math.abs(statChanges.armor)}</span>
        </span>
    );
};

const BlockIcons = ({ statChanges, delay }: { statChanges?: UpdatedCombatantStats; delay: number }) => {
    const [hits, setHits] = useState<{ id: number; statChanges: UpdatedCombatantStats }[]>([]);

    const nextId = useRef(0);

    useEffect(() => {
        const armor = statChanges?.armor || 0;
        if (armor >= 0) {
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
                <BlockIcon key={hit.id} statChanges={hit.statChanges} />
            ))}
        </>
    );
};

export default BlockIcons;

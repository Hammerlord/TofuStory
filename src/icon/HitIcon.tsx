import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { UpdatedCombatantStats } from "../battle/actions/getUpdatedStats";
import { BoomImage } from "../images";
import { getRandomInt } from "../utils";

const useStyles = createUseStyles({
    root: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
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

const HitIcon = ({ statChanges }: { statChanges?: UpdatedCombatantStats }) => {
    const baseline = 50;
    const maxOffset = 25;
    const [pos] = useState({
        x: getRandomInt(baseline - maxOffset, baseline + maxOffset),
        y: getRandomInt(baseline - maxOffset, baseline + maxOffset),
    });

    const classes = useStyles();
    const rootRef = useRef<HTMLSpanElement>(null);
    const iconRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!statChanges?.healthDamage) {
            return;
        }

        const root = rootRef.current;
        const icon = iconRef.current;

        if (!root || !icon) {
            return;
        }

        const rootAnimation = root.animate(
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
                duration: 1500,
                fill: "forwards",
            }
        );

        const iconAnimation = icon.animate(
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

        return () => {
            rootAnimation.cancel();
            iconAnimation.cancel();
        };
    }, [statChanges]);

    return (
        <span
            className={classes.root}
            ref={rootRef}
            style={{
                transform: `translateX(-${pos.x}%) translateY(-${pos.y}%)`,
            }}
        >
            <img src={BoomImage} className={classes.icon} ref={iconRef} />
            <span className={classes.text}>{statChanges.healthDamage}</span>
        </span>
    );
};

const HitIcons = ({ statChanges }: { statChanges?: UpdatedCombatantStats }) => {
    const [hits, setHits] = useState<{ id: number; statChanges: UpdatedCombatantStats }[]>([]);

    const nextId = useRef(0);

    useEffect(() => {
        if (!statChanges?.healthDamage) {
            return;
        }

        const id = nextId.current++;

        setHits((prev) => [
            ...prev,
            {
                id,
                statChanges,
            },
        ]);

        const timeout = setTimeout(() => {
            setHits((prev) => prev.filter((hit) => hit.id !== id));
        }, 1600);

        return () => clearTimeout(timeout);
    }, [statChanges]);

    return (
        <>
            {hits.map((hit) => (
                <HitIcon key={hit.id} statChanges={hit.statChanges} />
            ))}
        </>
    );
};

export default HitIcons;

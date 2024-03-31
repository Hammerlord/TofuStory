import classNames from "classnames";
import { useEffect, useMemo, useRef } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, Action, Effect } from "../ability/types";
import { getRotationToFaceTarget, getTargetPoints } from "./animations";
import { Combatant } from "./types";

const WEAPON_DEFAULT_ROTATION = 45; // This is a MapleStory thing where weapon sprites are at 45 degree angles

const useStyles = createUseStyles({
    root: {
        transformOrigin: "150% 150%",
        pointerEvents: "none",
        "& img": {
            transform: (options: any) => options?.transform || "scale(4, 4) rotate(90deg)",
            imageRendering: "pixelated",
        },
    },
    idle: {
        animationDuration: "2.5s",
        animationName: "$idling",
        transition: "1s filter ease-in-out, 1s -webkit-filter ease-in-out",
        animationIterationCount: "infinite",
    },
    "@keyframes idling": {
        "0%": {
            transform: "rotate(0deg)",
        },
        "60%": {
            transform: "rotate(12deg)",
        },
        "100%": {
            transform: "rotate(0deg)",
        },
    },
    stab: {
        transform: "rotate(45deg)",
        transition: "1s filter ease-out, 1s -webkit-filter ease-out",
        transitionDuration: "0.1s",
        transitionProperty: "transform",
    },
    "@keyframes glow": {
        "0%": {
            filter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
        },
        "75%": {
            filter: "brightness(2.5) drop-shadow(0 0 10px #fffee8) drop-shadow(0 0 5px #fffee8)",
        },
        "100%": {
            filter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
        },
    },
    glow: {
        animationDuration: "1.5s",
        animationName: "$glow",
        transition: "1s filter ease-in-out, 1s -webkit-filter ease-in-out",
        animationIterationCount: "infinite",
    },
    ghost: {
        "& img": {
            transform: (options: any) => options?.transform || "scale(4, 4)",
            imageRendering: "pixelated",
        },
        transformOrigin: "400% -400%",
        opacity: 0,
        position: "absolute",
        left: "-250%",
        top: 200,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
    },
});

const swing = ({ object, playbackTime = 500, opacity = 1, delay = 0, startingPoint = 0 }) => {
    const animationFrames = [
        {
            transform: `rotate(${startingPoint}deg)`,
            offset: 0.25,
            easing: "ease-out",
            opacity,
        },
        {
            transform: `rotate(${startingPoint - 35}deg)`,
            offset: 0.5,
            opacity,
        },
        {
            transform: `rotate(${startingPoint + 20}deg)`,
            offset: 0.55,
            opacity,
        },
        {
            transform: `rotate(${startingPoint + 120}deg)`,
            offset: 0.75,
            opacity,
        },
        {
            transform: `rotate(${startingPoint + 50}deg)`,
            easing: "ease-in",
            offset: 0.9,
            opacity,
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
        delay,
    });
};

const whirl = ({ object, playbackTime = 500 }) => {
    const animationFrames = [
        {
            transform: "rotate(0deg)",
            offset: 0.35,
            easing: "ease-out",
        },
        {
            transform: "rotate(520deg)",
            offset: 0.9,
        },
        {
            transform: "rotate(360deg)",
            offset: 1,
            easing: "ease-in",
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
    });
};

const spin = ({ object, playbackTime = 1000, startingPoint }) => {
    const animationFrames = [
        {
            transform: `rotate(${startingPoint}deg)`,
            opacity: 0,
        },
        {
            transform: `rotate(${startingPoint + 360}deg)`,
            opacity: 0.2,
        },
        {
            transform: `rotate(${startingPoint + 720}deg)`,
            opacity: 0,
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
    });
};

const Weapon = ({
    image,
    options,
    action,
    wielder,
    wielderRef,
    target,
}: {
    image?: string;
    options?: { transform?: string };
    action?: Action;
    wielder?: Combatant;
    wielderRef: HTMLElement;
    target?: HTMLElement;
}) => {
    const classes = useStyles(options as any);
    const { type, area } = action || {};
    const weaponRef = useRef();
    const afterImagesRefs = Array.from({ length: 3 }).map(() => useRef());
    const animationRefs = useRef([]);

    const rotation = useMemo(() => {
        if (type !== ACTION_TYPES.ATTACK || !target || !wielderRef || !action || area) {
            return;
        }

        // Single target rotates the weapon to face the target
        return getRotationToFaceTarget(getTargetPoints({ to: target, from: wielderRef })) + WEAPON_DEFAULT_ROTATION;
    }, [action, target]);

    const isGlowing = useMemo(() => wielder?.effects?.some((e: Effect) => e.weaponAnimation === "glow"), [wielder?.effects]);

    useEffect(() => {
        //@ts-ignore
        animationRefs.current?.forEach((a) => a.cancel());
        if (!weaponRef.current || type !== ACTION_TYPES.ATTACK) {
            return;
        }
        if (area === 1) {
            animationRefs.current = [
                swing({ object: weaponRef.current }),
                ...afterImagesRefs.map((ref, i) => {
                    return swing({ object: ref.current, opacity: 0.2, delay: i * 25, startingPoint: 110 });
                }),
            ];
        } else if (area >= 2) {
            animationRefs.current = [
                whirl({ object: weaponRef.current }),
                ...afterImagesRefs.map((ref, i) => {
                    const startingPoint = i * (360 / afterImagesRefs.length);
                    return spin({ object: ref.current, startingPoint });
                }),
            ];
        }
    }, [action]);

    if (!image) {
        return null;
    }

    return (
        <>
            {afterImagesRefs.map((ref, i) => (
                <div className={classes.ghost} ref={ref} key={i}>
                    <img src={image} />
                </div>
            ))}
            <div
                className={classNames(classes.root, {
                    [classes.idle]: type !== ACTION_TYPES.ATTACK,
                    [classes.stab]: type === ACTION_TYPES.ATTACK && !area,
                })}
                style={{
                    transform: rotation ? `rotate(${rotation}deg)` : "unset",
                }}
                ref={weaponRef}
            >
                <div
                    className={classNames({
                        [classes.glow]: isGlowing,
                    })}
                >
                    <img src={image} />
                </div>
            </div>
        </>
    );
};

export default Weapon;

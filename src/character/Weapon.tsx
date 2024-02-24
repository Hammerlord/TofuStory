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
});

const swing = ({ object, playbackTime = 500 }) => {
    const animationFrames = [
        {
            transform: "rotate(0deg)",
            offset: 0.25,
            easing: "ease-out",
        },
        {
            transform: "rotate(-35deg)",
            offset: 0.5,
        },
        {
            transform: "rotate(20deg)",
            offset: 0.55,
        },
        {
            transform: "rotate(120deg)",
            offset: 0.75,
        },
        {
            transform: "rotate(50deg)",
            easing: "ease-in",
            offset: 0.9,
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
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
    action: Action;
    wielder: Combatant;
    wielderRef: HTMLElement;
    target?: HTMLElement;
}) => {
    const classes = useStyles(options as any);
    const { type, area } = action || {};
    const weaponRef = useRef();
    const animationRef = useRef();

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
        animationRef.current?.cancel();
        if (!weaponRef.current || type !== ACTION_TYPES.ATTACK) {
            return;
        }
        if (area === 1) {
            animationRef.current = swing({ object: weaponRef.current });
        } else if (area >= 2) {
            animationRef.current = whirl({ object: weaponRef.current });
        }
    }, [action]);

    if (!image) {
        return null;
    }

    return (
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
    );
};

export default Weapon;

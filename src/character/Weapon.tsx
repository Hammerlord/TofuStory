import classNames from "classnames";
import { useMemo } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, Action, Effect } from "../ability/types";
import { getRotationToFaceTarget, getTargetPoints } from "./animations";
import { Combatant } from "./types";

const WEAPON_DEFAULT_ROTATION = 45; // This is a MapleStory thing where weapon sprites are at 45 degree angles

const useStyles = createUseStyles({
    root: {
        transformOrigin: "150% 150%",
        "& img": {
            transform: `scale(4, 4) rotate(90deg)`,
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
    "@keyframes swinging": {
        "0%": {
            transform: "rotate(0deg)",
        },
        "15%": {
            transform: "rotate(0deg)",
        },
        "35%": {
            transform: "rotate(-35deg)",
        },
        "40%": {
            transform: "rotate(20deg)",
        },
        "75%": {
            transform: "rotate(120deg)",
        },
        "90%": {
            transform: "rotate(50deg)",
        },
        "100%": {
            transform: "unset",
        },
    },
    swing: {
        animationDuration: "0.5s",
        animationName: "$swinging",
        transition: "1s filter ease-out, 1s -webkit-filter ease-out",
    },
    "@keyframes whirling": {
        "0%": {
            transform: "rotate(0deg)",
        },
        "35%": {
            transform: "rotate(0deg)",
        },
        "90%": {
            transform: "rotate(520deg)",
        },
        "100%": {
            transform: "rotate(360deg)",
        },
    },
    whirl: {
        animationDuration: "0.6s",
        animationName: "$whirling",
        transition: "1s filter ease-in-out, 1s -webkit-filter ease-in-out",
    },
    "@keyframes glow": {
        "0%": {
            WebkitFilter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
            filter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
        },
        "75%": {
            WebkitFilter: "brightness(2.5) drop-shadow(0 0 10px #fffee8) drop-shadow(0 0 5px #fffee8)",
            filter: "brightness(2.5) drop-shadow(0 0 10px #fffee8) drop-shadow(0 0 5px #fffee8)",
        },
        "100%": {
            WebkitFilter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
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

const Weapon = ({
    image,
    action,
    wielder,
    wielderRef,
    target,
}: {
    image?: string;
    action: Action;
    wielder: Combatant;
    wielderRef: HTMLElement;
    target?: HTMLElement;
}) => {
    const classes = useStyles();
    const { type, area } = action || {};

    const rotation = useMemo(() => {
        if (type !== ACTION_TYPES.ATTACK || !target || !wielderRef || !action || area) {
            return;
        }

        // Single target rotates the weapon to face the target
        return getRotationToFaceTarget(getTargetPoints({ to: target, from: wielderRef })) + WEAPON_DEFAULT_ROTATION;
    }, [action, target]);

    const isGlowing = useMemo(() => wielder?.effects?.some((e: Effect) => e.weaponAnimation === "glow"), [wielder?.effects]);

    if (!image) {
        return null;
    }

    return (
        <div
            className={classNames(classes.root, {
                [classes.idle]: type !== ACTION_TYPES.ATTACK,
                [classes.stab]: type === ACTION_TYPES.ATTACK && !area,
                [classes.swing]: type === ACTION_TYPES.ATTACK && area >= 1,
                [classes.whirl]: type === ACTION_TYPES.ATTACK && area >= 2,
            })}
            style={{
                transform: rotation ? `rotate(${rotation}deg)` : "unset",
            }}
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

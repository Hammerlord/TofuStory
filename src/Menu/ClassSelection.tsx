import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability } from "../ability/types";
import Weapon from "../character/Weapon";
import { playExplodeAnimation, playStompAnimation, playTossUpAnimation } from "../character/animations";
import { playerStateSlice } from "../character/playerReducer";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
    AnonymushroomImage,
    ClassMagicianImage,
    ClassWarriorImage,
    LandImage,
    OldGladiusImage,
    OldWoodenStaffImage,
    StarImage,
    WarMushImage,
    WizMushImage,
} from "../images";
import Button from "../view/Button";
import { getGameFile } from "./gameFiles";
import { PLAYER_CLASSES } from "./types";

const portraits = {
    [PLAYER_CLASSES.WARRIOR]: WarMushImage,
    [PLAYER_CLASSES.MAGICIAN]: WizMushImage,
};

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.85)",
        color: "white",
    },
    bg: {
        opacity: 0.05,
        width: 1067,
        height: 648,
        background: `url(${LandImage})`,
        position: "fixed",
        top: "43%",
        left: "50%",
        transform: "translate(-50%, -71%)",
        zIndex: -1,
    },
    inner: {
        textAlign: "center",
        margin: "auto",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "1.2rem",
    },
    portraitContainer: {
        margin: "64px 0",
        minHeight: "115px",
        position: "relative",
    },
    portrait: {
        left: "50%",
        transform: "translateX(-50%)",
        position: "absolute",
        bottom: 0,
    },
    classContainer: {
        display: "flex",
        margin: "32px 0",
        justifyContent: "space-evenly",
    },
    classCard: {
        width: "250px",
        margin: "16px",
        background: "#666",
        padding: "24px",
        borderRadius: "8px",
        fontSize: "1.1rem",
        cursor: "pointer",
        border: 0,
        color: "white",
        "&:hover": {
            filter: "drop-shadow(0 0 4px #45ff61)",
        },
        "&.selected": {
            filter: "drop-shadow(0 0 5px #45ff61) drop-shadow(0 0 4px #45ff61)",
        },
        transition: "0.1s",
    },
    iconContainer: {
        marginBottom: "8px",
    },
    abilityContainer: {
        margin: "16px",
        marginTop: "32px",
        display: "inline-block",
        verticalAlign: "top",
    },
    abilities: {
        width: "70rem",
        marginBottom: "24px",
    },
    classTitle: {
        display: "block",
        marginTop: 4,
    },
    reloadButton: {
        minHeight: 90,
        paddingTop: 32,
        "& hr": {
            marginTop: 0,
            marginBottom: 32,
            borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
        },
    },
    runSavedNotice: {
        fontSize: 16,
    },
    ghost: {
        opacity: 0,
    },
    weaponContainer: {
        position: "absolute",
        top: 0,
        left: "calc(50% - 25px)",
        transform: "translateX(-50%)",
    },
    "@keyframes applyEffect": {
        "0%": {
            filter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
            transform: "translateX(-50%) translateY(0)",
        },

        "75%": {
            filter: "brightness(1.5) drop-shadow(0 0 10px #fffee8) drop-shadow(0 0 5px #fffee8)",
            transform: "translateX(-50%) translateY(-24px)",
        },

        "100%": {
            filter: "brightness(1) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            transform: "translateX(-50%) unset",
        },
    },
    applyingEffect: {
        animationDuration: "1s",
        animationName: "$applyEffect",
        transition: "1s filter linear, 1s -webkit-filter linear",
        animationIterationCount: "unset", // Animation will loop and clip if the character is also casting
    },
});

const { loadState } = playerStateSlice.actions;

const ClassSelection = ({
    onSelectClass,
    onClose,
    onTransition,
}: {
    onSelectClass: (playerClass: PLAYER_CLASSES, starters: Ability[]) => void;
    onClose: (reloadedRun: boolean) => void;
    onTransition: (callback: Function) => void;
}) => {
    const [selectedClass, setSelectedClass] = useState(null);
    const { character } = useAppSelector((state) => state);
    const { player } = character || {};
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const characterRef: any = useRef();
    const ghostRefs: any = Array.from({ length: 3 }).map(() => useRef());
    const projectileRef: any = useRef();

    const handleSelectClass = () => {
        onTransition(() => {
            if (selectedClass) {
                onSelectClass(selectedClass, JOB_CARD_MAP[selectedClass].starters);
            }
        });
    };

    useEffect(() => {
        if (selectedClass === PLAYER_CLASSES.WARRIOR) {
            const animation = playStompAnimation({ object: characterRef.current, playbackTime: 500 });
            animation.onfinish = () => {
                playExplodeAnimation({ object: ghostRefs.map((ref) => ref.current), playbackTime: 250, maxScale: 3, translateX: -50 });
            };
            return () => animation.cancel();
        }

        if (selectedClass === PLAYER_CLASSES.MAGICIAN) {
            const animations = playTossUpAnimation({
                from: characterRef.current,
                object: projectileRef.current,
            });

            return () => animations.forEach((animation) => animation.cancel());
        }
    }, [selectedClass]);

    if (player) {
        return (
            <div className={classes.root}>
                <div className={classes.inner}>
                    <div className={classes.bg} />
                    <h2>You gained abilities</h2>
                    <div className={classes.abilities}>
                        {[...(JOB_CARD_MAP[selectedClass]?.starters || [])]
                            .sort((a, b) => (a.resourceCost || 0) - (b.resourceCost || 0))
                            .map((ability, i) => (
                                <div className={classes.abilityContainer} key={[ability.name, i].join("-")}>
                                    <AbilityView ability={ability} disableBattleBonuses={true} />
                                </div>
                            ))}
                    </div>
                    <Button color="secondary" onClick={() => onTransition(() => onClose(false))}>
                        Continue
                    </Button>
                </div>
            </div>
        );
    }

    const previousRun = getGameFile();
    const getWeapon = () => {
        if (selectedClass === PLAYER_CLASSES.WARRIOR) {
            return <Weapon image={OldGladiusImage} wielderRef={characterRef} />;
        }

        if (selectedClass === PLAYER_CLASSES.MAGICIAN) {
            return <Weapon image={OldWoodenStaffImage} wielderRef={characterRef} />;
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <div>
                    <h1>You wake up without arms or legs.</h1>
                    <div className={classes.bg} />
                    <div className={classes.portraitContainer} ref={characterRef}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <img
                                key={i}
                                src={portraits[selectedClass] || AnonymushroomImage}
                                className={classNames(classes.portrait, classes.ghost)}
                                ref={ghostRefs[i]}
                            />
                        ))}
                        <img
                            src={portraits[selectedClass] || AnonymushroomImage}
                            className={classNames(classes.portrait, {
                                [classes.applyingEffect]: selectedClass === PLAYER_CLASSES.MAGICIAN,
                            })}
                        />
                        <div
                            className={classNames(classes.weaponContainer, {
                                [classes.applyingEffect]: selectedClass === PLAYER_CLASSES.MAGICIAN,
                            })}
                        >
                            {getWeapon()}
                        </div>
                        <img src={StarImage} ref={projectileRef} className={classes.ghost} />
                    </div>
                    <p>After some time spent fumbling around, you realize that you are, in fact, a mushroom.</p>
                    <p>You don't remember much, but you do remember you were a...</p>
                </div>
                <div className={classes.classContainer}>
                    <button
                        onClick={() => setSelectedClass(PLAYER_CLASSES.WARRIOR)}
                        className={classNames(classes.classCard, {
                            selected: selectedClass === PLAYER_CLASSES.WARRIOR,
                        })}
                    >
                        <span className={classes.iconContainer}>
                            <img src={ClassWarriorImage} />
                        </span>
                        <br />
                        <span className={classes.classTitle}>WARRIOR</span> <hr />A close-quarters fighter specializing in defenses and
                        focused area attacks
                    </button>
                    <button
                        onClick={() => setSelectedClass(PLAYER_CLASSES.MAGICIAN)}
                        className={classNames(classes.classCard, {
                            selected: selectedClass === PLAYER_CLASSES.MAGICIAN,
                        })}
                    >
                        <span className={classes.iconContainer}>
                            <img src={ClassMagicianImage} />
                        </span>
                        <br />
                        <span className={classes.classTitle}>MAGICIAN</span> <hr />A ranged caster capable of bombarding enemies with magic
                        spells
                    </button>
                </div>
                <Button color="primary" disabled={!selectedClass} onClick={handleSelectClass}>
                    Start
                </Button>

                <div className={classes.reloadButton}>
                    {previousRun && (
                        <>
                            <hr />
                            <div>
                                <p className={classes.runSavedNotice}>
                                    A run was saved from your previous session. Continue at the last campsite / town?
                                </p>
                                <Button
                                    color="secondary"
                                    onClick={() => {
                                        onTransition(() => {
                                            dispatch(loadState(previousRun));
                                            onClose(true);
                                        });
                                    }}
                                >
                                    Continue Run
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassSelection;

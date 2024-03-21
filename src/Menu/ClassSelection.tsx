import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { AnonymushroomImage, ClassMagicianImage, ClassWarriorImage, LandImage, WarMushImage, WizMushImage } from "../images";
import Button from "../view/Button";
import { PLAYER_CLASSES } from "./types";
import { useAppDispatch, useAppSelector } from "../hooks";
import { getGameFile } from "./gameFiles";
import { playerStateSlice } from "../character/playerReducer";
import { Ability } from "../ability/types";

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
});

const { loadState } = playerStateSlice.actions;

const ClassSelection = ({
    onSelectClass,
    onClose,
}: {
    onSelectClass: (playerClass: PLAYER_CLASSES, starters: Ability[]) => void;
    onClose: (reloadedRun: boolean) => void;
}) => {
    const [selectedClass, setSelectedClass] = useState(null);
    const { character } = useAppSelector((state) => state);
    const { player } = character || {};
    const classes = useStyles();
    const dispatch = useAppDispatch();

    const handleSelectClass = () => {
        if (selectedClass) {
            onSelectClass(selectedClass, JOB_CARD_MAP[selectedClass].starters);
        }
    };

    if (player) {
        return (
            <div className={classes.root}>
                <div className={classes.inner}>
                    <div className={classes.bg} />
                    <h2>You gained abilities</h2>
                    <div className={classes.abilities}>
                        {[...JOB_CARD_MAP[selectedClass].starters]
                            .sort((a, b) => (a.resourceCost || 0) - (b.resourceCost || 0))
                            .map((ability, i) => (
                                <div className={classes.abilityContainer} key={[ability.name, i].join("-")}>
                                    <AbilityView ability={ability} />
                                </div>
                            ))}
                    </div>
                    <Button color="secondary" onClick={() => onClose(false)}>
                        Continue
                    </Button>
                </div>
            </div>
        );
    }

    const previousRun = getGameFile();

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <div>
                    <h1>You wake up without arms or legs.</h1>
                    <div className={classes.bg} />
                    <div className={classes.portraitContainer}>
                        <img src={portraits[selectedClass] || AnonymushroomImage} className={classes.portrait} />
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
                                        dispatch(loadState(previousRun));
                                        onClose(true);
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

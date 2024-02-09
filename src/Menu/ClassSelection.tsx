import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { AnonymushroomImage, ClassMagicianImage, ClassWarriorImage, WarMushImage, WizMushImage } from "../images";
import Button from "../view/Button";
import { PLAYER_CLASSES } from "./types";
import { useAppSelector } from "../hooks";

const portraits = {
    [PLAYER_CLASSES.WARRIOR]: WarMushImage,
    [PLAYER_CLASSES.MAGICIAN]: WizMushImage,
};

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
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
        margin: "32px 0",
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
        width: "175px",
        margin: "16px",
        background: "#666",
        padding: "24px",
        borderRadius: "8px",
        fontSize: "1rem",
        cursor: "pointer",
        "&.selected": {
            filter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
            WebkitFilter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
        },
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
});

const ClassSelection = ({ onSelectClass, onClose }) => {
    const [selectedClass, setSelectedClass] = useState(null);
    const { character } = useAppSelector((state) => state);
    const { player } = character || {};
    const classes = useStyles();

    const handleSelectClass = () => {
        if (selectedClass) {
            onSelectClass(selectedClass, JOB_CARD_MAP[selectedClass].starters);
        }
    };

    if (player) {
        return (
            <div className={classes.root}>
                <div className={classes.inner}>
                    <h2>You gained abilities</h2>
                    <div className={classes.abilities}>
                        {[...JOB_CARD_MAP[selectedClass].starters]
                            .sort((a, b) => (a.resourceCost || 0) - (b.resourceCost || 0))
                            .map((ability, i) => (
                                <div className={classes.abilityContainer} key={[ability.name, i].join("-")}>
                                    <AbilityView ability={ability} player={player} />
                                </div>
                            ))}
                    </div>
                    <Button color="secondary" onClick={onClose}>
                        Continue
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <div>
                    <h1>You wake up without arms or legs.</h1>
                    <div className={classes.portraitContainer}>
                        <img src={portraits[selectedClass] || AnonymushroomImage} className={classes.portrait} />
                    </div>
                    <p>After some time spent fumbling around, you realize that you are, in fact, a mushroom.</p>
                    <p>You don't remember much, but you do remember you were a...</p>
                </div>
                <div className={classes.classContainer}>
                    <div
                        onClick={() => setSelectedClass(PLAYER_CLASSES.WARRIOR)}
                        className={classNames(classes.classCard, {
                            selected: selectedClass === PLAYER_CLASSES.WARRIOR,
                        })}
                    >
                        <div className={classes.iconContainer}>
                            <img src={ClassWarriorImage} />
                        </div>
                        <div>WARRIOR</div> <hr />A close-quarters fighter specializing in defenses and focused area attacks
                    </div>
                    <div
                        onClick={() => setSelectedClass(PLAYER_CLASSES.MAGICIAN)}
                        className={classNames(classes.classCard, {
                            selected: selectedClass === PLAYER_CLASSES.MAGICIAN,
                        })}
                    >
                        <div className={classes.iconContainer}>
                            <img src={ClassMagicianImage} />
                        </div>
                        <div>MAGICIAN</div> <hr />A ranged caster capable of bombarding enemies with magic spells
                    </div>
                </div>
                <Button color="primary" disabled={!selectedClass} onClick={handleSelectClass}>
                    Select!
                </Button>
            </div>
        </div>
    );
};

export default ClassSelection;

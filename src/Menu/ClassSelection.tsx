import { Button } from "@material-ui/core";
import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { anonymushroom, classwarrior, warmush } from "../images";
import { PLAYER_CLASSES } from "./playerClasses";

const portraits = {
    [PLAYER_CLASSES.WARRIOR]: warmush,
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
            boxShadow: "0 0 8px 4px #45ff61",
        },
    },
    iconContainer: {
        marginBottom: "8px",
    },
});

const ClassSelection = ({ onSelectClass }) => {
    const [selectedClass, setSelectedClass] = useState(null);
    const classes = useStyles();

    const handleSelectClass = () => {
        if (selectedClass) {
            onSelectClass(selectedClass);
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <div>
                    <h1>You wake up without arms or legs.</h1>
                    <div className={classes.portraitContainer}>
                        <img src={portraits[selectedClass] || anonymushroom} className={classes.portrait} />
                    </div>
                    <p>After some time of fumbling around, you realize that you are in fact a mushroom.</p>
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
                            <img src={classwarrior} />
                        </div>
                        <div>WARRIOR</div> <hr />A close-quarters fighter specializing in defenses and focused area attacks
                    </div>
                    <div className={classes.classCard}>Not yet available</div>
                    <div className={classes.classCard}>Not yet available</div>
                    <div className={classes.classCard}>Not yet available</div>
                </div>
                <Button variant="contained" color="primary" onClick={handleSelectClass}>
                    Select!
                </Button>
            </div>
        </div>
    );
};

export default ClassSelection;
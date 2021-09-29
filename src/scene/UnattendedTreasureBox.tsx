import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import Notification from "../battle/Notification";
import { bluesnailImage, Lock, shroomImage, snailImage, treasureChest2Image } from "../images";
import { getRandomInt, shuffle } from "../utils";
import BannerNotice from "../view/BannerNotice";
import Icon from "../icon/Icon";

const useStyles = createUseStyles({
    root: {
        textAlign: "center",
        position: "relative",
        width: "100%",
        height: "100%",
        background: "rgba(25, 25, 25, 0.8)",
    },
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
    },
    puzzleContainer: {
        display: "flex",
        padding: "1rem 2rem",
        border: "2px solid rgba(214, 214, 128, 0.8)",
        background: "rgba(165, 155, 129, 0.5)",
        borderRadius: "8px",
    },
    bannerContainer: {
        position: "fixed",
        width: "40%",
        top: "64px",
        left: "50%",
        transform: "translateX(-50%)",
    },
    iconContainer: {
        display: "inline-block",
        background: "rgba(25, 25, 25, 0.3)",
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.25)",
        height: 50,
        width: 50,
        position: "relative",
        cursor: "pointer",
    },
    icon: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
    },
    chestContainer: {
        position: "relative",
    },
    center: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
    },
    "@keyframes openChest": {
        "0%": {
            transform: "rotate(-2deg) translateY(0)",
        },
        "25%": {
            transform: "rotate(-1deg) translateY(-3px)",
        },
        "50%": {
            transform: "rotate(1deg) translateY(-5px)",
        },
        "75%": {
            transform: "rotate(-1deg) translateY(-3px)",
        },
        "100%": {
            transform: "rotate(-1deg) translateY(0)",
        },
    },
    treasureChest: {
        width: 200,
        height: 150,
        objectFit: "contain",
        imageRendering: "pixelated",
        marginTop: "32px",
        marginBottom: "16px",
        "&.open": {
            animationDuration: "1s",
            animationName: "$openChest",
            transitionTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            cursor: "pointer",
        },
    },
    arrow: {
        margin: "auto",
        background: "rgba(0, 0, 0, 0.1)",
        width: "100%",
        textAlign: "center",
        borderRadius: "4px",
        cursor: "pointer",
        color: "rgba(0, 0, 0, 0.5)",
    },
    lockContainer: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        width: "48px",
        height: "48px",
        fontSize: "32px",
        borderRadius: "48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
    },
    lock: {
        width: "32px",
        height: "32px",
        margin: "auto",
    },
});

const UnattendedTreasureBox = ({ onComplete, treasure }) => {
    const classes = useStyles();
    const column = [snailImage, bluesnailImage, shroomImage];
    const [currentCombo, setCurrentCombo] = useState(Array.from({ length: 5 }).map(() => getRandomInt(0, column.length - 1)));
    const [correctAnswer] = useState(shuffle(currentCombo.map((_, i) => i)));
    const [currentAnswer, setCurrentAnswer] = useState([]);
    const [completed, setCompleted] = useState(false);

    const onClickTile = (i: number) => {
        if (completed) {
            return;
        }
        const numChanged = correctAnswer.indexOf(i) + 1;
        const newCombo = currentCombo.slice();
        const increment = (value: number) => (((value + 1) % column.length) + column.length) % column.length;
        let count = 0;
        for (let j = 0; j < currentCombo.length; ++j) {
            if (typeof newCombo[i + j] === "number") {
                newCombo[i + j] = increment(newCombo[i + j]);
                ++count;
                if (count === numChanged) {
                    break;
                }
            }

            if (j > 0 && typeof newCombo[i - j] === "number") {
                newCombo[i - j] = increment(newCombo[i - j]);
                ++count;
                if (count === numChanged) {
                    break;
                }
            }
        }

        setCurrentCombo(newCombo);
        if (correctAnswer[currentAnswer.length] === i) {
            const newAnswer = [...currentAnswer, i];
            setCurrentAnswer(newAnswer);
            const isCorrectAnswer = newAnswer.length === correctAnswer.length && newAnswer.every((value, i) => correctAnswer[i] === value);
            if (isCorrectAnswer) {
                setCompleted(true);
            }
        } else if (correctAnswer[currentAnswer.length - 1] !== i) {
            // If the answer is not what we recently selected, it gets reset
            setCurrentAnswer([]);
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.bannerContainer}>
                <BannerNotice>Unattended Treasure Box</BannerNotice>
            </div>
            <div className={classes.inner}>
                <div className={classes.chestContainer}>
                    <img
                        src={treasureChest2Image}
                        className={classNames(classes.treasureChest, {
                            open: completed,
                        })}
                    />
                    {!completed && (
                        <div className={classes.lockContainer}>
                            <Lock className={classes.lock} />
                        </div>
                    )}
                </div>
                <div className={classes.puzzleContainer}>
                    {currentCombo.map((c, i) => (
                        <div className={classes.iconContainer} key={i} onClick={() => onClickTile(i)}>
                            <img src={column[c]} className={classes.icon} key={column[c]} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UnattendedTreasureBox;

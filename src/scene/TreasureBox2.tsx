import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import {
    bluesnailImage,
    Lock,
    orangeMushroomImage,
    pigImage,
    redsnailImage,
    shroomImage,
    slimeImage,
    snailImage,
    treasureChest2Image,
} from "../images";
import { getRandomInt, shuffle } from "../utils";
import BannerNotice from "../view/BannerNotice";

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
    },
    icon: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        maxWidth: 40,
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
    column: {
        display: "flex",
        flexDirection: "column",
    },
    arrow: {
        margin: "auto",
        background: "rgba(0, 0, 0, 0.1)",
        width: "100%",
        textAlign: "center",
        borderRadius: "4px",
        cursor: "pointer",
        color: "rgba(0, 0, 0, 0.5)",
        border: "none",
        outline: "none",
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

const TreasureBox = ({ onComplete }) => {
    const [columns] = useState(
        (() => {
            const column = shuffle([snailImage, bluesnailImage, shroomImage, redsnailImage, slimeImage, orangeMushroomImage, pigImage]);
            const answerIndex = getRandomInt(0, column.length - 1);
            const [validAnswer] = column.splice(answerIndex, 1);
            const cols = Array.from({ length: 4 }).map((_, i) => {
                const wrappedIndex = (val: number) => (((val + i) % column.length) + column.length) % column.length;
                const extras = Array.from({ length: Math.max(2, i) }).map((_, j) => column[wrappedIndex(j)]);
                return [validAnswer, ...extras];
            });
            return shuffle(cols);
        })()
    );

    const [answer, setAnswer] = useState(columns.map((col) => getRandomInt(0, col.length - 1)));
    const [completed, setCompleted] = useState(false);

    const checkCorrectAnswer = (newAnswer: number[]) => {
        let prevIcon = null;
        const isSameIcon = (j: number, i: number) => {
            if (!prevIcon) {
                prevIcon = columns[i][j];
            }
            return prevIcon === columns[i][j];
        };
        if (newAnswer.every(isSameIcon)) {
            setCompleted(true);
        }
    };

    const onClickTurnReel = (colIndex: number, direction: 1 | -1) => {
        if (completed) {
            return;
        }
        const column = columns[colIndex];
        const newAnswer = answer.slice();
        newAnswer[colIndex] = (((newAnswer[colIndex] + direction) % column.length) + column.length) % column.length;
        setAnswer(newAnswer);
        checkCorrectAnswer(newAnswer);
    };

    const classes = useStyles();

    return (
        <div className={classes.root}>
            <div className={classes.bannerContainer}>
                <BannerNotice>Treasure Box</BannerNotice>
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
                    {answer.map((i, j) => (
                        <div key={j} className={classes.column}>
                            <button className={classes.arrow} onClick={() => onClickTurnReel(j, -1)}>
                                ▲
                            </button>
                            <div className={classes.iconContainer}>
                                <img src={columns[j][i]} className={classes.icon} key={columns[j][i]} />
                            </div>
                            <button className={classes.arrow} onClick={() => onClickTurnReel(j, 1)}>
                                ▼
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TreasureBox;

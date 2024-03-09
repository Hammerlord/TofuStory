import { useState } from "react";
import { createUseStyles } from "react-jss";
import { BlueSnailImage, OrangeMushroomImage, PigImage, RedSnailImage, ShroomImage, SlimeImage, SnailImage } from "../../images";
import { getRandomInt, shuffle } from "../../utils";
import { PuzzleProps } from "./types";

const useStyles = createUseStyles({
    root: {
        display: "flex",
        margin: "auto",
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
    center: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
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
        height: 50,
    },
    reel: {
        display: "flex",
        position: "relative",
        flexDirection: "column",
    },
    shaderTop: {
        background: "linear-gradient(rgba(30,30,25,1) 50%, rgba(30,30,25,0.9) 70%, rgba(30,30,25,0) 100%)",
        position: "absolute",
        top: 0,
        height: 50,
        width: "100%",
    },
    shaderBottom: {
        background: "linear-gradient(360deg, rgba(30,30,25,1) 50%, rgba(30,30,25,0.9) 70%, rgba(30,30,25,0) 100%)",
        position: "absolute",
        bottom: 0,
        height: 50,
        width: "100%",
    },
});

const ReelLockPuzzle = ({ onComplete, completed, onInteraction }: PuzzleProps) => {
    const [columns] = useState(
        (() => {
            const column = shuffle([SnailImage, BlueSnailImage, ShroomImage, RedSnailImage, SlimeImage, OrangeMushroomImage, PigImage]);
            const answerIndex = getRandomInt(0, column.length - 1);
            const [validAnswer] = column.splice(answerIndex, 1);
            const cols = Array.from({ length: 4 }).map((_, i) => {
                const wrappedIndex = (val: number) => (((val + i) % column.length) + column.length) % column.length;
                const extras = Array.from({ length: Math.max(4, i + 1) }).map((_, j) => column[wrappedIndex(j)]);
                return [validAnswer, ...extras];
            });
            return shuffle(cols);
        })()
    );

    const [answer, setAnswer] = useState(columns.map((col) => getRandomInt(0, col.length - 1)));

    const checkCorrectAnswer = (newAnswer: number[]) => {
        let prevIcon = null;
        const isSameIcon = (j: number, i: number) => {
            if (!prevIcon) {
                prevIcon = columns[i][j];
            }
            return prevIcon === columns[i][j];
        };
        if (newAnswer.every(isSameIcon)) {
            onComplete();
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
        onInteraction && onInteraction();
    };

    const classes = useStyles();
    const modulo = (number, column) => {
        if (number < 0) {
            return column.length - 1;
        }
        return number % column.length;
    };

    return (
        <div className={classes.root}>
            {answer.map((i, j) => (
                <div key={j} className={classes.column}>
                    <button className={classes.arrow} onClick={() => onClickTurnReel(j, -1)}>
                        ▲
                    </button>
                    <div className={classes.reel}>
                        <div className={classes.iconContainer}>
                            <img src={columns[j][modulo(i + 1, columns[j])]} className={classes.icon} key={[j, i + 1].join("")} />
                        </div>
                        <div className={classes.iconContainer}>
                            <img src={columns[j][i]} className={classes.icon} key={[j, i].join("")} />
                        </div>
                        <div className={classes.iconContainer}>
                            <img src={columns[j][modulo(i - 1, columns[j])]} className={classes.icon} key={[j, i - 1].join("")} />
                        </div>
                        <div className={classes.shaderBottom} />
                        <div className={classes.shaderTop} />
                    </div>
                    <button className={classes.arrow} onClick={() => onClickTurnReel(j, 1)}>
                        ▼
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ReelLockPuzzle;

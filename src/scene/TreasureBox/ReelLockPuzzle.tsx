import { useState } from "react";
import { createUseStyles } from "react-jss";
import { bluesnailImage, orangeMushroomImage, pigImage, redsnailImage, shroomImage, slimeImage, snailImage } from "../../images";
import { getRandomInt, shuffle } from "../../utils";

const useStyles = createUseStyles({
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
    },
});

const ReelLockPuzzle = ({ onComplete, completed }: { onComplete: Function; completed: boolean }) => {
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
    };

    const classes = useStyles();

    return (
        <>
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
        </>
    );
};

export default ReelLockPuzzle;

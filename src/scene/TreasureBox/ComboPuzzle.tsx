import { useState } from "react";
import { createUseStyles } from "react-jss";
import { bluesnailImage, shroomImage, snailImage } from "../../images";
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
        cursor: "pointer",
    },
    icon: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
    },
});

const ComboPuzzle = ({ onComplete, completed }: { onComplete: Function; completed: boolean }) => {
    const classes = useStyles();
    const column = [snailImage, bluesnailImage, shroomImage];
    const [currentCombo, setCurrentCombo] = useState(Array.from({ length: 5 }).map(() => getRandomInt(0, column.length - 1)));
    const [correctAnswer] = useState(shuffle(currentCombo.map((_, i) => i)));
    const [currentAnswer, setCurrentAnswer] = useState([]);

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
                onComplete();
            }
        } else if (correctAnswer[currentAnswer.length - 1] !== i) {
            // If the answer is not what we recently selected, it gets reset
            setCurrentAnswer([]);
        }
    };

    return (
        <>
            {currentCombo.map((c, i) => (
                <div className={classes.iconContainer} key={i} onClick={() => onClickTile(i)}>
                    <img src={column[c]} className={classes.icon} key={column[c]} />
                </div>
            ))}
        </>
    );
};

export default ComboPuzzle;

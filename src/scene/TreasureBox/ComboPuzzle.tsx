import classNames from "classnames";
import { useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { BlueSnailImage, RedSnailImage, ShroomImage, SlimeImage, SnailImage } from "../../images";
import { getRandomInt, getRandomItem, shuffle } from "../../utils";
import { PuzzleProps } from "./types";

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
        maxWidth: 40,
    },
    "@keyframes fade": {
        "0%": {
            opacity: 0.3,
        },
        "100%": {
            opacity: 0.9,
        },
    },
    recentlySelected: {
        animationName: "$fade",
        animationDuration: "0.5s",
        animationIterationCount: 3,
        animationDirection: "alternate-reverse",
    },
});

const ComboPuzzle = ({ onComplete, completed, onInteraction }: PuzzleProps) => {
    const classes = useStyles();
    const column = [SnailImage, BlueSnailImage, ShroomImage, SlimeImage, RedSnailImage];
    const [currentCombo, setCurrentCombo] = useState(Array.from({ length: 5 }).map(() => getRandomInt(0, column.length - 1)));
    const [correctAnswer] = useState(shuffle(currentCombo.map((_, i) => i)));
    const [currentAnswer, setCurrentAnswer] = useState([]);

    const prevCombo = useRef(currentCombo);

    const onClickTile = (i: number) => {
        if (completed) {
            return;
        }
        const numChanged = correctAnswer.indexOf(i) + 1;
        const newCombo = currentCombo.slice();
        let count = 0;
        const getNewTile = (index: number) => {
            // A tile cannot turn into the same tile
            const possibleOptions = Array.from({ length: column.length })
                .map((_, i) => i)
                .filter((i) => i !== currentCombo[index]);
            return getRandomItem(possibleOptions);
        };
        for (let j = 0; j < currentCombo.length; ++j) {
            if (typeof newCombo[i + j] === "number") {
                newCombo[i + j] = getNewTile(i + j);
                ++count;
                if (count === numChanged) {
                    break;
                }
            }

            if (j > 0 && typeof newCombo[i - j] === "number") {
                newCombo[i - j] = getNewTile(i - j);
                ++count;
                if (count === numChanged) {
                    break;
                }
            }
        }

        prevCombo.current = currentCombo;
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

        onInteraction && onInteraction();
    };

    return (
        <>
            {currentCombo.map((tileId, i: number) => (
                <div className={classes.iconContainer} key={i} onClick={() => onClickTile(i)}>
                    <img
                        src={column[tileId]}
                        className={classNames(classes.icon, {
                            [classes.recentlySelected]: currentCombo[i] !== prevCombo?.current?.[i],
                        })}
                        key={column[tileId]}
                    />
                </div>
            ))}
        </>
    );
};

export default ComboPuzzle;

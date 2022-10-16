import { useState } from "react";
import { createUseStyles } from "react-jss";
import { BlueSnailImage, RedSnailImage, SnailImage } from "../../images";
import { getRandomInt, getRandomItem } from "../../utils";

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

const tiles = [SnailImage, BlueSnailImage, RedSnailImage];

const tilesChangePossibilities = [
    [1, 2, 3, 2, 1],
    [2, 1, 3, 1, 2],
    [3, 2, 1, 2, 3],
];

const RowPuzzle = ({ onComplete, completed }: { onComplete: Function; completed: boolean }) => {
    const classes = useStyles();
    // Eg. if you click on a index with value '3', it changes 3 tiles
    const [tilesChange] = useState(getRandomItem(tilesChangePossibilities));
    const [currentAnswer, setCurrentAnswer] = useState(Array.from({ length: 5 }).map(() => getRandomInt(0, tiles.length - 1)));

    const onClickTile = (i: number) => {
        if (completed) {
            return;
        }

        const numChanged = tilesChange[i];

        const newAnswer = currentAnswer.slice();
        const increment = (value: number) => (((value + 1) % tiles.length) + tiles.length) % tiles.length;
        let count = 0;
        for (let j = 0; j < numChanged; ++j) {
            // Directionality only really matters for numChanged = 2; we want it to cover the numChanged = 1 tile or the puzzle is unsolveable
            const dir = tilesChange[i + 1] === 3 ? -1 : 1;
            const k = j * dir;
            if (typeof newAnswer[i + k] === "number") {
                newAnswer[i + k] = increment(newAnswer[i + k]);
                ++count;
                if (count === numChanged) {
                    break;
                }
            }

            if (j > 0 && typeof newAnswer[i - k] === "number") {
                newAnswer[i - k] = increment(newAnswer[i - k]);
                ++count;
                if (count === numChanged) {
                    break;
                }
            }
        }

        setCurrentAnswer(newAnswer);
        if (newAnswer.every((tile: number) => tile === newAnswer[0])) {
            onComplete();
        }
    };

    return (
        <>
            {currentAnswer.map((c, i) => (
                <div className={classes.iconContainer} key={i} onClick={() => onClickTile(i)}>
                    <img src={tiles[c]} className={classes.icon} key={tiles[c]} />
                </div>
            ))}
        </>
    );
};

export default RowPuzzle;

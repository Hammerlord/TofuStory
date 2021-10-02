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
});

const RedBluePuzzle = ({ onComplete, completed }) => {
    const [answer, setAnswer] = useState(Array.from({ length: 6 }).map(() => Math.random() < 0.5));

    const onClickTile = (index: number) => {
        const newAnswer = answer.slice();
        for (let i = index - 1; i <= index + 1; ++i) {
            if (newAnswer[i] !== undefined) {
                newAnswer[i] = !newAnswer[i];
            }
        }

        setAnswer(newAnswer);
        if (newAnswer.every((a) => a)) {
            onComplete();
        }
    };

    const classes = useStyles();

    return (
        <>
            {answer.map((a: boolean, i: number) => (
                <div key={i}>
                    <div className={classes.iconContainer} onClick={() => onClickTile(i)}>
                        <img src={a ? bluesnailImage : redsnailImage} className={classes.icon} key={a ? bluesnailImage : redsnailImage} />
                    </div>
                </div>
            ))}
        </>
    );
};

export default RedBluePuzzle;

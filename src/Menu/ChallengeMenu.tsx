import { createUseStyles } from "react-jss";
import { createEnemies } from "../enemy/createEnemy";
import tutorial, { Wave } from "./tutorial";

export interface Challenge {
    name: string;
    description: string;
    waves: Wave[];
    rewards?: Array<any>;
}

const challenges: Challenge[] = [
    {
        name: "Tutorial",
        description: "Learn about basic gameplay",
        waves: tutorial,
        rewards: [],
    },
    {
        name: "Random tofus",
        description: "Fight some tofus and their minions",
        waves: [{
            createEnemies: createEnemies,
        }],
        rewards: [],
    },
];

const useStyles = createUseStyles({
    challenge: {
        padding: "16px 32px",
        border: "1px solid rgba(0, 0, 0, 0.2)",
        borderRadius: "2px",
        cursor: "pointer",
        background: "rgba(0, 0, 0, 0.1)",
        width: "200px",
        height: "150px",
        display: "inline-block",
        verticalAlign: "top",
    },
    title: {
        color: "rgba(0, 0, 0, 0.5)",
    },
});

const ChallengeMenu = ({ onSelectChallenge }) => {
    const classes = useStyles();
    return (
        <div>
            <h2 className={classes.title}>Challenges</h2>
            {challenges.map((challenge) => (
                <div
                    className={classes.challenge}
                    key={challenge.description}
                    onClick={() => onSelectChallenge(challenge)}
                >
                    <h3>{challenge.name}</h3>
                    {challenge.description}
                </div>
            ))}
        </div>
    );
};

export default ChallengeMenu;

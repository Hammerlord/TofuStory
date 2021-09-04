import { createUseStyles } from "react-jss";
import createCombatant, { createEnemies } from "../enemy/createEnemy";
import { bigBeefy, smalltofu } from "../enemy/tofu";
import { challenge } from "./challenges";
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
        description: "HOW DO I PLAY THIS GAME?",
        waves: tutorial,
        rewards: [],
    },
    {
        name: "Test Challenge",
        description: "Test",
        waves: challenge,
    },
    {
        name: "Random Tofus",
        description: "Fight some tofus and their minions. Fairness is not guaranteed.",
        waves: [
            {
                createEnemies: createEnemies,
            },
        ],
        rewards: [],
    },
    {
        name: "Test easy",
        description: "",
        waves: [
            {
                createEnemies: () => [null, null, bigBeefy, null, null].map(createCombatant),
            },
        ],
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
                <div className={classes.challenge} key={challenge.description} onClick={() => onSelectChallenge(challenge)}>
                    <h3>{challenge.name}</h3>
                    {challenge.description}
                </div>
            ))}
        </div>
    );
};

export default ChallengeMenu;

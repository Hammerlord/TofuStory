import { createUseStyles } from "react-jss";
import { bash, charge, cleave, slam } from "../ability/Abilities";
import { Ability } from "../ability/types";
import createCombatant, { createEnemies } from "../enemy/createEnemy";
import { smalltofu } from "../enemy/tofu";

export interface Challenge {
    name: string;
    description: string;
    createEnemies: Function;
    presetDeck?: Ability[];
    isTutorial?: boolean;
    rewards?: Array<any>;
}

const challenges: Challenge[] = [
    {
        name: "Tutorial",
        description: "Learn about basic gameplay",
        createEnemies: () =>
            [null, smalltofu, null, smalltofu, null].map(createCombatant),
        presetDeck: [bash, bash, bash, bash, bash, slam, charge],
        isTutorial: true,
    },
    {
        name: "Tutorial 2",
        description: "Learn about area attacks",
        createEnemies: () =>
            [smalltofu, smalltofu, smalltofu, smalltofu, smalltofu].map(
                createCombatant
            ),
        presetDeck: [bash, bash, bash, bash, bash, cleave, cleave],
        isTutorial: true,
    },
    {
        name: "Random tofus",
        description: "Fight some tofus and their minions",
        createEnemies,
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

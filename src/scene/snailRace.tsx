import { createUseStyles } from "react-jss";
import { halfEatenHotdog } from "../item/consumables";
import { tofu } from "../item/items";
import { SCENE_STYLES } from "./constants";
import { EventScene, SCENE_CONDITION_TYPES, ScriptNode } from "./types";
import { BlueSnailRightImage, LithStreetImage, RedSnailRightImage } from "../images";
import { blueSnail, redSnail } from "../enemy/enemy";
import classNames from "classnames";
import { useEffect, useRef } from "react";
import { Player } from "../character/types";

const useStyles = createUseStyles({
    ...SCENE_STYLES,
    redSnail: {
        top: 370,
        left: 225,
    },
    blueSnail: {
        top: 370,
        left: 300,
    },
    racing: {
        left: 25,
        opacity: 0,
    },
    backdropContainer: { width: 1000, height: 675 }, // For horizontal consistency with "puzzle" display
});

const SnailRaceBackdrop = ({ player, winner, onComplete }: { player: Player; winner: "blue" | "red"; onComplete? }) => {
    const classes = useStyles();
    const redSnailRef = useRef(null);
    const blueSnailRef = useRef(null);

    useEffect(() => {
        if (!winner) {
            return;
        }

        const fast = 4000;
        const slow = fast + 1000;

        const animateRoll = (refObject, speed) => {
            const animationFrames = [
                {
                    transform: "translateX(0px) rotate(0deg)",
                    opacity: 0,
                },
                {
                    transform: `translateX(100px) rotate(360deg)`,
                    opacity: 1,
                    offset: 0.2,
                },
                speed === fast && {
                    transform: `translateX(150px) rotate(600deg)`,
                    opacity: 1,
                    offset: 0.35,
                },
                {
                    transform: "translateX(500px) rotate(1500deg)",
                    opacity: 1,
                },
                {
                    transform: "translateX(800px) rotate(2300deg)",
                    opacity: 1,
                    offset: 0.8,
                },
                {
                    transform: "translateX(900px) rotate(2700deg)",
                    opacity: 0,
                },
            ].filter((v) => v);

            refObject.current.animate(animationFrames, speed);
        };

        if (winner === "blue") {
            animateRoll(blueSnailRef, fast);
            animateRoll(redSnailRef, slow);
        } else {
            animateRoll(blueSnailRef, slow);
            animateRoll(redSnailRef, fast);
        }

        setTimeout(() => {
            onComplete();
        }, slow + 500);
    }, []);
    return (
        <div className={classes.backdropContainer}>
            <img src={LithStreetImage} className={classes.backdrop} />
            <img
                src={RedSnailRightImage}
                ref={redSnailRef}
                className={classNames(classes.character, classes.redSnail, {
                    [classes.racing]: winner,
                })}
            />
            <img
                src={BlueSnailRightImage}
                ref={blueSnailRef}
                className={classNames(classes.character, classes.blueSnail, {
                    [classes.racing]: winner,
                })}
            />
        </div>
    );
};

const waitRedSnailRace: ScriptNode[] = [
    {
        dialog: ["The race is starting!"],
    },
    {
        dialog: ["..."],
        conditionalNext: [
            {
                conditions: [
                    {
                        chance: 0.7,
                    },
                ],
                next: [
                    {
                        dialog: ["..."],
                        puzzle: (other) => <SnailRaceBackdrop {...other} winner="red" />,
                    },
                    {
                        dialog: ["The Red Snail won! 125 mesos is yours for the taking.", "[You gained 125 mesos.]"],
                        mesos: 125,
                        responses: [
                            {
                                text: "Continue journey.",
                                isExit: true,
                            },
                        ],
                    },
                ],
            },
            {
                conditions: [],
                next: [
                    {
                        dialog: ["..."],
                        puzzle: (other) => <SnailRaceBackdrop {...other} winner="blue" />,
                    },
                    {
                        dialog: ["The Blue Snail won! Better luck next time!"],
                        responses: [
                            {
                                text: "Continue journey.",
                                isExit: true,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

const fedRedSnailRace: ScriptNode[] = [
    {
        dialog: ["The race is starting!"],
    },
    {
        dialog: ["..."],
        puzzle: (other) => <SnailRaceBackdrop {...other} winner="red" />,
    },
    {
        dialog: ["Wow, Red's performing top-notch today! Is that a new record we just witnessed?", "[You gained 125 mesos.]"],
        mesos: 125,
        responses: [
            {
                text: "Continue journey.",
                isExit: true,
            },
        ],
    },
    ,
];

const waitBlueSnailRace: ScriptNode[] = [
    {
        dialog: ["The race is starting!"],
    },
    {
        dialog: ["..."],
        conditionalNext: [
            {
                conditions: [
                    {
                        chance: 0.3,
                    },
                ],
                next: [
                    {
                        dialog: ["..."],
                        puzzle: (other) => <SnailRaceBackdrop {...other} winner="blue" />,
                    },
                    {
                        dialog: [
                            "In a great show of effort, the Blue Snail won! The winnings are yours for the taking.",
                            "[You gained 275 mesos.]",
                        ],
                        mesos: 275,
                        responses: [
                            {
                                text: "Continue journey.",
                                isExit: true,
                            },
                        ],
                    },
                ],
            },
            {
                conditions: [],
                next: [
                    {
                        dialog: ["..."],
                        puzzle: (other) => <SnailRaceBackdrop {...other} winner="red" />,
                    },
                    {
                        dialog: ["The fan-favorite Red Snail won! Better luck next time!"],
                        responses: [
                            {
                                text: "Continue journey.",
                                isExit: true,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

const fedBlueSnailRace: ScriptNode[] = [
    {
        dialog: ["...", "The race is starting!"],
    },
    {
        dialog: ["..."],
        conditionalNext: [
            {
                conditions: [
                    {
                        chance: 0.8,
                    },
                ],
                next: [
                    {
                        dialog: ["..."],
                        puzzle: (other) => <SnailRaceBackdrop {...other} winner="blue" />,
                    },
                    {
                        dialog: [
                            "That's a serious feat of rolling from our underdog the Blue Snail! The winnings are yours for the taking.",
                            "[You gained 275 mesos.]",
                        ],
                        mesos: 275,
                        responses: [
                            {
                                text: "Continue journey.",
                                isExit: true,
                            },
                        ],
                    },
                ],
            },
            {
                conditions: [],
                next: [
                    {
                        dialog: ["..."],
                        puzzle: (other) => <SnailRaceBackdrop {...other} winner="red" />,
                    },
                    {
                        dialog: ["The fan-favorite Red Snail won! Better luck next time!"],
                        responses: [
                            {
                                text: "Continue journey.",
                                isExit: true,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export const snailRaceScene: EventScene = {
    id: "snail-race",
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.MESOS,
            comparator: "gt",
            value: 50,
        },
    ],
    script: [
        {
            scene: SnailRaceBackdrop,
            dialog: ["Place your bets now! Which snail will win the race, red or blue?"],
            responses: [
                {
                    text: "Red. [Pay 50 mesos. 70% chance to win 125 mesos.]",
                    next: [
                        {
                            dialog: ["Red it is!", "The race is starting soon! Calling all final bets! ..."],
                            loseMesos: 50,
                            responses: [
                                {
                                    conditions: [{ items: [tofu.name] }],
                                    text: "Sneakily give some Tofu to the Red Snail. [100% chance to win.]",
                                    infamy: 1,
                                    next: [
                                        {
                                            dialog: ["[You hand over a piece of Tofu.", "The Red Snail looks sated.]"],
                                            loseItems: [tofu.name],
                                        },
                                        ...fedRedSnailRace,
                                    ],
                                },
                                {
                                    conditions: [{ items: [halfEatenHotdog.name] }],
                                    text: "Sneakily give the Half-Eaten Hotdog to the Red Snail. [100% chance to win.]",
                                    infamy: 1,
                                    next: [
                                        {
                                            dialog: ["[You hand over the Half-Eaten Hotdog.", "The Red Snail looks sated.]"],
                                            loseItems: [halfEatenHotdog.name],
                                        },
                                        ...fedRedSnailRace,
                                    ],
                                },
                                {
                                    text: "Wait for the race to begin.",
                                    next: waitRedSnailRace,
                                },
                            ],
                        },
                    ],
                },
                {
                    text: "Blue. [Pay 50 mesos. 30% chance to win 275 mesos.]",
                    next: [
                        {
                            dialog: ["Blue it is!", "The race is starting soon! Calling all final bets! ..."],
                            loseMesos: 50,
                            responses: [
                                {
                                    conditions: [{ items: [tofu.name] }],
                                    text: "Sneakily give some Tofu to the Blue Snail. [80% chance to win.]",
                                    infamy: 1,
                                    next: [
                                        {
                                            dialog: ["[You hand over a piece of Tofu.", "The Blue Snail looks sated.]"],
                                            loseItems: [tofu.name],
                                        },
                                        ...fedBlueSnailRace,
                                    ],
                                },
                                {
                                    conditions: [{ items: [halfEatenHotdog.name] }],
                                    text: "Sneakily give the Half-Eaten Hotdog to the Blue Snail. [80% chance to win.]",
                                    infamy: 1,
                                    next: [
                                        {
                                            dialog: ["[You hand over the Half-Eaten Hotdog.", "The Blue Snail looks sated.]"],
                                            loseItems: [halfEatenHotdog.name],
                                        },
                                        ...fedBlueSnailRace,
                                    ],
                                },
                                {
                                    text: "Wait for the race to begin.",
                                    next: waitBlueSnailRace,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

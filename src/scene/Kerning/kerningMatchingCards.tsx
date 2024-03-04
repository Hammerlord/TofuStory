import { CaseyImage } from "../../images";
import { alligatorTube, amethyst, blueJeanShorts, cactus, leatherSandals, mesoItem, redHeadband, sword, tShirt } from "../../item/items";
import CardMatchingGame from "../CardMatchingGame";
import { EventScene } from "../types";

const caseyCharacter = {
    name: "Casey",
    image: CaseyImage,
};

const kerningMatchingCards: EventScene = {
    id: "casey-intro",
    script: [
        {
            speaker: caseyCharacter,
            dialog: ["Hi there, Mushie!", "Wanna play a game?"],
        },
        {
            speaker: caseyCharacter,
            dialog: [
                "It's pretty simple. We take turns matching cards, and if you get more matches than me, you win.",
                "If you can beat me, I'll even give you something cool. How about it?",
            ],
            responses: [
                {
                    text: "Okay...?",
                    next: [
                        {
                            dialog: ["[Kerning City must get all sorts of people, as barely anyone here seems to blink at your presence.]"],
                        },
                        {
                            speaker: caseyCharacter,
                            dialog: [
                                "Nice nice. Let's start with a small set of cards. I'll briefly reveal them all face-up at the start, so make sure to remember as many as you can! Ready?",
                            ],
                            responses: [
                                {
                                    text: "Ready.",
                                    next: [
                                        {
                                            puzzle: ({ player, onComplete }) => (
                                                <CardMatchingGame onComplete={onComplete} difficulty={"easy"} />
                                            ),
                                            dialog: [],
                                        },
                                        {
                                            speaker: caseyCharacter,
                                            dialog: ["Good game, Mushie!"],
                                        },
                                        {
                                            speaker: caseyCharacter,
                                            dialog: ["Good game, Mushie!"],
                                            conditionalNext: [
                                                {
                                                    conditions: [
                                                        {
                                                            activityScore: 3,
                                                            comparator: "gt",
                                                        },
                                                    ],
                                                    next: [
                                                        {
                                                            speaker: caseyCharacter,
                                                            dialog: [
                                                                "As promised, I'll give you something from this batch of stuff. Take your pick.",
                                                            ],
                                                        },
                                                        {
                                                            speaker: caseyCharacter,
                                                            dialog: [
                                                                "As promised, I'll give you something from this batch of stuff. Take your pick.",
                                                            ],
                                                            itemChoices: {
                                                                numChoices: 3,
                                                                bonuses: {
                                                                    rare: 0.1,
                                                                    uncommon: 0.2,
                                                                },
                                                            },
                                                        },
                                                        {
                                                            speaker: caseyCharacter,
                                                            dialog: ["That was fun! See you next time."],
                                                            responses: [
                                                                {
                                                                    text: "Bye.",
                                                                    isExit: true,
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    conditions: [
                                                        {
                                                            activityScore: 3,
                                                            comparator: "eq",
                                                        },
                                                    ],
                                                    next: [
                                                        {
                                                            speaker: caseyCharacter,
                                                            dialog: [
                                                                "Wow, that was a close one!",
                                                                "Maybe we can play again later. Till then, here's a little parting gift from me.",
                                                            ],
                                                        },
                                                        {
                                                            speaker: caseyCharacter,
                                                            dialog: [
                                                                "Wow, that was a close one!",
                                                                "Maybe we can play again later. Till then, here's a little parting gift from me.",
                                                            ],
                                                            itemChoices: {
                                                                numChoices: 2,
                                                            },
                                                        },
                                                        {
                                                            speaker: caseyCharacter,
                                                            dialog: ["That was fun! See you next time."],
                                                            responses: [
                                                                {
                                                                    text: "Bye.",
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
                                                            speaker: caseyCharacter,
                                                            dialog: [
                                                                "Maybe we can play again later! Till then, here's a little parting gift from me.",
                                                            ],
                                                        },
                                                        {
                                                            speaker: caseyCharacter,
                                                            dialog: [
                                                                "Maybe we can play again later! Till then, here's a little parting gift from me.",
                                                            ],
                                                            items: {
                                                                itemPool: [
                                                                    leatherSandals,
                                                                    tShirt,
                                                                    sword,
                                                                    redHeadband,
                                                                    blueJeanShorts,
                                                                    mesoItem,
                                                                ],
                                                                amount: 1,
                                                            },
                                                        },
                                                        {
                                                            speaker: caseyCharacter,
                                                            dialog: ["That was fun! See you next time."],
                                                            responses: [
                                                                {
                                                                    text: "Bye.",
                                                                    isExit: true,
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

export default kerningMatchingCards;

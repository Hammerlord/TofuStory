import { CaseyImage } from "../../images";
import { alligatorTube, amethyst, cactus } from "../../item/items";
import CardGame from "../CardGame";
import { Scene } from "../types";

const caseyCharacter = {
    name: "Casey",
    image: CaseyImage,
};

const kerningMatchingCards: Scene = {
    characters: [],
    script: [
        {
            speaker: caseyCharacter,
            dialog: ["Hi there, Mushie!", "Wanna play a game?"],
        },
        {
            speaker: caseyCharacter,
            dialog: [
                "It's pretty simple. You match cards, and if you get more matches than me, you win.",
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
                                            puzzle: ({ player, onComplete }) => <CardGame onExit={onComplete} difficulty={"easy"} />,
                                            dialog: [],
                                        },
                                        {
                                            speaker: caseyCharacter,
                                            dialog: [
                                                "Good game, Mushie!",
                                                "As promised, I'll give you something from this batch of stuff. Take your pick.",
                                            ],
                                        },
                                        {
                                            dialog: [],
                                            itemChoices: {
                                                items: [alligatorTube, amethyst, cactus],
                                                numChoices: 3,
                                            },
                                        },
                                        {
                                            speaker: caseyCharacter,
                                            dialog: ["That was fun! See you next time."],
                                            responses: [
                                                {
                                                    text: "",
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
};

export default kerningMatchingCards;

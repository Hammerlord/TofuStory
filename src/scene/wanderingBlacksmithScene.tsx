import { BATTLE_TYPES } from "../battle/types";
import { cake, unagi } from "../enemy/miniBean";
import { wanderingBlacksmith } from "../enemy/wanderingBlacksmith";
import { halfEatenHotdog } from "../item/items";
import { EventScene, SceneEncounter, ScriptNode } from "./types";

const wanderingBlacksmithFight: SceneEncounter = {
    waves: [
        {
            enemies: [null, null, wanderingBlacksmith, null, null],
        },
    ],
    type: BATTLE_TYPES.ELITE_ENCOUNTER,
    backgroundMusic: "https://vgmsite.com/soundtracks/maplestory-music/wtklubxzfw/136.%20Mu%20Lung%20Dojo%202.mp3",
};

const fedPath: ScriptNode[] = [
    {
        speaker: wanderingBlacksmith,
        dialog: ["Mmmm! Omnomnom nom. Excuse my language."],
    },
    {
        speaker: wanderingBlacksmith,
        dialog: ["Very good, very very good. Ah, yes, that hits the spot."],
    },
    {
        speaker: wanderingBlacksmith,
        dialog: [
            "I am the Wandering Blacksmith. I travel across the island, offering my particular set of skills for the glory of the Maple gods.",
        ],
    },
    {
        speaker: wanderingBlacksmith,
        dialog: ["Have you need of my services?"],
        responses: [
            {
                text: "Nod.",
                upgradeCards: 3,
                next: [
                    {
                        dialog: ["[The smith's hammer rings out like the sound of bells.]"],
                    },
                    {
                        speaker: wanderingBlacksmith,
                        dialog: ["Very good. May my work serve you well!"],
                        responses: [
                            {
                                text: "Goodbye.",
                                isExit: true,
                            },
                        ],
                    },
                ],
            },
            {
                text: "Decline.",
                next: [
                    {
                        speaker: wanderingBlacksmith,
                        dialog: [
                            "Most of your kind I encounter are ravenous for power, as ravenous as I am for tofu! Either that, or they want to bring me to harm.",
                        ],
                    },
                    {
                        speaker: wanderingBlacksmith,
                        dialog: ["It is unusual to be turned down, but I shall not press, of course."],
                    },
                    {
                        speaker: wanderingBlacksmith,
                        dialog: ["Thank you for the food. Perhaps we will meet again."],
                        responses: [
                            {
                                text: "Goodbye.",
                                isExit: true,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

const noFedPath: ScriptNode[] = [
    {
        speaker: wanderingBlacksmith,
        dialog: ["No mind. But what is another day of fasting?"],
    },
    {
        speaker: wanderingBlacksmith,
        dialog: ["I am the Wandering Blacksmith. I travel across the island, exalting the maple gods by offering my skills to the people."],
    },
    {
        speaker: wanderingBlacksmith,
        dialog: ["Have you need of my services?"],
        responses: [
            {
                text: "Yes.",
                upgradeCards: 2,
                next: [
                    {
                        dialog: ["[The smith's hammer rings out like the sound of bells.]"],
                    },
                    {
                        speaker: wanderingBlacksmith,
                        dialog: ["Very good. May my work serve you well!"],
                        responses: [
                            {
                                text: "Goodbye.",
                                isExit: true,
                            },
                        ],
                    },
                ],
            },
            {
                text: "Mug the Wandering Blacksmith.",
                infamy: 5,
                encounter: wanderingBlacksmithFight,
            },
        ],
    },
];

export const wanderingSmithScene: EventScene = {
    id: "wandering-smith",
    script: [
        {
            speaker: wanderingBlacksmith,
            dialog: ["Goodness, I am famished. You wouldn't happen to have anything to eat, would you?"],
        },
        {
            speaker: wanderingBlacksmith,
            dialog: ["Goodness, I am famished. You wouldn't happen to have anything to eat, would you?"],
            conditionalNext: [
                {
                    conditions: [{ items: [halfEatenHotdog.name] }],
                    next: [
                        {
                            speaker: wanderingBlacksmith,
                            dialog: ["Goodness, I am famished. You wouldn't happen to have anything to eat, would you?"],
                            responses: [
                                {
                                    text: "Offer Half-Eaten Hotdog.",
                                    next: [
                                        {
                                            dialog: ["You hand over the Half-Eaten Hotdog."],
                                            loseItems: [halfEatenHotdog.name],
                                        },
                                        ...fedPath,
                                    ],
                                },
                                {
                                    text: "Don't offer anything.",
                                    next: noFedPath,
                                },
                            ],
                        },
                    ],
                },
                {
                    conditions: [{ items: [cake.name] }],
                    next: [
                        {
                            speaker: wanderingBlacksmith,
                            dialog: ["Goodness, I am famished. You wouldn't happen to have anything to eat, would you?"],
                            responses: [
                                {
                                    text: "Offer Cake",
                                    next: [
                                        {
                                            dialog: ["You hand over the Cake."],
                                            loseItems: [cake.name],
                                        },
                                        ...fedPath,
                                    ],
                                },
                                {
                                    text: "Don't offer anything.",
                                    next: noFedPath,
                                },
                            ],
                        },
                    ],
                },
                {
                    conditions: [{ items: [unagi.name] }],
                    next: [
                        {
                            speaker: wanderingBlacksmith,
                            dialog: ["Goodness, I am famished. You wouldn't happen to have anything to eat, would you?"],
                            responses: [
                                {
                                    text: "Offer Unagi",
                                    next: [
                                        {
                                            dialog: ["You hand over the Unagi."],
                                            loseItems: [unagi.name],
                                        },
                                        ...fedPath,
                                    ],
                                },
                                {
                                    text: "Don't offer anything.",
                                    next: noFedPath,
                                },
                            ],
                        },
                    ],
                },
                {
                    conditions: [],
                    next: [
                        {
                            speaker: wanderingBlacksmith,
                            dialog: ["Goodness, I am famished. You wouldn't happen to have anything to eat, would you?"],
                            responses: [
                                {
                                    text: "You have nothing...",
                                    next: noFedPath,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

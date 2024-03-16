import { STRANGE_ENCOUNTER_MUSIC } from "../battle/constants";
import { mesoThief } from "../enemy/enemy";
import { EventScene, SCENE_CONDITION_TYPES } from "./types";

export const mesoThiefScene: EventScene = {
    id: "wanted-poster",
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.INFAMY,
            comparator: "gt",
            value: 3,
        },
    ],
    script: [
        {
            speaker: mesoThief,
            dialog: ["Gimme all your mesos!"],
            responses: [
                {
                    text: "Defend yourself.",
                    encounter: {
                        waves: [{ enemies: [null, null, mesoThief, null, null] }],
                        backgroundMusic: STRANGE_ENCOUNTER_MUSIC,
                    },
                },
            ],
        },
    ],
};

export const introScene: EventScene = {
    id: "game-intro",
    script: [
        {
            disableBackground: true,
            disableTransition: true,
            dialog: [
                "[As you gain your bearings, you notice a seaside town nearby. Something about blue roofs and white stones seems familiar, though you can't place what exactly.",
                "Well, civilization is a welcome sight, isn't it?",
                "Let's start there.]",
            ],
        },
    ],
};

export const startJourneyScene: EventScene = {
    id: "start-journey",
    script: [
        {
            disableBackground: true,
            disableTransition: true,
            dialog: ["[The townsfolk were wary of your presence. It'll be hard to approach people as a monster.]"],
        },
        {
            disableBackground: true,
            disableTransition: true,
            dialog: ["[Can this really be your fate?", "Somewhere on this island, there has to be answers. Journey to find them.]"],
        },
    ],
};

export const gamblingBoxScene: EventScene = {
    id: "gambling-box",
    script: [
        {
            dialog: ["Win a prize! Anyone can play... as long as you have at least 100 mesos!"],
        },
        {
            dialog: ["Win a prize! Anyone can play, as long as you have at least 100 mesos!"],
            conditionalNext: [
                {
                    conditions: [
                        {
                            mesos: 99,
                            comparator: "gt",
                        },
                    ],
                    next: [
                        {
                            dialog: ["Play the game?"],
                            responses: [
                                {
                                    text: "Play. [Exchange 100 mesos for a random item]",
                                    next: [
                                        {
                                            dialog: ["You got..."],
                                            loseMesos: 100,
                                            items: {
                                                amount: 1,
                                            },
                                        },
                                        {
                                            dialog: ["And that's it! That's the whole game, folks."],
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
                                    text: "No thanks.",
                                    isExit: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

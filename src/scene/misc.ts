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
                "[You don't know what happened to yourself, but there is a portside town nearby. Something about the town's blue rooftops and the white stones seems familiar, or does it?",
                "Either way, maybe you can find help there.]",
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
            dialog: [
                "[The townsfolk were wary of you, seeing as you are a mushroom. It'll be hard to convince people that you aren't a monster.]",
            ],
        },
        {
            disableBackground: true,
            disableTransition: true,
            dialog: ["[This can't be your fate, can it?", "Somewhere on this island, there must be answers. Journey to find them.]"],
        },
    ],
};

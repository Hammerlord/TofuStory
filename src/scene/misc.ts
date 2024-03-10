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
                "[As you gain your bearings, you notice a nearby portside town. Something about blue roofs and white stones seems familiar, though you don't know what exactly.",
                "Well, civilization is a welcome sight, isn't it?",
                "Maybe you can start there.]",
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
            dialog: [
                "[Can this really be your fate?",
                "Somewhere on this island, there must be answers. You'll have to journey to find them, whatever adversity you must face.]",
            ],
        },
    ],
};

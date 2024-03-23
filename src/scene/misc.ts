import { STRANGE_ENCOUNTER_MUSIC } from "../battle/constants";
import { duoThiefA, duoThiefB, mesoThief } from "../enemy/mesoThieves";
import { EventScene, SCENE_CONDITION_TYPES } from "./types";

export const mesoThiefScene: EventScene = {
    id: "meso-thief",
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

export const mesoThievesScene: EventScene = {
    id: "duo-meso-thieves",
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.VISITED_SCENES,
            comparator: "includes",
            value: mesoThiefScene.id,
        },
    ],
    script: [
        {
            speaker: duoThiefA,
            dialog: ["There! It's that mushroom that beat up ImaTheif!"],
        },
        {
            speaker: duoThiefB,
            dialog: ["You'll pay for what you did to our sister!"],
            responses: [
                {
                    text: "Defend yourself.",
                    encounter: {
                        waves: [{ enemies: [null, duoThiefA, null, duoThiefB, null] }],
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

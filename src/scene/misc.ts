import { MARCH_MUSIC, STRANGE_ENCOUNTER_MUSIC } from "../battle/constants";
import { administrator } from "../enemy/administrator";
import { duoThiefA, duoThiefB, mesoThief } from "../enemy/mesoThieves";
import { EventScene, SCENE_CONDITION_TYPES } from "./types";

const MESO_THIEF_KEYS = {
    scene: "meso-thief",
    beaten: "meso-thief-beaten",
    escaped: "meso-thief-escaped",
    duoScene: "duo-meso-thieves",
};

export const mesoThiefScene: EventScene = {
    id: MESO_THIEF_KEYS.scene,
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
                    infamy: 1,
                    encounter: {
                        waves: [{ enemies: [null, null, mesoThief, null, null] }],
                        backgroundMusic: STRANGE_ENCOUNTER_MUSIC,
                    },
                    next: [
                        { dialog: ["..."] }, // Hack: Need an intermediary node due to how conditionalNext works with battle logging
                        {
                            dialog: ["..."],
                            conditionalNext: [
                                {
                                    conditions: [
                                        {
                                            battle: {
                                                totalKills: 0,
                                            },
                                            comparator: "gt",
                                        },
                                    ],
                                    next: [
                                        {
                                            id: MESO_THIEF_KEYS.beaten,
                                            speaker: mesoThief,
                                            dialog: ["OMG hax, REPORTED!!!"],
                                            infamy: 1,
                                        },
                                    ],
                                },
                                {
                                    conditions: [],
                                    next: [
                                        {
                                            id: MESO_THIEF_KEYS.escaped,
                                            dialog: ["[The thief escaped with some of your mesos.]"],
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

export const mesoThievesScene: EventScene = {
    id: MESO_THIEF_KEYS.duoScene,
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.VISITED_SCENES,
            comparator: "includes",
            value: MESO_THIEF_KEYS.beaten,
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
                    infamy: 1,
                    encounter: {
                        waves: [{ enemies: [null, duoThiefA, null, duoThiefB, null] }],
                        backgroundMusic: STRANGE_ENCOUNTER_MUSIC,
                    },
                },
            ],
        },
    ],
};

export const adminScene: EventScene = {
    id: "admin-scene",
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.INFAMY,
            comparator: "gt",
            value: 15,
        },
    ],
    script: [
        {
            speaker: administrator,
            dialog: ["You have been blocked by Police GM for the HACK reason."],
            responses: [
                {
                    text: "OK.",
                    encounter: {
                        waves: [{ enemies: [null, null, administrator, null, null] }],
                        backgroundMusic: MARCH_MUSIC,
                    },
                },
            ],
        },
    ],
};

export const introScene: EventScene = {
    id: "game-intro",
    disableTransition: true,
    script: [
        {
            disableBackground: true,
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
    disableTransition: true,
    script: [
        {
            disableBackground: true,
            dialog: ["[The townsfolk were wary of your presence. It'll be hard to approach people as a monster.]"],
        },
        {
            disableBackground: true,
            dialog: ["[Can this really be your fate?", "Somewhere on this island, there has to be answers. Journey to find them.]"],
        },
    ],
};

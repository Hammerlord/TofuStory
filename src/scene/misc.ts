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
    repeatable: true,
    script: [
        {
            speaker: mesoThief,
            dialog: ["Gimme all your mesos!"],
            responses: [
                {
                    text: "Defend yourself.",
                    encounter: {
                        waves: [{ enemies: [null, null, mesoThief, null, null] }],
                        backgroundMusic: "https://dl.vgmdownloads.com/soundtracks/maplestory-music/ycfxgoahya/47.%20Plot%20of%20Pixie.mp3",
                    },
                },
            ],
        },
    ],
};

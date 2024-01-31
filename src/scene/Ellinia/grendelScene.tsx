import { CLASS_LEADER_MUSIC } from "../../battle/constants";
import { BATTLE_TYPES } from "../../battle/types";
import { grendel, introGrendel } from "../../enemy/grendel";
import { Scene } from "../types";

const grendelFight = {
    characters: [],
    waves: [
        {
            enemies: [null, null, introGrendel, null, null],
        },
        {
            enemies: [null, null, grendel, null, null],
        },
    ],
    type: BATTLE_TYPES.BOSS,
    backgroundMusic: CLASS_LEADER_MUSIC,
};

export const grendelScene: Scene = {
    characters: [],
    script: [
        {
            speaker: grendel,
            dialog: ["[WIP - encounter for Grendel.]"],
            responses: [
                {
                    text: "Fight.",
                    encounter: grendelFight,
                },
            ],
        },
    ],
};

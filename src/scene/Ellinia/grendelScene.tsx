import { CLASS_LEADER_MUSIC } from "../../battle/constants";
import { BATTLE_TYPES } from "../../battle/types";
import { grendel, introGrendel } from "../../enemy/grendel";
import { shuffle } from "../../utils";
import { EventScene } from "../types";

const grendelFight = {
    waves: [
        {
            enemies: [null, null, introGrendel, null, null],
        },
        {
            enemies: [null, null, { ...grendel, abilities: shuffle(grendel.abilities) }, null, null],
        },
    ],
    type: BATTLE_TYPES.BOSS,
    backgroundMusic: CLASS_LEADER_MUSIC,
};

export const grendelScene: EventScene = {
    id: "magician-class-leader-scene",
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

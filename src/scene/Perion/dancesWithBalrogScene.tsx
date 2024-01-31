import { CLASS_LEADER_MUSIC } from "../../battle/constants";
import { BATTLE_TYPES } from "../../battle/types";
import { dancesWithBalrog } from "../../enemy/dancesWithBalrog";
import { DancesWithBalrogImage } from "../../images";
import { Scene } from "../types";

const dancesWithBalrogCharacter = {
    name: "Dances With Balrog",
    image: DancesWithBalrogImage,
};

const dancesWithBalrogFight = {
    characters: [],
    waves: [
        {
            enemies: [null, null, dancesWithBalrog, null, null],
        },
    ],
    type: BATTLE_TYPES.BOSS,
    backgroundMusic: CLASS_LEADER_MUSIC,
};

export const dancesWithBalrogScene: Scene = {
    characters: [],
    script: [
        {
            speaker: dancesWithBalrogCharacter,
            dialog: ["[WIP - encounter for Dances with Balrog.]"],
            responses: [
                {
                    text: "Fight.",
                    encounter: dancesWithBalrogFight,
                },
            ],
        },
    ],
};

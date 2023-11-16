import { BATTLE_TYPES } from "../../battle/types";
import { athena, guardHawk, guardWolf } from "../../enemy/athenaPierce";
import { AthenaAttackStanceImage } from "../../images";
import { Scene } from "../types";

const athenaPierceCharacter = {
    name: "Athena Pierce",
    image: AthenaAttackStanceImage,
};

const athenaPierceFight = {
    characters: [],
    waves: [
        {
            enemies: [null, guardWolf, athena, guardHawk, null],
        },
    ],
    type: BATTLE_TYPES.BOSS,
};

export const athenaPierceScene: Scene = {
    characters: [],
    script: [
        {
            speaker: athenaPierceCharacter,
            dialog: ["[WIP - encounter for Athena Pierce.]"],
            responses: [
                {
                    text: "Fight.",
                    encounter: athenaPierceFight,
                },
            ],
        },
    ],
};

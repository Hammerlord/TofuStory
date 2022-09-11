/** Generic minions */
import { snailImage } from "../images";
import { Ability } from "./types";

export const snailMinion: Ability = {
    name: "Snail",
    resourceCost: 1,
    minion: {
        name: "Snail",
        image: snailImage,
        maxHP: 5,
        damage: 1,
    },
    actions: [],
};

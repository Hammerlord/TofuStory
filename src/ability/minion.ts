/** Generic minions */
import { attack } from "../enemy/abilities";
import { SnailImage } from "../images";
import { Ability } from "./types";

export const snailMinion: Ability = {
    name: "Snail",
    resourceCost: 1,
    minion: {
        name: "Snail",
        image: SnailImage,
        maxHP: 5,
        abilities: [attack],
    },
    actions: [],
};

import { ACTION_TYPES, ANIMATION_TYPES, Ability, TARGET_TYPES } from "../ability/types";
import { StarfallMagicSquareImage } from "../images";

// Dev testing purposes only
export const deathLaser: Ability = {
    name: "Death Laser",
    image: StarfallMagicSquareImage,
    resourceCost: 0,
    actions: [
        {
            damage: 1000,
            area: 2,
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: StarfallMagicSquareImage,
            animation: ANIMATION_TYPES.BEAM,
        },
    ],
};

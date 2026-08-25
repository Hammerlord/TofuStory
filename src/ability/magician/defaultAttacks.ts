import { EnergyBoltProjectileImage, OldEnergyBoltImage } from "../../images";
import { RARITIES } from "../../item/types";
import { ACTION_TYPES, ANIMATION_TYPES, Ability, TARGET_TYPES } from "../types";

export const lesserBolt: Ability = {
    name: "Lesser Bolt",
    image: OldEnergyBoltImage,
    resourceCost: 0,
    rarity: RARITIES.COMMON,
    actions: [
        {
            damage: 1,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: EnergyBoltProjectileImage,
            animationOptions: {
                rotate: -45,
                rotateToFaceTarget: true,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

export const magicianDefaultAttack: Ability = {
    name: "Bolt",
    image: OldEnergyBoltImage,
    resourceCost: 0,
    actions: [
        {
            damage: 3,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.RANGE_ATTACK,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: EnergyBoltProjectileImage,
            animationOptions: {
                rotate: -45,
                rotateToFaceTarget: true,
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 2,
                },
            ],
        },
    ],
};

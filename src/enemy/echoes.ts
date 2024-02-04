import { stealth } from "./../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { ArrowImage, AvengersArrowImage, EncroachingDarknessImage, FairyImage, HuntersBowImage, RoyalFairyImage } from "../images";
import { ShieldIcon } from "../images/icons";

export const lostEcho: Minion = {
    name: "Lost Echo",
    image: FairyImage,
    imageOptions: {
        filter: "brightness(0.25) saturate(0.25) drop-shadow(0 0 5px rgba(0, 0, 0, 0.25))",
    },
    maxHP: 75,
    damage: 1,
    attack: {
        name: "Lost Fae Bolt",
        image: EncroachingDarknessImage,
        actions: [
            {
                type: ACTION_TYPES.RANGE_ATTACK,
                target: TARGET_TYPES.HOSTILE,
                icon: EncroachingDarknessImage,
                animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                animationOptions: {
                    width: 100,
                    height: 100,
                },
                damage: 1,
            },
        ],
    },
};

export const lostGuardEcho: Minion = {
    ...lostEcho,
    damage: 0,
    abilities: [
        {
            resourceCost: 3,
            name: "Echo of Protection",
            image: ShieldIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    area: 1,
                    armor: 10,
                    excludePrimaryTarget: true,
                },
            ],
        },
    ],
    effects: [
        {
            ...stealth,
        },
    ],
};

export const lostNobleEcho: Minion = {
    ...lostEcho,
    name: "Lost Echo",
    image: RoyalFairyImage,
    imageOptions: {
        filter: "brightness(0.3) saturate(0.4) drop-shadow(0 0 5px rgba(0, 0, 0, 0.25))",
    },
    maxHP: 100,
    damage: 3,
    weapon: HuntersBowImage,
    weaponImageOptions: {
        top: "58%",
        left: "30%",
        transform: `scale(2, 2) rotate(270deg)`,
    },
    attack: {
        name: "Lost Arrow",
        image: ArrowImage,
        actions: [
            {
                type: ACTION_TYPES.RANGE_ATTACK,
                target: TARGET_TYPES.HOSTILE,
                icon: AvengersArrowImage,
                damage: 2,
                animationOptions: {
                    rotate: -45,
                },
            },
        ],
    },
};

import { ACTION_TYPES, ANIMATION_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { AvengersArrowImage, EncroachingDarknessImage, FairyImage, HuntersBowImage, RoyalFairyImage, WeaponMasteryImage } from "../images";
import { ShieldIcon } from "../images/icons";
import { attackPower, stealth } from "./../ability/Effects";

export const lostEcho: Minion = {
    name: "Lost Echo",
    image: FairyImage,
    imageOptions: {
        filter: "brightness(0.25) saturate(0.25) drop-shadow(0 0 5px rgba(0, 0, 0, 0.25))",
    },
    maxHP: 50,
    mesos: 10,
    abilities: [
        {
            name: "Lost Fae Bolt",
            image: EncroachingDarknessImage,
            resourceCost: 0,
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
                    damage: 2,
                },
            ],
        },
    ],
};

export const lostGuardEcho: Minion = {
    ...lostEcho,
    abilities: [
        {
            name: "Echo of Rallying",
            image: WeaponMasteryImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    area: 1,
                    excludePrimaryTarget: true,
                    effects: [attackPower],
                },
            ],
        },
        {
            name: "Echo of Rallying",
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
    mesos: 15,
    image: RoyalFairyImage,
    imageOptions: {
        filter: "brightness(0.3) saturate(0.4) drop-shadow(0 0 5px rgba(0, 0, 0, 0.25))",
    },
    maxHP: 75,
    weapon: HuntersBowImage,
    weaponImageOptions: {
        top: "58%",
        left: "30%",
        transform: `scale(2, 2) rotate(270deg)`,
    },
    abilities: [
        {
            name: "Lost Arrow",
            image: AvengersArrowImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: AvengersArrowImage,
                    damage: 4,
                    animationOptions: {
                        rotate: -45,
                    },
                },
            ],
        },
    ],
};

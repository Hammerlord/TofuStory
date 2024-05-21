import { attackPower } from "./../ability/Effects";
import {
    AvengersArrowImage,
    BlueMushroomJumpImage,
    BlueMushroomJumpRightImage,
    HasteImage,
    IronHogHoofImage,
    MushroomOmokImage,
} from "../images";
import { CrossedSwordsIcon, DizzyIcon, JapaneseOgreIcon, ShieldIcon, ZzzIcon } from "../images/icons";
import { Ability, ACTION_TYPES, ANIMATION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES } from "./../ability/types";
import { dazedCurse } from "./curseCards";

export const attack: Ability = {
    name: "Attack",
    image: CrossedSwordsIcon,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 1,
        },
    ],
};

export const shoot: Ability = {
    name: "Shoot",
    image: AvengersArrowImage,
    resourceCost: 0,
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            animation: ANIMATION_TYPES.ONE_WAY,
            icon: AvengersArrowImage,
            damage: 2,
            animationOptions: {
                rotateToFaceTarget: true,
                rotate: -45,
            },
        },
    ],
};

export const loaf: Ability = {
    name: "Loaf",
    image: ZzzIcon,
    actions: [
        {
            type: ACTION_TYPES.NONE,
            target: TARGET_TYPES.SELF,
            animation: ANIMATION_TYPES.SNOOZE,
        },
    ],
};

export const rally: Ability = {
    name: "Rally",
    resourceCost: 3,
    image: ShieldIcon,
    actions: [
        {
            area: 2,
            target: TARGET_TYPES.FRIENDLY,
            armor: 10,
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const tantrum: Ability = {
    name: "Tantrum",
    description: "Randomly hits a target 2 times.",
    image: JapaneseOgreIcon,
    resourceCost: 3,
    channelDuration: 1,
    castTime: 1,
    actions: [
        {
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
        {
            target: TARGET_TYPES.RANDOM_HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
};

export const enemyStomp: Ability = {
    name: "Stomp",
    image: IronHogHoofImage,
    actions: [
        {
            damage: 2,
            area: 1,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
};

export const enemyHaste: Ability = {
    name: "Haste",
    resourceCost: 0,
    image: HasteImage,
    actions: [
        {
            area: 1,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            animation: ANIMATION_TYPES.ACTION_EXPLODE,
            icon: HasteImage,
            effects: [
                {
                    name: "Haste",
                    description: "Gaining +1 energy per turn",
                    resourcesPerTurn: 1,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 3,
                    icon: HasteImage,
                },
            ],
        },
    ],
};

export const whomp: Ability = {
    name: "Whomp",
    image: MushroomOmokImage,
    resourceCost: 3,
    castTime: 1,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 6,
            area: 1,
            secondaryDamage: 3,
            addCardsToDiscard: [dazedCurse],
        },
    ],
};

export const doWave: Ability = {
    name: "Do the Wave!",
    resourceCost: 3,
    image: BlueMushroomJumpImage,
    actions: [
        {
            induceCombatant: {
                mode: "left-to-right",
                action: {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.STOMP,
                    animationOptions: {
                        disableScreenShake: true,
                    },
                    effects: [
                        {
                            ...attackPower,
                            duration: 3,
                        },
                    ],
                },
            },
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            area: 5,
        },
    ],
};

export const doOtherWave: Ability = {
    name: "Do the Other Wave!",
    resourceCost: 3,
    image: BlueMushroomJumpRightImage,
    actions: [
        {
            induceCombatant: {
                mode: "right-to-left",
                action: {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    animation: ANIMATION_TYPES.STOMP,
                    animationOptions: {
                        disableScreenShake: true,
                    },
                    armor: 7,
                },
            },
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            area: 5,
        },
    ],
};

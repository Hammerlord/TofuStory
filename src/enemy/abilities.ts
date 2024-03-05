import { HasteImage, IronHogHoofImage } from "../images";
import { CrossedSwordsIcon, JapaneseOgreIcon, ShieldIcon, ZzzIcon } from "../images/icons";
import { Ability, ACTION_TYPES, ANIMATION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES } from "./../ability/types";

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

export const loaf: Ability = {
    name: "Loaf",
    image: ZzzIcon,
    actions: [
        {
            type: ACTION_TYPES.NONE,
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
    image: JapaneseOgreIcon,
    description: "{{ caster }} will tantrum, dealing 3 hits per move.",
    resourceCost: 3,
    channelDuration: 1,
    castTime: 1,
    actions: [
        {
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
        {
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
};

export const stomp: Ability = {
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

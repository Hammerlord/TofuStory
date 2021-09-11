import { hasteImage } from "../images";
import { Ability, ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES } from "./../ability/types";
export const loaf: Ability = {
    name: "Loaf",
    actions: [
        {
            description: "{{caster}} is loafing around.",
            type: ACTION_TYPES.NONE,
        },
    ],
};

export const move: Ability = {
    name: "Move",
    actions: [
        {
            movement: 1,
            description: "{{caster}} has moved.",
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.MOVEMENT,
        },
    ],
};

export const rally: Ability = {
    name: "Rally",
    resourceCost: 3,
    actions: [
        {
            area: 1,
            target: TARGET_TYPES.FRIENDLY,
            armor: 2,
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const tantrum: Ability = {
    name: "Tantrum",
    description: "{{ caster }} will tantrum, dealing 2 hits per move.",
    resourceCost: 4,
    channelDuration: 3,
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

export const shiningLaser: Ability = {
    name: "Shining Laser",
    description: "{{ caster }} is shining mightily!!!",
    resourceCost: 4,
    castTime: 1,
    actions: [
        {
            damage: 10,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
};

export const megaHeal: Ability = {
    name: "Mega Heal!!!",
    description: "{{ caster }} is about to unleash a Mega Heal!!",
    resourceCost: 3,
    castTime: 1,
    actions: [
        {
            healing: 10,
            target: TARGET_TYPES.FRIENDLY,
            type: ACTION_TYPES.EFFECT,
        },
    ],
};

export const stomp: Ability = {
    name: "Stomp",
    resourceCost: 1,
    actions: [
        {
            damage: 2,
            area: 1,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
        },
    ],
};

export const whip: Ability = {
    name: "Whip",
    resourceCost: 3,
    actions: [
        {
            damage: 1,
            target: TARGET_TYPES.FRIENDLY,
            type: ACTION_TYPES.EFFECT,
            area: 3,
            effects: [
                {
                    damage: 1,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 4,
                },
            ],
        },
    ],
};

export const enemyHaste: Ability = {
    name: "Haste",
    resourceCost: 1,
    image: hasteImage,
    actions: [
        {
            area: 1,
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            effects: [
                {
                    name: "Haste",
                    description: "Gaining +1 energy per turn",
                    resourcesPerTurn: 1,
                    type: EFFECT_TYPES.NONE,
                    class: EFFECT_CLASSES.BUFF,
                    duration: 3,
                    icon: hasteImage,
                },
            ],
        },
    ],
};

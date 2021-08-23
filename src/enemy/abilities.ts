import { smalltofu, realtofu, thefaketofu, theRegalTofu } from './tofu';
import { TARGET_TYPES, Ability, EFFECT_TYPES } from './../ability/types';
export const loaf: Ability = {
    name: "Loaf",
    actions: [
        {
            description: "{{caster}} is loafing around.",
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
        },
    ],
};

export const rally: Ability = {
    name: "Rally",
    actions: [
        {
            area: 1,
            target: TARGET_TYPES.SELF,
            armor: 2,
        },
    ],
};

export const tantrum: Ability = {
    name: "Tantrum",
    description: "{{ caster }} will tantrum for increased damage.",
    resourceCost: 5,
    channelDuration: 3,
    castTime: 1,
    actions: [
        {
            damage: 5,
            target: TARGET_TYPES.HOSTILE,
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
            area: 3,
            effects: [
                {
                    damage: 1,
                    type: EFFECT_TYPES.BUFF,
                    duration: 4,
                },
            ],
        },
    ],
};

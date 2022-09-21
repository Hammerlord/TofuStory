import { slashBlast, block } from "./../ability/warrior/warriorAbilities";
import { stealth, elite, burn, thorns, hardy, raging } from "./../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "./../ability/types";
import { enemyHaste, loaf } from "./abilities";
import { Ability, Effect } from "../ability/types";
import {
    bluesnailImage,
    leetSin,
    noobClubAImage,
    noobClubBImage,
    orangeMushroomImage,
    redsnailImage,
    shroomImage,
    snailImage,
    subi,
    olafImage,
    octopusImage,
    wildboarImage,
    stumpImage,
    fireboarImage,
    axestumpImage,
    ligatorImage,
    greenmushroomImage,
    hornymushroomImage,
    kingslimeImage,
    noobWarriorAImage,
    noobWarriorBImage,
    manoImage,
    blueSnailShellImage,
    redSnailShellImage,
    snailShellImage,
    mutantSnailImage,
    weaponmasteryImage,
} from "../images";

export interface Enemy {
    name: string;
    image: string;
    maxHP: number;
    HP?: number;
    armor?: number;
    abilities?: Ability[];
    damage: number;
    effects?: Effect[];
    resources?: number;
    /** Enemy basic attack. If not provided, one will be generated for the enemy. */
    attack?: Ability;
}

export const snail: Enemy = {
    name: "Snail",
    maxHP: 14,
    abilities: [loaf],
    image: snailImage,
    damage: 2,
};

export const blueSnail: Enemy = {
    name: "Blue Snail",
    maxHP: 25,
    image: bluesnailImage,
    damage: 3,
    abilities: [
        {
            name: "Block",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 5,
                },
            ],
        },
    ],
};

export const shroom: Enemy = {
    name: "Shroom",
    maxHP: 20,
    image: shroomImage,
    damage: 3,
};

export const redSnail: Enemy = {
    name: "Red Snail",
    maxHP: 35,
    image: redsnailImage,
    damage: 3,
    abilities: [
        {
            name: "Block",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 5,
                },
            ],
        },
    ],
};

export const orangeMushroom: Enemy = {
    name: "Orange Mushroom",
    maxHP: 40,
    image: orangeMushroomImage,
    damage: 5,
    effects: [hardy],
};

export const noobA: Enemy = {
    name: "Beginner A",
    maxHP: 30,
    image: noobClubAImage,
    damage: 3,
    abilities: [
        {
            name: "Club!",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Block",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 2,
                },
            ],
        },
    ],
};

export const noobB: Enemy = {
    name: "Beginner B",
    maxHP: 30,
    image: noobClubBImage,
    damage: 3,
    abilities: [
        {
            name: "Flurry",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
            ],
        },
        {
            name: "Potion",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    healing: 5,
                },
            ],
        },
    ],
};

export const noobAWarrior = {
    name: "Beginner A",
    maxHP: 40,
    image: noobWarriorAImage,
    damage: 3,
    abilities: [
        {
            ...slashBlast,
            resourceCost: 0,
        },
        {
            ...block,
            resourceCost: 0,
        },
    ],
};

export const noobBWarrior = {
    name: "Beginner B",
    maxHP: 40,
    image: noobWarriorBImage,
    damage: 3,
    abilities: [
        {
            ...slashBlast,
            resourceCost: 0,
        },
        {
            ...block,
            resourceCost: 0,
        },
    ],
};

export const thiefAssassin: Enemy = {
    name: "XxLeetSinxX",
    maxHP: 40,
    image: leetSin,
    damage: 2,
    attack: {
        name: "Attack",
        actions: [
            {
                type: ACTION_TYPES.RANGE_ATTACK,
                target: TARGET_TYPES.HOSTILE,
                animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                damage: 2,
                icon: subi,
            },
        ],
    },
    abilities: [
        {
            name: "Dark Sight",
            resourceCost: 2,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [
                        {
                            ...stealth,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
        {
            name: "Lucky Seven",
            resourceCost: 2,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    damage: 0,
                    icon: subi,
                },
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN,
                    damage: 0,
                    icon: subi,
                },
            ],
        },
        enemyHaste,
        {
            name: "Potion",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    healing: 5,
                },
            ],
        },
    ],
};

export const olaf = {
    name: "Olaf",
    maxHP: 35,
    effects: [elite],
    abilities: [
        {
            name: "Double Punch",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 0,
                },
            ],
        },
    ],
    damage: 2,
    image: olafImage,
};

export const octopus: Enemy = {
    name: "Octopus",
    image: octopusImage,
    maxHP: 7,
    damage: 1,
};

export const wildBoar: Enemy = {
    name: "Wild Boar",
    image: wildboarImage,
    maxHP: 12,
    damage: 2,
    abilities: [
        {
            name: "Wild Charge",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 2,
                },
            ],
        },
    ],
};

export const stump: Enemy = {
    name: "Stump",
    image: stumpImage,
    maxHP: 10,
    armor: 5,
    damage: 1,
    effects: [hardy],
};

export const axeStump: Enemy = {
    name: "Axe Stump",
    image: axestumpImage,
    maxHP: 17,
    armor: 10,
    damage: 2,
    abilities: [
        {
            name: "Barbs",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 3,
                    effects: [
                        {
                            ...thorns,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
    effects: [hardy],
};

export const fireBoar: Enemy = {
    name: "Fire Boar",
    image: fireboarImage,
    maxHP: 35,
    damage: 3,
    abilities: [
        {
            name: "Blazing Charge",
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                    effects: [{ ...burn, duration: 1 }],
                },
            ],
        },
    ],
    effects: [hardy],
};

export const ligator: Enemy = {
    name: "Ligator",
    image: ligatorImage,
    maxHP: 20,
    damage: 2,
};

export const eliteLigator: Enemy = {
    name: "Ligator",
    image: ligatorImage,
    maxHP: 35,
    damage: 2,
    effects: [elite, raging],
};

export const greenMushroom: Enemy = {
    name: "Green Mushroom",
    image: greenmushroomImage,
    maxHP: 25,
    damage: 1,
};

export const hornyMushroom: Enemy = {
    name: "Horny Mushroom",
    image: hornymushroomImage,
    maxHP: 30,
    damage: 2,
    effects: [thorns],
};

export const kingSlimeEnemy: Enemy = {
    name: "King Slime",
    image: kingslimeImage,
    maxHP: 100,
    damage: 2,
    effects: [elite],
    abilities: [
        {
            name: "Earthquake",
            actions: [
                {
                    resources: 3,
                    type: ACTION_TYPES.ATTACK,
                    damage: 4,
                    area: 2,
                },
            ],
        },
    ],
};

export const mutantSnailEnemy: Enemy = {
    name: "Mutant Snail",
    image: mutantSnailImage,
    maxHP: 150,
    armor: 50,
    resources: 0,
    damage: 5,
    effects: [
        {
            ...hardy,
            name: "Tyrant Shell",
            icon: snailShellImage,
            description: "After being stunned or frozen, gains temporary immunity to those effects. \n Periodically summoning Snails.",
            canBeSilenced: false,
        },
    ],
    abilities: [
        {
            name: "Call Snail",
            image: snailImage,
            minion: {
                ...snail,
                damage: 1,
                maxHP: 11,
            },
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                },
            ],
        },
        {
            name: "Call Snail",
            image: bluesnailImage,
            minion: {
                ...blueSnail,
                damage: 2,
                maxHP: 15,
            },
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                },
            ],
        },
        {
            name: "Whip",
            resourceCost: 1,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    area: 2,
                    excludePrimaryTarget: true,
                    damage: 3,
                    effects: [
                        {
                            name: "Whipped",
                            description: "Whipped into a frenzy!",
                            icon: weaponmasteryImage,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.BUFF,
                            damage: 1,
                        },
                    ],
                },
            ],
        },
        {
            name: "Frenzied Tantrum",
            description: "{{ caster }} will tantrum, dealing 3 hits per move.",
            resourceCost: 3,
            channelDuration: 3,
            castTime: 1,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    effects: [
                        {
                            name: "Frenzy",
                            description: "Entering a frenzy!",
                            icon: weaponmasteryImage,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.BUFF,
                            damage: 1,
                            duration: 2,
                        },
                    ],
                },
                {
                    damage: 2,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
                {
                    damage: 2,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
                {
                    damage: 2,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
            ],
        },
    ],
};

export const manoEnemy: Enemy = {
    name: "Mano",
    image: manoImage,
    maxHP: 100,
    armor: 100,
    resources: 0,
    damage: 3,
    abilities: [
        {
            name: "Call Snail",
            image: snailImage,
            minion: {
                ...snail,
                damage: 1,
                maxHP: 11,
            },
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                },
            ],
        },
        {
            name: "Call Snail",
            image: bluesnailImage,
            minion: {
                ...blueSnail,
                damage: 2,
                maxHP: 15,
            },
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                },
            ],
        },
        {
            name: "Withdraw",
            channelDuration: 3,
            resourceCost: 3,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    armor: 10,
                    effects: [
                        {
                            ...thorns,
                            duration: 1,
                        },
                    ],
                },
            ],
        },
        {
            name: "Rollout",
            castTime: 1,
            channelDuration: 3,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 8,
                },
            ],
        },
    ],
    effects: [
        {
            ...hardy,
            name: "Senior Shell",
            icon: snailShellImage,
            description: "After being stunned or frozen, gains temporary immunity to those effects. \n Periodically summoning Snails.",
            canBeSilenced: false,
        },
        {
            name: "Tough Shell",
            icon: blueSnailShellImage,
            preventArmorDecay: true,
            canBeSilenced: true,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            description: "Prevents armor decay.",
            duration: 10,
        },
        {
            name: "Weighted Shell",
            icon: redSnailShellImage,
            canBeSilenced: false,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            description: "While this character has armor, its damage is increased.",
            damage: 1,
            skillBonus: [
                {
                    skill: "Rollout",
                    damage: 4,
                },
            ],
            conditions: [
                {
                    comparator: "gt",
                    armor: 0,
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                },
            ],
        },
    ],
};

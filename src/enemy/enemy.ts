import {
    axestumpImage,
    bluesnailImage,
    blueSnailShellImage,
    fireboarImage,
    greenmushroomImage,
    hornymushroomImage,
    leetSin,
    ligatorImage,
    manoImage,
    MushroomSporeImage,
    mutantSnailImage,
    noobClubAImage,
    noobClubBImage,
    noobWarriorAImage,
    noobWarriorBImage,
    octopusImage,
    olafImage,
    orangeMushroomImage,
    redsnailImage,
    redSnailShellImage,
    shroomImage,
    snailImage,
    snailShellImage,
    stumpImage,
    subi,
    weaponmasteryImage,
    wildboarImage,
} from "../images";
import { burn, elite, hardy, poison, raging, stealth, thorns } from "./../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { block, slashBlast } from "./../ability/warrior/warriorAbilities";
import { enemyHaste, loaf } from "./abilities";

export const snail: Minion = {
    name: "Snail",
    maxHP: 11,
    abilities: [loaf],
    image: snailImage,
    damage: 1,
};

export const blueSnail: Minion = {
    name: "Blue Snail",
    maxHP: 7,
    armor: 15,
    image: bluesnailImage,
    damage: 2,
    effects: [
        {
            name: "Tough Shell",
            icon: blueSnailShellImage,
            preventArmorDecay: true,
            canBeSilenced: true,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            description: "Prevents armor decay.",
            duration: 5,
        },
    ],
};

export const shroom: Minion = {
    name: "Shroom",
    maxHP: 15,
    image: shroomImage,
    damage: 3,
    abilities: [
        {
            name: "Poison Spore",
            image: MushroomSporeImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: MushroomSporeImage,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    damage: 1,
                    effects: [
                        {
                            ...poison,
                            duration: 2,
                        },
                    ],
                },
            ],
        },
    ],
};

export const redSnail: Minion = {
    name: "Red Snail",
    maxHP: 14,
    armor: 25,
    image: redsnailImage,
    damage: 2,
    abilities: [
        {
            name: "Rollout",
            castTime: 1,
            channelDuration: 2,
            resourceCost: 3,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                    animation: ANIMATION_TYPES.YOYO,
                    playbackTime: 600,
                },
            ],
        },
    ],
    effects: [
        {
            name: "Weighted Shell",
            icon: redSnailShellImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            duration: 5,
            preventArmorDecay: true,
            canBeSilenced: true,
            description: "Prevents armor decay. While this character has armor, its damage is increased.",
            attackPower: 1,
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

export const orangeMushroom: Minion = {
    name: "Orange Mushroom",
    maxHP: 50,
    image: orangeMushroomImage,
    damage: 5,
    effects: [hardy],
};

export const noobA: Minion = {
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

export const noobB: Minion = {
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

export const thiefAssassin: Minion = {
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

export const octopus: Minion = {
    name: "Octopus",
    image: octopusImage,
    maxHP: 7,
    damage: 1,
};

export const wildBoar: Minion = {
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

export const stump: Minion = {
    name: "Stump",
    image: stumpImage,
    maxHP: 10,
    armor: 5,
    damage: 1,
    effects: [hardy],
};

export const axeStump: Minion = {
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

export const fireBoar: Minion = {
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

export const ligator: Minion = {
    name: "Ligator",
    image: ligatorImage,
    maxHP: 20,
    damage: 2,
};

export const eliteLigator: Minion = {
    name: "Ligator",
    image: ligatorImage,
    maxHP: 35,
    damage: 2,
    effects: [elite, raging],
};

export const greenMushroom: Minion = {
    name: "Green Mushroom",
    image: greenmushroomImage,
    maxHP: 25,
    damage: 1,
};

export const hornyMushroom: Minion = {
    name: "Horny Mushroom",
    image: hornymushroomImage,
    maxHP: 30,
    damage: 2,
    effects: [thorns],
};

export const mutantSnailEnemy: Minion = {
    name: "Mutant Snail",
    image: mutantSnailImage,
    isBoss: true,
    maxHP: 100,
    armor: 75,
    resources: 0,
    damage: 5,
    effects: [
        {
            name: "Tough Shell",
            icon: blueSnailShellImage,
            preventArmorDecay: true,
            canBeSilenced: true,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            description: "Prevents armor decay.",
            duration: 5,
        },
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
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [snail] }, { minion: [snail] }],
                },
            ],
        },
        {
            name: "Call Snail",
            image: bluesnailImage,
            minion: blueSnail,
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
                            attackPower: 1,
                        },
                    ],
                },
            ],
        },
        {
            name: "Frenzied Tantrum",
            description: "{{ caster }} will tantrum, dealing 3 hits per move.",
            resourceCost: 3,
            channelDuration: 2,
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
                            attackPower: 1,
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

export const manoEnemy: Minion = {
    name: "Mano",
    image: manoImage,
    isBoss: true,
    maxHP: 75,
    armor: 100,
    resources: 0,
    damage: 3,
    abilities: [
        {
            name: "Call Snail",
            image: snailImage,
            actions: [
                {
                    // HACK: this is just for animation playback
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [snail] }, { minion: [snail] }],
                },
            ],
        },
        {
            name: "Call Snail",
            image: bluesnailImage,
            minion: blueSnail,
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
            channelDuration: 2,
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
                    animation: ANIMATION_TYPES.YOYO,
                    playbackTime: 600,
                    damage: 7,
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
            attackPower: 1,
            skillBonus: [
                {
                    skill: "Rollout",
                    damage: 3,
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

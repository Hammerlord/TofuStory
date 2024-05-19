import { DarkSightImage, DoubleStabImage, StealImage, ThiefImage } from "../images";
import { stealth } from "./../ability/Effects";
import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "./../ability/types";
import { attack } from "./abilities";

const thiefAttack = {
    ...attack,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 5,
        },
    ],
};

const thiefDoubleStab = {
    name: "Double Stab",
    image: DoubleStabImage,
    actions: [
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 4,
        },
        {
            type: ACTION_TYPES.ATTACK,
            target: TARGET_TYPES.HOSTILE,
            damage: 4,
        },
    ],
};

const thiefDarkSight = {
    name: "Dark Sight",
    image: DarkSightImage,
    resourceCost: 3,
    dialog: "So long, and thanks for all the mesos!",
    actions: [
        {
            type: ACTION_TYPES.EFFECT,
            target: TARGET_TYPES.SELF,
            playbackTime: 2000,
            effects: [
                {
                    ...stealth,
                    description: "Untargetable by single-target abilities. When this effect ends, the character will retreat.",
                    preventTurnAction: true,
                    duration: 3,
                    onEnd: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        ability: {
                            name: "Retreat",
                            dialog: "Ciao!",
                            actions: [
                                {
                                    type: ACTION_TYPES.EFFECT,
                                    target: TARGET_TYPES.SELF,
                                    retreat: true,
                                },
                            ],
                        },
                    },
                    onRemoved: {
                        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                        ability: {
                            name: "",
                            dialog: "Dammit! My escape path!",
                            actions: [
                                {
                                    type: ACTION_TYPES.NONE,
                                    target: TARGET_TYPES.SELF,
                                },
                            ],
                        },
                    },
                },
            ],
        },
    ],
};

export const mesoThief: Minion = {
    name: "ImaTheif",
    maxHP: 100,
    image: ThiefImage,
    resources: 0,
    mesos: 25,
    abilities: [thiefAttack, thiefDoubleStab, thiefDarkSight],
    effects: [
        {
            name: "Thief",
            description: "Steals mesos with each attack.",
            icon: StealImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            mesoSteal: 10,
        },
    ],
};

export const duoThiefA = {
    ...mesoThief,
    name: "ImaRouge",
    maxHP: 125,
    mesos: 30,
    abilities: [thiefAttack, thiefDoubleStab, { ...thiefDarkSight, dialog: "Lol, try and hit this!" }],
};

export const duoThiefB = {
    ...mesoThief,
    name: "ImaStabu",
    maxHP: 125,
    mesos: 30,
    abilities: [thiefDoubleStab, thiefAttack, { ...thiefDarkSight, dialog: "Let's go, Sis!" }],
};

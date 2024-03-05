import {
    ACTION_TYPES,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MORPH_MINION_MODIFIERS,
    MORPH_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../../ability/types";
import { BATTLE_TYPES } from "../../battle/types";
import { basicDummy } from "../../enemy/dummy";
import { Puppetree2Image, PuppetreeImage } from "../../images";
import { EventScene } from "../types";

export const balsaDummy: Minion = {
    name: "Balsa Dummy",
    image: PuppetreeImage,
    mesos: 1,
    maxHP: 3,
    abilities: [],
    effects: [
        {
            name: "Spawn dummy!",
            class: EFFECT_CLASSES.NONE,
            type: EFFECT_TYPES.NONE,
            onDeath: {
                target: TARGET_TYPES.SELF,
                ability: {
                    image: basicDummy.image,
                    name: "Reinforcement!",
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            resurrect: true,
                            morph: {
                                type: MORPH_TYPES.MERGE,
                                resurrect: true,
                                minions: [
                                    {
                                        minion: "Maple Dummy",
                                    },
                                ],
                                modifiers: {
                                    maxHP: MORPH_MINION_MODIFIERS.MULTIPLY,
                                },
                            },
                            playbackTime: 250,
                        },
                    ],
                },
            },
        },
    ],
};

export const mapleDummy: Minion = {
    image: Puppetree2Image,
    name: "Maple Dummy",
    mesos: 1,
    maxHP: 3,
    abilities: [],
    effects: [
        {
            name: "Spawn dummy!",
            class: EFFECT_CLASSES.NONE,
            type: EFFECT_TYPES.NONE,
            onDeath: {
                target: TARGET_TYPES.SELF,
                ability: {
                    image: basicDummy.image,
                    name: "Reinforcement!",
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            resurrect: true,
                            morph: {
                                type: MORPH_TYPES.MERGE,
                                resurrect: true,
                                minions: [
                                    {
                                        minion: "Balsa Dummy",
                                    },
                                ],
                                modifiers: {
                                    maxHP: MORPH_MINION_MODIFIERS.MULTIPLY,
                                },
                            },
                            playbackTime: 250,
                        },
                    ],
                },
            },
        },
    ],
};

const dummiesFight = {
    waves: [
        {
            description: [<>Destroy as many dummies as you can in 5 turns!</>],
            enemies: [balsaDummy, balsaDummy, balsaDummy, balsaDummy, balsaDummy],
            winCondition: {
                surviveRounds: 5,
            },
        },
    ],
    disableCardRewards: true,
    type: BATTLE_TYPES.ENCOUNTER,
    backgroundMusic: "https://vgmsite.com/soundtracks/maplestory-music/iajhmyhndt/52.%20Time%20Attack.mp3",
};

export const dummiesScene: EventScene = {
    id: "perion-dummies",
    script: [
        {
            speaker: basicDummy,
            dialog: [
                "[In an open field before you, straw dummies sit in army-like rows. Some are made of flimsy wood, some look more sturdy. This appears to be the warrior training grounds.]",
            ],
        },
        {
            speaker: basicDummy,
            dialog: ["[You feel an inexplicable urge to knock all the dummies down.]"],
            responses: [
                {
                    text: "Fight.",
                    infamy: 3,
                    encounter: dummiesFight,
                },
            ],
        },
        {
            speaker: basicDummy,
            dialog: ["..."],
        },
        {
            speaker: basicDummy,
            dialog: ["..."],
            conditionalNext: [
                {
                    conditions: [
                        {
                            battle: {
                                totalKills: 30,
                            },
                            comparator: "gt",
                        },
                    ],
                    next: [
                        {
                            dialog: [
                                "[You destroyed {{ totalKills }} dummies. Hunks of wood lie strewn everywhere. You find something in the wreckage...]",
                            ],
                        },
                        {
                            dialog: ["..."],
                            itemChoices: {
                                numChoices: 3,
                                bonuses: {
                                    rare: 0.65,
                                    uncommon: 0.25,
                                },
                            },
                        },
                        {
                            dialog: [
                                "[You're starting to gather a crowd of warriors. So far, though, they've done nothing but stare at you in shock.]",
                            ],
                            responses: [
                                {
                                    text: "Leave before you get too much attention.",
                                    isExit: true,
                                },
                            ],
                        },
                    ],
                },
                {
                    conditions: [
                        {
                            battle: {
                                totalKills: 15,
                            },
                            comparator: "gt",
                        },
                    ],
                    next: [
                        {
                            dialog: ["[You destroyed {{ totalKills }} dummies. Not bad! You find something in the wreckage...]"],
                        },
                        {
                            dialog: ["[You destroyed {{ totalKills }} dummies. Not bad! You find something in the wreckage...]"],
                            itemChoices: {
                                numChoices: 3,
                                bonuses: {
                                    rare: 0.1,
                                    uncommon: 0.2,
                                },
                            },
                        },
                        {
                            dialog: ["..."],
                            responses: [
                                {
                                    text: "Leave.",
                                    isExit: true,
                                },
                            ],
                        },
                    ],
                },
                {
                    conditions: [
                        {
                            battle: {
                                totalKills: 5,
                            },
                            comparator: "gt",
                        },
                    ],
                    next: [
                        {
                            dialog: ["[You destroyed {{ totalKills }} dummies. There's something left behind in the wreckage...]"],
                        },
                        {
                            dialog: ["[You destroyed {{ totalKills }} dummies. There's something left behind in the wreckage...]"],
                            itemChoices: {
                                numChoices: 3,
                            },
                        },
                        {
                            dialog: ["..."],
                            responses: [
                                {
                                    text: "Leave.",
                                    isExit: true,
                                },
                            ],
                        },
                    ],
                },
                {
                    conditions: [],
                    next: [
                        {
                            dialog: ["[You destroyed {{ totalKills }} dummies.]"],
                        },
                        {
                            dialog: ["..."],
                            responses: [
                                {
                                    text: "Leave.",
                                    isExit: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

import { EFFECT_CLASSES, EFFECT_TYPES, Minion, TRIGGER_TARGET_TYPES } from "../../ability/types";
import { Wave } from "../../battle/types";
import { GachaponImage, MesoImage } from "../../images";
import { EventScene } from "../types";
import GachaponScene from "./GachaponScene";

const gachaponMachine: Minion = {
    name: "Gachapon Machine",
    image: GachaponImage,
    maxHP: 300,
    abilities: [],
    effects: [
        {
            name: "Loose Change",
            icon: MesoImage,
            description: "Gives you 1 meso each time you hit it.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onReceiveDamage: {
                mesos: 1,
                targetType: TRIGGER_TARGET_TYPES.ACTOR,
            },
        },
    ],
};

const gachaponFight: { characters: string[]; disableCardRewards: boolean; waves: Wave[] } = {
    characters: [gachaponMachine.name],
    disableCardRewards: true,
    waves: [
        {
            enemies: [null, null, gachaponMachine, null, null],
            description: [<>Hit the Gachapon machine as much as you can in 5 turns!</>],
            winCondition: {
                surviveRounds: 5,
            },
        },
    ],
};

export const gachaponEvents: EventScene = {
    id: "gachapon",
    script: [
        {
            scene: GachaponScene,
            dialog: ["[There is some kind of prize-dispensing machine here...]"],
        },
        {
            dialog: ["[It accepts something called Gachapon Tickets, but you don't have any.]"],
            responses: [
                {
                    text: "Hit the gachapon machine.",
                    infamy: 1,
                    encounter: gachaponFight,
                    next: [
                        {
                            dialog: ["...!"],
                        },
                        {
                            dialog: ["...!"], // This dialog is not displayed when there is conditionalNext
                            conditionalNext: [
                                {
                                    conditions: [
                                        {
                                            battleTotalDamage: 200,
                                            comparator: "gt",
                                        },
                                    ],
                                    next: [
                                        {
                                            speaker: gachaponMachine,
                                            dialog: [
                                                "The machine makes a clanking sound and belches out some smoke. The screen lights up with a prompt...",
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
                                            speaker: gachaponMachine,
                                            dialog: ["The gachapon machine appears to be totally broken."],
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
                                            battleTotalDamage: 100,
                                            comparator: "gt",
                                        },
                                    ],
                                    next: [
                                        {
                                            speaker: gachaponMachine,
                                            dialog: [
                                                "The machine makes a bunch of clunking sounds, as if something got lodged. The screen lights up with a prompt...",
                                            ],
                                        },
                                        {
                                            dialog: ["..."],
                                            itemChoices: {
                                                numChoices: 3,
                                                bonuses: {
                                                    rare: 0.1,
                                                    uncommon: 0.2,
                                                },
                                            },
                                        },
                                        {
                                            speaker: gachaponMachine,
                                            dialog: ["The gachapon machine appears to be malfunctioning..."],
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
                                            battleTotalDamage: 49,
                                            comparator: "gt",
                                        },
                                    ],
                                    next: [
                                        {
                                            speaker: gachaponMachine,
                                            dialog: [
                                                "The machine makes a clunking sound, then stops, as if something got lodged. The screen lights up with a prompt...",
                                            ],
                                        },
                                        {
                                            dialog: ["..."],
                                            itemChoices: {
                                                numChoices: 3,
                                            },
                                        },
                                        {
                                            speaker: gachaponMachine,
                                            dialog: ["The gachapon machine appears to be malfunctioning..."],
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
                                            speaker: gachaponMachine,
                                            dialog: ["Nothing happens. The machine stands unaffected by your assault."],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

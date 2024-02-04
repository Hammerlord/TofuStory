import { Minion } from "../../ability/types";
import { Wave } from "../../battle/types";
import { GachaponImage } from "../../images";
import { bluePotion, redPotion } from "../../item/items";
import { Scene } from "../types";
import GachaponScene from "./GachaponScene";

const gachaponMachine: Minion = {
    name: "Gachapon Machine",
    image: GachaponImage,
    maxHP: 3,
    abilities: [],
};

const gachaponFight: { characters: string[]; disableCardRewards: boolean; waves: Wave[] } = {
    characters: [gachaponMachine.name],
    disableCardRewards: true,
    waves: [
        {
            enemies: [null, null, gachaponMachine, null, null],
        },
    ],
};

export const gachaponEvents: Scene = {
    characters: [],
    script: [
        {
            scene: () => <GachaponScene />,
            dialog: ["[There is some kind of prize-dispensing machine here...]"],
        },
        {
            dialog: ["[It accepts something called Gachapon Tickets, but you don't have any.]"],
            responses: [
                {
                    text: "Hit the gachapon machine.",
                    encounter: gachaponFight,
                    next: [
                        {
                            speaker: gachaponMachine,
                            dialog: ["The machine makes a clunking sound.", "It dispensed something!"],
                            items: [redPotion],
                        },
                        {
                            dialog: ["..."],
                            responses: [
                                {
                                    text: "Hit the gachapon machine again.",
                                    encounter: gachaponFight,
                                    next: [
                                        {
                                            speaker: gachaponMachine,
                                            dialog: ["The machine makes a clunking sound.", "It dispensed something!"],
                                            items: [bluePotion],
                                        },
                                        {
                                            dialog: ["..."],
                                            responses: [
                                                {
                                                    text: "Hit the gachapon machine again.",
                                                    encounter: gachaponFight,
                                                    next: [
                                                        {
                                                            speaker: gachaponMachine,
                                                            dialog: [
                                                                "The machine makes a clanking sound, like something got lodged. It lights up with a prompt...",
                                                            ],
                                                        },
                                                        {
                                                            dialog: ["..."],
                                                            itemChoices: {
                                                                numChoices: 3,
                                                            } as any, // For some reason, items optional param not working
                                                        },
                                                        {
                                                            speaker: gachaponMachine,
                                                            dialog: ["The gachapon machine now appears to be malfunctioning..."],
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
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

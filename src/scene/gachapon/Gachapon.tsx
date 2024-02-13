import { Minion } from "../../ability/types";
import { Wave } from "../../battle/types";
import { GachaponImage } from "../../images";
import { bluePotion, redPotion } from "../../item/items";
import { Scene } from "../types";
import GachaponScene from "./GachaponScene";

const gachaponMachine: Minion = {
    name: "Gachapon Machine",
    image: GachaponImage,
    maxHP: 999,
    abilities: [],
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
                            dialog: ["The machine makes a clanking sound, like something got lodged. It lights up with a prompt..."],
                        },
                        {
                            dialog: ["..."],
                            itemChoices: {
                                numChoices: 3,
                            },
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
};

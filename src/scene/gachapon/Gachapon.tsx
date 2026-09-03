import {
    ACTION_TYPES,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    MULTIPLIER_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../../ability/types";
import { Wave } from "../../battle/types";
import { GachaponImage, MesoCoinImage, MesoImage } from "../../images";
import { EventScene } from "../types";
import GachaponScene from "./GachaponScene";

const coin: Minion = {
    name: "Meso",
    image: MesoImage,
    maxHP: 1,
    mesos: 2,
};

const goldCoin: Minion = {
    name: "Meso",
    image: MesoCoinImage,
    maxHP: 1,
    mesos: 5,
};

export const gachaponMachine: Minion = {
    name: "Gachapon Machine",
    image: GachaponImage,
    maxHP: 300,
    abilities: [],
    effects: [
        {
            name: "Loose Change",
            icon: MesoImage,
            description: "Chance to drop mesos when you hit it.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onReceiveAttack: {
                usableWhileStunned: true,
                chance: 0.05,
                multiplier: {
                    type: MULTIPLIER_TYPES.DAMAGE,
                    value: 1,
                },
                targetType: TRIGGER_TARGET_TYPES.PLAYER,
                type: ACTION_TYPES.NONE,
                ability: {
                    name: "Loose Change",
                    image: MesoCoinImage,
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            summon: [
                                {
                                    minion: [coin, goldCoin],
                                    tributePossible: true,
                                },
                                {
                                    minion: [coin, goldCoin],
                                    tributePossible: true,
                                },
                            ],
                        },
                    ],
                },
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
            notifications: [
                {
                    round: 5,
                    text: "Last turn!",
                },
            ],
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
                                            battle: {
                                                damageToEnemy: {
                                                    amount: 200,
                                                    enemyName: gachaponMachine.name,
                                                },
                                            },
                                            comparator: "gt",
                                        },
                                    ],
                                    next: [
                                        {
                                            speaker: gachaponMachine,
                                            dialog: [
                                                "You dealt {{damageByEnemyName.[Gachapon Machine]}} damage to the gachapon machine. It makes a clanking sound and belches out some smoke. The screen lights up with a prompt...",
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
                                            battle: {
                                                damageToEnemy: {
                                                    amount: 100,
                                                    enemyName: gachaponMachine.name,
                                                },
                                            },
                                            comparator: "gt",
                                        },
                                    ],
                                    next: [
                                        {
                                            speaker: gachaponMachine,
                                            dialog: [
                                                "You dealt {{ totalDamage }} damage to the gachapon machine. It makes a bunch of clunking sounds, as if something got lodged. The screen lights up with a prompt...",
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
                                            battle: {
                                                damageToEnemy: {
                                                    amount: 49,
                                                    enemyName: gachaponMachine.name,
                                                },
                                            },
                                            comparator: "gt",
                                        },
                                    ],
                                    next: [
                                        {
                                            speaker: gachaponMachine,
                                            dialog: [
                                                "You dealt {{ totalDamage }} damage to the gachapon machine. The machine makes a clunking sound, then stops, as if something got lodged. The screen lights up with a prompt...",
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
                                            dialog: [
                                                "You dealt {{ totalDamage }} damage to the gachapon machine.",
                                                "...Nothing happens. The machine stands unaffected by your assault.",
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

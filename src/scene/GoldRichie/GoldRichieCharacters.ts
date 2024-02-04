import { ACTION_TYPES, Effect, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../../ability/types";
import { rally } from "../../enemy/abilities";
import { GoldRichieImage, GuardWarriorImage, GuardWizardImage, MesoCoinImage, MesoImage, WeaponMasteryImage } from "../../images";

const mesoCoin: Minion = {
    name: "Meso",
    image: MesoImage,
    maxHP: 1,
    mesos: 1,
};

const goldMesoCoin: Minion = {
    name: "Meso",
    image: MesoCoinImage,
    maxHP: 1,
    mesos: 3,
};

const richyRich: Effect = {
    name: "Richy",
    description: "Drops mesos when attacked.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: MesoCoinImage,
    canBeSilenced: false,
    onReceiveAttack: {
        removeEffect: true,
        ability: {
            name: "Drop mesos",
            dialog: "No! My money!",
            image: MesoCoinImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    summon: [
                        {
                            minion: [mesoCoin, mesoCoin, goldMesoCoin],
                        },
                        {
                            minion: [mesoCoin, mesoCoin, goldMesoCoin],
                        },
                        {
                            minion: [mesoCoin, mesoCoin, goldMesoCoin],
                        },
                        {
                            minion: [mesoCoin, mesoCoin, goldMesoCoin],
                        },
                    ],
                    playbackTime: 2000,
                },
            ],
        },
    },
};

export const goldRichie: Minion = {
    name: "Gold Richie",
    image: GoldRichieImage,
    maxHP: 15,
    mesos: 100,
    abilities: [
        {
            name: "Curl Up in Fetal Position",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 3,
                },
            ],
        },
    ],
    effects: [richyRich],
};

export const goldRichie2: Minion = {
    name: "Gold Richie",
    image: GoldRichieImage,
    maxHP: 15,
    armor: 15,
    mesos: 100,
    abilities: [
        {
            name: "Curl Up in Fetal Position",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 2,
                },
            ],
        },
        {
            name: "Bolster",
            dialog: "Whoever defeats that mushroom gets a hefty bonus!",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    excludePrimaryTarget: true,
                    area: 3,
                    effects: [
                        {
                            icon: WeaponMasteryImage,
                            name: "Bolster",
                            attackPower: 1,
                            duration: 3,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.BUFF,
                        },
                    ],
                    playbackTime: 2000,
                },
            ],
        },
    ],
    effects: [richyRich],
};

export const adventurerFighter = {
    name: "Fighter",
    image: GuardWarriorImage,
    maxHP: 75,
    damage: 2,
    abilities: [rally],
};

export const adventurerIceWizard = {
    name: "Ice-Lightning Wizard",
    image: GuardWizardImage,
    maxHP: 60,
    damage: 3,
};

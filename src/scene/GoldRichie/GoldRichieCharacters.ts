import { bash, cleave } from "./../../ability/warrior/warriorAbilities";
import { lesserBolt, magicFang, magicClaw } from "./../../ability/magician/magicianAbilities";
import { attack } from "./../../enemy/abilities";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Effect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../../ability/types";
import { rally } from "../../enemy/abilities";
import {
    EnergyBoltProjectileImage,
    FrownyMaskImage,
    GoldRichieImage,
    GuardWarriorImage,
    GuardWizardImage,
    MesoCoinImage,
    MesoImage,
    OldEnergyBoltImage,
    WeaponMasteryImage,
} from "../../images";

const coin: Minion = {
    name: "Meso",
    image: MesoImage,
    maxHP: 1,
    mesos: 1,
};

const goldCoin: Minion = {
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
                            minion: [coin, coin, goldCoin],
                        },
                        {
                            minion: [coin, coin, goldCoin],
                        },
                        {
                            minion: [coin, coin, goldCoin],
                        },
                        {
                            minion: [coin, coin, goldCoin],
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
            image: FrownyMaskImage,
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
            image: FrownyMaskImage,
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
    abilities: [{ ...bash }, { ...cleave, resourceCost: 3 }, rally],
};

export const adventurerIceWizard = {
    name: "Ice-Lightning Wizard",
    image: GuardWizardImage,
    maxHP: 60,
    abilities: [
        {
            name: "Lesser Bolt",
            image: OldEnergyBoltImage,
            actions: [
                {
                    damage: 2,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.RANGE_ATTACK,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    icon: EnergyBoltProjectileImage,
                    animationOptions: {
                        rotate: 135,
                        rotateToFaceTarget: true,
                    },
                },
            ],
        },
        { ...magicFang, resourceCost: 3 },
        { ...magicClaw, resourceCost: 3, actions: magicClaw.actions.map((action) => ({ ...action, damage: 3 })) },
    ],
};

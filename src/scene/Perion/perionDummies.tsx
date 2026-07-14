import classNames from "classnames";
import { useMemo } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, MORPH_MINION_MODIFIERS, MORPH_TYPES, Minion, TARGET_TYPES } from "../../ability/types";
import { BATTLE_TYPES } from "../../battle/types";
import { Player } from "../../character/types";
import { basicDummy } from "../../enemy/dummy";
import { PerionGroundsImage, Puppetree2Image, PuppetreeImage } from "../../images";
import { shuffle } from "../../utils";
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
                usableWhileStunned: true,
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
                usableWhileStunned: true,
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
    backgroundMusic: "https://maplestory.io/api/GMS/93T/music/Bgm09/TimeAttack",
};

const useStyles = createUseStyles({
    root: {
        position: "relative",
        width: "100%",
        height: "100%",
    },
    backdrop: {
        width: "100%",
        height: "100%",
    },
    character: {
        position: "absolute",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        top: 297,
        left: 220,
        height: "65px",
    },
    broken: {
        transform: "rotate(90deg)",
    },
});

const DummiesBackdrop = ({ player, dummiesBroken }: { player: Player; dummiesBroken?: number }) => {
    const classes = useStyles();
    const totalDummies = 6;
    const brokenDummyIndices = useMemo(
        () => shuffle(Array.from({ length: totalDummies }).map((_, i) => i)).slice(0, dummiesBroken || 0),
        [dummiesBroken]
    );

    const isBroken = (i) => {
        return brokenDummyIndices.some((index) => index === i);
    };
    return (
        <div className={classes.root}>
            <img src={PerionGroundsImage} alt="Training Grounds" className={classes.backdrop} />
            <img src={player.image} alt="Player" className={classNames(classes.character, classes.player)} />
            {Array.from({ length: totalDummies }).map((_, i) => (
                <img
                    src={i % 2 === 0 ? PuppetreeImage : Puppetree2Image}
                    alt="Dummy"
                    className={classNames(classes.character, {
                        [classes.broken]: isBroken(i),
                    })}
                    key={i}
                    style={{
                        top: isBroken(i) ? 298 : 278,
                        left: 400 + i * 50,
                    }}
                />
            ))}
        </div>
    );
};

export const dummiesScene: EventScene = {
    id: "perion-dummies",
    script: [
        {
            speaker: basicDummy,
            scene: DummiesBackdrop,
            dialog: [
                "[In an open field, you encounter rows and rows of straw dummies. Some of the dummies are made of flimsy wood, some look more sturdy.]",
            ],
        },
        {
            speaker: basicDummy,
            dialog: ["[You feel an inexplicable urge to knock all the dummies down.]"],
            responses: [
                {
                    text: "Attack the dummies.",
                    infamy: 3,
                    encounter: dummiesFight,
                },
                {
                    text: "Resist the urge.",
                    isExit: true,
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
                            scene: (other) => <DummiesBackdrop dummiesBroken={6} {...other} />,
                            dialog: [
                                "[You destroyed {{ totalKills }} dummies. Hunks of wood lie strewn everywhere. You find something in the wreckage...]",
                            ],
                            infamy: 2,
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
                            scene: (other) => <DummiesBackdrop dummiesBroken={4} {...other} />,
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
                            scene: (other) => <DummiesBackdrop dummiesBroken={2} {...other} />,
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

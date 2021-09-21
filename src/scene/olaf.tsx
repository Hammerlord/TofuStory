import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { olaf } from "../enemy/enemy";
import { lithHarborBalconyFull, olafImage, puppetree } from "../images";
import { Wave } from "../Menu/tutorial";
import { Scene } from "./types";

const olafNPC = {
    name: "Olaf",
    image: olafImage,
};

const useStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${lithHarborBalconyFull}) no-repeat`,
        width: "896px",
        height: "520px",
    },
    character: {
        position: "absolute",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        left: "250px",
        top: "314px",
        height: "65px",
    },
    olaf: {
        left: "600px",
        top: "294px",
    },
    puppetree1: {
        left: "500px",
        top: "316px",
        transform: "rotate(-90deg)",
    },
    puppetree2: {
        left: "700px",
        top: "320px",
        transform: "rotate(90deg)",
    },
    puppetree3: {
        left: "470px",
        top: "316px",
        transform: "rotate(90deg)",
    },
});

const Olaf = ({ player }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={puppetree} className={classNames(classes.puppetree1, classes.character)} />
            <img src={olafImage} className={classNames(classes.olaf, classes.character)} />
            <img src={puppetree} className={classNames(classes.puppetree2, classes.character)} />
            <img src={puppetree} className={classNames(classes.puppetree3, classes.character)} />
        </div>
    );
};

const olafFight: { characters: string[]; waves: Wave[] } = {
    characters: [olafNPC.name],
    waves: [
        {
            enemies: [null, null, olaf, null, null],
            description:
                "You've encountered an elite opponent. Elites typically have increased health, damage, and a few special abilities up their sleeve.",
        },
    ],
};

const postFight = [
    {
        speaker: olafNPC,
        dialog: ["Oof! You're tough for your size, I'll give you that..."],
    },
    {
        speaker: olafNPC,
        dialog: ["[Olaf looks dizzy.]", "(You feel like you should leave before you cause a scene...)"],
        responses: [{ text: "", isExit: true }],
    },
];

export const lithEventsOlaf: Scene = {
    scene: Olaf,
    characters: [olafNPC.name],
    script: [
        {
            speaker: olafNPC,
            dialog: ["Wha? Who destroyed all the training dummies!?", "They were supposed to last for the next batch of islanders!"],
        },
        {
            speaker: olafNPC,
            dialog: [
                "[Grumbles.] Bet it's some show-off adventurer fresh outta their first job advancement.",
                "I swear, if I catch 'em...",
            ],
        },
        {
            speaker: olafNPC,
            dialog: ["[Olaf notices you.]", "Huh. A mushroom, all the way out here?"],
        },
        {
            speaker: olafNPC,
            dialog: [
                "Don't tell me a little creature like you's the culprit...",
                "[Olaf pauses and laughs to himself.] Oh, who am I kidding. Monsters don't train on training dummies. And I don't have time for this.",
            ],
        },
        {
            speaker: olafNPC,
            dialog: [
                "Shoo! Get out of here!",
                "[Olaf flexes his bicep.] You see these muscles? I got them from beating monsters ten times your size.",
            ],
            responses: [
                {
                    text: "Explain to Olaf that you are a {{ class }} who needs help.",
                    next: [
                        {
                            speaker: olafNPC,
                            dialog: [
                                "By Odin's hammer, mushrooms are stupid! I said shoo, not come closer.",
                                "What's that incoherent squealing coming out of your mouth?",
                            ],
                        },
                        {
                            speaker: olafNPC,
                            dialog: [
                                "Well, I hate to pick on naive creatures who've taken the wrong turn, but I should take care of this before the next batch of greenhorns come around...",
                            ],
                            responses: [
                                { text: "Fight!", encounter: olafFight, notoriety: 1, next: postFight },
                                { text: "Leave before you attract any more attention.", isExit: true },
                            ],
                        },
                    ],
                },
                {
                    text: "You wanna fight?",
                    next: [
                        {
                            speaker: olafNPC,
                            dialog: [
                                "Ha ha! What's with the tough act, little creature?",
                                "Just warning you, I'm not one of those newbie adventurers you can pick on.",
                            ],
                            responses: [
                                { text: "Fight!", encounter: olafFight, notoriety: 1, next: postFight },
                                { text: "Leave before you attract any more attention.", isExit: true },
                            ],
                        },
                    ],
                },
                {
                    text: "Leave before you attract any more attention.",
                    isExit: true,
                },
            ],
        },
    ],
};

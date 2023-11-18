import { createUseStyles } from "react-jss";
import { BlueMushroomForestImage, DueyImage } from "../../images";
import classNames from "classnames";
import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, Effect, Minion, TARGET_TYPES } from "../../ability/types";
import { BATTLE_TYPES } from "../../battle/types";
import { blueSnail, redSnail, shroom } from "../../enemy/enemy";
import { NPC, Scene } from "../types";
import { unsignedLetter } from "../../item/items";

const dueyEffect: Effect = {
    name: "Package",
    description: "Holding a package.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    canBeSilenced: false,
    onReceiveAttack: {
        removeEffect: true,
        ability: {
            name: "",
            dialog: "Yikes!",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    playbackTime: 2000,
                },
            ],
        },
    },
};

export const duey: Minion = {
    name: "Duey",
    image: DueyImage,
    maxHP: 15,
    damage: 0,
    mesos: 0,
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
    effects: [dueyEffect],
};

const introUseStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${BlueMushroomForestImage}) no-repeat`,
        width: "1000px",
        height: "750px",
    },
    character: {
        position: "absolute",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        top: "392px",
        left: "700px",
        height: "65px",
    },
    duey: {
        left: "250px",
        top: "440px",
        transform: "scale(-1, 1)",
    },
    shroom1: {
        left: "200px",
        top: "476px",
        transform: "scale(-1, 1)",
    },
    shroom2: {
        left: "400px",
        top: "476px",
    },
    shroom3: {
        left: "450px",
        top: "476px",
    },
    redSnail: {
        left: "350px",
        top: "478px",
    },
    blueSnail: {
        left: "170px",
        top: "478px",
        transform: "scale(-1, 1)",
    },
});

const progressedUseStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${BlueMushroomForestImage}) no-repeat`,
        width: "1000px",
        height: "750px",
    },
    character: {
        position: "absolute",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        top: "452px",
        left: "500px",
        height: "65px",
    },
    duey: {
        left: "250px",
        top: "440px",
        transform: "scale(-1, 1)",
    },
});

const DueyIntroScene = ({ player }) => {
    const classes = introUseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={duey.image} className={classNames(classes.duey, classes.character)} />
            <img src={shroom.image} className={classNames(classes.shroom1, classes.character)} />
            <img src={shroom.image} className={classNames(classes.shroom2, classes.character)} />
            <img src={shroom.image} className={classNames(classes.shroom3, classes.character)} />
            <img src={blueSnail.image} className={classNames(classes.blueSnail, classes.character)} />
            <img src={redSnail.image} className={classNames(classes.redSnail, classes.character)} />
        </div>
    );
};

const DueyHelpedScene = ({ player }) => {
    const classes = progressedUseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={duey.image} className={classNames(classes.duey, classes.character)} />
        </div>
    );
};

const DueyMuggedScene = ({ player }) => {
    const classes = progressedUseStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
        </div>
    );
};

const dueyFightShroom = {
    ...shroom,
    effects: [
        {
            name: "Shroom Dialog",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: false,
            onWaveStart: {
                removeEffect: true,
                ability: {
                    name: "",
                    dialog: "Hey, you KSer! You'll pay for that!",
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            playbackTime: 2000,
                        },
                    ],
                },
            },
        },
    ],
};

const dueyFightShroom2 = {
    ...shroom,
    effects: [
        {
            name: "Shroom Dialog",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: false,
            onWaveStart: {
                removeEffect: true,
                ability: {
                    name: "",
                    dialog: "Get 'em, boys!",
                    actions: [
                        {
                            type: ACTION_TYPES.EFFECT,
                            target: TARGET_TYPES.SELF,
                            playbackTime: 2000,
                        },
                    ],
                },
            },
        },
    ],
};

const dueyFight = {
    characters: [],
    waves: [
        {
            enemies: [null, null, duey, null, null],
        },
        {
            enemies: [shroom, redSnail, dueyFightShroom, blueSnail, shroom],
        },
    ],
    type: BATTLE_TYPES.ENCOUNTER,
};

const mobFight = {
    characters: [],
    waves: [
        {
            enemies: [shroom, redSnail, dueyFightShroom2, blueSnail, shroom],
        },
    ],
    type: BATTLE_TYPES.ENCOUNTER,
};

export const randomEventDuey: Scene = {
    characters: [],
    script: [
        {
            scene: DueyIntroScene,
            speaker: duey,
            dialog: ["Uh oh...", "Nice monsters?"],
        },
        {
            speaker: shroom,
            dialog: ["Come on already, guys! Easy pickings, get'em!", "I call dibs on the box BTW."],
        },
        {
            dialog: ["[The monsters approach Duey.]"],
        },
        {
            speaker: duey,
            dialog: ["Yikes! Help, someone!"],
            responses: [
                {
                    text: "Defend Duey from the monsters.",
                    next: [
                        {
                            speaker: shroom,
                            dialog: ["Hey, mushroom face! Buzz off!"],
                        },
                        {
                            speaker: shroom,
                            dialog: ["We might look like noob monsters, but there's five of us and we'll beat you up!"],
                            responses: [{ text: "Prepare for an attack.", encounter: mobFight }],
                        },
                        {
                            scene: DueyHelpedScene,
                            speaker: duey,
                            dialog: ["Phew! Thanks! You really saved my hide there."],
                        },
                        {
                            speaker: duey,
                            dialog: [
                                "The name's Duey. I deliver packages all over Victoria Island.",
                                "I have to say, it's gotten pretty dangerous lately. I mean, monsters were always kind of nasty before, but they didn't usually gang up on you like that. Not shrooms and snails, anyway.",
                            ],
                        },
                        {
                            speaker: duey,
                            dialog: [
                                "Speaking of which... That one shroom was looking at me with these awful, beady eyes. Gave me the chills.",
                                "Weird, right? It was just a shroom. Maybe it thought I had food in this box. Or maybe I was imagining things.",
                            ],
                        },
                        {
                            speaker: duey,
                            dialog: [
                                "Well, I'm sad to say I don't have anything I can give you for helping me back there.",
                                "Oh, I know you adventurer types, haha!",
                                "But perhaps I can help you deliver something. Got anything you want to send to someone? Postage is free this time, of course.",
                            ],
                            responses: [
                                {
                                    text: "I've got something here...",
                                    removeAbility: true,
                                    next: [
                                        {
                                            speaker: duey,
                                            dialog: [
                                                "Hmm, this is... a trading card? Doesn't look like a monster card. Is it a new game they came out with?",
                                            ],
                                            responses: [{ text: "Uh, yeah... something like that." }],
                                        },
                                        {
                                            speaker: duey,
                                            dialog: [
                                                "[Duey doesn't seem to understand you.]",
                                                "Uh, sorry, not trying to be a bother, haha! Alright, who'll this be addressed to?",
                                            ],
                                            responses: [
                                                {
                                                    text: "Write down 'Maple Administrator'.",
                                                    next: [
                                                        {
                                                            speaker: duey,
                                                            dialog: [
                                                                "The Maple Administrator is hard to track down these days, but I'll see what I can do!",
                                                                "Alright then. I'll catch you around, hopefully! Thanks again!",
                                                            ],
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
                                                    text: "Write down 'my job instructor'.",
                                                    next: [
                                                        {
                                                            speaker: duey,
                                                            dialog: [
                                                                "Got it. The {{ class }} instructor it is. I'm sure he'll appreciate hearing from you!",
                                                                "Alright then. I'll catch you around, hopefully! Thanks again!",
                                                            ],
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
                                                    text: "Write down 'Mushmom'.",
                                                    next: [
                                                        {
                                                            speaker: duey,
                                                            dialog: [
                                                                "Mushmom!? It's because you're dressed as a mushroom, right? Hahah! Good one.",
                                                                "Might be a little dangerous for me! Well, I'll see if one of her little critters picks it up and takes it to her.",
                                                                "Alright then. I'll catch you around, hopefully! Thanks again!",
                                                            ],
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
                                {
                                    text: "No thanks.",
                                    next: [
                                        {
                                            speaker: duey,
                                            dialog: [
                                                "[Duey doesn't seem to have heard you, but he gets the gist of it.]",
                                                "Well, maybe next time, then! Hope we meet again. Under better circumstances, of course.",
                                            ],
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
                {
                    text: "That box looks like it could contain something nice. Mug Duey for it.",
                    notoriety: 5,
                    next: [
                        {
                            speaker: shroom,
                            dialog: ["Hey! Buzz off! He's mine--I mean, ours!"],
                        },
                        {
                            speaker: shroom,
                            dialog: ["We might look like noob monsters, but there's five of us and we'll beat you up!"],
                            responses: [
                                {
                                    text: "Prepare for an attack.",
                                    encounter: dueyFight,
                                    next: [
                                        {
                                            scene: DueyMuggedScene,
                                            dialog: ["Inside Duey's box is...", "Just a letter. It reads:"],
                                        },
                                        {
                                            dialog: [
                                                "Dear friend,",
                                                "As much as I hate to burden you with my troubles, here I sit writing them to you once more.",
                                                "There's something strange happening, not only to the monsters, but also to the people around us. And it seems that it's only worsening. You feel it too, though, don't you?",
                                            ],
                                        },
                                        {
                                            dialog: [
                                                "Old Grendel had the wherewithal to forewarn these troubling times, yet I can't help but shake the feeling there's something off about it all.",
                                                "I'm sorry. It's not that I want to doubt our wise friend--who we've known since we were babes. And of course I know how he is: eccentric to the core. (Don't tell him I said that, please.)",
                                                "His zeal to protect Victoria Island is second to none, and in this I take comfort.",
                                            ],
                                        },
                                        {
                                            dialog: [
                                                "Still, the... intensity of his methods frightens me more than I dare to let on. The incident with the Lupins... no, I'll not repeat it here.",
                                                "I'm aware he believes in its necessity. I would like to believe so, too.",
                                                "Perhaps I've gone on long enough--the night is late here in Henesys, and I've not been sleeping much lately. I only hope my fears are unfounded.",
                                            ],
                                        },
                                        {
                                            dialog: ["May these words find you well.", "[The letter is unsigned.]"],
                                            items: [unsignedLetter],
                                        },
                                        {
                                            dialog: [
                                                "(Hmm... There was mention of something strange going on with the monsters. You can only guess that it's related to your own situation. Maybe you'll find more answers on your journey.)",
                                            ],
                                            responses: [
                                                {
                                                    text: "Time to move on.",
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
};

// WIP: Just following the contract for now, NPC interaction tracking needs to change
export const dueyScenario: NPC = {
    character: duey.name,
    scenes: {
        intro: {
            characters: ["Duey"],
            script: randomEventDuey.script,
        },
        fought: {
            characters: ["Duey"],
            script: [
                {
                    dialog: ["[Work in progress]"],
                    responses: [
                        {
                            text: "Leave.",
                            isExit: true,
                        },
                    ],
                },
            ],
        },
        notorious: {
            characters: ["Duey"],
            script: [
                {
                    dialog: ["[Work in progress]"],
                    responses: [
                        {
                            text: "Leave.",
                            isExit: true,
                        },
                    ],
                },
            ],
        },
        helped: {
            characters: ["Duey"],
            script: [
                {
                    dialog: ["[Work in progress]"],
                    responses: [
                        {
                            text: "Leave.",
                            isExit: true,
                        },
                    ],
                },
            ],
        },
    },
};

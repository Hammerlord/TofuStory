import { Minion } from "./../../ability/types";
import { ACTION_TYPES, TARGET_TYPES } from "../../ability/types";
import { miniBean } from "../../enemy/miniBean";
import { HenesysBGImage, MayaImage, miniBeanImage } from "../../images";
import { Scene } from "../types";
import PantryScene from "./PantryScene";

const miniBeanCharacter = {
    name: "Mini Bean",
    image: miniBeanImage,
};

const mayaCharacter = {
    name: "Maya",
    image: MayaImage,
};

const miniBeanFight = {
    characters: [],
    waves: [
        {
            enemies: [null, null, miniBean, null, null],
        },
    ],
};

const mayaEnemy: Minion = {
    name: "Maya",
    image: MayaImage,
    maxHP: 15,
    armor: 15,
    damage: 0,
    abilities: [
        {
            name: "Cower",
            dialog: "Help!",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 2,
                },
            ],
        },
    ],
};

const mayaFight = {
    characters: [],
    waves: [
        {
            enemies: [null, null, mayaEnemy, null, null],
        },
    ],
};

const pantry: Scene = {
    characters: [],
    script: [
        {
            background: HenesysBGImage,
            scene: PantryScene,
            speaker: mayaCharacter,
            dialog: ["Help! Help! Somebody, there's a monster in my home!"],
        },
        {
            speaker: miniBeanCharacter,
            dialog: ["Gimme all your food!"],
        },
        {
            speaker: mayaCharacter,
            dialog: ["Oh no, not the food I prepared for the festival! Help! Please, somebody!"],
        },
        {
            speaker: miniBeanCharacter,
            dialog: [
                "What's with the melodrama? Look, you're real lucky I don't like NPCs, just good old tasty food.",
                "Buuuut yanno, keep up that screeching and I might change my mind.",
            ],
            responses: [
                {
                    text: "What's going on here?",
                    next: [
                        {
                            speaker: miniBeanCharacter,
                            dialog: ["[Mini Bean notices you and squints.] Hey, you! Mind your own business."],
                        },
                        {
                            speaker: mayaCharacter,
                            dialog: ["[Maya fearfully stares at you.] Wh-who are you? Can you help me?", "O-or are you a monster, too!?"],
                            responses: [
                                {
                                    text: "Tell the creature to stop.",
                                    next: [
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "Stop? Like YOU stopped when you steamrolled all those snails on your way to town. Betcha even picked off an adventurer or two.",
                                            ],
                                        },
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "Oooh yeah, I know what you did to get here. It's obvious. Hehehehahaha!",
                                                "'Cause--you consume, you train, you grow, or you die! That's the story of us seekers! We aren't so different from those pesky adventurers, are we?",
                                            ],
                                        },
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "Yeah, leave behind a few thousand casualties, why not? But scare some poor maiden and now there's a problem!",
                                                "'Stop', huh? You sure sound like some kinda human. Ooohoohoohoo... well, it'd be funny if it wasn't so annoying.",
                                            ],
                                        },
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "I'm not in the business of eating my fellows, either, but hey, if you wanna scrap, have at it!",
                                            ],
                                            responses: [
                                                {
                                                    text: "Fight Mini Bean.",
                                                    encounter: miniBeanFight,
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    text: "Dispute with the creature over the food.",
                                    next: [
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "Hands off, bozo! I got here first. The food's all miiine!",
                                                "Oh, not that you have hands, hahahaha!",
                                            ],
                                        },
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "But yeah, I'm thiiis close to leveling up, so I ain't sharing. What do the kids say? CC PLZZZZzzzzehehe.",
                                            ],
                                        },
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "Don't look so surprised. After all...",
                                                "You consume, you train, you grow, or you die! That's the story of us seekers! We aren't so different from those pesky adventurers, are we?",
                                            ],
                                            responses: [
                                                {
                                                    text: "Wait, what's a seeker?",
                                                    next: [
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: [
                                                                "Ha! To be a newbie again!",
                                                                "Seekers are folks like you and meeeehahaha. It's really not complicated.",
                                                            ],
                                                        },
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: ["Now sod off, noob! I've got food to eat."],
                                                            responses: [
                                                                {
                                                                    text: "Gear up for a fight.",
                                                                    next: [
                                                                        {
                                                                            speaker: miniBeanCharacter,
                                                                            dialog: [
                                                                                "You've got some gall, yanno. I'd almost like it if it wasn't so annoying.",
                                                                            ],
                                                                            responses: [
                                                                                {
                                                                                    text: "Fight Mini Bean.",
                                                                                    encounter: miniBeanFight,
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
                                {
                                    text: "Try to convince Maya that you aren't a monster.",
                                    next: [
                                        {
                                            speaker: mayaCharacter,
                                            dialog: [
                                                "Eeek! There are two monsters in my home! Please, somebody!",
                                                "[Maya doesn't seem to be able to understand you.]",
                                            ],
                                        },
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "It's pointless trying to talk to 'em, stupid! Even if they could hear you, they wouldn't listen!",
                                                "Why not just run 'em over like you do the snails? Should be easy enough.",
                                            ],
                                            responses: [
                                                {
                                                    text: "Insist that you aren't a monster.",
                                                    next: [
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: [
                                                                "Yeah, yeah, yeah. Nobody cares, least of all humans!",
                                                                "Bit of advice: if they call you a monster, then you should act like one. Hehehehahaha! It's done me well.",
                                                            ],
                                                            responses: [
                                                                {
                                                                    text: "Assist Maya and attack Mini Bean",
                                                                    next: [
                                                                        {
                                                                            speaker: miniBeanCharacter,
                                                                            dialog: [
                                                                                "You've got some gall, yanno. I'd almost like it if it wasn't so annoying.",
                                                                            ],
                                                                            responses: [
                                                                                {
                                                                                    text: "Fight Mini Bean.",
                                                                                    encounter: miniBeanFight,
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    text: "Attack Maya",
                                                                    encounter: mayaFight,
                                                                    next: [
                                                                        {
                                                                            speaker: miniBeanCharacter,
                                                                            dialog: ["Wow you sure showed her!"],
                                                                            responses: [
                                                                                {
                                                                                    text: "Fight Mini Bean.",
                                                                                    encounter: miniBeanFight,
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
                },
            ],
        },
    ],
};

export default pantry;
